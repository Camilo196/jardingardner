import { Asignatura } from '../domain/asignatura';
export interface AsignaturaRepository {
    findAll(): Promise<Asignatura[]>;
    findById(id: string): Promise<Asignatura | null>;
    create(asignatura: Omit<Asignatura, 'id'>): Promise<Asignatura>;
    update(id: string, asignatura: Partial<Asignatura>): Promise<Asignatura | null>;
    delete(id: string): Promise<boolean>;
}
