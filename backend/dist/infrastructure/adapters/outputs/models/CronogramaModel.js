import mongoose, { Schema } from 'mongoose';
const CronogramaSchema = new Schema({
    titulo: { type: String, required: true },
    descripcion: { type: String },
    fechaInicio: { type: Date, required: true },
    fechaFin: { type: Date },
    tipo: {
        type: String,
        enum: ['EXAMEN', 'REUNION', 'FESTIVO', 'CULTURAL', 'OTRO'],
        default: 'OTRO',
    },
    cursoId: { type: String },
    creadoPor: { type: String, required: true },
    color: { type: String, default: '#4361ee' },
}, { timestamps: true });
export const CronogramaModel = mongoose.model('Cronograma', CronogramaSchema);
//# sourceMappingURL=CronogramaModel.js.map