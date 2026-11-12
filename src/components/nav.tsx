"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { site } from "@/content/site";
import { t } from "@/content/textes";
import { useReducedMotion } from "@/lib/use-media";

// Les numéros du menu (00, 01…) sont ceux affichés en tête de chaque section de l'accueil.
const items = [
  { href: "/", label: t("menu.accueil") },
  { href: "/#salle", label: t("menu.salle") },
  { href: "/#rendus", label: t("menu.rendus") },
  { href: "/#projets", label: t("menu.projets") },
  { href: "/#apropos", label: t("menu.apropos") },
  { href: "/#contact", label: t("menu.contact") },
];

const links = [
  { label: "Email", href: site.links.email ? `mailto:${site.links.email}` : "" },
  { label: "GitHub", href: site.links.github },
  { label: "LinkedIn", href: site.links.linkedin },
  { label: "ArtStation", href: site.links.artstation },
].filter((l) => l.href);

const ease = [0.2, 0.7, 0.1, 1] as const;

export function Nav() {
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  const still = useReducedMotion();

  // Échap ferme le menu et rend le focus au bouton.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      toggle.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const close = () => setOpen(false);

  return (
    <header>
      <nav aria-label="Navigation principale">
        <div className="fixed inset-x-0 top-0 z-50 bg-gradient-to-b from-ink-0 via-ink-0/70 to-transparent">
          <div className="mx-auto flex max-w-content items-center justify-between px-gutter py-5">
            <Link href="/" onClick={close} className="label text-fg" aria-label={`Accueil, ${site.name}`}>
              {site.name}
              <span className="text-ember">.</span>
            </Link>
            <div className="flex items-center gap-6 md:gap-10">
              <Link
                href="/#contact"
                onClick={close}
                className="label hidden text-fg-2 transition-colors duration-300 hover:text-fg sm:block"
              >
                {t("menu.parler")}
              </Link>
              <button
                ref={toggle}
                type="button"
                onClick={() => setOpen((o) => !o)}
                aria-expanded={open}
                aria-controls="menu-principal"
                className="label flex items-center gap-3 text-fg"
              >
                <span>{open ? t("menu.fermer") : t("menu.ouvrir")}</span>
                <span aria-hidden className="relative block size-3">
                  <span className={`absolute left-0 top-1/2 h-px w-3 bg-fg transition-transform duration-500 ${open ? "rotate-45" : "-translate-y-[3px]"}`} />
                  <span className={`absolute left-0 top-1/2 h-px w-3 bg-fg transition-transform duration-500 ${open ? "-rotate-45" : "translate-y-[3px]"}`} />
                </span>
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {open && (
            <motion.div
              id="menu-principal"
              data-lenis-prevent
              initial={{ clipPath: "inset(0 0 100% 0)" }}
              animate={{ clipPath: "inset(0 0 0% 0)" }}
              exit={{ clipPath: "inset(0 0 100% 0)" }}
              transition={{ duration: still ? 0 : 0.7, ease }}
              className="fixed inset-0 z-40 flex flex-col overflow-y-auto bg-ink-0"
            >
              <div className="relative mx-auto flex w-full max-w-content flex-1 flex-col justify-between gap-12 px-gutter pb-10 pt-28">
                <ul className="border-b border-line">
                  {items.map((item, i) => (
                    <motion.li
                      key={item.href}
                      initial={{ opacity: 0, y: still ? 0 : 28 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: still ? 0 : 0.7, delay: still ? 0 : 0.15 + i * 0.06, ease }}
                      className="border-t border-line"
                    >
                      <Link href={item.href} onClick={close} className="group flex items-baseline justify-between gap-6 py-3">
                        <span className="text-[clamp(2.5rem,6.5vw,5rem)] font-medium lowercase leading-[1.05] tracking-[-0.045em] transition-[color,padding] duration-500 group-hover:pl-3 group-hover:text-ember">
                          {item.label}
                        </span>
                        <span className="dots text-base text-fg-3 md:text-xl">{String(i).padStart(2, "0")}</span>
                      </Link>
                    </motion.li>
                  ))}
                </ul>
                <ul className="label flex flex-wrap gap-x-10 gap-y-4 text-fg-2">
                  {links.map((l) => (
                    <li key={l.label}>
                      <a
                        href={l.href}
                        target={l.href.startsWith("mailto:") ? undefined : "_blank"}
                        rel="noreferrer"
                        className="transition-colors duration-300 hover:text-fg"
                      >
                        <span aria-hidden className="text-fg-3">&gt; </span>
                        {l.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}
