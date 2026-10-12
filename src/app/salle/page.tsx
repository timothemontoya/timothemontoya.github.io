import type { Metadata } from "next";
import { ProjectionRoom } from "@/components/projection-room";

export const metadata: Metadata = {
  title: "Salle de projection",
  description: "Mes modèles 3D en temps réel : choisis-en un et fais-le tourner.",
};

export default function SallePage() {
  return <ProjectionRoom />;
}
