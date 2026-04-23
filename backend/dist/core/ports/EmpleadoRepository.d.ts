import { Empleado } from '../domain/empleado';
export interface EmpleadoRepository {
    create(empleado: Omit<Empleado, 'id'>): Promise<Empleado>;
    findById(id: string): Promise<Empleado | null>;
    findByCedula(cedula: string): Promise<Empleado | null>;
    update(id: string, empleado: Partial<Empleado>): Promise<Empleado | null>;
    delete(id: string): Promise<boolean>;
}
