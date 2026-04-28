"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfesorRepositoryImpl = void 0;
const ProfesorModel_1 = require("./models/ProfesorModel");
const EmpleadoModel_1 = require("./models/EmpleadoModel");
const profesor_1 = require("../../../core/domain/profesor");
const mongoose_1 = __importDefault(require("mongoose"));
class ProfesorRepositoryImpl {
    async create(profesorData) {
        const session = await mongoose_1.default.startSession();
        session.startTransaction();
        try {
            console.log("Datos recibidos en create profesor:", profesorData);
            if (!profesorData.cedula) {
                throw new Error('La cÃ©dula es obligatoria');
            }
            // Verificar si ya existe un profesor con esta cÃ©dula
            const profesorExistente = await ProfesorModel_1.ProfesorModel.findOne({
                cedula: profesorData.cedula
            }).session(session);
            if (profesorExistente) {
                throw new Error(`Ya existe un profesor con la cÃ©dula ${profesorData.cedula}`);
            }
            // Paso 1: Crear el empleado con la cÃ©dula como ID
            const empleado = new EmpleadoModel_1.EmpleadoModel({
                _id: profesorData.cedula, // Usar cÃ©dula como ID
                cedula: profesorData.cedula,
                nombre: profesorData.nombre,
                primerApellido: profesorData.primerApellido,
                segundoApellido: profesorData.segundoApellido || '',
                email: profesorData.email,
                telefono: profesorData.telefono || '',
                direccion: profesorData.direccion || '',
                tipo: 'profesor'
            });
            console.log("Creando empleado con ID:", empleado._id);
            const savedEmpleado = await empleado.save({ session });
            console.log("Empleado creado con ID:", savedEmpleado._id);
            // Paso 2: Crear el profesor usando la cÃ©dula como ID y empleadoId
            const nuevoProfesor = new ProfesorModel_1.ProfesorModel({
                _id: profesorData.cedula, // CÃ©dula como ID del profesor
                cedula: profesorData.cedula,
                empleadoId: savedEmpleado._id // Usar el mismo ID que el empleado
            });
            console.log("Creando profesor con ID:", nuevoProfesor._id);
            console.log("Relacionado con empleadoId:", savedEmpleado._id);
            const savedProfesor = await nuevoProfesor.save({ session });
            await session.commitTransaction();
            console.log("Profesor creado con Ã©xito. ID:", savedProfesor._id);
            return new profesor_1.Profesor(profesorData.cedula, profesorData.nombre, profesorData.primerApellido, profesorData.segundoApellido || '', profesorData.email, profesorData.telefono || '', profesorData.direccion || '');
        }
        catch (error) {
            await session.abortTransaction();
            console.error("Error en create profesor:", error);
            throw error;
        }
        finally {
            session.endSession();
        }
    }
    async findAll() {
        try {
            const profesores = await ProfesorModel_1.ProfesorModel.find()
                .populate('empleadoId')
                .lean()
                .exec();
            return profesores.map(doc => {
                const empleado = doc.empleadoId;
                if (!empleado) {
                    console.error('Empleado no encontrado para profesor:', doc);
                    return null;
                }
                return new profesor_1.Profesor(doc.cedula, empleado.nombre, empleado.primerApellido, empleado.segundoApellido, empleado.email || "", empleado.telefono || '', empleado.direccion || '');
            }).filter(Boolean);
        }
        catch (error) {
            console.error('Error en findAll:', error);
            throw error;
        }
    }
    async findById(id) {
        try {
            console.log("Buscando profesor con ID:", id);
            // Primero intentar buscar por _id (que deberÃ­a ser igual a la cÃ©dula)
            let profesor = await ProfesorModel_1.ProfesorModel.findById(id).populate('empleadoId');
            // Si no se encontrÃ³, buscar por el campo cÃ©dula
            if (!profesor) {
                console.log("No se encontrÃ³ profesor por _id, buscando por cÃ©dula:", id);
                profesor = await ProfesorModel_1.ProfesorModel.findOne({ cedula: id }).populate('empleadoId');
            }
            if (!profesor) {
                console.log("No se encontrÃ³ profesor con cÃ©dula/ID:", id);
                return null;
            }
            const empleado = profesor.empleadoId;
            if (!empleado) {
                console.error("Empleado no encontrado para profesor:", profesor);
                return null;
            }
            console.log("Profesor encontrado:", profesor.cedula, "con empleado:", empleado.nombre);
            return new profesor_1.Profesor(profesor.cedula, empleado.nombre, empleado.primerApellido, empleado.segundoApellido || '', empleado.email || "", empleado.telefono || '', empleado.direccion || '');
        }
        catch (error) {
            console.error("Error en findById de profesor:", error);
            return null;
        }
    }
    async findByCedula(cedula) {
        try {
            let profesor = await ProfesorModel_1.ProfesorModel.findOne({
                $or: [{ _id: cedula }, { cedula: cedula }]
            }).populate('empleadoId').lean().exec();
            if (!profesor || !profesor.empleadoId)
                return null;
            const empleado = profesor.empleadoId;
            return new profesor_1.Profesor(profesor.cedula, empleado.nombre, empleado.primerApellido, empleado.segundoApellido || '', empleado.email || "", empleado.telefono || '', empleado.direccion || '');
        }
        catch (error) {
            throw error;
        }
    }
    async findByEmail(email) {
        try {
            const EmpleadoModel = mongoose_1.default.model('Empleado');
            const empleado = await EmpleadoModel.findOne({ email }).lean();
            if (!empleado)
                return null;
            const profesor = await ProfesorModel_1.ProfesorModel.findOne({ empleadoId: empleado._id }).populate('empleadoId').lean().exec();
            if (!profesor || !profesor.empleadoId)
                return null;
            const emp = profesor.empleadoId;
            return new profesor_1.Profesor(profesor.cedula, emp.nombre, emp.primerApellido, emp.segundoApellido || '', emp.email, emp.telefono || '', emp.direccion || '');
        }
        catch {
            return null;
        }
    }
    async update(id, profesorData) {
        const session = await mongoose_1.default.startSession();
        session.startTransaction();
        try {
            // Buscar por _id o por cedula para mayor compatibilidad
            const profesor = await ProfesorModel_1.ProfesorModel.findOne({
                $or: [
                    { _id: id },
                    { cedula: id }
                ]
            }).session(session);
            if (!profesor) {
                throw new Error(`No se encontrÃ³ un profesor con la cÃ©dula/ID ${id}`);
            }
            const empleado = await EmpleadoModel_1.EmpleadoModel.findById(profesor.empleadoId).session(session);
            if (!empleado) {
                throw new Error(`No se encontrÃ³ un empleado relacionado con el profesor de cÃ©dula ${id}`);
            }
            // Actualizar los datos del empleado
            if (profesorData.nombre)
                empleado.nombre = profesorData.nombre;
            if (profesorData.primerApellido)
                empleado.primerApellido = profesorData.primerApellido;
            if (profesorData.segundoApellido)
                empleado.segundoApellido = profesorData.segundoApellido;
            if (profesorData.email)
                empleado.email = profesorData.email;
            if (profesorData.telefono)
                empleado.telefono = profesorData.telefono;
            if (profesorData.direccion)
                empleado.direccion = profesorData.direccion;
            await empleado.save({ session });
            await session.commitTransaction();
            return new profesor_1.Profesor(profesor.cedula, empleado.nombre, empleado.primerApellido, empleado.segundoApellido || '', empleado.email || "", empleado.telefono || '', empleado.direccion || '');
        }
        catch (error) {
            await session.abortTransaction();
            console.error('Error en update:', error);
            throw error;
        }
        finally {
            session.endSession();
        }
    }
    async delete(id) {
        const session = await mongoose_1.default.startSession();
        session.startTransaction();
        try {
            // Encontrar el profesor por _id o por cedula
            const profesor = await ProfesorModel_1.ProfesorModel.findOne({
                $or: [
                    { _id: id },
                    { cedula: id }
                ]
            }).session(session);
            if (!profesor) {
                throw new Error('Profesor no encontrado');
            }
            // Eliminar profesor y su empleado asociado
            await Promise.all([
                ProfesorModel_1.ProfesorModel.findOneAndDelete({
                    $or: [
                        { _id: id },
                        { cedula: id }
                    ]
                }, { session }),
                EmpleadoModel_1.EmpleadoModel.findByIdAndDelete(profesor.empleadoId, { session })
            ]);
            await session.commitTransaction();
            return true;
        }
        catch (error) {
            await session.abortTransaction();
            console.error('Error en delete:', error);
            throw error;
        }
        finally {
            session.endSession();
        }
    }
}
exports.ProfesorRepositoryImpl = ProfesorRepositoryImpl;
//# sourceMappingURL=profesorRepositoryImpl.js.map