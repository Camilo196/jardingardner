import { Curso } from '../../../core/domain/curso';
import { CursoRepository } from '../../../core/ports/CursoRepository';
export declare class CursoRepositoryImpl implements CursoRepository {
    findAll(): Promise<Curso[]>;
    findById(id: string): Promise<Curso | null>;
    create(cursoData: any): Promise<Curso>;
    update(id: string, cursoData: Partial<Curso>): Promise<Curso | null>;
    delete(id: string): Promise<boolean>;
    private mapToEntity;
}
