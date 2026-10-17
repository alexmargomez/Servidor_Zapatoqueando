"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadImageUseCase = void 0;
const invalid_upload_exception_1 = require("../../domain/exceptions/invalid-upload.exception");
class UploadImageUseCase {
    storageService;
    constructor(storageService) {
        this.storageService = storageService;
    }
    execute(filename) {
        if (!filename) {
            throw new invalid_upload_exception_1.InvalidUploadException('No se proporcionó ninguna imagen');
        }
        return {
            imageUrl: this.storageService.getPublicUploadUrl(filename),
        };
    }
}
exports.UploadImageUseCase = UploadImageUseCase;
