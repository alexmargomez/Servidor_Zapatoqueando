"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserEntity = void 0;
class UserEntity {
    id;
    username;
    passwordHash;
    role;
    constructor(props) {
        this.id = props.id;
        this.username = props.username;
        this.passwordHash = props.passwordHash;
        this.role = props.role || 'admin';
    }
}
exports.UserEntity = UserEntity;
