"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsernameVO = void 0;
const invalid_credentials_exception_1 = require("../exceptions/invalid-credentials.exception");
class UsernameVO {
    value;
    constructor(value) {
        const cleaned = (value || '').trim();
        if (!cleaned) {
            throw new invalid_credentials_exception_1.MissingCredentialsException('Email and password are required');
        }
        this.value = cleaned;
    }
}
exports.UsernameVO = UsernameVO;
