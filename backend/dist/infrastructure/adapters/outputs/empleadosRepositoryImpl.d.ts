export declare class EmpleadoRepositoryImpl {
    findByCedula(cedula: string): Promise<any>;
    findByEmail(email: string): Promise<any>;
    create(empleado: any): Promise<any>;
    update(id: string, empleadoData: any): Promise<any>;
    delete(id: string): Promise<boolean>;
    findAll(): Promise<any[]>;
}
