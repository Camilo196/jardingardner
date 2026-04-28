// src/infrastructure/adapters/outputs/models/BoletinModel.ts
import mongoose, { Schema } from 'mongoose';
const BoletinSchema = new Schema({
    estudianteId: { type: String, required: true },
    cursoId: { type: String, required: true },
    calificaciones: [
        {
            id: { type: String },
            estudianteId: { type: String, required: true }, // Agregar este campo
            asignaturaId: { type: String, required: true }, // Agregar este campo
            nota: { type: Number },
            periodo: { type: String },
            fecha: { type: String },
            observaciones: { type: String }, // Agregar campo para observaciones
        },
    ],
    promedio: { type: Number },
    periodo: { type: String, required: true },
    fecha: { type: String, required: true },
    observaciones: { type: String },
});
export const BoletinModel = mongoose.model('Boletin', BoletinSchema);
//# sourceMappingURL=BoletinModel.js.map