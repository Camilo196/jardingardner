export declare class Empleado {
    cedula: string;
    nombre: string;
    primerApellido: string;
    segundoApellido: string;
    email: string;
    telefono: string;
    direccion: string;
    tipo: 'estudiante' | 'profesor';
    id: string;
    constructor(cedula: string, nombre: string, primerApellido: string, segundoApellido: string, email: string, telefono: string | undefined, direccion: string | undefined, tipo: 'estudiante' | 'profesor');
    validate(): boolean;
    static fromObject(obj: any): Empleado;
    toObject(): {
        id: string;
        cedula: string;
        nombre: string;
        primerApellido: string;
        segundoApellido: string;
        email: string;
        telefono: string;
        direccion: string;
        tipo: "profesor" | "estudiante";
    };
}
