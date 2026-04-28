import mongoose, { Schema } from 'mongoose';
const cursoSchema = new Schema({
    _id: { type: String, required: true },
    nombre: { type: String, required: true },
    duracion: { type: String, required: true },
    cantidadMax: { type: Number, required: true, min: 1 },
    profesorId: {
        type: Schema.Types.Mixed, // CAMBIO: Cambiar a Mixed para aceptar string o ObjectId
        ref: "Profesor",
        required: true
    }
}, {
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true }
});
const CursoModel = mongoose.model('Curso', cursoSchema);
export { CursoModel };
//# sourceMappingURL=CursoModel.js.map