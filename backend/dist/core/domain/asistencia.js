"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Asistencia = void 0;
class Asistencia {
    constructor(id, estudianteId, // cédula del estudiante
    asignaturaId, // ObjectId de la asignatura
    fecha, estado, periodo, observaciones, registradoPor // cédula del profesor
    ) {
        this.id = id;
        this.estudianteId = estudianteId;
        this.asignaturaId = asignaturaId;
        this.fecha = fecha;
        this.estado = estado;
        this.periodo = periodo;
        this.observaciones = observaciones;
        this.registradoPor = registradoPor;
    }
}
exports.Asistencia = Asistencia;
//# sourceMappingURL=asistencia.js.map