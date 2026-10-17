"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PosterController = void 0;
const domain_exception_1 = require("../../../../shared/domain/exceptions/domain.exception");
class PosterController {
    getPostersUseCase;
    createPosterUseCase;
    updatePosterUseCase;
    deletePosterUseCase;
    constructor(getPostersUseCase, createPosterUseCase, updatePosterUseCase, deletePosterUseCase) {
        this.getPostersUseCase = getPostersUseCase;
        this.createPosterUseCase = createPosterUseCase;
        this.updatePosterUseCase = updatePosterUseCase;
        this.deletePosterUseCase = deletePosterUseCase;
    }
    getPosters = async (_req, res) => {
        try {
            const data = await this.getPostersUseCase.execute();
            res.json({ message: 'success', data });
        }
        catch (err) {
            res.status(500).json({ error: err?.message || 'Internal server error' });
        }
    };
    createPoster = async (req, res) => {
        try {
            const data = await this.createPosterUseCase.execute(req.body);
            res.status(201).json({ message: 'success', data });
        }
        catch (err) {
            if (err instanceof domain_exception_1.DomainException) {
                res.status(err.statusCode).json({ error: err.message });
                return;
            }
            res.status(500).json({ error: err?.message || 'Internal server error' });
        }
    };
    updatePoster = async (req, res) => {
        try {
            const id = Number(req.params.id);
            const data = await this.updatePosterUseCase.execute(id, req.body);
            res.json({ message: 'success', data });
        }
        catch (err) {
            if (err instanceof domain_exception_1.DomainException) {
                res.status(err.statusCode).json({ error: err.message });
                return;
            }
            res.status(500).json({ error: err?.message || 'Internal server error' });
        }
    };
    deletePoster = async (req, res) => {
        try {
            const id = Number(req.params.id);
            const data = await this.deletePosterUseCase.execute(id);
            res.json({ message: 'success', data });
        }
        catch (err) {
            if (err instanceof domain_exception_1.DomainException) {
                res.status(err.statusCode).json({ error: err.message });
                return;
            }
            res.status(500).json({ error: err?.message || 'Internal server error' });
        }
    };
}
exports.PosterController = PosterController;
