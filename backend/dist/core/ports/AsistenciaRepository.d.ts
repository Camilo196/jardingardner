import { Asistencia, CrearAsistenciaInput } from '../domain/asistencia.js';
export interface AsistenciaRepository {
    findAll(): Promise<Asistencia[]>;
    findById(id: string): Promise<Asistencia | null>;
    findByAsignaturaId(asignaturaId: string): Promise<Asistencia[]>;
    findByEstudianteId(estudianteId: string): Promise<Asistencia[]>;
    findByAsignaturaFecha(asignaturaId: string, fecha: string): Promise<Asistencia[]>;
    findByAsignaturaPeriodo(asignaturaId: string, periodo: string): Promise<Asistencia[]>;
    registrarLista(registros: CrearAsistenciaInput[]): Promise<Asistencia[]>;
    create(asistencia: CrearAsistenciaInput): Promise<Asistencia>;
    update(id: string, data: Partial<Asistencia>): Promise<Asistencia | null>;
    delete(id: string): Promise<boolean>;
}
