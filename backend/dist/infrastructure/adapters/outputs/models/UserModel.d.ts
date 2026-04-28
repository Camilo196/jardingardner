import mongoose, { Document } from 'mongoose';
export interface UserDocument extends Document {
    username: string;
    password: string;
    role: string;
    email?: string;
    isFirstLogin: boolean;
}
export declare const UserModel: mongoose.Model<UserDocument, {}, {}, {}, mongoose.Document<unknown, {}, UserDocument> & UserDocument & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
