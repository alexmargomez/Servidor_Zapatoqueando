"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoordinatesVO = void 0;
class CoordinatesVO {
    lat;
    lng;
    constructor(lat, lng) {
        const parsedLat = lat !== undefined && lat !== null && lat !== '' ? Number(lat) : null;
        const parsedLng = lng !== undefined && lng !== null && lng !== '' ? Number(lng) : null;
        this.lat = parsedLat !== null && !Number.isNaN(parsedLat) ? parsedLat : null;
        this.lng = parsedLng !== null && !Number.isNaN(parsedLng) ? parsedLng : null;
    }
}
exports.CoordinatesVO = CoordinatesVO;
