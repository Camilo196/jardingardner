import mongoose, { Schema } from 'mongoose';
const PeriodoConfigSchema = new Schema({
    anio: { type: Number, required: true },
    numeroPeriodo: { type: Number, required: true },
    numCortes: { type: Number, required: true, default: 3 },
    abierto: { type: Boolean, default: true },
    fechaApertura: { type: Date },
    fechaCierre: { type: Date },
}, { timestamps: true });
PeriodoConfigSchema.index({ anio: 1, numeroPeriodo: 1 }, { unique: true });
export const PeriodoConfigModel = mongoose.model('PeriodoConfig', PeriodoConfigSchema);
//# sourceMappingURL=PeriodoConfigModel.js.map