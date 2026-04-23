import { Schema, model } from 'mongoose';
const userSchema = new Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, required: true, enum: ['admin', 'teacher', 'student'] }
});
export const User = model('User', userSchema);
//# sourceMappingURL=user.js.map