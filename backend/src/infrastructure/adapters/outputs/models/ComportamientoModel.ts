import mongoose, { Schema, Document } from 'mongoose';

export interface ComportamientoDocument extends Document {
  estudianteId: string;
  asignaturaId: string;
  profesorId: string;
  periodo: string;
  anio: number;
  nota?: number;
  nivel: 'Superior' | 'Alto' | 'Basico' | 'Bajo';
  descripcion?: string;
}

const ComportamientoSchema: Schema = new Schema(
  {
    estudianteId: { type: String, required: true },
    asignaturaId: { type: String, required: true },
    profesorId:   { type: String, required: true },
    periodo:      { type: String, required: true },
    anio:         { type: Number, required: true },
    nota:         { type: Number, min: 0, max: 5 },
    nivel: {
      type: String,
      enum: ['Superior', 'Alto', 'Basico', 'Bajo'],
      required: true,
    },
    descripcion: { type: String },
  },
  { timestamps: true }
);

// Un registro único por estudiante/asignatura/periodo/año
ComportamientoSchema.index(
  { estudianteId: 1, asignaturaId: 1, periodo: 1, anio: 1 },
  { unique: true }
);

export const ComportamientoModel = mongoose.model<ComportamientoDocument>(
  'Comportamiento',
  ComportamientoSchema
);