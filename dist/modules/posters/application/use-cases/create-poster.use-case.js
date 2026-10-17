"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreatePosterUseCase = void 0;
const poster_type_vo_1 = require("../../domain/value-objects/poster-type.vo");
class CreatePosterUseCase {
    posterRepository;
    constructor(posterRepository) {
        this.posterRepository = posterRepository;
    }
    async execute(dto) {
        const typeVo = new poster_type_vo_1.PosterTypeVO(dto.type);
        const created = await this.posterRepository.create({
            title: dto.title,
            description: dto.description ?? null,
            imageUrl: dto.imageUrl || dto.imageurl || dto.image_url || null,
            type: typeVo.value,
        });
        return created.toResponse();
    }
}
exports.CreatePosterUseCase = CreatePosterUseCase;
