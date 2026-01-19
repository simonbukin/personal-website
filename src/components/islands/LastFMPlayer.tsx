import { useState, useEffect, useRef } from "react";

interface Track {
  isPlaying: boolean;
  name: string;
  artist: string;
  album: string;
  albumArt: string;
  url: string;
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
  const lastArtUrl = useRef<string | null>(null);
  const colorIndex = useRef(0);

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
        // Send full palette for visualizations that support it
        window.dispatchEvent(new CustomEvent("viz-palette", { detail: extracted }));
        // Also send first color for single-color visualizations
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
      // Small delay to ensure DOM is ready
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
      {/* Reveal swipe overlay */}
      <div
        className={`absolute inset-0 z-10 transition-transform duration-500 ease-out ${
          revealed ? "translate-x-full" : "translate-x-0"
        }`}
        style={{ backgroundColor: "var(--bg-tertiary)" }}
      />

      <a
        href={youtubeSearchUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-center gap-3"
        style={{ visibility: loading ? "hidden" : "visible" }}
      >
        <div className="relative w-8 h-8 shrink-0">
          {displayedArt && (
            <img
              src={displayedArt}
              alt={`${track?.album} album art`}
              className="absolute inset-0 w-full h-full object-cover rounded transition-opacity duration-300"
              style={{ opacity: transitioning ? 0 : 1 }}
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
            <span className="font-medium transition-colors" style={{ color: "var(--text-secondary)" }}>{track?.name}</span>
            <span style={{ color: "var(--text-tertiary)" }}> — {track?.artist}</span>
          </p>
        </div>
      </a>

      {/* Skeleton for layout stability */}
      {loading && (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded" style={{ backgroundColor: "var(--bg-tertiary)" }} />
          <div className="space-y-1.5">
            <div className="h-3 w-20 rounded" style={{ backgroundColor: "var(--bg-tertiary)" }} />
            <div className="h-3 w-28 rounded" style={{ backgroundColor: "var(--bg-tertiary)" }} />
          </div>
        </div>
      )}
    </div>
  );
}
