export declare class Matricula {
    id: string;
    estudianteId: string;
    cursoId: string;
    asignaturas: string[];
    estado: 'ACTIVA' | 'CANCELADA' | 'FINALIZADA';
    periodo: string;
    fechaMatricula: Date;
    constructor(id: string, estudianteId: string, cursoId: string, asignaturas: string[], // IDs de las asignaturas
    estado: 'ACTIVA' | 'CANCELADA' | 'FINALIZADA', periodo: string, fechaMatricula: Date);
}
export interface CrearMatriculaInput {
    estudianteId: string;
    cursoId: string;
    asignaturas: string[];
    estado: 'ACTIVA' | 'CANCELADA' | 'FINALIZADA';
    periodo: string;
}
export interface ActualizarMatriculaInput {
    estudianteId?: string;
    cursoId?: string;
    asignaturas?: string[];
    estado?: 'ACTIVA' | 'CANCELADA' | 'FINALIZADA';
    periodo?: string;
}
