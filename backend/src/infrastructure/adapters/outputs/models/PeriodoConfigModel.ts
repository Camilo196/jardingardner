import mongoose, { Schema, Document } from 'mongoose';

export interface PeriodoConfigDocument extends Document {
  anio: number;
  numeroPeriodo: number;
  numCortes: number;
  abierto: boolean;
  fechaApertura?: Date;
  fechaCierre?: Date;
}

const PeriodoConfigSchema: Schema = new Schema(
  {
    anio:          { type: Number, required: true },
    numeroPeriodo: { type: Number, required: true },
    numCortes:     { type: Number, required: true, default: 3 },
    abierto:       { type: Boolean, default: true },
    fechaApertura: { type: Date },
    fechaCierre:   { type: Date },
  },
  { timestamps: true }
);

PeriodoConfigSchema.index({ anio: 1, numeroPeriodo: 1 }, { unique: true });

export const PeriodoConfigModel = mongoose.model<PeriodoConfigDocument>(
  'PeriodoConfig',
  PeriodoConfigSchema
);