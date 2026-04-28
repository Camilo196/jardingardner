import mongoose, { Document } from 'mongoose';
export interface PeriodoConfigDocument extends Document {
    anio: number;
    numeroPeriodo: number;
    numCortes: number;
    abierto: boolean;
    fechaApertura?: Date;
    fechaCierre?: Date;
}
export declare const PeriodoConfigModel: mongoose.Model<PeriodoConfigDocument, {}, {}, {}, mongoose.Document<unknown, {}, PeriodoConfigDocument> & PeriodoConfigDocument & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
