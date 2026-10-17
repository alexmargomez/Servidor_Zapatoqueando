"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StreetController = void 0;
class StreetController {
    getStreetsUseCase;
    constructor(getStreetsUseCase) {
        this.getStreetsUseCase = getStreetsUseCase;
    }
    getStreets = async (_req, res) => {
        try {
            const features = await this.getStreetsUseCase.execute();
            res.json({
                type: 'FeatureCollection',
                features,
            });
        }
        catch (err) {
            res.status(500).json({ error: err?.message || 'Internal server error' });
        }
    };
}
exports.StreetController = StreetController;
