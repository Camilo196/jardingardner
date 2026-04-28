import mongoose, { Document } from 'mongoose';
export interface AsignaturaDocument extends Document {
    nombre: string;
    horario: string;
    profesorId: string;
    cursoId: string;
}
export declare const AsignaturaModel: mongoose.Model<AsignaturaDocument, {}, {}, {}, mongoose.Document<unknown, {}, AsignaturaDocument> & AsignaturaDocument & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
