import mongoose, { Document } from 'mongoose';
export interface CursoDocument extends Document {
    _id: string;
    nombre: string;
    duracion: string;
    cantidadMax: number;
    profesorId: string | mongoose.Types.ObjectId;
}
declare const CursoModel: mongoose.Model<CursoDocument, {}, {}, {}, mongoose.Document<unknown, {}, CursoDocument> & CursoDocument & Required<{
    _id: string;
}> & {
    __v: number;
}, any>;
export { CursoModel };
