import mongoose, { Document } from 'mongoose';
export interface EstudianteDocument extends Document {
    _id: string;
    cedula: string;
    empleadoId: string;
    acudiente?: string;
}
export declare const EstudianteModel: mongoose.Model<EstudianteDocument, {}, {}, {}, mongoose.Document<unknown, {}, EstudianteDocument> & EstudianteDocument & Required<{
    _id: string;
}> & {
    __v: number;
}, any>;
