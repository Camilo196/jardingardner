"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.crearAdminSiNoExiste = crearAdminSiNoExiste;
const UserModel_js_1 = require("../../infrastructure/adapters/outputs/models/UserModel.js");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
/**
 * Crea el usuario administrador si no existe.
 * Las credenciales se leen desde las variables de entorno ADMIN_USERNAME y ADMIN_PASSWORD.
 * Se ejecuta una sola vez al arrancar el servidor.
 */
async function crearAdminSiNoExiste() {
    try {
        const adminUsername = process.env.ADMIN_USERNAME || 'admin';
        const adminPassword = process.env.ADMIN_PASSWORD || 'Admin1234!';
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@learnscape.edu.co';
        // Verificar si ya existe un admin (acepta tanto 'admin' como 'ADMIN' por compatibilidad)
        const adminExistente = await UserModel_js_1.UserModel.findOne({ role: { $in: ['admin', 'ADMIN'] } });
        if (adminExistente) {
            console.log(`✅ Administrador ya existe: ${adminExistente.username}`);
            return;
        }
        // Crear el admin
        const salt = await bcryptjs_1.default.genSalt(10);
        const hashedPassword = await bcryptjs_1.default.hash(adminPassword, salt);
        await UserModel_js_1.UserModel.create({
            username: adminUsername,
            password: hashedPassword,
            role: 'ADMIN',
            email: adminEmail,
            isFirstLogin: false, // El admin no necesita cambiar contraseña
        });
        console.log('');
        console.log('🎉 ==========================================');
        console.log('   ADMINISTRADOR CREADO EXITOSAMENTE');
        console.log('==========================================');
        console.log(`   Usuario:    ${adminUsername}`);
        console.log(`   Contraseña: ${adminPassword}`);
        console.log(`   Email:      ${adminEmail}`);
        console.log('==========================================');
        console.log('   ⚠️  Cambia estas credenciales en el .env');
        console.log('==========================================');
        console.log('');
    }
    catch (error) {
        console.error('❌ Error al crear administrador:', error);
    }
}
//# sourceMappingURL=adminSetup.js.map