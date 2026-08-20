import mongoose, { Schema, Document } from 'mongoose';

export interface EstudianteDocument extends Document {
  _id: string;
  cedula: string;
  empleadoId: string;
  acudiente?: string;
}

const EstudianteSchema: Schema = new Schema({
  _id: {
    type: String,
    required: true
  },
  cedula: {
    type: String,
    required: true,
    unique: true
  },
  empleadoId: {
    type: String,
    ref: 'Empleado',
    required: true
  },
  acudiente: {
    type: String,
    required: false
  }
}, {
  timestamps: true,
  _id: false 
});

export const EstudianteModel = mongoose.model<EstudianteDocument>('Estudiante', EstudianteSchema);