export class Calificacion {
    id;
    estudianteId;
    cursoId;
    boletinId;
    nota;
    periodo;
    observaciones;
    constructor(id, estudianteId, cursoId, boletinId, nota, periodo, observaciones) {
        this.id = id;
        this.estudianteId = estudianteId;
        this.cursoId = cursoId;
        this.boletinId = boletinId;
        this.nota = nota;
        this.periodo = periodo;
        this.observaciones = observaciones;
    }
}
//# sourceMappingURL=calificacion.js.map