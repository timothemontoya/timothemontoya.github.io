"use client";

import { useEffect, useRef } from "react";
import { useInView } from "@/lib/use-in-view";
import { useReducedMotion } from "@/lib/use-media";

// Recul de la R-301, balle par balle : déplacement du viseur (x, y) et instant du tir (ms).
// Mesures en jeu du projet open source apex-recoil (licence Apache 2.0), celles qu'utilise Aimpex.
const X = [0, 12.5, 11.4, 25.7, 24.2, 26.7, 26.2, 30.0, 36.9, 46.7, 59.5, 65.3, 55.8, 43.5, 30.7, 17.0, 5.0, -4.6, -7.6, -1.2, 9.2, 21.2, 31.1, 43.0, 51.6, 59.6, 65.9, 67.6, 67.8, 71.4, 75.6];
const Y = [0, -26.3, -61.7, -86.0, -113.6, -136.2, -150.7, -161.9, -167.5, -175.6, -172.3, -182.4, -199.3, -213.7, -224.6, -227.4, -226.5, -226.7, -237.6, -246.4, -256.2, -259.1, -266.2, -262.7, -261.4, -260.3, -266.5, -272.6, -280.8, -288.8, -294.5];
const T = [0, 74, 148, 222, 296, 370, 444, 518, 592, 666, 740, 814, 888, 962, 1037, 1111, 1185, 1259, 1333, 1407, 1481, 1555, 1629, 1703, 1777, 1851, 1925, 2000, 2074, 2148, 2222];

/** Le chargeur est joué au ralenti, comme dans le mode d'apprentissage de l'appli. */
const SLOW = 2.4;
/** Pause sur le motif complet avant de recommencer (ms). */
const HOLD = 2200;
const SPAN = 295;
const BULLET = "#c9d0ff";
const MOUSE = "#cf6bff";

/**
 * Couverture animée d'Aimpex : à gauche les balles partent comme en jeu,
 * à droite le trajet que la souris doit faire pour les garder sur la cible.
 */
export function RecoilScene({ label }: { label: string }) {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const counter = useRef<HTMLSpanElement>(null);
  const visible = useInView(wrap);
  const still = useReducedMotion();

  useEffect(() => {
    const c = canvas.current;
    const ctx = c?.getContext("2d");
    if (!c || !ctx || !visible) return;
    let raf = 0;
    const start = performance.now();
    const last = T[T.length - 1];

    const draw = (now: number) => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = c.clientWidth;
      const h = c.clientHeight;
      if (c.width !== Math.round(w * dpr) || c.height !== Math.round(h * dpr)) {
        c.width = Math.round(w * dpr);
        c.height = Math.round(h * dpr);
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      // Temps « de jeu » écoulé dans le chargeur, et nombre de balles déjà tirées.
      const time = still ? last : Math.min(last, ((now - start) % (last * SLOW + HOLD)) / SLOW);
      let n = 0;
      while (n < T.length - 1 && T[n + 1] <= time) n++;
      const k = n < T.length - 1 ? (time - T[n]) / (T[n + 1] - T[n]) : 0;
      if (counter.current) counter.current.textContent = `${String(n + 1).padStart(2, "0")} / ${T.length}`;

      const s = (h * 0.6) / SPAN;
      const cell = Math.max(28, h / 9);

      // Quadrillage, comme le stand de tir de l'appli.
      ctx.strokeStyle = "rgba(242, 242, 240, 0.045)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = (w / 2) % cell; x < w; x += cell) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
      }
      for (let y = (h / 2) % cell; y < h; y += cell) {
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
      }
      ctx.stroke();

      // À gauche : les impacts montent. À droite : la souris descend d'autant.
      const ax = w * 0.27 - 35 * s;
      const ay = h * 0.82;
      const bx = w * 0.73 + 35 * s;
      const by = h * 0.2;

      const cross = (x: number, y: number) => {
        ctx.strokeStyle = "rgba(242, 242, 240, 0.35)";
        ctx.beginPath();
        ctx.moveTo(x - 9, y);
        ctx.lineTo(x + 9, y);
        ctx.moveTo(x, y - 9);
        ctx.lineTo(x, y + 9);
        ctx.stroke();
      };
      cross(ax, ay);
      cross(bx, by);

      // Fil qui relie les impacts.
      ctx.strokeStyle = "rgba(201, 208, 255, 0.22)";
      ctx.beginPath();
      for (let i = 0; i <= n; i++) ctx[i ? "lineTo" : "moveTo"](ax + X[i] * s, ay + Y[i] * s);
      ctx.stroke();

      // Impacts : le dernier tiré est plus gros et s'éteint peu à peu.
      for (let i = 0; i <= n; i++) {
        const fresh = i === n && !still ? 1 - k : 0;
        ctx.fillStyle = BULLET;
        ctx.globalAlpha = 0.55 + 0.45 * (i / T.length);
        ctx.beginPath();
        ctx.arc(ax + X[i] * s, ay + Y[i] * s, 2.6 + fresh * 3.4, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Trajet de la souris : l'opposé du recul, tracé en continu.
      const hx = n < T.length - 1 ? X[n] + (X[n + 1] - X[n]) * k : X[n];
      const hy = n < T.length - 1 ? Y[n] + (Y[n + 1] - Y[n]) * k : Y[n];
      ctx.strokeStyle = MOUSE;
      ctx.lineWidth = 2;
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(bx, by);
      for (let i = 1; i <= n; i++) ctx.lineTo(bx - X[i] * s, by - Y[i] * s);
      ctx.lineTo(bx - hx * s, by - hy * s);
      ctx.stroke();
      ctx.fillStyle = MOUSE;
      ctx.beginPath();
      ctx.arc(bx - hx * s, by - hy * s, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 0.18;
      ctx.beginPath();
      ctx.arc(bx - hx * s, by - hy * s, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;

      if (!still) raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    const onResize = () => still && requestAnimationFrame(draw);
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, [visible, still]);

  return (
    <div ref={wrap} className="screen absolute inset-0 bg-[#08080a]" role="img" aria-label={label}>
      <div
        aria-hidden
        className="absolute inset-0"
        style={{ background: "radial-gradient(ellipse 45% 60% at 73% 45%, rgb(207 107 255 / 0.10), transparent 70%)" }}
      />
      <canvas ref={canvas} aria-hidden className="absolute inset-0 h-full w-full" />
      <div className="label pointer-events-none absolute inset-x-5 top-5 flex justify-between text-fg-3">
        <span>R-301</span>
        <span ref={counter} className="dots text-sm text-fg-2" />
      </div>
      <div className="label pointer-events-none absolute bottom-5 left-5 flex flex-wrap gap-x-5 gap-y-2 text-fg-2">
        <span className="flex items-center gap-2">
          <i className="size-2 rounded-full bg-[#c9d0ff]" /> Recul
        </span>
        <span className="flex items-center gap-2">
          <i className="size-2 rounded-full bg-accent" /> Souris
        </span>
      </div>
    </div>
  );
}
