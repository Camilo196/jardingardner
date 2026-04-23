import { Curso } from "./curso";
import { Profesor } from "./profesor";
export declare class Asignatura {
    id: string;
    nombre: string;
    horario: string;
    profesorId: string;
    profesor: Profesor | null;
    cursoId: string;
    curso: Curso | null;
    constructor(id: string, nombre: string, horario: string, profesorId: string, profesor: Profesor | null, cursoId: string, curso: Curso | null);
}
