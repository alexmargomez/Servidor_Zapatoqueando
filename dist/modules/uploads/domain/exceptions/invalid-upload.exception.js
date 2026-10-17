"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidUploadException = void 0;
const domain_exception_1 = require("../../../../shared/domain/exceptions/domain.exception");
class InvalidUploadException extends domain_exception_1.DomainException {
    constructor(message = 'No se proporcionó ninguna imagen') {
        super(message, 400);
    }
}
exports.InvalidUploadException = InvalidUploadException;
