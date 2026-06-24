import { useEffect, useRef } from "react";
import { sim } from "../store/gameStore";
import { DEVS } from "../game/content/devs";

/**
 * 개발실 — 채용한 개발자 이모지가 캔버스 안을 날아다니는 파티클 효과.
 *
 * View-layer only: a self-contained rAF reads the authoritative `sim.devs`
 * counts directly each frame (no React re-render) and reconciles one emoji
 * particle per hired unit, capped for performance (.claude/rules/game/juice.md).
 */
const PER_TYPE_CAP = 18; // 한 직군당 최대 파티클
const TOTAL_CAP = 70; // 전체 최대 파티클
const HEIGHT = 150;

interface Particle {
  type: number; // index into DEVS
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  angle: number;
  spin: number;
}

/** 직군별 목표 파티클 수 (캡 적용). */
function desiredCounts(): number[] {
  const raw = DEVS.map((d) => Math.min(sim.devs[d.id] ?? 0, PER_TYPE_CAP));
  const total = raw.reduce((a, b) => a + b, 0);
  if (total > TOTAL_CAP) {
    const scale = TOTAL_CAP / total;
    return raw.map((n) => Math.floor(n * scale));
  }
  return raw;
}

export function DevRoomCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    let w = 0;
    let h = HEIGHT;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      w = canvas.clientWidth;
      h = canvas.clientHeight || HEIGHT;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const particles: Particle[] = [];
    const rand = (a: number, b: number) => a + Math.random() * (b - a);

    const makeParticle = (type: number): Particle => {
      const speed = reduceMotion ? 0 : rand(14, 42);
      const dir = rand(0, Math.PI * 2);
      return {
        type,
        x: rand(20, Math.max(40, w - 20)),
        y: rand(20, Math.max(40, h - 20)),
        vx: Math.cos(dir) * speed,
        vy: Math.sin(dir) * speed,
        size: 16 + type * 3, // 상위 티어일수록 큼
        angle: rand(-0.3, 0.3),
        spin: reduceMotion ? 0 : rand(-0.6, 0.6),
      };
    };

    /** 직군별 파티클 수를 목표치에 맞춘다. */
    const reconcile = () => {
      const want = desiredCounts();
      const have = new Array(DEVS.length).fill(0);
      for (const p of particles) have[p.type]++;
      for (let t = 0; t < DEVS.length; t++) {
        while (have[t] < want[t]) {
          particles.push(makeParticle(t));
          have[t]++;
        }
        if (have[t] > want[t]) {
          let excess = have[t] - want[t];
          for (let i = particles.length - 1; i >= 0 && excess > 0; i--) {
            if (particles[i].type === t) {
              particles.splice(i, 1);
              excess--;
            }
          }
        }
      }
    };

    let raf = 0;
    let last = performance.now();
    let reconcileAcc = 0;

    const frame = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;

      reconcileAcc += dt;
      if (reconcileAcc >= 0.25) {
        reconcileAcc = 0;
        reconcile();
      }

      ctx.clearRect(0, 0, w, h);
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      for (const p of particles) {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.angle += p.spin * dt;

        const r = p.size * 0.6;
        if (p.x < r) {
          p.x = r;
          p.vx = Math.abs(p.vx);
        } else if (p.x > w - r) {
          p.x = w - r;
          p.vx = -Math.abs(p.vx);
        }
        if (p.y < r) {
          p.y = r;
          p.vy = Math.abs(p.vy);
        } else if (p.y > h - r) {
          p.y = h - r;
          p.vy = -Math.abs(p.vy);
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.font = `${p.size}px var(--sans), sans-serif`;
        ctx.fillText(DEVS[p.type].emo, 0, 0);
        ctx.restore();
      }

      if (hintRef.current) {
        hintRef.current.style.display = particles.length === 0 ? "flex" : "none";
      }

      raf = requestAnimationFrame(frame);
    };
    reconcile();
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return (
    <div className="card devroom">
      <h2>개발실</h2>
      <div className="devroom-stage">
        <canvas ref={canvasRef} className="devroom-canvas" />
        <div ref={hintRef} className="devroom-hint">
          // 개발자를 채용하면 이곳을 날아다닙니다
        </div>
      </div>
    </div>
  );
}
