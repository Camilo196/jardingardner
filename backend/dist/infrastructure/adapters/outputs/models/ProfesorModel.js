import mongoose, { Schema } from 'mongoose';
const profesorSchema = new Schema({
    _id: {
        type: String, // Cambiar de ObjectId a String para usar cédula
        required: true,
        trim: true
    },
    cedula: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    empleadoId: {
        type: Schema.Types.ObjectId,
        ref: 'Empleado',
        required: true
    }
}, { timestamps: true });
// Middleware para asegurar que _id es igual a cedula
profesorSchema.pre('save', function (next) {
    if (this.isNew && this.cedula) {
        this._id = this.cedula;
    }
    next();
});
export const ProfesorModel = mongoose.model('Profesor', profesorSchema);
//# sourceMappingURL=ProfesorModel.js.map