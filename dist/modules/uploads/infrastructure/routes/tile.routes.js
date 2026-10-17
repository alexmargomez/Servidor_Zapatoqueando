"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tileRouter = void 0;
const express_1 = require("express");
const tile_controller_1 = require("../controllers/tile.controller");
const tileController = new tile_controller_1.TileController();
exports.tileRouter = (0, express_1.Router)();
exports.tileRouter.get('/:z/:x/:y', tileController.getTile);
