import mongoose, { Document } from 'mongoose';
export interface CalificacionDocument extends Document {
    estudianteId: mongoose.Types.ObjectId | string;
    asignaturaId: mongoose.Types.ObjectId | string;
    boletinId?: mongoose.Types.ObjectId | string;
    nota: number;
    periodo: string;
    observaciones: string;
    fecha: Date;
    tipoActividad?: 'TRABAJO' | 'EXAMEN' | 'QUIZ' | 'PARTICIPACION' | 'TALLER';
    nombreActividad?: string;
    corte?: 1 | 2 | 3;
}
export declare const CalificacionModel: mongoose.Model<CalificacionDocument, {}, {}, {}, mongoose.Document<unknown, {}, CalificacionDocument> & CalificacionDocument & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
