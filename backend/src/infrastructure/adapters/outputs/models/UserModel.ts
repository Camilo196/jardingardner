import mongoose, { Schema, Document } from 'mongoose';

export interface UserDocument extends Document {
  username: string;
  password: string;
  role: string;
  email?: string;
  isFirstLogin: boolean; // Nuevo campo para controlar si es el primer inicio de sesión
}

const UserSchema: Schema = new Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true },
  email: { type: String },
  isFirstLogin: { type: Boolean, default: true } // Por defecto será true para usuarios nuevos
}, {
  timestamps: true
});
UserSchema.index({ username: 1, email: 1 });

export const UserModel = mongoose.model<UserDocument>('User', UserSchema);