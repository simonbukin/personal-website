import { useEffect, useRef } from "react";

interface AttractorConfig {
  name: string;
  params: Record<string, number>;
  speed: number;
  derivative: (
    x: number,
    y: number,
    z: number,
    p: Record<string, number>
  ) => [number, number, number];
  initial: () => [number, number, number];
  rotationX: number;
  rotationY: number;
  staticIterations: number;
}

const ATTRACTORS: AttractorConfig[] = [
  {
    name: "Aizawa",
    params: { a: 0.95, b: 0.7, c: 0.6, d: 3.5, e: 0.25, f: 0.1 },
    speed: 0.002,
    derivative: (x, y, z, p) => [
      (z - p.b) * x - p.d * y,
      p.d * x + (z - p.b) * y,
      p.c + p.a * z - z ** 3 / 3 - (x ** 2 + y ** 2) * (1 + p.e * z) + p.f * z * x ** 3,
    ],
    initial: () => [0.1, 0, 0],
    rotationX: 0.2,
    rotationY: 0.3,
    staticIterations: 5000,
  },
  {
    name: "Sprott",
    params: { a: 2.07, b: 1.79 },
    speed: 0.004,
    derivative: (x, y, z, p) => [
      y + p.a * x * y + x * z,
      1 - p.b * x ** 2 + y * z,
      x - x ** 2 - y ** 2,
    ],
    initial: () => [0.63, 0.47, -0.54],
    rotationX: 0.1,
    rotationY: 0.5,
    staticIterations: 10000,
  },
  {
    name: "ThreeScroll",
    params: { a: 32.48, b: 45.84, c: 1.18, d: 0.13, e: 0.57, f: 14.7 },
    speed: 0.00015,
    derivative: (x, y, z, p) => [
      p.a * (y - x) + p.d * x * z,
      p.b * x - x * z + p.f * y,
      p.c * z + x * y - p.e * x ** 2,
    ],
    initial: () => [0.1, 0.1, 0.1],
    rotationX: 0.4,
    rotationY: -0.2,
    staticIterations: 500,
  },
];

const LIFESPAN = 10000;
const STEPS_PER_FRAME = 8;
const BOUNDS_ITERATIONS = 50000;
const PADDING = 40;
const COLOR_LERP_SPEED = 0.015;
const FADE_SPEED = 0.003;
const DEFAULT_COLOR = { r: 255, g: 255, b: 255 };

interface Point {
  x: number;
  y: number;
  time: number;
}

interface RGB {
  r: number;
  g: number;
  b: number;
}

interface AttractorState {
  attractor: AttractorConfig;
  x: number;
  y: number;
  z: number;
  points: Point[];
  cosY: number;
  sinY: number;
  cosX: number;
  sinX: number;
  bounds: { minX: number; maxX: number; minY: number; maxY: number };
  boundsWidth: number;
  boundsHeight: number;
  boundsCenterX: number;
  boundsCenterY: number;
}

function parseColor(color: string): RGB {
  if (color.startsWith("#")) {
    const hex = color.slice(1);
    return {
      r: parseInt(hex.slice(0, 2), 16),
      g: parseInt(hex.slice(2, 4), 16),
      b: parseInt(hex.slice(4, 6), 16),
    };
  }
  return DEFAULT_COLOR;
}

function lerpColor(from: RGB, to: RGB, t: number): RGB {
  return {
    r: from.r + (to.r - from.r) * t,
    g: from.g + (to.g - from.g) * t,
    b: from.b + (to.b - from.b) * t,
  };
}

// RK4 numerical integration for smooth attractor simulation
function rk4Step(
  x: number,
  y: number,
  z: number,
  dt: number,
  derivative: AttractorConfig["derivative"],
  params: Record<string, number>
): [number, number, number] {
  const [dx1, dy1, dz1] = derivative(x, y, z, params);
  const [dx2, dy2, dz2] = derivative(
    x + (dx1 * dt) / 2,
    y + (dy1 * dt) / 2,
    z + (dz1 * dt) / 2,
    params
  );
  const [dx3, dy3, dz3] = derivative(
    x + (dx2 * dt) / 2,
    y + (dy2 * dt) / 2,
    z + (dz2 * dt) / 2,
    params
  );
  const [dx4, dy4, dz4] = derivative(
    x + dx3 * dt,
    y + dy3 * dt,
    z + dz3 * dt,
    params
  );

  return [
    x + ((dx1 + 2 * dx2 + 2 * dx3 + dx4) * dt) / 6,
    y + ((dy1 + 2 * dy2 + 2 * dy3 + dy4) * dt) / 6,
    z + ((dz1 + 2 * dz2 + 2 * dz3 + dz4) * dt) / 6,
  ];
}

