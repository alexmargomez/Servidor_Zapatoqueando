export class PosterTypeVO {
  public readonly value: string;

  constructor(type?: string | null) {
    const normalized = (type || 'event').trim().toLowerCase();
    this.value = normalized === 'business' ? 'business' : 'event';
  }
}
