import mongoose, { Document } from 'mongoose';
export interface AsignaturaDocument extends Document {
    nombre: string;
    horario: string;
    profesorId: mongoose.Types.ObjectId;
    cursoId: mongoose.Types.ObjectId;
}
export declare const AsignaturaModel: mongoose.Model<AsignaturaDocument, {}, {}, {}, mongoose.Document<unknown, {}, AsignaturaDocument> & AsignaturaDocument & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
