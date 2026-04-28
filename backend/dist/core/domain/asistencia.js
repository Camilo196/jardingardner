export class Asistencia {
    id;
    estudianteId;
    asignaturaId;
    fecha;
    estado;
    periodo;
    observaciones;
    registradoPor;
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
//# sourceMappingURL=asistencia.js.map