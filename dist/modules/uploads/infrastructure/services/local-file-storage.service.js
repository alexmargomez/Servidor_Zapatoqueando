"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalFileStorageService = void 0;
class LocalFileStorageService {
    getPublicUploadUrl(filename) {
        return `/uploads/${filename}`;
    }
}
exports.LocalFileStorageService = LocalFileStorageService;
