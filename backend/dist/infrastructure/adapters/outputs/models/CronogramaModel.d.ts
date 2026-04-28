import mongoose, { Document } from 'mongoose';
export interface EventoCronogramaDocument extends Document {
    titulo: string;
    descripcion?: string;
    fechaInicio: Date;
    fechaFin?: Date;
    tipo: 'EXAMEN' | 'REUNION' | 'FESTIVO' | 'CULTURAL' | 'OTRO';
    cursoId?: string;
    creadoPor: string;
    color: string;
}
export declare const CronogramaModel: mongoose.Model<EventoCronogramaDocument, {}, {}, {}, mongoose.Document<unknown, {}, EventoCronogramaDocument> & EventoCronogramaDocument & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
