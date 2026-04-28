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
            if (!estudianteData.cedula) {
                throw new Error('La cédula es obligatoria');
            }
            const estudianteExistente = await EstudianteModel.findOne({
                cedula: estudianteData.cedula
            }).session(session);
            if (estudianteExistente) {
                throw new Error(`Ya existe un estudiante con la cédula ${estudianteData.cedula}`);
            }
            const empleadoPayload = {
                _id: estudianteData.cedula,
                cedula: estudianteData.cedula,
                nombre: estudianteData.nombre,
                primerApellido: estudianteData.primerApellido,
                segundoApellido: estudianteData.segundoApellido || '',
                telefono: estudianteData.telefono || '',
                direccion: estudianteData.direccion || '',
                tipo: 'estudiante'
            };
            if (estudianteData.email) {
                empleadoPayload.email = estudianteData.email;
            }
            const empleado = new EmpleadoModel(empleadoPayload);
            console.log("Creando empleado con ID:", empleado._id);
            const savedEmpleado = await empleado.save({ session });
            console.log("Empleado creado con ID:", savedEmpleado._id);
            const nuevoEstudiante = new EstudianteModel({
                _id: estudianteData.cedula,
                cedula: estudianteData.cedula,
                empleadoId: savedEmpleado._id,
                acudiente: estudianteData.acudiente || ''
            });
            console.log("Creando estudiante con ID:", nuevoEstudiante._id);
            console.log("Relacionado con empleadoId:", savedEmpleado._id);
            const savedEstudiante = await nuevoEstudiante.save({ session });
            await session.commitTransaction();
            console.log("Estudiante creado con éxito. ID:", savedEstudiante._id);
            return new Estudiante(estudianteData.cedula, estudianteData.nombre, estudianteData.primerApellido, estudianteData.segundoApellido || '', estudianteData.email || '', estudianteData.telefono || '', estudianteData.direccion || '', estudianteData.acudiente || '');
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
                return new Estudiante(doc.cedula, empleado.nombre, empleado.primerApellido, empleado.segundoApellido || '', empleado.email || '', empleado.telefono || '', empleado.direccion || '', doc.acudiente || '');
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
            let idStr = id;
            if (typeof id === 'object' && id !== null) {
                if (id.toString) {
                    idStr = id.toString();
                }
                else if (id.buffer) {
                    idStr = id.buffer.toString('hex');
                }
            }
            let estudiante = null;
            if (mongoose.Types.ObjectId.isValid(idStr)) {
                console.log("Buscando por ObjectId:", idStr);
                estudiante = await EstudianteModel.findById(idStr).populate('empleadoId');
            }
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
            return new Estudiante(estudiante.cedula, empleado.nombre, empleado.primerApellido, empleado.segundoApellido || '', empleado.email || '', empleado.telefono || '', empleado.direccion || '', estudiante.acudiente || '');
        }
        catch (error) {
            console.error("Error en findById de estudiante:", error);
            return null;
        }
    }
    async findByIds(ids) {
        try {
            console.log(`Buscando estudiantes con IDs: ${ids}`);
            const estudiantes = await EstudianteModel.find({
                $or: [{ cedula: { $in: ids } }, { _id: { $in: ids } }]
            }).populate('empleadoId').lean();
            return estudiantes.map((doc) => {
                const emp = doc.empleadoId;
                return {
                    id: doc.cedula,
                    cedula: doc.cedula,
                    nombre: emp?.nombre ?? '',
                    primerApellido: emp?.primerApellido ?? '',
                    segundoApellido: emp?.segundoApellido ?? '',
                    email: emp?.email ?? '',
                    telefono: emp?.telefono ?? '',
                    direccion: emp?.direccion ?? '',
                    acudiente: doc.acudiente ?? '',
                };
            });
        }
        catch (error) {
            console.error('Error en findByIds:', error);
            throw new Error('Error al buscar estudiantes por IDs');
        }
    }
    async findByCedula(cedula) {
        try {
            if (typeof cedula === 'object' && cedula !== null) {
                cedula = cedula.toString ? cedula.toString() : cedula.buffer?.toString('hex') ?? String(cedula);
            }
            const estudiante = await EstudianteModel.findOne({ cedula }).populate('empleadoId');
            if (!estudiante)
                return null;
            const empleado = estudiante.empleadoId;
            if (!empleado)
                return null;
            return new Estudiante(estudiante.cedula, empleado.nombre, empleado.primerApellido, empleado.segundoApellido || '', empleado.email || '', empleado.telefono || '', empleado.direccion || '', estudiante.acudiente || '');
        }
        catch (error) {
            return null;
        }
    }
    async findByEmail(email) {
        try {
            const Empleado = mongoose.model('Empleado');
            const empleado = await Empleado.findOne({ email }).lean();
            if (!empleado)
                return null;
            const estudiante = await EstudianteModel.findOne({ empleadoId: empleado._id }).populate('empleadoId');
            if (!estudiante)
                return null;
            return new Estudiante(estudiante.cedula, empleado.nombre, empleado.primerApellido, empleado.segundoApellido || '', empleado.email || '', empleado.telefono || '', empleado.direccion || '', estudiante.acudiente || '');
        }
        catch {
            return null;
        }
    }
    async update(id, estudianteData) {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            const estudiante = await EstudianteModel.findOne({ cedula: id }).session(session);
            if (!estudiante) {
                throw new Error(`No se encontró un estudiante con la cédula ${id}`);
            }
            const empleado = await EmpleadoModel.findById(estudiante.empleadoId).session(session);
            if (!empleado) {
                throw new Error(`No se encontró un empleado relacionado con el estudiante de cédula ${id}`);
            }
            if (estudianteData.nombre)
                empleado.nombre = estudianteData.nombre;
            if (estudianteData.primerApellido)
                empleado.primerApellido = estudianteData.primerApellido;
            if (estudianteData.segundoApellido !== undefined)
                empleado.segundoApellido = estudianteData.segundoApellido;
            if (estudianteData.telefono !== undefined)
                empleado.telefono = estudianteData.telefono;
            if (estudianteData.direccion !== undefined)
                empleado.direccion = estudianteData.direccion;
            if ('email' in estudianteData) {
                const nuevoEmail = String(estudianteData.email || '').trim();
                empleado.email = (nuevoEmail || undefined);
            }
            if (estudianteData.acudiente !== undefined) {
                estudiante.acudiente = estudianteData.acudiente;
                await estudiante.save({ session });
            }
            await empleado.save({ session });
            await session.commitTransaction();
            return new Estudiante(estudiante.cedula, empleado.nombre, empleado.primerApellido, empleado.segundoApellido || '', empleado.email || '', empleado.telefono || '', empleado.direccion || '', estudiante.acudiente || '');
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
            const estudiante = await EstudianteModel.findOne({ cedula: id }).session(session);
            if (!estudiante) {
                throw new Error('Estudiante no encontrado');
            }
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