import { Empleado } from './empleado';
export declare class Profesor {
    cedula: string;
    nombre: string;
    primerApellido: string;
    segundoApellido: string;
    email: string;
    telefono: string;
    direccion: string;
    empleado?: Empleado;
    constructor(cedula: string, nombre: string, primerApellido: string, segundoApellido: string, email: string, telefono?: string, direccion?: string);
    get id(): string;
}
