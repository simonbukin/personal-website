import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { createPortal } from "react-dom";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, useTexture, MeshTransmissionMaterial, Text } from "@react-three/drei";
import * as THREE from "three";
import {
  RegExpMatcher,
  TextCensor,
  englishDataset,
  englishRecommendedTransformers,
  asteriskCensorStrategy,
} from "obscenity";

// Set up profanity filter with asterisk replacement
const matcher = new RegExpMatcher({
  ...englishDataset.build(),
  ...englishRecommendedTransformers,
});

const censor = new TextCensor().setStrategy(asteriskCensorStrategy());

function censorProfanity(text: string): string {
  if (!text) return text;
  const matches = matcher.getAllMatches(text);
  return censor.applyTo(text, matches);
}

interface Track {
  isPlaying: boolean;
  name: string;
  artist: string;
  album: string;
  albumArt: string;
  url: string;
}

type AnimPhase =
  | "closed"
  | "entering"
  | "interactive"
  | "exiting";

// Album art plane with texture - only rendered when we have a valid URL
function AlbumArtPlane({ url, width, height, position }: { url: string; width: number; height: number; position: [number, number, number] }) {
  const albumTexture = useTexture(url);
  albumTexture.colorSpace = THREE.SRGBColorSpace;
  albumTexture.minFilter = THREE.LinearFilter;
  albumTexture.magFilter = THREE.LinearFilter;

  return (
    <mesh position={position}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial map={albumTexture} side={THREE.FrontSide} />
    </mesh>
  );
}

// Fallback plane when no album art - solid color with music note
function FallbackArtPlane({ width, height, position }: { width: number; height: number; position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial color="#2a2a2a" side={THREE.FrontSide} />
      </mesh>
      <Text
        position={[0, 0, 0.01]}
        fontSize={Math.min(width, height) * 0.4}
        color="#666666"
        anchorX="center"
        anchorY="middle"
      >
        ♪
      </Text>
    </group>
  );
}

// Detailed CD Jewel Case - anatomically accurate
function CDJewelCase({
  albumArtUrl,
  tiltX,
  tiltY
}: {
  albumArtUrl: string;
  tiltX: number;
  tiltY: number;
}) {
  const { viewport } = useThree();
  const hasAlbumArt = albumArtUrl && albumArtUrl.length > 0;

  // Real jewel case proportions: 142mm x 125mm x 10mm
  // Base dimensions (unscaled)
  const BASE_W = 1.42;
  const BASE_H = 1.25;
  const BASE_D = 0.10;

  // Calculate scale to fit viewport with padding (75% of smaller dimension)
  const targetSize = Math.min(viewport.width, viewport.height) * 0.75;
  const SCALE = targetSize / Math.max(BASE_W, BASE_H);

  const W = BASE_W * SCALE;
  const H = BASE_H * SCALE;
  const D = BASE_D * SCALE;
  const PLASTIC_THICKNESS = 0.015 * SCALE;

  const artWidth = W - PLASTIC_THICKNESS * 4;
  const artHeight = H - PLASTIC_THICKNESS * 4;
  const artPosition: [number, number, number] = [0, 0, D / 2 - PLASTIC_THICKNESS - 0.01];

  return (
    <group rotation={[THREE.MathUtils.degToRad(tiltX), THREE.MathUtils.degToRad(tiltY), 0]}>

      {/* === FRONT COVER - Crystal clear glossy polystyrene (only transmission material for performance) === */}
      <mesh position={[0, 0, D / 2]}>
        <boxGeometry args={[W, H, PLASTIC_THICKNESS]} />
        <MeshTransmissionMaterial
          transmission={1}
          thickness={0.1}
          roughness={0}
          chromaticAberration={0.015}
          ior={1.5}
          clearcoat={1}
          clearcoatRoughness={0}
          envMapIntensity={1}
          color="#ffffff"
          samples={4}
        />
      </mesh>

      {/* === BACK COVER - Simple transparent glossy === */}
      <mesh position={[0, 0, -D / 2]}>
        <boxGeometry args={[W, H, PLASTIC_THICKNESS]} />
        <meshPhysicalMaterial
          transparent
          opacity={0.15}
          roughness={0.05}
          metalness={0}
          clearcoat={1}
          clearcoatRoughness={0}
          envMapIntensity={0.8}
          color="#ffffff"
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* === EDGES - Simple glossy transparent plastic === */}
      {[
        { pos: [-W / 2 + PLASTIC_THICKNESS / 2, 0, 0], size: [PLASTIC_THICKNESS, H, D] },
        { pos: [W / 2 - PLASTIC_THICKNESS / 2, 0, 0], size: [PLASTIC_THICKNESS, H, D] },
        { pos: [0, H / 2 - PLASTIC_THICKNESS / 2, 0], size: [W - PLASTIC_THICKNESS * 2, PLASTIC_THICKNESS, D] },
        { pos: [0, -H / 2 + PLASTIC_THICKNESS / 2, 0], size: [W - PLASTIC_THICKNESS * 2, PLASTIC_THICKNESS, D] },
      ].map((edge, i) => (
        <mesh key={i} position={edge.pos as [number, number, number]}>
          <boxGeometry args={edge.size as [number, number, number]} />
          <meshPhysicalMaterial
            transparent
            opacity={0.2}
            roughness={0.02}
            metalness={0}
            clearcoat={1}
            clearcoatRoughness={0}
            envMapIntensity={0.6}
            color="#ffffff"
          />
        </mesh>
      ))}

      {/* === ALBUM ART BOOKLET - Behind front cover === */}
      {hasAlbumArt ? (
        <AlbumArtPlane url={albumArtUrl} width={artWidth} height={artHeight} position={artPosition} />
      ) : (
        <FallbackArtPlane width={artWidth} height={artHeight} position={artPosition} />
      )}
    </group>
  );
}

