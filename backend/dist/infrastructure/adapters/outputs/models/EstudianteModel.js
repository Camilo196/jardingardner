import mongoose, { Schema } from 'mongoose';
const EstudianteSchema = new Schema({
    _id: {
        type: String,
        required: true
    },
    cedula: {
        type: String,
        required: true,
        unique: true
    },
    empleadoId: {
        type: String,
        ref: 'Empleado',
        required: true
    },
    acudiente: {
        type: String,
        required: false
    }
}, {
    timestamps: true,
    _id: false
});
export const EstudianteModel = mongoose.model('Estudiante', EstudianteSchema);
//# sourceMappingURL=EstudianteModel.js.map