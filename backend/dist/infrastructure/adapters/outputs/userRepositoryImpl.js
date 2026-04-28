"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepositoryImpl = void 0;
const user_1 = require("../../../core/domain/user");
const UserModel_1 = require("./models/UserModel");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
// Normalizar roles a mayúsculas para consistencia en la DB
const ROLE_ALIASES = {
    admin: 'ADMIN', administrator: 'ADMIN', ADMINISTRATOR: 'ADMIN',
    teacher: 'PROFESOR', profesor: 'PROFESOR', TEACHER: 'PROFESOR',
    student: 'ESTUDIANTE', estudiante: 'ESTUDIANTE', STUDENT: 'ESTUDIANTE',
};
function normalizarRol(rol) {
    return ROLE_ALIASES[rol] ?? rol.toUpperCase();
}
class UserRepositoryImpl {
    constructor() {
        this.userModel = UserModel_1.UserModel;
    }
    async findByUsername(username) {
        console.log(`Buscando usuario con username: ${username}`);
        try {
            // Busca por username O por email
            const user = await this.userModel.findOne({
                $or: [
                    { username: username },
                    { email: username }
                ]
            });
            console.log(`Usuario encontrado: ${user ? 'Sí' : 'No'}`);
            if (!user)
                return null;
            return new user_1.User(user.id, user.username, user.password, user.role, user.email, user.isFirstLogin);
        }
        catch (error) {
            console.error('Error al buscar usuario por username:', error);
            throw error;
        }
    }
    async updatePassword(username, hashedPassword) {
        try {
            console.log(`Actualizando contraseña para usuario ${username}`);
            const result = await this.userModel.updateOne({ username }, {
                $set: {
                    password: hashedPassword,
                    isFirstLogin: false // Al cambiar contraseña, ya no es primer inicio
                }
            });
            console.log(`Resultado de actualización de contraseña: ${result.modifiedCount > 0 ? 'Exitoso' : 'No encontrado'}`);
            return result.modifiedCount > 0;
        }
        catch (error) {
            console.error("Error al actualizar contraseña:", error);
            throw error;
        }
    }
    async updateFirstLogin(username, isFirstLogin) {
        try {
            console.log(`Actualizando estado de primer inicio para usuario ${username}: ${isFirstLogin}`);
            const result = await this.userModel.updateOne({ username }, { $set: { isFirstLogin } });
            console.log(`Resultado de actualización de estado de primer inicio: ${result.modifiedCount > 0 ? 'Exitoso' : 'No encontrado'}`);
            return result.modifiedCount > 0;
        }
        catch (error) {
            console.error("Error al actualizar estado de primer inicio:", error);
            throw error;
        }
    }
    async create(userData) {
        try {
            console.log(`Creando usuario con username: ${userData.username}, role: ${userData.role}, email: ${userData.email || 'no proporcionado'}`);
            // Verificar si ya existe un usuario con ese username o email
            const existingUser = await this.userModel.findOne({
                $or: [
                    { username: userData.username },
                    ...(userData.email ? [{ email: userData.email }] : [])
                ]
            }).exec();
            if (existingUser) {
                console.log(`El usuario ${userData.username} ya existe, actualizando contraseña`);
                // Si existe, actualizar la contraseña
                const salt = await bcryptjs_1.default.genSalt(10);
                const hashedPassword = await bcryptjs_1.default.hash(userData.password, salt);
                existingUser.password = hashedPassword;
                // Actualizar email si se proporciona y no existe
                if (userData.email && !existingUser.email) {
                    existingUser.email = userData.email;
                }
                // Actualizar el estado de primer inicio de sesión si se proporciona
                if (userData.isFirstLogin !== undefined) {
                    existingUser.isFirstLogin = userData.isFirstLogin;
                }
                const updatedUser = await existingUser.save();
                return this.mapToEntity(updatedUser);
            }
            // Si no existe, crear nuevo usuario
            const salt = await bcryptjs_1.default.genSalt(10);
            const hashedPassword = await bcryptjs_1.default.hash(userData.password, salt);
            const newUser = new this.userModel({
                username: userData.username,
                password: hashedPassword,
                role: normalizarRol(userData.role), // Normalizar a ADMIN / PROFESOR / ESTUDIANTE
                email: userData.email, // Incluir email si está presente
                isFirstLogin: userData.isFirstLogin !== undefined ? userData.isFirstLogin : true // Por defecto, es primer inicio
            });
            const savedUser = await newUser.save();
            console.log(`Usuario creado exitosamente: ${savedUser.username} con email: ${savedUser.email || 'ninguno'}`);
            return this.mapToEntity(savedUser);
        }
        catch (error) {
            console.error('Error al crear usuario:', error);
            throw new Error(`Error al crear usuario: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async resetPassword(identifier, newPassword) {
        try {
            console.log(`Intentando restablecer contraseña para identificador ${identifier}`);
            // Buscar por username o email
            const user = await this.userModel.findOne({
                $or: [
                    { username: identifier },
                    { email: identifier }
                ]
            }).exec();
            if (!user) {
                console.error(`Usuario con identificador ${identifier} no encontrado para reset de contraseña`);
                return false;
            }
            const salt = await bcryptjs_1.default.genSalt(10);
            const hashedPassword = await bcryptjs_1.default.hash(newPassword, salt);
            user.password = hashedPassword;
            user.isFirstLogin = true; // Marcar como primer inicio cuando se restablece la contraseña
            await user.save();
            console.log(`Contraseña restablecida para usuario ${user.username} (${user.email || 'sin email'})`);
            return true;
        }
        catch (error) {
            console.error(`Error al restablecer contraseña para ${identifier}:`, error);
            throw new Error(`Error al restablecer contraseña: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async findAll() {
        try {
            const users = await this.userModel.find().exec();
            return users.map((user) => this.mapToEntity(user));
        }
        catch (error) {
            console.error('Error al obtener todos los usuarios:', error);
            throw error;
        }
    }
    async delete(id) {
        try {
            const result = await this.userModel.deleteOne({ _id: id }).exec();
            return result.deletedCount > 0;
        }
        catch (error) {
            console.error('Error al eliminar usuario:', error);
            throw error;
        }
    }
    mapToEntity(doc) {
        return new user_1.User(doc._id.toString(), doc.username, doc.password, doc.role, doc.email, doc.isFirstLogin);
    }
}
exports.UserRepositoryImpl = UserRepositoryImpl;
//# sourceMappingURL=userRepositoryImpl.js.map