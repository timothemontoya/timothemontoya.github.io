import { AboutSection } from "@/components/about-section";
import { ContactSection } from "@/components/contact-section";
import { Hero } from "@/components/hero";
import { ProjectionRoom } from "@/components/projection-room";
import { ProjectsSection } from "@/components/projects-section";
import { RenderGallery } from "@/components/render-gallery";

export default function Home() {
  return (
    <>
      <Hero />
      <section id="salle" aria-labelledby="salle-titre" data-snap>
        <ProjectionRoom
          heading={{
            id: "salle-titre",
            kicker: "Temps réel",
            title: "Salle de projection",
            text: "Mes modèles Blender, chargés directement dans le navigateur. Choisis-en un, attrape-le, fais-le tourner.",
          }}
        />
      </section>
      <RenderGallery />
      <ProjectsSection />
      <AboutSection />
      <ContactSection />
    </>
  );
}
