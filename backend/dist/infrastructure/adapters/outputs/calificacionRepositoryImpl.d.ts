import { Calificacion } from '../../../core/domain/calificacion.js';
import { CalificacionRepository } from '../../../core/ports/CalificacionRepository.js';
export declare class CalificacionRepositoryImpl implements CalificacionRepository {
    findAll(): Promise<Calificacion[]>;
    findById(id: string): Promise<Calificacion | null>;
    findByEstudianteId(estudianteId: string): Promise<Calificacion[]>;
    findByCursoId(cursoId: string): Promise<Calificacion[]>;
    findByBoletinId(boletinId: string): Promise<Calificacion[]>;
    findByEstudianteIdAndPeriodo(estudianteId: string, periodo: string): Promise<Calificacion[]>;
    create(calificacion: Omit<Calificacion, 'id'>): Promise<Calificacion>;
    update(id: string, calificacion: Partial<Calificacion>): Promise<Calificacion | null>;
    delete(id: string): Promise<boolean>;
    private mapToEntity;
}
export declare const calificacionRepository: CalificacionRepositoryImpl;
