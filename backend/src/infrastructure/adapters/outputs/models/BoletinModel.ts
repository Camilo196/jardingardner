// src/infrastructure/adapters/outputs/models/BoletinModel.ts

import mongoose, { Schema, Document } from 'mongoose';

export interface BoletinDocument extends Document {
  estudianteId: string;
  cursoId: string;
  calificaciones: {
    id: string;
    estudianteId: string;
    asignaturaId: string;
    nota: number;
    periodo: string;
    fecha: string;
    observaciones?: string;
  }[];
  promedio: number;
  periodo: string;
  fecha: string;
  observaciones?: string;
}

const BoletinSchema: Schema = new Schema({
  estudianteId: { type: String, required: true },
  cursoId: { type: String, required: true },
  calificaciones: [
    {
      id: { type: String },
      estudianteId: { type: String, required: true }, // Agregar este campo
      asignaturaId: { type: String, required: true }, // Agregar este campo
      nota: { type: Number },
      periodo: { type: String },
      fecha: { type: String },
      observaciones: { type: String }, // Agregar campo para observaciones
    },
  ],
  promedio: { type: Number },
  periodo: { type: String, required: true },
  fecha: { type: String, required: true },
  observaciones: { type: String },
});

export const BoletinModel = mongoose.model<BoletinDocument>('Boletin', BoletinSchema);