export class CoordinatesVO {
  public readonly lat: number | null;
  public readonly lng: number | null;

  constructor(lat?: number | string | null, lng?: number | string | null) {
    const parsedLat = lat !== undefined && lat !== null && lat !== '' ? Number(lat) : null;
    const parsedLng = lng !== undefined && lng !== null && lng !== '' ? Number(lng) : null;

    this.lat = parsedLat !== null && !Number.isNaN(parsedLat) ? parsedLat : null;
    this.lng = parsedLng !== null && !Number.isNaN(parsedLng) ? parsedLng : null;
  }
}
