import { ProfesorModel } from './models/ProfesorModel';
import { EmpleadoModel } from './models/EmpleadoModel';
import { Profesor } from '../../../core/domain/profesor';
import mongoose from 'mongoose';
export class ProfesorRepositoryImpl {
    async create(profesorData) {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            console.log("Datos recibidos en create profesor:", profesorData);
            if (!profesorData.cedula) {
                throw new Error('La cédula es obligatoria');
            }
            // Verificar si ya existe un profesor con esta cédula
            const profesorExistente = await ProfesorModel.findOne({
                cedula: profesorData.cedula
            }).session(session);
            if (profesorExistente) {
                throw new Error(`Ya existe un profesor con la cédula ${profesorData.cedula}`);
            }
            // Crear empleado relacionado con enfoque seguro para _id
            const empleadoData = {
                cedula: profesorData.cedula,
                nombre: profesorData.nombre,
                primerApellido: profesorData.primerApellido,
                segundoApellido: profesorData.segundoApellido || '',
                email: profesorData.email,
                telefono: profesorData.telefono || '',
                direccion: profesorData.direccion || '',
                tipo: 'profesor'
            };
            // Asignar la cédula como _id explícitamente
            const empleado = new EmpleadoModel({
                ...empleadoData,
                _id: profesorData.cedula // Forzar el uso de la cédula como ID
            });
            console.log("Creando empleado con _id:", empleado._id);
            const savedEmpleado = await empleado.save({ session });
            // Crear profesor usando la cédula como ID
            const nuevoProfesor = new ProfesorModel({
                _id: profesorData.cedula, // Usar cédula como ID de MongoDB
                cedula: profesorData.cedula,
                empleadoId: savedEmpleado._id
            });
            console.log("Creando profesor con _id:", nuevoProfesor._id);
            console.log("Relacionado con empleadoId:", savedEmpleado._id);
            const savedProfesor = await nuevoProfesor.save({ session });
            await session.commitTransaction();
            console.log("Profesor creado con éxito. ID:", savedProfesor._id);
            return new Profesor(profesorData.cedula, profesorData.nombre, profesorData.primerApellido, profesorData.segundoApellido || '', profesorData.email, profesorData.telefono || '', profesorData.direccion || '');
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
            const profesores = await ProfesorModel.find()
                .populate('empleadoId')
                .lean()
                .exec();
            return profesores.map(doc => {
                const empleado = doc.empleadoId;
                if (!empleado) {
                    console.error('Empleado no encontrado para profesor:', doc);
                    return null;
                }
                return new Profesor(doc.cedula, empleado.nombre, empleado.primerApellido, empleado.segundoApellido, empleado.email, empleado.telefono || '', empleado.direccion || '');
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
            // Primero intentar buscar por _id (que debería ser igual a la cédula)
            let profesor = await ProfesorModel.findById(id).populate('empleadoId');
            // Si no se encontró, buscar por el campo cédula
            if (!profesor) {
                console.log("No se encontró profesor por _id, buscando por cédula:", id);
                profesor = await ProfesorModel.findOne({ cedula: id }).populate('empleadoId');
            }
            if (!profesor) {
                console.log("No se encontró profesor con cédula/ID:", id);
                return null;
            }
            const empleado = profesor.empleadoId;
            if (!empleado) {
                console.error("Empleado no encontrado para profesor:", profesor);
                return null;
            }
            console.log("Profesor encontrado:", profesor.cedula, "con empleado:", empleado.nombre);
            return new Profesor(profesor.cedula, empleado.nombre, empleado.primerApellido, empleado.segundoApellido || '', empleado.email, empleado.telefono || '', empleado.direccion || '');
        }
        catch (error) {
            console.error("Error en findById de profesor:", error);
            return null;
        }
    }
    async findByCedula(cedula) {
        try {
            // Intentar buscar tanto por _id como por cédula para mayor compatibilidad
            let profesor = await ProfesorModel.findOne({
                $or: [
                    { _id: cedula },
                    { cedula: cedula }
                ]
            }).populate('empleadoId').lean().exec();
            if (!profesor || !profesor.empleadoId) {
                console.log("No se encontró profesor con cédula:", cedula);
                return null;
            }
            const empleado = profesor.empleadoId;
            return new Profesor(profesor.cedula, empleado.nombre, empleado.primerApellido, empleado.segundoApellido || '', empleado.email, empleado.telefono || '', empleado.direccion || '');
        }
        catch (error) {
            console.error('Error en findByCedula:', error);
            throw error;
        }
    }
    async update(id, profesorData) {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            // Buscar por _id o por cedula para mayor compatibilidad
            const profesor = await ProfesorModel.findOne({
                $or: [
                    { _id: id },
                    { cedula: id }
                ]
            }).session(session);
            if (!profesor) {
                throw new Error(`No se encontró un profesor con la cédula/ID ${id}`);
            }
            const empleado = await EmpleadoModel.findById(profesor.empleadoId).session(session);
            if (!empleado) {
                throw new Error(`No se encontró un empleado relacionado con el profesor de cédula ${id}`);
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
            return new Profesor(profesor.cedula, empleado.nombre, empleado.primerApellido, empleado.segundoApellido || '', empleado.email, empleado.telefono || '', empleado.direccion || '');
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
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            // Encontrar el profesor por _id o por cedula
            const profesor = await ProfesorModel.findOne({
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
                ProfesorModel.findOneAndDelete({
                    $or: [
                        { _id: id },
                        { cedula: id }
                    ]
                }, { session }),
                EmpleadoModel.findByIdAndDelete(profesor.empleadoId, { session })
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
//# sourceMappingURL=profesorRepositoryImpl.js.map