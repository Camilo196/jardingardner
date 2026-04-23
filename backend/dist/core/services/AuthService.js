import { User } from '../domain/user';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
export class AuthService {
    JWT_SECRET = 'your_jwt_secret';
    async register(email, password, role) {
        try {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                throw new Error('El usuario ya existe');
            }
            const hashedPassword = await bcrypt.hash(password, 10);
            const user = new User({ email, password: hashedPassword, role });
            await user.save();
            const userObject = user.toObject();
            const token = jwt.sign({
                id: userObject._id,
                email: userObject.email,
                role: userObject.role
            }, this.JWT_SECRET, { expiresIn: '1h' });
            return { user: userObject, token };
        }
        catch (error) {
            throw new Error(error.message || 'Error al registrar usuario');
        }
    }
    async login(email, password) {
        try {
            const user = await User.findOne({ email });
            if (!user) {
                throw new Error('Usuario no encontrado');
            }
            const validPassword = await bcrypt.compare(password, user.password);
            if (!validPassword) {
                throw new Error('Contraseña incorrecta');
            }
            const userObject = user.toObject();
            const token = jwt.sign({
                id: userObject._id,
                email: userObject.email,
                role: userObject.role
            }, this.JWT_SECRET, { expiresIn: '1h' });
            return { user: userObject, token };
        }
        catch (error) {
            throw new Error(error.message || 'Error al iniciar sesión');
        }
    }
}
//# sourceMappingURL=AuthService.js.map