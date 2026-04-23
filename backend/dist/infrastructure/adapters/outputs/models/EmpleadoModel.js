import mongoose, { Schema } from 'mongoose';
const empleadoSchema = new Schema({
    _id: {
        type: Schema.Types.Mixed, // Esto permite usar tanto ObjectId como String
        required: true
    },
    cedula: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    nombre: {
        type: String,
        required: true,
        trim: true
    },
    primerApellido: {
        type: String,
        required: true,
        trim: true
    },
    segundoApellido: {
        type: String,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    telefono: {
        type: String,
        trim: true
    },
    direccion: {
        type: String,
        trim: true
    },
    tipo: {
        type: String,
        enum: ['profesor', 'administrativo', 'otro'],
        default: 'otro'
    }
}, {
    timestamps: true,
    // Esto es crucial para permitir IDs personalizados que no sean ObjectId
    _id: false
});
// Este middleware hace que la cédula se use como _id para profesores
empleadoSchema.pre('save', function (next) {
    if (this.isNew && this.tipo === 'profesor' && this.cedula) {
        this._id = this.cedula;
    }
    next();
});
export const EmpleadoModel = mongoose.model('Empleado', empleadoSchema);
//# sourceMappingURL=EmpleadoModel.js.map