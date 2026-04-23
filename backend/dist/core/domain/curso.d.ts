import { Profesor } from "./profesor";
export declare class Curso {
    id: string;
    nombre: string;
    duracion: string;
    cantidadMax: number;
    profesorId: string;
    profesor: Profesor | null;
    constructor(id: string, nombre: string, duracion: string, cantidadMax: number, profesorId: string, profesor: Profesor | null);
}
