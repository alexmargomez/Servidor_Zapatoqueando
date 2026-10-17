export interface PosterProps {
  id: number;
  title: string;
  description: string | null;
  imageUrl: string | null;
  type: string;
  orderIndex: number | null;
}

export class PosterEntity {
  public readonly id: number;
  public readonly title: string;
  public readonly description: string | null;
  public readonly imageUrl: string | null;
  public readonly type: string;
  public readonly orderIndex: number | null;

  constructor(props: PosterProps) {
    this.id = props.id;
    this.title = props.title;
    this.description = props.description;
    this.imageUrl = props.imageUrl;
    this.type = props.type || 'event';
    this.orderIndex = props.orderIndex ?? 0;
  }

  toResponse() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      imageurl: this.imageUrl,
      image_url: this.imageUrl,
      type: this.type,
      order_index: this.orderIndex,
    };
  }
}