// Convert screen coordinates to Three.js world coordinates
function screenToWorld(
  screenX: number,
  screenY: number,
  camera: THREE.PerspectiveCamera,
  targetZ: number = 0
): { x: number; y: number } {
  const vec = new THREE.Vector3();
  const pos = new THREE.Vector3();

  // Normalized device coordinates
  vec.set(
    (screenX / window.innerWidth) * 2 - 1,
    -(screenY / window.innerHeight) * 2 + 1,
    0.5
  );

  vec.unproject(camera);
  vec.sub(camera.position).normalize();

  const distance = (targetZ - camera.position.z) / vec.z;
  pos.copy(camera.position).add(vec.multiplyScalar(distance));

  return { x: pos.x, y: pos.y };
}

// Animated case wrapper - symmetric enter/exit with randomness
function AnimatedCase({
  phase,
  originRect,
  children
}: {
  phase: AnimPhase;
  originRect: DOMRect | null;
  children: React.ReactNode;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const animProgress = useRef(0);
  const startWorldPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const randomTilt = useRef({ x: 0, y: 0, z: 0 });
  const hasInitialized = useRef(false);
  const { camera } = useThree();

  // Animation timing
  const ANIM_DURATION = 0.9;

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    // Calculate world position on first frame when entering (camera is guaranteed ready here)
    if (phase === "entering" && !hasInitialized.current && originRect) {
      hasInitialized.current = true;

      // Calculate position using camera
      if (camera instanceof THREE.PerspectiveCamera) {
        const centerX = originRect.left + originRect.width / 2;
        const centerY = originRect.top + originRect.height / 2;
        startWorldPos.current = screenToWorld(centerX, centerY, camera, 0);
      }

      // Generate random tilt
      randomTilt.current = {
        x: (Math.random() - 0.5) * 20,
        y: (Math.random() - 0.5) * 30,
        z: (Math.random() - 0.5) * 16,
      };

      // Set initial state - at album art position, tiny scale, rotated
      animProgress.current = 0;
      groupRef.current.position.set(startWorldPos.current.x, startWorldPos.current.y, 0);
      groupRef.current.scale.setScalar(0.02);
      groupRef.current.rotation.set(0, THREE.MathUtils.degToRad(360), 0);

      // Skip animation on initialization frame - just show initial state
      return;
    }

    const startPos = startWorldPos.current;
    const tilt = randomTilt.current;

    if (phase === "entering") {
      animProgress.current = Math.min(animProgress.current + delta / ANIM_DURATION, 1);
      const t = animProgress.current;
      const eased = 1 - Math.pow(1 - t, 3);

      groupRef.current.position.x = THREE.MathUtils.lerp(startPos.x, 0, eased);
      groupRef.current.position.y = THREE.MathUtils.lerp(startPos.y, 0, eased);
      groupRef.current.position.z = 0;

      const scale = THREE.MathUtils.lerp(0.02, 1, eased);
      groupRef.current.scale.setScalar(scale);

      const tiltFade = 1 - eased;
      groupRef.current.rotation.set(
        THREE.MathUtils.degToRad(tilt.x * tiltFade),
        THREE.MathUtils.degToRad(360 * (1 - t) + tilt.y * tiltFade),
        THREE.MathUtils.degToRad(tilt.z * tiltFade)
      );

    } else if (phase === "interactive") {
      groupRef.current.position.lerp(new THREE.Vector3(0, 0, 0), 0.12);
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, 0, 0.12);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, 0, 0.12);
      groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, 0, 0.12);
      groupRef.current.scale.setScalar(1);

    } else if (phase === "exiting") {
      animProgress.current = Math.max(animProgress.current - delta / ANIM_DURATION, 0);
      const t = animProgress.current;
      const eased = t * t * t;

      groupRef.current.position.x = THREE.MathUtils.lerp(startPos.x, 0, eased);
      groupRef.current.position.y = THREE.MathUtils.lerp(startPos.y, 0, eased);
      groupRef.current.position.z = 0;

      const scale = THREE.MathUtils.lerp(0.02, 1, eased);
      groupRef.current.scale.setScalar(scale);

      const tiltFade = 1 - eased;
      groupRef.current.rotation.set(
        THREE.MathUtils.degToRad(tilt.x * tiltFade),
        THREE.MathUtils.degToRad(-360 * (1 - t) + tilt.y * tiltFade),
        THREE.MathUtils.degToRad(tilt.z * tiltFade)
      );
    }
  });

  // Reset when closed
  useEffect(() => {
    if (phase === "closed") {
      hasInitialized.current = false;
    } else if (phase === "interactive") {
      animProgress.current = 1;
    }
  }, [phase]);

  // Start with scale 0 so nothing shows before useFrame positions it correctly
  return <group ref={groupRef} scale={0}>{children}</group>;
}

