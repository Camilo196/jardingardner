import { UserRepository } from '../../../core/ports/UserRepository';
import { User } from '../../../core/domain/user';
import { UserModel } from './models/UserModel';
import { Document } from 'mongoose';
import bcrypt from 'bcrypt';

// Normalizar roles a mayúsculas para consistencia en la DB
const ROLE_ALIASES: Record<string, string> = {
  admin: 'ADMIN', administrator: 'ADMIN', ADMINISTRATOR: 'ADMIN',
  teacher: 'PROFESOR', profesor: 'PROFESOR', TEACHER: 'PROFESOR',
  student: 'ESTUDIANTE', estudiante: 'ESTUDIANTE', STUDENT: 'ESTUDIANTE',
};

function normalizarRol(rol: string): string {
  return ROLE_ALIASES[rol] ?? rol.toUpperCase();
}

export class UserRepositoryImpl implements UserRepository {
  userModel: any;
  
  constructor() {
    this.userModel = UserModel;
  }
  
  async findByUsername(username: string): Promise<User | null> {
    console.log(`Buscando usuario con username: ${username}`);
    try {
      // Busca por username O por email
      const user = await this.userModel.findOne({ 
        $or: [
          { username: username },
          { email: username }
        ]
      });
      
      console.log(`Usuario encontrado: ${user ? 'Sí' : 'No'}`);
      
      if (!user) return null;
      return new User(
        (user as Document).id,
        user.username,
        user.password,
        user.role,
        user.email,
        user.isFirstLogin
      );
    } catch (error) {
      console.error('Error al buscar usuario por username:', error);
      throw error;
    }
  }

  async updatePassword(username: string, hashedPassword: string): Promise<boolean> {
    try {
      console.log(`Actualizando contraseña para usuario ${username}`);
      
      const result = await this.userModel.updateOne(
        { username },
        { 
          $set: { 
            password: hashedPassword,
            isFirstLogin: false // Al cambiar contraseña, ya no es primer inicio
          } 
        }
      );
      
      console.log(`Resultado de actualización de contraseña: ${result.modifiedCount > 0 ? 'Exitoso' : 'No encontrado'}`);
      return result.modifiedCount > 0;
    } catch (error) {
      console.error("Error al actualizar contraseña:", error);
      throw error;
    }
  }

  async updateFirstLogin(username: string, isFirstLogin: boolean): Promise<boolean> {
    try {
      console.log(`Actualizando estado de primer inicio para usuario ${username}: ${isFirstLogin}`);
      
      const result = await this.userModel.updateOne(
        { username },
        { $set: { isFirstLogin } }
      );
      
      console.log(`Resultado de actualización de estado de primer inicio: ${result.modifiedCount > 0 ? 'Exitoso' : 'No encontrado'}`);
      return result.modifiedCount > 0;
    } catch (error) {
      console.error("Error al actualizar estado de primer inicio:", error);
      throw error;
    }
  }

  async create(userData: { username: string, password: string, role: string, email?: string, isFirstLogin?: boolean }): Promise<User> {
    try {
      console.log(`Creando usuario con username: ${userData.username}, role: ${userData.role}, email: ${userData.email || 'no proporcionado'}`);
      
      // Verificar si ya existe un usuario con ese username o email
      const existingUser = await this.userModel.findOne({ 
        $or: [
          { username: userData.username },
          ...(userData.email ? [{ email: userData.email }] : [])
        ]
      }).exec();
      
      if (existingUser) {
        console.log(`El usuario ${userData.username} ya existe, actualizando contraseña`);
        // Si existe, actualizar la contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(userData.password, salt);
        
        existingUser.password = hashedPassword;
        // Actualizar email si se proporciona y no existe
        if (userData.email && !existingUser.email) {
          existingUser.email = userData.email;
        }
        
        // Actualizar el estado de primer inicio de sesión si se proporciona
        if (userData.isFirstLogin !== undefined) {
          existingUser.isFirstLogin = userData.isFirstLogin;
        }
        
        const updatedUser = await existingUser.save();
        return this.mapToEntity(updatedUser);
      }
      
      // Si no existe, crear nuevo usuario
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);
      
      const newUser = new this.userModel({
        username: userData.username,
        password: hashedPassword,
        role: normalizarRol(userData.role), // Normalizar a ADMIN / PROFESOR / ESTUDIANTE
        email: userData.email,  // Incluir email si está presente
        isFirstLogin: userData.isFirstLogin !== undefined ? userData.isFirstLogin : true // Por defecto, es primer inicio
      });
      
      const savedUser = await newUser.save();
      console.log(`Usuario creado exitosamente: ${savedUser.username} con email: ${savedUser.email || 'ninguno'}`);
      return this.mapToEntity(savedUser);
    } catch (error) {
      console.error('Error al crear usuario:', error);
      throw new Error(`Error al crear usuario: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async resetPassword(identifier: string, newPassword: string): Promise<boolean> {
    try {
      console.log(`Intentando restablecer contraseña para identificador ${identifier}`);
      
      // Buscar por username o email
      const user = await this.userModel.findOne({ 
        $or: [
          { username: identifier },
          { email: identifier }
        ]
      }).exec();
      
      if (!user) {
        console.error(`Usuario con identificador ${identifier} no encontrado para reset de contraseña`);
        return false;
      }
      
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      
      user.password = hashedPassword;
      user.isFirstLogin = true; // Marcar como primer inicio cuando se restablece la contraseña
      await user.save();
      
      console.log(`Contraseña restablecida para usuario ${user.username} (${user.email || 'sin email'})`);
      return true;
    } catch (error) {
      console.error(`Error al restablecer contraseña para ${identifier}:`, error);
      throw new Error(`Error al restablecer contraseña: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  async findAll(): Promise<User[]> {
    try {
      const users = await this.userModel.find().exec();
      return users.map((user: any) => this.mapToEntity(user));
    } catch (error) {
      console.error('Error al obtener todos los usuarios:', error);
      throw error;
    }
  }
  
  async delete(id: string): Promise<boolean> {
    try {
      const result = await this.userModel.deleteOne({ _id: id }).exec();
      return result.deletedCount > 0;
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      throw error;
    }
  }
  
  private mapToEntity(doc: any): User {
    return new User(
      doc._id.toString(),
      doc.username,
      doc.password,
      doc.role,
      doc.email,
      doc.isFirstLogin
    );
  }
}