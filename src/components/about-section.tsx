import { site } from "@/content/site";
import { Reveal } from "./reveal";

const path = [
  { when: "Aujourd'hui", what: "ENSEEIHT, Toulouse", detail: "Cycle ingénieur Sciences du Numérique" },
  { when: "Avant", what: "Classe préparatoire scientifique", detail: "Thiers, Marseille. Maths, physique, algorithmique" },
];

const toolbox = [
  { group: "Langages", items: ["Java", "C", "TypeScript", "Python", "Rust", "SQL", "Bash"] },
  { group: "Web & apps", items: ["React", "Next.js", "Tauri", "Supabase", "Vercel"] },
  { group: "3D", items: ["Blender", "Modélisation", "Shading", "Éclairage", "Rendu", "Three.js"] },
];

export function AboutSection() {
  return (
    <section data-snap aria-labelledby="apropos-titre" className="border-t border-line">
      <div className="mx-auto grid max-w-content gap-16 px-gutter py-32 md:grid-cols-12 md:py-48">
        <Reveal className="md:col-span-7">
          <p className="label text-fg-3">À propos</p>
          <h2 id="apropos-titre" className="mt-6 text-[clamp(1.75rem,3.4vw,3rem)] font-medium leading-[1.05] tracking-[-0.03em] text-pretty">
            {site.pitch}
          </h2>
          <p className="mt-8 max-w-xl text-fg-2 text-pretty">
            En dehors du code : musique, jeux vidéo et beaucoup d&apos;heures dans Blender. C&apos;est souvent de là que viennent les idées de projets.
          </p>
        </Reveal>

        <div className="flex flex-col gap-14 md:col-span-4 md:col-start-9">
          <Reveal delay={0.1}>
            <p className="label text-fg-3">Parcours</p>
            <ol className="mt-6 flex flex-col">
              {path.map((p) => (
                <li key={p.what} className="border-t border-line py-5">
                  <p className="label text-fg-3">{p.when}</p>
                  <p className="mt-2 text-lg font-medium tracking-[-0.02em]">{p.what}</p>
                  <p className="mt-1 text-sm text-fg-2">{p.detail}</p>
                </li>
              ))}
            </ol>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="label text-fg-3">Outils</p>
            <dl className="mt-6 flex flex-col gap-5">
              {toolbox.map((t) => (
                <div key={t.group}>
                  <dt className="text-sm text-fg-3">{t.group}</dt>
                  <dd className="mt-1 text-fg-2">{t.items.join(" · ")}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
