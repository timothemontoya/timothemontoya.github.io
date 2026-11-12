"use client";

import { type MotionValue, motion, useScroll, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/lib/use-media";

// Un effet de texte par étape du site :
// l'accueil monte lettre par lettre, « À propos » s'allume au fil du scroll, le contact se tape à la machine.
// (La salle fait sa mise au point et les projets se décodent : voir leurs composants.)

/**
 * Lettres qui montent une à une depuis sous la ligne (animation CSS « .rise », voir globals.css).
 * `delay` : attente avant la première lettre, en secondes.
 */
export function LetterRise({ text, delay = 0 }: { text: string; delay?: number }) {
  return (
    <span className="rise-line" aria-label={text}>
      {text.split("").map((ch, i) => (
        <span key={i} aria-hidden className="rise" style={{ animationDelay: `${delay + i * 0.045}s` }}>
          {ch === " " ? " " : ch}
        </span>
      ))}
    </span>
  );
}

function Word({ progress, range, children }: { progress: MotionValue<number>; range: [number, number]; children: string }) {
  const opacity = useTransform(progress, range, [0.2, 1]);
  return <motion.span style={{ opacity }}>{children} </motion.span>;
}

/** Titre dont les mots s'allument un à un à mesure qu'on défile. */
export function ScrollWords({ text, id, className }: { text: string; id?: string; className?: string }) {
  const ref = useRef<HTMLHeadingElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.9", "end 0.5"] });
  const words = text.split(" ");
  return (
    <h2 ref={ref} id={id} className={className}>
      {words.map((word, i) => (
        <Word key={i} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]}>
          {word}
        </Word>
      ))}
    </h2>
  );
}

/** Texte tapé à la machine quand il arrive à l'écran, avec un curseur qui clignote. */
export function Typewriter({ text, suffix }: { text: string; suffix?: React.ReactNode }) {
  const ref = useRef<HTMLSpanElement>(null);
  const still = useReducedMotion();
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setStarted(true);
        io.disconnect();
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!started || still) return;
    const id = setInterval(() => setCount((c) => (c >= text.length ? c : c + 1)), 70);
    return () => clearInterval(id);
  }, [started, still, text]);

  const done = still || count >= text.length;
  return (
    <span ref={ref} aria-label={text}>
      <span aria-hidden>
        {still ? text : text.slice(0, count)}
        {done && suffix}
        {!still && <span className="caret" />}
        {/* Réserve la place du texte complet : la page ne bouge pas pendant la frappe. */}
        {!done && <span className="invisible">{text.slice(count)}</span>}
      </span>
    </span>
  );
}
