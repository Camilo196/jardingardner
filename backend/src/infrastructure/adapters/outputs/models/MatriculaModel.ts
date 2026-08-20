import mongoose from 'mongoose';

const matriculaSchema = new mongoose.Schema({
    estudianteId: {
        type: String, // Usar String en lugar de ObjectId para la cédula
        ref: 'Estudiante',
        required: true
    },
    cursoId: {
        type: String, // Usar String en lugar de ObjectId para el ID del curso
        ref: 'Curso',
        required: true
    },
    asignaturas: [{
        type: mongoose.Schema.Types.ObjectId, // Mantener como ObjectId para asignaturas
        ref: 'Asignatura'
    }],
    estado: {
        type: String,
        enum: ['ACTIVA', 'CANCELADA', 'FINALIZADA', 'SIN_PAGAR'],
        default: 'ACTIVA'
    },
    periodo: {
        type: String,
        required: true
    },
    fechaMatricula: {
        type: Date,
        default: Date.now
    }
});

export const MatriculaModel = mongoose.model('Matricula', matriculaSchema);
