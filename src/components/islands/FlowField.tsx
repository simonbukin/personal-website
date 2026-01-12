import { useEffect, useRef } from "react";

interface Props {
  variant?: "full" | "contained";
}

// Simplex noise for angle generation
class SimplexNoise {
  private perm: number[];

  constructor(seed = Math.random()) {
    this.perm = this.buildPermutationTable(seed);
  }

  private buildPermutationTable(seed: number): number[] {
    const p: number[] = [];
    for (let i = 0; i < 256; i++) p[i] = i;
    let n = 256;
    let random = seed;
    while (n > 1) {
      random = (random * 16807) % 2147483647;
      const k = (random % n) | 0;
      n--;
      [p[n], p[k]] = [p[k], p[n]];
    }
    return [...p, ...p];
  }

  noise2D(x: number, y: number): number {
    const F2 = 0.5 * (Math.sqrt(3) - 1);
    const G2 = (3 - Math.sqrt(3)) / 6;
    const s = (x + y) * F2;
    const i = Math.floor(x + s);
    const j = Math.floor(y + s);
    const t = (i + j) * G2;
    const x0 = x - (i - t);
    const y0 = y - (j - t);
    const i1 = x0 > y0 ? 1 : 0;
    const j1 = x0 > y0 ? 0 : 1;
    const x1 = x0 - i1 + G2;
    const y1 = y0 - j1 + G2;
    const x2 = x0 - 1 + 2 * G2;
    const y2 = y0 - 1 + 2 * G2;
    const ii = i & 255;
    const jj = j & 255;
    const grad = (hash: number, gx: number, gy: number): number => {
      const h = hash & 7;
      const u = h < 4 ? gx : gy;
      const v = h < 4 ? gy : gx;
      return ((h & 1) ? -u : u) + ((h & 2) ? -2 * v : 2 * v);
    };
    let n0 = 0, n1 = 0, n2 = 0;
    let t0 = 0.5 - x0 * x0 - y0 * y0;
    if (t0 >= 0) { t0 *= t0; n0 = t0 * t0 * grad(this.perm[ii + this.perm[jj]], x0, y0); }
    let t1 = 0.5 - x1 * x1 - y1 * y1;
    if (t1 >= 0) { t1 *= t1; n1 = t1 * t1 * grad(this.perm[ii + i1 + this.perm[jj + j1]], x1, y1); }
    let t2 = 0.5 - x2 * x2 - y2 * y2;
    if (t2 >= 0) { t2 *= t2; n2 = t2 * t2 * grad(this.perm[ii + 1 + this.perm[jj + 1]], x2, y2); }
    return 70 * (n0 + n1 + n2);
  }
}

interface Particle {
  x: number;
  y: number;
  prevX: number;
  prevY: number;
  color: string;
  age: number;
  maxAge: number;
}

// Default colors
const DEFAULT_PALETTE = ["#ffffff", "#e0e0e0", "#d0d0d0"];

function parseHexColor(hex: string): { r: number; g: number; b: number } {
  const c = hex.replace("#", "");
  return {
    r: parseInt(c.slice(0, 2), 16) || 255,
    g: parseInt(c.slice(2, 4), 16) || 255,
    b: parseInt(c.slice(4, 6), 16) || 255,
  };
}

