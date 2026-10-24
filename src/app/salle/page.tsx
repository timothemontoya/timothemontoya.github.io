import type { Metadata } from "next";
import { ProjectionRoom } from "@/components/projection-room";
import { t } from "@/content/textes";

export const metadata: Metadata = {
  title: t("salle.titre"),
  description: t("salle.texte"),
};

export default function SallePage() {
  return <ProjectionRoom />;
}
