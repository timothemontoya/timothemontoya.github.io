"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { projects } from "@/content/projects";
import { t } from "@/content/textes";
import { useCoarsePointer, useReducedMotion } from "@/lib/use-media";
import { cn } from "@/lib/utils";
import { Media } from "./media";
import { Reveal } from "./reveal";
import { SectionLabel } from "./section-label";

const GLYPHS = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789";
const ease = [0.2, 0.7, 0.1, 1] as const;

/** Titre qui se « décode » lettre par lettre quand son projet devient actif. */
function Decode({ text, active }: { text: string; active: boolean }) {
  const still = useReducedMotion();
  const [shown, setShown] = useState(text);

  useEffect(() => {
    if (!active || still) return;
    let tick = 0;
    const total = text.length + 6;
    const id = setInterval(() => {
      tick++;
      setShown(
        text
          .split("")
          .map((ch, i) => (ch === " " || i < tick - 6 ? ch : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]))
          .join(""),
      );
      if (tick >= total) {
        clearInterval(id);
        setShown(text);
      }
    }, 32);
    return () => {
      clearInterval(id);
      setShown(text);
    };
  }, [active, still, text]);

  return (
    <>
      <span aria-hidden>{shown}</span>
      <span className="sr-only">{text}</span>
    </>
  );
}

/**
 * Explorateur de projets : la liste des titres à gauche, le projet survolé à droite.
 * À la souris, le survol suffit ; au doigt, un premier appui choisit le projet, le second l'ouvre.
 */
export function ProjectsSection() {
  const [active, setActive] = useState(0);
  const coarse = useCoarsePointer();
  const still = useReducedMotion();
  const p = projects[active];

  return (
    <section id="projets" aria-labelledby="projets-titre" className="mx-auto max-w-content px-gutter py-32 md:py-48">
      <Reveal className="flex items-end justify-between gap-8">
        <div>
          <SectionLabel n="03">{t("projets.etiquette")}</SectionLabel>
          <h2 id="projets-titre" className="mt-4 text-[clamp(2.25rem,5vw,4.5rem)] font-medium leading-[0.95] tracking-[-0.035em]">
            {t("projets.titre")}
          </h2>
        </div>
        <p className="label hidden text-fg-3 md:block">{t("projets.aide")}</p>
      </Reveal>

      <Reveal className="mt-14 grid gap-10 md:mt-20 md:grid-cols-12 md:gap-12">
        <ol className="self-start border-b border-line md:col-span-5">
          {projects.map((q, i) => (
            <li key={q.slug} className="border-t border-line">
              <Link
                href={`/projets/${q.slug}`}
                aria-current={i === active ? "true" : undefined}
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onClick={(e) => {
                  if (coarse && i !== active) {
                    e.preventDefault();
                    setActive(i);
                  }
                }}
                className="group flex items-baseline gap-4 py-5 md:py-6"
              >
                <span className={cn("dots w-9 shrink-0 text-lg transition-colors duration-500", i === active ? "text-ember" : "text-fg-3")}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span
                  className={cn(
                    "min-w-0 flex-1 text-[clamp(1.9rem,3.9vw,3.75rem)] font-medium uppercase leading-[0.95] tracking-[-0.03em] transition-[color,transform] duration-500 ease-out-cine",
                    i === active ? "translate-x-2 text-fg" : "text-fg-3 group-hover:text-fg-2",
                  )}
                >
                  <Decode text={q.title} active={i === active} />
                </span>
                <span className="label shrink-0 text-fg-3">{q.year}</span>
              </Link>
            </li>
          ))}
        </ol>

        <div className="md:col-span-7">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={p.slug}
              initial={{ opacity: 0, y: still ? 0 : 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: still ? 0 : -10 }}
              transition={{ duration: still ? 0 : 0.45, ease }}
            >
              <Link
                href={`/projets/${p.slug}`}
                tabIndex={-1}
                aria-hidden
                className="group relative block overflow-hidden rounded-[10px] bg-ink-1"
                style={{ aspectRatio: "16 / 10" }}
              >
                <Media
                  media={p.cover}
                  sizes="(max-width: 768px) 100vw, 56vw"
                  className="transition-transform duration-[1200ms] ease-out-cine group-hover:scale-[1.03]"
                />
              </Link>
              <div className="mt-8 grid gap-8 sm:grid-cols-2 md:min-h-[15rem]">
                <div>
                  <p className="label flex flex-wrap gap-x-3 gap-y-1 text-fg-3">
                    <span>{p.kicker}</span>
                    {p.status && <span className="text-ember">{p.status}</span>}
                  </p>
                  <p className="mt-4 text-fg-2 text-pretty">{p.summary}</p>
                </div>
                <div className="flex flex-col">
                  <p className="label text-fg-3">
                    {t("projets.role")} : <span className="text-fg-2">{p.role}</span>
                  </p>
                  <ul className="mt-4 flex flex-wrap gap-2" aria-label="Technologies">
                    {p.stack.slice(0, 5).map((s) => (
                      <li key={s} className="rounded-md border border-line px-2.5 py-1 text-xs text-fg-2">
                        {s}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={`/projets/${p.slug}`}
                    className="mt-auto inline-flex items-center gap-2 self-start pt-8 text-sm text-fg transition-[gap] duration-500 hover:gap-4"
                  >
                    {t("projets.voir")} <span aria-hidden>→</span>
                  </Link>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </Reveal>
    </section>
  );
}
