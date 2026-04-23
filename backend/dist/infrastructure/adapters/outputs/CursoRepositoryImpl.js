import { Curso } from '../../../core/domain/curso';
import { CursoModel } from './models/CursoModel';
export class CursoRepositoryImpl {
    async findAll() {
        try {
            const cursos = await CursoModel.find().exec();
            return cursos.map(this.mapToEntity);
        }
        catch (error) {
            console.error('Error al obtener todos los cursos:', error);
            throw new Error('Error al obtener todos los cursos');
        }
    }
    async findById(id) {
        try {
            const curso = await CursoModel.findById(id).exec();
            return curso ? this.mapToEntity(curso) : null;
        }
        catch (error) {
            console.error(`Error al obtener el curso con ID ${id}:`, error);
            throw new Error(`Error al obtener el curso con ID ${id}`);
        }
    }
    async create(cursoData) {
        try {
            // Asegúrate de que el ID esté presente
            if (!cursoData._id) {
                throw new Error('Se requiere un ID para crear un curso');
            }
            const nuevoCurso = new CursoModel({
                _id: cursoData._id,
                nombre: cursoData.nombre,
                duracion: cursoData.duracion,
                cantidadMax: cursoData.cantidadMax,
                profesorId: cursoData.profesorId
            });
            const savedCurso = await nuevoCurso.save();
            return this.mapToEntity(savedCurso);
        }
        catch (error) {
            console.error('Error al crear el curso:', error);
            throw new Error('Error al crear el curso');
        }
    }
    async update(id, cursoData) {
        try {
            const updatedCurso = await CursoModel.findByIdAndUpdate(id, cursoData, { new: true }).exec();
            return updatedCurso ? this.mapToEntity(updatedCurso) : null;
        }
        catch (error) {
            console.error(`Error al actualizar el curso con ID ${id}:`, error);
            throw new Error(`Error al actualizar el curso con ID ${id}`);
        }
    }
    async delete(id) {
        try {
            const result = await CursoModel.findByIdAndDelete(id).exec();
            return !!result;
        }
        catch (error) {
            console.error(`Error al eliminar el curso con ID ${id}:`, error);
            throw new Error(`Error al eliminar el curso con ID ${id}`);
        }
    }
    mapToEntity(doc) {
        const profesorId = Array.isArray(doc.profesorId)
            ? (doc.profesorId.length > 0 ? doc.profesorId[0].toString() : null)
            : (doc.profesorId ? doc.profesorId.toString() : null);
        return new Curso(doc._id.toString(), doc.nombre, doc.duracion, doc.cantidadMax, doc.profesorId ? doc.profesorId.toString() : null, null);
    }
}
//# sourceMappingURL=CursoRepositoryImpl.js.map