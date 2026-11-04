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
  isPartner?: boolean | null;
  whatsapp?: string | null;
  offerTitle?: string | null;
  offerCode?: string | null;
  specialty?: string | null;
  schedule?: string | null;
  priceRange?: string | null;
  viewsCount?: number | null;
  whatsappClicks?: number | null;
  checkinsCount?: number | null;
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
  public readonly isPartner: boolean;
  public readonly whatsapp: string | null;
  public readonly offerTitle: string | null;
  public readonly offerCode: string | null;
  public readonly specialty: string | null;
  public readonly schedule: string | null;
  public readonly priceRange: string | null;
  public readonly viewsCount: number;
  public readonly whatsappClicks: number;
  public readonly checkinsCount: number;

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
    this.isPartner = Boolean(props.isPartner);
    this.whatsapp = props.whatsapp ?? null;
    this.offerTitle = props.offerTitle ?? null;
    this.offerCode = props.offerCode ?? null;
    this.specialty = props.specialty ?? null;
    this.schedule = props.schedule ?? null;
    this.priceRange = props.priceRange ?? null;
    this.viewsCount = Number(props.viewsCount ?? 0);
    this.whatsappClicks = Number(props.whatsappClicks ?? 0);
    this.checkinsCount = Number(props.checkinsCount ?? 0);
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
      is_partner: this.isPartner,
      whatsapp: this.whatsapp,
      offer_title: this.offerTitle,
      offer_code: this.offerCode,
      specialty: this.specialty,
      schedule: this.schedule,
      price_range: this.priceRange,
      views_count: this.viewsCount,
      whatsapp_clicks: this.whatsappClicks,
      checkins_count: this.checkinsCount,
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
      is_partner: this.isPartner,
      whatsapp: this.whatsapp,
      offer_title: this.offerTitle,
      offer_code: this.offerCode,
      specialty: this.specialty,
      schedule: this.schedule,
      price_range: this.priceRange,
      views_count: this.viewsCount,
      whatsapp_clicks: this.whatsappClicks,
      checkins_count: this.checkinsCount,
    };
  }
}
