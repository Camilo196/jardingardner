import { UserRepository } from '../../../core/ports/UserRepository';
import { User } from '../../../core/domain/user';
export declare class UserRepositoryImpl implements UserRepository {
    userModel: any;
    constructor();
    findByUsername(username: string): Promise<User | null>;
    updatePassword(username: string, hashedPassword: string): Promise<boolean>;
    updateFirstLogin(username: string, isFirstLogin: boolean): Promise<boolean>;
    create(userData: {
        username: string;
        password: string;
        role: string;
        email?: string;
        isFirstLogin?: boolean;
    }): Promise<User>;
    resetPassword(identifier: string, newPassword: string): Promise<boolean>;
    findAll(): Promise<User[]>;
    delete(id: string): Promise<boolean>;
    private mapToEntity;
}
