import { cn } from "@/lib/utils";

/** Étiquette de section : numéro en points, filet, puis le libellé. */
export function SectionLabel({ n, children, className }: { n?: string; children: React.ReactNode; className?: string }) {
  return (
    <p className={cn("label flex items-center gap-3 text-fg-3", className)}>
      {n && (
        <>
          <span className="dots text-[0.95rem] text-fg">{n}</span>
          <span aria-hidden className="h-px w-8 bg-line" />
        </>
      )}
      <span>{children}</span>
    </p>
  );
}
