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
        type: String, // Ya es String, correcto
        required: true
    },
    cursoId: {
        type: String, // Ya es String, correcto
        required: true
    }
}, {
    timestamps: true
});
export const AsignaturaModel = mongoose.model('Asignatura', AsignaturaSchema);
//# sourceMappingURL=AsignaturaModel.js.map