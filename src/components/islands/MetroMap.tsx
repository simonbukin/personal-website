import { useEffect, useRef, useCallback } from "react";

// Theme colors interface
interface ThemeColors {
  stationInner: string;
  tooltipBg: string;
  tooltipText: string;
  tooltipMuted: string;
  legendBg: string;
  legendBorder: string;
  waveColor: string;
  bgPrimary: string;
  textPrimary: string;
  textSecondary: string;
}

// Get current theme colors from CSS custom properties
function getThemeColors(): ThemeColors {
  const style = getComputedStyle(document.documentElement);
  return {
    stationInner:
      style.getPropertyValue("--canvas-station-inner").trim() || "#ffffff",
    tooltipBg:
      style.getPropertyValue("--canvas-tooltip-bg").trim() ||
      "rgba(23, 23, 23, 0.95)",
    tooltipText:
      style.getPropertyValue("--canvas-tooltip-text").trim() || "#f0edf5",
    tooltipMuted:
      style.getPropertyValue("--canvas-tooltip-muted").trim() || "#8b829e",
    legendBg:
      style.getPropertyValue("--canvas-legend-bg").trim() ||
      "rgba(10, 10, 10, 0.85)",
    legendBorder:
      style.getPropertyValue("--canvas-legend-border").trim() ||
      "rgba(64, 64, 64, 0.6)",
    waveColor:
      style.getPropertyValue("--canvas-wave-color").trim() ||
      "rgba(255, 255, 255, 0.6)",
    bgPrimary: style.getPropertyValue("--bg-primary").trim() || "#1a1625",
    textPrimary: style.getPropertyValue("--text-primary").trim() || "#f0edf5",
    textSecondary:
      style.getPropertyValue("--text-secondary").trim() || "#c4bdd4",
  };
}

// Octilinear directions: 0°, 45°, 90°, 135°, 180°, 225°, 270°, 315°
const DIRECTIONS = [
  { dx: 1, dy: 0 }, // East
  { dx: 1, dy: -1 }, // Northeast
  { dx: 0, dy: -1 }, // North
  { dx: -1, dy: -1 }, // Northwest
  { dx: -1, dy: 0 }, // West
  { dx: -1, dy: 1 }, // Southwest
  { dx: 0, dy: 1 }, // South
  { dx: 1, dy: 1 }, // Southeast
];

// Metro line colors optimized for contrast
// Dark mode: lighter, vibrant pastels that pop against #1a1625 (3:1+ contrast)
const DARK_MODE_COLORS = [
  "#e88a7d", // Coral red
  "#7cb5db", // Sky blue
  "#85c794", // Mint green
  "#e5b56a", // Amber gold
  "#b89fd6", // Soft lavender
  "#6bc4ba", // Aqua teal
  "#e89f7a", // Peach orange
  "#d69eb5", // Dusty rose
];

// Light mode: richer, medium-toned colors visible against #faf8f5 (3:1+ contrast)
const LIGHT_MODE_COLORS = [
  "#c75a55", // Brick red
  "#4a7da8", // Denim blue
  "#4d8a5c", // Forest green
  "#b8862e", // Bronze amber
  "#7a5a9e", // Deep lavender
  "#3a918a", // Deep teal
  "#c06d45", // Terracotta
  "#a8567a", // Berry rose
];

// Get colors based on current theme
function getThemeLineColors(): string[] {
  const theme = document.documentElement.getAttribute("data-theme");
  return theme === "light" ? LIGHT_MODE_COLORS : DARK_MODE_COLORS;
}

// Legacy default for initial load
const DEFAULT_COLORS = DARK_MODE_COLORS;

// Real transit lines from cities I've used
interface TransitLineInfo {
  name: string;
  location: string;
  wiki: string;
}

const TRANSIT_LINES: TransitLineInfo[] = [
  {
    name: "山手線 Yamanote",
    location: "Tokyo",
    wiki: "https://en.wikipedia.org/wiki/Yamanote_Line",
  },
  {
    name: "銀座線 Ginza",
    location: "Tokyo",
    wiki: "https://en.wikipedia.org/wiki/Tokyo_Metro_Ginza_Line",
  },
  {
    name: "中央線 Chūō",
    location: "Tokyo",
    wiki: "https://en.wikipedia.org/wiki/Ch%C5%AB%C5%8D_Line_(Rapid)",
  },
  {
    name: "U2",
    location: "Berlin",
    wiki: "https://en.wikipedia.org/wiki/U2_(Berlin_U-Bahn)",
  },
  {
    name: "U6",
    location: "Berlin",
    wiki: "https://en.wikipedia.org/wiki/U6_(Berlin_U-Bahn)",
  },
  {
    name: "Red Line",
    location: "Salt Lake City",
    wiki: "https://en.wikipedia.org/wiki/Red_Line_(TRAX)",
  },
  {
    name: "Blue Line",
    location: "Salt Lake City",
    wiki: "https://en.wikipedia.org/wiki/Blue_Line_(TRAX)",
  },
  {
    name: "T Third",
    location: "San Francisco",
    wiki: "https://en.wikipedia.org/wiki/T_Third_Street",
  },
  {
    name: "1 Line",
    location: "Seattle",
    wiki: "https://en.wikipedia.org/wiki/1_Line_(Link_light_rail)",
  },
  {
    name: "Route 3",
    location: "Santa Cruz",
    wiki: "https://en.wikipedia.org/wiki/Santa_Cruz_Metropolitan_Transit_District",
  },
  {
    name: "Route 10",
    location: "Santa Cruz",
    wiki: "https://en.wikipedia.org/wiki/Santa_Cruz_Metropolitan_Transit_District",
  },
  {
    name: "Caltrain",
    location: "Bay Area",
    wiki: "https://en.wikipedia.org/wiki/Caltrain",
  },
];

// Select one random line per unique location
const selectLinesOnePerLocation = (maxLines: number): TransitLineInfo[] => {
  // Group by location
  const byLocation = new Map<string, TransitLineInfo[]>();
  for (const line of TRANSIT_LINES) {
    if (!byLocation.has(line.location)) {
      byLocation.set(line.location, []);
    }
    byLocation.get(line.location)!.push(line);
  }

  // Pick one random line from each location
  const selected: TransitLineInfo[] = [];
  const locations = Array.from(byLocation.keys());

  // Shuffle locations
  for (let i = locations.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [locations[i], locations[j]] = [locations[j], locations[i]];
  }

  for (const location of locations) {
    if (selected.length >= maxLines) break;
    const options = byLocation.get(location)!;
    const pick = options[Math.floor(Math.random() * options.length)];
    selected.push(pick);
  }

  return selected;
};

// Static constants (don't change with viewport)
const BRANCH_PROBABILITY = 0.2; // Chance to branch at each segment
const STATION_GROW_SPEED = 0.08; // How fast stations grow to full size
const COLOR_LERP_SPEED = 0.03; // How fast colors shift
const HOVER_LERP_SPEED = 0.08; // How fast hover animations interpolate (smoother)
const COLOR_SHIFT_LERP_SPEED = 0.08; // How fast color shift intensity changes
const NEARBY_INFLUENCE = 0.3; // How much nearby stations react (30%)
const WAVE_SPEED = 200; // Pixels per second for click wave
const WAVE_DURATION = 2000; // Total wave duration in ms
const IDLE_PULSE_SPEED = 0.02; // Speed of idle breathing animation
const IDLE_PULSE_AMOUNT = 0.05; // 5% scale variation for idle pulse
const TRAIN_MAX_SPEED = 0.4; // Pixels per frame (max speed) - slower for smooth movement
const TRAIN_MIN_WAIT = 800; // Min wait time at station (ms)
const TRAIN_MAX_WAIT = 2500; // Max wait time at station (ms)
const PARALLEL_AVOIDANCE_DISTANCE = 80; // Avoid parallel directions within this distance
const MIN_STATIONS_FOR_TRAIN = 2; // Minimum stations before spawning a train
const CENTER_WEIGHT_STRENGTH = 0.5; // How strongly lines are pulled toward center (0 = no bias, 1 = strong)

// Viewport-dependent configuration
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

const DESKTOP_CONFIG: MapConfig = {
  lineSpeed: 0.63,
  segmentLength: 60,
  maxLines: 10,
  stationRadius: 9,
  lineWidth: 5,
  minBranchDistance: 120,
  minStationDistance: 50,
  maxLineLength: 700,
  padding: 60,
  initialLines: 3,
  nearbyStationDistance: 80,
  trainWidth: 24,
  trainHeight: 10,
  stationStopThreshold: 15,
  hoverHitRadius: 17, // stationRadius + 8
};

const MOBILE_CONFIG: MapConfig = {
  lineSpeed: 0.54,
  segmentLength: 35,
  maxLines: 8,
  stationRadius: 6,
  lineWidth: 3,
  minBranchDistance: 60,
  minStationDistance: 30,
  maxLineLength: 250,
  padding: 20,
  initialLines: 3,
  nearbyStationDistance: 50,
  trainWidth: 16,
  trainHeight: 7,
  stationStopThreshold: 10,
  hoverHitRadius: 14, // stationRadius + 8
};

