import mongoose, { Document } from 'mongoose';
export interface EstudianteDocument extends Document {
    cedula: string;
    empleadoId: mongoose.Types.ObjectId;
    acudiente?: string;
}
export declare const EstudianteModel: mongoose.Model<EstudianteDocument, {}, {}, {}, mongoose.Document<unknown, {}, EstudianteDocument> & EstudianteDocument & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
