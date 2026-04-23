import { Matricula } from '../domain/matricula';
export interface MatriculaRepository {
    findAll(): Promise<Matricula[]>;
    findById(id: string): Promise<Matricula | null>;
    findByEstudianteId(estudianteId: string): Promise<Matricula[]>;
    create(matricula: Partial<Matricula>): Promise<Matricula>;
    update(id: string, matricula: Partial<Matricula>): Promise<Matricula>;
    updateEstado(id: string, estado: string): Promise<Matricula>;
    delete(id: string): Promise<boolean>;
}
