import { AsignaturaRepository } from '../../../core/ports/AsignaturaRepository';
import { Asignatura } from '../../../core/domain/asignatura';
import { AsignaturaModel } from './models/AsignaturaModel';
import mongoose from 'mongoose';

export class AsignaturaRepositoryImpl implements AsignaturaRepository {
    static findAll() {
        throw new Error('Method not implemented.');
    }
    async findByProfesorId(profesorId: string): Promise<Asignatura[]> {
        try {
            const asignaturas = await AsignaturaModel.find({
                profesorId: profesorId
            })
            .populate({
                path: 'profesorId',
                select: 'cedula nombre primerApellido segundoApellido'
            })
            .populate({
                path: 'cursoId',
                select: 'nombre'
            });

            return asignaturas.map(doc => this.mapToEntity(doc));
        } catch (error) {
            console.error(`Error al obtener asignaturas del profesor ${profesorId}:`, error);
            throw new Error(`Error al obtener las asignaturas del profesor con ID ${profesorId}`);
        }
    }

    // Método findByIds en AsignaturaRepositoryImpl
async findByIds(ids: string[]): Promise<Asignatura[]> {
    try {
        console.log('🔎 Iniciando búsqueda de asignaturas por IDs');
        
        // Validación de entrada
        if (!ids) {
            console.log('⚠️ Array de IDs es nulo o indefinido');
            return [];
        }
        
        if (!Array.isArray(ids)) {
            console.log(`⚠️ El parámetro ids no es un array, es: ${typeof ids}`);
            return [];
        }
        
        if (ids.length === 0) {
            console.log('📝 Array de IDs está vacío');
            return [];
        }
        
        console.log(`🔍 Buscando asignaturas con ${ids.length} IDs: ${ids.join(', ')}`);
        
        // Filtrar IDs válidos
        const validIds = ids.filter(id => {
            const isValid = id && String(id).trim() !== '';
            if (!isValid) {
                console.log(`⚠️ ID inválido filtrado: ${id}`);
            }
            return isValid;
        });
        
        if (validIds.length === 0) {
            console.log('⚠️ No hay IDs válidos después de filtrar');
            return [];
        }
        
        // Convertir a ObjectId si son compatibles con MongoDB
        const objectIds = validIds.map(id => {
            try {
                if (mongoose.Types.ObjectId.isValid(id)) {
                    return new mongoose.Types.ObjectId(id);
                }
                return id;
            } catch (err) {
                console.log(`⚠️ No se pudo convertir ID a ObjectId: ${id}`);
                return id;
            }
        });
        
        // Buscar asignaturas con IDs válidos usando una consulta más flexible
        const asignaturas = await AsignaturaModel.find({
            $or: [
                { _id: { $in: objectIds } },
                { id: { $in: validIds } }
            ]
        });
        
        console.log(`✅ Se encontraron ${asignaturas.length} asignaturas en la base de datos`);
        
        // Mapear resultados al dominio
        return asignaturas.map(asignatura => this.mapToEntity(asignatura));
    } catch (error) {
        console.error('❌ Error en findByIds:', error);
        // En lugar de lanzar error, retornar array vacío
        return [];
    }
}

    async findAll(): Promise<Asignatura[]> {
        try {
            const asignaturas = await AsignaturaModel.find()
                .populate({
                    path: 'profesorId',
                    select: 'cedula nombre primerApellido segundoApellido'
                })
                .populate({
                    path: 'cursoId',
                    select: 'nombre'
                });

            return asignaturas.map(doc => this.mapToEntity(doc));
        } catch (error) {
            console.error('Error al obtener todas las asignaturas:', error);
            throw new Error('Error al obtener todas las asignaturas');
        }
    }

