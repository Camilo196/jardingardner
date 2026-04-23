export declare class AuthService {
    private readonly JWT_SECRET;
    register(email: string, password: string, role: string): Promise<{
        user: {
            email: string;
            password: string;
            role: "admin" | "teacher" | "student";
        } & {
            _id: import("mongoose").Types.ObjectId;
        } & {
            __v: number;
        };
        token: string;
    }>;
    login(email: string, password: string): Promise<{
        user: {
            email: string;
            password: string;
            role: "admin" | "teacher" | "student";
        } & {
            _id: import("mongoose").Types.ObjectId;
        } & {
            __v: number;
        };
        token: string;
    }>;
}
