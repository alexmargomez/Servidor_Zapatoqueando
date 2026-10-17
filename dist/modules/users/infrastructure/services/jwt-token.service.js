"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtTokenService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
class JwtTokenService {
    generateToken(payload) {
        return jsonwebtoken_1.default.sign({ id: payload.id, username: payload.username, role: payload.role }, process.env.JWT_SECRET || 'secret_key_123', { expiresIn: '1d' });
    }
    async comparePassword(plainText, hash) {
        return bcryptjs_1.default.compare(plainText, hash);
    }
    async hashPassword(plainText) {
        const salt = await bcryptjs_1.default.genSalt(10);
        return bcryptjs_1.default.hash(plainText, salt);
    }
}
exports.JwtTokenService = JwtTokenService;
