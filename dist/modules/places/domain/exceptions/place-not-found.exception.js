"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlaceNotFoundException = void 0;
const domain_exception_1 = require("../../../../shared/domain/exceptions/domain.exception");
class PlaceNotFoundException extends domain_exception_1.DomainException {
    constructor(message = 'Place not found') {
        super(message, 404);
    }
}
exports.PlaceNotFoundException = PlaceNotFoundException;
