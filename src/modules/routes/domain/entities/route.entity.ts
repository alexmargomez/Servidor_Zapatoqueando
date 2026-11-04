export type RouteDifficultyLevel = 'Fácil' | 'Media' | 'Difícil' | 'Experto';

export interface RouteSegmentInput {
  coords?: number[][];
  difficulty?: string;
  color?: string;
}

export interface NormalizedRouteSegment {
  coords: [number[], number[]];
  difficulty: RouteDifficultyLevel;
  color: string;
  distance_km: number;
  duration_min: number;
}

export interface DifficultyBreakdownItem {
  difficulty: RouteDifficultyLevel;
  color: string;
  distance_km: number;
  percentage: number;
}

export const DIFFICULTY_CONFIG: Record<
  RouteDifficultyLevel,
  { weight: number; speedKmh: number; color: string }
> = {
  Fácil: { weight: 1, speedKmh: 4.5, color: '#eab308' },
  Media: { weight: 2, speedKmh: 4.0, color: '#f97316' },
  Difícil: { weight: 3, speedKmh: 3.2, color: '#ea580c' },
  Experto: { weight: 4, speedKmh: 2.5, color: '#dc2626' },
};

export function normalizeDifficultyLevel(
  difficulty?: string | null,
  color?: string | null
): RouteDifficultyLevel {
  if (difficulty === 'Fácil' || difficulty === 'Media' || difficulty === 'Difícil' || difficulty === 'Experto') {
    return difficulty;
  }
  const cleanColor = (color || '').trim().toLowerCase();
  if (cleanColor === '#dc2626') return 'Experto';
  if (cleanColor === '#ea580c') return 'Difícil';
  if (cleanColor === '#f97316') return 'Media';
  return 'Fácil';
}

export interface RouteProps {
  id: number;
  name: string;
  description: string | null;
  duration: string | null;
  difficulty: string | null;
  color: string;
  coordinates: unknown;
}

export class RouteEntity {
  public readonly id: number;
  public readonly name: string;
  public readonly description: string | null;
  public readonly duration: string | null;
  public readonly difficulty: string | null;
  public readonly color: string;
  public readonly coordinates: unknown;
  private cachedDistanceKm?: number;
  private cachedSegments?: NormalizedRouteSegment[];

  constructor(props: RouteProps) {
    this.id = props.id;
    this.name = props.name;
    this.description = props.description;
    this.duration = props.duration;
    this.coordinates = props.coordinates || { type: 'LineString', coordinates: [] };

    const hasExplicitSegments = this.hasStoredSegments();
    if (hasExplicitSegments) {
      const computedDiff = this.getComputedDifficulty();
      this.difficulty = computedDiff;
      this.color = DIFFICULTY_CONFIG[computedDiff].color;
    } else {
      const fallbackDiff = normalizeDifficultyLevel(props.difficulty, props.color);
      this.difficulty = props.difficulty || fallbackDiff;
      this.color = props.color || DIFFICULTY_CONFIG[fallbackDiff].color;
    }
  }

  private hasStoredSegments(): boolean {
    const geo = this.coordinates as { segments?: unknown[] } | null;
    return Array.isArray(geo?.segments) && geo!.segments.length > 0;
  }

