import mongoose, { Schema } from 'mongoose';
const cursoSchema = new Schema({
    _id: { type: String, required: true },
    nombre: { type: String, required: true },
    duracion: { type: String, required: true },
    cantidadMax: { type: Number, required: true, min: 1 },
    profesorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Profesor",
        required: true
    }
}, {
    timestamps: true,
    toJSON: { getters: true }, // Asegura que los getters se apliquen al convertir a JSON
    toObject: { getters: true } // Asegura que los getters se apliquen al convertir a objeto
});
const CursoModel = mongoose.model('Curso', cursoSchema);
export { CursoModel };
//# sourceMappingURL=CursoModel.js.map