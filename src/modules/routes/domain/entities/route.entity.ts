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

  constructor(props: RouteProps) {
    this.id = props.id;
    this.name = props.name;
    this.description = props.description;
    this.duration = props.duration;
    this.difficulty = props.difficulty;
    this.color = props.color || '#eab308';
    this.coordinates = props.coordinates || { type: 'LineString', coordinates: [] };
  }

  calculateDistanceKm(): number {
    const geo = this.coordinates as { coordinates?: number[][] } | null;
    const pts = Array.isArray(geo?.coordinates) ? geo!.coordinates : [];
    if (pts.length < 2) return 0;

    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const R = 6371; // Radio de la Tierra en km
    let totalKm = 0;

    for (let i = 0; i < pts.length - 1; i++) {
      const [lng1, lat1] = pts[i];
      const [lng2, lat2] = pts[i + 1];
      if (
        typeof lat1 !== 'number' ||
        typeof lng1 !== 'number' ||
        typeof lat2 !== 'number' ||
        typeof lng2 !== 'number'
      ) {
        continue;
      }
      const dLat = toRad(lat2 - lat1);
      const dLng = toRad(lng2 - lng1);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      totalKm += R * c;
    }

    return Number(totalKm.toFixed(2));
  }

  getDistanceLabel(): string {
    const km = this.calculateDistanceKm();
    if (km <= 0) return '0 m';
    if (km < 1) {
      return `${Math.round(km * 1000)} m`;
    }
    return `${km.toFixed(2)} km`;
  }

  getEstimatedDurationMinutes(): number {
    const km = this.calculateDistanceKm();
    if (km <= 0) return 5;
    return Math.max(5, Math.round((km / 4.5) * 60));
  }

  toGeoJsonFeature() {
    const distanceKm = this.calculateDistanceKm();
    const distanceLabel = this.getDistanceLabel();
    const autoMinutes = String(this.getEstimatedDurationMinutes());

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
    };
  }
}
