"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeletePosterUseCase = void 0;
const poster_not_found_exception_1 = require("../../domain/exceptions/poster-not-found.exception");
class DeletePosterUseCase {
    posterRepository;
    constructor(posterRepository) {
        this.posterRepository = posterRepository;
    }
    async execute(id) {
        const deleted = await this.posterRepository.delete(id);
        if (!deleted) {
            throw new poster_not_found_exception_1.PosterNotFoundException('Poster not found');
        }
        return deleted.toResponse();
    }
}
exports.DeletePosterUseCase = DeletePosterUseCase;
