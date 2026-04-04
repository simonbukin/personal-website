// Web Worker for MetroMap simulation — runs findBestSimulation off the main thread.
// This is a self-contained copy of all simulation-related code from MetroMap.tsx.

// ── Types ──────────────────────────────────────────────────────────────────────

interface Point {
  x: number;
  y: number;
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

interface CoverageScore {
  gridCoverage: number;
  quadrantBalance: number;
  lineSpread: number;
  stationDistribution: number;
  windiness: number;
  total: number;
}

interface RollingStock {
  model: string;
  manufacturer: string;
  introduced: number;
  specUrl: string;
}

interface TransitLineInfo {
  name: string;
  location: string;
  wiki: string;
  rollingStock?: RollingStock;
}

// ── Message types ──────────────────────────────────────────────────────────────

export interface SimulationRequest {
  type: "run";
  config: MapConfig;
  bounds: DrawBounds;
  variant: string;
  unconstrained: boolean;
}

export interface SimulationResponse {
  type: "result";
  geometry: PrecomputedGeometry;
}

export interface SimulationError {
  type: "error";
  message: string;
}

// ── Seeded PRNG ────────────────────────────────────────────────────────────────

class SeededRandom {
  private state: number;

  constructor(seed: number) {
    this.state = seed % 2147483647;
    if (this.state <= 0) this.state += 2147483646;
  }

  next(): number {
    this.state = (this.state * 16807) % 2147483647;
    return (this.state - 1) / 2147483646;
  }

  nextInt(max: number): number {
    return Math.floor(this.next() * max);
  }

  shuffle<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = this.nextInt(i + 1);
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
}

// ── Constants ──────────────────────────────────────────────────────────────────

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

const BRANCH_PROBABILITY = 0.2;
const PARALLEL_AVOIDANCE_DISTANCE = 80;
const CENTER_WEIGHT_STRENGTH = 0.5;
const CLUSTER_RADIUS = 120;
const SPREAD_STRENGTH = 0.7;

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
  hoverHitRadius: 17,
};

const COLOR_NAME_TO_INDEX: Record<string, number> = {
  red: 0,
  blue: 1,
  green: 2,
  gold: 3,
  yellow: 3,
  orange: 6,
  purple: 4,
  pink: 7,
  teal: 5,
};

function getColorIndexFromLineName(name: string): number | null {
  const lowerName = name.toLowerCase();
  for (const [keyword, index] of Object.entries(COLOR_NAME_TO_INDEX)) {
    if (lowerName.includes(keyword)) {
      return index;
    }
  }
  return null;
}

