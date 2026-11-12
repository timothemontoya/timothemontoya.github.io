import Link from "next/link";
import { projects } from "@/content/projects";
import { Media } from "./media";
import { Reveal } from "./reveal";
import { SectionLabel } from "./section-label";
import { t } from "@/content/textes";

export function ProjectsSection() {
  return (
    <section id="projets" data-snap aria-labelledby="projets-titre" className="mx-auto max-w-content px-gutter py-32 md:py-48">
      <Reveal className="flex items-end justify-between gap-8">
        <div>
          <SectionLabel n="03">{t("projets.etiquette")}</SectionLabel>
          <h2 id="projets-titre" className="mt-4 text-[clamp(2.25rem,5vw,4.5rem)] font-medium leading-[0.95] tracking-[-0.035em]">
            {t("projets.titre")}
          </h2>
        </div>
        <p className="label hidden text-fg-3 md:block">{String(projects.length).padStart(2, "0")} {t("projets.compteur")}</p>
      </Reveal>

      <ol className="mt-16 border-b border-line md:mt-24">
        {projects.map((p, i) => (
          <li key={p.slug} className="border-t border-line">
            <Reveal>
              <Link href={`/projets/${p.slug}`} className="group grid gap-8 py-10 md:grid-cols-12 md:gap-10 md:py-16">
                <div className="flex flex-col md:col-span-6">
                  <p className="flex items-center gap-4">
                    <span className="dots text-2xl text-fg-2 transition-colors duration-500 group-hover:text-ember md:text-3xl">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="label flex gap-3 text-fg-3">
                      <span>{p.year}</span>
                      {p.status && <span className="text-ember">{p.status}</span>}
                    </span>
                  </p>
                  <h3 className="mt-6 text-[clamp(2.25rem,4.6vw,4.5rem)] font-medium uppercase leading-[0.92] tracking-[-0.03em]">{p.title}</h3>
                  <p className="mt-3 text-lg text-fg-2">{p.kicker}</p>
                  <p className="mt-6 max-w-lg text-fg-2 text-pretty">{p.summary}</p>
                  <p className="label mt-6 text-fg-3">
                    {t("projets.role")} : <span className="text-fg-2">{p.role}</span>
                  </p>
                  <ul className="mt-5 flex flex-wrap gap-2" aria-label="Technologies">
                    {p.stack.slice(0, 5).map((s) => (
                      <li key={s} className="rounded-md border border-line px-2.5 py-1 text-xs text-fg-2">
                        {s}
                      </li>
                    ))}
                  </ul>
                  <span className="mt-auto inline-flex items-center gap-2 pt-10 text-sm text-fg transition-[gap] duration-500 group-hover:gap-4">
                    {t("projets.voir")} <span aria-hidden>→</span>
                  </span>
                </div>
                <div className="relative order-first self-start overflow-hidden rounded-[10px] bg-ink-1 md:order-none md:col-span-6" style={{ aspectRatio: "16 / 10" }}>
                  <Media
                    media={p.cover}
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="transition-transform duration-[1200ms] ease-out-cine group-hover:scale-[1.03]"
                  />
                </div>
              </Link>
            </Reveal>
          </li>
        ))}
      </ol>
    </section>
  );
}
