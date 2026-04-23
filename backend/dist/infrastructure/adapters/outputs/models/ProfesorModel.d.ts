import mongoose from 'mongoose';
export declare const ProfesorModel: mongoose.Model<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    _id: string;
    cedula: string;
    empleadoId: mongoose.Types.ObjectId;
}, {}, {}, {}, mongoose.Document<unknown, {}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    _id: string;
    cedula: string;
    empleadoId: mongoose.Types.ObjectId;
}> & {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    _id: string;
    cedula: string;
    empleadoId: mongoose.Types.ObjectId;
} & Required<{
    _id: string;
}> & {
    __v: number;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    _id: string;
    cedula: string;
    empleadoId: mongoose.Types.ObjectId;
}, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    _id: string;
    cedula: string;
    empleadoId: mongoose.Types.ObjectId;
}>> & mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    _id: string;
    cedula: string;
    empleadoId: mongoose.Types.ObjectId;
}> & Required<{
    _id: string;
}> & {
    __v: number;
}>>;
