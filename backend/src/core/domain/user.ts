export class User {
  static findById(id: any) {
      throw new Error('Method not implemented.');
  }
  constructor(
    public id: string,
    public username: string,
    public password: string,
    public role: string,
    public email?: string,
    public readonly isFirstLogin: boolean = true, // Por defecto será true para usuarios nuevos
  ) {}
  }