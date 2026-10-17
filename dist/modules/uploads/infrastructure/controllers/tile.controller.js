"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TileController = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const axios_1 = __importDefault(require("axios"));
const CACHE_DIR = path_1.default.resolve(process.cwd(), 'public/map-cache');
if (!fs_1.default.existsSync(CACHE_DIR)) {
    fs_1.default.mkdirSync(CACHE_DIR, { recursive: true });
}
class TileController {
    getTile = async (req, res) => {
        try {
            const { z, x, y } = req.params;
            const tileDir = path_1.default.join(CACHE_DIR, z, x);
            const filePath = path_1.default.join(tileDir, y);
            if (fs_1.default.existsSync(filePath)) {
                res.setHeader('Cache-Control', 'public, max-age=31536000');
                res.sendFile(filePath);
                return;
            }
            const yNumber = y.replace('.jpg', '');
            const googleUrl = `http://mt0.google.com/vt/lyrs=s&hl=es&x=${x}&y=${yNumber}&z=${z}`;
            const response = await (0, axios_1.default)({
                method: 'get',
                url: googleUrl,
                responseType: 'stream',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                },
                timeout: 5000,
            });
            if (!fs_1.default.existsSync(tileDir)) {
                fs_1.default.mkdirSync(tileDir, { recursive: true });
            }
            const writer = fs_1.default.createWriteStream(filePath);
            response.data.pipe(writer);
            writer.on('finish', () => {
                res.setHeader('Cache-Control', 'public, max-age=31536000');
                res.sendFile(filePath);
            });
            writer.on('error', (err) => {
                console.error(`[TileProxy] Error guardando tile ${z}/${x}/${y}:`, err);
                res.redirect(googleUrl);
            });
        }
        catch (error) {
            console.error(`[TileProxy] Error descargando tile:`, error?.message);
            const yNumber = (req.params.y || '').replace('.jpg', '');
            const googleUrl = `http://mt0.google.com/vt/lyrs=s&hl=es&x=${req.params.x}&y=${yNumber}&z=${req.params.z}`;
            res.redirect(googleUrl);
        }
    };
}
exports.TileController = TileController;
