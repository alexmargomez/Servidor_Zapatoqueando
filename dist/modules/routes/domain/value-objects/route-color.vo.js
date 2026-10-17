"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RouteColorVO = void 0;
class RouteColorVO {
    value;
    constructor(color) {
        const cleaned = (color || '#eab308').trim();
        this.value = /^#[0-9a-fA-F]{6}$/.test(cleaned) ? cleaned : '#eab308';
    }
}
exports.RouteColorVO = RouteColorVO;
