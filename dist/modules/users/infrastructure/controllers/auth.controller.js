"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const domain_exception_1 = require("../../../../shared/domain/exceptions/domain.exception");
class AuthController {
    loginUserUseCase;
    constructor(loginUserUseCase) {
        this.loginUserUseCase = loginUserUseCase;
    }
    login = async (req, res) => {
        try {
            const dto = req.body;
            const { token } = await this.loginUserUseCase.execute(dto);
            res.json({ message: 'success', token });
        }
        catch (err) {
            if (err instanceof domain_exception_1.DomainException) {
                res.status(err.statusCode).json({ error: err.message });
                return;
            }
            res.status(500).json({ error: err?.message || 'Internal server error' });
        }
    };
}
exports.AuthController = AuthController;
