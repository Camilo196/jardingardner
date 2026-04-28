import { Estudiante } from '../domain/estudiante';
export interface EstudianteRepository {
    create(estudiante: Omit<Estudiante, 'id'>): Promise<Estudiante>;
    findAll(): Promise<Estudiante[]>;
    findById(id: string): Promise<Estudiante | null>;
    findByIds(ids: string[]): Promise<Estudiante[]>;
    findByCedula(cedula: string): Promise<Estudiante | null>;
    update(id: string, estudiante: Partial<Estudiante>): Promise<Estudiante | null>;
    delete(id: string): Promise<boolean>;
}
