import { Estudiante } from '../../../core/domain/estudiante';
import mongoose from 'mongoose';
export declare class EstudianteRepositoryImpl {
    create(estudianteData: any): Promise<Estudiante>;
    findAll(): Promise<Estudiante[]>;
    findById(id: string | mongoose.Types.ObjectId): Promise<Estudiante | null>;
    findByCedula(cedula: any): Promise<Estudiante | null>;
    update(id: string, estudianteData: Partial<Estudiante>): Promise<Estudiante | null>;
    delete(id: string): Promise<boolean>;
}
