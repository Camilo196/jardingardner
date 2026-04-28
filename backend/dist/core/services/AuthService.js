import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
export class AuthService {
    JWT_SECRET = process.env.JWT_SECRET;
    userRepository;
    constructor(userRepository) {
        if (!userRepository) {
            throw new Error("AuthService requiere un userRepository válido");
        }
        this.userRepository = userRepository;
    }
    generateRandomPassword(length = 8) {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const bytes = crypto.randomBytes(length);
        return Array.from(bytes)
            .map(byte => characters[byte % characters.length])
            .join('');
    }
    /**
     * Registra un nuevo usuario
     */
    async register(username, password, role) {
        try {
            // Verificar si el usuario ya existe
            const existingUser = await this.userRepository.findByUsername(username);
            if (existingUser) {
                throw new Error('El usuario ya existe');
            }
            // Crear nuevo usuario
            const user = await this.userRepository.create({
                username,
                password, // El repositorio se encarga de hashear la contraseña
                role
            });
            // Generar token JWT
            const token = jwt.sign({
                id: user.id,
                username: user.username,
                role: user.role
            }, this.JWT_SECRET, { expiresIn: '8h' });
            return { user, token };
        }
        catch (error) {
            console.error("Error en registro:", error);
            throw new Error(error.message || 'Error al registrar usuario');
        }
    }
    /**
     * Realiza login de usuario
     */
    async login(username, password) {
        try {
            // Buscar usuario por username
            const user = await this.userRepository.findByUsername(username);
            if (!user) {
                throw new Error('Usuario no encontrado');
            }
            // Verificar contraseña
            const validPassword = await bcrypt.compare(password, user.password);
            if (!validPassword) {
                throw new Error('Contraseña incorrecta');
            }
            // Generar token JWT
            const token = jwt.sign({
                id: user.id,
                username: user.username,
                role: user.role
            }, this.JWT_SECRET, { expiresIn: '8h' });
            // Limpiar objeto de usuario para no devolver la contraseña
            const userWithoutPassword = {
                ...user,
                password: undefined
            };
            return { user: userWithoutPassword, token };
        }
        catch (error) {
            console.error("Error en login:", error);
            throw new Error(error.message || 'Error al iniciar sesión');
        }
    }
    /**
 * Autentica a un usuario por identificador (username o email)
 */
    async authenticate(identifier, password) {
        try {
            // Buscar usuario por username o email
            const user = await this.userRepository.findByUsername(identifier);
            if (!user) {
                console.error(`❌ Usuario ${identifier} no encontrado`);
                throw new Error('Usuario no encontrado');
            }
            // Verificar contraseña
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                console.error(`❌ Contraseña incorrecta para ${identifier}`);
                throw new Error('Contraseña incorrecta');
            }
            console.log(`✅ Autenticación exitosa para ${identifier}`);
            // Crear token JWT
            const token = jwt.sign({
                id: user.id,
                username: user.username,
                role: user.role,
                email: user.email
            }, process.env.JWT_SECRET, { expiresIn: '24h' });
            // Crear objeto de usuario sin la contraseña
            const userWithoutPassword = {
                id: user.id,
                username: user.username,
                role: user.role,
                email: user.email,
                password: '', // Empty string since we don't want to expose the password
                isFirstLogin: user.isFirstLogin || false
            };
            // Añadir isFirstLogin a la respuesta
            return {
                user: userWithoutPassword,
                token,
                isFirstLogin: user.isFirstLogin || false
            };
        }
        catch (error) {
            console.error("Error en autenticación:", error);
            throw error;
        }
    }
    /**
     * Crea credenciales para un estudiante existente
     */
    async createUserCredentials(userId, role = 'ESTUDIANTE') {
        try {
            console.log(`Generando credenciales para ${role.toLowerCase()} ${userId}`);
            const normalizedRole = role.toUpperCase();
            const password = normalizedRole === 'ESTUDIANTE' ? userId : this.generateRandomPassword();
            // Buscar si ya existe un usuario con este username
            const existingUser = await this.userRepository.findByUsername(userId);
            if (existingUser) {
                console.log(`Usuario existente encontrado para ${userId}, actualizando contraseña`);
                await this.userRepository.resetPassword(userId, password);
            }
            else {
                console.log(`Creando nuevo usuario para ${role.toLowerCase()} ${userId}`);
                // Crear usuario con la cédula como username y el rol proporcionado
                await this.userRepository.create({
                    username: userId,
                    password: password,
                    role: role, // Usar el rol proporcionado en lugar de hardcodear ESTUDIANTE
                    email: userId // Usar la cédula como email temporalmente si no tienes otro
                });
            }
            console.log(`Credenciales generadas exitosamente para ${role.toLowerCase()} ${userId}`);
            return password;
        }
        catch (error) {
            console.error("Error al crear credenciales:", error);
            throw new Error(error.message || 'Error al crear credenciales');
        }
    }
    /**
     * Genera una contraseña provisional para un usuario existente
     */
    async generateProvisionalPassword(username) {
        try {
            const password = this.generateRandomPassword();
            // Actualizar contraseña del usuario
            const result = await this.userRepository.resetPassword(username, password);
            if (!result) {
                throw new Error('No se pudo actualizar la contraseña');
            }
            return true;
        }
        catch (error) {
            console.error("Error al generar contraseña provisional:", error);
            throw new Error(error.message || 'Error al generar contraseña provisional');
        }
    }
    /**
     * Verifica un token JWT
     */
    verifyToken(token) {
        try {
            return jwt.verify(token, this.JWT_SECRET);
        }
        catch (error) {
            throw new Error('Token inválido');
        }
    }
}
//# sourceMappingURL=AuthService.js.map