export declare class User {
    id: string;
    username: string;
    password: string;
    role: string;
    email?: string | undefined;
    readonly isFirstLogin: boolean;
    static findById(id: any): void;
    constructor(id: string, username: string, password: string, role: string, email?: string | undefined, isFirstLogin?: boolean);
}
