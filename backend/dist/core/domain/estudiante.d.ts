export declare class Estudiante {
    cedula: string;
    nombre: string;
    primerApellido: string;
    segundoApellido: string;
    email: string;
    telefono: string;
    direccion: string;
    acudiente: string;
    empleado?: any;
    constructor(cedula: string, nombre: string, primerApellido: string, segundoApellido: string, email: string, telefono?: string, direccion?: string, acudiente?: string);
    get id(): string;
    toEstudianteData(): {
        cedula: string;
        acudiente: string;
    };
    toEmpleadoData(): {
        cedula: string;
        nombre: string;
        primerApellido: string;
        segundoApellido: string;
        email: string;
        telefono: string;
        direccion: string;
        tipo: string;
    };
}
