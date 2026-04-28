"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Matricula = void 0;
class Matricula {
    constructor(id, estudianteId, cursoId, asignaturas, // IDs de las asignaturas
    estado, periodo, fechaMatricula) {
        this.id = id;
        this.estudianteId = estudianteId;
        this.cursoId = cursoId;
        this.asignaturas = asignaturas;
        this.estado = estado;
        this.periodo = periodo;
        this.fechaMatricula = fechaMatricula;
    }
}
exports.Matricula = Matricula;
//# sourceMappingURL=matricula.js.map