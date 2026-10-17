"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlaceEntity = void 0;
class PlaceEntity {
    id;
    placeId;
    name;
    rating;
    userRatingsTotal;
    formattedAddress;
    imageUrl;
    lat;
    lng;
    category;
    description;
    constructor(props) {
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
exports.PlaceEntity = PlaceEntity;
