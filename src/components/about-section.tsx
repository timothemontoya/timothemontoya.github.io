import { site } from "@/content/site";
import { list, numbered, t } from "@/content/textes";
import { Reveal } from "./reveal";

// Parcours et outils : [apropos.parcoursN.…] et [apropos.outilsN.…] dans TEXTES.txt.
// Pour ajouter une ligne, il suffit d'ajouter les balises avec le numéro suivant.
const path = numbered("apropos.parcours", "quand").map((i) => ({
  when: t(`apropos.parcours${i}.quand`),
  what: t(`apropos.parcours${i}.ou`),
  detail: t(`apropos.parcours${i}.detail`),
}));

const toolbox = numbered("apropos.outils", "groupe").map((i) => ({
  group: t(`apropos.outils${i}.groupe`),
  items: list(`apropos.outils${i}.liste`),
}));

export function AboutSection() {
  return (
    <section data-snap aria-labelledby="apropos-titre" className="border-t border-line">
      <div className="mx-auto grid max-w-content gap-16 px-gutter py-32 md:grid-cols-12 md:py-48">
        <Reveal className="md:col-span-7">
          <p className="label text-fg-3">{t("apropos.etiquette")}</p>
          <h2 id="apropos-titre" className="mt-6 text-[clamp(1.75rem,3.4vw,3rem)] font-medium leading-[1.05] tracking-[-0.03em] text-pretty">
            {site.pitch}
          </h2>
          <p className="mt-8 max-w-xl text-fg-2 text-pretty">
            {t("apropos.texte")}
          </p>
        </Reveal>

        <div className="flex flex-col gap-14 md:col-span-4 md:col-start-9">
          <Reveal delay={0.1}>
            <p className="label text-fg-3">{t("apropos.parcours.titre")}</p>
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
            <p className="label text-fg-3">{t("apropos.outils.titre")}</p>
            <dl className="mt-6 flex flex-col gap-5">
              {toolbox.map((tool) => (
                <div key={tool.group}>
                  <dt className="text-sm text-fg-3">{tool.group}</dt>
                  <dd className="mt-1 text-fg-2">{tool.items.join(" · ")}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
