"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StreetEntity = void 0;
class StreetEntity {
    id;
    name;
    geojson;
    constructor(props) {
        this.id = props.id;
        this.name = props.name;
        this.geojson = props.geojson;
    }
}
exports.StreetEntity = StreetEntity;
