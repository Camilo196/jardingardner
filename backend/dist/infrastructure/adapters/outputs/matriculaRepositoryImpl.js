import { MatriculaModel } from './models/MatriculaModel';
import { Matricula } from '../../../core/domain/matricula';
export class MatriculaRepositoryImpl {
    async findAll() {
        try {
            const matriculas = await MatriculaModel.find()
                .populate('estudianteId')
                .populate('cursoId')
                .populate('asignaturas');
            return matriculas.map(this.mapToEntity); // Mapear documentos a entidades
        }
        catch (error) {
            console.error('Error al obtener todas las matrículas:', error);
            throw new Error('Error al obtener todas las matrículas');
        }
    }
    async findById(id) {
        try {
            const matricula = await MatriculaModel.findById(id)
                .populate('estudianteId')
                .populate('cursoId')
                .populate('asignaturas');
            return matricula ? this.mapToEntity(matricula) : null; // Mapear documento a entidad
        }
        catch (error) {
            console.error(`Error al obtener la matrícula con ID ${id}:`, error);
            throw new Error(`Error al obtener la matrícula con ID ${id}`);
        }
    }
    async findByEstudianteId(estudianteId) {
        try {
            const matriculas = await MatriculaModel.find({ estudianteId })
                .populate('estudianteId')
                .populate('cursoId')
                .populate('asignaturas');
            return matriculas.map(this.mapToEntity); // Mapear documentos a entidades
        }
        catch (error) {
            console.error(`Error al obtener las matrículas del estudiante con ID ${estudianteId}:`, error);
            throw new Error(`Error al obtener las matrículas del estudiante con ID ${estudianteId}`);
        }
    }
    async create(matricula) {
        try {
            const nuevaMatricula = await MatriculaModel.create(matricula);
            return this.mapToEntity(nuevaMatricula); // Mapear documento a entidad
        }
        catch (error) {
            console.error('Error al crear la matrícula:', error);
            throw new Error('Error al crear la matrícula');
        }
    }
    async update(id, matricula) {
        try {
            const matriculaActualizada = await MatriculaModel.findByIdAndUpdate(id, matricula, { new: true })
                .populate('estudianteId')
                .populate('cursoId')
                .populate('asignaturas');
            if (!matriculaActualizada) {
                throw new Error(`Matrícula con ID ${id} no encontrada`);
            }
            return this.mapToEntity(matriculaActualizada); // Mapear documento a entidad
        }
        catch (error) {
            console.error(`Error al actualizar la matrícula con ID ${id}:`, error);
            throw new Error(`Error al actualizar la matrícula con ID ${id}`);
        }
    }
    async updateEstado(id, estado) {
        try {
            const matriculaActualizada = await MatriculaModel.findByIdAndUpdate(id, { estado }, { new: true })
                .populate('estudianteId')
                .populate('cursoId')
                .populate('asignaturas');
            if (!matriculaActualizada) {
                throw new Error(`Matrícula con ID ${id} no encontrada`);
            }
            return this.mapToEntity(matriculaActualizada); // Mapear documento a entidad
        }
        catch (error) {
            console.error(`Error al actualizar el estado de la matrícula con ID ${id}:`, error);
            throw new Error(`Error al actualizar el estado de la matrícula con ID ${id}`);
        }
    }
    async delete(id) {
        try {
            const result = await MatriculaModel.findByIdAndDelete(id);
            return !!result;
        }
        catch (error) {
            console.error(`Error al eliminar la matrícula con ID ${id}:`, error);
            throw new Error(`Error al eliminar la matrícula con ID ${id}`);
        }
    }
    // Método para mapear un documento de Mongoose a una entidad Matricula
    mapToEntity(doc) {
        return new Matricula(doc._id.toString(), // Convertir ObjectId a string
        doc.estudianteId, doc.cursoId, doc.asignaturas, doc.estado, doc.periodo, doc.fechaMatricula);
    }
}
//# sourceMappingURL=matriculaRepositoryImpl.js.map