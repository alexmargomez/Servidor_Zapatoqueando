export class RouteColorVO {
  public readonly value: string;

  constructor(color?: string | null) {
    const cleaned = (color || '#eab308').trim();
    this.value = /^#[0-9a-fA-F]{6}$/.test(cleaned) ? cleaned : '#eab308';
  }
}
