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

  toGeoJsonFeature() {
    return {
      type: 'Feature',
      geometry: this.coordinates || { type: 'LineString', coordinates: [] },
      properties: {
        id: this.id,
        route_id: this.id,
        name: this.name,
        description: this.description,
        duration: this.duration,
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
      duration: this.duration,
      difficulty: this.difficulty,
      color: this.color,
      coordinates: this.coordinates,
    };
  }
}