// Main 3D scene
function Scene({
  track,
  phase,
  originRect,
  mousePos
}: {
  track: Track;
  phase: AnimPhase;
  originRect: DOMRect | null;
  mousePos: { x: number; y: number };
}) {
  // Tilt based on mouse position when interactive
  const tiltX = phase === "interactive" ? (mousePos.y - 0.5) * -10 : 0;
  const tiltY = phase === "interactive" ? (mousePos.x - 0.5) * 10 : 0;

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 8, 5]} intensity={1.5} castShadow />
      <directionalLight position={[-5, 3, 3]} intensity={0.6} />
      <pointLight position={[0, 0, 8]} intensity={0.8} />
      <Environment preset="studio" />

      <AnimatedCase phase={phase} originRect={originRect}>
        <CDJewelCase
          albumArtUrl={track.albumArt}
          tiltX={tiltX}
          tiltY={tiltY}
        />
      </AnimatedCase>
    </>
  );
}

interface AlbumArt3DOverlayProps {
  track: Track;
  phase: AnimPhase;
  originRect: DOMRect | null;
  onClose: () => void;
  youtubeUrl: string;
  onAnimationComplete: () => void;
}

function AlbumArt3DOverlay({ track, phase, originRect, onClose, youtubeUrl, onAnimationComplete }: AlbumArt3DOverlayProps) {
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });

  const handleMouseMove = useCallback((e: MouseEvent) => {
    setMousePos({
      x: e.clientX / window.innerWidth,
      y: e.clientY / window.innerHeight,
    });
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [handleMouseMove]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && phase === "interactive") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [phase, onClose]);

  useEffect(() => {
    if (phase === "entering") {
      const timer = setTimeout(onAnimationComplete, 900);
      return () => clearTimeout(timer);
    }
  }, [phase, onAnimationComplete]);

  useEffect(() => {
    if (phase !== "interactive") return;
    const handleClick = () => onClose();
    const timer = setTimeout(() => {
      window.addEventListener("click", handleClick);
    }, 100);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("click", handleClick);
    };
  }, [phase, onClose]);

  const isVisible = phase !== "closed";

  return createPortal(
    <div
      className={`album-3d-container ${isVisible ? "active" : ""}`}
      style={{ pointerEvents: phase === "interactive" ? "auto" : "none" }}
    >
      <Canvas
        camera={{ position: [0, 0, 10], fov: 45 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        dpr={[1, 2]}
        style={{ background: "transparent" }}
      >
        <Suspense fallback={null}>
          <Scene track={track} phase={phase} originRect={originRect} mousePos={mousePos} />
        </Suspense>
      </Canvas>

      <div className={`track-info-overlay ${phase === "interactive" ? "visible" : ""}`}>
        <a
          href={youtubeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="listen-cta-3d"
          onClick={(e) => e.stopPropagation()}
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
          </svg>
          Listen on YouTube
        </a>
      </div>
    </div>,
    document.body
  );
}

function extractColors(img: HTMLImageElement, count: number = 5): string[] {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return [];

  const size = 64;
  canvas.width = size;
  canvas.height = size;

  try {
    ctx.drawImage(img, 0, 0, size, size);
    const data = ctx.getImageData(0, 0, size, size).data;
    const colors: { r: number; g: number; b: number; score: number }[] = [];

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const brightness = (r + g + b) / 3;
      const saturation = Math.max(r, g, b) - Math.min(r, g, b);

      if (brightness > 40 && brightness < 220 && saturation > 30) {
        colors.push({ r, g, b, score: saturation + Math.abs(brightness - 128) });
      }
    }

    colors.sort((a, b) => b.score - a.score);

    const selected: string[] = [];
    for (const color of colors) {
      const hex = `#${color.r.toString(16).padStart(2, "0")}${color.g.toString(16).padStart(2, "0")}${color.b.toString(16).padStart(2, "0")}`;
      const isDifferent = selected.every((existing) => {
        const er = parseInt(existing.slice(1, 3), 16);
        const eg = parseInt(existing.slice(3, 5), 16);
        const eb = parseInt(existing.slice(5, 7), 16);
        return Math.abs(color.r - er) + Math.abs(color.g - eg) + Math.abs(color.b - eb) > 80;
      });

      if (isDifferent) {
        selected.push(hex);
        if (selected.length >= count) break;
      }
    }

    return selected;
  } catch {
    return [];
  }
}

const COLOR_CYCLE_INTERVAL = 8000;

export default function LastFMPlayer() {
  const [track, setTrack] = useState<Track | null>(null);
  const [loading, setLoading] = useState(true);
  const [revealed, setRevealed] = useState(false);
  const [error, setError] = useState(false);
  const [colors, setColors] = useState<string[]>([]);
  const [displayedArt, setDisplayedArt] = useState<string | null>(null);
  const [nextArt, setNextArt] = useState<string | null>(null);
  const [transitioning, setTransitioning] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [animPhase, setAnimPhase] = useState<AnimPhase>("closed");
  const [originRect, setOriginRect] = useState<DOMRect | null>(null);
  const lastArtUrl = useRef<string | null>(null);
  const colorIndex = useRef(0);
  const albumArtRef = useRef<HTMLDivElement>(null);

  // Hide album art thumbnail after a short delay so there's no flash
  const [hideAlbumArt, setHideAlbumArt] = useState(false);

  useEffect(() => {
    if (animPhase === "entering") {
      // Delay hiding to let 3D canvas initialize
      const timer = setTimeout(() => setHideAlbumArt(true), 50);
      return () => clearTimeout(timer);
    } else if (animPhase === "closed") {
      setHideAlbumArt(false);
    }
  }, [animPhase]);

  const handleAlbumArtClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Don't open if no track or already animating
    if (!track || animPhase !== "closed") return;

    if (albumArtRef.current) {
      setOriginRect(albumArtRef.current.getBoundingClientRect());
    }
    setAnimPhase("entering");
  }, [track, animPhase]);

  const handleAnimationComplete = useCallback(() => {
    if (animPhase === "entering") {
      setAnimPhase("interactive");
    }
  }, [animPhase]);

  const handleCloseModal = useCallback(() => {
    if (animPhase !== "interactive") return;
    setAnimPhase("exiting");
    setTimeout(() => setAnimPhase("closed"), 900);
  }, [animPhase]);

  useEffect(() => {
    async function fetchTrack() {
      try {
        const res = await fetch("/api/lastfm");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        setTrack(data);
        setError(false);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchTrack();
    const interval = setInterval(fetchTrack, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!track?.albumArt || track.albumArt === lastArtUrl.current) return;

    const isNewTrack = lastArtUrl.current !== null;
    lastArtUrl.current = track.albumArt;

    if (isNewTrack) {
      window.dispatchEvent(new CustomEvent("viz-new"));
    }

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const extracted = extractColors(img, 8);
      setColors(extracted);
      colorIndex.current = 0;
      if (extracted.length > 0) {
        window.dispatchEvent(new CustomEvent("viz-palette", { detail: extracted }));
        if (track.isPlaying) {
          window.dispatchEvent(new CustomEvent("viz-color", { detail: extracted[0] }));
        }
      }
    };
    img.src = track.albumArt;
  }, [track?.albumArt, track?.isPlaying]);

  useEffect(() => {
    if (!track?.isPlaying || colors.length === 0) {
      window.dispatchEvent(new CustomEvent("viz-color-reset"));
      return;
    }

    window.dispatchEvent(new CustomEvent("viz-color", { detail: colors[colorIndex.current] }));

    const interval = setInterval(() => {
      colorIndex.current = (colorIndex.current + 1) % colors.length;
      window.dispatchEvent(new CustomEvent("viz-color", { detail: colors[colorIndex.current] }));
    }, COLOR_CYCLE_INTERVAL);

    return () => clearInterval(interval);
  }, [track?.isPlaying, colors]);

  useEffect(() => {
    if (!track?.albumArt) return;
    if (track.albumArt === displayedArt) return;

    setImageLoaded(false);
    setImageError(false);

    if (!displayedArt) {
      setDisplayedArt(track.albumArt);
    } else {
      setNextArt(track.albumArt);
      setTransitioning(true);
      const timeout = setTimeout(() => {
        setDisplayedArt(track.albumArt);
        setNextArt(null);
        setTransitioning(false);
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [track?.albumArt, displayedArt]);

  useEffect(() => {
    if (!loading && track && !revealed) {
      const timer = setTimeout(() => setRevealed(true), 50);
      return () => clearTimeout(timer);
    }
  }, [loading, track, revealed]);

  if (error || (!loading && !track)) return null;

  const youtubeSearchUrl = track
    ? `https://www.youtube.com/results?search_query=${encodeURIComponent(`${track.name} ${track.artist}`)}`
    : "#";

  return (
    <div className="relative overflow-hidden w-fit">
      <div
        className={`absolute inset-0 z-10 transition-transform duration-500 ease-out ${
          revealed ? "translate-x-full" : "translate-x-0"
        }`}
        style={{ backgroundColor: "var(--bg-tertiary)" }}
      />

      <div
        className={`group flex items-center gap-3 transition-opacity duration-300 ease-out cursor-pointer ${
          loading ? 'opacity-0' : 'opacity-100'
        }`}
        onClick={handleAlbumArtClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            handleAlbumArtClick(e as unknown as React.MouseEvent);
          }
        }}
      >
        <div
          ref={albumArtRef}
          className="relative w-8 h-8 shrink-0"
          style={{ opacity: hideAlbumArt ? 0 : 1, transition: "opacity 0.15s ease" }}
        >
          <div
            className="absolute inset-0 w-full h-full rounded flex items-center justify-center transition-opacity duration-300"
            style={{
              backgroundColor: "var(--bg-tertiary)",
              opacity: (!imageLoaded || imageError) && !transitioning ? 1 : 0,
            }}
          >
            <span className="text-base select-none" style={{ color: "var(--text-tertiary)" }}>♪</span>
          </div>
          {displayedArt && (
            <img
              src={displayedArt}
              alt={`${track?.album} album art`}
              className="absolute inset-0 w-full h-full object-cover rounded transition-opacity duration-300"
              style={{ opacity: transitioning ? 0 : imageLoaded && !imageError ? 1 : 0 }}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
            />
          )}
          {nextArt && (
            <img
              src={nextArt}
              alt={`${track?.album} album art`}
              className="absolute inset-0 w-full h-full object-cover rounded transition-opacity duration-300"
              style={{ opacity: transitioning ? 1 : 0 }}
            />
          )}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            {track?.isPlaying && (
              <span className="flex gap-0.5 items-end h-3">
                <span className="w-0.5 h-full bg-green-500 animate-pulse" />
                <span className="w-0.5 h-2/3 bg-green-500 animate-pulse" style={{ animationDelay: "150ms" }} />
                <span className="w-0.5 h-1/3 bg-green-500 animate-pulse" style={{ animationDelay: "300ms" }} />
              </span>
            )}
            <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>
              {track?.isPlaying ? "Now playing" : "Last played"}
            </span>
          </div>
          <p className="text-sm truncate mt-0.5">
            <span className="font-medium transition-colors" style={{ color: "var(--text-secondary)" }}>{censorProfanity(track?.name ?? '')}</span>
            <span style={{ color: "var(--text-tertiary)" }}> — {censorProfanity(track?.artist ?? '')}</span>
          </p>
        </div>
      </div>

      <div
        className={`absolute inset-0 flex items-center gap-3 transition-opacity duration-300 ease-out ${
          loading ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="w-8 h-8 rounded" style={{ backgroundColor: "var(--bg-tertiary)" }} />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <div className="flex gap-0.5 items-end h-3">
              <div className="w-0.5 h-full rounded-sm" style={{ backgroundColor: "var(--bg-tertiary)" }} />
              <div className="w-0.5 h-2/3 rounded-sm" style={{ backgroundColor: "var(--bg-tertiary)" }} />
              <div className="w-0.5 h-1/3 rounded-sm" style={{ backgroundColor: "var(--bg-tertiary)" }} />
            </div>
            <div className="h-3 w-16 rounded" style={{ backgroundColor: "var(--bg-tertiary)" }} />
          </div>
          <div className="h-4 w-36 rounded mt-0.5" style={{ backgroundColor: "var(--bg-tertiary)" }} />
        </div>
      </div>

      {track && animPhase !== "closed" && (
        <AlbumArt3DOverlay
          track={track}
          phase={animPhase}
          originRect={originRect}
          onClose={handleCloseModal}
          youtubeUrl={youtubeSearchUrl}
          onAnimationComplete={handleAnimationComplete}
        />
      )}
    </div>
  );
}
