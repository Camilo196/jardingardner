"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
class User {
    static findById(id) {
        throw new Error('Method not implemented.');
    }
    constructor(id, username, password, role, email, isFirstLogin = true) {
        this.id = id;
        this.username = username;
        this.password = password;
        this.role = role;
        this.email = email;
        this.isFirstLogin = isFirstLogin;
    }
}
exports.User = User;
//# sourceMappingURL=user.js.map