import mongoose, { Schema, Document } from 'mongoose';

export interface MallaCurricularDocument extends Document {
  asignaturaId: string;
  profesorId: string;
  nombreArchivo: string;
  mimeType: string;
  contenidoBase64: string;
  creadoPor?: string;
}

const MallaCurricularSchema: Schema = new Schema({
  asignaturaId: { type: String, required: true, unique: true, index: true },
  profesorId: { type: String, required: true, index: true },
  nombreArchivo: { type: String, required: true },
  mimeType: { type: String, required: true, default: 'application/pdf' },
  contenidoBase64: { type: String, required: true },
  creadoPor: { type: String },
}, {
  timestamps: true,
});

export const MallaCurricularModel = mongoose.model<MallaCurricularDocument>(
  'MallaCurricular',
  MallaCurricularSchema,
);
