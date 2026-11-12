import { t } from "@/content/textes";

/**
 * Écran de chargement affiché à l'ouverture du site (pas lors des changements de page).
 * L'animation est entièrement en CSS (voir globals.css, « .preloader »).
 */
export function Preloader() {
  return (
    <div className="preloader" aria-hidden>
      <div className="flex flex-col items-center">
        <p className="dots text-2xl text-fg">{t("chargement")}</p>
        <div className="preloader-bar">
          <span />
        </div>
      </div>
    </div>
  );
}
