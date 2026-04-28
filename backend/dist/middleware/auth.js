"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkAdmin = exports.verifyToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const UserModel_js_1 = require("../infrastructure/adapters/outputs/models/UserModel.js");
const ROLE_MAP = {
    admin: 'ADMIN', administrator: 'ADMIN', ADMIN: 'ADMIN', ADMINISTRATOR: 'ADMIN',
    teacher: 'PROFESOR', profesor: 'PROFESOR', TEACHER: 'PROFESOR', PROFESOR: 'PROFESOR',
    student: 'ESTUDIANTE', estudiante: 'ESTUDIANTE', STUDENT: 'ESTUDIANTE', ESTUDIANTE: 'ESTUDIANTE',
};
const verifyToken = async (req, _, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return next();
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const user = await UserModel_js_1.UserModel.findById(decoded.id);
        if (user) {
            req.user = {
                id: user._id,
                username: user.username,
                email: user.email,
                role: ROLE_MAP[user.role] ?? user.role.toUpperCase(),
            };
        }
        next();
    }
    catch (error) {
        console.error('Error en autenticación:', error);
        next();
    }
};
exports.verifyToken = verifyToken;
const checkAdmin = (user) => {
    if (!user || user.role !== 'ADMIN') {
        throw new Error('No autorizado - Se requiere rol de administrador');
    }
};
exports.checkAdmin = checkAdmin;
//# sourceMappingURL=auth.js.map