import { Calificacion } from '../domain/calificacion';
export interface CalificacionRepository {
    findAll(): Promise<Calificacion[]>;
    findById(id: string): Promise<Calificacion | null>;
    findByEstudianteId(estudianteId: string): Promise<Calificacion[]>;
    findByCursoId(cursoId: string): Promise<Calificacion[]>;
    findByBoletinId(boletinId: string): Promise<Calificacion[]>;
    findByEstudianteIdAndPeriodo(estudianteId: string, periodo: string): Promise<Calificacion[]>;
    findByAsignaturaYPeriodo(asignaturaId: string, periodo: string): Promise<Calificacion[]>;
    create(calificacion: Omit<Calificacion, 'id'>): Promise<Calificacion>;
    update(id: string, calificacion: Partial<Calificacion>): Promise<Calificacion | null>;
    delete(id: string): Promise<boolean>;
}
