export interface CalificacionBoletinData {
    asignaturaId: string;
    asignaturaNombre: string;
    docenteNombre: string;
    valoracion: string;
    nota: number;
    resumenNotas?: string;
    faltas: number;
    faltasJustificadas?: number;
    observacion?: string;
    indicadores?: {
        saber: string[];
        hacer: string[];
        ser: string[];
    };
    comportamiento?: {
        nota?: number;
        nivel: string;
        descripcion?: string;
    };
}
export interface BoletinData {
    estudiante: {
        nombre: string;
        primerApellido: string;
        segundoApellido?: string;
        cedula: string;
    };
    curso: {
        nombre: string;
    };
    director: string;
    periodo: string;
    anio: string;
    calificaciones: CalificacionBoletinData[];
    observacionGeneral?: string;
    faltasJustificadas?: number;
    faltasInjustificadas?: number;
    puestoCurso?: number | null;
}
export declare class PDFService {
    private readonly bannerPath;
    private crearBuffer;
    private dibujarBanner;
    private dibujarPie;
    private dibujarTablaEstudiante;
    private dibujarFirmas;
    private renderCartaPreescolar;
    private renderInformeEvaluativo;
    generateBoletinGardner(data: BoletinData): Promise<Buffer>;
    generateBoletinPDF(boletin: any, estudiante: any, curso: any, calificaciones: any[]): Promise<Buffer>;
}
export declare const pdfService: PDFService;
