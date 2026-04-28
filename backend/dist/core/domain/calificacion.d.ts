export declare class Calificacion {
    id: string;
    estudianteId: string;
    asignaturaId: string;
    nota: number;
    periodo: string;
    observaciones: string;
    fecha: Date;
    boletinId?: string | undefined;
    tipoActividad?: TipoActividad | undefined;
    nombreActividad?: string | undefined;
    corte?: number | undefined;
    constructor(id: string, estudianteId: string, // ID del estudiante (ObjectId)
    asignaturaId: string, // ID de la asignatura (ObjectId)
    nota: number, periodo: string, observaciones: string, fecha?: Date, boletinId?: string | undefined, // Opcional, puede ser null
    tipoActividad?: TipoActividad | undefined, // TRABAJO, EXAMEN, QUIZ, etc.
    nombreActividad?: string | undefined, // Ej: "Trabajo 1 - Fracciones"
    corte?: number | undefined);
}
export declare enum TipoActividad {
    TRABAJO = "TRABAJO",
    EXAMEN = "EXAMEN",
    QUIZ = "QUIZ",
    PARTICIPACION = "PARTICIPACION",
    TALLER = "TALLER"
}
