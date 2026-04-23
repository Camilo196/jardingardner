import { Asignatura } from '../../../core/domain/asignatura';
import { AsignaturaModel } from '../outputs/models/AsignaturaModel';
import mongoose from 'mongoose';
export class AsignaturaRepositoryImpl {
    async findAll() {
        try {
            const asignaturas = await AsignaturaModel.find().exec();
            return asignaturas.map(this.mapToEntity);
        }
        catch (error) {
            console.error('Error al obtener todos los asignaturas:', error);
            throw new Error('Error al obtener todos los asignaturas');
        }
    }
    async findById(id) {
        try {
            const asignatura = await AsignaturaModel.findById(id).exec();
            return asignatura ? this.mapToEntity(asignatura) : null;
        }
        catch (error) {
            console.error(`Error al obtener la asignatura con ID ${id}:`, error);
            throw new Error(`Error al obtener la asignatura con ID ${id}`);
        }
    }
    async create(asignaturaData) {
        try {
            console.log('Datos recibidos en create:', asignaturaData);
            // Asegurarse de que estudianteId sea un string (cédula)
            const dataToSave = {
                ...asignaturaData,
                profesorId: new mongoose.Types.ObjectId(asignaturaData.profesorId),
                cursoId: new mongoose.Types.ObjectId(asignaturaData.cursoId),
            };
            console.log('Datos a guardar:', dataToSave);
            const nuevoAsignatura = new AsignaturaModel(dataToSave);
            const savedAsignatura = await nuevoAsignatura.save();
            console.log('Asignatura guardada:', savedAsignatura);
            return this.mapToEntity(savedAsignatura);
        }
        catch (error) {
            console.error('Error detallado al crear la asignatura:', error);
            throw new Error(`Error al crear la asignatura:`);
        }
    }
    async update(id, asignaturaData) {
        try {
            const updatedAsignatura = await AsignaturaModel.findByIdAndUpdate(id, asignaturaData, { new: true }).exec();
            return updatedAsignatura ? this.mapToEntity(updatedAsignatura) : null;
        }
        catch (error) {
            console.error(`Error al actualizar la asignatura con ID ${id}:`, error);
            throw new Error(`Error al actualizar la asignatura con ID ${id}`);
        }
    }
    async delete(id) {
        try {
            const result = await AsignaturaModel.findByIdAndDelete(id).exec();
            return !!result;
        }
        catch (error) {
            console.error(`Error al eliminar la asignatura con ID ${id}:`, error);
            throw new Error(`Error al eliminar la asignatura con ID ${id}`);
        }
    }
    mapToEntity(doc) {
        const profesorId = Array.isArray(doc.profesorId)
            ? (doc.profesorId.length > 0 ? doc.profesorId[0].toString() : null)
            : (doc.profesorId ? doc.profesorId.toString() : null);
        const cursoId = Array.isArray(doc.cursoId)
            ? (doc.cursoId.length > 0 ? doc.cursoId[0].toString() : null)
            : (doc.cursoId ? doc.cursoId.toString() : null);
        return new Asignatura(doc._id.toString(), doc.nombre, doc.horario, doc.profesorId.toString(), null, doc.cursoId.toString(), null);
    }
}
//# sourceMappingURL=asignaturaRepositoryImpl.js.map