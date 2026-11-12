"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { Render } from "@/content/renders";
import { t } from "@/content/textes";
import { asset } from "@/lib/asset";
import { useInView } from "@/lib/use-in-view";
import { useReducedMotion } from "@/lib/use-media";

/** Angle entre deux rendus voisins : la spirale fait un tour tous les 7 rendus. */
const STEP = (Math.PI * 2) / 7;
/** Temps de pose sur un rendu avant de passer seul au suivant (s). */
const PAUSE = 3.6;
/** Largeur maximale d'une carte, en multiple de sa hauteur (les formats larges sont recadrés). */
const MAX_RATIO = 1.45;

/**
 * Carrousel en spirale : les rendus sont posés le long d'une hélice qui avance d'un cran toutes les quelques secondes.
 * Glisser pour la faire tourner, cliquer sur un rendu pour l'ouvrir en grand.
 * La position de chaque carte est recalculée à chaque image, sans rendu React.
 */
export function RenderSpiral({ items, onOpen }: { items: Render[]; onOpen: (id: string) => void }) {
  const stage = useRef<HTMLDivElement>(null);
  const cards = useRef<(HTMLButtonElement | null)[]>([]);
  const motion = useRef({ p: 0, target: 0, dragging: false, x: 0, moved: 0, paused: false, idle: 0 });
  const [front, setFront] = useState(0);
  const visible = useInView(stage);
  const still = useReducedMotion();
  const n = items.length;

  useEffect(() => {
    const el = stage.current;
    if (!el || !visible) return;
    let raf = 0;
    let last = performance.now();
    let shown = -1;

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const m = motion.current;
      if (still || m.dragging || m.paused) m.idle = 0;
      else if ((m.idle += dt) > PAUSE) {
        m.idle = 0;
        m.target = Math.round(m.target) + 1;
      }
      m.p += (m.target - m.p) * (still ? 1 : 1 - Math.exp(-dt * (m.dragging ? 14 : 3.2)));

      const w = el.clientWidth;
      const h = el.clientHeight;
      const cardH = Math.min(h * 0.5, w * 0.5, 420);
      // Rayon jamais trop petit par rapport aux cartes, sinon elles se traversent (téléphone).
      const radius = Math.max(Math.min(w * 0.42, 640), cardH * 1.7);
      const rise = cardH * 0.24;
      el.style.setProperty("--card-h", `${cardH}px`);

      for (let i = 0; i < n; i++) {
        const card = cards.current[i];
        if (!card) continue;
        // Rang de la carte le long de l'hélice, ramené entre -n/2 et n/2 : la spirale boucle.
        let k = (((i - m.p) % n) + n) % n;
        if (k > n / 2) k -= n;
        const a = k * STEP;
        const facing = Math.cos(a);
        // Une carte passée derrière est retournée : on voit toujours l'image à l'endroit.
        const turn = facing >= 0 ? a : a + Math.PI;
        const ends = 1 - Math.min(1, Math.max(0, (Math.abs(k) - (n / 2 - 1.3)) / 1.3));
        const depth = 0.38 + 0.62 * Math.pow((facing + 1) / 2, 1.4);
        card.style.transform = `translate(-50%, -50%) translate3d(${Math.sin(a) * radius}px, ${k * rise}px, ${(facing - 1) * radius}px) rotateY(${turn}rad)`;
        card.style.opacity = String(ends * depth);
        card.style.pointerEvents = ends > 0.5 ? "auto" : "none";
      }

      const nearest = ((Math.round(m.p) % n) + n) % n;
      if (nearest !== shown) {
        shown = nearest;
        setFront(nearest);
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [visible, still, n]);

  // Glisser : écoute sur la fenêtre pour ne pas perdre le geste hors de la zone.
  useEffect(() => {
    const m = motion.current;
    const onMove = (e: PointerEvent) => {
      if (!m.dragging) return;
      const dx = e.clientX - m.x;
      m.x = e.clientX;
      m.moved += Math.abs(dx);
      m.target -= dx / 190;
    };
    const onUp = () => {
      if (!m.dragging) return;
      m.dragging = false;
      // Au relâchement, le rendu le plus proche vient se placer de face.
      if (m.moved > 6) m.target = Math.round(m.target);
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

  const step = (delta: number) => {
    motion.current.target = Math.round(motion.current.target) + delta;
  };

  /** Amène la carte i de face par le chemin le plus court. */
  const bring = (i: number) => {
    const m = motion.current;
    let d = (((i - m.target) % n) + n) % n;
    if (d > n / 2) d -= n;
    m.target += d;
  };

  const current = items[front];

  return (
    <div>
      <div
        ref={stage}
        className="relative h-[min(72svh,760px)] min-h-[440px] cursor-grab touch-pan-y select-none overflow-hidden active:cursor-grabbing [perspective:1500px]"
        onPointerDown={(e) => {
          const m = motion.current;
          m.dragging = true;
          m.x = e.clientX;
          m.moved = 0;
        }}
        onPointerEnter={(e) => {
          if (e.pointerType === "mouse") motion.current.paused = true;
        }}
        onPointerLeave={() => (motion.current.paused = false)}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") step(1);
          if (e.key === "ArrowLeft") step(-1);
        }}
      >
        <div className="absolute left-1/2 top-1/2 [transform-style:preserve-3d] [transform:rotateX(-6deg)_rotateZ(-9deg)]">
          {items.map((item, i) => {
            const cover = item.shots[0];
            return (
              <button
                key={item.id}
                ref={(node) => {
                  cards.current[i] = node;
                }}
                type="button"
                draggable={false}
                aria-label={`Voir « ${item.title} » en grand${item.shots.length > 1 ? `, ${item.shots.length} ${t("rendus.vues")}` : ""}`}
                onFocus={() => bring(i)}
                onClick={() => {
                  if (motion.current.moved <= 6) onOpen(item.id);
                }}
                className="absolute left-0 top-0 block cursor-zoom-in overflow-hidden rounded-[10px] bg-ink-1 opacity-0 outline-offset-4 will-change-transform"
                style={{ height: "var(--card-h)", width: `calc(var(--card-h) * ${Math.min(cover.ratio, MAX_RATIO)})` }}
              >
                {cover.kind === "image" ? (
                  <Image src={asset(cover.src)} alt="" fill sizes="(max-width: 768px) 60vw, 36vw" draggable={false} className="object-cover" />
                ) : (
                  <video src={asset(cover.src)} className="h-full w-full object-cover" autoPlay muted loop playsInline preload="metadata" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mx-auto flex max-w-content items-end justify-between gap-6 px-gutter pt-6">
        <div aria-live="polite">
          <p className="text-xl font-medium tracking-[-0.02em]">
            <span className="dots mr-4 text-base text-fg-3">
              {String(front + 1).padStart(2, "0")}/{String(n).padStart(2, "0")}
            </span>
            {current.title}
          </p>
          <p className="label mt-2 text-fg-3">{current.note}</p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
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
  );
}