const TRANSIT_LINES: TransitLineInfo[] = [
  {
    name: "山手線 Yamanote",
    location: "Tokyo",
    wiki: "https://en.wikipedia.org/wiki/Yamanote_Line",
    rollingStock: {
      model: "E235 series",
      manufacturer: "J-TREC",
      introduced: 2020,
      specUrl: "https://en.wikipedia.org/wiki/E235_series",
    },
  },
  {
    name: "銀座線 Ginza",
    location: "Tokyo",
    wiki: "https://en.wikipedia.org/wiki/Tokyo_Metro_Ginza_Line",
    rollingStock: {
      model: "1000 series",
      manufacturer: "Nippon Sharyo",
      introduced: 2012,
      specUrl: "https://en.wikipedia.org/wiki/Tokyo_Metro_1000_series",
    },
  },
  {
    name: "中央線 Chūō",
    location: "Tokyo",
    wiki: "https://en.wikipedia.org/wiki/Ch%C5%AB%C5%8D_Line_(Rapid)",
    rollingStock: {
      model: "E233 series",
      manufacturer: "Kawasaki Heavy Industries",
      introduced: 2006,
      specUrl: "https://en.wikipedia.org/wiki/E233_series",
    },
  },
  {
    name: "U2",
    location: "Berlin",
    wiki: "https://en.wikipedia.org/wiki/U2_(Berlin_U-Bahn)",
    rollingStock: {
      model: "HK-type (Baureihe HK)",
      manufacturer: "LEW Hennigsdorf",
      introduced: 1997,
      specUrl: "https://en.wikipedia.org/wiki/Berlin_U-Bahn_rolling_stock",
    },
  },
  {
    name: "U6",
    location: "Berlin",
    wiki: "https://en.wikipedia.org/wiki/U6_(Berlin_U-Bahn)",
    rollingStock: {
      model: "H-series (Baureihe H)",
      manufacturer: "Bombardier Transportation",
      introduced: 1998,
      specUrl: "https://en.wikipedia.org/wiki/Berlin_U-Bahn_rolling_stock",
    },
  },
  {
    name: "Red Line",
    location: "Salt Lake City",
    wiki: "https://en.wikipedia.org/wiki/Red_Line_(TRAX)",
    rollingStock: {
      model: "SD-160",
      manufacturer: "Siemens",
      introduced: 1999,
      specUrl: "https://en.wikipedia.org/wiki/Siemens_SD-160",
    },
  },
  {
    name: "Blue Line",
    location: "Salt Lake City",
    wiki: "https://en.wikipedia.org/wiki/Blue_Line_(TRAX)",
    rollingStock: {
      model: "SD-100",
      manufacturer: "Siemens",
      introduced: 1999,
      specUrl: "https://en.wikipedia.org/wiki/Siemens_SD-100",
    },
  },
  {
    name: "T Third",
    location: "San Francisco",
    wiki: "https://en.wikipedia.org/wiki/T_Third_Street",
    rollingStock: {
      model: "S200 SF",
      manufacturer: "Siemens",
      introduced: 2017,
      specUrl: "https://en.wikipedia.org/wiki/Siemens_S200",
    },
  },
  {
    name: "1 Line",
    location: "Seattle",
    wiki: "https://en.wikipedia.org/wiki/1_Line_(Link_light_rail)",
    rollingStock: {
      model: "Series 1 LRV",
      manufacturer: "Kinkisharyo",
      introduced: 2009,
      specUrl: "https://en.wikipedia.org/wiki/1_Line_(Sound_Transit)",
    },
  },
  {
    name: "Route 3",
    location: "Santa Cruz",
    wiki: "https://en.wikipedia.org/wiki/Santa_Cruz_Metropolitan_Transit_District",
    rollingStock: {
      model: "XN40 Xcelsior",
      manufacturer: "New Flyer",
      introduced: 2018,
      specUrl: "https://en.wikipedia.org/wiki/New_Flyer_Xcelsior",
    },
  },
  {
    name: "Route 10",
    location: "Santa Cruz",
    wiki: "https://en.wikipedia.org/wiki/Santa_Cruz_Metropolitan_Transit_District",
    rollingStock: {
      model: "XN40 Xcelsior",
      manufacturer: "New Flyer",
      introduced: 2018,
      specUrl: "https://en.wikipedia.org/wiki/New_Flyer_Xcelsior",
    },
  },
  {
    name: "Caltrain",
    location: "Bay Area",
    wiki: "https://en.wikipedia.org/wiki/Caltrain",
    rollingStock: {
      model: "KISS EMU",
      manufacturer: "Stadler Rail",
      introduced: 2024,
      specUrl: "https://en.wikipedia.org/wiki/Stadler_KISS",
    },
  },
];

// ── Helper functions ───────────────────────────────────────────────────────────

const selectLinesOnePerLocation = (
  maxLines: number,
  rng: SeededRandom,
): TransitLineInfo[] => {
  const byLocation = new Map<string, TransitLineInfo[]>();
  for (const line of TRANSIT_LINES) {
    if (!byLocation.has(line.location)) {
      byLocation.set(line.location, []);
    }
    byLocation.get(line.location)!.push(line);
  }

  const selected: TransitLineInfo[] = [];
  const locations = Array.from(byLocation.keys());
  const shuffledLocations = rng.shuffle(locations);

  for (const location of shuffledLocations) {
    if (selected.length >= maxLines) break;
    const options = byLocation.get(location)!;
    const pick = options[rng.nextInt(options.length)];
    selected.push(pick);
  }

  return selected;
};

function distance(a: Point, b: Point): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

