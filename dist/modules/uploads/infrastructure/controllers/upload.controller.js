"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadController = void 0;
const domain_exception_1 = require("../../../../shared/domain/exceptions/domain.exception");
class UploadController {
    uploadImageUseCase;
    constructor(uploadImageUseCase) {
        this.uploadImageUseCase = uploadImageUseCase;
    }
    uploadImage = (req, res) => {
        try {
            const result = this.uploadImageUseCase.execute(req.file?.filename);
            res.status(200).json(result);
        }
        catch (err) {
            if (err instanceof domain_exception_1.DomainException) {
                res.status(err.statusCode).json({ error: err.message });
                return;
            }
            console.error('Upload Error:', err);
            res.status(500).json({ error: 'Error al subir la imagen' });
        }
    };
}
exports.UploadController = UploadController;
