import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserModel } from '../infrastructure/adapters/outputs/models/UserModel.js';

interface AuthRequest extends Request {
    user?: any;
}

const ROLE_MAP: Record<string, string> = {
    admin: 'ADMIN', administrator: 'ADMIN', ADMIN: 'ADMIN', ADMINISTRATOR: 'ADMIN',
    teacher: 'PROFESOR', profesor: 'PROFESOR', TEACHER: 'PROFESOR', PROFESOR: 'PROFESOR',
    student: 'ESTUDIANTE', estudiante: 'ESTUDIANTE', STUDENT: 'ESTUDIANTE', ESTUDIANTE: 'ESTUDIANTE',
};

export const verifyToken = async (req: AuthRequest, _: Response, next: NextFunction) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return next();
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
        const user = await UserModel.findById(decoded.id);

        if (user) {
            req.user = {
                id: user._id,
                username: user.username,
                email: user.email,
                role: ROLE_MAP[user.role] ?? user.role.toUpperCase(),
            };
        }
        next();
    } catch (error) {
        console.error('Error en autenticación:', error);
        next();
    }
};

export const checkAdmin = (user: any) => {
    if (!user || user.role !== 'ADMIN') {
        throw new Error('No autorizado - Se requiere rol de administrador');
    }
};