    async findById(id: string): Promise<Asignatura | null> {
        try {
            const asignatura = await AsignaturaModel.findById(id)
                .populate({
                    path: 'profesorId',
                    select: 'cedula nombre primerApellido segundoApellido'
                })
                .populate({
                    path: 'cursoId',
                    select: 'nombre'
                });

            return asignatura ? this.mapToEntity(asignatura) : null;
        } catch (error) {
            console.error(`Error al obtener la asignatura con ID ${id}:`, error);
            throw new Error(`Error al obtener la asignatura con ID ${id}`);
        }
    }

    async findByCursoId(cursoId: string): Promise<Asignatura[]> {
        try {
            const asignaturas = await AsignaturaModel.find({
                cursoId: cursoId
            })
            .populate({
                path: 'profesorId',
                select: 'cedula nombre primerApellido segundoApellido'
            })
            .populate({
                path: 'cursoId',
                select: 'nombre'
            });

            return asignaturas.map(doc => this.mapToEntity(doc));
        } catch (error) {
            console.error(`Error al obtener asignaturas del curso ${cursoId}:`, error);
            throw new Error(`Error al obtener las asignaturas del curso con ID ${cursoId}`);
        }
    }

    async create(input: any): Promise<Asignatura> {
        try {
            const asignatura = new AsignaturaModel({
                nombre: input.nombre,
                horario: input.horario,
                profesorId: input.profesorId,
                cursoId: input.cursoId
            });

            const saved = await asignatura.save();

            const populated = await AsignaturaModel.findById(saved._id)
                .populate({
                    path: 'profesorId',
                    select: 'cedula nombre primerApellido segundoApellido'
                })
                .populate({
                    path: 'cursoId',
                    select: 'nombre'
                });

            if (!populated) {
                throw new Error('Error al crear la asignatura: no se pudo recuperar la información completa');
            }

            return this.mapToEntity(populated);
        } catch (error: any) {
            console.error('Error al crear asignatura:', error);
            throw new Error(`Error al crear la asignatura: ${error.message}`);
        }
    }

    async update(id: string, input: any): Promise<Asignatura> {
        try {
            const exists = await AsignaturaModel.findById(id);
            if (!exists) {
                throw new Error(`No se encontró asignatura con ID ${id}`);
            }

            const asignaturaActualizada = await AsignaturaModel.findByIdAndUpdate(
                id,
                { ...input },
                { new: true }
            )
            .populate({
                path: 'profesorId',
                select: 'cedula nombre primerApellido segundoApellido'
            })
            .populate({
                path: 'cursoId',
                select: 'nombre'
            });

            if (!asignaturaActualizada) {
                throw new Error(`Asignatura con ID ${id} no encontrada`);
            }

            return this.mapToEntity(asignaturaActualizada);
        } catch (error: any) {
            console.error(`Error al actualizar la asignatura con ID ${id}:`, error);
            throw new Error(`Error al actualizar la asignatura con ID ${id}: ${error.message}`);
        }
    }

    async delete(id: string): Promise<boolean> {
        try {
            const result = await AsignaturaModel.findByIdAndDelete(id);
            return !!result;
        } catch (error: any) {
            console.error(`Error al eliminar la asignatura con ID ${id}:`, error);
            throw new Error(`Error al eliminar la asignatura con ID ${id}: ${error.message}`);
        }
    }

    private mapToEntity(doc: any): Asignatura {
        try {
            return new Asignatura(
                doc._id.toString(),
                doc.nombre,
                doc.horario,
                doc.profesorId ? (doc.profesorId.cedula || (typeof doc.profesorId === 'string' ? doc.profesorId : doc.profesorId._id.toString())) : '',
                doc.profesorId && typeof doc.profesorId === 'object' ? doc.profesorId : null,
                doc.cursoId ? (typeof doc.cursoId === 'string' ? doc.cursoId : doc.cursoId._id.toString()) : '',
                doc.cursoId && typeof doc.cursoId === 'object' ? doc.cursoId : null
            );
        } catch (error) {
            console.error('Error al mapear entidad Asignatura:', error, 'Documento:', doc);
            throw new Error(`Error al mapear entidad Asignatura`);
        }
    }
}