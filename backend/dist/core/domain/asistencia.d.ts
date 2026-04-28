export type EstadoAsistencia = 'PRESENTE' | 'AUSENTE' | 'TARDE' | 'EXCUSA';
export declare class Asistencia {
    id: string;
    estudianteId: string;
    asignaturaId: string;
    fecha: Date;
    estado: EstadoAsistencia;
    periodo: string;
    observaciones?: string | undefined;
    registradoPor?: string | undefined;
    constructor(id: string, estudianteId: string, // cédula del estudiante
    asignaturaId: string, // ObjectId de la asignatura
    fecha: Date, estado: EstadoAsistencia, periodo: string, observaciones?: string | undefined, registradoPor?: string | undefined);
}
export interface CrearAsistenciaInput {
    estudianteId: string;
    asignaturaId: string;
    fecha: string;
    estado: EstadoAsistencia;
    periodo: string;
    observaciones?: string;
    registradoPor?: string;
}
