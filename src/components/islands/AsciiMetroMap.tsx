import { useEffect, useRef, type RefObject } from "react";

interface AsciiMetroMapProps {
  canvasRef: RefObject<HTMLCanvasElement | null>;
}

const CHAR_RAMP = " .:-=+*#%@";
const CHAR_ASPECT = 0.6;

export default function AsciiMetroMap({ canvasRef }: AsciiMetroMapProps) {
  const preRef = useRef<HTMLPreElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const pre = preRef.current;
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!pre || !canvas || !container) return;

    let lastTime = 0;
    const frameBudget = 1000 / 24;

    function sample() {
      rafRef.current = requestAnimationFrame(sample);

      const now = performance.now();
      if (now - lastTime < frameBudget) return;
      lastTime = now;

      const ctx = canvas!.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;

      const w = canvas!.width;
      const h = canvas!.height;
      if (w === 0 || h === 0) return;

      const containerW = container!.clientWidth;
      const containerH = container!.clientHeight;
      if (containerW === 0 || containerH === 0) return;

      const isMobile = window.innerWidth < 1024;
      const targetFontSize = isMobile ? 8 : 10;
      const charW = targetFontSize * CHAR_ASPECT;
      const charH = targetFontSize * 1.2;

      const cols = Math.floor(containerW / charW);
      const rows = Math.floor(containerH / charH);
      if (cols <= 0 || rows <= 0) return;

      const cellW = w / cols;
      const cellH = h / rows;

      let imageData: ImageData;
      try {
        imageData = ctx.getImageData(0, 0, w, h);
      } catch {
        return;
      }
      const data = imageData.data;

      // Background color from corners
      const corners = [
        0,
        (w - 1) * 4,
        ((h - 1) * w) * 4,
        ((h - 1) * w + (w - 1)) * 4,
      ];
      let bgR = 0, bgG = 0, bgB = 0;
      for (const ci of corners) {
        bgR += data[ci];
        bgG += data[ci + 1];
        bgB += data[ci + 2];
      }
      bgR = Math.round(bgR / 4);
      bgG = Math.round(bgG / 4);
      bgB = Math.round(bgB / 4);

      let html = "";
      let runColor = "";
      let runChars = "";

      const stepsX = Math.max(3, Math.ceil(cellW / 2));
      const stepsY = Math.max(3, Math.ceil(cellH / 2));

      for (let r = 0; r < rows; r++) {
        const cellTop = Math.floor(r * cellH);
        const cellBot = Math.min(h - 1, Math.floor((r + 1) * cellH));

        for (let c = 0; c < cols; c++) {
          const cellLeft = Math.floor(c * cellW);
          const cellRight = Math.min(w - 1, Math.floor((c + 1) * cellW));

          let bestDist = 0;
          let bestPr = 0;
          let bestPg = 0;
          let bestPb = 0;

          const spanX = cellRight - cellLeft;
          const spanY = cellBot - cellTop;

          for (let sy = 0; sy < stepsY; sy++) {
            const py = spanY > 0
              ? cellTop + Math.round((sy / (stepsY - 1)) * spanY)
              : cellTop;
            for (let sx = 0; sx < stepsX; sx++) {
              const px = spanX > 0
                ? cellLeft + Math.round((sx / (stepsX - 1)) * spanX)
                : cellLeft;
              const idx = (py * w + px) * 4;
              const pr = data[idx];
              const pg = data[idx + 1];
              const pb = data[idx + 2];
              const dr = pr - bgR;
              const dg = pg - bgG;
              const db = pb - bgB;
              const dist = dr * dr + dg * dg + db * db;
              if (dist > bestDist) {
                bestDist = dist;
                bestPr = pr;
                bestPg = pg;
                bestPb = pb;
              }
            }
          }

          const normalizedDist = Math.sqrt(bestDist) / 441.67;

          let ch: string;
          let color: string;

          if (normalizedDist < 0.04) {
            ch = " ";
            color = "";
          } else {
            const charIdx = Math.min(
              CHAR_RAMP.length - 1,
              Math.floor(normalizedDist * (CHAR_RAMP.length - 1)) + 1
            );
            ch = CHAR_RAMP[charIdx];
            color = `rgb(${bestPr},${bestPg},${bestPb})`;
          }

          if (color !== runColor) {
            if (runChars) {
              if (runColor) {
                html += `<span style="color:${runColor}">${runChars}</span>`;
              } else {
                html += runChars;
              }
            }
            runColor = color;
            runChars = ch;
          } else {
            runChars += ch;
          }
        }
        if (runChars) {
          if (runColor) {
            html += `<span style="color:${runColor}">${runChars}</span>`;
          } else {
            html += runChars;
          }
        }
        runColor = "";
        runChars = "";
        if (r < rows - 1) html += "\n";
      }

      pre!.innerHTML = html;
    }

    rafRef.current = requestAnimationFrame(sample);

    return () => {
      cancelAnimationFrame(rafRef.current);
    };
  }, [canvasRef]);

  const isMobile =
    typeof window !== "undefined" && window.innerWidth < 1024;

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "100%",
        overflow: "hidden",
      }}
    >
      <pre
        ref={preRef}
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: isMobile ? "8px" : "10px",
          lineHeight: "1.2",
          userSelect: "none",
          margin: 0,
          padding: 0,
          background: "transparent",
          whiteSpace: "pre",
        }}
      />
    </div>
  );
}
