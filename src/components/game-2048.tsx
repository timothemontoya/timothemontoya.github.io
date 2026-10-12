"use client";

import { AnimatePresence, motion } from "motion/react";
import { useCallback, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type Grid = number[][];
type Dir = "left" | "right" | "up" | "down";

const empty = (): Grid => Array.from({ length: 4 }, () => [0, 0, 0, 0]);

/** Grille de départ fixe : identique côté serveur et navigateur (pas de hasard au premier rendu). */
const start = (): Grid => [
  [0, 0, 0, 0],
  [0, 2, 0, 0],
  [0, 0, 0, 0],
  [0, 0, 2, 0],
];

/** Comme dans le code Python d'origine : 40 % de chances de tirer un 4. */
function spawn(grid: Grid): Grid {
  const free: [number, number][] = [];
  grid.forEach((row, y) => row.forEach((v, x) => v === 0 && free.push([y, x])));
  if (!free.length) return grid;
  const [y, x] = free[Math.floor(Math.random() * free.length)];
  const next = grid.map((r) => [...r]);
  next[y][x] = Math.random() < 2 / 5 ? 4 : 2;
  return next;
}

/** Fait glisser une ligne vers la gauche en fusionnant les paires. */
function slide(row: number[]): { row: number[]; gained: number } {
  const values = row.filter(Boolean);
  const out: number[] = [];
  let gained = 0;
  for (let i = 0; i < values.length; i++) {
    if (values[i] === values[i + 1]) {
      out.push(values[i] * 2);
      gained += values[i] * 2;
      i++;
    } else out.push(values[i]);
  }
  while (out.length < 4) out.push(0);
  return { row: out, gained };
}

const transpose = (g: Grid) => g[0].map((_, x) => g.map((row) => row[x]));

function move(grid: Grid, dir: Dir): { grid: Grid; gained: number; moved: boolean } {
  let g = dir === "up" || dir === "down" ? transpose(grid) : grid.map((r) => [...r]);
  const reverse = dir === "right" || dir === "down";
  let gained = 0;
  g = g.map((row) => {
    const r = slide(reverse ? [...row].reverse() : row);
    gained += r.gained;
    return reverse ? r.row.reverse() : r.row;
  });
  if (dir === "up" || dir === "down") g = transpose(g);
  const moved = g.some((row, y) => row.some((v, x) => v !== grid[y][x]));
  return { grid: g, gained, moved };
}

const stuck = (g: Grid) => (["left", "right", "up", "down"] as Dir[]).every((d) => !move(g, d).moved);

const tone: Record<number, string> = {
  2: "bg-ink-2 text-fg",
  4: "bg-[#24222a] text-fg",
  8: "bg-[#5a3220] text-fg",
  16: "bg-[#7a3a1e] text-fg",
  32: "bg-[#a2461f] text-fg",
  64: "bg-[#c95320] text-fg",
  128: "bg-[#ff7a3d] text-ink-0",
  256: "bg-[#ff9a5e] text-ink-0",
  512: "bg-[#ffb47f] text-ink-0",
  1024: "bg-[#ffd0a6] text-ink-0",
  2048: "bg-fg text-ink-0",
};

const keys: Record<string, Dir> = {
  ArrowLeft: "left", ArrowRight: "right", ArrowUp: "up", ArrowDown: "down",
  q: "left", d: "right", z: "up", s: "down",
};

export function Game2048() {
  const [grid, setGrid] = useState<Grid>(start);
  const [score, setScore] = useState(0);
  const [over, setOver] = useState(false);
  const board = useRef<HTMLDivElement>(null);
  const touch = useRef<{ x: number; y: number } | null>(null);

  const reset = useCallback(() => {
    setGrid(spawn(spawn(empty())));
    setScore(0);
    setOver(false);
  }, []);

  const play = useCallback(
    (dir: Dir) => {
      if (over) return;
      const r = move(grid, dir);
      if (!r.moved) return;
      const next = spawn(r.grid);
      setGrid(next);
      setScore((s) => s + r.gained);
      if (stuck(next)) setOver(true);
    },
    [grid, over],
  );

  const onKey = (e: React.KeyboardEvent) => {
    const dir = keys[e.key];
    if (!dir) return;
    e.preventDefault();
    play(dir);
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touch.current) return;
    const dx = e.changedTouches[0].clientX - touch.current.x;
    const dy = e.changedTouches[0].clientY - touch.current.y;
    touch.current = null;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return;
    play(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : dy > 0 ? "down" : "up");
  };

  const best = Math.max(...grid.flat());

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="mb-4 flex items-end justify-between">
        <div className="label text-fg-3">
          Score <span className="ml-2 text-fg">{score}</span>
        </div>
        <button type="button" onClick={reset} className="label rounded-md border border-line px-3 py-2 text-fg-2 transition-colors hover:border-fg-3 hover:text-fg">
          Nouvelle partie
        </button>
      </div>
      <div
        ref={board}
        tabIndex={0}
        role="application"
        aria-label={`Plateau du 2048. Utilise les flèches ou ZQSD. Plus grande tuile : ${best}.`}
        onKeyDown={onKey}
        onTouchStart={(e) => (touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY })}
        onTouchEnd={onTouchEnd}
        onClick={() => board.current?.focus()}
        data-lenis-prevent
        className="relative grid touch-none select-none grid-cols-4 gap-2 rounded-[14px] border border-line bg-ink-1 p-2 outline-none focus-visible:border-ember"
      >
        {grid.flat().map((v, i) => (
          <div key={i} className="relative aspect-square rounded-[8px] bg-ink-0/70">
            <AnimatePresence>
              {v > 0 && (
                <motion.div
                  key={`${i}-${v}`}
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.18, ease: [0.2, 0.7, 0.1, 1] }}
                  className={cn(
                    "absolute inset-0 grid place-items-center rounded-[8px] font-medium tracking-[-0.03em]",
                    v >= 1024 ? "text-xl md:text-2xl" : "text-2xl md:text-3xl",
                    tone[v] ?? "bg-fg text-ink-0",
                  )}
                >
                  {v}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
        {over && (
          <div className="absolute inset-0 grid place-items-center rounded-[14px] bg-ink-0/80 backdrop-blur-sm">
            <div className="text-center">
              <p className="text-2xl font-medium tracking-[-0.03em]">{best >= 2048 ? "2048 !" : "Perdu"}</p>
              <button type="button" onClick={reset} className="mt-4 rounded-md bg-fg px-4 py-2 text-sm text-ink-0">
                Rejouer
              </button>
            </div>
          </div>
        )}
      </div>
      <p className="label mt-4 text-center text-fg-3">Clique sur le plateau · flèches, ZQSD ou glisser</p>
    </div>
  );
}
