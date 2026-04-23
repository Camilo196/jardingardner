import { EstudianteModel } from './models/EstudianteModel';
import { EmpleadoModel } from './models/EmpleadoModel';
import { Estudiante } from '../../../core/domain/estudiante';
import mongoose from 'mongoose';
export class EstudianteRepositoryImpl {
    async create(estudianteData) {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            console.log("Datos recibidos en create estudiante:", JSON.stringify(estudianteData, null, 2));
            // Validar y normalizar la cédula
            let cedula = estudianteData.cedula;
            if (!cedula) {
                throw new Error('La cédula es obligatoria');
            }
            // Convertir la cédula a string si es un objeto
            if (typeof cedula === 'object') {
                if (cedula.buffer) {
                    cedula = cedula.buffer.toString('hex');
                }
                else if (cedula.toString) {
                    cedula = cedula.toString();
                }
            }
            cedula = String(cedula).trim();
            if (!cedula) {
                throw new Error('La cédula es obligatoria');
            }
            // Verificar si ya existe un estudiante con esta cédula
            const estudianteExistente = await EstudianteModel.findOne({ cedula }).session(session);
            if (estudianteExistente) {
                throw new Error(`Ya existe un estudiante con la cédula ${cedula}`);
            }
            // Crear empleado relacionado
            const empleado = new EmpleadoModel({
                cedula,
                nombre: estudianteData.nombre,
                primerApellido: estudianteData.primerApellido,
                segundoApellido: estudianteData.segundoApellido,
                email: estudianteData.email,
                telefono: estudianteData.telefono || '',
                direccion: estudianteData.direccion || '',
                tipo: 'estudiante'
            });
            const savedEmpleado = await empleado.save({ session });
            // Crear estudiante
            const nuevoEstudiante = new EstudianteModel({
                cedula,
                empleadoId: savedEmpleado._id,
                acudiente: estudianteData.acudiente || ''
            });
            const savedEstudiante = await nuevoEstudiante.save({ session });
            await session.commitTransaction();
            return new Estudiante(cedula, estudianteData.nombre, estudianteData.primerApellido, estudianteData.segundoApellido, estudianteData.email, estudianteData.telefono || '', estudianteData.direccion || '', estudianteData.acudiente || '');
        }
        catch (error) {
            await session.abortTransaction();
            console.error("Error en create estudiante:", error);
            throw error;
        }
        finally {
            session.endSession();
        }
    }
    async findAll() {
        try {
            const estudiantes = await EstudianteModel.find()
                .populate('empleadoId')
                .lean()
                .exec();
            return estudiantes.map(doc => {
                const empleado = doc.empleadoId;
                if (!empleado) {
                    console.error('Empleado no encontrado para estudiante:', doc);
                    return null;
                }
                return new Estudiante(doc.cedula, empleado.nombre, empleado.primerApellido, empleado.segundoApellido, empleado.email, empleado.telefono || '', empleado.direccion || '', doc.acudiente || '');
            }).filter(Boolean);
        }
        catch (error) {
            console.error('Error en findAll estudiantes:', error);
            throw error;
        }
    }
    async findById(id) {
        try {
            console.log("Buscando estudiante con ID:", id);
            // Convertir a string si es un ObjectId
            let idStr = id;
            if (typeof id === 'object' && id !== null) {
                if (id.toString) {
                    idStr = id.toString();
                }
                else if (id.buffer) {
                    idStr = id.buffer.toString('hex');
                }
            }
            // Primero intentar buscar por _id (MongoDB ObjectId)
            let estudiante = null;
            if (mongoose.Types.ObjectId.isValid(idStr)) {
                console.log("Buscando por ObjectId:", idStr);
                estudiante = await EstudianteModel.findById(idStr).populate('empleadoId');
            }
            // Si no se encuentra, intentar buscar por cédula
            if (!estudiante) {
                console.log("No se encontró por ObjectId, intentando por cédula:", idStr);
                estudiante = await EstudianteModel.findOne({ cedula: idStr }).populate('empleadoId');
            }
            if (!estudiante) {
                console.log("No se encontró estudiante con ID:", idStr);
                return null;
            }
            const empleado = estudiante.empleadoId;
            if (!empleado) {
                console.log("No se encontró el empleado asociado al estudiante");
                return null;
            }
            return new Estudiante(estudiante.cedula, empleado.nombre, empleado.primerApellido, empleado.segundoApellido, empleado.email, empleado.telefono || '', empleado.direccion || '', estudiante.acudiente || '');
        }
        catch (error) {
            console.error("Error en findById de estudiante:", error);
            return null;
        }
    }
    // En estudianteRepositoryImpl.ts
    async findByCedula(cedula) {
        try {
            console.log("Buscando estudiante por cédula:", cedula);
            // Si tenemos un objeto (posiblemente un ObjectId), intentar convertir a string
            if (typeof cedula === 'object' && cedula !== null) {
                if (cedula.toString) {
                    cedula = cedula.toString();
                }
                else if (cedula.buffer) {
                    cedula = cedula.buffer.toString('hex');
                }
                console.log("Cédula convertida a string:", cedula);
            }
            const estudiante = await EstudianteModel.findOne({ cedula }).populate('empleadoId');
            if (!estudiante) {
                console.log("No se encontró estudiante con cédula:", cedula);
                return null;
            }
            const empleado = estudiante.empleadoId;
            if (!empleado) {
                console.log("No se encontró el empleado asociado al estudiante con cédula:", cedula);
                return null;
            }
            return new Estudiante(estudiante.cedula, empleado.nombre, empleado.primerApellido, empleado.segundoApellido, empleado.email, empleado.telefono || '', empleado.direccion || '', estudiante.acudiente || '');
        }
        catch (error) {
            console.error("Error en findByCedula de estudiante:", error);
            return null;
        }
    }
    async update(id, estudianteData) {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            // Actualizar el empleado relacionado
            const estudiante = await EstudianteModel.findOne({ cedula: id }).session(session);
            if (!estudiante) {
                throw new Error(`No se encontró un estudiante con la cédula ${id}`);
            }
            const empleado = await EmpleadoModel.findById(estudiante.empleadoId).session(session);
            if (!empleado) {
                throw new Error(`No se encontró un empleado relacionado con el estudiante de cédula ${id}`);
            }
            // Actualizar los datos del empleado
            if (estudianteData.nombre)
                empleado.nombre = estudianteData.nombre;
            if (estudianteData.primerApellido)
                empleado.primerApellido = estudianteData.primerApellido;
            if (estudianteData.segundoApellido)
                empleado.segundoApellido = estudianteData.segundoApellido;
            if (estudianteData.email)
                empleado.email = estudianteData.email;
            if (estudianteData.telefono)
                empleado.telefono = estudianteData.telefono;
            if (estudianteData.direccion)
                empleado.direccion = estudianteData.direccion;
            // Actualizar acudiente si se proporciona
            if (estudianteData.acudiente !== undefined) {
                estudiante.acudiente = estudianteData.acudiente;
                await estudiante.save({ session });
            }
            await empleado.save({ session });
            await session.commitTransaction();
            return new Estudiante(estudiante.cedula, empleado.nombre, empleado.primerApellido, empleado.segundoApellido, empleado.email, empleado.telefono || '', empleado.direccion || '', estudiante.acudiente || '');
        }
        catch (error) {
            await session.abortTransaction();
            console.error('Error en update estudiante:', error);
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
            // Encontrar el estudiante para obtener el empleadoId
            const estudiante = await EstudianteModel.findOne({ cedula: id }).session(session);
            if (!estudiante) {
                throw new Error('Estudiante no encontrado');
            }
            // Eliminar estudiante y su empleado asociado
            await Promise.all([
                EstudianteModel.findOneAndDelete({ cedula: id }, { session }),
                EmpleadoModel.findByIdAndDelete(estudiante.empleadoId, { session })
            ]);
            await session.commitTransaction();
            return true;
        }
        catch (error) {
            await session.abortTransaction();
            console.error('Error en delete estudiante:', error);
            throw error;
        }
        finally {
            session.endSession();
        }
    }
}
//# sourceMappingURL=estudianteRepositoryImpl.js.map