function getCenterWeightScore(
  position: Point,
  direction: number,
  canvasCenter: Point,
  segmentLength: number,
): number {
  const dir = DIRECTIONS[direction];
  const newPos = {
    x: position.x + dir.dx * segmentLength,
    y: position.y + dir.dy * segmentLength,
  };

  const currentDistFromCenter = distance(position, canvasCenter);
  const newDistFromCenter = distance(newPos, canvasCenter);
  const improvement = currentDistFromCenter - newDistFromCenter;
  const distanceScale = currentDistFromCenter / 200;

  const outsideRatio = Math.max(
    0,
    (currentDistFromCenter - CLUSTER_RADIUS) / CLUSTER_RADIUS,
  );

  const transitionFactor = Math.min(1, outsideRatio);
  const biasMultiplier = 1 - (1 + SPREAD_STRENGTH) * transitionFactor;

  return improvement * (1 + distanceScale) * biasMultiplier;
}

function getValidBranchDirections(currentDir: number): number[] {
  const perpendicular1 = (currentDir + 2) % 8;
  const perpendicular2 = (currentDir + 6) % 8;
  const diagonal1 = (currentDir + 3) % 8;
  const diagonal2 = (currentDir + 5) % 8;
  return [perpendicular1, perpendicular2, diagonal1, diagonal2];
}

function getValidContinueDirections(currentDir: number): number[] {
  return [
    currentDir,
    currentDir,
    currentDir,
    (currentDir + 1) % 8,
    (currentDir + 7) % 8,
  ];
}

function isInBounds(
  x: number,
  y: number,
  bounds: { left: number; right: number; top: number; bottom: number },
): boolean {
  return (
    x > bounds.left && x < bounds.right && y > bounds.top && y < bounds.bottom
  );
}

// ── Headless simulation ────────────────────────────────────────────────────────

