import { Empleado } from './empleado';
export class Profesor {
    public empleado?: Empleado;

    constructor(
        public cedula: string,
        public nombre: string,
        public primerApellido: string,
        public segundoApellido: string,
        public email: string,
        public telefono: string = '',
        public direccion: string = '',
    ) {}

    get id(): string {
        return this.cedula;
    }
}