function computeBounds(
  attractor: AttractorConfig,
  cosY: number,
  sinY: number,
  cosX: number,
  sinX: number
) {
  let [x, y, z] = attractor.initial();
  let minX = Infinity,
    maxX = -Infinity,
    minY = Infinity,
    maxY = -Infinity;

  for (let i = 0; i < BOUNDS_ITERATIONS; i++) {
    [x, y, z] = rk4Step(x, y, z, 0.01, attractor.derivative, attractor.params);
    const rx = x * cosY - z * sinY;
    const rz = x * sinY + z * cosY;
    const ry = y * cosX - rz * sinX;

    minX = Math.min(minX, rx);
    maxX = Math.max(maxX, rx);
    minY = Math.min(minY, ry);
    maxY = Math.max(maxY, ry);
  }

  return { minX, maxX, minY, maxY };
}

function pickNewAttractor(currentIndex: number): number {
  if (ATTRACTORS.length <= 1) return 0;
  let newIndex;
  do {
    newIndex = Math.floor(Math.random() * ATTRACTORS.length);
  } while (newIndex === currentIndex);
  return newIndex;
}

function createAttractorState(index: number): AttractorState {
  const attractor = ATTRACTORS[index];
  const [x, y, z] = attractor.initial();
  const cosY = Math.cos(attractor.rotationY);
  const sinY = Math.sin(attractor.rotationY);
  const cosX = Math.cos(attractor.rotationX);
  const sinX = Math.sin(attractor.rotationX);
  const bounds = computeBounds(attractor, cosY, sinY, cosX, sinX);

  return {
    attractor,
    x,
    y,
    z,
    points: [],
    cosY,
    sinY,
    cosX,
    sinX,
    bounds,
    boundsWidth: bounds.maxX - bounds.minX,
    boundsHeight: bounds.maxY - bounds.minY,
    boundsCenterX: (bounds.minX + bounds.maxX) / 2,
    boundsCenterY: (bounds.minY + bounds.maxY) / 2,
  };
}

interface Props {
  variant?: "full" | "contained";
}

