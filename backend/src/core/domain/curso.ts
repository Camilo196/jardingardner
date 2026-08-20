import { Profesor } from "./profesor";

export class Curso {
    constructor(
        public id: string,
        public nombre: string,
        public duracion: string,
        public cantidadMax: number,
        public profesorId: string,
        public profesor: Profesor | null,
    ) {}
}