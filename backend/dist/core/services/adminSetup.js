import { UserModel } from '../../infrastructure/adapters/outputs/models/UserModel.js';
import bcrypt from 'bcrypt';
/**
 * Crea el usuario administrador si no existe.
 * Las credenciales se leen desde las variables de entorno ADMIN_USERNAME y ADMIN_PASSWORD.
 * Se ejecuta una sola vez al arrancar el servidor.
 */
export async function crearAdminSiNoExiste() {
    try {
        const adminUsername = process.env.ADMIN_USERNAME || 'admin';
        const adminPassword = process.env.ADMIN_PASSWORD || 'Admin1234!';
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@learnscape.edu.co';
        // Verificar si ya existe un admin (acepta tanto 'admin' como 'ADMIN' por compatibilidad)
        const adminExistente = await UserModel.findOne({ role: { $in: ['admin', 'ADMIN'] } });
        if (adminExistente) {
            console.log(`✅ Administrador ya existe: ${adminExistente.username}`);
            return;
        }
        // Crear el admin
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(adminPassword, salt);
        await UserModel.create({
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