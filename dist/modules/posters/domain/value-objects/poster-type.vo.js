"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PosterTypeVO = void 0;
class PosterTypeVO {
    value;
    constructor(type) {
        const normalized = (type || 'event').trim().toLowerCase();
        this.value = normalized === 'business' ? 'business' : 'event';
    }
}
exports.PosterTypeVO = PosterTypeVO;
