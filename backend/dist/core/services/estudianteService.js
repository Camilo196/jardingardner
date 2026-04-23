export class EstudianteService {
    estudianteRepository;
    constructor(estudianteRepository) {
        this.estudianteRepository = estudianteRepository;
    }
    async getEstudiantes() {
        return this.estudianteRepository.findAll();
    }
    async getEstudianteById(id) {
        return this.estudianteRepository.findById(id);
    }
}
//# sourceMappingURL=estudianteService.js.map