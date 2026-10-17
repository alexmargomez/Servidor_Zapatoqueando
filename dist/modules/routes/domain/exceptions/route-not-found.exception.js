"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RouteNotFoundException = void 0;
const domain_exception_1 = require("../../../../shared/domain/exceptions/domain.exception");
class RouteNotFoundException extends domain_exception_1.DomainException {
    constructor(message = 'Route not found') {
        super(message, 404);
    }
}
exports.RouteNotFoundException = RouteNotFoundException;
