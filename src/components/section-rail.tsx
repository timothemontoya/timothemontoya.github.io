"use client";

import { useEffect, useState } from "react";
import { t } from "@/content/textes";
import { cn } from "@/lib/utils";

// Les étapes de la page d'accueil, dans l'ordre (mêmes numéros que le menu et les titres de section).
const stops = [
  { id: "accueil", label: t("menu.accueil") },
  { id: "salle", label: t("menu.salle") },
  { id: "rendus", label: t("menu.rendus") },
  { id: "projets", label: t("menu.projets") },
  { id: "apropos", label: t("menu.apropos") },
  { id: "contact", label: t("menu.contact") },
];

/**
 * Fil conducteur sur le bord droit (grand écran) : un trait par section,
 * celui de la section à l'écran s'allonge et affiche son numéro. Clic : on y va.
 */
export function SectionRail() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(stops.findIndex((s) => s.id === entry.target.id));
        }
      },
      // Une section devient active quand elle traverse le milieu de l'écran.
      { rootMargin: "-50% 0px -50% 0px" },
    );
    stops.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  return (
    <nav aria-label="Sections de la page" className="fixed right-3 top-1/2 z-30 hidden -translate-y-1/2 lg:block">
      <ol className="flex flex-col items-end gap-3">
        {stops.map((s, i) => (
          <li key={s.id}>
            <a
              href={`#${s.id}`}
              aria-label={s.label}
              aria-current={i === active ? "true" : undefined}
              className="group flex h-3 items-center justify-end gap-2"
            >
              <span
                className={cn(
                  "dots text-[0.7rem] transition-opacity duration-500",
                  i === active ? "text-fg opacity-100" : "text-fg-2 opacity-0 group-hover:opacity-100",
                )}
              >
                {String(i).padStart(2, "0")}
              </span>
              <span
                className={cn(
                  "block h-px transition-[width,background-color] duration-500 ease-out-cine",
                  i === active ? "w-6 bg-ember" : "w-2.5 bg-fg-3 group-hover:w-4 group-hover:bg-fg-2",
                )}
              />
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
