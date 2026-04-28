import mongoose from 'mongoose';
export declare const MatriculaModel: mongoose.Model<{
    estudianteId: string;
    cursoId: string;
    asignaturas: mongoose.Types.ObjectId[];
    estado: "ACTIVA" | "CANCELADA" | "FINALIZADA" | "SIN_PAGAR";
    periodo: string;
    fechaMatricula: NativeDate;
}, {}, {}, {}, mongoose.Document<unknown, {}, {
    estudianteId: string;
    cursoId: string;
    asignaturas: mongoose.Types.ObjectId[];
    estado: "ACTIVA" | "CANCELADA" | "FINALIZADA" | "SIN_PAGAR";
    periodo: string;
    fechaMatricula: NativeDate;
}> & {
    estudianteId: string;
    cursoId: string;
    asignaturas: mongoose.Types.ObjectId[];
    estado: "ACTIVA" | "CANCELADA" | "FINALIZADA" | "SIN_PAGAR";
    periodo: string;
    fechaMatricula: NativeDate;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, {
    estudianteId: string;
    cursoId: string;
    asignaturas: mongoose.Types.ObjectId[];
    estado: "ACTIVA" | "CANCELADA" | "FINALIZADA" | "SIN_PAGAR";
    periodo: string;
    fechaMatricula: NativeDate;
}, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    estudianteId: string;
    cursoId: string;
    asignaturas: mongoose.Types.ObjectId[];
    estado: "ACTIVA" | "CANCELADA" | "FINALIZADA" | "SIN_PAGAR";
    periodo: string;
    fechaMatricula: NativeDate;
}>> & mongoose.FlatRecord<{
    estudianteId: string;
    cursoId: string;
    asignaturas: mongoose.Types.ObjectId[];
    estado: "ACTIVA" | "CANCELADA" | "FINALIZADA" | "SIN_PAGAR";
    periodo: string;
    fechaMatricula: NativeDate;
}> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>>;
