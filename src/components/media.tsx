import Image from "next/image";
import type { Media as MediaType } from "@/content/projects";
import { cn } from "@/lib/utils";
import { AnomalyCloud } from "./three/anomaly-cloud";
import { asset } from "@/lib/asset";

export function Media({ media, className, sizes = "100vw", priority }: { media: MediaType; className?: string; sizes?: string; priority?: boolean }) {
  if (media.type === "scene") {
    return <AnomalyCloud label={media.alt} />;
  }
  if (media.type === "video") {
    return (
      <video
        src={asset(media.src)}
        aria-label={media.alt}
        className={cn("h-full w-full object-cover", className)}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
      />
    );
  }
  return (
    <Image
      src={asset(media.src)}
      alt={media.alt}
      fill
      sizes={sizes}
      priority={priority}
      // Pixel art : pas de redimensionnement lissé, pixels nets.
      unoptimized={media.pixel}
      style={media.pixel ? { imageRendering: "pixelated" } : undefined}
      className={cn(media.fit === "contain" ? "object-contain p-[12%]" : "object-cover", className)}
    />
  );
}
