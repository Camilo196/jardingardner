import mongoose, { Schema, Document } from 'mongoose';

export interface MallaCurricularDocument extends Document {
  asignaturaId: string;
  profesorId: string;
  tipo?: string;
  cursoId?: string;
  nombreReferencia?: string;
  nombreArchivo: string;
  mimeType: string;
  contenidoBase64: string;
  creadoPor?: string;
}

const MallaCurricularSchema: Schema = new Schema({
  asignaturaId: { type: String, required: true, unique: true, index: true },
  profesorId: { type: String, required: true, index: true },
  tipo: { type: String, default: 'MATERIA', index: true },
  cursoId: { type: String, index: true },
  nombreReferencia: { type: String },
  nombreArchivo: { type: String, required: true },
  mimeType: { type: String, required: true, default: 'application/pdf' },
  contenidoBase64: { type: String, required: true },
  creadoPor: { type: String },
}, {
  timestamps: true,
});

MallaCurricularSchema.index({ updatedAt: -1 });
MallaCurricularSchema.index({ profesorId: 1, updatedAt: -1 });
MallaCurricularSchema.index({ tipo: 1, cursoId: 1, updatedAt: -1 });

export const MallaCurricularModel = mongoose.model<MallaCurricularDocument>(
  'MallaCurricular',
  MallaCurricularSchema,
);
