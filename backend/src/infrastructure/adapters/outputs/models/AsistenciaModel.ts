import mongoose, { Schema, Document } from 'mongoose';

export interface AsistenciaDocument extends Document {
  estudianteId: string;
  asignaturaId: string;
  fecha: Date;
  estado: 'PRESENTE' | 'AUSENTE' | 'TARDE' | 'EXCUSA';
  periodo: string;
  observaciones?: string;
  registradoPor?: string;
}

const AsistenciaSchema: Schema = new Schema(
  {
    estudianteId:   { type: String, required: true },
    asignaturaId:   { type: String, required: true },
    fecha:          { type: Date, required: true },
    estado:         { type: String, enum: ['PRESENTE', 'AUSENTE', 'TARDE', 'EXCUSA'], required: true },
    periodo:        { type: String, required: true },
    observaciones:  { type: String },
    registradoPor:  { type: String },
  },
  { timestamps: true }
);

// Índice para evitar duplicados del mismo estudiante en la misma asignatura y fecha
AsistenciaSchema.index({ estudianteId: 1, asignaturaId: 1, fecha: 1 }, { unique: true });

export const AsistenciaModel = mongoose.model<AsistenciaDocument>('Asistencia', AsistenciaSchema);