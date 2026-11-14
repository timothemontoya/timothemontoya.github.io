"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { easing } from "maath";
import { type MotionValue, motion, useMotionValueEvent, useScroll } from "motion/react";
import { Suspense, useRef, useState } from "react";
import * as THREE from "three";
import { heroSlug, models } from "@/content/models";
import { site } from "@/content/site";
import { fitDistance } from "@/lib/fit-distance";
import { useInView } from "@/lib/use-in-view";
import { usePointer } from "@/lib/use-pointer";
import { useReducedMotion } from "@/lib/use-media";
import { LetterRise } from "./effects";
import { HeroHud } from "./hero-hud";
import { Dust } from "./three/dust";
import { Model } from "./three/model";
import { Studio } from "./three/studio";
import { t } from "@/content/textes";

const hero = models.find((m) => m.slug === heroSlug) ?? models[0];

/**
 * Trajectoire du modèle selon l'avancement du scroll (0 → 1) :
 * position x, position y, rotation y. Interpolée entre les étapes.
 */
const path = [
  { at: 0, x: 0.9, y: 0.05, ry: -0.5, s: 1 },
  { at: 0.45, x: 1.45, y: -0.05, ry: 1.2, s: 0.9 },
  { at: 1, x: -1.35, y: 0.1, ry: 3.4, s: 0.95 },
];

function sample(t: number) {
  const i = Math.max(0, path.findIndex((p) => p.at >= t) - 1);
  const a = path[i];
  const b = path[Math.min(i + 1, path.length - 1)];
  const k = b.at === a.at ? 0 : THREE.MathUtils.smootherstep(t, a.at, b.at);
  const lerp = (u: number, v: number) => u + (v - u) * k;
  return { x: lerp(a.x, b.x), y: lerp(a.y, b.y), ry: lerp(a.ry, b.ry), s: lerp(a.s, b.s) };
}

function Flying({ progress, still }: { progress: MotionValue<number>; still: boolean }) {
  const ref = useRef<THREE.Group>(null);
  const pointer = usePointer();
  const idle = useRef(0);

  useFrame((state, delta) => {
    const g = ref.current;
    if (!g) return;
    const p = sample(still ? 0 : progress.get());
    const m = still ? { x: 0, y: 0 } : pointer.current;
    if (!still) idle.current += delta;
    // Sur un écran étroit, le modèle reste centré et passe derrière le texte.
    const narrow = state.size.width < 768;
    // Sur téléphone, la caméra recule pour que le modèle tienne en largeur.
    state.camera.position.z = fitDistance(state.size.width / state.size.height, 30, 3.2);
    const x = narrow ? p.x * 0.25 : p.x;
    easing.damp3(g.position, [x + m.x * 0.15, p.y + Math.sin(idle.current * 0.8) * 0.06 + m.y * 0.1, 0], 0.35, delta);
    easing.dampE(g.rotation, [0.12 - m.y * 0.25, p.ry + m.x * 0.45, Math.sin(idle.current * 0.6) * 0.05], 0.4, delta);
    easing.damp3(g.scale, [p.s, p.s, p.s], 0.4, delta);
  });

  return (
    <group ref={ref} position={[0.9, 0.05, 0]}>
      <Model url={hero.file} studio finish={hero.finish} />
    </group>
  );
}

const ease = [0.2, 0.7, 0.1, 1] as const;

/**
 * Vrai tant que l'avancement du scroll est dans [from, to[. Les textes s'affichent alors
 * en entier, avec un fondu en temps (et non au pixel près) : un geste rapide ne les fait
 * pas clignoter, et il n'y a pas de position précise à trouver pour pouvoir les lire.
 */
function useBetween(progress: MotionValue<number>, from: number, to: number) {
  const inside = (v: number) => v >= from && v < to;
  const [on, setOn] = useState(() => inside(progress.get()));
  useMotionValueEvent(progress, "change", (v) => setOn(inside(v)));
  return on;
}

function Beat({
  progress,
  range,
  className,
  children,
}: {
  progress: MotionValue<number>;
  range: [number, number];
  className?: string;
  children: React.ReactNode;
}) {
  const on = useBetween(progress, range[0], range[1]);
  return (
    <motion.div
      initial={false}
      animate={on ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
      transition={{ duration: on ? 0.7 : 0.35, ease, delay: on ? 0.05 : 0 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function Hero() {
  const section = useRef<HTMLElement>(null);
  const visible = useInView(section, "0px");
  const still = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: section, offset: ["start start", "end end"] });
  const intro = useBetween(scrollYProgress, -1, 0.12);
  const cue = useBetween(scrollYProgress, -1, 0.03);

  return (
    <section ref={section} id="accueil" aria-label="Présentation" className="relative h-[320vh]">
      <div className="sticky top-0 h-dvh overflow-hidden">
        <Canvas
          className="!absolute inset-0"
          frameloop={visible ? "always" : "never"}
          dpr={[1, 1.75]}
          camera={{ position: [0, 0.2, 7], fov: 30 }}
          gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
          aria-hidden
        >
          <Studio keyColor={hero.key} shadow={false} />
          <Dust progress={scrollYProgress} still={still} />
          <Suspense fallback={null}>
            <Flying progress={scrollYProgress} still={still} />
          </Suspense>
        </Canvas>

        <motion.div initial={false} animate={{ opacity: intro ? 1 : 0 }} transition={{ duration: 0.5 }} className="absolute inset-0">
          <HeroHud model={hero.name} year={hero.year} />
        </motion.div>

        <div className="pointer-events-none relative z-10 mx-auto flex h-full max-w-content flex-col justify-end px-gutter pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-20">
          <motion.div
            initial={false}
            animate={intro ? { opacity: 1, y: 0 } : { opacity: 0, y: -40 }}
            transition={{ duration: intro ? 0.7 : 0.4, ease }}
          >
            <p className="hud-in label text-fg-2" style={{ animationDelay: "0.4s" }}>
              {site.role} · {site.city}
            </p>
            {/* Le nom monte lettre par lettre dès que l'écran de chargement se retire. */}
            <h1 className="display mt-5 text-[clamp(3.5rem,11vw,10rem)]" aria-label={site.name}>
              {site.name.split(" ").map((word, i) => (
                <span key={i} className="block">
                  <LetterRise text={word} delay={0.15 + i * 0.22} />
                </span>
              ))}
            </h1>
          </motion.div>

          <Beat progress={scrollYProgress} range={[0.2, 0.58]} className="absolute inset-x-gutter bottom-[22vh] max-w-xl">
            <p className="label text-accent">{t("accueil.phrase1.etiquette")}</p>
            <p className="mt-4 text-[clamp(2rem,4.6vw,4rem)] font-medium leading-[0.98] tracking-[-0.035em]">
              {t("accueil.phrase1")}
            </p>
          </Beat>

          <Beat
            progress={scrollYProgress}
            range={[0.6, 2]}
            className="absolute bottom-[22vh] right-gutter max-w-xl text-right"
          >
            <p className="label text-accent">{t("accueil.phrase2.etiquette")}</p>
            <p className="mt-4 text-[clamp(2rem,4.6vw,4rem)] font-medium leading-[0.98] tracking-[-0.035em]">
              {t("accueil.phrase2")}
            </p>
          </Beat>

          <motion.p
            initial={false}
            animate={{ opacity: cue ? 1 : 0 }}
            transition={{ duration: 0.4 }}
            className="dots absolute bottom-[calc(2rem+env(safe-area-inset-bottom))] right-gutter text-sm text-fg-2"
          >
            {t("accueil.defiler")}
          </motion.p>
        </div>
      </div>
    </section>
  );
}
