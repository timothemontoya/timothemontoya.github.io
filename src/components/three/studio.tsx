"use client";

import { ContactShadows, Environment, Lightformer } from "@react-three/drei";

/**
 * Éclairage de type studio photo, entièrement local (aucune HDR téléchargée) :
 * des panneaux lumineux virtuels pour les reflets, une lumière principale colorée
 * et une ombre de contact sous l'objet.
 */
export function Studio({ keyColor = "#ffffff", shadow = true }: { keyColor?: string; shadow?: boolean }) {
  return (
    <>
      <ambientLight intensity={0.15} />
      <spotLight position={[4, 6, 4]} angle={0.4} penumbra={1} intensity={60} color={keyColor} castShadow />
      <spotLight position={[-5, 2, -4]} angle={0.5} penumbra={1} intensity={40} color="#8b7cf6" />
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={2.2} position={[0, 4, -6]} scale={[10, 3, 1]} />
        <Lightformer form="rect" intensity={1.4} color={keyColor} position={[6, 1, 0]} rotation-y={-Math.PI / 2} scale={[8, 2, 1]} />
        <Lightformer form="rect" intensity={0.8} position={[-6, 1, 1]} rotation-y={Math.PI / 2} scale={[8, 1, 1]} />
        <Lightformer form="ring" intensity={1.5} position={[0, 6, 0]} rotation-x={Math.PI / 2} scale={3} />
      </Environment>
      {shadow && <ContactShadows position={[0, -1.35, 0]} opacity={0.55} scale={8} blur={2.6} far={3} />}
    </>
  );
}
