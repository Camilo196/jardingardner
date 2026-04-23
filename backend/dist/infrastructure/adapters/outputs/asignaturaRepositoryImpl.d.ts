import { Asignatura } from '../../../core/domain/asignatura';
import { AsignaturaRepository } from '../../../core/ports/AsignaturaRepository';
export declare class AsignaturaRepositoryImpl implements AsignaturaRepository {
    findAll(): Promise<Asignatura[]>;
    findById(id: string): Promise<Asignatura | null>;
    create(asignaturaData: Omit<Asignatura, 'id'>): Promise<Asignatura>;
    update(id: string, asignaturaData: Partial<Asignatura>): Promise<Asignatura | null>;
    delete(id: string): Promise<boolean>;
    private mapToEntity;
}
