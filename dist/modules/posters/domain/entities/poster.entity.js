"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PosterEntity = void 0;
class PosterEntity {
    id;
    title;
    description;
    imageUrl;
    type;
    orderIndex;
    constructor(props) {
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
exports.PosterEntity = PosterEntity;
