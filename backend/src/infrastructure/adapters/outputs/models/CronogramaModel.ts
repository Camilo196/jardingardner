import mongoose, { Schema, Document } from 'mongoose';

export interface EventoCronogramaDocument extends Document {
  titulo: string;
  descripcion?: string;
  fechaInicio: Date;
  fechaFin?: Date;
  tipo: 'EXAMEN' | 'REUNION' | 'FESTIVO' | 'CULTURAL' | 'OTRO';
  cursoId?: string;   // null = toda la institución
  creadoPor: string;
  color: string;
}

const CronogramaSchema: Schema = new Schema(
  {
    titulo:      { type: String, required: true },
    descripcion: { type: String },
    fechaInicio: { type: Date, required: true },
    fechaFin:    { type: Date },
    tipo: {
      type: String,
      enum: ['EXAMEN', 'REUNION', 'FESTIVO', 'CULTURAL', 'OTRO'],
      default: 'OTRO',
    },
    cursoId:   { type: String },
    creadoPor: { type: String, required: true },
    color:     { type: String, default: '#4361ee' },
  },
  { timestamps: true }
);

export const CronogramaModel = mongoose.model<EventoCronogramaDocument>(
  'Cronograma',
  CronogramaSchema
);