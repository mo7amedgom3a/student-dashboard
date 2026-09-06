"use client";

import { useEffect, useRef } from "react";
import { useAppStore } from "@/lib/store";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vrot: number;
  size: number;
  color: string;
  shape: "rect" | "circle";
  life: number;
}

const COLORS = [
  "#a617e8", // neon-violet-500 (brand)
  "#9d40bf", // thistle-500
  "#a71ce3", // mauve-magic-500
  "#a616e9", // hyper-magenta-500
  "#1e7f45", // success green
  "#f5c518", // gold
  "#ec4899", // pink accent
];

/**
 * Canvas-based confetti overlay. Subscribes to `confettiToken` in the store —
 * any time it changes, fire a fresh burst. The canvas is always mounted but
 * transparent unless particles are in flight, so no state-driven mount/unmount
 * is needed (keeps the effect body side-effect free of setState).
 */
export function ConfettiOverlay() {
  const token = useAppStore((s) => s.confettiToken);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number | null>(null);

  // Resize canvas to viewport on mount.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  // Fire a burst whenever the confetti token changes.
  useEffect(() => {
    if (token === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const w = canvas.width;
    const count = 160;
    const newParticles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 6 + Math.random() * 10;
      newParticles.push({
        x: w / 2 + (Math.random() - 0.5) * 200,
        y: window.innerHeight * 0.35 + (Math.random() - 0.5) * 80,
        vx: Math.cos(angle) * speed * 0.7,
        vy: Math.sin(angle) * speed - 8,
        rot: Math.random() * Math.PI,
        vrot: (Math.random() - 0.5) * 0.3,
        size: 6 + Math.random() * 8,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        shape: Math.random() > 0.5 ? "rect" : "circle",
        life: 1,
      });
    }
    particlesRef.current = [...particlesRef.current, ...newParticles];

    const step = () => {
      const c = canvasRef.current;
      if (!c) return;
      const ctx = c.getContext("2d");
      if (!ctx) return;
      const cw = c.width;
      const ch = c.height;
      ctx.clearRect(0, 0, cw, ch);
      const gravity = 0.28;
      const drag = 0.992;
      const ps = particlesRef.current;
      for (const p of ps) {
        p.vy += gravity;
        p.vx *= drag;
        p.vy *= drag;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vrot;
        p.life -= 0.006;
        if (p.life <= 0) continue;
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        if (p.shape === "rect") {
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
      particlesRef.current = ps.filter((p) => p.life > 0 && p.y < ch + 60);
      if (particlesRef.current.length > 0) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        rafRef.current = null;
      }
    };

    if (rafRef.current == null) {
      rafRef.current = requestAnimationFrame(step);
    }
  }, [token]);

  useEffect(() => {
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-[200] pointer-events-none"
      aria-hidden="true"
    />
  );
}
