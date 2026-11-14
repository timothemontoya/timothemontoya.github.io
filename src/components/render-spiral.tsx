"use client";

import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { useLenis } from "lenis/react";
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import type { Render } from "@/content/renders";
import { t } from "@/content/textes";
import { asset } from "@/lib/asset";
import { useInView } from "@/lib/use-in-view";
import { useReducedMotion } from "@/lib/use-media";
import { useSiteReady } from "@/lib/site-ready";
import { Warmup, useWarmup } from "./three/warmup";

/** Vitesse de la rotation continue du carrousel (rendus par seconde). */
const DRIFT = 0.28;
/** Après un geste, temps de pose sur le rendu recentré avant que la rotation reprenne (s). */
const HOLD = 1.5;
/** Durée du zoom d'entrée dans une image (s). */
const ZOOM = 0.9;
/** Marge de la géométrie autour de l'image : les lignes décalées par le glitch peuvent en déborder. */
const MARGIN = 1.3;

type Item = { id: string; title: string; note: string; views: number; src: string; ratio: number };

type Motion = {
  p: number;
  target: number;
  vel: number;
  dragging: boolean;
  x: number;
  moved: number;
  /** Vrai tant que le carrousel n'occupe pas l'écran : il attend alors sur le premier rendu. */
  away: boolean;
  /** Vitesse actuelle de la rotation automatique, et temps de pose restant avant qu'elle reprenne. */
  speed: number;
  hold: number;
  /** Zoom dans une image : index, sens (1 entre, -1 ressort, 0 au repos) et avancement 0 → 1. */
  zoomI: number;
  zoomDir: number;
  zoom: number;
  /** Marge du bas de Safari, mesurée au premier zoom. */
  safe?: number;
};

const vertexShader = /* glsl */ `
  uniform float uBend;
  uniform float uVel;
  varying vec2 vUv;

  void main() {
    vUv = vec2(position.x + 0.5, position.y + 0.5);
    vec3 p = position;
    // Écran bombé : le centre avance, les bords reculent.
    p.z -= uBend * (p.x * p.x + p.y * p.y);
    // Retard : le haut et le bas de l'image traînent derrière le mouvement.
    p.x += uVel * 0.55 * p.y * p.y;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform sampler2D uMap;
  uniform float uVel;
  uniform float uGlitch;
  uniform float uIdle;
  uniform float uSeed;
  uniform float uTime;
  uniform float uAlpha;
  varying vec2 vUv;

  float hash(float n) {
    return fract(sin(n) * 43758.5453);
  }

  void main() {
    // Au repos : un frémissement à peine visible, et de temps en temps un court décrochage.
    float burst = step(0.9, hash(floor(uTime * 2.5) + uSeed));
    float idle = uIdle * (0.035 + 0.22 * burst);
    // En mouvement, le glitch suit la vitesse du carrousel.
    float g = clamp(abs(uVel) + uGlitch + idle, 0.0, 1.0);
    vec2 uv = vUv;
    float t = floor(uTime * 22.0);
    float row = floor(uv.y * 110.0);
    // Quelques bandes horizontales se déchirent, comme une cassette mal lue.
    float band = step(0.62, hash(floor(uv.y * 9.0) + t * 1.7));
    uv.x += (hash(row + t * 7.1) - 0.5) * 0.22 * g * band;
    uv.x += (hash(row * 0.37 + t) - 0.5) * 0.014 * g;

    float split = 0.014 * g;
    vec3 c = vec3(
      texture2D(uMap, uv + vec2(split, 0.0)).r,
      texture2D(uMap, uv).g,
      texture2D(uMap, uv - vec2(split, 0.0)).b
    );
    c *= 1.0 - 0.22 * g * step(0.5, fract(uv.y * 150.0));

    float inside = step(0.0, uv.x) * step(uv.x, 1.0);
    gl_FragColor = vec4(c, uAlpha * inside);
    #include <colorspace_fragment>
  }
`;

