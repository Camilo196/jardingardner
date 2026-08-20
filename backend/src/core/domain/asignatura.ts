import { Curso } from "./curso";
import { Profesor } from "./profesor";


export class Asignatura {
    constructor(
        public id: string,
        public nombre: string,
        public horario: string,
        public profesorId: string,
        public profesor: Profesor | null,
        public cursoId: string,
        public curso: Curso | null,
    ) {}
}