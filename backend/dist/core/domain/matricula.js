export class Matricula {
    id;
    estudianteId;
    cursoId;
    asignaturas;
    estado;
    periodo;
    fechaMatricula;
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
//# sourceMappingURL=matricula.js.map