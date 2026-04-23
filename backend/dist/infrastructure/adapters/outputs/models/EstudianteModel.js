import mongoose, { Schema } from 'mongoose';
const EstudianteSchema = new Schema({
    cedula: {
        type: String,
        required: true,
        unique: true
    },
    empleadoId: {
        type: Schema.Types.ObjectId,
        ref: 'Empleado',
        required: true
    },
    acudiente: {
        type: String,
        required: false
    }
}, {
    timestamps: true
});
export const EstudianteModel = mongoose.model('Estudiante', EstudianteSchema);
//# sourceMappingURL=EstudianteModel.js.map