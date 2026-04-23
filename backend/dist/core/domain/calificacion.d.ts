export declare class Calificacion {
    id: string;
    estudianteId: string;
    cursoId: string;
    boletinId: string;
    nota: number;
    periodo: string;
    observaciones?: string | undefined;
    constructor(id: string, estudianteId: string, cursoId: string, boletinId: string, nota: number, periodo: string, observaciones?: string | undefined);
}
