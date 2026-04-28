export class User {
    id;
    username;
    password;
    role;
    email;
    isFirstLogin;
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
//# sourceMappingURL=user.js.map