export interface PlaceProps {
  id: number;
  placeId: string;
  name: string;
  rating: number | null;
  userRatingsTotal: number | null;
  formattedAddress: string | null;
  imageUrl: string | null;
  lat: number | null;
  lng: number | null;
  category: string;
  description: string | null;
}

export class PlaceEntity {
  public readonly id: number;
  public readonly placeId: string;
  public readonly name: string;
  public readonly rating: number | null;
  public readonly userRatingsTotal: number | null;
  public readonly formattedAddress: string | null;
  public readonly imageUrl: string | null;
  public readonly lat: number | null;
  public readonly lng: number | null;
  public readonly category: string;
  public readonly description: string | null;

  constructor(props: PlaceProps) {
    this.id = props.id;
    this.placeId = props.placeId;
    this.name = props.name;
    this.rating = props.rating;
    this.userRatingsTotal = props.userRatingsTotal;
    this.formattedAddress = props.formattedAddress;
    this.imageUrl = props.imageUrl;
    this.lat = props.lat;
    this.lng = props.lng;
    this.category = props.category || 'Lugares turísticos';
    this.description = props.description;
  }

  toPublicResponse() {
    return {
      place_id: this.id.toString(),
      name: this.name,
      rating: this.rating,
      user_ratings_total: this.userRatingsTotal,
      formatted_address: this.formattedAddress,
      image_url: this.imageUrl,
      description: this.description,
      location: {
        lat: this.lat,
        lng: this.lng,
      },
      category: this.category,
    };
  }

  toRawRecord() {
    return {
      id: this.id,
      place_id: this.placeId,
      name: this.name,
      rating: this.rating,
      user_ratings_total: this.userRatingsTotal,
      formatted_address: this.formattedAddress,
      image_url: this.imageUrl,
      lat: this.lat,
      lng: this.lng,
      category: this.category,
      description: this.description,
    };
  }
}
