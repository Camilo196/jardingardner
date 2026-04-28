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
export class ProfesorService {
    repositories;
    constructor(repositories) {
        this.repositories = repositories;
    }
    /**
     * Devuelve todas las asignaturas del profesor junto con
     * el número de estudiantes matriculados en cada una.
     */
    async obtenerAsignaturasConConteo(profesorId, periodo) {
        const asignaturas = await this.repositories.asignaturaRepository.findByProfesorId(profesorId);
        const resultado = await Promise.all(asignaturas.map(async (asig) => {
            const matriculas = await this.repositories.matriculaRepository
                .findByAsignaturaId(asig.id).catch(() => []);
            const activas = matriculas.filter((m) => m.estado === 'ACTIVA' && m.periodo === periodo);
            return {
                asignatura: asig,
                estudiantesActivos: activas.length,
            };
        }));
        return resultado;
    }
}
//# sourceMappingURL=profesorService.js.map