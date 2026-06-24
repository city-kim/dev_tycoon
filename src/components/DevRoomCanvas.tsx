import { useEffect, useRef } from "react";
import { sim } from "../store/gameStore";
import { onCodeBurst } from "../store/fx";
import { DEVS } from "../game/content/devs";
import { BALANCE as B } from "../game/config/balanceConfig";

/**
 * 개발실 — 채용한 개발자 이모지가 캔버스 안을 날아다니는 파티클 효과.
 *  - 채용 수만큼 직군 이모지 파티클 (상위 티어일수록 큼)
 *  - 부채가 임계치를 넘으면 🐛 버그 이모지가 섞여 날아다님 (심할수록 많이)
 *  - 코드 짜기 클릭 시 ⚡ 스파크가 튀고 기존 파티클이 출렁임
 *
 * View-layer only: a self-contained rAF reads sim directly each frame (no
 * React re-render), capped for performance (.claude/rules/game/juice.md).
 */
const PER_TYPE_CAP = 18;
const TOTAL_CAP = 70;
const BUG_CAP = 18;
const HEIGHT = 150;
const BUG = DEVS.length; // virtual type index for 🐛
const SPARKS = ["⚡", "✨", "💥"];

interface Particle {
  kind: "dev" | "bug" | "spark";
  type: number; // dev index, or BUG; sparks ignore this
  emoji: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  angle: number;
  spin: number;
  life?: number; // sparks only: remaining seconds
  maxLife?: number;
}

/** 직군별 목표 파티클 수 (캡 적용). */
function desiredDevCounts(): number[] {
  const raw = DEVS.map((d) => Math.min(sim.devs[d.id] ?? 0, PER_TYPE_CAP));
  const total = raw.reduce((a, b) => a + b, 0);
  if (total > TOTAL_CAP) {
    const scale = TOTAL_CAP / total;
    return raw.map((n) => Math.floor(n * scale));
  }
  return raw;
}

/** 부채 심각도에 따른 🐛 목표 수. */
function desiredBugCount(): number {
  if (sim.debt <= B.DEBT_SOFTCAP) return 0;
  const severity = sim.debt / B.DEBT_SOFTCAP - 1; // 0+
  return Math.min(Math.floor(severity * 4) + 1, BUG_CAP);
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

    const resize = () => {
      w = canvas.clientWidth;
      h = canvas.clientHeight || HEIGHT;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const particles: Particle[] = [];
    const rand = (a: number, b: number) => a + Math.random() * (b - a);

    const make = (kind: Particle["kind"], type: number): Particle => {
      const speed = reduceMotion ? 0 : rand(14, 42);
      const dir = rand(0, Math.PI * 2);
      const emoji = kind === "bug" ? "🐛" : DEVS[type].emo;
      return {
        kind,
        type,
        emoji,
        x: rand(20, Math.max(40, w - 20)),
        y: rand(20, Math.max(40, h - 20)),
        vx: Math.cos(dir) * speed,
        vy: Math.sin(dir) * speed,
        size: kind === "bug" ? 18 : 16 + type * 3,
        angle: rand(-0.3, 0.3),
        spin: reduceMotion ? 0 : rand(-0.6, 0.6),
      };
    };

    /** dev/bug 파티클 수를 목표치에 맞춘다 (sparks는 건드리지 않음). */
    const reconcile = () => {
      const wantDev = desiredDevCounts();
      const wantBug = desiredBugCount();
      const haveDev = new Array(DEVS.length).fill(0);
      let haveBug = 0;
      for (const p of particles) {
        if (p.kind === "dev") haveDev[p.type]++;
        else if (p.kind === "bug") haveBug++;
      }
      for (let t = 0; t < DEVS.length; t++) {
        while (haveDev[t] < wantDev[t]) {
          particles.push(make("dev", t));
          haveDev[t]++;
        }
        if (haveDev[t] > wantDev[t]) removeSome("dev", t, haveDev[t] - wantDev[t]);
      }
      while (haveBug < wantBug) {
        particles.push(make("bug", BUG));
        haveBug++;
      }
      if (haveBug > wantBug) removeSome("bug", BUG, haveBug - wantBug);
    };

    const removeSome = (kind: Particle["kind"], type: number, n: number) => {
      let excess = n;
      for (let i = particles.length - 1; i >= 0 && excess > 0; i--) {
        const p = particles[i];
        if (p.kind === kind && (kind === "bug" || p.type === type)) {
          particles.splice(i, 1);
          excess--;
        }
      }
    };

    /** 코드 클릭: ⚡ 스파크 분출 + 기존 파티클에 임펄스. */
    const burst = () => {
      if (reduceMotion) return;
      const cx = rand(w * 0.3, w * 0.7);
      const cy = rand(h * 0.3, h * 0.7);
      for (let i = 0; i < 4; i++) {
        const dir = rand(0, Math.PI * 2);
        const speed = rand(60, 140);
        particles.push({
          kind: "spark",
          type: -1,
          emoji: SPARKS[Math.floor(rand(0, SPARKS.length))],
          x: cx,
          y: cy,
          vx: Math.cos(dir) * speed,
          vy: Math.sin(dir) * speed,
          size: rand(12, 18),
          angle: rand(-0.5, 0.5),
          spin: rand(-3, 3),
          life: 0.7,
          maxLife: 0.7,
        });
      }
      // 기존 파티클 출렁임
      for (const p of particles) {
        if (p.kind === "spark") continue;
        p.vx += rand(-30, 30);
        p.vy += rand(-30, 30);
      }
    };
    const offBurst = onCodeBurst(burst);

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

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];

        if (p.kind === "spark") {
          p.life! -= dt;
          if (p.life! <= 0) {
            particles.splice(i, 1);
            continue;
          }
          p.vx *= 0.94; // 감쇠
          p.vy *= 0.94;
        }

        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.angle += p.spin * dt;

        const r = p.size * 0.6;
        if (p.kind !== "spark") {
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
          // dev 파티클이 클릭 임펄스로 과속하면 서서히 진정
          p.vx *= 0.995;
          p.vy *= 0.995;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.globalAlpha = p.kind === "spark" ? Math.max(0, p.life! / p.maxLife!) : 1;
        ctx.font = `${p.size}px var(--sans), sans-serif`;
        ctx.fillText(p.emoji, 0, 0);
        ctx.restore();
      }

      if (hintRef.current) {
        const empty = !particles.some((p) => p.kind !== "spark");
        hintRef.current.style.display = empty ? "flex" : "none";
      }

      raf = requestAnimationFrame(frame);
    };
    reconcile();
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      offBurst();
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
