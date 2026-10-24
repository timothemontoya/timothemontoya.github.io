"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { easing } from "maath";
import { AnimatePresence, motion } from "motion/react";
import { type RefObject, Suspense, useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { models, type Model as ModelInfo } from "@/content/models";
import { cn } from "@/lib/utils";
import { useInView } from "@/lib/use-in-view";
import { usePointer } from "@/lib/use-pointer";
import { fitDistance } from "@/lib/fit-distance";
import { useReducedMotion } from "@/lib/use-media";
import { Model, preloadModel } from "./three/model";
import { Studio } from "./three/studio";
import { t } from "@/content/textes";

/** Durée de la sortie d'un modèle avant l'entrée du suivant, en secondes. */
const SWAP = 0.45;
/** Vitesse de la rotation automatique, tant que le visiteur n'a pas touché au modèle. */
const IDLE_SPIN = 0.18;

/**
 * Orientation donnée par le visiteur à chaque modèle. Elle est conservée :
 * pas de retour à la position de départ, et on la retrouve en revenant sur le modèle.
 */
type Pose = { yaw: number; pitch: number; touched: boolean };
type Poses = Map<string, Pose>;

const poseOf = (poses: Poses, slug: string) => {
  let p = poses.get(slug);
  if (!p) poses.set(slug, (p = { yaw: 0, pitch: 0, touched: false }));
  return p;
};

function Exhibit({ model, leaving, still, poses }: { model: ModelInfo; leaving: boolean; still: boolean; poses: RefObject<Poses> }) {
  const ref = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    const g = ref.current;
    if (!g) return;
    const pose = poseOf(poses.current, model.slug);
    if (!still && !pose.touched) pose.yaw += delta * IDLE_SPIN;
    const target = leaving ? 0.001 : 1;
    easing.damp3(g.scale, [target, target, target], leaving ? 0.12 : 0.28, delta);
    easing.damp(g.position, "y", leaving ? -0.6 : 0, 0.25, delta);
    easing.damp(g.rotation, "x", pose.pitch, 0.18, delta);
    easing.damp(g.rotation, "y", pose.yaw, 0.18, delta);
  });

  // Deux groupes : l'orientation de présentation (fixe) sous la rotation du visiteur,
  // pour que « glisser vers la droite » tourne toujours le modèle autour de l'axe vertical.
  return (
    <group ref={ref} scale={0.001} position-y={-0.6}>
      <group rotation={model.rotation ?? [0, 0, 0]}>
        <Model url={model.file} studio={model.studio} finish={model.finish} />
      </group>
    </group>
  );
}

function CameraRig({ still }: { still: boolean }) {
  const pointer = usePointer();
  useFrame((state, delta) => {
    const p = still ? { x: 0, y: 0 } : pointer.current;
    const z = fitDistance(state.size.width / state.size.height);
    easing.damp3(state.camera.position, [p.x * 0.35, 0.35 + p.y * 0.2, z], 0.6, delta);
    state.camera.lookAt(0, 0, 0);
  });
  return null;
}

type Props = {
  className?: string;
  /** Titre affiché en haut de la salle (absent sur la page /salle, plein écran). */
  heading?: { kicker: string; title: string; text: string; id: string };
};

