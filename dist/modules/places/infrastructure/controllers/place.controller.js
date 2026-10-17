"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlaceController = void 0;
const domain_exception_1 = require("../../../../shared/domain/exceptions/domain.exception");
class PlaceController {
    getPlacesUseCase;
    createPlaceUseCase;
    updatePlaceUseCase;
    deletePlaceUseCase;
    constructor(getPlacesUseCase, createPlaceUseCase, updatePlaceUseCase, deletePlaceUseCase) {
        this.getPlacesUseCase = getPlacesUseCase;
        this.createPlaceUseCase = createPlaceUseCase;
        this.updatePlaceUseCase = updatePlaceUseCase;
        this.deletePlaceUseCase = deletePlaceUseCase;
    }
    getPlaces = async (_req, res) => {
        try {
            const places = await this.getPlacesUseCase.execute();
            res.json({ message: 'success', data: places });
        }
        catch (err) {
            res.status(500).json({ error: err?.message || 'Internal server error' });
        }
    };
    createPlace = async (req, res) => {
        try {
            const placeData = { ...req.body };
            if (req.file) {
                placeData.image_url = `/uploads/${req.file.filename}`;
            }
            const data = await this.createPlaceUseCase.execute(placeData);
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
    updatePlace = async (req, res) => {
        try {
            const id = Number(req.params.id);
            const placeData = { ...req.body };
            if (req.file) {
                placeData.image_url = `/uploads/${req.file.filename}`;
            }
            const data = await this.updatePlaceUseCase.execute(id, placeData);
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
    deletePlace = async (req, res) => {
        try {
            const id = Number(req.params.id);
            const data = await this.deletePlaceUseCase.execute(id);
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
exports.PlaceController = PlaceController;
