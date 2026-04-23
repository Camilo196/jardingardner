export class Boletin {
    id;
    estudianteId;
    cursoId;
    calificaciones;
    promedio;
    periodo;
    fecha;
    observaciones;
    constructor(id, estudianteId, cursoId, calificaciones, promedio, periodo, fecha, observaciones) {
        this.id = id;
        this.estudianteId = estudianteId;
        this.cursoId = cursoId;
        this.calificaciones = calificaciones;
        this.promedio = promedio;
        this.periodo = periodo;
        this.fecha = fecha;
        this.observaciones = observaciones;
    }
}
//# sourceMappingURL=boletin.js.map