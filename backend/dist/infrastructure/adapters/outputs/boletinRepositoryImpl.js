// src/infrastructure/adapters/outputs/boletinRepositoryImpl.ts
import { Boletin } from '../../../core/domain/boletin.js';
import { BoletinModel } from '../outputs/models/BoletinModel.js';
import { Calificacion } from '../../../core/domain/calificacion.js'; // Asegúrate de importar la clase Calificacion
export class BoletinRepositoryImpl {
    async findAll() {
        const boletinesDoc = await BoletinModel.find().exec();
        return boletinesDoc.map(this.mapToEntity);
    }
    async findByCursoYPeriodo(cursoId, periodo) {
        const docs = await BoletinModel.find({ cursoId, periodo }).lean().exec();
        return docs.map(this.mapToEntity);
    }
    async findByEstudianteId(estudianteId) {
        try {
            const boletines = await BoletinModel.find({ estudianteId })
                .populate('curso')
                .sort({ periodo: -1 })
                .exec();
            return boletines.map(boletinDoc => this.mapToEntity(boletinDoc));
        }
        catch (error) {
            console.error('Error al buscar boletines por estudianteId:', error);
            return [];
        }
    }
    // Obtener boletín por ID
    async findById(id) {
        const boletinDoc = await BoletinModel.findById(id).exec();
        return boletinDoc ? this.mapToEntity(boletinDoc) : null;
    }
    // Crear un nuevo boletín
    async create(input) {
        const nuevoBoletin = new BoletinModel(input);
        const savedBoletin = await nuevoBoletin.save();
        return this.mapToEntity(savedBoletin);
    }
    // Actualizar boletín existente
    async update(id, input) {
        const updatedBoletin = await BoletinModel.findByIdAndUpdate(id, input, { new: true }).exec();
        return updatedBoletin ? this.mapToEntity(updatedBoletin) : null;
    }
    // Eliminar boletín por ID
    async delete(id) {
        const result = await BoletinModel.findByIdAndDelete(id).exec();
        return !!result;
    }
    // Obtener boletines por ID de asignatura
    async findByAsignaturaId(asignaturaId) {
        // Aquí estamos consultando la base de datos por asignaturaId
        const boletinesDoc = await BoletinModel.find({ asignaturaId }).exec();
        return boletinesDoc.map(this.mapToEntity);
    }
    // Función de mapeo de documento MongoDB a entidad de dominio
    mapToEntity(doc) {
        // Asegúrate de que calificaciones tiene los datos correctos en el documento de MongoDB
        const calificaciones = doc.calificaciones.map((calificacion) => {
            return new Calificacion(calificacion.id, doc.estudianteId, doc.cursoId, calificacion.nota, calificacion.periodo, // 👈 Si es `undefined`, usa la fecha actual
            calificacion.observaciones || '');
        });
        return new Boletin(doc._id.toString(), // El id del boletín
        doc.estudianteId, // Estudiante asociado
        doc.cursoId, // Curso asociado
        calificaciones, // Calificaciones asociadas
        doc.promedio, // Promedio calculado
        doc.periodo, // Periodo (nuevo campo)
        doc.fecha, // Fecha de generación (nuevo campo)
        doc.observaciones // Observaciones (opcional)
        );
    }
}
//# sourceMappingURL=boletinRepositoryImpl.js.map