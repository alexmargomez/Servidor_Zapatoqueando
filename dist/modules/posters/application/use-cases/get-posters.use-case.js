"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetPostersUseCase = void 0;
class GetPostersUseCase {
    posterRepository;
    constructor(posterRepository) {
        this.posterRepository = posterRepository;
    }
    async execute() {
        const posters = await this.posterRepository.findAll();
        return posters.map((p) => p.toResponse());
    }
}
exports.GetPostersUseCase = GetPostersUseCase;
