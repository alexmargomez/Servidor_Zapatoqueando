export interface StreetProps {
  id: number;
  name: string | null;
  geojson: unknown;
}

export class StreetEntity {
  public readonly id: number;
  public readonly name: string | null;
  public readonly geojson: unknown;

  constructor(props: StreetProps) {
    this.id = props.id;
    this.name = props.name;
    this.geojson = props.geojson;
  }
}
