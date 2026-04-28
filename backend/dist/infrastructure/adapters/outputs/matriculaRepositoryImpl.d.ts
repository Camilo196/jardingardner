import { MatriculaRepository } from './../../../core/ports/MatriculaRepository';
import { Matricula, CrearMatriculaInput, ActualizarMatriculaInput } from '../../../core/domain/matricula';
export declare class MatriculaRepositoryImpl implements MatriculaRepository {
    findByIds(ids: string[]): Promise<Matricula[]>;
    findAll(): Promise<Matricula[]>;
    findById(id: string): Promise<Matricula | null>;
    findByEstudianteId(estudianteId: string): Promise<Matricula[]>;
    findByAsignaturaId(asignaturaId: string): Promise<Matricula[]>;
    create(input: CrearMatriculaInput): Promise<Matricula>;
    update(id: string, matricula: ActualizarMatriculaInput): Promise<Matricula>;
    updateEstado(id: string, estado: 'ACTIVA' | 'CANCELADA' | 'FINALIZADA' | 'SIN_PAGAR'): Promise<Matricula>;
    delete(id: string): Promise<boolean>;
    private mapToEntity;
}
