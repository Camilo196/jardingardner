"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asistenciaRepository = exports.AsistenciaRepositoryImpl = void 0;
const asistencia_js_1 = require("../../../core/domain/asistencia.js");
const AsistenciaModel_js_1 = require("./models/AsistenciaModel.js");
class AsistenciaRepositoryImpl {
    mapToEntity(doc) {
        return new asistencia_js_1.Asistencia(doc._id.toString(), doc.estudianteId, doc.asignaturaId, doc.fecha, doc.estado, doc.periodo, doc.observaciones, doc.registradoPor);
    }
    async findAll() {
        const docs = await AsistenciaModel_js_1.AsistenciaModel.find().exec();
        return docs.map(d => this.mapToEntity(d));
    }
    async findById(id) {
        const doc = await AsistenciaModel_js_1.AsistenciaModel.findById(id).exec();
        return doc ? this.mapToEntity(doc) : null;
    }
    async findByAsignaturaId(asignaturaId) {
        const docs = await AsistenciaModel_js_1.AsistenciaModel.find({ asignaturaId }).exec();
        return docs.map(d => this.mapToEntity(d));
    }
    async findByEstudianteId(estudianteId) {
        const docs = await AsistenciaModel_js_1.AsistenciaModel.find({ estudianteId }).exec();
        return docs.map(d => this.mapToEntity(d));
    }
    async findByAsignaturaFecha(asignaturaId, fecha) {
        // Buscar registros en el rango del día completo
        const inicio = new Date(fecha);
        inicio.setHours(0, 0, 0, 0);
        const fin = new Date(fecha);
        fin.setHours(23, 59, 59, 999);
        const docs = await AsistenciaModel_js_1.AsistenciaModel.find({
            asignaturaId,
            fecha: { $gte: inicio, $lte: fin }
        }).exec();
        return docs.map(d => this.mapToEntity(d));
    }
    async findByAsignaturaPeriodo(asignaturaId, periodo) {
        const docs = await AsistenciaModel_js_1.AsistenciaModel.find({ asignaturaId, periodo }).exec();
        return docs.map(d => this.mapToEntity(d));
    }
    // Registrar lista completa de un día — usa upsert para no duplicar
    async registrarLista(registros) {
        const resultados = [];
        for (const r of registros) {
            const fecha = new Date(r.fecha);
            const inicio = new Date(fecha);
            inicio.setHours(0, 0, 0, 0);
            const fin = new Date(fecha);
            fin.setHours(23, 59, 59, 999);
            const doc = await AsistenciaModel_js_1.AsistenciaModel.findOneAndUpdate({ estudianteId: r.estudianteId, asignaturaId: r.asignaturaId, fecha: { $gte: inicio, $lte: fin } }, {
                estudianteId: r.estudianteId,
                asignaturaId: r.asignaturaId,
                fecha: fecha,
                estado: r.estado,
                periodo: r.periodo,
                observaciones: r.observaciones,
                registradoPor: r.registradoPor,
            }, { upsert: true, new: true }).exec();
            if (doc)
                resultados.push(this.mapToEntity(doc));
        }
        return resultados;
    }
    async create(data) {
        const doc = new AsistenciaModel_js_1.AsistenciaModel({
            estudianteId: data.estudianteId,
            asignaturaId: data.asignaturaId,
            fecha: new Date(data.fecha),
            estado: data.estado,
            periodo: data.periodo,
            observaciones: data.observaciones,
            registradoPor: data.registradoPor,
        });
        const saved = await doc.save();
        return this.mapToEntity(saved);
    }
    async update(id, data) {
        const updated = await AsistenciaModel_js_1.AsistenciaModel.findByIdAndUpdate(id, data, { new: true }).exec();
        return updated ? this.mapToEntity(updated) : null;
    }
    async delete(id) {
        const result = await AsistenciaModel_js_1.AsistenciaModel.findByIdAndDelete(id).exec();
        return !!result;
    }
}
exports.AsistenciaRepositoryImpl = AsistenciaRepositoryImpl;
exports.asistenciaRepository = new AsistenciaRepositoryImpl();
//# sourceMappingURL=asistenciaRepositoryImpl.js.map