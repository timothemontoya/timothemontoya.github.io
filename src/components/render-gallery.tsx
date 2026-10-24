"use client";

import Image from "next/image";
import { useLenis } from "lenis/react";
import { AnimatePresence, motion, useScroll, useTransform } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { renders, type Render, type Shot } from "@/content/renders";
import { t } from "@/content/textes";
import { useReducedMotion } from "@/lib/use-media";
import { asset } from "@/lib/asset";

/** Hauteur des visuels dans le défilé horizontal. */
const FRAME_H = "min(68vh, 720px)";

/** Toutes les vues à la suite, pour naviguer de l'une à l'autre en plein écran. */
const slides = renders.flatMap((r, ri) => r.shots.map((shot, si) => ({ render: r, shot, ri, si })));

function ShotMedia({ shot, alt, sizes, priority, className }: { shot: Shot; alt: string; sizes: string; priority?: boolean; className?: string }) {
  return shot.kind === "image" ? (
    <Image src={asset(shot.src)} alt={alt} fill sizes={sizes} priority={priority} className={className} />
  ) : (
    <video src={asset(shot.src)} aria-label={alt} className={className} autoPlay muted loop playsInline preload="metadata" />
  );
}

function Frame({ item, index, onOpen }: { item: Render; index: number; onOpen: () => void }) {
  const cover = item.shots[0];
  return (
    <figure className="group shrink-0" style={{ width: `calc(${FRAME_H} * ${cover.ratio})` }}>
      <button
        type="button"
        onClick={onOpen}
        aria-label={`Voir « ${item.title} » en grand${item.shots.length > 1 ? `, ${item.shots.length} vues` : ""}`}
        className="relative block w-full cursor-zoom-in overflow-hidden rounded-[10px] bg-ink-1"
        style={{ height: FRAME_H }}
      >
        <ShotMedia
          shot={cover}
          alt={`${item.title}, ${item.note}`}
          sizes="(max-width: 768px) 90vw, 60vw"
          priority={index < 2}
          className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out-cine group-hover:scale-[1.03]"
        />
        {item.shots.length > 1 && (
          <span className="label absolute right-3 top-3 rounded-full bg-ink-0/70 px-3 py-1.5 text-fg backdrop-blur-sm">
            {item.shots.length} {t("rendus.vues")}
          </span>
        )}
      </button>
      <figcaption className="mt-4 flex items-baseline justify-between gap-6">
        <span className="text-lg font-medium tracking-[-0.02em]">{item.title}</span>
        <span className="label text-fg-3">{item.note}</span>
      </figcaption>
    </figure>
  );
}

