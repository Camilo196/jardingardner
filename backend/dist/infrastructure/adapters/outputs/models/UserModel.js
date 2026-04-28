import mongoose, { Schema } from 'mongoose';
const UserSchema = new Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, required: true },
    email: { type: String },
    isFirstLogin: { type: Boolean, default: true } // Por defecto será true para usuarios nuevos
}, {
    timestamps: true
});
UserSchema.index({ username: 1, email: 1 });
export const UserModel = mongoose.model('User', UserSchema);
//# sourceMappingURL=UserModel.js.map