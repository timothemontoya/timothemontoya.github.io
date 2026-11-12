import { AboutSection } from "@/components/about-section";
import { ContactSection } from "@/components/contact-section";
import { Hero } from "@/components/hero";
import { ProjectionRoom } from "@/components/projection-room";
import { ProjectsSection } from "@/components/projects-section";
import { RenderGallery } from "@/components/render-gallery";
import { SectionRail } from "@/components/section-rail";
import { t } from "@/content/textes";

export default function Home() {
  return (
    <>
      <SectionRail />
      <Hero />
      <section id="salle" aria-labelledby="salle-titre" data-snap>
        <ProjectionRoom
          heading={{
            id: "salle-titre",
            index: "01",
            kicker: t("salle.etiquette"),
            title: t("salle.titre"),
            text: t("salle.texte"),
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
