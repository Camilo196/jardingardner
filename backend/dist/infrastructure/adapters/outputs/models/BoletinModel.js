7; // src/infrastructure/adapters/outputs/models/BoletinModel.ts
import mongoose, { Schema } from 'mongoose';
const BoletinSchema = new Schema({
    estudianteId: { type: String, required: true },
    cursoId: { type: String, required: true },
    calificaciones: [
        {
            id: { type: String },
            nota: { type: Number },
            periodo: { type: String },
            fecha: { type: String },
        },
    ],
    promedio: { type: Number },
    periodo: { type: String, required: true }, // Campo agregado
    fecha: { type: String, required: true }, // Campo agregado
    observaciones: { type: String },
});
export const BoletinModel = mongoose.model('Boletin', BoletinSchema);
//# sourceMappingURL=BoletinModel.js.map