interface RGB {
  r: number;
  g: number;
  b: number;
}

interface Point {
  x: number;
  y: number;
}

interface Station {
  x: number;
  y: number;
  isJunction: boolean;
  scale: number; // 0 to 1, for grow-in animation
  createdAt: number; // timestamp for animation
  hoverScale: number; // 0-1, for hover grow effect
  glowIntensity: number; // 0-1, for glow effect
  pulsePhase: number; // 0-2π, for idle breathing animation
}

interface MetroLine {
  id: number; // Unique identifier
  name: string; // Transit line name for legend
  location: string; // City/region for legend
  wiki: string; // Wikipedia URL
  baseColor: string; // Original assigned color
  currentColor: RGB; // Current display color (for lerping)
  targetColor: RGB; // Target color to lerp towards
  points: Point[];
  currentDirection: number;
  growing: boolean;
  progress: number;
  totalLength: number;
  lastBranchDistance: number;
  lastStationDistance: number; // Track distance since last station
  stations: Station[];
  // Timing for natural growth animation
  createdAt: number; // When this line was created
  growthDelay: number; // Delay before line starts growing (ms)
  growthDuration: number; // How long the growth animation takes (ms)
  // Corridor tracking for parallel line stacking
  corridorSegmentIndices: number[]; // Which corridor segments this line participates in
}

// Corridor segment shared by multiple lines (for parallel line stacking)
interface CorridorSegment {
  startPoint: Point;
  endPoint: Point;
  direction: number; // 0-7 octilinear
  lineIds: Set<number>;
  assignedOffsets: Map<number, number>; // lineId -> offset (-1, 0, 1, etc.)
}

interface ClickWave {
  origin: Point;
  startTime: number;
  radius: number;
}

interface Train {
  line: MetroLine;
  distanceAlongLine: number; // Current position as distance from start of line
  direction: 1 | -1; // 1 = forward along line, -1 = backward
  x: number;
  y: number;
  targetX: number; // Target position for smooth interpolation
  targetY: number;
  angle: number; // rotation angle in radians
  targetAngle: number; // Target angle for smooth rotation
  waiting: boolean; // true when stopped at station
  waitEndTime: number; // when to resume moving
  lastStoppedAt: Station | null; // prevent stopping at same station twice in a row
  lineLength: number; // cached total length of line.points
  stationDistances: number[]; // distance along line for each station
  speed: number; // Current speed (for acceleration/deceleration)
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
  return { r: 255, g: 255, b: 255 };
}

function rgbToHex(rgb: RGB): string {
  const toHex = (n: number) =>
    Math.round(Math.min(255, Math.max(0, n)))
      .toString(16)
      .padStart(2, "0");
  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
}

function lerpColor(from: RGB, to: RGB, t: number): RGB {
  return {
    r: from.r + (to.r - from.r) * t,
    g: from.g + (to.g - from.g) * t,
    b: from.b + (to.b - from.b) * t,
  };
}

// Shift a color towards another color (for music/hover reactivity)
function shiftColorTowards(base: RGB, target: RGB, amount: number): RGB {
  return lerpColor(base, target, amount);
}

function distance(a: Point, b: Point): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

// Calculate total length of a polyline
function calculateLineLength(points: Point[]): number {
  let length = 0;
  for (let i = 0; i < points.length - 1; i++) {
    length += distance(points[i], points[i + 1]);
  }
  return length;
}

// Get position and angle along a polyline at a given distance from start
function getPositionAtDistance(
  points: Point[],
  targetDist: number
): { x: number; y: number; angle: number } {
  if (points.length < 2) {
    return { x: points[0]?.x || 0, y: points[0]?.y || 0, angle: 0 };
  }

  let accumulatedDist = 0;

  for (let i = 0; i < points.length - 1; i++) {
    const segmentLength = distance(points[i], points[i + 1]);

    if (
      accumulatedDist + segmentLength >= targetDist ||
      i === points.length - 2
    ) {
      // We're on this segment
      const segmentProgress =
        segmentLength > 0
          ? Math.min(
              1,
              Math.max(0, (targetDist - accumulatedDist) / segmentLength)
            )
          : 0;
      const x = points[i].x + (points[i + 1].x - points[i].x) * segmentProgress;
      const y = points[i].y + (points[i + 1].y - points[i].y) * segmentProgress;
      const angle = Math.atan2(
        points[i + 1].y - points[i].y,
        points[i + 1].x - points[i].x
      );
      return { x, y, angle };
    }

    accumulatedDist += segmentLength;
  }

  // Fallback to end
  const lastIdx = points.length - 1;
  const angle = Math.atan2(
    points[lastIdx].y - points[lastIdx - 1].y,
    points[lastIdx].x - points[lastIdx - 1].x
  );
  return { x: points[lastIdx].x, y: points[lastIdx].y, angle };
}

// Find the distance along a line where a point is closest
function findDistanceAlongLine(points: Point[], target: Point): number {
  let bestDist = Infinity;
  let bestDistanceAlong = 0;
  let accumulatedDist = 0;

  for (let i = 0; i < points.length - 1; i++) {
    const segmentLength = distance(points[i], points[i + 1]);

    // Check distance to this segment
    // Project target onto segment
    const dx = points[i + 1].x - points[i].x;
    const dy = points[i + 1].y - points[i].y;

    if (segmentLength > 0) {
      let t =
        ((target.x - points[i].x) * dx + (target.y - points[i].y) * dy) /
        (segmentLength * segmentLength);
      t = Math.max(0, Math.min(1, t));

      const projX = points[i].x + t * dx;
      const projY = points[i].y + t * dy;
      const dist = distance({ x: projX, y: projY }, target);

      if (dist < bestDist) {
        bestDist = dist;
        bestDistanceAlong = accumulatedDist + t * segmentLength;
      }
    }

    accumulatedDist += segmentLength;
  }

  return bestDistanceAlong;
}

// Random wait time between min and max
function randomWaitTime(): number {
  return TRAIN_MIN_WAIT + Math.random() * (TRAIN_MAX_WAIT - TRAIN_MIN_WAIT);
}

// Calculate center weight score for a direction from a given position
// Returns positive score if direction moves toward center, negative if away
// Score is scaled by how far from center the point currently is
function getCenterWeightScore(
  position: Point,
  direction: number,
  canvasCenter: Point,
  segmentLength: number
): number {
  const dir = DIRECTIONS[direction];
  const newPos = {
    x: position.x + dir.dx * segmentLength,
    y: position.y + dir.dy * segmentLength,
  };

  const currentDistFromCenter = distance(position, canvasCenter);
  const newDistFromCenter = distance(newPos, canvasCenter);

  // Positive if moving toward center, negative if away
  const improvement = currentDistFromCenter - newDistFromCenter;

  // Scale the score by how far we are from center (stronger pull when far away)
  const distanceScale = currentDistFromCenter / 200; // Normalize by typical canvas distance

  return improvement * (1 + distanceScale);
}

// Select a direction using weighted random based on center weights
function selectWeightedDirection(
  availableDirs: number[],
  position: Point,
  canvasCenter: Point,
  segmentLength: number
): number {
  if (availableDirs.length === 0) return 0;
  if (availableDirs.length === 1) return availableDirs[0];

  // Calculate scores for each direction
  const scores = availableDirs.map((dir) =>
    getCenterWeightScore(position, dir, canvasCenter, segmentLength)
  );

  // Convert scores to exponential weights (higher score = higher probability)
  // Add a baseline so all directions have some chance
  const weights = scores.map((score) =>
    Math.exp(score * CENTER_WEIGHT_STRENGTH)
  );

  // Calculate total weight
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);

  // Weighted random selection
  let random = Math.random() * totalWeight;
  for (let i = 0; i < availableDirs.length; i++) {
    random -= weights[i];
    if (random <= 0) {
      return availableDirs[i];
    }
  }

  // Fallback to last direction
  return availableDirs[availableDirs.length - 1];
}

// Get valid directions for branching (perpendicular or near-perpendicular)
function getValidBranchDirections(currentDir: number): number[] {
  const perpendicular1 = (currentDir + 2) % 8;
  const perpendicular2 = (currentDir + 6) % 8;
  const diagonal1 = (currentDir + 3) % 8;
  const diagonal2 = (currentDir + 5) % 8;
  return [perpendicular1, perpendicular2, diagonal1, diagonal2];
}

// Get valid directions for continuing (same, or slight turn)
function getValidContinueDirections(currentDir: number): number[] {
  return [
    currentDir,
    currentDir,
    currentDir,
    currentDir,
    currentDir, // Weight heavily towards continuing straight
    (currentDir + 1) % 8,
    (currentDir + 7) % 8,
  ];
}

function isInBounds(
  x: number,
  y: number,
  bounds: { left: number; right: number; top: number; bottom: number }
): boolean {
  return (
    x > bounds.left && x < bounds.right && y > bounds.top && y < bounds.bottom
  );
}

