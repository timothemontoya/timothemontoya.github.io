import type { Metadata, Viewport } from "next";
import { Doto, Geist, Geist_Mono } from "next/font/google";
import { Backdrop } from "@/components/backdrop";
import { Nav } from "@/components/nav";
import { Preloader } from "@/components/preloader";
import { SmoothScroll } from "@/components/smooth-scroll";
import { site } from "@/content/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Police à points pour les numéros et les très courts libellés (classe « dots »).
const doto = Doto({
  variable: "--font-doto",
  subsets: ["latin"],
  axes: ["ROND"],
});

export const metadata: Metadata = {
  title: { default: `${site.name} · ${site.role}`, template: `%s · ${site.name}` },
  description: site.pitch,
};

export const viewport: Viewport = {
  themeColor: "#f4f0e7",
  colorScheme: "light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={`${geistSans.variable} ${geistMono.variable} ${doto.variable} antialiased`}>
      <body className="min-h-dvh">
        <Backdrop />
        <Preloader />
        <a href="#contenu" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded focus:bg-fg focus:px-3 focus:py-2 focus:text-ink-0">
          Aller au contenu
        </a>
        <SmoothScroll>
          <Nav />
          <main id="contenu">{children}</main>
        </SmoothScroll>
      </body>
    </html>
  );
}
