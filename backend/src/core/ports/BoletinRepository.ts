import { Boletin } from '../domain/boletin';

export interface BoletinRepository {
  findAll(): Promise<Boletin[]>;
  findById(id: string): Promise<Boletin | null>;
  findByEstudianteId(estudianteId: string): Promise<Boletin[]>;
  create(boletin: Omit<Boletin, 'id'>): Promise<Boletin>;
  update(id: string, boletin: Partial<Boletin>): Promise<Boletin | null>;
  delete(id: string): Promise<boolean>;
}