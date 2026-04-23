import { EstudianteRepository } from '../ports/EstudianteRepository';
import { Estudiante } from '../domain/estudiante';
export declare class EstudianteService {
    private estudianteRepository;
    constructor(estudianteRepository: EstudianteRepository);
    getEstudiantes(): Promise<Estudiante[]>;
    getEstudianteById(id: string): Promise<Estudiante | null>;
}