function runHeadlessSimulation(
  seed: number,
  config: MapConfig,
  bounds: DrawBounds,
): { lines: HeadlessLine[]; stations: Point[] } {
  const rng = new SeededRandom(seed);

  const boundsWidth = bounds.right - bounds.left;
  const boundsHeight = bounds.bottom - bounds.top;
  const hubCenter: Point = {
    x: bounds.left + boundsWidth * 0.5,
    y: bounds.top + boundsHeight * 0.5,
  };

  // Consume RNG in the same order as initializeMap to keep sequences synchronized
  const plannedLines = selectLinesOnePerLocation(config.maxLines, rng);

  const reservedColors = new Map<number, number>();
  for (let i = 0; i < plannedLines.length; i++) {
    const colorIdx = getColorIndexFromLineName(plannedLines[i].name);
    if (colorIdx !== null) {
      reservedColors.set(i, colorIdx);
    }
  }
  const reservedIndices = new Set(reservedColors.values());
  const dummyPalette = [0, 1, 2, 3, 4, 5, 6, 7];
  const unassignedColors = dummyPalette.filter(
    (_, idx) => !reservedIndices.has(idx),
  );
  rng.shuffle([...unassignedColors]);

  const lines: HeadlessLine[] = [];
  const allStations: Point[] = [{ ...hubCenter }];
  let lineIdCounter = 0;

  const canPlaceStation = (pos: Point): boolean => {
    for (const station of allStations) {
      if (distance(pos, station) < config.minStationDistance) {
        return false;
      }
    }
    return true;
  };

  const addStation = (line: HeadlessLine, pos: Point): boolean => {
    if (canPlaceStation(pos)) {
      line.stations.push({ ...pos });
      allStations.push({ ...pos });
      line.lastStationDistance = 0;
      return true;
    }
    return false;
  };

  const isDirectionParallelToNearby = (
    currentLine: HeadlessLine,
    position: Point,
    direction: number,
  ): boolean => {
    const parallelDirs = [direction, (direction + 4) % 8];

    for (const otherLine of lines) {
      if (otherLine.id === currentLine.id) continue;

      for (let j = 0; j < otherLine.points.length - 1; j++) {
        const segStart = otherLine.points[j];
        const segEnd = otherLine.points[j + 1];
        const segMid = {
          x: (segStart.x + segEnd.x) / 2,
          y: (segStart.y + segEnd.y) / 2,
        };
        if (distance(position, segMid) > PARALLEL_AVOIDANCE_DISTANCE) continue;

        const dx = segEnd.x - segStart.x;
        const dy = segEnd.y - segStart.y;
        const angle = Math.atan2(dy, dx);
        const normalizedAngle = (angle + Math.PI * 2) % (Math.PI * 2);
        const otherDir = Math.round(normalizedAngle / (Math.PI / 4)) % 8;

        if (parallelDirs.includes(otherDir)) {
          return true;
        }
      }
    }
    return false;
  };

  const wouldCross = (start: Point, direction: number): boolean => {
    const dir = DIRECTIONS[direction];
    const end = {
      x: start.x + dir.dx * config.segmentLength,
      y: start.y + dir.dy * config.segmentLength,
    };

    for (const otherLine of lines) {
      for (let j = 0; j < otherLine.points.length - 1; j++) {
        const segStart = otherLine.points[j];
        const segEnd = otherLine.points[j + 1];

        const segMid = {
          x: (segStart.x + segEnd.x) / 2,
          y: (segStart.y + segEnd.y) / 2,
        };
        if (distance(start, segMid) > config.segmentLength * 2) continue;

        if (
          (Math.abs(segStart.x - start.x) < 5 &&
            Math.abs(segStart.y - start.y) < 5) ||
          (Math.abs(segEnd.x - start.x) < 5 &&
            Math.abs(segEnd.y - start.y) < 5)
        ) {
          continue;
        }

        const d1 =
          (end.x - start.x) * (segStart.y - start.y) -
          (end.y - start.y) * (segStart.x - start.x);
        const d2 =
          (end.x - start.x) * (segEnd.y - start.y) -
          (end.y - start.y) * (segEnd.x - start.x);
        const d3 =
          (segEnd.x - segStart.x) * (start.y - segStart.y) -
          (segEnd.y - segStart.y) * (start.x - segStart.x);
        const d4 =
          (segEnd.x - segStart.x) * (end.y - segStart.y) -
          (segEnd.y - segStart.y) * (end.x - segStart.x);

        if (
          ((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) &&
          ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0))
        ) {
          return true;
        }
      }
    }
    return false;
  };

  const createLine = (startPoint: Point, direction: number): HeadlessLine => {
    const id = lineIdCounter++;
    return {
      id,
      points: [{ ...startPoint }, { ...startPoint }],
      currentDirection: direction,
      growing: true,
      progress: 0,
      totalLength: 0,
      lastBranchDistance: 0,
      lastStationDistance: 0,
      stations: [],
    };
  };

  const canvasCenter = {
    x: (bounds.left + bounds.right) / 2,
    y: (bounds.top + bounds.bottom) / 2,
  };

  const selectDirection = (
    availableDirs: number[],
    position: Point,
  ): number => {
    if (availableDirs.length === 0) return 0;
    if (availableDirs.length === 1) return availableDirs[0];

    const scores = availableDirs.map((dir) =>
      getCenterWeightScore(position, dir, canvasCenter, config.segmentLength),
    );
    const weights = scores.map((score) =>
      Math.exp(score * CENTER_WEIGHT_STRENGTH),
    );
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);

    let random = rng.next() * totalWeight;
    for (let i = 0; i < availableDirs.length; i++) {
      random -= weights[i];
      if (random <= 0) return availableDirs[i];
    }
    return availableDirs[availableDirs.length - 1];
  };

  const updateLine = (line: HeadlessLine): HeadlessLine | null => {
    if (!line.growing) return null;

    const effectiveSpeed = config.segmentLength;
    const dir = DIRECTIONS[line.currentDirection];
    const lastPoint = line.points[line.points.length - 1];

    line.progress += effectiveSpeed;
    line.totalLength += effectiveSpeed;
    line.lastBranchDistance += effectiveSpeed;
    line.lastStationDistance += effectiveSpeed;

    const newX = lastPoint.x + dir.dx * effectiveSpeed;
    const newY = lastPoint.y + dir.dy * effectiveSpeed;

    if (!isInBounds(newX, newY, bounds)) {
      line.growing = false;
      addStation(line, lastPoint);
      return null;
    }

    if (line.totalLength >= config.maxLineLength) {
      line.growing = false;
      addStation(line, { x: newX, y: newY });
      return null;
    }

    line.points[line.points.length - 1] = { x: newX, y: newY };

    if (line.progress >= config.segmentLength) {
      line.progress = 0;

      const position = { x: newX, y: newY };
      const continueDirs = getValidContinueDirections(line.currentDirection);

      const nonParallelDirs = continueDirs.filter(
        (d) => !isDirectionParallelToNearby(line, position, d),
      );
      const nonCrossingDirs = nonParallelDirs.filter(
        (d) => !wouldCross(position, d),
      );

      const availableDirs =
        nonCrossingDirs.length > 0
          ? nonCrossingDirs
          : nonParallelDirs.length > 0
            ? nonParallelDirs
            : continueDirs;

      const newDir = selectDirection(availableDirs, position);

      if (newDir !== line.currentDirection) {
        line.points.push({ x: newX, y: newY });
        line.currentDirection = newDir;
      }

      if (
        lines.length < config.maxLines &&
        line.lastBranchDistance >= config.minBranchDistance &&
        rng.next() < BRANCH_PROBABILITY
      ) {
        const branchDirs = getValidBranchDirections(line.currentDirection);
        const nonParallelBranchDirs = branchDirs.filter(
          (d) => !isDirectionParallelToNearby(line, position, d),
        );
        const nonCrossingBranchDirs = nonParallelBranchDirs.filter(
          (d) => !wouldCross(position, d),
        );
        const candidateBranchDirs =
          nonCrossingBranchDirs.length > 0
            ? nonCrossingBranchDirs
            : nonParallelBranchDirs.length > 0
              ? nonParallelBranchDirs
              : branchDirs;

        const sortedByWeight = [...candidateBranchDirs].sort((a, b) => {
          const scoreA = getCenterWeightScore(
            position,
            a,
            canvasCenter,
            config.segmentLength,
          );
          const scoreB = getCenterWeightScore(
            position,
            b,
            canvasCenter,
            config.segmentLength,
          );
          return scoreB - scoreA;
        });

        for (const branchDir of sortedByWeight) {
          const testX = newX + DIRECTIONS[branchDir].dx * config.segmentLength;
          const testY = newY + DIRECTIONS[branchDir].dy * config.segmentLength;

          if (isInBounds(testX, testY, bounds)) {
            line.lastBranchDistance = 0;
            if (addStation(line, { x: newX, y: newY })) {
              return createLine({ x: newX, y: newY }, branchDir);
            }
          }
        }
      }

      const stationChance =
        line.lastStationDistance > config.segmentLength * 1.5 ? 0.4 : 0.15;
      if (
        rng.next() < stationChance &&
        line.totalLength > config.segmentLength
      ) {
        addStation(line, { x: newX, y: newY });
      }
    }

    return null;
  };

  const startDirections = [0, 2, 4, 6];
  for (let i = 0; i < config.initialLines; i++) {
    const dir = startDirections[i % startDirections.length];
    const line = createLine(hubCenter, dir);
    if (i === 0) {
      line.stations.push({ ...hubCenter });
    }
    lines.push(line);
  }

  for (let iteration = 0; iteration < 5000; iteration++) {
    const newLines: HeadlessLine[] = [];
    for (const line of lines) {
      const branch = updateLine(line);
      if (branch) newLines.push(branch);
    }
    lines.push(...newLines);

    if (lines.every((l) => !l.growing)) break;
  }

  return { lines, stations: allStations };
}