/** Visionneuse plein écran : flèches pour naviguer, Échap ou clic à côté pour fermer. */
function Lightbox({ at, onClose, onMove }: { at: number; onClose: () => void; onMove: (delta: number) => void }) {
  const { render, shot, si } = slides[at];
  const close = useRef<HTMLButtonElement>(null);
  const touch = useRef<{ x: number; y: number } | null>(null);

  // Sur téléphone : balayer à gauche ou à droite pour changer d'image.
  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touch.current) return;
    const dx = e.changedTouches[0].clientX - touch.current.x;
    const dy = e.changedTouches[0].clientY - touch.current.y;
    touch.current = null;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) onMove(dx < 0 ? 1 : -1);
  };

  useEffect(() => {
    close.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onMove(1);
      if (e.key === "ArrowLeft") onMove(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, onMove]);

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={render.title}
      className="fixed inset-0 z-[150] flex flex-col bg-ink-0/95 backdrop-blur-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      data-lenis-prevent
    >
      <div className="flex items-center justify-between gap-6 px-gutter py-5">
        <p className="label text-fg-3">
          {String(at + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
        </p>
        <button ref={close} type="button" onClick={onClose} className="label rounded-md border border-line px-3 py-2 text-fg-2 transition-colors hover:border-fg-3 hover:text-fg">
          Fermer<span className="hidden md:inline"> · Échap</span>
        </button>
      </div>

      <div
        className="relative flex-1"
        onClick={onClose}
        onTouchStart={(e) => (touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY })}
        onTouchEnd={onTouchEnd}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={shot.src}
            className="absolute inset-x-gutter inset-y-0"
            initial={{ opacity: 0, scale: 0.985 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.2, 0.7, 0.1, 1] }}
          >
            <ShotMedia shot={shot} alt={`${render.title}, ${render.note}`} sizes="100vw" className="h-full w-full object-contain" />
          </motion.div>
        </AnimatePresence>
        <button
          type="button"
          aria-label="Image précédente"
          onClick={(e) => {
            e.stopPropagation();
            onMove(-1);
          }}
          className="room-arrow absolute left-gutter top-1/2 -translate-y-1/2 bg-ink-0/60 backdrop-blur-sm"
        >
          ←
        </button>
        <button
          type="button"
          aria-label="Image suivante"
          onClick={(e) => {
            e.stopPropagation();
            onMove(1);
          }}
          className="room-arrow absolute right-gutter top-1/2 -translate-y-1/2 bg-ink-0/60 backdrop-blur-sm"
        >
          →
        </button>
      </div>

      <div className="flex items-baseline justify-between gap-6 px-gutter py-6">
        <p className="text-xl font-medium tracking-[-0.02em]">
          {render.title}
          {render.shots.length > 1 && (
            <span className="ml-3 text-fg-3">
              {si + 1}/{render.shots.length}
            </span>
          )}
        </p>
        <p className="label text-fg-3">{render.note}</p>
      </div>
    </motion.div>
  );
}

const MONTHS = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];

/** Rendus regroupés par année, du plus ancien au plus récent. */
const years = Object.entries(
  renders
    .map((r, ri) => ({ r, ri }))
    .sort((a, b) => a.r.date.localeCompare(b.r.date))
    .reduce<Record<string, { r: Render; ri: number }[]>>((acc, item) => {
      (acc[item.r.date.slice(0, 4)] ??= []).push(item);
      return acc;
    }, {}),
);

/**
 * Frise chronologique : les mêmes rendus, rangés par date, pour voir la progression.
 * Clic sur une vignette : ouverture dans la visionneuse.
 */
