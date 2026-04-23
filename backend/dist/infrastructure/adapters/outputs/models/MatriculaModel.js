import mongoose, { Schema } from 'mongoose';
// Define el esquema de Mongoose para Matricula
const matriculaSchema = new Schema({
    estudianteId: { type: String, required: true },
    cursoId: { type: String, required: true },
    asignaturas: [{ type: String }], // IDs de las asignaturas
    estado: { type: String, enum: ['ACTIVA', 'CANCELADA', 'FINALIZADA'], required: true },
    periodo: { type: String, required: true },
    fechaMatricula: { type: Date, default: Date.now },
});
// Crea el modelo de Mongoose a partir del esquema
const MatriculaModel = mongoose.model('Matricula', matriculaSchema);
export { MatriculaModel };
//# sourceMappingURL=MatriculaModel.js.map