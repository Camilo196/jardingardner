"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TipoActividad = exports.Calificacion = void 0;
class Calificacion {
    constructor(id, estudianteId, // ID del estudiante (ObjectId)
    asignaturaId, // ID de la asignatura (ObjectId)
    nota, periodo, observaciones, fecha = new Date(), boletinId, // Opcional, puede ser null
    tipoActividad, // TRABAJO, EXAMEN, QUIZ, etc.
    nombreActividad, // Ej: "Trabajo 1 - Fracciones"
    corte) {
        this.id = id;
        this.estudianteId = estudianteId;
        this.asignaturaId = asignaturaId;
        this.nota = nota;
        this.periodo = periodo;
        this.observaciones = observaciones;
        this.fecha = fecha;
        this.boletinId = boletinId;
        this.tipoActividad = tipoActividad;
        this.nombreActividad = nombreActividad;
        this.corte = corte;
    }
}
exports.Calificacion = Calificacion;
var TipoActividad;
(function (TipoActividad) {
    TipoActividad["TRABAJO"] = "TRABAJO";
    TipoActividad["EXAMEN"] = "EXAMEN";
    TipoActividad["QUIZ"] = "QUIZ";
    TipoActividad["PARTICIPACION"] = "PARTICIPACION";
    TipoActividad["TALLER"] = "TALLER";
})(TipoActividad || (exports.TipoActividad = TipoActividad = {}));
//# sourceMappingURL=calificacion.js.map