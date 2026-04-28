import { Profesor } from '../../../core/domain/profesor';
export declare class ProfesorRepositoryImpl {
    create(profesorData: any): Promise<Profesor>;
    findAll(): Promise<Profesor[]>;
    findById(id: string): Promise<Profesor | null>;
    findByCedula(cedula: string): Promise<Profesor | null>;
    findByEmail(email: string): Promise<Profesor | null>;
    update(id: string, profesorData: Partial<Profesor>): Promise<Profesor | null>;
    delete(id: string): Promise<boolean>;
}
