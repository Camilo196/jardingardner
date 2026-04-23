import { Calificacion } from '../../../core/domain/calificacion.js';
import { CalificacionModel, CalificacionDocument } from '../outputs/models/CalificacionModel.js';
import { CalificacionRepository } from '../../../core/ports/CalificacionRepository.js';
import { AsignaturaModel } from '../outputs/models/AsignaturaModel.js';
import mongoose from 'mongoose';

export class CalificacionRepositoryImpl implements CalificacionRepository {
  async findByCursoId(cursoId: string): Promise<Calificacion[]> {
    try {
      const asignaturas = await AsignaturaModel.find({ cursoId }).exec();
      if (!asignaturas || asignaturas.length === 0) return [];
      const asignaturaIds = asignaturas.map(a => a._id);
      const calificacionesDoc = await CalificacionModel.find({
        asignaturaId: { $in: asignaturaIds }
      }).exec();
      return calificacionesDoc.map(doc => this.mapToEntity(doc));
    } catch (error) {
      console.error("Error en findByCursoId:", error);
      return [];
    }
  }

  async findAll(): Promise<Calificacion[]> {
    const docs = await CalificacionModel.find().exec();
    return docs.map(doc => this.mapToEntity(doc));
  }

  async findById(id: string): Promise<Calificacion | null> {
    const doc = await CalificacionModel.findById(id).exec();
    return doc ? this.mapToEntity(doc) : null;
  }

  async findByEstudianteId(estudianteId: string): Promise<Calificacion[]> {
    try {
      // Busca tanto por cedula directa como por ObjectId para cubrir ambos casos de almacenamiento
      let queries: any[] = [{ estudianteId }];
      if (!mongoose.Types.ObjectId.isValid(estudianteId)) {
        const EstudianteModel = mongoose.model('Estudiante');
        const est = await EstudianteModel.findOne({ cedula: estudianteId }).exec();
        if (est) queries.push({ estudianteId: est._id });
      }
      const docs = await CalificacionModel.find({ $or: queries }).exec();
      return docs.map(doc => this.mapToEntity(doc));
    } catch (error) {
      console.error("Error en findByEstudianteId:", error);
      return [];
    }
  }

  async findByAsignaturaId(asignaturaId: string): Promise<Calificacion[]> {
    const docs = await CalificacionModel.find({ asignaturaId }).exec();
    return docs.map(doc => this.mapToEntity(doc));
  }

  async findByBoletinId(boletinId: string): Promise<Calificacion[]> {
    const docs = await CalificacionModel.find({ boletinId }).exec();
    return docs.map(doc => this.mapToEntity(doc));
  }

  async findByEstudianteIdAndPeriodo(estudianteId: string, periodo: string): Promise<Calificacion[]> {
    try {
      // También cubre búsqueda por cédula para boletines
      let queries: any[] = [{ estudianteId, periodo }];
      if (!mongoose.Types.ObjectId.isValid(estudianteId)) {
        const EstudianteModel = mongoose.model('Estudiante');
        const est = await EstudianteModel.findOne({ cedula: estudianteId }).exec();
        if (est) queries.push({ estudianteId: est._id, periodo });
      }
      const docs = await CalificacionModel.find({ $or: queries }).exec();
      return docs.map(doc => this.mapToEntity(doc));
    } catch (error) {
      console.error("Error en findByEstudianteIdAndPeriodo:", error);
      return [];
    }
  }

  async findByAsignaturaYPeriodo(asignaturaId: string, periodo: string): Promise<Calificacion[]> {
    const docs = await CalificacionModel.find({ asignaturaId, periodo }).lean().exec();
    return docs.map(doc => this.mapToEntity(doc));
  }

  async create(calificacion: Omit<Calificacion, 'id'>): Promise<Calificacion> {
    try {
      if (!calificacion.estudianteId) throw new Error("El campo estudianteId es requerido");
      if (!calificacion.asignaturaId) throw new Error("El campo asignaturaId es requerido");

      const calificacionData = {
        estudianteId:    calificacion.estudianteId,
        asignaturaId:    calificacion.asignaturaId,
        nota:            calificacion.nota,
        periodo:         calificacion.periodo,
        observaciones:   calificacion.observaciones || '',
        fecha:           calificacion.fecha || new Date(),
        boletinId:       calificacion.boletinId,
        tipoActividad:   calificacion.tipoActividad,
        nombreActividad: calificacion.nombreActividad,
        corte:           calificacion.corte,
      };

      const nueva = new CalificacionModel(calificacionData);
      const saved = await nueva.save();
      return this.mapToEntity(saved);
    } catch (error) {
      throw error;
    }
  }

  async update(id: string, calificacion: Partial<Calificacion>): Promise<Calificacion | null> {
    const updated = await CalificacionModel.findByIdAndUpdate(id, calificacion, { new: true }).exec();
    return updated ? this.mapToEntity(updated) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await CalificacionModel.findByIdAndDelete(id).exec();
    return !!result;
  }

  // ── FIX: mapToEntity ahora incluye tipoActividad, nombreActividad y corte ──
  private mapToEntity(doc: any): Calificacion {
    try {
      const toStr = (v: any) => v ? (typeof v === 'string' ? v : v.toString()) : '';
      return new Calificacion(
        doc._id ? doc._id.toString() : '',
        toStr(doc.estudianteId),
        toStr(doc.asignaturaId),
        doc.nota,
        doc.periodo,
        doc.observaciones || '',
        doc.fecha || new Date(),
        doc.boletinId,
        doc.tipoActividad,      // ← nuevo
        doc.nombreActividad,    // ← nuevo
        doc.corte               // ← nuevo
      );
    } catch (error) {
      console.error("Error al mapear documento a entidad:", error, doc);
      throw error;
    }
  }
}

export const calificacionRepository = new CalificacionRepositoryImpl();