export function ProjectionRoom({ className, heading }: Props) {
  const [index, setIndex] = useState(0);
  const [shown, setShown] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const container = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const poses = useRef<Poses>(new Map());
  const drag = useRef<{ id: number; x: number; y: number } | null>(null);
  const visible = useInView(container);
  const still = useReducedMotion();
  const current = models[shown];
  const info = models[index];

  const select = useCallback(
    (next: number) => {
      const i = (next + models.length) % models.length;
      if (i === index) return;
      setIndex(i);
      preloadModel(models[i].file);
      setLeaving(true);
    },
    [index],
  );

  useEffect(() => {
    if (!leaving) return;
    const t = setTimeout(() => {
      setShown(index);
      setLeaving(false);
    }, SWAP * 1000);
    return () => clearTimeout(t);
  }, [leaving, index]);

  // Garde le bouton actif centré dans la liste qui défile horizontalement
  // (sans scrollIntoView, qui ferait aussi défiler la page).
  useEffect(() => {
    const ul = list.current;
    const el = ul?.children[index] as HTMLElement | undefined;
    if (ul && el) ul.scrollTo({ left: el.offsetLeft - ul.clientWidth / 2 + el.clientWidth / 2, behavior: "smooth" });
  }, [index]);

  // Précharge tous les modèles dès que la salle approche de l'écran : le changement est instantané.
  useEffect(() => {
    if (visible) models.forEach((m) => preloadModel(m.file));
  }, [visible]);

  // Flèches du clavier quand la salle est à l'écran.
  useEffect(() => {
    if (!visible) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLElement && e.target.closest("input, textarea, [role=application]")) return;
      if (e.key === "ArrowRight") select(index + 1);
      if (e.key === "ArrowLeft") select(index - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [visible, index, select]);

  // Rotation à la main. `touch-action: pan-y` laisse le défilement vertical au navigateur
  // sur mobile : seuls les glissements horizontaux font tourner le modèle.
  const onPointerDown = (e: React.PointerEvent) => {
    drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const pose = poseOf(poses.current, current.slug);
    pose.touched = true;
    pose.yaw += (e.clientX - d.x) * 0.009;
    pose.pitch = THREE.MathUtils.clamp(pose.pitch + (e.clientY - d.y) * 0.006, -0.8, 0.8);
    d.x = e.clientX;
    d.y = e.clientY;
  };
  const endDrag = () => (drag.current = null);

  return (
    <div ref={container} className={cn("relative isolate flex h-svh min-h-[560px] flex-col overflow-hidden bg-ink-0", className)}>
      {/* Halo de projecteur derrière le modèle */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 transition-[background] duration-1000"
        style={{
          background: `radial-gradient(ellipse 55% 45% at 50% 50%, color-mix(in oklab, ${info.key} 16%, transparent), transparent 70%), radial-gradient(ellipse 40% 12% at 50% 80%, rgb(255 255 255 / 0.05), transparent 70%)`,
        }}
      />

      <div
        className="absolute inset-0 cursor-grab touch-pan-y active:cursor-grabbing"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <Canvas
          frameloop={visible ? "always" : "never"}
          dpr={[1, 1.75]}
          shadows
          camera={{ position: [0, 0.35, 7], fov: 30 }}
          gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, outputColorSpace: THREE.SRGBColorSpace }}
          aria-label={`Modèle 3D : ${current.name}. Glisser pour le faire tourner.`}
        >
          <Studio keyColor={current.key} />
          <Suspense fallback={null}>
            <Exhibit key={current.slug} model={current} leaving={leaving} still={still} poses={poses} />
          </Suspense>
          <CameraRig still={still} />
        </Canvas>
      </div>

      {/* Titre de la salle */}
      <div className="pointer-events-none relative z-10 px-gutter pt-24 md:pt-28">
        {heading && (
          <div className="mx-auto flex max-w-content items-end justify-between gap-8">
            <div>
              <p className="label text-fg-3">{heading.kicker}</p>
              <h2 id={heading.id} className="mt-3 text-[clamp(2rem,4.5vw,4rem)] font-medium leading-[0.95] tracking-[-0.035em]">
                {heading.title}
              </h2>
            </div>
            <p className="hidden max-w-sm text-fg-2 text-pretty md:block">{heading.text}</p>
          </div>
        )}
      </div>

      <div className="flex-1" />

      {/* Cartouche, façon fiche de musée */}
      <div className="pointer-events-none relative z-10 px-gutter pb-6">
        <div className="mx-auto flex max-w-content items-end justify-between gap-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={info.slug}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.6, ease: [0.2, 0.7, 0.1, 1] }}
              className="max-w-md"
            >
              <p className="label text-fg-3">
                {String(index + 1).padStart(2, "0")} / {String(models.length).padStart(2, "0")} · {info.year}
              </p>
              <h3 className="mt-2 text-[clamp(1.75rem,3.5vw,3rem)] font-medium leading-[0.95] tracking-[-0.035em]">{info.name}</h3>
              <p className="mt-2 text-sm text-fg-2 text-pretty md:text-base">{info.caption}</p>
            </motion.div>
          </AnimatePresence>
          <p className="label hidden shrink-0 text-fg-3 md:block">{t("salle.aide")}</p>
        </div>
      </div>

      {/* Sélecteur de modèles */}
      <nav aria-label="Choisir un modèle" className="relative z-20 pb-6 md:pb-8">
        <div className="mx-auto flex max-w-content items-center gap-3 px-gutter">
          <button type="button" onClick={() => select(index - 1)} className="room-arrow" aria-label="Modèle précédent">
            ←
          </button>
          <ul ref={list} className="no-scrollbar flex flex-1 gap-2 overflow-x-auto [mask-image:linear-gradient(90deg,transparent,#000_24px,#000_calc(100%-24px),transparent)] px-6">
            {models.map((m, i) => (
              <li key={m.slug} className="shrink-0">
                <button
                  type="button"
                  onClick={() => select(i)}
                  aria-pressed={i === index}
                  className={cn(
                    "rounded-full border px-4 py-2 text-sm transition-colors duration-300",
                    i === index ? "border-fg/70 bg-fg text-ink-0" : "border-line text-fg-2 hover:border-fg-3 hover:text-fg",
                  )}
                >
                  {m.name}
                </button>
              </li>
            ))}
          </ul>
          <button type="button" onClick={() => select(index + 1)} className="room-arrow" aria-label="Modèle suivant">
            →
          </button>
        </div>
      </nav>
    </div>
  );
}