interface Props {
  variant?: "full" | "contained";
}

export default function MetroMap({ variant = "full" }: Props) {
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

    let canvasWidth = 0;
    let canvasHeight = 0;
    let animationId: number;
    let lines: MetroLine[] = [];
    let allStations: Station[] = [];
    // Initialize with theme-appropriate colors
    let currentLineColors = getThemeLineColors();
    let availableColors = [...currentLineColors];
    let palette = [...currentLineColors];
    let globalOpacity = 0;
    let drawBounds = { left: 0, right: 0, top: 0, bottom: 0 };
    let hubCenter: Point = { x: 0, y: 0 };

    // Theme colors - updated when theme changes
    let themeColors: ThemeColors = getThemeColors();

    // Global color shift from music/hover
    let globalColorShift: RGB | null = null;
    let colorShiftIntensity = 0;
    let targetColorShiftIntensity = 0; // Target for smooth fade in/out

    // Viewport-dependent config (set during resize)
    let config: MapConfig = DESKTOP_CONFIG;
    let isMobile = false;

    // Mouse tracking for hover effects (works with pointer-events-none via window events)
    let mousePosition: Point | null = null;
    let hoveredStation: Station | null = null;
    let clickWaves: ClickWave[] = [];

    // Train simulation
    let trains: Train[] = [];
    let lastTrainSpawnCheck = 0;

    // Corridor tracking for parallel line stacking
    let corridorSegments: CorridorSegment[] = [];
    let lineIdCounter = 0;
    let segmentGrid: Map<string, number[]> = new Map(); // Spatial index for O(1) lookup

    // Pre-selected transit lines (one per location, selected at init)
    let plannedLines: TransitLineInfo[] = [];
    let plannedColors: string[] = [];

    // Legend interaction
    interface LegendItem {
      x: number;
      y: number;
      width: number;
      height: number;
      wiki: string;
    }
    let legendItems: LegendItem[] = [];
    let hoveredLegendIndex = -1;

    const getNextColor = (): string => {
      if (availableColors.length === 0) {
        availableColors = [...palette];
      }
      const index = Math.floor(Math.random() * availableColors.length);
      return availableColors.splice(index, 1)[0];
    };

    const canPlaceStation = (pos: Point): boolean => {
      for (const station of allStations) {
        if (distance(pos, station) < config.minStationDistance) {
          return false;
        }
      }
      return true;
    };

    const addStation = (
      line: MetroLine,
      pos: Point,
      isJunction: boolean
    ): boolean => {
      if (canPlaceStation(pos)) {
        const station: Station = {
          x: pos.x,
          y: pos.y,
          isJunction,
          scale: 0, // Start at 0, will grow
          createdAt: performance.now(),
          hoverScale: 0,
          glowIntensity: 0,
          pulsePhase: Math.random() * Math.PI * 2, // Random starting phase for breathing
        };
        line.stations.push(station);
        allStations.push(station);
        line.lastStationDistance = 0;
        return true;
      }
      return false;
    };

    // Spatial grid helpers for corridor detection
    const getGridCell = (point: Point): string => {
      const cellSize = config.segmentLength;
      const cellX = Math.floor(point.x / cellSize);
      const cellY = Math.floor(point.y / cellSize);
      return `${cellX},${cellY}`;
    };

    const addToGrid = (segmentIndex: number, point: Point) => {
      const cell = getGridCell(point);
      if (!segmentGrid.has(cell)) {
        segmentGrid.set(cell, []);
      }
      segmentGrid.get(cell)!.push(segmentIndex);
    };

    const getNearbyCandidates = (point: Point): number[] => {
      const cellSize = config.segmentLength;
      const cellX = Math.floor(point.x / cellSize);
      const cellY = Math.floor(point.y / cellSize);
      const candidates: number[] = [];

      // Check 3x3 grid of cells around point
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          const cell = `${cellX + dx},${cellY + dy}`;
          const segs = segmentGrid.get(cell);
          if (segs) {
            candidates.push(...segs);
          }
        }
      }
      return candidates;
    };

    // Calculate perpendicular distance from a point to a line segment
    const perpendicularDistance = (
      testStart: Point,
      testEnd: Point,
      seg: CorridorSegment
    ): number => {
      // Calculate midpoint of test segment
      const testMid = {
        x: (testStart.x + testEnd.x) / 2,
        y: (testStart.y + testEnd.y) / 2,
      };

      // Calculate midpoint of existing segment
      const segMid = {
        x: (seg.startPoint.x + seg.endPoint.x) / 2,
        y: (seg.startPoint.y + seg.endPoint.y) / 2,
      };

      // Distance between midpoints
      return distance(testMid, segMid);
    };

    // Reassign offsets symmetrically around center
    const reassignOffsets = (segment: CorridorSegment) => {
      const lineIds = Array.from(segment.lineIds).sort((a, b) => a - b);
      const count = lineIds.length;
      for (let i = 0; i < count; i++) {
        segment.assignedOffsets.set(lineIds[i], i - (count - 1) / 2);
      }
    };

    // Get perpendicular offset point
    const getOffsetPoint = (
      point: Point,
      direction: number,
      offsetMultiplier: number
    ): Point => {
      const perpDir = (direction + 2) % 8; // 90 degrees clockwise
      const perp = DIRECTIONS[perpDir];
      const dist = (config.lineWidth + 2) * offsetMultiplier;
      return {
        x: point.x + perp.dx * dist,
        y: point.y + perp.dy * dist,
      };
    };

    // Detect corridor sharing when a segment completes
    const detectCorridorSharing = (
      line: MetroLine,
      start: Point,
      end: Point,
      direction: number
    ) => {
      const parallelDirs = [direction, (direction + 4) % 8]; // Same or opposite direction
      const threshold = config.segmentLength * 0.8; // Close enough to be parallel

      // Check nearby segments via spatial grid
      const nearby = getNearbyCandidates(start);
      for (const segId of nearby) {
        const seg = corridorSegments[segId];
        if (!seg || seg.lineIds.has(line.id)) continue;
        if (
          !parallelDirs.includes(seg.direction) &&
          !parallelDirs.includes((seg.direction + 4) % 8)
        )
          continue;

        if (perpendicularDistance(start, end, seg) < threshold) {
          seg.lineIds.add(line.id);
          reassignOffsets(seg);
          if (!line.corridorSegmentIndices.includes(segId)) {
            line.corridorSegmentIndices.push(segId);
          }
        }
      }

      // Create new segment entry for this line
      const newSeg: CorridorSegment = {
        startPoint: { ...start },
        endPoint: { ...end },
        direction,
        lineIds: new Set([line.id]),
        assignedOffsets: new Map([[line.id, 0]]),
      };
      corridorSegments.push(newSeg);
      const newIndex = corridorSegments.length - 1;
      line.corridorSegmentIndices.push(newIndex);
      addToGrid(newIndex, start);
    };

    // Get offset for a line at a specific segment position
    const getCorridorOffsetForSegment = (
      line: MetroLine,
      segmentIndex: number
    ): number => {
      // Find corridor segment that contains this segment
      const corridorIdx = line.corridorSegmentIndices[segmentIndex];
      if (corridorIdx !== undefined) {
        const corridor = corridorSegments[corridorIdx];
        if (corridor) {
          return corridor.assignedOffsets.get(line.id) || 0;
        }
      }
      return 0;
    };

    const createLineFromHub = (direction: number, index: number): MetroLine => {
      const id = lineIdCounter++;
      const transitInfo = plannedLines[id % plannedLines.length];
      const color = plannedColors[id % plannedColors.length];
      const rgb = parseColor(color);
      const now = performance.now();
      return {
        id,
        name: transitInfo.name,
        location: transitInfo.location,
        wiki: transitInfo.wiki,
        baseColor: color,
        currentColor: { ...rgb },
        targetColor: { ...rgb },
        // Two points: fixed start at hub, and moving tip (starts at same position)
        points: [{ ...hubCenter }, { ...hubCenter }],
        currentDirection: direction,
        growing: true,
        progress: 0,
        totalLength: 0,
        lastBranchDistance: 0,
        lastStationDistance: 0,
        stations: [],
        // Stagger initial lines with small delays
        createdAt: now,
        growthDelay: index * 300 + Math.random() * 200, // 0-200ms, 300-500ms, 600-800ms...
        growthDuration: 1500 + Math.random() * 1000, // 1.5-2.5 seconds to reach max length
        corridorSegmentIndices: [],
      };
    };

    const createBranchLine = (
      branchPoint: Point,
      direction: number
    ): MetroLine => {
      const id = lineIdCounter++;
      const transitInfo = plannedLines[id % plannedLines.length];
      const color = plannedColors[id % plannedColors.length];
      const rgb = parseColor(color);
      const now = performance.now();
      return {
        id,
        name: transitInfo.name,
        location: transitInfo.location,
        wiki: transitInfo.wiki,
        baseColor: color,
        currentColor: { ...rgb },
        targetColor: { ...rgb },
        // Two points: fixed start at branch point, and moving tip
        points: [{ ...branchPoint }, { ...branchPoint }],
        currentDirection: direction,
        growing: true,
        progress: 0,
        totalLength: 0,
        lastBranchDistance: 0,
        lastStationDistance: 0,
        stations: [],
        // Random delay for branches to feel organic
        createdAt: now,
        growthDelay: 200 + Math.random() * 600, // 200-800ms delay before growing
        growthDuration: 1200 + Math.random() * 800, // 1.2-2 seconds growth
        corridorSegmentIndices: [],
      };
    };

    const initializeMap = () => {
      const boundsWidth = drawBounds.right - drawBounds.left;
      const boundsHeight = drawBounds.bottom - drawBounds.top;
      hubCenter = {
        x: drawBounds.left + boundsWidth * 0.5,
        y: drawBounds.top + boundsHeight * 0.5,
      };

      lines = [];
      allStations = [];
      availableColors = [...palette];
      globalOpacity = 0;
      globalColorShift = null;
      colorShiftIntensity = 0;
      targetColorShiftIntensity = 0;
      clickWaves = [];
      hoveredStation = null;
      trains = [];
      lastTrainSpawnCheck = 0;
      // Reset corridor tracking
      corridorSegments = [];
      lineIdCounter = 0;
      segmentGrid = new Map();
      legendItems = [];
      hoveredLegendIndex = -1;

      // Pre-select transit lines (one per location) and colors
      plannedLines = selectLinesOnePerLocation(config.maxLines);
      plannedColors = [];
      const shuffledColors = [...palette].sort(() => Math.random() - 0.5);
      for (let i = 0; i < plannedLines.length; i++) {
        plannedColors.push(shuffledColors[i % shuffledColors.length]);
      }

      // Create central hub station (belongs to no line initially, drawn separately)
      const hubStation: Station = {
        x: hubCenter.x,
        y: hubCenter.y,
        isJunction: true,
        scale: 1, // Hub starts fully visible
        createdAt: 0,
        hoverScale: 0,
        glowIntensity: 0,
        pulsePhase: 0,
      };
      allStations.push(hubStation);

      // Create initial lines fanning out from hub
      const startDirections = [0, 2, 4, 6]; // E, N, W, S - balanced spread from centered hub
      for (let i = 0; i < config.initialLines; i++) {
        const dir = startDirections[i % startDirections.length];
        const line = createLineFromHub(dir, i);
        // First line owns the hub station for drawing purposes
        if (i === 0) {
          line.stations.push(hubStation);
        }
        lines.push(line);
      }
    };

    const updateLine = (line: MetroLine): MetroLine | null => {
      if (!line.growing) return null;

      const now = performance.now();
      const elapsed = now - line.createdAt;

      // Wait for delay before growing
      if (elapsed < line.growthDelay) {
        return null;
      }

      // Calculate eased speed based on growth progress
      const growthElapsed = elapsed - line.growthDelay;
      const growthProgress = Math.min(1, growthElapsed / line.growthDuration);

      // Use easing derivative for speed: starts fast, slows down
      // Derivative of easeOutCubic is 3(1-t)^2, normalized
      const easedSpeedMultiplier = 3 * Math.pow(1 - growthProgress, 2);
      const effectiveSpeed =
        config.lineSpeed * Math.max(0.3, easedSpeedMultiplier);

      const dir = DIRECTIONS[line.currentDirection];
      const lastPoint = line.points[line.points.length - 1];

      line.progress += effectiveSpeed;
      line.totalLength += effectiveSpeed;
      line.lastBranchDistance += effectiveSpeed;
      line.lastStationDistance += effectiveSpeed;

      const newX = lastPoint.x + dir.dx * effectiveSpeed;
      const newY = lastPoint.y + dir.dy * effectiveSpeed;

      // Check bounds
      if (!isInBounds(newX, newY, drawBounds)) {
        line.growing = false;
        addStation(line, lastPoint, false);
        return null;
      }

      // Check max length
      if (line.totalLength >= config.maxLineLength) {
        line.growing = false;
        addStation(line, { x: newX, y: newY }, false);
        return null;
      }

      // Update last point (line grows)
      line.points[line.points.length - 1] = { x: newX, y: newY };

      // Check if we've completed a segment
      if (line.progress >= config.segmentLength) {
        line.progress = 0;

        // Potentially change direction - avoid parallel and crossing lines
        const continueDirs = getValidContinueDirections(line.currentDirection);
        const position = { x: newX, y: newY };

        // Filter out directions that would be parallel to nearby lines
        const nonParallelDirs = continueDirs.filter(
          (dir) => !isDirectionParallelToNearbyLines(line, position, dir)
        );

        // Also filter out directions that would cross existing lines
        const nonCrossingDirs = nonParallelDirs.filter(
          (dir) => !wouldCrossExistingLine(line, position, dir)
        );

        // Use non-crossing directions if available, fall back to non-parallel, then original
        const availableDirs =
          nonCrossingDirs.length > 0
            ? nonCrossingDirs
            : nonParallelDirs.length > 0
              ? nonParallelDirs
              : continueDirs;
        // Use center-weighted selection to bias growth toward canvas center
        const canvasCenter = {
          x: (drawBounds.left + drawBounds.right) / 2,
          y: (drawBounds.top + drawBounds.bottom) / 2,
        };
        const newDir = selectWeightedDirection(
          availableDirs,
          position,
          canvasCenter,
          config.segmentLength
        );

        if (newDir !== line.currentDirection) {
          line.points.push({ x: newX, y: newY });
          line.currentDirection = newDir;
        }

        // Try to branch
        if (
          lines.length < config.maxLines &&
          line.lastBranchDistance >= config.minBranchDistance &&
          Math.random() < BRANCH_PROBABILITY
        ) {
          const branchDirs = getValidBranchDirections(line.currentDirection);
          // Filter branch directions to avoid parallel lines and crossings
          const nonParallelBranchDirs = branchDirs.filter(
            (dir) => !isDirectionParallelToNearbyLines(line, position, dir)
          );
          const nonCrossingBranchDirs = nonParallelBranchDirs.filter(
            (dir) => !wouldCrossExistingLine(line, position, dir)
          );
          const candidateBranchDirs =
            nonCrossingBranchDirs.length > 0
              ? nonCrossingBranchDirs
              : nonParallelBranchDirs.length > 0
                ? nonParallelBranchDirs
                : branchDirs;

          // Sort by center weight (best direction first) for branch selection
          const branchCanvasCenter = {
            x: (drawBounds.left + drawBounds.right) / 2,
            y: (drawBounds.top + drawBounds.bottom) / 2,
          };
          const sortedByWeight = [...candidateBranchDirs].sort((a, b) => {
            const scoreA = getCenterWeightScore(
              position,
              a,
              branchCanvasCenter,
              config.segmentLength
            );
            const scoreB = getCenterWeightScore(
              position,
              b,
              branchCanvasCenter,
              config.segmentLength
            );
            return scoreB - scoreA; // Higher score first
          });

          for (const branchDir of sortedByWeight) {
            const testX =
              newX + DIRECTIONS[branchDir].dx * config.segmentLength;
            const testY =
              newY + DIRECTIONS[branchDir].dy * config.segmentLength;

            if (isInBounds(testX, testY, drawBounds)) {
              line.lastBranchDistance = 0;
              // Junction station where branch occurs
              if (addStation(line, { x: newX, y: newY }, true)) {
                return createBranchLine({ x: newX, y: newY }, branchDir);
              }
            }
          }
        }

        // Add station along the line periodically (lines grow, stations appear on them)
        // Stations appear more frequently near the start, less as line extends
        const stationChance =
          line.lastStationDistance > config.segmentLength * 1.5 ? 0.4 : 0.15;
        if (
          Math.random() < stationChance &&
          line.totalLength > config.segmentLength
        ) {
          addStation(line, { x: newX, y: newY }, false);
        }
      }

      return null;
    };

    const updateColors = () => {
      // Update each line's current color towards its target
      for (const line of lines) {
        line.currentColor = lerpColor(
          line.currentColor,
          line.targetColor,
          COLOR_LERP_SPEED
        );
      }

      // Lerp colorShiftIntensity towards target for smooth fade in/out
      colorShiftIntensity +=
        (targetColorShiftIntensity - colorShiftIntensity) *
        COLOR_SHIFT_LERP_SPEED;

      // Decay the target over time (gradual fade out)
      if (targetColorShiftIntensity > 0) {
        targetColorShiftIntensity -= 0.003;
        if (targetColorShiftIntensity < 0) targetColorShiftIntensity = 0;
      }
    };

    const updateStations = () => {
      // Grow stations that aren't fully visible yet
      for (const station of allStations) {
        if (station.scale < 1) {
          station.scale += STATION_GROW_SPEED;
          if (station.scale > 1) station.scale = 1;
        }
      }
    };

    // Find station under mouse cursor
    const findHoveredStation = (): Station | null => {
      if (!mousePosition) return null;
      for (const station of allStations) {
        if (distance(mousePosition, station) < config.hoverHitRadius) {
          return station;
        }
      }
      return null;
    };

    // Update hover effects and animations
    const updateHoverEffects = () => {
      hoveredStation = findHoveredStation();

      for (const station of allStations) {
        // Update idle breathing animation
        station.pulsePhase += IDLE_PULSE_SPEED;
        if (station.pulsePhase > Math.PI * 2) {
          station.pulsePhase -= Math.PI * 2;
        }

        // Determine target hover scale based on state
        let targetHoverScale = 0;

        if (station === hoveredStation) {
          // Directly hovered station gets full effect
          targetHoverScale = 1;
        } else if (hoveredStation) {
          // Check if this station is near the hovered one
          const dist = distance(station, hoveredStation);
          if (dist < config.nearbyStationDistance) {
            targetHoverScale = NEARBY_INFLUENCE;
          }
        }

        // Check if station is affected by click wave
        for (const wave of clickWaves) {
          const dist = distance(station, wave.origin);
          const waveFront = wave.radius;
          const waveWidth = 40; // How wide the wave effect is
          if (dist > waveFront - waveWidth && dist < waveFront + waveWidth) {
            // Station is within the wave - boost its glow
            const waveIntensity = 1 - Math.abs(dist - waveFront) / waveWidth;
            station.glowIntensity = Math.max(
              station.glowIntensity,
              waveIntensity * 0.8
            );
          }
        }

        // Lerp hover scale towards target
        station.hoverScale +=
          (targetHoverScale - station.hoverScale) * HOVER_LERP_SPEED;

        // Update glow intensity based on hover scale, but let it decay smoothly
        const targetGlow = station.hoverScale;
        if (targetGlow > station.glowIntensity) {
          station.glowIntensity +=
            (targetGlow - station.glowIntensity) * HOVER_LERP_SPEED;
        } else {
          station.glowIntensity +=
            (targetGlow - station.glowIntensity) * HOVER_LERP_SPEED * 0.5;
        }
      }
    };

    // Update click waves
    const updateClickWaves = () => {
      const now = performance.now();
      clickWaves = clickWaves.filter((wave) => {
        const elapsed = now - wave.startTime;
        if (elapsed > WAVE_DURATION) return false;
        wave.radius = (elapsed / 1000) * WAVE_SPEED;
        return true;
      });
    };

    // Create a train for a line
    const createTrain = (line: MetroLine): Train | null => {
      if (line.stations.length < MIN_STATIONS_FOR_TRAIN) return null;
      if (line.points.length < 2) return null;

      // Calculate total line length
      const lineLength = calculateLineLength(line.points);
      if (lineLength < 10) return null;

      // Calculate distance along line for each station
      const stationDistances = line.stations.map((station) =>
        findDistanceAlongLine(line.points, station)
      );

      // Start at the first station
      const startDist = stationDistances[0] || 0;
      const pos = getPositionAtDistance(line.points, startDist);

      return {
        line,
        distanceAlongLine: startDist,
        direction: 1,
        x: pos.x,
        y: pos.y,
        targetX: pos.x,
        targetY: pos.y,
        angle: pos.angle,
        targetAngle: pos.angle,
        waiting: true,
        waitEndTime: performance.now() + randomWaitTime(),
        lastStoppedAt: line.stations[0],
        lineLength,
        stationDistances,
        speed: 0, // Start stationary
      };
    };

    // Check if we should spawn trains for lines that have enough stations
    const checkTrainSpawning = () => {
      const now = performance.now();
      if (now - lastTrainSpawnCheck < 500) return; // Check every 500ms
      lastTrainSpawnCheck = now;

      for (const line of lines) {
        // Check if this line already has a train
        const hasTrain = trains.some((t) => t.line === line);
        if (hasTrain) continue;

        // Line must be done growing and have enough stations
        if (!line.growing && line.stations.length >= MIN_STATIONS_FOR_TRAIN) {
          const train = createTrain(line);
          if (train) {
            trains.push(train);
          }
        }
      }
    };

    // Update all trains with smooth movement
    const updateTrains = () => {
      const now = performance.now();
      const ACCELERATION = 0.015; // Speed increase per frame
      const DECELERATION = 0.025; // Speed decrease per frame (faster braking)
      const APPROACH_DISTANCE = 40; // Start slowing down this far from station
      const POSITION_LERP = 0.15; // Smooth position interpolation

      for (const train of trains) {
        const { line } = train;
        if (line.points.length < 2) continue;

        // If waiting at station
        if (train.waiting) {
          if (now >= train.waitEndTime) {
            train.waiting = false;
            train.speed = 0; // Reset speed when starting
          } else {
            // Smoothly interpolate position even when waiting
            train.x += (train.targetX - train.x) * POSITION_LERP;
            train.y += (train.targetY - train.y) * POSITION_LERP;
            continue;
          }
        }

        // Find distance to nearest upcoming station
        let nearestStationDist = Infinity;
        let nearestStation: Station | null = null;
        for (let i = 0; i < line.stations.length; i++) {
          const station = line.stations[i];
          const stationDist = train.stationDistances[i];

          // Skip the station we just left
          if (station === train.lastStoppedAt) continue;

          // Check if station is ahead in our direction
          const distToStation =
            (stationDist - train.distanceAlongLine) * train.direction;
          if (distToStation > 0 && distToStation < nearestStationDist) {
            nearestStationDist = distToStation;
            nearestStation = station;
          }
        }

        // Adjust speed: accelerate when far, decelerate when near station
        if (nearestStationDist < APPROACH_DISTANCE && nearestStation) {
          // Slow down approaching station
          const slowdownFactor = nearestStationDist / APPROACH_DISTANCE;
          const targetSpeed = TRAIN_MAX_SPEED * slowdownFactor * 0.5;
          if (train.speed > targetSpeed) {
            train.speed = Math.max(targetSpeed, train.speed - DECELERATION);
          }
        } else {
          // Accelerate towards max speed
          if (train.speed < TRAIN_MAX_SPEED) {
            train.speed = Math.min(TRAIN_MAX_SPEED, train.speed + ACCELERATION);
          }
        }

        // Move train along line
        train.distanceAlongLine += train.speed * train.direction;

        // Check bounds - reverse at ends
        if (train.distanceAlongLine <= 0) {
          train.distanceAlongLine = 0;
          train.direction = 1;
          train.speed = 0;
        } else if (train.distanceAlongLine >= train.lineLength) {
          train.distanceAlongLine = train.lineLength;
          train.direction = -1;
          train.speed = 0;
        }

        // Check if we're near any station we haven't just stopped at
        for (let i = 0; i < line.stations.length; i++) {
          const station = line.stations[i];
          const stationDist = train.stationDistances[i];

          // Check if we're close to this station
          if (Math.abs(train.distanceAlongLine - stationDist) < 3) {
            // Don't stop at the same station we just left
            if (station !== train.lastStoppedAt) {
              train.waiting = true;
              train.waitEndTime = now + randomWaitTime();
              train.lastStoppedAt = station;
              train.speed = 0;
              break;
            }
          }
        }

        // Calculate target position based on distance along line
        const pos = getPositionAtDistance(line.points, train.distanceAlongLine);
        train.targetX = pos.x;
        train.targetY = pos.y;

        // Smoothly interpolate actual position towards target
        train.x += (train.targetX - train.x) * POSITION_LERP;
        train.y += (train.targetY - train.y) * POSITION_LERP;

        // Calculate and smooth the angle - trains don't rotate 180° when reversing
        // They just move backward along the track, keeping their orientation
        const targetAngle = pos.angle;

        // Handle angle wrapping for smooth rotation
        let angleDiff = targetAngle - train.angle;
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
        train.angle += angleDiff * POSITION_LERP;
      }
    };

    // Handle mouse move (window-level for pointer-events-none canvas)
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mousePosition = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    // Handle mouse leave
    const handleMouseLeave = () => {
      mousePosition = null;
    };

    // Handle click for color wave or legend item
    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const clickPos: Point = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };

      // Check if click is on a legend item first
      for (const item of legendItems) {
        if (
          clickPos.x >= item.x &&
          clickPos.x <= item.x + item.width &&
          clickPos.y >= item.y &&
          clickPos.y <= item.y + item.height
        ) {
          // Open Wikipedia article in new tab
          window.open(item.wiki, "_blank", "noopener,noreferrer");
          return;
        }
      }

      // Check if click is on a station
      for (const station of allStations) {
        if (distance(clickPos, station) < config.hoverHitRadius) {
          clickWaves.push({
            origin: { x: station.x, y: station.y },
            startTime: performance.now(),
            radius: 0,
          });
          break;
        }
      }
    };

    // Get display color for a line (with global color shift applied)
    const getLineDisplayColor = (line: MetroLine): RGB => {
      let displayColor = line.currentColor;
      if (globalColorShift && colorShiftIntensity > 0) {
        displayColor = shiftColorTowards(
          line.currentColor,
          globalColorShift,
          colorShiftIntensity * 0.4
        );
      }
      return displayColor;
    };

    // Calculate direction from point a to point b (returns 0-7 octilinear index)
    const getSegmentDirection = (a: Point, b: Point): number => {
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const angle = Math.atan2(dy, dx);
      // Convert angle to 0-7 direction index
      // 0 = East, 2 = North, 4 = West, 6 = South
      const normalizedAngle = (angle + Math.PI * 2) % (Math.PI * 2);
      return Math.round(normalizedAngle / (Math.PI / 4)) % 8;
    };

    // Check if a direction would be parallel to nearby existing lines
    const isDirectionParallelToNearbyLines = (
      currentLine: MetroLine,
      position: Point,
      direction: number
    ): boolean => {
      const parallelDirs = [direction, (direction + 4) % 8]; // Same or opposite

      for (const otherLine of lines) {
        if (otherLine.id === currentLine.id) continue;

        // Check each segment of the other line
        for (let j = 0; j < otherLine.points.length - 1; j++) {
          const segStart = otherLine.points[j];
          const segEnd = otherLine.points[j + 1];

          // Check if segment is close enough
          const segMid = {
            x: (segStart.x + segEnd.x) / 2,
            y: (segStart.y + segEnd.y) / 2,
          };
          if (distance(position, segMid) > PARALLEL_AVOIDANCE_DISTANCE)
            continue;

          // Check if parallel
          const otherDir = getSegmentDirection(segStart, segEnd);
          if (parallelDirs.includes(otherDir)) {
            return true;
          }
        }
      }
      return false;
    };

    // Check if two line segments intersect (excluding endpoints)
    const segmentsIntersect = (
      p1: Point,
      p2: Point, // First segment
      p3: Point,
      p4: Point // Second segment
    ): boolean => {
      // Using cross product method
      const d1 = (p4.x - p3.x) * (p1.y - p3.y) - (p4.y - p3.y) * (p1.x - p3.x);
      const d2 = (p4.x - p3.x) * (p2.y - p3.y) - (p4.y - p3.y) * (p2.x - p3.x);
      const d3 = (p2.x - p1.x) * (p3.y - p1.y) - (p2.y - p1.y) * (p3.x - p1.x);
      const d4 = (p2.x - p1.x) * (p4.y - p1.y) - (p2.y - p1.y) * (p4.x - p1.x);

      // Check if segments straddle each other
      if (
        ((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) &&
        ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0))
      ) {
        return true;
      }
      return false;
    };

    // Check if a proposed segment would cross any existing line
    const wouldCrossExistingLine = (
      currentLine: MetroLine,
      start: Point,
      direction: number
    ): boolean => {
      const dir = DIRECTIONS[direction];
      const end = {
        x: start.x + dir.dx * config.segmentLength,
        y: start.y + dir.dy * config.segmentLength,
      };

      for (const otherLine of lines) {
        // Check all segments of other lines
        for (let j = 0; j < otherLine.points.length - 1; j++) {
          const segStart = otherLine.points[j];
          const segEnd = otherLine.points[j + 1];

          // Skip if segment is too far away (optimization)
          const segMid = {
            x: (segStart.x + segEnd.x) / 2,
            y: (segStart.y + segEnd.y) / 2,
          };
          if (distance(start, segMid) > config.segmentLength * 2) continue;

          // Skip segments that share our start point (junction points)
          if (
            (Math.abs(segStart.x - start.x) < 5 &&
              Math.abs(segStart.y - start.y) < 5) ||
            (Math.abs(segEnd.x - start.x) < 5 &&
              Math.abs(segEnd.y - start.y) < 5)
          ) {
            continue;
          }

          if (segmentsIntersect(start, end, segStart, segEnd)) {
            return true;
          }
        }
      }
      return false;
    };

    // Draw just the line path (simple, no offsets)
    const drawLinePath = (line: MetroLine, opacity: number) => {
      if (line.points.length < 2) return;

      const { r, g, b } = getLineDisplayColor(line);

      ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${opacity * 0.8})`;
      ctx.lineWidth = config.lineWidth;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      ctx.beginPath();
      ctx.moveTo(line.points[0].x, line.points[0].y);
      for (let i = 1; i < line.points.length; i++) {
        ctx.lineTo(line.points[i].x, line.points[i].y);
      }
      ctx.stroke();
    };

    // Draw click wave rings
    const drawClickWaveRings = (opacity: number) => {
      const now = performance.now();
      for (const wave of clickWaves) {
        const elapsed = now - wave.startTime;
        const progress = elapsed / WAVE_DURATION;
        // Fade out as wave expands
        const waveOpacity = Math.max(0, 1 - progress) * 0.6;

        if (waveOpacity > 0.01 && wave.radius > 0) {
          ctx.beginPath();
          ctx.arc(wave.origin.x, wave.origin.y, wave.radius, 0, Math.PI * 2);
          // Use theme-aware wave color
          const waveBase = themeColors.waveColor.replace(
            /[\d.]+\)$/,
            `${opacity * waveOpacity})`
          );
          ctx.strokeStyle = waveBase;
          ctx.lineWidth = 3;
          ctx.stroke();
        }
      }
    };

    // Draw a single station
    const drawStation = (station: Station, color: RGB, opacity: number) => {
      const { r, g, b } = color;
      const baseRadius = station.isJunction
        ? config.stationRadius + 3
        : config.stationRadius;
      const innerBaseRadius = station.isJunction
        ? config.stationRadius - 1
        : config.stationRadius - 3;

      // Calculate scale with idle pulse and hover effect
      const idlePulse = 1 + Math.sin(station.pulsePhase) * IDLE_PULSE_AMOUNT;
      const hoverBoost = 1 + station.hoverScale * 0.25; // 25% larger on hover
      const totalScale = station.scale * idlePulse * hoverBoost;

      const radius = baseRadius * totalScale;
      const innerRadius = innerBaseRadius * totalScale;

      if (radius > 0) {
        // Draw glow effect if station has glow intensity
        if (station.glowIntensity > 0.01) {
          const glowRadius = radius * 2.5;
          const gradient = ctx.createRadialGradient(
            station.x,
            station.y,
            radius * 0.5,
            station.x,
            station.y,
            glowRadius
          );
          gradient.addColorStop(
            0,
            `rgba(${r}, ${g}, ${b}, ${opacity * station.glowIntensity * 0.5})`
          );
          gradient.addColorStop(
            0.5,
            `rgba(${r}, ${g}, ${b}, ${opacity * station.glowIntensity * 0.2})`
          );
          gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

          ctx.beginPath();
          ctx.arc(station.x, station.y, glowRadius, 0, Math.PI * 2);
          ctx.fillStyle = gradient;
          ctx.fill();
        }

        // Outer circle (line color)
        ctx.beginPath();
        ctx.arc(station.x, station.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
        ctx.fill();

        // Inner circle (theme-aware)
        if (innerRadius > 0) {
          ctx.beginPath();
          ctx.arc(station.x, station.y, innerRadius, 0, Math.PI * 2);
          // Parse theme color to RGB for opacity support
          const innerColor = themeColors.stationInner;
          const match = innerColor.match(
            /^#([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i
          );
          if (match) {
            const ir = parseInt(match[1], 16);
            const ig = parseInt(match[2], 16);
            const ib = parseInt(match[3], 16);
            ctx.fillStyle = `rgba(${ir}, ${ig}, ${ib}, ${opacity * 0.95})`;
          } else {
            ctx.fillStyle = `rgba(255, 255, 255, ${opacity * 0.95})`;
          }
          ctx.fill();
        }
      }
    };

    // Draw all stations for a line (called in second pass)
    const drawLineStations = (line: MetroLine, opacity: number) => {
      const color = getLineDisplayColor(line);
      for (const station of line.stations) {
        drawStation(station, color, opacity);
      }
    };

    // Draw a train
    const drawTrain = (train: Train, opacity: number) => {
      const color = getLineDisplayColor(train.line);
      const { r, g, b } = color;

      ctx.save();
      ctx.translate(train.x, train.y);
      ctx.rotate(train.angle);

      // Draw train body (theme-aware fill with colored outline)
      const halfWidth = config.trainWidth / 2;
      const halfHeight = config.trainHeight / 2;

      // Theme-aware interior color
      const innerColor = themeColors.stationInner;
      const innerMatch = innerColor.match(
        /^#([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i
      );
      if (innerMatch) {
        const ir = parseInt(innerMatch[1], 16);
        const ig = parseInt(innerMatch[2], 16);
        const ib = parseInt(innerMatch[3], 16);
        ctx.fillStyle = `rgba(${ir}, ${ig}, ${ib}, ${opacity * 0.95})`;
      } else {
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity * 0.95})`;
      }
      ctx.fillRect(
        -halfWidth,
        -halfHeight,
        config.trainWidth,
        config.trainHeight
      );

      // Colored outline
      ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
      ctx.lineWidth = 2;
      ctx.strokeRect(
        -halfWidth,
        -halfHeight,
        config.trainWidth,
        config.trainHeight
      );

      ctx.restore();
    };

    // Draw all trains
    const drawTrains = (opacity: number) => {
      for (const train of trains) {
        drawTrain(train, opacity);
      }
    };

    // Find which line a station belongs to
    const findLineForStation = (station: Station): MetroLine | null => {
      for (const line of lines) {
        if (line.stations.includes(station)) {
          return line;
        }
      }
      return null;
    };

    // Draw tooltip for hovered station
    const drawStationTooltip = (opacity: number) => {
      if (!hoveredStation) return;

      const line = findLineForStation(hoveredStation);
      if (!line) return;

      const { r, g, b } = getLineDisplayColor(line);
      const tooltipText = line.name;
      const locationText = line.location;

      // Measure text
      ctx.font = `600 15px "Helvetica Neue", "Arial", system-ui, sans-serif`;
      const nameWidth = ctx.measureText(tooltipText).width;
      ctx.font = `12px "Helvetica Neue", "Arial", system-ui, sans-serif`;
      const locationWidth = ctx.measureText(locationText).width;

      const padding = 10;
      const tooltipWidth = Math.max(nameWidth, locationWidth) + padding * 2;
      const tooltipHeight = 42;

      // Position tooltip above station
      let tooltipX = hoveredStation.x - tooltipWidth / 2;
      let tooltipY =
        hoveredStation.y - config.stationRadius - tooltipHeight - 8;

      // Keep tooltip in bounds
      tooltipX = Math.max(
        8,
        Math.min(canvasWidth - tooltipWidth - 8, tooltipX)
      );
      if (tooltipY < 8) {
        tooltipY = hoveredStation.y + config.stationRadius + 8; // Show below if no room above
      }

      // Draw tooltip background - parse the rgba color for opacity
      const tooltipBgBase = themeColors.tooltipBg.replace(
        /[\d.]+\)$/,
        `${opacity * 0.95})`
      );
      ctx.fillStyle = tooltipBgBase;
      ctx.beginPath();
      ctx.roundRect(tooltipX, tooltipY, tooltipWidth, tooltipHeight, 6);
      ctx.fill();

      // Draw colored accent line on left
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
      ctx.beginPath();
      ctx.roundRect(tooltipX, tooltipY, 4, tooltipHeight, [6, 0, 0, 6]);
      ctx.fill();

      // Draw line name - use theme text color
      ctx.font = `600 15px "Helvetica Neue", "Arial", system-ui, sans-serif`;
      const textMatch = themeColors.tooltipText.match(
        /^#([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i
      );
      if (textMatch) {
        ctx.fillStyle = `rgba(${parseInt(textMatch[1], 16)}, ${parseInt(textMatch[2], 16)}, ${parseInt(textMatch[3], 16)}, ${opacity})`;
      } else {
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
      }
      ctx.textBaseline = "top";
      ctx.fillText(tooltipText, tooltipX + padding + 4, tooltipY + 8);

      // Draw location - use theme muted color
      ctx.font = `12px "Helvetica Neue", "Arial", system-ui, sans-serif`;
      const mutedMatch = themeColors.tooltipMuted.match(
        /^#([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i
      );
      if (mutedMatch) {
        ctx.fillStyle = `rgba(${parseInt(mutedMatch[1], 16)}, ${parseInt(mutedMatch[2], 16)}, ${parseInt(mutedMatch[3], 16)}, ${opacity})`;
      } else {
        ctx.fillStyle = `rgba(163, 163, 163, ${opacity})`;
      }
      ctx.fillText(locationText, tooltipX + padding + 4, tooltipY + 26);
    };

    // Check if mouse is over a legend item
    const updateLegendHover = () => {
      hoveredLegendIndex = -1;
      if (!mousePosition || isMobile) return;

      for (let i = 0; i < legendItems.length; i++) {
        const item = legendItems[i];
        if (
          mousePosition.x >= item.x &&
          mousePosition.x <= item.x + item.width &&
          mousePosition.y >= item.y &&
          mousePosition.y <= item.y + item.height
        ) {
          hoveredLegendIndex = i;
          break;
        }
      }
    };

    // Draw legend as metro board (bottom right, shows all planned lines)
    const drawLegend = (opacity: number) => {
      if (plannedLines.length === 0 || isMobile) return;

      const padding = 16;
      const lineHeight = 26;
      const circleRadius = 5;
      const textOffset = 18;
      const boardPadding = 14;

      // Calculate board dimensions
      ctx.font = `600 14px "Helvetica Neue", "Arial", system-ui, sans-serif`;
      let maxWidth = 0;
      for (const planned of plannedLines) {
        const textWidth = ctx.measureText(planned.name).width;
        ctx.font = `11px "Helvetica Neue", "Arial", system-ui, sans-serif`;
        const locWidth = ctx.measureText(planned.location).width;
        maxWidth = Math.max(maxWidth, textOffset + textWidth + 8 + locWidth);
        ctx.font = `600 14px "Helvetica Neue", "Arial", system-ui, sans-serif`;
      }

      const boardWidth = maxWidth + boardPadding * 2 + 10;
      // Shrink-wrap: header + content + padding
      const contentOffset = 30; // Header (12px) + gap below header
      const boardHeight =
        boardPadding +
        contentOffset +
        plannedLines.length * lineHeight -
        lineHeight / 2 +
        boardPadding;

      // Position at bottom right
      const boardX = canvasWidth - padding - boardWidth;
      const boardY = canvasHeight - padding - boardHeight;

      // Draw board background - parse the rgba color for opacity
      const legendBgBase = themeColors.legendBg.replace(
        /[\d.]+\)$/,
        `${opacity * 0.85})`
      );
      ctx.fillStyle = legendBgBase;
      ctx.beginPath();
      ctx.roundRect(boardX, boardY, boardWidth, boardHeight, 8);
      ctx.fill();

      // Draw board border
      const legendBorderBase = themeColors.legendBorder.replace(
        /[\d.]+\)$/,
        `${opacity * 0.6})`
      );
      ctx.strokeStyle = legendBorderBase;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Draw header - use muted color
      ctx.font = `600 12px "Helvetica Neue", "Arial", system-ui, sans-serif`;
      const mutedMatch = themeColors.tooltipMuted.match(
        /^#([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i
      );
      if (mutedMatch) {
        ctx.fillStyle = `rgba(${parseInt(mutedMatch[1], 16)}, ${parseInt(mutedMatch[2], 16)}, ${parseInt(mutedMatch[3], 16)}, ${opacity * 0.9})`;
      } else {
        ctx.fillStyle = `rgba(163, 163, 163, ${opacity * 0.9})`;
      }
      ctx.textBaseline = "top";
      ctx.fillText("LINES", boardX + boardPadding, boardY + boardPadding);

      // Reset legend items for click detection
      legendItems = [];

      // Draw each planned line
      for (let i = 0; i < plannedLines.length; i++) {
        const planned = plannedLines[i];
        const color = plannedColors[i];
        const rgb = parseColor(color);
        const y = boardY + boardPadding + contentOffset + i * lineHeight;
        const itemX = boardX + boardPadding;
        const itemWidth = boardWidth - boardPadding * 2;

        // Check if this line has been rendered
        const renderedLine = lines.find((l) => l.name === planned.name);
        const isRendered = !!renderedLine;
        const isHovered = hoveredLegendIndex === i;

        // Calculate opacity - full if rendered, grayed out if not
        let itemOpacity = opacity * (isRendered ? 0.95 : 0.35);
        if (isHovered) {
          itemOpacity = opacity * 0.95; // Full opacity on hover
        }

        // Store hit area for click detection
        legendItems.push({
          x: itemX - 4,
          y: y - lineHeight / 2 + 4,
          width: itemWidth + 8,
          height: lineHeight - 4,
          wiki: planned.wiki,
        });

        // Draw hover background
        if (isHovered) {
          // Use a light overlay for hover in light mode, dark in dark mode
          const isDark =
            document.documentElement.getAttribute("data-theme") !== "light";
          ctx.fillStyle = isDark
            ? `rgba(255, 255, 255, ${opacity * 0.08})`
            : `rgba(0, 0, 0, ${opacity * 0.05})`;
          ctx.beginPath();
          ctx.roundRect(
            itemX - 4,
            y - lineHeight / 2 + 4,
            itemWidth + 8,
            lineHeight - 4,
            4
          );
          ctx.fill();
        }

        // Draw colored circle
        ctx.beginPath();
        ctx.arc(itemX + circleRadius, y, circleRadius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${itemOpacity})`;
        ctx.fill();

        // Draw line name - use theme text color
        ctx.font = `600 14px "Helvetica Neue", "Arial", system-ui, sans-serif`;
        ctx.textBaseline = "middle";
        const textMatch = themeColors.tooltipText.match(
          /^#([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i
        );
        if (textMatch) {
          ctx.fillStyle = `rgba(${parseInt(textMatch[1], 16)}, ${parseInt(textMatch[2], 16)}, ${parseInt(textMatch[3], 16)}, ${itemOpacity})`;
        } else {
          ctx.fillStyle = `rgba(255, 255, 255, ${itemOpacity})`;
        }
        ctx.fillText(planned.name, itemX + textOffset, y);

        // Draw location - use theme muted color
        const nameWidth = ctx.measureText(planned.name).width;
        ctx.font = `11px "Helvetica Neue", "Arial", system-ui, sans-serif`;
        const locMutedMatch = themeColors.tooltipMuted.match(
          /^#([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i
        );
        if (locMutedMatch) {
          ctx.fillStyle = `rgba(${parseInt(locMutedMatch[1], 16)}, ${parseInt(locMutedMatch[2], 16)}, ${parseInt(locMutedMatch[3], 16)}, ${itemOpacity * 0.8})`;
        } else {
          ctx.fillStyle = `rgba(163, 163, 163, ${itemOpacity * 0.8})`;
        }
        ctx.fillText(planned.location, itemX + textOffset + nameWidth + 8, y);

        // Draw cursor hint for hovered items
        if (isHovered) {
          ctx.font = `10px "Helvetica Neue", "Arial", system-ui, sans-serif`;
          if (locMutedMatch) {
            ctx.fillStyle = `rgba(${parseInt(locMutedMatch[1], 16)}, ${parseInt(locMutedMatch[2], 16)}, ${parseInt(locMutedMatch[3], 16)}, ${opacity * 0.6})`;
          } else {
            ctx.fillStyle = `rgba(163, 163, 163, ${opacity * 0.6})`;
          }
          ctx.fillText("↗", boardX + boardWidth - boardPadding - 12, y);
        }
      }
    };

    // Legacy function for static drawing compatibility
    const drawLine = (line: MetroLine, opacity: number) => {
      drawLinePath(line, opacity);
      drawLineStations(line, opacity);
    };

    const drawStaticMap = () => {
      initializeMap();

      for (let i = 0; i < 3000; i++) {
        const newLines: MetroLine[] = [];
        for (const line of lines) {
          const branch = updateLine(line);
          if (branch) newLines.push(branch);
        }
        lines.push(...newLines);

        if (lines.every((l) => !l.growing)) break;
      }

      // Set all stations to full scale for static view
      for (const station of allStations) {
        station.scale = 1;
      }

      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      for (const line of lines) {
        drawLine(line, 0.75);
      }
      drawLegend(0.75);
    };

    const handleColorChange = (e: CustomEvent<string>) => {
      const newColor = parseColor(e.detail);
      globalColorShift = newColor;
      targetColorShiftIntensity = 1; // Set target, not direct - smooth fade in

      // Also shift line target colors subtly towards the new color
      for (const line of lines) {
        const base = parseColor(line.baseColor);
        line.targetColor = shiftColorTowards(base, newColor, 0.25);
      }

      if (prefersReducedMotion) drawStaticMap();
    };

    const handlePalette = (e: CustomEvent<string[]>) => {
      if (e.detail && e.detail.length > 0) {
        palette = [...e.detail.slice(0, 5), ...DEFAULT_COLORS.slice(0, 3)];

        // Update existing line target colors based on new palette
        const avgColor: RGB = { r: 0, g: 0, b: 0 };
        for (const c of e.detail.slice(0, 3)) {
          const rgb = parseColor(c);
          avgColor.r += rgb.r / 3;
          avgColor.g += rgb.g / 3;
          avgColor.b += rgb.b / 3;
        }

        globalColorShift = avgColor;
        targetColorShiftIntensity = 0.8; // Set target, not direct - smooth fade in

        for (const line of lines) {
          const base = parseColor(line.baseColor);
          line.targetColor = shiftColorTowards(base, avgColor, 0.2);
        }
      }
    };

    const handleColorReset = () => {
      palette = [...DEFAULT_COLORS];
      globalColorShift = null;
      colorShiftIntensity = 0;
      targetColorShiftIntensity = 0;

      // Reset line colors to their base
      for (const line of lines) {
        line.targetColor = parseColor(line.baseColor);
      }

      if (prefersReducedMotion) drawStaticMap();
    };

    const handleNewViz = () => {
      if (prefersReducedMotion) {
        drawStaticMap();
      }
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      isMobile = window.innerWidth < 768;

      // Set config based on viewport
      const prevConfig = config;
      config = isMobile ? MOBILE_CONFIG : DESKTOP_CONFIG;
      const configChanged = prevConfig !== config;

      if (isFullVariant) {
        // Canvas is positioned on right half of screen via CSS
        // Set canvas size to match that positioning
        canvasWidth = Math.floor(window.innerWidth / 2);
        canvasHeight = window.innerHeight;

        const padding = config.padding;

        // Use full canvas area for drawing (with padding)
        drawBounds = {
          left: padding,
          right: canvasWidth - padding,
          top: padding,
          bottom: canvasHeight - padding,
        };
      } else if (container) {
        const rect = container.getBoundingClientRect();
        canvasWidth = rect.width;
        canvasHeight = rect.height;
        // No padding on mobile for contained variant
        const containerPadding = isMobile ? 0 : config.padding;
        drawBounds = {
          left: containerPadding,
          right: canvasWidth - containerPadding,
          top: containerPadding,
          bottom: canvasHeight - containerPadding,
        };
      }

      canvas.width = canvasWidth * dpr;
      canvas.height = canvasHeight * dpr;
      canvas.style.width = `${canvasWidth}px`;
      canvas.style.height = `${canvasHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Reinitialize map if config changed (e.g., switching between mobile/desktop)
      if (configChanged && lines.length > 0) {
        initializeMap();
      }

      if (prefersReducedMotion) {
        drawStaticMap();
      }
    };

    const animate = () => {
      // Fade in at start
      if (globalOpacity < 1) {
        globalOpacity += 0.015;
        if (globalOpacity > 1) globalOpacity = 1;
      }

      // Update line growth
      const newLines: MetroLine[] = [];
      for (const line of lines) {
        const branch = updateLine(line);
        if (branch) newLines.push(branch);
      }
      lines.push(...newLines);

      // Update colors (lerp towards targets)
      updateColors();

      // Update station animations
      updateStations();

      // Update hover effects and click waves
      updateHoverEffects();
      updateLegendHover();
      updateClickWaves();

      // Update trains
      checkTrainSpawning();
      updateTrains();

      // Draw in layers: lines first, then wave rings, then trains, then stations on top
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      // Layer 1: All line paths
      for (const line of lines) {
        drawLinePath(line, globalOpacity);
      }

      // Layer 2: Click wave rings
      drawClickWaveRings(globalOpacity);

      // Layer 3: Trains (between lines and stations)
      drawTrains(globalOpacity);

      // Layer 4: All stations (on top of everything)
      for (const line of lines) {
        drawLineStations(line, globalOpacity);
      }

      // Layer 5: Legend
      drawLegend(globalOpacity);

      // Layer 6: Station tooltip (on top of everything)
      drawStationTooltip(globalOpacity);

      animationId = requestAnimationFrame(animate);
    };

    // Handle theme changes
    const handleThemeChange = () => {
      themeColors = getThemeColors();

      // Update line colors for new theme
      const newLineColors = getThemeLineColors();
      currentLineColors = newLineColors;

      // Update each line's color to the equivalent in the new palette
      // This maintains color positions but swaps to theme-appropriate variants
      lines.forEach((line, index) => {
        const colorIndex = index % newLineColors.length;
        line.color = newLineColors[colorIndex];
      });

      // Update palette and available colors
      palette = [...newLineColors];
      availableColors = [...newLineColors];

      if (prefersReducedMotion) {
        drawStaticMap();
      }
    };

    // Observe data-theme attribute changes
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.attributeName === "data-theme") {
          handleThemeChange();
        }
      }
    });
    observer.observe(document.documentElement, { attributes: true });

    window.addEventListener("viz-color", handleColorChange as EventListener);
    window.addEventListener("viz-palette", handlePalette as EventListener);
    window.addEventListener("viz-color-reset", handleColorReset);
    window.addEventListener("viz-new", handleNewViz);
    window.addEventListener("resize", resize);
    window.addEventListener("theme-change", handleThemeChange);
    // Window-level mouse events work even with pointer-events-none on canvas
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("click", handleClick);

    resize();
    initializeMap();

    if (prefersReducedMotion) {
      drawStaticMap();
    } else {
      animationId = requestAnimationFrame(animate);
    }

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener(
        "viz-color",
        handleColorChange as EventListener
      );
      window.removeEventListener("viz-palette", handlePalette as EventListener);
      window.removeEventListener("viz-color-reset", handleColorReset);
      window.removeEventListener("viz-new", handleNewViz);
      window.removeEventListener("theme-change", handleThemeChange);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("click", handleClick);
      cancelAnimationFrame(animationId);
    };
  }, [isFullVariant]);

  if (isFullVariant) {
    return (
      <canvas
        ref={canvasRef}
        className="fixed top-0 right-0 w-1/2 h-full pointer-events-none -z-10"
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
