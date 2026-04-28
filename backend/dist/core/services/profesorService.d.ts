/**
 * ProfesorService — lógica de negocio específica de profesores.
 *
 * Por ahora la lógica de profesores vive directamente en los resolvers
 * (resolvers.ts). Este servicio puede crecer con operaciones complejas
 * que requieran combinar múltiples repositorios.
 *
 * Ejemplo de uso futuro:
 *   const service = new ProfesorService(repositories);
 *   await service.obtenerResumenDocente(profesorId, periodo);
 */
export declare class ProfesorService {
    private readonly repositories;
    constructor(repositories: any);
    /**
     * Devuelve todas las asignaturas del profesor junto con
     * el número de estudiantes matriculados en cada una.
     */
    obtenerAsignaturasConConteo(profesorId: string, periodo: string): Promise<any[]>;
}