const smooth = (x: number) => {
  const k = Math.min(1, Math.max(0, x));
  return k * k * (3 - 2 * k);
};
const mix = (a: number, b: number, k: number) => a + (b - a) * k;

/** Marge du bas réservée à la barre de Safari sur iPhone (env(safe-area-inset-bottom)), en pixels. */
function safeBottom() {
  const probe = document.createElement("div");
  probe.style.cssText = "position:fixed;visibility:hidden;height:env(safe-area-inset-bottom)";
  document.body.appendChild(probe);
  const h = probe.getBoundingClientRect().height;
  probe.remove();
  return h;
}

function Planes({
  items,
  getMotion,
  still,
  onZoom,
  onFront,
  onEnter,
  onPick,
}: {
  items: Item[];
  /** État du mouvement, tenu par le parent (gestes) et avancé ici à chaque image. */
  getMotion: () => Motion;
  still: boolean;
  /** Avancement du zoom (0 → 1), pour estomper les textes posés sur le carrousel. */
  onZoom: (e: number) => void;
  onFront: (i: number) => void;
  onEnter: (id: string) => void;
  onPick: (i: number) => void;
}) {
  // useLoader et non useTexture de drei : ce dernier envoie toutes les images d'un coup.
  const textures = useLoader(THREE.TextureLoader, items.map((item) => asset(item.src)));
  // Envoie les images à la carte graphique dès leur arrivée plutôt qu'au premier passage à
  // l'écran. Une par une, chacune décodée en arrière-plan d'abord (decode()) : sinon le
  // navigateur la décode d'un bloc au moment de l'envoi, et la page accroche.
  const gl = useThree((s) => s.gl);
  useEffect(() => {
    let stop = false;
    (async () => {
      for (const tex of textures) {
        const img = tex.image as HTMLImageElement | undefined;
        await img?.decode?.().catch(() => {});
        await new Promise((r) => requestAnimationFrame(r));
        if (stop) return;
        gl.initTexture(tex);
      }
    })();
    return () => {
      stop = true;
    };
  }, [textures, gl]);
  const meshes = useRef<(THREE.Mesh | null)[]>([]);
  const shown = useRef(-1);
  const n = items.length;

  const uniforms = useMemo(
    () =>
      textures.map((map) => ({
        uMap: { value: map },
        uBend: { value: 0 },
        uVel: { value: 0 },
        uGlitch: { value: 0 },
        uIdle: { value: 0 },
        uSeed: { value: 0 },
        uTime: { value: 0 },
        uAlpha: { value: 0 },
      })),
    [textures],
  );

  useFrame((state, delta) => {
    const m = getMotion();
    const dt = Math.min(0.05, delta);

    // Rotation continue, arrêtée pendant un geste ou un zoom. Après un geste, le rendu choisi
    // se recentre, reste HOLD secondes de face, puis la rotation repart en douceur.
    if (still || m.away || m.dragging || m.zoom > 0 || m.zoomDir !== 0) {
      m.speed = 0;
      m.hold = HOLD;
    } else if (m.hold > 0) {
      m.speed = 0;
      if (Math.abs(m.target - m.p) < 0.03) m.hold -= dt;
    } else {
      m.speed += (DRIFT - m.speed) * (1 - Math.exp(-dt * 1.2));
      m.target += m.speed * dt;
    }
    const before = m.p;
    m.p += (m.target - m.p) * (still ? 1 : 1 - Math.exp(-dt * (m.dragging ? 14 : 3.4)));
    const speed = dt > 0 ? (m.p - before) / dt : 0;
    m.vel += (speed - m.vel) * (1 - Math.exp(-dt * 9));

    if (m.zoomDir !== 0) {
      m.zoom = Math.min(1, Math.max(0, m.zoom + (m.zoomDir * dt) / (still ? 0.01 : ZOOM)));
      if (m.zoom >= 1 && m.zoomDir > 0) {
        m.zoomDir = 0;
        onEnter(items[m.zoomI].id);
      } else if (m.zoom <= 0) m.zoomDir = 0;
    }
    const e = m.zoom < 0.5 ? 4 * m.zoom ** 3 : 1 - (-2 * m.zoom + 2) ** 3 / 2;
    onZoom(e);

    const { width: vw, height: vh } = state.viewport;
    const rect = state.gl.domElement.getBoundingClientRect();
    const unit = vw / rect.width;
    // Le glitch suit les gestes, pas la rotation automatique (sinon il ne s'arrêterait jamais).
    const lag = still ? 0 : THREE.MathUtils.clamp((m.vel - m.speed) * 0.45, -1, 1);

    for (let i = 0; i < n; i++) {
      const mesh = meshes.current[i];
      if (!mesh) continue;
      const u = (mesh.material as THREE.ShaderMaterial).uniforms;
      const ratio = items[i].ratio;
      const zooming = i === m.zoomI && e > 0;
      // Rang le long de la spirale, ramené entre -n/2 et n/2 : elle boucle sans fin.
      let k = (((i - m.p) % n) + n) % n;
      if (k > n / 2) k -= n;

      let h = Math.min(vh * 0.62, (vw * 0.9) / ratio);
      let w = h * ratio;
      let x = k * vw * 0.56;
      let y = -k * vh * 0.7;
      let z = -Math.abs(k) * 0.7;
      let ry = -k * 0.32;
      let rz = -k * 0.42;
      // Les voisins sont estompés : seul le rendu de face est en pleine lumière.
      let alpha = (1 - smooth((Math.abs(k) - 1.4) / 0.9)) * mix(1, 0.5, smooth(Math.abs(k)));
      let bend = 1.7;

      if (zooming) {
        // Entrée dans l'image : elle vient occuper exactement la place qu'elle aura dans la visionneuse.
        // Mêmes mesures que la visionneuse (render-gallery.tsx) : bandeau de 72px, pied de 76px,
        // largeur sans la barre de défilement, marge de Safari en bas. Sans cela l'image sauterait
        // de quelques pixels au relais.
        const gutter = Math.min(48, Math.max(16, window.innerWidth * 0.04));
        const page = document.documentElement.clientWidth;
        const top = 72;
        const bottom = window.innerHeight - 76 - (m.safe ??= safeBottom());
        const tw = Math.min(page - gutter * 2, (bottom - top) * ratio);
        w = mix(w, tw * unit, e);
        h = mix(h, (tw / ratio) * unit, e);
        x = mix(x, (page / 2 - rect.left - rect.width / 2) * unit, e);
        y = mix(y, -((top + bottom) / 2 - rect.top - rect.height / 2) * unit, e);
        z = mix(z, 0, e);
        ry = mix(ry, 0, e);
        rz = mix(rz, 0, e);
        bend = mix(bend, 0, e);
        alpha = mix(alpha, 1, e);
      } else alpha *= 1 - e;

      mesh.position.set(x, y, z);
      mesh.rotation.set(0, ry, rz);
      mesh.scale.set(w, h, 1);
      mesh.visible = alpha > 0.01;
      mesh.renderOrder = zooming ? 100 : 50 - Math.round(Math.abs(k) * 10);
      u.uBend.value = bend;
      u.uVel.value = zooming ? lag * (1 - e) : lag;
      u.uGlitch.value = zooming && !still ? Math.sin(Math.PI * Math.min(1, m.zoom * 1.4)) * 0.7 : 0;
      // Le frémissement s'éteint pendant l'entrée dans l'image : elle arrive nette dans la visionneuse.
      u.uIdle.value = still ? 0 : zooming ? 1 - e : 1;
      u.uSeed.value = i * 7.3;
      u.uAlpha.value = alpha;
      u.uTime.value = state.clock.elapsedTime;
    }

    const nearest = ((Math.round(m.p) % n) + n) % n;
    if (nearest !== shown.current) {
      shown.current = nearest;
      onFront(nearest);
    }
  });

  return (
    <>
      {items.map((item, i) => (
        <mesh
          key={item.id}
          ref={(node) => {
            meshes.current[i] = node;
          }}
          onClick={(ev) => {
            ev.stopPropagation();
            onPick(i);
          }}
        >
          <planeGeometry args={[MARGIN, 1, 28, 20]} />
          <shaderMaterial
            vertexShader={vertexShader}
            fragmentShader={fragmentShader}
            uniforms={uniforms[i]}
            transparent
            depthTest={false}
            depthWrite={false}
          />
        </mesh>
      ))}
    </>
  );
}

