import mongoose, { Schema } from 'mongoose';

// Define el esquema de Mongoose para Calificacion
const calificacionSchema = new Schema({
    estudianteId: { type: Schema.Types.ObjectId, ref: 'Estudiante', required: true },
    asignaturaId: { type: Schema.Types.ObjectId, ref: 'Asignatura', required: true }, // Cambiado de cursoId a asignaturaId
    boletinId: { type: Schema.Types.ObjectId, ref: 'Boletin' },
    nota: { type: Number, required: true },
    periodo: { type: String, required: true },
    observaciones: { type: String, required: false },
}, {
    timestamps: true, // Esto agrega automáticamente los campos `createdAt` y `updatedAt`
});

// Crea el modelo de Mongoose a partir del esquema
const CalificacionModel = mongoose.model('Calificacion', calificacionSchema);
export { CalificacionModel };