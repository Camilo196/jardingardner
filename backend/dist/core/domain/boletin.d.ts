import { Calificacion } from "./calificacion";
export declare class Boletin {
    id: string;
    estudianteId: string;
    cursoId: string;
    calificaciones: Calificacion[];
    promedio: number;
    periodo: string;
    fecha: string;
    observaciones?: string | undefined;
    constructor(id: string, estudianteId: string, cursoId: string, calificaciones: Calificacion[], promedio: number, periodo: string, fecha: string, observaciones?: string | undefined);
}
