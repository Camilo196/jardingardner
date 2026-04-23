import mongoose, { Schema, Document } from 'mongoose';

export interface AsignaturaDocument extends Document {
  nombre: string;
  horario: string;
  profesorId: string; // Cambiar a string para coincidir con el esquema
  cursoId: string;    // Cambiar a string para coincidir con el esquema
}

const AsignaturaSchema: Schema = new Schema({
  nombre: { 
    type: String, 
    required: true 
  },
  horario: {
    type: String,
    required: true
  },
  profesorId: {
    type: String, // Ya es String, correcto
    required: true
  },
  cursoId: {
    type: String, // Ya es String, correcto
    required: true
  }
}, {
  timestamps: true
});

export const AsignaturaModel = mongoose.model<AsignaturaDocument>('Asignatura', AsignaturaSchema);