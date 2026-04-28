import mongoose from 'mongoose';
export declare const ProfesorModel: mongoose.Model<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    _id: string;
    cedula: string;
    empleadoId: any;
}, {}, {}, {}, mongoose.Document<unknown, {}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    _id: string;
    cedula: string;
    empleadoId: any;
}> & {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    _id: string;
    cedula: string;
    empleadoId: any;
} & Required<{
    _id: string;
}> & {
    __v: number;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
    _id: false;
}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    _id: string;
    cedula: string;
    empleadoId: any;
}, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    _id: string;
    cedula: string;
    empleadoId: any;
}>> & mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    _id: string;
    cedula: string;
    empleadoId: any;
}> & Required<{
    _id: string;
}> & {
    __v: number;
}>>;
