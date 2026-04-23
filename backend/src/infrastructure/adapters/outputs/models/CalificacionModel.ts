import mongoose, { Schema, Document } from 'mongoose';

export interface CalificacionDocument extends Document {
  estudianteId: mongoose.Types.ObjectId | string;
  asignaturaId: mongoose.Types.ObjectId | string;
  boletinId?: mongoose.Types.ObjectId | string;
  nota: number;
  periodo: string;
  observaciones: string;
  fecha: Date;
  tipoActividad?: 'TRABAJO' | 'EXAMEN' | 'QUIZ' | 'PARTICIPACION' | 'TALLER';
  nombreActividad?: string;
  corte?: 1 | 2 | 3;
}

const calificacionSchema: Schema = new Schema(
  {
    estudianteId: { 
      type: mongoose.Schema.Types.Mixed,
      ref: 'Estudiante', 
      required: true 
    },
    asignaturaId: { 
      type: mongoose.Schema.Types.Mixed,
      ref: 'Asignatura', 
      required: true 
    },
    boletinId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Boletin' 
    },
    nota: { 
      type: Number, 
      required: true 
    },
    periodo: { 
      type: String, 
      required: true 
    },
    observaciones: { 
      type: String, 
      required: false 
    },
    fecha: { 
      type: Date, 
      default: Date.now 
    },
    // ── Nuevos campos para actividades/trabajos ──
    tipoActividad: {
      type: String,
      enum: ['TRABAJO', 'EXAMEN', 'QUIZ', 'PARTICIPACION', 'TALLER'],
      default: 'EXAMEN'
    },
    nombreActividad: {
      type: String,
      required: false
    },
    corte: {
      type: Number,
      enum: [1, 2, 3],
      required: false
    }
  },
  {
    timestamps: true
  }
);

// Índices para acelerar búsquedas de boletines y calificaciones por estudiante/asignatura
calificacionSchema.index({ estudianteId: 1, periodo: 1 });
calificacionSchema.index({ asignaturaId: 1, periodo: 1 });

export const CalificacionModel = mongoose.model<CalificacionDocument>('Calificacion', calificacionSchema);