import mongoose, { Document } from 'mongoose';
export interface BoletinDocument extends Document {
    estudianteId: string;
    cursoId: string;
    calificaciones: {
        id: string;
        estudianteId: string;
        asignaturaId: string;
        nota: number;
        periodo: string;
        fecha: string;
        observaciones?: string;
    }[];
    promedio: number;
    periodo: string;
    fecha: string;
    observaciones?: string;
}
export declare const BoletinModel: mongoose.Model<BoletinDocument, {}, {}, {}, mongoose.Document<unknown, {}, BoletinDocument> & BoletinDocument & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
