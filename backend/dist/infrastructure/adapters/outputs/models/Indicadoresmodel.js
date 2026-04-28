import mongoose, { Schema } from 'mongoose';
const IndicadoresSchema = new Schema({
    asignaturaId: { type: String, required: true },
    periodo: { type: String, required: true },
    saber: [{ type: String }],
    hacer: [{ type: String }],
    ser: [{ type: String }],
    creadoPor: { type: String },
}, { timestamps: true });
// Índice único: una sola entrada por asignatura+período
IndicadoresSchema.index({ asignaturaId: 1, periodo: 1 }, { unique: true });
export const IndicadoresModel = mongoose.model('Indicadores', IndicadoresSchema);
//# sourceMappingURL=Indicadoresmodel.js.map