  private static haversinePairKm(pt1: number[], pt2: number[]): number {
    if (!Array.isArray(pt1) || !Array.isArray(pt2) || pt1.length < 2 || pt2.length < 2) {
      return 0;
    }
    const [lng1, lat1] = pt1;
    const [lng2, lat2] = pt2;
    if (
      typeof lat1 !== 'number' ||
      typeof lng1 !== 'number' ||
      typeof lat2 !== 'number' ||
      typeof lng2 !== 'number'
    ) {
      return 0;
    }
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  getNormalizedSegments(): NormalizedRouteSegment[] {
    if (this.cachedSegments) {
      return this.cachedSegments;
    }

    const geo = this.coordinates as {
      coordinates?: number[][];
      segments?: RouteSegmentInput[];
    } | null;
    const pts = Array.isArray(geo?.coordinates) ? geo!.coordinates : [];
    const rawSegments = Array.isArray(geo?.segments) ? geo!.segments : [];

    const result: NormalizedRouteSegment[] = [];

    if (pts.length >= 2) {
      for (let i = 0; i < pts.length - 1; i++) {
        const pt1 = pts[i];
        const pt2 = pts[i + 1];
        const segMeta = rawSegments[i];
        const diff = normalizeDifficultyLevel(
          segMeta?.difficulty ?? this.difficulty,
          segMeta?.color ?? this.color
        );
        const cfg = DIFFICULTY_CONFIG[diff];
        const distKm = RouteEntity.haversinePairKm(pt1, pt2);
        const durMin = (distKm / cfg.speedKmh) * 60;
        result.push({
          coords: [pt1, pt2],
          difficulty: diff,
          color: cfg.color,
          distance_km: Number(distKm.toFixed(4)),
          duration_min: durMin,
        });
      }
    }

    this.cachedSegments = result;
    return result;
  }

  calculateDistanceKm(): number {
    if (this.cachedDistanceKm !== undefined) {
      return this.cachedDistanceKm;
    }

    const segments = this.getNormalizedSegments();
    if (segments.length === 0) {
      this.cachedDistanceKm = 0;
      return 0;
    }

    const totalKm = segments.reduce((acc, s) => acc + s.distance_km, 0);
    this.cachedDistanceKm = Number(totalKm.toFixed(2));
    return this.cachedDistanceKm;
  }

  getDistanceLabel(): string {
    const km = this.calculateDistanceKm();
    if (km <= 0) return '0 m';
    if (km < 1) {
      return `${Math.round(km * 1000)} m`;
    }
    return `${km.toFixed(2)} km`;
  }

  getComputedDifficulty(): RouteDifficultyLevel {
    const segments = this.getNormalizedSegments();
    if (segments.length === 0) {
      return normalizeDifficultyLevel(this.difficulty, this.color);
    }

    const totalKm = segments.reduce((acc, s) => acc + s.distance_km, 0);
    if (totalKm <= 0) {
      return segments[0].difficulty;
    }

    let weightedSum = 0;
    let expertKm = 0;
    let hardKm = 0;

    for (const seg of segments) {
      const cfg = DIFFICULTY_CONFIG[seg.difficulty];
      weightedSum += seg.distance_km * cfg.weight;
      if (seg.difficulty === 'Experto') expertKm += seg.distance_km;
      if (seg.difficulty === 'Difícil') hardKm += seg.distance_km;
    }

    let effectiveScore = weightedSum / totalKm;
    const expertRatio = expertKm / totalKm;
    const hardPlusExpertRatio = (hardKm + expertKm) / totalKm;

    // Regla de pico crítico en senderismo de montaña
    if (expertRatio >= 0.3 || expertKm >= 0.6) {
      effectiveScore = Math.max(effectiveScore, 3.3);
    } else if (expertRatio >= 0.15 || hardPlusExpertRatio >= 0.35) {
      effectiveScore = Math.max(effectiveScore, 2.45);
    }

    if (effectiveScore >= 3.25) return 'Experto';
    if (effectiveScore >= 2.4) return 'Difícil';
    if (effectiveScore >= 1.55) return 'Media';
    return 'Fácil';
  }

  getDifficultyBreakdown(): DifficultyBreakdownItem[] {
    const segments = this.getNormalizedSegments();
    const totalKm = segments.reduce((acc, s) => acc + s.distance_km, 0);
    const levels: RouteDifficultyLevel[] = ['Fácil', 'Media', 'Difícil', 'Experto'];

    if (totalKm <= 0) {
      const defaultDiff = normalizeDifficultyLevel(this.difficulty, this.color);
      return [
        {
          difficulty: defaultDiff,
          color: DIFFICULTY_CONFIG[defaultDiff].color,
          distance_km: 0,
          percentage: 100,
        },
      ];
    }

    const byLevel: Record<RouteDifficultyLevel, number> = {
      Fácil: 0,
      Media: 0,
      Difícil: 0,
      Experto: 0,
    };

    for (const seg of segments) {
      byLevel[seg.difficulty] += seg.distance_km;
    }

    return levels
      .filter((lvl) => byLevel[lvl] > 0)
      .map((lvl) => ({
        difficulty: lvl,
        color: DIFFICULTY_CONFIG[lvl].color,
        distance_km: Number(byLevel[lvl].toFixed(2)),
        percentage: Math.max(1, Math.round((byLevel[lvl] / totalKm) * 100)),
      }));
  }

  getEstimatedDurationMinutes(): number {
    const segments = this.getNormalizedSegments();
    const km = this.calculateDistanceKm();
    if (km <= 0 || segments.length === 0) return 5;

    const totalMinutes = segments.reduce((acc, s) => acc + s.duration_min, 0);
    return Math.max(5, Math.round(totalMinutes));
  }

  toGeoJsonFeature() {
    const distanceKm = this.calculateDistanceKm();
    const distanceLabel = this.getDistanceLabel();
    const autoMinutes = String(this.getEstimatedDurationMinutes());
    const segments = this.getNormalizedSegments();
    const breakdown = this.getDifficultyBreakdown();

    return {
      type: 'Feature',
      geometry: this.coordinates || { type: 'LineString', coordinates: [] },
      properties: {
        id: this.id,
        route_id: this.id,
        name: this.name,
        description: this.description,
        duration: this.duration || autoMinutes,
        distance_km: distanceKm,
        distance_label: distanceLabel,
        difficulty: this.difficulty,
        color: this.color,
        segments,
        difficulty_breakdown: breakdown,
      },
    };
  }

  toRawRecord() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      duration: this.duration || String(this.getEstimatedDurationMinutes()),
      distance_km: this.calculateDistanceKm(),
      distance_label: this.getDistanceLabel(),
      difficulty: this.difficulty,
      color: this.color,
      coordinates: this.coordinates,
      segments: this.getNormalizedSegments(),
      difficulty_breakdown: this.getDifficultyBreakdown(),
    };
  }
}

