import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ContactSection } from "@/components/contact-section";
import { Game2048 } from "@/components/game-2048";
import { Media } from "@/components/media";
import { Reveal } from "@/components/reveal";
import { getProject, projects } from "@/content/projects";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/projets/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const p = getProject(slug);
  return p ? { title: p.title, description: p.summary } : {};
}

export default function ProjectPage({ params }: PageProps<"/projets/[slug]">) {
  // Les params sont lus sous Suspense : Next.js peut servir la coquille de page instantanément.
  return (
    <Suspense fallback={<div className="h-dvh" />}>
      <Project params={params} />
    </Suspense>
  );
}

async function Project({ params }: { params: PageProps<"/projets/[slug]">["params"] }) {
  const { slug } = await params;
  const p = getProject(slug);
  if (!p) notFound();

  const i = projects.indexOf(p);
  const next = projects[(i + 1) % projects.length];

  return (
    <>
      <article>
        <header className="mx-auto max-w-content px-gutter pb-16 pt-36 md:pt-48">
          <Reveal>
            <Link href="/#projets" className="label text-fg-3 transition-colors hover:text-fg">
              ← Projets
            </Link>
            <p className="label mt-10 flex gap-3 text-fg-3">
              <span>{p.year}</span>
              {p.status && <span className="text-ember">{p.status}</span>}
            </p>
            <h1 className="display mt-5 text-[clamp(3rem,10vw,9rem)]">{p.title}</h1>
            <p className="mt-6 text-[clamp(1.25rem,2vw,1.75rem)] tracking-[-0.02em] text-fg-2">{p.kicker}</p>
          </Reveal>
        </header>

        <Reveal className="mx-auto max-w-content px-gutter">
          <div className="relative overflow-hidden rounded-[10px] bg-ink-1" style={{ aspectRatio: String(Math.max(p.cover.ratio, 16 / 10)) }}>
            <Media media={p.cover} priority sizes="(max-width: 1600px) 100vw, 1600px" />
          </div>
        </Reveal>

        <div className="mx-auto grid max-w-content gap-12 px-gutter py-24 md:grid-cols-12 md:py-32">
          <Reveal className="md:col-span-7">
            <p className="text-[clamp(1.375rem,2.4vw,2rem)] leading-[1.25] tracking-[-0.02em] text-pretty">{p.summary}</p>
          </Reveal>
          <Reveal delay={0.1} className="md:col-span-4 md:col-start-9">
            <dl className="flex flex-col gap-6">
              <div className="border-t border-line pt-4">
                <dt className="label text-fg-3">Rôle</dt>
                <dd className="mt-2 text-fg-2">{p.role}</dd>
              </div>
              <div className="border-t border-line pt-4">
                <dt className="label text-fg-3">Technologies</dt>
                <dd className="mt-2 text-fg-2">{p.stack.join(" · ")}</dd>
              </div>
            </dl>
          </Reveal>
        </div>

        <div className="mx-auto max-w-content px-gutter">
          <dl className="grid gap-px overflow-hidden rounded-[10px] border border-line bg-line sm:grid-cols-3">
            {p.facts.map((f) => (
              <div key={f.label} className="bg-ink-0 p-8">
                <dt className="sr-only">{f.label}</dt>
                <dd>
                  <span className="block text-[clamp(2.5rem,5vw,4.5rem)] font-medium leading-none tracking-[-0.04em]">{f.value}</span>
                  <span className="mt-4 block text-sm text-fg-2">{f.label}</span>
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="mx-auto flex max-w-content flex-col gap-24 px-gutter py-32 md:gap-40">
          {p.sections.map((s, k) => (
            <section key={s.title} className="grid gap-10 md:grid-cols-12">
              <Reveal className={s.media || s.demo ? "md:col-span-4" : "md:col-span-7"}>
                <p className="label text-fg-3">{String(k + 1).padStart(2, "0")}</p>
                <h2 className="mt-4 text-[clamp(1.75rem,3vw,2.75rem)] font-medium leading-[1] tracking-[-0.03em]">{s.title}</h2>
                <p className="mt-6 text-fg-2 text-pretty">{s.body}</p>
              </Reveal>
              {s.demo === "2048" && (
                <Reveal delay={0.1} className="md:col-span-7 md:col-start-6">
                  <Game2048 />
                </Reveal>
              )}
              {s.media && (
                <Reveal delay={0.1} className="md:col-span-7 md:col-start-6">
                  <div className="relative overflow-hidden rounded-[10px] bg-white" style={{ aspectRatio: String(s.media.ratio) }}>
                    <Media media={s.media} sizes="(max-width: 768px) 100vw, 58vw" className="object-contain" />
                  </div>
                </Reveal>
              )}
            </section>
          ))}
        </div>

        <Link href={`/projets/${next.slug}`} className="group block border-t border-line">
          <div className="mx-auto flex max-w-content items-end justify-between gap-8 px-gutter py-20 md:py-28">
            <div>
              <p className="label text-fg-3">Projet suivant</p>
              <p className="display mt-4 text-[clamp(2.5rem,7vw,6rem)] transition-colors duration-500 group-hover:text-ember">{next.title}</p>
            </div>
            <span aria-hidden className="text-4xl text-fg-3 transition-transform duration-500 group-hover:translate-x-2">→</span>
          </div>
        </Link>
      </article>
      <ContactSection />
    </>
  );
}
