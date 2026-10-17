"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RouteEntity = void 0;
class RouteEntity {
    id;
    name;
    description;
    duration;
    difficulty;
    color;
    coordinates;
    constructor(props) {
        this.id = props.id;
        this.name = props.name;
        this.description = props.description;
        this.duration = props.duration;
        this.difficulty = props.difficulty;
        this.color = props.color || '#eab308';
        this.coordinates = props.coordinates || { type: 'LineString', coordinates: [] };
    }
    toGeoJsonFeature() {
        return {
            type: 'Feature',
            geometry: this.coordinates || { type: 'LineString', coordinates: [] },
            properties: {
                id: this.id,
                route_id: this.id,
                name: this.name,
                description: this.description,
                duration: this.duration,
                difficulty: this.difficulty,
                color: this.color,
            },
        };
    }
    toRawRecord() {
        return {
            id: this.id,
            name: this.name,
            description: this.description,
            duration: this.duration,
            difficulty: this.difficulty,
            color: this.color,
            coordinates: this.coordinates,
        };
    }
}
exports.RouteEntity = RouteEntity;
