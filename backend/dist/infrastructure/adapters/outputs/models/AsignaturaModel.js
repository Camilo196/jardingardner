import mongoose, { Schema } from 'mongoose';
const AsignaturaSchema = new Schema({
    nombre: {
        type: String,
        required: true
    },
    horario: {
        type: String,
        required: true
    },
    profesorId: {
        type: String, // Usa String en vez de ObjectId
        required: true
    },
    cursoId: {
        type: String, // Usa String en vez de ObjectId
        required: true
    }
}, {
    timestamps: true
});
export const AsignaturaModel = mongoose.model('Asignatura', AsignaturaSchema);
//# sourceMappingURL=AsignaturaModel.js.map