// ── Coverage scoring ───────────────────────────────────────────────────────────

function calculateCoverage(
  lines: HeadlessLine[],
  stations: Point[],
  bounds: DrawBounds,
): CoverageScore {
  const boundsWidth = bounds.right - bounds.left;
  const boundsHeight = bounds.bottom - bounds.top;

  // 1. Grid coverage (40%): 20x20 grid
  const gridSize = 20;
  const cellWidth = boundsWidth / gridSize;
  const cellHeight = boundsHeight / gridSize;
  const coveredCells = new Set<string>();

  for (const line of lines) {
    for (let i = 0; i < line.points.length - 1; i++) {
      const p1 = line.points[i];
      const p2 = line.points[i + 1];

      const segDist = distance(p1, p2);
      const steps = Math.max(
        1,
        Math.ceil(segDist / Math.min(cellWidth, cellHeight)),
      );
      for (let s = 0; s <= steps; s++) {
        const t = s / steps;
        const x = p1.x + (p2.x - p1.x) * t;
        const y = p1.y + (p2.y - p1.y) * t;
        const cellX = Math.floor((x - bounds.left) / cellWidth);
        const cellY = Math.floor((y - bounds.top) / cellHeight);
        if (cellX >= 0 && cellX < gridSize && cellY >= 0 && cellY < gridSize) {
          coveredCells.add(`${cellX},${cellY}`);
        }
      }
    }
  }
  const gridCoverage = coveredCells.size / (gridSize * gridSize);

  // 2. Quadrant balance
  const centerX = bounds.left + boundsWidth / 2;
  const centerY = bounds.top + boundsHeight / 2;
  const quadrantWidth = boundsWidth / 2;
  const quadrantHeight = boundsHeight / 2;

  const zoneSize = Math.min(quadrantWidth, quadrantHeight) * 0.5;
  const halfZone = zoneSize / 2;

  const quadrantCenters = [
    {
      left: bounds.left + quadrantWidth / 2 - halfZone,
      right: bounds.left + quadrantWidth / 2 + halfZone,
      top: bounds.top + quadrantHeight / 2 - halfZone,
      bottom: bounds.top + quadrantHeight / 2 + halfZone,
    },
    {
      left: centerX + quadrantWidth / 2 - halfZone,
      right: centerX + quadrantWidth / 2 + halfZone,
      top: bounds.top + quadrantHeight / 2 - halfZone,
      bottom: bounds.top + quadrantHeight / 2 + halfZone,
    },
    {
      left: bounds.left + quadrantWidth / 2 - halfZone,
      right: bounds.left + quadrantWidth / 2 + halfZone,
      top: centerY + quadrantHeight / 2 - halfZone,
      bottom: centerY + quadrantHeight / 2 + halfZone,
    },
    {
      left: centerX + quadrantWidth / 2 - halfZone,
      right: centerX + quadrantWidth / 2 + halfZone,
      top: centerY + quadrantHeight / 2 - halfZone,
      bottom: centerY + quadrantHeight / 2 + halfZone,
    },
  ];

  const quadrantsTouched = [false, false, false, false];

  for (const line of lines) {
    for (let i = 0; i < line.points.length - 1; i++) {
      const p1 = line.points[i];
      const p2 = line.points[i + 1];

      const segDist = distance(p1, p2);
      const steps = Math.max(1, Math.ceil(segDist / 10));
      for (let s = 0; s <= steps; s++) {
        const t = s / steps;
        const x = p1.x + (p2.x - p1.x) * t;
        const y = p1.y + (p2.y - p1.y) * t;

        for (let q = 0; q < 4; q++) {
          const zone = quadrantCenters[q];
          if (
            x >= zone.left &&
            x <= zone.right &&
            y >= zone.top &&
            y <= zone.bottom
          ) {
            quadrantsTouched[q] = true;
          }
        }
      }
    }
  }

  const quadrantBalance = quadrantsTouched.filter((t) => t).length / 4;

  // 3. Line spread
  const diagonal = Math.sqrt(
    boundsWidth * boundsWidth + boundsHeight * boundsHeight,
  );
  let totalEndpointDist = 0;
  let endpointCount = 0;

  for (const line of lines) {
    if (line.points.length >= 2) {
      const endpoint = line.points[line.points.length - 1];
      totalEndpointDist += distance(endpoint, { x: centerX, y: centerY });
      endpointCount++;
    }
  }

  const avgEndpointDist =
    endpointCount > 0 ? totalEndpointDist / endpointCount : 0;
  const lineSpread = Math.min(1, avgEndpointDist / (diagonal * 0.4));

  // 4. Station distribution
  let totalNNDist = 0;
  let nnCount = 0;

  for (let i = 0; i < stations.length; i++) {
    let minDist = Infinity;
    for (let j = 0; j < stations.length; j++) {
      if (i !== j) {
        minDist = Math.min(minDist, distance(stations[i], stations[j]));
      }
    }
    if (minDist < Infinity) {
      totalNNDist += minDist;
      nnCount++;
    }
  }

  const avgNNDist = nnCount > 0 ? totalNNDist / nnCount : 0;
  const idealNNDist = DESKTOP_CONFIG.minStationDistance * 1.5;
  const stationDistribution =
    avgNNDist > 0
      ? Math.exp(-Math.pow((avgNNDist - idealNNDist) / idealNNDist, 2))
      : 0;

  // 5. Windiness
  let totalTortuosity = 0;
  let tortuosityCount = 0;

  for (const line of lines) {
    if (line.points.length >= 2) {
      const start = line.points[0];
      const end = line.points[line.points.length - 1];
      const straightDist = distance(start, end);

      let pathLength = 0;
      for (let i = 0; i < line.points.length - 1; i++) {
        pathLength += distance(line.points[i], line.points[i + 1]);
      }

      if (straightDist > 10) {
        const tortuosity = pathLength / straightDist;
        totalTortuosity += tortuosity;
        tortuosityCount++;
      }
    }
  }

  const avgTortuosity =
    tortuosityCount > 0 ? totalTortuosity / tortuosityCount : 1;
  const windiness = Math.min(1, Math.max(0, (avgTortuosity - 1) / 1.0));

  const total = 0.5 * gridCoverage + 0.3 * windiness + 0.2 * lineSpread;

  return {
    gridCoverage,
    quadrantBalance,
    lineSpread,
    stationDistribution,
    windiness,
    total,
  };
}

