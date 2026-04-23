import jwt from 'jsonwebtoken';
import { User } from '../core/domain/user';
export const verifyToken = async (req, _, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return next();
        }
        const decoded = jwt.verify(token, 'your_jwt_secret');
        const user = await User.findById(decoded.id);
        if (user) {
            req.user = {
                id: user._id,
                email: user.email,
                role: user.role
            };
        }
        next();
    }
    catch (error) {
        console.error('Error en autenticación:', error);
        next();
    }
};
export const checkAdmin = (user) => {
    if (!user || user.role !== 'admin') {
        throw new Error('No autorizado - Se requiere rol de administrador');
    }
};
//# sourceMappingURL=auth.js.map