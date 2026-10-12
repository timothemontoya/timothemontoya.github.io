import { site } from "@/content/site";
import { Reveal } from "./reveal";

export function ContactSection() {
  const links = [
    { label: "GitHub", href: site.links.github },
    { label: "LinkedIn", href: site.links.linkedin },
    { label: "ArtStation", href: site.links.artstation },
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
          <p className="label text-fg-3">Contact</p>
          <h2 className="display mt-6 text-[clamp(3rem,9vw,8.5rem)]">
            On en parle<span className="text-ember">?</span>
          </h2>
          <p className="mt-8 max-w-lg text-lg text-fg-2 text-pretty">
            Stage, alternance, projet 3D ou simple question : je réponds à tous les messages.
          </p>
          <div className="mt-12 flex flex-wrap items-center gap-4">
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
            {links.map((l) => (
              <a
                key={l.label}
                href={l.href}
                target="_blank"
                rel="noreferrer"
                className="rounded-md border border-line px-5 py-3.5 text-sm text-fg-2 transition-colors duration-300 hover:border-fg-3 hover:text-fg"
              >
                {l.label} ↗
              </a>
            ))}
          </div>
        </Reveal>
        <div className="label mt-32 flex flex-wrap justify-between gap-4 border-t border-line pt-6 text-fg-3">
          <span>© {site.name}</span>
          <span>Modèles 3D en temps réel · Three.js</span>
        </div>
      </div>
    </footer>
  );
}
