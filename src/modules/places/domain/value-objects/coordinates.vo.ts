export class CoordinatesVO {
  public readonly lat: number | null;
  public readonly lng: number | null;

  // Límites geográficos aproximados del municipio de Zapatoca, Santander
  public static readonly ZAPATOCA_BOUNDS = {
    minLat: 6.70,
    maxLat: 6.95,
    minLng: -73.40,
    maxLng: -73.15,
  };

  constructor(lat?: number | string | null, lng?: number | string | null) {
    const parsedLat = lat !== undefined && lat !== null && lat !== '' ? Number(lat) : null;
    const parsedLng = lng !== undefined && lng !== null && lng !== '' ? Number(lng) : null;

    this.lat =
      parsedLat !== null && !Number.isNaN(parsedLat) && parsedLat >= -90 && parsedLat <= 90
        ? parsedLat
        : null;
    this.lng =
      parsedLng !== null && !Number.isNaN(parsedLng) && parsedLng >= -180 && parsedLng <= 180
        ? parsedLng
        : null;
  }

  public isValidWgs84(): boolean {
    return this.lat !== null && this.lng !== null;
  }

  public isWithinZapatocaBoundary(): boolean {
    if (this.lat === null || this.lng === null) {
      return false;
    }
    const b = CoordinatesVO.ZAPATOCA_BOUNDS;
    return (
      this.lat >= b.minLat &&
      this.lat <= b.maxLat &&
      this.lng >= b.minLng &&
      this.lng <= b.maxLng
    );
  }

  /**
   * Calcula la distancia geodésica en metros usando la fórmula de Haversine.
   */
  public distanceToMeters(other: CoordinatesVO): number | null {
    if (this.lat === null || this.lng === null || other.lat === null || other.lng === null) {
      return null;
    }
    const R = 6371000; // Radio terrestre medio en metros
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const dLat = toRad(other.lat - this.lat);
    const dLng = toRad(other.lng - this.lng);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(this.lat)) *
        Math.cos(toRad(other.lat)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 100) / 100;
  }
}
