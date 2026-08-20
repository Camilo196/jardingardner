import {Curso}  from '../domain/curso';

export interface CursoRepository {
  findAll(): Promise<Curso[]>;
  findById(id: string): Promise<Curso | null>;
  create(curso: Omit<Curso, 'id'>): Promise<Curso>;
  update(id: string, curso: Partial<Curso>): Promise<Curso | null>;
  delete(id: string): Promise<boolean>;
}