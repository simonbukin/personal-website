import { useRef, useCallback, useEffect, useState } from "react";
import type {
  SimulationRequest,
  SimulationResponse,
  SimulationError,
} from "./simulation.worker";

// Re-export the types that callers need (mirrored from MetroMap.tsx)
interface Point {
  x: number;
  y: number;
}

interface HeadlessLine {
  id: number;
  points: Point[];
  currentDirection: number;
  growing: boolean;
  progress: number;
  totalLength: number;
  lastBranchDistance: number;
  lastStationDistance: number;
  stations: Point[];
}

interface PrecomputedGeometry {
  lines: HeadlessLine[];
  stations: Point[];
  seed: number;
}

interface MapConfig {
  lineSpeed: number;
  segmentLength: number;
  maxLines: number;
  stationRadius: number;
  lineWidth: number;
  minBranchDistance: number;
  minStationDistance: number;
  maxLineLength: number;
  padding: number;
  initialLines: number;
  nearbyStationDistance: number;
  trainWidth: number;
  trainHeight: number;
  stationStopThreshold: number;
  hoverHitRadius: number;
}

interface DrawBounds {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

interface UseSimulationWorkerReturn {
  runSimulation: (
    config: MapConfig,
    bounds: DrawBounds,
    variant?: string,
    unconstrained?: boolean,
  ) => Promise<PrecomputedGeometry>;
  isRunning: boolean;
}

export function useSimulationWorker(): UseSimulationWorkerReturn {
  const workerRef = useRef<Worker | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  // Track whether the component is still mounted to avoid state updates after unmount
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
  }, []);

  const getWorker = useCallback((): Worker | null => {
    if (workerRef.current) return workerRef.current;

    // Check if Workers are supported
    if (typeof Worker === "undefined") return null;

    try {
      const worker = new Worker(
        new URL("./simulation.worker.ts", import.meta.url),
        { type: "module" },
      );
      workerRef.current = worker;
      return worker;
    } catch {
      // Worker creation can fail in some environments (e.g., SSR, restrictive CSP)
      console.warn(
        "[useSimulationWorker] Failed to create worker, will fall back to inline execution",
      );
      return null;
    }
  }, []);

  const runSimulation = useCallback(
    (
      config: MapConfig,
      bounds: DrawBounds,
      variant: string = "unknown",
      unconstrained: boolean = false,
    ): Promise<PrecomputedGeometry> => {
      const worker = getWorker();

      if (!worker) {
        // Fallback: dynamic import the worker module and run inline
        // This keeps the main thread blocked but ensures functionality
        return import("./simulation.worker").then(() => {
          // The worker file is self-contained; we cannot call findBestSimulation
          // directly from it because it only exposes an onmessage handler.
          // In the fallback case, the caller should use the inline findBestSimulation
          // from MetroMap.tsx. We reject so the caller knows to fall back.
          return Promise.reject(
            new Error("Worker not available — use inline fallback"),
          );
        });
      }

      if (mountedRef.current) {
        setIsRunning(true);
      }

      return new Promise<PrecomputedGeometry>((resolve, reject) => {
        const handleMessage = (
          event: MessageEvent<SimulationResponse | SimulationError>,
        ) => {
          worker.removeEventListener("message", handleMessage);
          worker.removeEventListener("error", handleError);

          if (mountedRef.current) {
            setIsRunning(false);
          }

          if (event.data.type === "result") {
            resolve(event.data.geometry);
          } else {
            reject(new Error(event.data.message));
          }
        };

        const handleError = (event: ErrorEvent) => {
          worker.removeEventListener("message", handleMessage);
          worker.removeEventListener("error", handleError);

          if (mountedRef.current) {
            setIsRunning(false);
          }

          reject(new Error(event.message || "Worker error"));
        };

        worker.addEventListener("message", handleMessage);
        worker.addEventListener("error", handleError);

        const request: SimulationRequest = {
          type: "run",
          config,
          bounds,
          variant,
          unconstrained,
        };
        worker.postMessage(request);
      });
    },
    [getWorker],
  );

  return { runSimulation, isRunning };
}
