"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdatePosterUseCase = void 0;
const poster_type_vo_1 = require("../../domain/value-objects/poster-type.vo");
const poster_not_found_exception_1 = require("../../domain/exceptions/poster-not-found.exception");
class UpdatePosterUseCase {
    posterRepository;
    constructor(posterRepository) {
        this.posterRepository = posterRepository;
    }
    async execute(id, dto) {
        const typeVo = new poster_type_vo_1.PosterTypeVO(dto.type);
        const updated = await this.posterRepository.update(id, {
            title: dto.title,
            description: dto.description ?? null,
            imageUrl: dto.imageUrl || dto.imageurl || dto.image_url || null,
            type: typeVo.value,
        });
        if (!updated) {
            throw new poster_not_found_exception_1.PosterNotFoundException('Poster not found');
        }
        return updated.toResponse();
    }
}
exports.UpdatePosterUseCase = UpdatePosterUseCase;
