"use client";

import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef } from "react";
import { heroSlug, models } from "@/content/models";
import { t } from "@/content/textes";
import { markSiteReady } from "@/lib/site-ready";
import { fetchModel, modelProgress, subscribeModels, whenModelReady } from "./three/model";
import { whenWarm } from "./three/warmup";

const hero = models.find((m) => m.slug === heroSlug) ?? models[0];

/** Durée minimale d'affichage (s), pour que l'écran ne fasse pas qu'un flash. */
const MIN = 0.6;
/** Au-delà (s), le site s'ouvre quoi qu'il arrive (réseau très lent). */
const MAX = 12;

/**
 * Écran de chargement, affiché à l'ouverture du site (pas lors des changements de page).
 * Il attend vraiment ce qui compte : les polices, sur l'accueil le modèle 3D de l'en-tête,
 * puis la préparation des scènes 3D (salle de projection), pour qu'elles n'accrochent pas ensuite.
 * La barre suit le téléchargement du modèle. Le retrait est en CSS (globals.css, « .preloader ») ;
 * sans JavaScript, il se retire seul au bout de quelques secondes.
 */
export function Preloader() {
  const pathname = usePathname();
  const bar = useRef<HTMLSpanElement>(null);
  const first = useRef(pathname);

  // Lance le téléchargement du modèle de l'accueil le plus tôt possible.
  useLayoutEffect(() => {
    if (first.current === "/") void fetchModel(hero.file);
  }, []);

  useEffect(() => {
    const home = first.current === "/";
    let fonts = false;
    const start = performance.now();
    const paint = () => {
      const p = home ? Math.max(0, modelProgress(hero.file)) : 1;
      const k = 0.08 + (fonts ? 0.17 : 0) + 0.75 * p;
      if (bar.current) bar.current.style.transform = `scaleX(${k})`;
    };
    const off = subscribeModels(paint);
    paint();

    const fontsReady = document.fonts.ready.then(() => {
      fonts = true;
      paint();
    });
    const wait = (s: number) => new Promise<void>((r) => setTimeout(r, s * 1000));
    let cancelled = false;
    const model = home ? whenModelReady(hero.file) : Promise.resolve();
    // Préparation des scènes une fois le modèle arrivé ; elle ne peut pas retenir l'écran plus de 4 s.
    const scenes = model.then(() => Promise.race([whenWarm(), wait(4)]));
    Promise.race([Promise.all([fontsReady, scenes, wait(MIN)]), wait(MAX)]).then(async () => {
      if (cancelled) return;
      if (bar.current) bar.current.style.transform = "scaleX(1)";
      // Laisse la barre finir de se remplir, et le navigateur afficher une première image de la scène.
      await wait(Math.max(0.25, MIN - (performance.now() - start) / 1000));
      if (!cancelled) markSiteReady();
    });
    return () => {
      cancelled = true;
      off();
    };
  }, []);

  return (
    <div className="preloader" aria-hidden>
      <div className="flex flex-col items-center">
        <p className="label text-fg">{t("chargement")}</p>
        <div className="preloader-bar">
          <span ref={bar} />
        </div>
      </div>
    </div>
  );
}
