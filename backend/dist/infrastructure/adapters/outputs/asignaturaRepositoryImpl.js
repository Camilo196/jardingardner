"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AsignaturaRepositoryImpl = void 0;
const asignatura_1 = require("../../../core/domain/asignatura");
const AsignaturaModel_1 = require("./models/AsignaturaModel");
const mongoose_1 = __importDefault(require("mongoose"));
class AsignaturaRepositoryImpl {
    static findAll() {
        throw new Error('Method not implemented.');
    }
    async findByProfesorId(profesorId) {
        try {
            const asignaturas = await AsignaturaModel_1.AsignaturaModel.find({
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
        }
        catch (error) {
            console.error(`Error al obtener asignaturas del profesor ${profesorId}:`, error);
            throw new Error(`Error al obtener las asignaturas del profesor con ID ${profesorId}`);
        }
    }
    // Método findByIds en AsignaturaRepositoryImpl
    async findByIds(ids) {
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
                    if (mongoose_1.default.Types.ObjectId.isValid(id)) {
                        return new mongoose_1.default.Types.ObjectId(id);
                    }
                    return id;
                }
                catch (err) {
                    console.log(`⚠️ No se pudo convertir ID a ObjectId: ${id}`);
                    return id;
                }
            });
            // Buscar asignaturas con IDs válidos usando una consulta más flexible
            const asignaturas = await AsignaturaModel_1.AsignaturaModel.find({
                $or: [
                    { _id: { $in: objectIds } },
                    { id: { $in: validIds } }
                ]
            });
            console.log(`✅ Se encontraron ${asignaturas.length} asignaturas en la base de datos`);
            // Mapear resultados al dominio
            return asignaturas.map(asignatura => this.mapToEntity(asignatura));
        }
        catch (error) {
            console.error('❌ Error en findByIds:', error);
            // En lugar de lanzar error, retornar array vacío
            return [];
        }
    }
    async findAll() {
        try {
            const asignaturas = await AsignaturaModel_1.AsignaturaModel.find()
                .populate({
                path: 'profesorId',
                select: 'cedula nombre primerApellido segundoApellido'
            })
                .populate({
                path: 'cursoId',
                select: 'nombre'
            });
            return asignaturas.map(doc => this.mapToEntity(doc));
        }
        catch (error) {
            console.error('Error al obtener todas las asignaturas:', error);
            throw new Error('Error al obtener todas las asignaturas');
        }
    }
    async findById(id) {
        try {
            const asignatura = await AsignaturaModel_1.AsignaturaModel.findById(id)
                .populate({
                path: 'profesorId',
                select: 'cedula nombre primerApellido segundoApellido'
            })
                .populate({
                path: 'cursoId',
                select: 'nombre'
            });
            return asignatura ? this.mapToEntity(asignatura) : null;
        }
        catch (error) {
            console.error(`Error al obtener la asignatura con ID ${id}:`, error);
            throw new Error(`Error al obtener la asignatura con ID ${id}`);
        }
    }
    async findByCursoId(cursoId) {
        try {
            const asignaturas = await AsignaturaModel_1.AsignaturaModel.find({
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
        }
        catch (error) {
            console.error(`Error al obtener asignaturas del curso ${cursoId}:`, error);
            throw new Error(`Error al obtener las asignaturas del curso con ID ${cursoId}`);
        }
    }
    async create(input) {
        try {
            const asignatura = new AsignaturaModel_1.AsignaturaModel({
                nombre: input.nombre,
                horario: input.horario,
                profesorId: input.profesorId,
                cursoId: input.cursoId
            });
            const saved = await asignatura.save();
            const populated = await AsignaturaModel_1.AsignaturaModel.findById(saved._id)
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
        }
        catch (error) {
            console.error('Error al crear asignatura:', error);
            throw new Error(`Error al crear la asignatura: ${error.message}`);
        }
    }
    async update(id, input) {
        try {
            const exists = await AsignaturaModel_1.AsignaturaModel.findById(id);
            if (!exists) {
                throw new Error(`No se encontró asignatura con ID ${id}`);
            }
            const asignaturaActualizada = await AsignaturaModel_1.AsignaturaModel.findByIdAndUpdate(id, { ...input }, { new: true })
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
        }
        catch (error) {
            console.error(`Error al actualizar la asignatura con ID ${id}:`, error);
            throw new Error(`Error al actualizar la asignatura con ID ${id}: ${error.message}`);
        }
    }
    async delete(id) {
        try {
            const result = await AsignaturaModel_1.AsignaturaModel.findByIdAndDelete(id);
            return !!result;
        }
        catch (error) {
            console.error(`Error al eliminar la asignatura con ID ${id}:`, error);
            throw new Error(`Error al eliminar la asignatura con ID ${id}: ${error.message}`);
        }
    }
    mapToEntity(doc) {
        try {
            return new asignatura_1.Asignatura(doc._id.toString(), doc.nombre, doc.horario, doc.profesorId ? (doc.profesorId.cedula || (typeof doc.profesorId === 'string' ? doc.profesorId : doc.profesorId._id.toString())) : '', doc.profesorId && typeof doc.profesorId === 'object' ? doc.profesorId : null, doc.cursoId ? (typeof doc.cursoId === 'string' ? doc.cursoId : doc.cursoId._id.toString()) : '', doc.cursoId && typeof doc.cursoId === 'object' ? doc.cursoId : null);
        }
        catch (error) {
            console.error('Error al mapear entidad Asignatura:', error, 'Documento:', doc);
            throw new Error(`Error al mapear entidad Asignatura`);
        }
    }
}
exports.AsignaturaRepositoryImpl = AsignaturaRepositoryImpl;
//# sourceMappingURL=asignaturaRepositoryImpl.js.map