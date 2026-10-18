import { PosterTypeVO } from '../../../src/modules/posters/domain/value-objects/poster-type.vo';
import { PosterEntity } from '../../../src/modules/posters/domain/entities/poster.entity';

describe('PosterTypeVO & PosterEntity', () => {
  describe('PosterTypeVO', () => {
    it('should normalize "business" regardless of casing or whitespace', () => {
      expect(new PosterTypeVO('  BUSINESS ').value).toBe('business');
      expect(new PosterTypeVO('business').value).toBe('business');
    });

    it('should default to "event" for event, empty, or unknown types', () => {
      expect(new PosterTypeVO('event').value).toBe('event');
      expect(new PosterTypeVO(undefined).value).toBe('event');
      expect(new PosterTypeVO('other_type').value).toBe('event');
    });
  });

  describe('PosterEntity', () => {
    it('should map toResponse with both imageurl and image_url fields', () => {
      const entity = new PosterEntity({
        id: 3,
        title: 'Festival de la Danza',
        description: 'Evento cultural anual',
        imageUrl: '/uploads/festival.jpg',
        type: 'event',
        orderIndex: 1,
      });

      expect(entity.toResponse()).toEqual({
        id: 3,
        title: 'Festival de la Danza',
        description: 'Evento cultural anual',
        imageurl: '/uploads/festival.jpg',
        image_url: '/uploads/festival.jpg',
        type: 'event',
        order_index: 1,
      });
    });
  });
});