/**
 * Carrousel en spirale : les rendus défilent en diagonale sur des écrans bombés, avec un effet
 * de cassette mal lue pendant le mouvement. Un clic fait entrer dans l'image : elle grandit
 * jusqu'à la place qu'elle occupe dans la visionneuse, qui prend alors le relais.
 */
export function RenderSpiral({
  renders,
  viewing,
  onOpen,
  children,
}: {
  renders: Render[];
  /** Rendu ouvert dans la visionneuse (null quand elle est fermée). */
  viewing: string | null;
  onOpen: (id: string) => void;
  children?: React.ReactNode;
}) {
  const stage = useRef<HTMLDivElement>(null);
  const chrome = useRef<HTMLDivElement>(null);
  const motion = useRef<Motion>({ p: 0, target: 0, vel: 0, dragging: false, x: 0, moved: 0, away: true, speed: 0, hold: HOLD, zoomI: -1, zoomDir: 0, zoom: 0 });
  const [front, setFront] = useState(0);
  const visible = useInView(stage);
  const still = useReducedMotion();
  // Les images du carrousel attendent l'ouverture du site : elles ne retardent pas l'accueil.
  const siteReady = useSiteReady();
  const warm = useWarmup(1800);
  const lenis = useLenis();

  // Couverture de chaque rendu : sa première image fixe (les vidéos restent dans la visionneuse).
  const items = useMemo<Item[]>(
    () =>
      renders.flatMap((r) => {
        const shot = r.shots.find((s) => s.kind === "image");
        return shot ? [{ id: r.id, title: r.title, note: r.note, views: r.shots.length, src: shot.src, ratio: shot.ratio }] : [];
      }),
    [renders],
  );
  const n = items.length;

  /** Amène le rendu i de face par le chemin le plus court. */
  const bring = (i: number) => {
    const m = motion.current;
    let d = (((i - m.target) % n) + n) % n;
    if (d > n / 2) d -= n;
    m.target += d;
  };

  const step = (delta: number) => {
    const m = motion.current;
    if (m.zoom > 0) return;
    m.target = Math.round(m.target) + delta;
    m.speed = 0;
    m.hold = HOLD;
  };

  const pick = (i: number) => {
    const m = motion.current;
    if (m.moved > 6 || m.zoom > 0 || m.zoomDir !== 0) return;
    bring(i);
    m.zoomI = i;
    m.zoomDir = 1;
    // Le carrousel vient remplir l'écran pendant que l'image grandit.
    if (stage.current) {
      if (lenis) lenis.scrollTo(stage.current, { duration: 0.6 });
      else stage.current.scrollIntoView();
    }
  };

  // Fermeture de la visionneuse : l'image retourne à sa place dans la spirale.
  // Si on a changé de rendu entre-temps, c'est celui-là qui ressort.
  useEffect(() => {
    const m = motion.current;
    if (m.zoom <= 0) return;
    if (viewing === null) {
      m.zoomDir = -1;
      return;
    }
    const i = items.findIndex((item) => item.id === viewing);
    if (i < 0 || i === m.zoomI) return;
    let d = (((i - m.target) % items.length) + items.length) % items.length;
    if (d > items.length / 2) d -= items.length;
    m.target += d;
    m.p = m.target;
    m.zoomI = i;
  }, [viewing, items]);

  // L'avance automatique ne démarre que lorsque le carrousel remplit au moins la moitié de l'écran :
  // on arrive toujours sur le premier rendu.
  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => (motion.current.away = !entry.isIntersecting), { threshold: 0.5 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Glisser : écoute sur la fenêtre pour ne pas perdre le geste hors de la zone.
  useEffect(() => {
    const m = motion.current;
    const onMove = (e: PointerEvent) => {
      if (!m.dragging) return;
      const dx = e.clientX - m.x;
      m.x = e.clientX;
      m.moved += Math.abs(dx);
      m.target -= dx / 260;
    };
    const onUp = () => {
      if (!m.dragging) return;
      m.dragging = false;
      // Au relâchement, le rendu le plus proche vient se placer de face, et y reste un instant.
      if (m.moved > 6) m.target = Math.round(m.target);
      m.hold = HOLD;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, []);

  const getMotion = useCallback(() => motion.current, []);
  const onZoom = useCallback((e: number) => {
    if (chrome.current) chrome.current.style.opacity = String(1 - e);
  }, []);
  const current = items[front];

  return (
    <div
      ref={stage}
      className="relative h-svh min-h-[600px] cursor-grab touch-pan-y select-none overflow-hidden active:cursor-grabbing"
      onPointerDown={(e) => {
        const m = motion.current;
        if (m.zoom > 0) return;
        m.dragging = true;
        m.x = e.clientX;
        m.moved = 0;
      }}
    >
      <Canvas
        className="!absolute inset-0"
        frameloop={visible ? "always" : warm ? "demand" : "never"}
        dpr={[1, 1.75]}
        flat
        camera={{ position: [0, 0, 9], fov: 35 }}
        gl={{ antialias: true, alpha: true }}
        aria-hidden
      >
        <Suspense fallback={null}>
          {siteReady && <Planes items={items} getMotion={getMotion} still={still} onZoom={onZoom} onFront={setFront} onEnter={onOpen} onPick={pick} />}
          {siteReady && <Warmup active={warm && !visible} />}
        </Suspense>
      </Canvas>

      <div ref={chrome} className="pointer-events-none absolute inset-0 flex flex-col justify-between pb-[calc(2rem+env(safe-area-inset-bottom))] pt-24 md:pt-28">
        <div>{children}</div>
        <div className="mx-auto flex w-full max-w-content items-end justify-between gap-6 px-gutter">
          <div aria-live="polite">
            <p className="text-xl font-medium tracking-[-0.02em]">
              <span className="dots mr-4 text-base text-fg-3">
                {String(front + 1).padStart(2, "0")}/{String(n).padStart(2, "0")}
              </span>
              {current.title}
            </p>
            <p className="label mt-2 text-fg-3">{current.note}</p>
            {/* Sur téléphone, rappel des deux gestes possibles. */}
            <p className="label mt-3 flex items-center gap-2 text-accent md:hidden">
              <i aria-hidden className="hud-blink size-1.5 rounded-full bg-accent" />
              {t("rendus.aide.mobile")}
            </p>
          </div>
          <div className="pointer-events-auto flex shrink-0 items-center gap-3">
            <p className="label mr-3 hidden text-fg-3 md:block">{t("rendus.aide")}</p>
            <button type="button" onClick={() => step(-1)} className="room-arrow" aria-label="Rendu précédent">
              ←
            </button>
            <button type="button" onClick={() => step(1)} className="room-arrow" aria-label="Rendu suivant">
              →
            </button>
          </div>
        </div>
      </div>

      {/* Accès clavier et lecteurs d'écran : les images du carrousel sont dessinées dans un canvas. */}
      <ul className="sr-only">
        {items.map((item, i) => (
          <li key={item.id}>
            <button type="button" onFocus={() => bring(i)} onClick={() => onOpen(item.id)}>
              Voir « {item.title} » en grand{item.views > 1 ? `, ${item.views} ${t("rendus.vues")}` : ""}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
