import { User } from '../domain/user';

export interface UserRepository {
  findByUsername(username: string): Promise<User | null>;
  create(userData: { username: string, password: string, role: string, email?: string, isFirstLogin?: boolean }): Promise<User>;
  resetPassword(identifier: string, newPassword: string): Promise<boolean>;
  updatePassword(username: string, hashedPassword: string): Promise<boolean>;
  updateFirstLogin(username: string, isFirstLogin: boolean): Promise<boolean>;
  findAll(): Promise<User[]>;
  delete(id: string): Promise<boolean>;
}