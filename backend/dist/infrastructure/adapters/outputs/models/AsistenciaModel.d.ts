import mongoose, { Document } from 'mongoose';
export interface AsistenciaDocument extends Document {
    estudianteId: string;
    asignaturaId: string;
    fecha: Date;
    estado: 'PRESENTE' | 'AUSENTE' | 'TARDE' | 'EXCUSA';
    periodo: string;
    observaciones?: string;
    registradoPor?: string;
}
export declare const AsistenciaModel: mongoose.Model<AsistenciaDocument, {}, {}, {}, mongoose.Document<unknown, {}, AsistenciaDocument> & AsistenciaDocument & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
