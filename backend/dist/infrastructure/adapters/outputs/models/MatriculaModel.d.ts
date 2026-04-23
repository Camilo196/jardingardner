import mongoose, { Document } from 'mongoose';
export interface MatriculaDocument extends Document {
    estudianteId: string;
    cursoId: string;
    asignaturas: string[];
    estado: 'ACTIVA' | 'CANCELADA' | 'FINALIZADA';
    periodo: string;
    fechaMatricula: Date;
}
declare const MatriculaModel: mongoose.Model<MatriculaDocument, {}, {}, {}, mongoose.Document<unknown, {}, MatriculaDocument> & MatriculaDocument & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export { MatriculaModel };
