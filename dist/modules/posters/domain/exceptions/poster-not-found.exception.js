"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PosterNotFoundException = void 0;
const domain_exception_1 = require("../../../../shared/domain/exceptions/domain.exception");
class PosterNotFoundException extends domain_exception_1.DomainException {
    constructor(message = 'Poster not found') {
        super(message, 404);
    }
}
exports.PosterNotFoundException = PosterNotFoundException;
