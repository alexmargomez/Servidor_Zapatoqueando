import { CoordinatesVO } from '../../../src/modules/places/domain/value-objects/coordinates.vo';
import { PlaceEntity } from '../../../src/modules/places/domain/entities/place.entity';

describe('CoordinatesVO & PlaceEntity', () => {
  describe('CoordinatesVO', () => {
    it('should parse numeric strings and numbers properly', () => {
      const coords = new CoordinatesVO('6.8152', -73.2684);
      expect(coords.lat).toBe(6.8152);
      expect(coords.lng).toBe(-73.2684);
    });

    it('should return null for empty, undefined, null, or NaN coordinates', () => {
      const emptyCoords = new CoordinatesVO('', undefined);
      expect(emptyCoords.lat).toBeNull();
      expect(emptyCoords.lng).toBeNull();

      const nanCoords = new CoordinatesVO('invalid', 'not-a-number');
      expect(nanCoords.lat).toBeNull();
      expect(nanCoords.lng).toBeNull();
    });
  });

  describe('PlaceEntity', () => {
    it('should map toPublicResponse with nested location object and default category', () => {
      const entity = new PlaceEntity({
        id: 10,
        placeId: 'uuid-10',
        name: 'Cueva del Nitro',
        rating: 4.8,
        userRatingsTotal: 120,
        formattedAddress: 'Zapatoca, Santander',
        imageUrl: '/uploads/nitro.jpg',
        lat: 6.81,
        lng: -73.27,
        category: '',
        description: 'Maravilla subterránea',
      });

      expect(entity.category).toBe('Lugares turísticos');
      expect(entity.toPublicResponse()).toEqual({
        place_id: '10',
        name: 'Cueva del Nitro',
        rating: 4.8,
        user_ratings_total: 120,
        formatted_address: 'Zapatoca, Santander',
        image_url: '/uploads/nitro.jpg',
        description: 'Maravilla subterránea',
        location: {
          lat: 6.81,
          lng: -73.27,
        },
        category: 'Lugares turísticos',
      });
    });

    it('should map toRawRecord with flat database columns', () => {
      const entity = new PlaceEntity({
        id: 5,
        placeId: 'uuid-5',
        name: 'Hotel Casa Quinchos',
        rating: 4.9,
        userRatingsTotal: 45,
        formattedAddress: 'Calle 20',
        imageUrl: null,
        lat: 6.815,
        lng: -73.268,
        category: 'Hospedajes',
        description: null,
      });

      expect(entity.toRawRecord()).toEqual({
        id: 5,
        place_id: 'uuid-5',
        name: 'Hotel Casa Quinchos',
        rating: 4.9,
        user_ratings_total: 45,
        formatted_address: 'Calle 20',
        image_url: null,
        lat: 6.815,
        lng: -73.268,
        category: 'Hospedajes',
        description: null,
      });
    });
  });
});
