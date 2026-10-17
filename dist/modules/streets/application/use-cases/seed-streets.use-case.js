"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeedStreetsUseCase = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
// eslint-disable-next-line @typescript-eslint/no-var-requires
const osmtogeojson = require('osmtogeojson');
class SeedStreetsUseCase {
    streetRepository;
    constructor(streetRepository) {
        this.streetRepository = streetRepository;
    }
    async execute() {
        const count = await this.streetRepository.count();
        if (count > 0) {
            console.log('Las calles ya están pobladas. Omitiendo seed.');
            return;
        }
        const dataPath = path_1.default.resolve(process.cwd(), 'src/database/data/osm_la_fuente.json');
        if (!fs_1.default.existsSync(dataPath)) {
            console.log('Archivo osm_la_fuente.json no encontrado, omitiendo poblado de calles.');
            return;
        }
        console.log('Convirtiendo OSM a GeoJSON e insertando calles con Prisma...');
        const rawData = fs_1.default.readFileSync(dataPath, 'utf8');
        const osmData = JSON.parse(rawData);
        const geojson = osmtogeojson(osmData);
        const records = [];
        for (const feature of geojson.features || []) {
            if (feature?.properties?.name && feature?.geometry?.type === 'LineString') {
                records.push({
                    name: String(feature.properties.name),
                    geojson: feature,
                });
            }
        }
        if (records.length > 0) {
            const inserted = await this.streetRepository.createMany(records);
            console.log(`Pobladas ${inserted} calles correctamente.`);
        }
    }
}
exports.SeedStreetsUseCase = SeedStreetsUseCase;
