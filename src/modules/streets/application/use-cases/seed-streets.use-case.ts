import fs from 'fs';
import path from 'path';
import { StreetRepositoryPort } from '../ports/repositories/street-repository.port';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const osmtogeojson = require('osmtogeojson');

export class SeedStreetsUseCase {
  constructor(private readonly streetRepository: StreetRepositoryPort) {}

  async execute(): Promise<void> {
    const count = await this.streetRepository.count();
    if (count > 0) {
      console.log('Las calles ya están pobladas. Omitiendo seed.');
      return;
    }

    const dataPath = path.resolve(process.cwd(), 'src/database/data/osm_la_fuente.json');
    if (!fs.existsSync(dataPath)) {
      console.log('Archivo osm_la_fuente.json no encontrado, omitiendo poblado de calles.');
      return;
    }

    console.log('Convirtiendo OSM a GeoJSON e insertando calles con Prisma...');
    const rawData = fs.readFileSync(dataPath, 'utf8');
    const osmData = JSON.parse(rawData);
    const geojson = osmtogeojson(osmData);

    const records: Array<{ name: string; geojson: unknown }> = [];
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
