import mongoose, { Schema, Document } from 'mongoose';

export interface CursoDocument extends Document {
    _id: string;
    nombre: string;
    duracion: string;
    cantidadMax: number;
    profesorId: string | mongoose.Types.ObjectId; // CAMBIO: Aceptar string o ObjectId
}

const cursoSchema: Schema = new Schema(
    {
        _id: {type: String, required: true},
        nombre: { type: String, required: true },
        duracion: { type: String, required: true },
        cantidadMax: { type: Number, required: true, min: 1 },
        profesorId: { 
            type: Schema.Types.Mixed, // CAMBIO: Cambiar a Mixed para aceptar string o ObjectId
            ref: "Profesor",
            required: true
        }
    },
    {
        timestamps: true,
        toJSON: { getters: true },
        toObject: { getters: true }
    }
);

const CursoModel = mongoose.model<CursoDocument>('Curso', cursoSchema);

export { CursoModel };