"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MatriculaModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const matriculaSchema = new mongoose_1.default.Schema({
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
            type: mongoose_1.default.Schema.Types.ObjectId, // Mantener como ObjectId para asignaturas
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
exports.MatriculaModel = mongoose_1.default.model('Matricula', matriculaSchema);
//# sourceMappingURL=MatriculaModel.js.map