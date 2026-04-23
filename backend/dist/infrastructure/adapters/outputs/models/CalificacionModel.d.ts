import mongoose, { Document } from 'mongoose';
export interface CalificacionDocument extends Document {
    estudianteId: string;
    asignaturaId: string;
    boletinId: string;
    nota: number;
    periodo: string;
    observaciones: string;
}
declare const CalificacionModel: mongoose.Model<CalificacionDocument, {}, {}, {}, mongoose.Document<unknown, {}, CalificacionDocument> & CalificacionDocument & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export { CalificacionModel };
