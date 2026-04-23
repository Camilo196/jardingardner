import { Profesor } from '../domain/profesor';
export interface ProfesorRepository {
    create(profesor: Omit<Profesor, 'id'>): Promise<Profesor>;
    findAll(): Promise<Profesor[]>;
    findById(id: string): Promise<Profesor | null>;
    update(id: string, profesor: Partial<Profesor>): Promise<Profesor | null>;
    delete(id: string): Promise<boolean>;
}
