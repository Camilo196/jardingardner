import mongoose from 'mongoose';
export declare const EmpleadoModel: mongoose.Model<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    _id: any;
    email: string;
    cedula: string;
    nombre: string;
    primerApellido: string;
    tipo: "profesor" | "administrativo" | "otro";
    segundoApellido?: string | null | undefined;
    telefono?: string | null | undefined;
    direccion?: string | null | undefined;
}, {}, {}, {}, mongoose.Document<unknown, {}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    _id: any;
    email: string;
    cedula: string;
    nombre: string;
    primerApellido: string;
    tipo: "profesor" | "administrativo" | "otro";
    segundoApellido?: string | null | undefined;
    telefono?: string | null | undefined;
    direccion?: string | null | undefined;
}> & {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    _id: any;
    email: string;
    cedula: string;
    nombre: string;
    primerApellido: string;
    tipo: "profesor" | "administrativo" | "otro";
    segundoApellido?: string | null | undefined;
    telefono?: string | null | undefined;
    direccion?: string | null | undefined;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
    _id: false;
}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    _id: any;
    email: string;
    cedula: string;
    nombre: string;
    primerApellido: string;
    tipo: "profesor" | "administrativo" | "otro";
    segundoApellido?: string | null | undefined;
    telefono?: string | null | undefined;
    direccion?: string | null | undefined;
}, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    _id: any;
    email: string;
    cedula: string;
    nombre: string;
    primerApellido: string;
    tipo: "profesor" | "administrativo" | "otro";
    segundoApellido?: string | null | undefined;
    telefono?: string | null | undefined;
    direccion?: string | null | undefined;
}>> & mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    _id: any;
    email: string;
    cedula: string;
    nombre: string;
    primerApellido: string;
    tipo: "profesor" | "administrativo" | "otro";
    segundoApellido?: string | null | undefined;
    telefono?: string | null | undefined;
    direccion?: string | null | undefined;
}> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>>;
