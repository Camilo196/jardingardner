import mongoose, { Document } from 'mongoose';
export interface IndicadoresDocument extends Document {
    asignaturaId: string;
    periodo: string;
    saber: string[];
    hacer: string[];
    ser: string[];
    porEstudiante?: {
        estudianteId: string;
        saber: string[];
        hacer: string[];
        ser: string[];
    }[];
    creadoPor: string;
    updatedAt: Date;
}
export declare const IndicadoresModel: mongoose.Model<IndicadoresDocument, {}, {}, {}, mongoose.Document<unknown, {}, IndicadoresDocument> & IndicadoresDocument & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
