import { Empleado } from '../../../core/domain/empleado';
export declare class EmpleadoRepositoryImpl {
    create(empleadoData: Omit<Empleado, 'id'>): Promise<Empleado>;
    findAll(): Promise<Empleado[]>;
    findById(id: string): Promise<Empleado | null>;
    update(id: string, empleadoData: Partial<Empleado>): Promise<Empleado | null>;
    delete(id: string): Promise<boolean>;
    private mapToEntity;
}
