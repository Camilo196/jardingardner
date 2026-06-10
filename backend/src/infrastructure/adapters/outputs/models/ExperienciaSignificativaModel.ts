import mongoose, { Schema, Document } from 'mongoose';

export interface ExperienciaSignificativaDocument extends Document {
  cursoId: string;
  profesorId: string;
  titulo: string;
  descripcion?: string;
  fecha: string;
  nombreArchivo: string;
  mimeType: string;
  contenidoBase64: string;
  creadoPor?: string;
}

const ExperienciaSignificativaSchema: Schema = new Schema({
  cursoId: { type: String, required: true, index: true },
  profesorId: { type: String, required: true, index: true },
  titulo: { type: String, required: true },
  descripcion: { type: String },
  fecha: { type: String, required: true },
  nombreArchivo: { type: String, required: true },
  mimeType: { type: String, required: true },
  contenidoBase64: { type: String, required: true },
  creadoPor: { type: String },
}, {
  timestamps: true,
});

export const ExperienciaSignificativaModel = mongoose.model<ExperienciaSignificativaDocument>(
  'ExperienciaSignificativa',
  ExperienciaSignificativaSchema,
);
