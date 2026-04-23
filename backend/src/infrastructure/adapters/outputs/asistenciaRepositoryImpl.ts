import { Asistencia, CrearAsistenciaInput } from '../../../core/domain/asistencia.js';
import { AsistenciaRepository } from '../../../core/ports/AsistenciaRepository.js';
import { AsistenciaModel } from './models/AsistenciaModel.js';

export class AsistenciaRepositoryImpl implements AsistenciaRepository {

  private mapToEntity(doc: any): Asistencia {
    return new Asistencia(
      doc._id.toString(),
      doc.estudianteId,
      doc.asignaturaId,
      doc.fecha,
      doc.estado,
      doc.periodo,
      doc.observaciones,
      doc.registradoPor
    );
  }

  async findAll(): Promise<Asistencia[]> {
    const docs = await AsistenciaModel.find().exec();
    return docs.map(d => this.mapToEntity(d));
  }

  async findById(id: string): Promise<Asistencia | null> {
    const doc = await AsistenciaModel.findById(id).exec();
    return doc ? this.mapToEntity(doc) : null;
  }

  async findByAsignaturaId(asignaturaId: string): Promise<Asistencia[]> {
    const docs = await AsistenciaModel.find({ asignaturaId }).exec();
    return docs.map(d => this.mapToEntity(d));
  }

  async findByEstudianteId(estudianteId: string): Promise<Asistencia[]> {
    const docs = await AsistenciaModel.find({ estudianteId }).exec();
    return docs.map(d => this.mapToEntity(d));
  }

  async findByAsignaturaFecha(asignaturaId: string, fecha: string): Promise<Asistencia[]> {
    // Buscar registros en el rango del día completo
    const inicio = new Date(fecha);
    inicio.setHours(0, 0, 0, 0);
    const fin = new Date(fecha);
    fin.setHours(23, 59, 59, 999);

    const docs = await AsistenciaModel.find({
      asignaturaId,
      fecha: { $gte: inicio, $lte: fin }
    }).exec();
    return docs.map(d => this.mapToEntity(d));
  }

  async findByAsignaturaPeriodo(asignaturaId: string, periodo: string): Promise<Asistencia[]> {
    const docs = await AsistenciaModel.find({ asignaturaId, periodo }).exec();
    return docs.map(d => this.mapToEntity(d));
  }

  // Registrar lista completa de un día — usa upsert para no duplicar
  async registrarLista(registros: CrearAsistenciaInput[]): Promise<Asistencia[]> {
    const resultados: Asistencia[] = [];

    for (const r of registros) {
      const fecha = new Date(r.fecha);
      const inicio = new Date(fecha); inicio.setHours(0, 0, 0, 0);
      const fin    = new Date(fecha); fin.setHours(23, 59, 59, 999);

      const doc = await AsistenciaModel.findOneAndUpdate(
        { estudianteId: r.estudianteId, asignaturaId: r.asignaturaId, fecha: { $gte: inicio, $lte: fin } },
        {
          estudianteId:  r.estudianteId,
          asignaturaId:  r.asignaturaId,
          fecha:         fecha,
          estado:        r.estado,
          periodo:       r.periodo,
          observaciones: r.observaciones,
          registradoPor: r.registradoPor,
        },
        { upsert: true, new: true }
      ).exec();

      if (doc) resultados.push(this.mapToEntity(doc));
    }

    return resultados;
  }

  async create(data: CrearAsistenciaInput): Promise<Asistencia> {
    const doc = new AsistenciaModel({
      estudianteId:  data.estudianteId,
      asignaturaId:  data.asignaturaId,
      fecha:         new Date(data.fecha),
      estado:        data.estado,
      periodo:       data.periodo,
      observaciones: data.observaciones,
      registradoPor: data.registradoPor,
    });
    const saved = await doc.save();
    return this.mapToEntity(saved);
  }

  async update(id: string, data: Partial<Asistencia>): Promise<Asistencia | null> {
    const updated = await AsistenciaModel.findByIdAndUpdate(id, data, { new: true }).exec();
    return updated ? this.mapToEntity(updated) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await AsistenciaModel.findByIdAndDelete(id).exec();
    return !!result;
  }
}

export const asistenciaRepository = new AsistenciaRepositoryImpl();