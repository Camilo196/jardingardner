import { Asistencia, CrearAsistenciaInput } from '../../../core/domain/asistencia.js';
import { AsistenciaRepository } from '../../../core/ports/AsistenciaRepository.js';
import { AsistenciaModel } from './models/AsistenciaModel.js';

function fechaAsistenciaSinDesfase(fecha: any): Date {
  if (typeof fecha === 'string') {
    const match = fecha.trim().match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      const [, year, month, day] = match;
      return new Date(Date.UTC(Number(year), Number(month) - 1, Number(day), 12, 0, 0));
    }
  }
  const parsed = fecha instanceof Date ? fecha : new Date(fecha);
  if (!Number.isNaN(parsed.getTime())) {
    return new Date(Date.UTC(parsed.getUTCFullYear(), parsed.getUTCMonth(), parsed.getUTCDate(), 12, 0, 0));
  }
  const hoy = new Date();
  return new Date(Date.UTC(hoy.getUTCFullYear(), hoy.getUTCMonth(), hoy.getUTCDate(), 12, 0, 0));
}

function rangoDiaUtc(fecha: string): { inicio: Date; fin: Date } {
  const base = fechaAsistenciaSinDesfase(fecha);
  return {
    inicio: new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth(), base.getUTCDate(), 0, 0, 0, 0)),
    fin: new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth(), base.getUTCDate(), 23, 59, 59, 999)),
  };
}

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
    const { inicio, fin } = rangoDiaUtc(fecha);

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
      const fecha = fechaAsistenciaSinDesfase(r.fecha);
      const { inicio, fin } = rangoDiaUtc(r.fecha);

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
      fecha:         fechaAsistenciaSinDesfase(data.fecha),
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
