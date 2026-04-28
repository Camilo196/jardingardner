export declare function verificarConexionEmail(): Promise<void>;
export declare function enviarCredenciales(params: {
    email: string;
    nombre: string;
    apellido: string;
    cedula: string;
    password: string;
    rol: string;
}): Promise<boolean>;
export declare function enviarPasswordRecuperacion(params: {
    email: string;
    nombre: string;
    cedula: string;
    passwordTemporal: string;
}): Promise<boolean>;
export declare function notificarNuevaCalificacion(params: {
    email: string;
    nombre: string;
    apellido: string;
    asignaturaNombre: string;
    cursoNombre: string;
    tipoActividad: string;
    nombreActividad: string;
    nota: number;
    periodo: string;
    corte: number;
    observaciones?: string;
}): Promise<boolean>;
export declare function enviarConfirmacionMatricula(params: {
    email: string;
    nombre: string;
    apellido: string;
    curso: string;
    asignaturas: string[];
}): Promise<boolean>;
