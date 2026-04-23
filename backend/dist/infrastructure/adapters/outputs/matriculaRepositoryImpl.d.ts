import { MatriculaRepository } from './../../../core/ports/MatriculaRepository';
import { Matricula, CrearMatriculaInput, ActualizarMatriculaInput } from '../../../core/domain/matricula';
export declare class MatriculaRepositoryImpl implements MatriculaRepository {
    findAll(): Promise<Matricula[]>;
    findById(id: string): Promise<Matricula | null>;
    findByEstudianteId(estudianteId: string): Promise<Matricula[]>;
    create(matricula: CrearMatriculaInput): Promise<Matricula>;
    update(id: string, matricula: ActualizarMatriculaInput): Promise<Matricula>;
    updateEstado(id: string, estado: 'ACTIVA' | 'CANCELADA' | 'FINALIZADA'): Promise<Matricula>;
    delete(id: string): Promise<boolean>;
    private mapToEntity;
}
