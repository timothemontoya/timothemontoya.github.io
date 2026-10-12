import Link from "next/link";
import { projects } from "@/content/projects";
import { Media } from "./media";
import { Reveal } from "./reveal";

export function ProjectsSection() {
  return (
    <section id="projets" data-snap aria-labelledby="projets-titre" className="mx-auto max-w-content px-gutter py-32 md:py-48">
      <Reveal className="flex items-end justify-between gap-8">
        <div>
          <p className="label text-fg-3">Code &amp; recherche</p>
          <h2 id="projets-titre" className="mt-4 text-[clamp(2.25rem,5vw,4.5rem)] font-medium leading-[0.95] tracking-[-0.035em]">
            Projets
          </h2>
        </div>
        <p className="label hidden text-fg-3 md:block">{String(projects.length).padStart(2, "0")} projets</p>
      </Reveal>

      <ol className="mt-16 flex flex-col gap-24 md:mt-24 md:gap-40">
        {projects.map((p, i) => (
          <li key={p.slug}>
            <Reveal>
              <Link href={`/projets/${p.slug}`} className="group grid gap-8 md:grid-cols-12 md:gap-10">
                <div
                  className={`relative overflow-hidden rounded-[10px] bg-ink-1 md:col-span-7 ${i % 2 ? "md:order-2 md:col-start-6" : ""}`}
                  style={{ aspectRatio: "16 / 10" }}
                >
                  <Media
                    media={p.cover}
                    sizes="(max-width: 768px) 100vw, 58vw"
                    className="transition-transform duration-[1200ms] ease-out-cine group-hover:scale-[1.03]"
                  />
                </div>
                <div className={`flex flex-col justify-end md:col-span-5 ${i % 2 ? "md:order-1 md:col-span-4" : "md:col-start-9 md:col-span-4"}`}>
                  <p className="label flex gap-3 text-fg-3">
                    <span>{String(i + 1).padStart(2, "0")}</span>
                    <span>{p.year}</span>
                    {p.status && <span className="text-ember">{p.status}</span>}
                  </p>
                  <h3 className="mt-4 text-[clamp(2rem,3.6vw,3.25rem)] font-medium leading-[0.95] tracking-[-0.035em]">{p.title}</h3>
                  <p className="mt-2 text-lg text-fg-2">{p.kicker}</p>
                  <p className="mt-6 text-fg-2 text-pretty">{p.summary}</p>
                  <ul className="mt-6 flex flex-wrap gap-2" aria-label="Technologies">
                    {p.stack.slice(0, 5).map((s) => (
                      <li key={s} className="rounded-md border border-line px-2.5 py-1 text-xs text-fg-2">
                        {s}
                      </li>
                    ))}
                  </ul>
                  <span className="mt-8 inline-flex items-center gap-2 text-sm text-fg transition-[gap] duration-500 group-hover:gap-4">
                    Voir le projet <span aria-hidden>→</span>
                  </span>
                </div>
              </Link>
            </Reveal>
          </li>
        ))}
      </ol>
    </section>
  );
}
