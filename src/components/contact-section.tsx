import { site } from "@/content/site";
import { t } from "@/content/textes";
import { Reveal } from "./reveal";
import { SectionLabel } from "./section-label";

export function ContactSection() {
  const links = [
    { label: "GitHub", href: site.links.github },
    { label: "LinkedIn", href: site.links.linkedin },
    { label: "ArtStation", href: site.links.artstation },
    { label: t("don.lien"), href: site.links.don },
  ].filter((l) => l.href);

  return (
    <footer id="contact" data-snap className="relative overflow-hidden border-t border-line">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(ellipse 60% 70% at 50% 120%, rgb(255 122 61 / 0.16), transparent 70%)" }}
      />
      <div className="relative mx-auto max-w-content px-gutter pb-10 pt-32 md:pt-48">
        <Reveal>
          <SectionLabel n="05">{t("contact.etiquette")}</SectionLabel>
          <h2 className="display mt-6 text-[clamp(3rem,9vw,8.5rem)]">
            {t("contact.titre")}
            <span className="text-ember">?</span>
          </h2>
          <p className="mt-8 max-w-lg text-lg text-fg-2 text-pretty">
            {t("contact.texte")}
          </p>
          <div className="mt-12 flex flex-wrap items-center gap-x-10 gap-y-6">
            {site.links.email ? (
              <a
                href={`mailto:${site.links.email}`}
                className="rounded-md bg-fg px-6 py-3.5 text-sm font-medium text-ink-0 transition-opacity duration-300 hover:opacity-85"
              >
                {site.links.email}
              </a>
            ) : (
              <span className="rounded-md border border-dashed border-line px-6 py-3.5 text-sm text-fg-3">Adresse e-mail à ajouter</span>
            )}
            <ul className="label flex flex-wrap gap-x-8 gap-y-4 text-fg-2">
              {links.map((l) => (
                <li key={l.label}>
                  <a href={l.href} target="_blank" rel="noreferrer" className="transition-colors duration-300 hover:text-fg">
                    <span aria-hidden className="text-fg-3">&gt; </span>
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
        <div className="label mt-32 flex flex-wrap justify-between gap-4 border-t border-line pt-6 text-fg-3">
          <span>
            {site.name} — {t("contact.droits")} ©{new Date().getFullYear()}
          </span>
          <span>{t("contact.pied")}</span>
        </div>
      </div>
    </footer>
  );
}
