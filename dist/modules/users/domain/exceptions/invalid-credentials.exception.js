"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MissingCredentialsException = exports.InvalidCredentialsException = void 0;
const domain_exception_1 = require("../../../../shared/domain/exceptions/domain.exception");
class InvalidCredentialsException extends domain_exception_1.DomainException {
    constructor(message = 'Invalid credentials') {
        super(message, 401);
    }
}
exports.InvalidCredentialsException = InvalidCredentialsException;
class MissingCredentialsException extends domain_exception_1.DomainException {
    constructor(message = 'Email and password are required') {
        super(message, 400);
    }
}
exports.MissingCredentialsException = MissingCredentialsException;