function Timeline({ onOpen }: { onOpen: (ri: number) => void }) {
  return (
    <section data-snap aria-labelledby="evolution-titre" className="mx-auto max-w-content px-gutter py-32 md:py-40">
      <div className="flex flex-wrap items-end justify-between gap-8">
        <div>
          <p className="label text-fg-3">
            {years[0][0]} → {years[years.length - 1][0]}
          </p>
          <h2 id="evolution-titre" className="mt-4 text-[clamp(2.25rem,5vw,4.5rem)] font-medium leading-[0.95] tracking-[-0.035em]">
            {t("evolution.titre")}
          </h2>
        </div>
        <p className="max-w-sm text-fg-2 text-pretty">
          {t("evolution.texte")}
        </p>
      </div>

      <ol className="relative mt-16 md:mt-24">
        {/* Le fil de la frise */}
        <span aria-hidden className="absolute bottom-0 left-[5px] top-2 w-px bg-gradient-to-b from-line via-fg-3 to-ember md:left-[calc(16.666%-1px)]" />
        {years.map(([year, items]) => (
          <li key={year} className="relative grid gap-6 pb-16 pl-8 last:pb-0 md:grid-cols-6 md:gap-10 md:pl-0">
            <span aria-hidden className="absolute left-0 top-2.5 size-[11px] rounded-full border border-fg-3 bg-ink-0 md:left-[calc(16.666%-6px)]" />
            <h3 className="text-[clamp(2rem,4vw,3.5rem)] font-medium leading-none tracking-[-0.04em] md:col-span-1 md:pr-8 md:text-right">{year}</h3>
            <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:col-span-5 md:grid-cols-4 md:pl-10">
              {items.map(({ r, ri }) => {
                const cover = r.shots[0];
                const month = MONTHS[Number(r.date.slice(5, 7)) - 1];
                return (
                  <li key={r.title}>
                    <button type="button" onClick={() => onOpen(ri)} className="group block w-full cursor-zoom-in text-left" aria-label={`Voir « ${r.title} » en grand`}>
                      <span className="relative block aspect-[4/3] overflow-hidden rounded-[8px] bg-ink-1">
                        <ShotMedia
                          shot={cover}
                          alt={r.title}
                          sizes="(max-width: 768px) 45vw, 18vw"
                          className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out-cine group-hover:scale-[1.05]"
                        />
                      </span>
                      <span className="mt-3 block text-sm font-medium tracking-[-0.01em]">{r.title}</span>
                      <span className="label mt-1 block text-fg-3">
                        {r.approx ? `${t("evolution.avant")} ${month}` : month} {r.date.slice(0, 4)}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </li>
        ))}
      </ol>
    </section>
  );
}

/**
 * Défilé horizontal piloté par le scroll vertical (desktop).
 * Sur mobile ou avec « réduire les animations », simple liste verticale.
 */
export function RenderGallery() {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [distance, setDistance] = useState(0);
  const [wide, setWide] = useState(false);
  const [open, setOpen] = useState<number | null>(null);
  const still = useReducedMotion();
  const lenis = useLenis();
  const pinned = wide && !still;

  useEffect(() => {
    const measure = () => {
      setWide(window.innerWidth >= 768);
      if (track.current) setDistance(Math.max(0, track.current.scrollWidth - window.innerWidth));
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (track.current) ro.observe(track.current);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  // La page ne défile pas derrière la visionneuse.
  useEffect(() => {
    if (open === null) return;
    lenis?.stop();
    return () => lenis?.start();
  }, [open, lenis]);

  const onClose = useCallback(() => setOpen(null), []);
  const onMove = useCallback((delta: number) => setOpen((o) => (o === null ? o : (o + delta + slides.length) % slides.length)), []);

  const { scrollYProgress } = useScroll({ target: section, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, [0, 1], [0, -distance]);

  return (
    <>
      <section
        ref={section}
        id="rendus"
        data-snap
        aria-labelledby="rendus-titre"
        className="relative"
        style={pinned ? { height: `calc(100vh + ${distance}px)` } : undefined}
      >
        <div className={pinned ? "sticky top-0 flex h-dvh flex-col justify-center overflow-hidden" : "py-24"}>
          <div className="mx-auto mb-10 flex w-full max-w-content items-end justify-between gap-8 px-gutter">
            <div>
              <p className="label text-fg-3">{t("rendus.etiquette")}</p>
              <h2 id="rendus-titre" className="mt-4 text-[clamp(2.25rem,5vw,4.5rem)] font-medium leading-[0.95] tracking-[-0.035em]">
                {t("rendus.titre")}
              </h2>
            </div>
            <p className="max-w-sm text-fg-2 text-pretty">
              {t("rendus.texte")}
            </p>
          </div>
          <motion.div
            ref={track}
            style={pinned ? { x } : undefined}
            className={
              pinned
                ? "flex w-max gap-6 px-gutter will-change-transform"
                : "mx-auto flex max-w-content flex-col gap-12 px-gutter [&_figure]:!w-full [&_figure>button]:!h-auto [&_figure>button]:aspect-[var(--r)]"
            }
          >
            {renders.map((item, i) => (
              <div key={item.title} style={{ ["--r" as string]: String(item.shots[0].ratio) }} className={pinned ? undefined : "w-full"}>
                <Frame item={item} index={i} onOpen={() => setOpen(slides.findIndex((s) => s.ri === i))} />
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      <Timeline onOpen={(ri) => setOpen(slides.findIndex((sl) => sl.ri === ri))} />

      <AnimatePresence>{open !== null && <Lightbox at={open} onClose={onClose} onMove={onMove} />}</AnimatePresence>
    </>
  );
}