// ── findBestSimulation ─────────────────────────────────────────────────────────

function findBestSimulation(
  _count: number,
  config: MapConfig,
  bounds: DrawBounds,
  variant: string = "unknown",
  unconstrained: boolean = false,
): PrecomputedGeometry {
  const boundsWidth = bounds.right - bounds.left;
  const boundsHeight = bounds.bottom - bounds.top;
  if (boundsWidth <= 0 || boundsHeight <= 0) {
    console.warn(`[MetroMap:${variant}] Skipping precompute - invalid bounds`);
    const fallbackSeed = Date.now();
    return { lines: [], stations: [], seed: fallbackSeed };
  }

  if (unconstrained) {
    const seed = Date.now() + Math.floor(Math.random() * 100000);
    const { lines, stations } = runHeadlessSimulation(seed, config, bounds);
    console.log(
      `[MetroMap:${variant}] CHAOS MODE - unconstrained simulation, seed=${seed}`,
    );
    return { lines, stations, seed };
  }

  const startTime = performance.now();
  let bestSeed = Date.now();
  let bestLines: HeadlessLine[] = [];
  let bestStations: Point[] = [];
  let bestScore = -Infinity;
  let totalSims = 0;
  const maxAttempts = 1000;

  while (totalSims < maxAttempts) {
    const seed =
      Date.now() + totalSims * 12345 + Math.floor(Math.random() * 10000);
    const { lines, stations } = runHeadlessSimulation(seed, config, bounds);
    const score = calculateCoverage(lines, stations, bounds);
    const quads = Math.round(score.quadrantBalance * 4);
    totalSims++;

    if (quads === 4) {
      if (score.total > bestScore) {
        bestScore = score.total;
        bestSeed = seed;
        bestLines = lines;
        bestStations = stations;
      }
      if (totalSims >= 5 && bestScore > 0) break;
    }
  }

  if (bestLines.length === 0) {
    const fallbackSeed = Date.now();
    const { lines, stations } = runHeadlessSimulation(
      fallbackSeed,
      config,
      bounds,
    );
    bestLines = lines;
    bestStations = stations;
    bestSeed = fallbackSeed;
    console.warn(
      `[MetroMap:${variant}] Could not find 4/4 quadrant coverage after ${totalSims} attempts`,
    );
  }

  const bestBreakdown = calculateCoverage(bestLines, bestStations, bounds);
  const elapsed = performance.now() - startTime;
  const quadsHit = Math.round(bestBreakdown.quadrantBalance * 4);
  console.log(
    `[MetroMap:${variant}] Precompute: ${totalSims} sims in ${elapsed.toFixed(0)}ms | ` +
      `score:${bestScore.toFixed(2)} seed=${bestSeed} | ` +
      `quads:${quadsHit}/4 grid:${bestBreakdown.gridCoverage.toFixed(2)} ` +
      `wind:${bestBreakdown.windiness.toFixed(2)}`,
  );

  return { lines: bestLines, stations: bestStations, seed: bestSeed };
}

// ── Worker message handler ─────────────────────────────────────────────────────

self.onmessage = (event: MessageEvent<SimulationRequest>) => {
  const { config, bounds, variant, unconstrained } = event.data;

  try {
    const geometry = findBestSimulation(
      0, // _count is unused
      config,
      bounds,
      variant,
      unconstrained,
    );

    const response: SimulationResponse = { type: "result", geometry };
    self.postMessage(response);
  } catch (err) {
    const response: SimulationError = {
      type: "error",
      message: err instanceof Error ? err.message : String(err),
    };
    self.postMessage(response);
  }
};
