import mongoose, { Schema, Document } from 'mongoose';

export interface IndicadoresDocument extends Document {
  asignaturaId: string;
  periodo: string;
  saber: string[];
  hacer: string[];
  ser: string[];
  porEstudiante?: {
    estudianteId: string;
    saber: string[];
    hacer: string[];
    ser: string[];
  }[];
  creadoPor: string;   // profesorId
  updatedAt: Date;
}

const IndicadoresSchema: Schema = new Schema(
  {
    asignaturaId: { type: String, required: true },
    periodo:      { type: String, required: true },
    saber:        [{ type: String }],
    hacer:        [{ type: String }],
    ser:          [{ type: String }],
    porEstudiante: [{
      estudianteId: { type: String, required: true },
      saber:        [{ type: String }],
      hacer:        [{ type: String }],
      ser:          [{ type: String }],
    }],
    creadoPor:    { type: String },
  },
  { timestamps: true }
);

// Índice único: una sola entrada por asignatura+período
IndicadoresSchema.index({ asignaturaId: 1, periodo: 1 }, { unique: true });

export const IndicadoresModel = mongoose.model<IndicadoresDocument>(
  'Indicadores',
  IndicadoresSchema
);