export default function FlowField({ variant = "full" }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isFullVariant = variant === "full";

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let noise = new SimplexNoise();
    let canvasWidth = 0;
    let canvasHeight = 0;
    let particles: Particle[] = [];
    let palette = [...DEFAULT_PALETTE];
    let animationId: number;
    let time = 0;

    // Parameters
    const NUM_PARTICLES = 500;
    const NOISE_SCALE = 0.003;
    const SPEED = 1.5;
    const MAX_AGE = 150;

    // Position-based opacity - fade on left
    const getPositionOpacity = (x: number): number => {
      if (!isFullVariant) return 1;
      const fadeStart = canvasWidth * 0.5;
      const fadeEnd = canvasWidth * 0.3;
      if (x > fadeStart) return 1;
      if (x < fadeEnd) return 0;
      const t = (x - fadeEnd) / (fadeStart - fadeEnd);
      return t * t * (3 - 2 * t);
    };

    // Get angle at position from noise
    const getAngleAt = (x: number, y: number): number => {
      const noiseVal = noise.noise2D(x * NOISE_SCALE + time * 0.2, y * NOISE_SCALE);
      return ((noiseVal + 1) / 2) * Math.PI * 2;
    };

    const createParticle = (): Particle => {
      // Spawn in right portion of screen
      const x = isFullVariant
        ? canvasWidth * 0.35 + Math.random() * canvasWidth * 0.65
        : Math.random() * canvasWidth;
      const y = Math.random() * canvasHeight;
      const color = palette[Math.floor(Math.random() * palette.length)];

      return {
        x,
        y,
        prevX: x,
        prevY: y,
        color,
        age: 0,
        maxAge: MAX_AGE + Math.random() * 50,
      };
    };

    const initParticles = () => {
      particles = [];
      const count = prefersReducedMotion ? 100 : NUM_PARTICLES;
      for (let i = 0; i < count; i++) {
        const p = createParticle();
        // Stagger ages so they don't all reset at once
        p.age = Math.random() * MAX_AGE * 0.5;
        particles.push(p);
      }
    };

    const handleColorChange = (e: CustomEvent<string>) => {
      const base = e.detail;
      palette = [base];
      const { r, g, b } = parseHexColor(base);
      for (let i = 1; i < 4; i++) {
        const variation = 25 * i;
        const nr = Math.min(255, Math.max(0, r + (Math.random() - 0.5) * variation));
        const ng = Math.min(255, Math.max(0, g + (Math.random() - 0.5) * variation));
        const nb = Math.min(255, Math.max(0, b + (Math.random() - 0.5) * variation));
        palette.push(`#${Math.round(nr).toString(16).padStart(2, "0")}${Math.round(ng).toString(16).padStart(2, "0")}${Math.round(nb).toString(16).padStart(2, "0")}`);
      }
    };

    const handlePaletteChange = (e: CustomEvent<string[]>) => {
      if (e.detail && e.detail.length > 0) {
        palette = [...e.detail];
      }
    };

    const handleColorReset = () => {
      palette = [...DEFAULT_PALETTE];
    };

    const handleNewVisualization = () => {
      noise = new SimplexNoise();
      time = 0;
      initParticles();
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      if (isFullVariant) {
        canvasWidth = window.innerWidth;
        canvasHeight = window.innerHeight;
      } else if (container) {
        const rect = container.getBoundingClientRect();
        canvasWidth = rect.width;
        canvasHeight = rect.height;
      }

      canvas.width = canvasWidth * dpr;
      canvas.height = canvasHeight * dpr;
      canvas.style.width = `${canvasWidth}px`;
      canvas.style.height = `${canvasHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      initParticles();
    };

    const drawStatic = () => {
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      // Draw static flow field lines
      const gridSize = 30;
      for (let x = canvasWidth * 0.3; x < canvasWidth; x += gridSize) {
        for (let y = 0; y < canvasHeight; y += gridSize) {
          const posOpacity = getPositionOpacity(x);
          if (posOpacity < 0.01) continue;

          const angle = getAngleAt(x, y);
          const len = 20;

          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + Math.cos(angle) * len, y + Math.sin(angle) * len);
          ctx.strokeStyle = `rgba(255, 255, 255, ${0.2 * posOpacity})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    };

    const animate = () => {
      // Fade out previous frame slightly for trail effect
      ctx.fillStyle = "rgba(10, 10, 10, 0.05)";
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      time += 0.001;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Store previous position
        p.prevX = p.x;
        p.prevY = p.y;

        // Get angle from flow field and move
        const angle = getAngleAt(p.x, p.y);
        p.x += Math.cos(angle) * SPEED;
        p.y += Math.sin(angle) * SPEED;
        p.age++;

        // Calculate opacity based on age and position
        const lifeRatio = p.age / p.maxAge;
        const ageOpacity = lifeRatio < 0.1
          ? lifeRatio * 10
          : lifeRatio > 0.9
          ? (1 - lifeRatio) * 10
          : 1;
        const posOpacity = getPositionOpacity(p.x);
        const alpha = ageOpacity * posOpacity * 0.4;

        // Draw line segment
        if (alpha > 0.01) {
          const { r, g, b } = parseHexColor(p.color);
          ctx.beginPath();
          ctx.moveTo(p.prevX, p.prevY);
          ctx.lineTo(p.x, p.y);
          ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
          ctx.lineWidth = 1;
          ctx.lineCap = "round";
          ctx.stroke();
        }

        // Reset particle if out of bounds or too old
        if (
          p.x < canvasWidth * 0.2 ||
          p.x > canvasWidth + 20 ||
          p.y < -20 ||
          p.y > canvasHeight + 20 ||
          p.age > p.maxAge
        ) {
          particles[i] = createParticle();
        }
      }

      animationId = requestAnimationFrame(animate);
    };

    window.addEventListener("viz-color", handleColorChange as EventListener);
    window.addEventListener("viz-palette", handlePaletteChange as EventListener);
    window.addEventListener("viz-color-reset", handleColorReset);
    window.addEventListener("viz-new", handleNewVisualization);
    window.addEventListener("resize", resize);

    resize();

    if (prefersReducedMotion) {
      drawStatic();
    } else {
      animationId = requestAnimationFrame(animate);
    }

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("viz-color", handleColorChange as EventListener);
      window.removeEventListener("viz-palette", handlePaletteChange as EventListener);
      window.removeEventListener("viz-color-reset", handleColorReset);
      window.removeEventListener("viz-new", handleNewVisualization);
      cancelAnimationFrame(animationId);
    };
  }, [isFullVariant]);

  if (isFullVariant) {
    return (
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none -z-10"
      />
    );
  }

  return (
    <div ref={containerRef} className="w-full h-48 mt-8 relative">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
      />
    </div>
  );
}
