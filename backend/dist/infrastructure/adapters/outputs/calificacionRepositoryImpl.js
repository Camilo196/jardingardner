import { Calificacion } from '../../../core/domain/calificacion.js'; // Asegúrate de importar la clase Calificacion correctamente
import { CalificacionModel } from '../outputs/models/CalificacionModel.js';
// Implementación de la clase CalificacionRepository
export class CalificacionRepositoryImpl {
    async findAll() {
        const calificacionesDoc = await CalificacionModel.find().exec();
        return calificacionesDoc.map(this.mapToEntity);
    }
    async findById(id) {
        const calificacionDoc = await CalificacionModel.findById(id).exec();
        return calificacionDoc ? this.mapToEntity(calificacionDoc) : null;
    }
    async findByEstudianteId(estudianteId) {
        const calificacionesDoc = await CalificacionModel.find({ estudianteId }).exec();
        return calificacionesDoc.map(this.mapToEntity);
    }
    async findByCursoId(cursoId) {
        const calificacionesDoc = await CalificacionModel.find({ cursoId }).exec();
        return calificacionesDoc.map(this.mapToEntity);
    }
    async findByBoletinId(boletinId) {
        const calificacionesDoc = await CalificacionModel.find({ boletinId }).exec();
        return calificacionesDoc.map(this.mapToEntity);
    }
    async findByEstudianteIdAndPeriodo(estudianteId, periodo) {
        const calificacionesDoc = await CalificacionModel.find({ estudianteId, periodo }).exec();
        return calificacionesDoc.map(this.mapToEntity);
    }
    async create(calificacion) {
        const nuevaCalificacion = new CalificacionModel(calificacion);
        const savedCalificacion = await nuevaCalificacion.save();
        return this.mapToEntity(savedCalificacion);
    }
    async update(id, calificacion) {
        const updatedCalificacion = await CalificacionModel.findByIdAndUpdate(id, calificacion, { new: true }).exec();
        return updatedCalificacion ? this.mapToEntity(updatedCalificacion) : null;
    }
    async delete(id) {
        const result = await CalificacionModel.findByIdAndDelete(id).exec();
        return !!result;
    }
    mapToEntity(doc) {
        return new Calificacion(doc._id.toString(), doc.estudianteId, doc.cursoId, doc.boletinId, doc.nota, doc.periodo, doc.observaciones);
    }
}
export const calificacionRepository = new CalificacionRepositoryImpl();
//# sourceMappingURL=calificacionRepositoryImpl.js.map