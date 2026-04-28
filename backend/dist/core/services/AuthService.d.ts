import { UserRepository } from '../ports/UserRepository';
import { User } from '../domain/user';
export declare class AuthService {
    private readonly JWT_SECRET;
    private userRepository;
    constructor(userRepository?: UserRepository);
    generateRandomPassword(length?: number): string;
    /**
     * Registra un nuevo usuario
     */
    register(username: string, password: string, role: string): Promise<{
        user: User;
        token: string;
    }>;
    /**
     * Realiza login de usuario
     */
    login(username: string, password: string): Promise<{
        user: User;
        token: string;
    }>;
    /**
 * Autentica a un usuario por identificador (username o email)
 */
    authenticate(identifier: string, password: string): Promise<{
        user: User;
        token: string;
        isFirstLogin?: boolean;
    }>;
    /**
     * Crea credenciales para un estudiante existente
     */
    createUserCredentials(userId: string, role?: string): Promise<string>;
    /**
     * Genera una contraseña provisional para un usuario existente
     */
    generateProvisionalPassword(username: string): Promise<boolean>;
    /**
     * Verifica un token JWT
     */
    verifyToken(token: string): any;
}
