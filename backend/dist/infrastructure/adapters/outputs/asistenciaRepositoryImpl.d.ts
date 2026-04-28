import { Asistencia, CrearAsistenciaInput } from '../../../core/domain/asistencia.js';
import { AsistenciaRepository } from '../../../core/ports/AsistenciaRepository.js';
export declare class AsistenciaRepositoryImpl implements AsistenciaRepository {
    private mapToEntity;
    findAll(): Promise<Asistencia[]>;
    findById(id: string): Promise<Asistencia | null>;
    findByAsignaturaId(asignaturaId: string): Promise<Asistencia[]>;
    findByEstudianteId(estudianteId: string): Promise<Asistencia[]>;
    findByAsignaturaFecha(asignaturaId: string, fecha: string): Promise<Asistencia[]>;
    findByAsignaturaPeriodo(asignaturaId: string, periodo: string): Promise<Asistencia[]>;
    registrarLista(registros: CrearAsistenciaInput[]): Promise<Asistencia[]>;
    create(data: CrearAsistenciaInput): Promise<Asistencia>;
    update(id: string, data: Partial<Asistencia>): Promise<Asistencia | null>;
    delete(id: string): Promise<boolean>;
}
export declare const asistenciaRepository: AsistenciaRepositoryImpl;
