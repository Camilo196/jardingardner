import { Boletin } from '../../../core/domain/boletin.js';
export declare class BoletinRepositoryImpl {
    findAll(): Promise<Boletin[]>;
    findById(id: string): Promise<Boletin | null>;
    create(input: Omit<Boletin, 'id'>): Promise<Boletin>;
    update(id: string, input: Partial<Omit<Boletin, 'id'>>): Promise<Boletin | null>;
    delete(id: string): Promise<boolean>;
    findByAsignaturaId(asignaturaId: string): Promise<Boletin[]>;
    private mapToEntity;
}
