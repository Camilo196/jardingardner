import mongoose, { Document } from 'mongoose';
export interface ComportamientoDocument extends Document {
    estudianteId: string;
    asignaturaId: string;
    profesorId: string;
    periodo: string;
    anio: number;
    nota?: number;
    nivel: 'Superior' | 'Alto' | 'Basico' | 'Bajo';
    descripcion?: string;
}
export declare const ComportamientoModel: mongoose.Model<ComportamientoDocument, {}, {}, {}, mongoose.Document<unknown, {}, ComportamientoDocument> & ComportamientoDocument & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
