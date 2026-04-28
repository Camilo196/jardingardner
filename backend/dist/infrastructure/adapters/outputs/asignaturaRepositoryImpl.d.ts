import { AsignaturaRepository } from '../../../core/ports/AsignaturaRepository';
import { Asignatura } from '../../../core/domain/asignatura';
export declare class AsignaturaRepositoryImpl implements AsignaturaRepository {
    static findAll(): void;
    findByProfesorId(profesorId: string): Promise<Asignatura[]>;
    findByIds(ids: string[]): Promise<Asignatura[]>;
    findAll(): Promise<Asignatura[]>;
    findById(id: string): Promise<Asignatura | null>;
    findByCursoId(cursoId: string): Promise<Asignatura[]>;
    create(input: any): Promise<Asignatura>;
    update(id: string, input: any): Promise<Asignatura>;
    delete(id: string): Promise<boolean>;
    private mapToEntity;
}