export default function StrangeAttractor({ variant = "full" }: Props) {
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

    let currentIndex = Math.floor(Math.random() * ATTRACTORS.length);
    let state = createAttractorState(currentIndex);
    let nextState: AttractorState | null = null;
    let opacity = 1;
    let fadingOut = false;
    let currentColor = { ...DEFAULT_COLOR };
    let targetColor = { ...DEFAULT_COLOR };
    let canvasWidth = 0;
    let canvasHeight = 0;
    let staticPoints: Array<[number, number]> = [];
    let animationId: number;
    let lastTime = 0;
    const startTime = performance.now();

    const handleColorChange = (e: CustomEvent<string>) => {
      targetColor = parseColor(e.detail);
      if (prefersReducedMotion) drawStatic();
    };

    const handleColorReset = () => {
      targetColor = { ...DEFAULT_COLOR };
      if (prefersReducedMotion) drawStatic();
    };

    const handleNewAttractor = () => {
      if (prefersReducedMotion) {
        currentIndex = pickNewAttractor(currentIndex);
        state = createAttractorState(currentIndex);
        precomputeStaticPoints();
        drawStatic();
      } else if (!fadingOut && !nextState) {
        nextState = createAttractorState(pickNewAttractor(currentIndex));
        fadingOut = true;
      }
    };

    const project = (
      s: AttractorState,
      px: number,
      py: number,
      pz: number
    ): [number, number] => {
      const rx = px * s.cosY - pz * s.sinY;
      const rz = px * s.sinY + pz * s.cosY;
      const ry = py * s.cosX - rz * s.sinX;

      const targetLeft = isFullVariant ? canvasWidth / 3 : 0;
      const targetWidth = isFullVariant ? (canvasWidth * 2) / 3 : canvasWidth;
      const targetHeight = canvasHeight;

      const scale = Math.min(
        (targetWidth - PADDING * 2) / s.boundsWidth,
        (targetHeight - PADDING * 2) / s.boundsHeight
      );

      return [
        targetLeft + targetWidth / 2 + (rx - s.boundsCenterX) * scale,
        targetHeight / 2 + (ry - s.boundsCenterY) * scale,
      ];
    };

    const precomputeStaticPoints = () => {
      staticPoints = [];
      let [x, y, z] = state.attractor.initial();
      const iterations = state.attractor.staticIterations;
      const warmup = Math.min(500, iterations / 10);

      for (let i = 0; i < iterations; i++) {
        [x, y, z] = rk4Step(x, y, z, 0.01, state.attractor.derivative, state.attractor.params);
        if (i > warmup) {
          staticPoints.push(project(state, x, y, z));
        }
      }
    };

    const drawStatic = () => {
      if (staticPoints.length < 3) return;

      currentColor = lerpColor(currentColor, targetColor, 0.3);
      const { r, g, b } = currentColor;

      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.4)`;
      ctx.lineWidth = 1;

      ctx.beginPath();
      ctx.moveTo(
        (staticPoints[0][0] + staticPoints[1][0]) / 2,
        (staticPoints[0][1] + staticPoints[1][1]) / 2
      );

      for (let i = 1; i < staticPoints.length - 1; i++) {
        const curr = staticPoints[i];
        const next = staticPoints[i + 1];
        ctx.quadraticCurveTo(curr[0], curr[1], (curr[0] + next[0]) / 2, (curr[1] + next[1]) / 2);
      }

      ctx.stroke();
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

      if (prefersReducedMotion && staticPoints.length > 0) {
        precomputeStaticPoints();
        drawStatic();
      }
    };

    const updateState = (s: AttractorState, now: number, delta: number) => {
      const dt = (s.attractor.speed * delta) / STEPS_PER_FRAME;
      for (let i = 0; i < STEPS_PER_FRAME; i++) {
        [s.x, s.y, s.z] = rk4Step(s.x, s.y, s.z, dt, s.attractor.derivative, s.attractor.params);
        const [screenX, screenY] = project(s, s.x, s.y, s.z);
        s.points.push({ x: screenX, y: screenY, time: now });
      }

      while (s.points.length > 0 && now - s.points[0].time > LIFESPAN) {
        s.points.shift();
      }
    };

    const drawState = (
      s: AttractorState,
      now: number,
      r: number,
      g: number,
      b: number,
      globalOpacity: number
    ) => {
      if (s.points.length <= 2) return;

      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      for (let i = 1; i < s.points.length - 1; i++) {
        const alpha = (1 - (now - s.points[i].time) / LIFESPAN) * globalOpacity;
        const prev = s.points[i - 1];
        const curr = s.points[i];
        const next = s.points[i + 1];

        ctx.beginPath();
        ctx.moveTo((prev.x + curr.x) / 2, (prev.y + curr.y) / 2);
        ctx.quadraticCurveTo(curr.x, curr.y, (curr.x + next.x) / 2, (curr.y + next.y) / 2);
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha * 0.6})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      const head = s.points[s.points.length - 1];
      ctx.beginPath();
      ctx.arc(head.x, head.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${0.9 * globalOpacity})`;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(head.x, head.y, 8, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${0.2 * globalOpacity})`;
      ctx.fill();
    };

    const animate = (time: number) => {
      const delta = Math.min(time - lastTime, 50);
      lastTime = time;
      const now = time - startTime;

      currentColor = lerpColor(currentColor, targetColor, COLOR_LERP_SPEED);
      const { r, g, b } = currentColor;

      if (fadingOut) {
        opacity -= FADE_SPEED;
        if (opacity <= 0) {
          opacity = 0;
          fadingOut = false;
          if (nextState) {
            currentIndex = ATTRACTORS.indexOf(nextState.attractor);
            state = nextState;
            nextState = null;
          }
        }
      } else if (opacity < 1) {
        opacity += FADE_SPEED;
        if (opacity > 1) opacity = 1;
      }

      updateState(state, now, delta);
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      drawState(state, now, r, g, b, opacity);

      animationId = requestAnimationFrame(animate);
    };

    window.addEventListener("viz-color", handleColorChange as EventListener);
    window.addEventListener("viz-color-reset", handleColorReset);
    window.addEventListener("viz-new", handleNewAttractor);
    window.addEventListener("resize", resize);

    resize();

    if (prefersReducedMotion) {
      precomputeStaticPoints();
      drawStatic();
    } else {
      animationId = requestAnimationFrame(animate);
    }

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("viz-color", handleColorChange as EventListener);
      window.removeEventListener("viz-color-reset", handleColorReset);
      window.removeEventListener("viz-new", handleNewAttractor);
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
