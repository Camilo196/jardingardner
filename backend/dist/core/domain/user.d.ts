import { Schema } from 'mongoose';
export declare const User: import("mongoose").Model<{
    email: string;
    password: string;
    role: "admin" | "teacher" | "student";
}, {}, {}, {}, import("mongoose").Document<unknown, {}, {
    email: string;
    password: string;
    role: "admin" | "teacher" | "student";
}> & {
    email: string;
    password: string;
    role: "admin" | "teacher" | "student";
} & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, Schema<any, import("mongoose").Model<any, any, any, any, any, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, {
    email: string;
    password: string;
    role: "admin" | "teacher" | "student";
}, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<{
    email: string;
    password: string;
    role: "admin" | "teacher" | "student";
}>> & import("mongoose").FlatRecord<{
    email: string;
    password: string;
    role: "admin" | "teacher" | "student";
}> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>>;
