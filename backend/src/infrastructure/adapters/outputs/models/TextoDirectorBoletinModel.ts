import mongoose, { Document, Schema } from 'mongoose';

export interface TextoDirectorBoletinDocument extends Document {
  cursoId: string;
  estudianteId: string;
  periodo: string;
  profesorId: string;
  introPreescolar?: string;
  objetivoGeneralPrimaria?: string;
}

const TextoDirectorBoletinSchema = new Schema(
  {
    cursoId: { type: String, required: true, index: true },
    estudianteId: { type: String, required: true, index: true },
    periodo: { type: String, required: true, index: true },
    profesorId: { type: String, required: true },
    introPreescolar: { type: String, default: '' },
    objetivoGeneralPrimaria: { type: String, default: '' },
  },
  { timestamps: true },
);

TextoDirectorBoletinSchema.index(
  { cursoId: 1, estudianteId: 1, periodo: 1 },
  { unique: true },
);

export const TextoDirectorBoletinModel = mongoose.model<TextoDirectorBoletinDocument>(
  'TextoDirectorBoletin',
  TextoDirectorBoletinSchema,
);
