"use client";

import { useEffect, useState } from "react";
import { t } from "@/content/textes";

const clock = new Intl.DateTimeFormat("fr-FR", { timeZone: "Europe/Paris", hour: "2-digit", minute: "2-digit", second: "2-digit" });

/** Heure de Toulouse, mise à jour chaque seconde (vide tant que la page n'est pas active côté navigateur). */
function LocalTime() {
  const [now, setNow] = useState("");
  useEffect(() => {
    const tick = () => setNow(clock.format(new Date()));
    const first = setTimeout(tick, 0);
    const id = setInterval(tick, 1000);
    return () => {
      clearTimeout(first);
      clearInterval(id);
    };
  }, []);
  return <span className="tabular-nums">{now || "--:--:--"}</span>;
}

/**
 * Habillage de l'accueil, façon viseur de caméra : un cadre autour du modèle avec sa fiche,
 * et la position et l'heure de Toulouse. Purement décoratif, masqué aux lecteurs d'écran.
 */
export function HeroHud({ model, year }: { model: string; year: number }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 hidden md:block">
      {/* Cadre de visée autour du modèle */}
      <div className="hud-in absolute left-[46%] top-[17%] h-[60%] w-[40%]" style={{ animationDelay: "1.9s" }}>
        <span className="absolute left-0 top-0 h-4 w-4 border-l border-t border-fg-3" />
        <span className="absolute right-0 top-0 h-4 w-4 border-r border-t border-fg-3" />
        <span className="absolute bottom-0 left-0 h-4 w-4 border-b border-l border-fg-3" />
        <span className="absolute bottom-0 right-0 h-4 w-4 border-b border-r border-fg-3" />
        <p className="label absolute -top-6 left-0 flex items-center gap-3 text-fg-3">
          <i className="hud-blink size-1.5 rounded-full bg-accent" />
          {t("accueil.hud.modele")} · <span className="text-fg-2">{model}</span>
        </p>
        <p className="label absolute -bottom-6 right-0 text-fg-3">
          Blender · {year} · {t("accueil.hud.direct")}
        </p>
      </div>

      {/* Position et heure locale */}
      <p className="hud-in label absolute right-gutter top-24 text-right leading-[1.7] text-fg-3" style={{ animationDelay: "2.1s" }}>
        43.6047° N · 1.4442° E
        <br />
        Toulouse · <span className="dots text-[0.8rem] text-fg-2"><LocalTime /></span>
      </p>
    </div>
  );
}
