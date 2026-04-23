import { Request, Response, NextFunction } from 'express';
interface AuthRequest extends Request {
    user?: any;
}
export declare const verifyToken: (req: AuthRequest, _: Response, next: NextFunction) => Promise<void>;
export declare const checkAdmin: (user: any) => void;
export {};
