import Link from "next/link";
import { t } from "@/content/textes";
import { site } from "@/content/site";

const items = [
  { href: "/#salle", label: t("menu.salle") },
  { href: "/#rendus", label: t("menu.rendus") },
  { href: "/#projets", label: t("menu.projets") },
  { href: "/#contact", label: t("menu.contact") },
];

export function Nav() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-gradient-to-b from-ink-0 via-ink-0/70 to-transparent">
      <nav aria-label="Navigation principale" className="mx-auto flex max-w-content items-center justify-between px-gutter py-5">
        <Link href="/" className="label text-fg" aria-label={`Accueil, ${site.name}`}>
          TM<span className="text-ember">.</span>
        </Link>
        <ul className="flex gap-5 text-sm text-fg-2 md:gap-8">
          {items.map((item) => (
            <li key={item.href} className={item.href === "/#rendus" ? "hidden sm:block" : undefined}>
              <Link href={item.href} className="transition-colors duration-300 hover:text-fg">
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
