import { AuthService } from '../../../core/services/AuthService';
import { User } from '../../../core/domain/user';
import mongoose from "mongoose";
import { EmpleadoModel } from "../outputs/models/EmpleadoModel";
import { EstudianteModel } from "../outputs/models/EstudianteModel";
const authService = new AuthService();
export const resolvers = {
    Query: {
        me: async (_, __, { user }) => {
            if (!user) {
                throw new Error('No autenticado');
            }
            return User.findById(user.id);
        },
        estudiantes: async (_, __, { repositories }) => {
            try {
                console.log("Context recibido en estudiantes:", repositories);
                if (!repositories) {
                    throw new Error('Repositories no está definido en el contexto');
                }
                if (!repositories.estudianteRepository) {
                    console.error('Repositorios disponibles:', Object.keys(repositories));
                    throw new Error('Repositorio de estudiantes no está definido');
                }
                const estudiantes = await repositories.estudianteRepository.findAll();
                return estudiantes;
            }
            catch (error) {
                console.error('Error en resolver de estudiantes:', error);
                throw error;
            }
        },
        estudiante: async (_, { id }, { repositories }) => {
            return await repositories.estudianteRepository.findById(id);
        },
        profesores: async (_, __, { repositories }) => {
            try {
                console.log("Context recibido en profesores:", repositories);
                if (!repositories) {
                    throw new Error('Repositories no está definido en el contexto');
                }
                if (!repositories.profesorRepository) {
                    console.error('Repositorios disponibles:', Object.keys(repositories));
                    throw new Error('Repositorio de profesores no está definido');
                }
                if (typeof repositories.profesorRepository.findAll !== 'function') {
                    console.error('Métodos disponibles en profesorRepository:', Object.keys(repositories.profesorRepository));
                    throw new Error('Método findAll no está definido en el repositorio de profesores');
                }
                const profesores = await repositories.profesorRepository.findAll();
                console.log('Profesores encontrados:', profesores);
                return profesores;
            }
            catch (error) {
                console.error('Error detallado en resolver de profesores:', error);
                throw error;
            }
        },
        profesor: async (_, { id }, { repositories }) => {
            return await repositories.profesorRepository.findById(id);
        },
        cursos: async (_, __, { repositories }) => {
            return await repositories.cursoRepository.findAll();
        },
        curso: async (_, { id }, { repositories }) => {
            return await repositories.cursoRepository.findById(id);
        },
        calificaciones: async (_, __, { repositories }) => {
            return await repositories.calificacionRepository.findAll();
        },
        calificacion: async (_, { id }, { repositories }) => {
            return await repositories.calificacionRepository.findById(id);
        },
        calificacionesPorEstudiante: async (_, { estudianteId }, { user, repositories }) => {
            if (user.role === 'student' && user.id !== estudianteId) {
                throw new Error('Solo puedes ver tus propias calificaciones');
            }
            return await repositories.calificacionRepository.findByEstudianteId(estudianteId);
        },
        boletines: async (_, __, { repositories }) => {
            return await repositories.boletinRepository.findAll();
        },
        boletin: async (_, { id }, { repositories }) => {
            return await repositories.boletinRepository.findById(id);
        },
        boletinesPorEstudiante: async (_, { estudianteId }, { user, repositories }) => {
            if (user.role === 'student' && user.id !== estudianteId) {
                throw new Error('Solo puedes ver tus propios boletines');
            }
            return await repositories.boletinRepository.findByEstudianteId(estudianteId);
        },
        matriculas: async (_, __, { repositories }) => {
            return await repositories.matriculaRepository.findAll();
        },
        matricula: async (_, { id }, { repositories }) => {
            return await repositories.matriculaRepository.findById(id);
        },
        matriculasPorEstudiante: async (_, { estudianteId }, { repositories }) => {
            return await repositories.matriculaRepository.findByEstudianteId(estudianteId);
        },
        asignaturas: async (_, __, { repositories }) => {
            return await repositories.asignaturaRepository.findAll();
        },
        asignatura: async (_, { id }, { repositories }) => {
            return await repositories.asignaturaRepository.findById(id);
        },
    },
    Mutation: {
        login: async (_, { email, password }) => {
            try {
                const result = await authService.login(email, password);
                return {
                    token: result.token,
                    user: {
                        id: result.user._id,
                        email: result.user.email,
                        role: result.user.role
                    }
                };
            }
            catch (error) {
                throw new Error(error.message || 'Error al iniciar sesión');
            }
        },
        crearEstudiante: async (_, { input }, { repositories }) => {
            try {
                console.log("Input recibido en crearEstudiante:", JSON.stringify(input, null, 2));
                // Validaciones iniciales
                if (!input) {
                    throw new Error('No se recibieron datos del estudiante');
                }
                const cedula = input.cedula ? String(input.cedula).trim() : '';
                if (!cedula) {
                    throw new Error('La cédula es obligatoria');
                }
                const nombre = input.nombre ? String(input.nombre).trim() : '';
                const primerApellido = input.primerApellido ? String(input.primerApellido).trim() : '';
                const segundoApellido = input.segundoApellido ? String(input.segundoApellido).trim() : '';
                const email = input.email ? String(input.email).trim() : '';
                if (!nombre || !primerApellido || !segundoApellido || !email) {
                    throw new Error('Nombre, apellido y email son campos obligatorios');
                }
                // Verificar si ya existe un estudiante con esta cédula
                const estudianteExistente = await repositories.estudianteRepository.findByCedula(cedula);
                if (estudianteExistente) {
                    throw new Error(`Ya existe un estudiante con la cédula ${cedula}`);
                }
                // Crear el estudiante con datos normalizados
                const estudiante = await repositories.estudianteRepository.create({
                    cedula,
                    nombre,
                    primerApellido,
                    segundoApellido,
                    email,
                    telefono: input.telefono ? String(input.telefono).trim() : '',
                    direccion: input.direccion ? String(input.direccion).trim() : '',
                    acudiente: input.acudiente ? String(input.acudiente).trim() : ''
                });
                console.log("Estudiante creado exitosamente:", estudiante);
                return estudiante;
            }
            catch (error) {
                console.error("Error al crear estudiante:", error);
                throw new Error(error.message || 'Error al crear estudiante');
            }
        },
        actualizarEstudiante: async (_, { id, input }, { repositories }) => {
            try {
                // Validaciones previas
                if (!input.cedula || !input.nombre || !input.primerApellido || !input.segundoApellido || !input.email) {
                    throw new Error('Todos los campos obligatorios deben ser proporcionados');
                }
                // Actualizar estudiante
                const estudianteActualizado = await repositories.estudianteRepository.update(id, input);
                if (!estudianteActualizado) {
                    throw new Error(`No se pudo actualizar el estudiante con la cédula ${id}`);
                }
                return estudianteActualizado;
            }
            catch (error) {
                console.error('Error al actualizar estudiante:', error);
                throw new Error(error.message || 'Error al actualizar estudiante');
            }
        },
        eliminarEstudiante: async (_, { id }, { repositories }) => {
            try {
                const result = await repositories.estudianteRepository.delete(id);
                if (!result) {
                    throw new Error(`No se pudo eliminar el estudiante con la cédula ${id}`);
                }
                return result;
            }
            catch (error) {
                console.error('Error al eliminar estudiante:', error);
                throw new Error(error.message || 'Error al eliminar estudiante');
            }
        },
        crearProfesor: async (_, { input }, { repositories }) => {
            try {
                // Validaciones previas
                if (!input.cedula || !input.nombre || !input.primerApellido || !input.email) {
                    throw new Error('Todos los campos obligatorios deben ser proporcionados');
                }
                // Verificar si ya existe un profesor con esta cédula
                const profesorExistente = await repositories.profesorRepository.findByCedula(input.cedula);
                if (profesorExistente) {
                    throw new Error(`Ya existe un profesor con la cédula ${input.cedula}`);
                }
                // Verificar si ya existe un profesor con este email
                const profesores = await repositories.profesorRepository.findAll();
                const emailExistente = profesores.some((p) => p.email && p.email.toLowerCase() === input.email.toLowerCase());
                if (emailExistente) {
                    throw new Error(`Ya existe un profesor con el email ${input.email}`);
                }
                // Crear el profesor usando la cédula como ID
                const profesor = await repositories.profesorRepository.create({
                    _id: input.cedula, // Usar la cédula como _id de MongoDB
                    cedula: input.cedula,
                    nombre: input.nombre,
                    primerApellido: input.primerApellido,
                    segundoApellido: input.segundoApellido || '',
                    email: input.email,
                    telefono: input.telefono || '',
                    direccion: input.direccion || ''
                });
                console.log('Profesor creado exitosamente:', profesor);
                return profesor;
            }
            catch (error) {
                console.error('Error al crear profesor:', error);
                throw new Error(error.message || 'Error al crear profesor');
            }
        },
        actualizarProfesor: async (_, { id, input }, { repositories }) => {
            try {
                const profesorActualizado = await repositories.profesorRepository.update(id, input);
                if (!profesorActualizado) {
                    throw new Error(`No se pudo actualizar el profesor con la cédula ${id}`);
                }
                return profesorActualizado;
            }
            catch (error) {
                console.error('Error al actualizar profesor:', error);
                throw new Error(error.message || 'Error al actualizar profesor');
            }
        },
        eliminarProfesor: async (_, { id }, { repositories }) => {
            try {
                const result = await repositories.profesorRepository.delete(id);
                if (!result) {
                    throw new Error(`No se pudo eliminar el profesor con la cédula ${id}`);
                }
                return result;
            }
            catch (error) {
                console.error('Error al eliminar profesor:', error);
                throw new Error(error.message || 'Error al eliminar profesor');
            }
        },
        crearCurso: async (_, { input }, { repositories }) => {
            // Opcionalmente, verificar si ya existe un curso con este ID
            const existingCurso = await repositories.cursoRepository.findById(input.id);
            if (existingCurso) {
                throw new Error(`Ya existe un curso con el ID ${input.id}`);
            }
            // Crear el curso con el ID proporcionado
            return await repositories.cursoRepository.create({
                _id: input.id, // Asegúrate de mapear el id del input al campo _id que espera MongoDB
                nombre: input.nombre,
                duracion: input.duracion,
                cantidadMax: input.cantidadMax,
                profesorId: input.profesorId
            });
        },
        actualizarCurso: async (_, { id, input }, { repositories }) => {
            return await repositories.cursoRepository.update(id, input);
        },
        eliminarCurso: async (_, { id }, { repositories }) => {
            const result = await repositories.cursoRepository.delete(id);
            return result ? true : false;
        },
        crearCalificacion: async (_, { input }, { repositories }) => {
            try {
                // Buscar el estudiante por cédula y obtener su ObjectId
                const estudiante = await repositories.estudianteRepository.findByCedula(input.estudianteId);
                if (!estudiante) {
                    throw new Error(`No se encontró estudiante con cédula: ${input.estudianteId}`);
                }
                
                // Buscar el curso por código y obtener su ObjectId
                const curso = await repositories.cursoRepository.findById(input.cursoId);
                if (!curso) {
                    throw new Error(`No se encontró curso con código: ${input.cursoId}`);
                }
                
                // Crear calificación con los ObjectId correctos
                return await repositories.calificacionRepository.create({
                    ...input,
                    estudianteId: estudiante._id, // Usar el ObjectId del estudiante
                    cursoId: curso._id // Usar el ObjectId del curso
                });
            } catch (error) {
                console.error("Error al crear calificación:", error);
                throw error;
            }
        },
        actualizarCalificacion: async (_, { id, input }, { repositories }) => {
            return await repositories.calificacionRepository.update(id, input);
        },
        eliminarCalificacion: async (_, { id }, { repositories }) => {
            const result = await repositories.calificacionRepository.delete(id);
            return result ? true : false;
        },
        generarBoletin: async (_, { input }, { repositories }) => {
            const { estudianteId, cursoId, periodo, fecha, calificaciones, observaciones } = input;
            const sumaNotas = calificaciones.reduce((acc, calificacion) => acc + calificacion.nota, 0);
            const promedio = sumaNotas / calificaciones.length;
            return await repositories.boletinRepository.create({
                estudianteId,
                cursoId,
                periodo,
                fecha,
                calificaciones,
                promedio,
                observaciones,
            });
        },
        actualizarBoletin: async (_, { id, input }, { repositories }) => {
            const sumaNotas = input.calificaciones.reduce((acc, calificacion) => acc + calificacion.nota, 0);
            const promedio = sumaNotas / input.calificaciones.length;
            return await repositories.boletinRepository.update(id, {
                ...input,
                promedio,
            });
        },
        eliminarBoletin: async (_, { id }, { repositories }) => {
            const result = await repositories.boletinRepository.delete(id);
            return result ? true : false;
        },
        crearMatricula: async (_, { input }, { repositories }) => {
            return await repositories.matriculaRepository.create(input);
        },
        actualizarMatricula: async (_, { id, input }, { repositories }) => {
            return await repositories.matriculaRepository.update(id, input);
        },
        actualizarEstadoMatricula: async (_, { id, estado }, { repositories }) => {
            return await repositories.matriculaRepository.updateEstado(id, estado);
        },
        eliminarMatricula: async (_, { id }, { repositories }) => {
            return await repositories.matriculaRepository.delete(id);
        },
        crearAsignatura: async (_, { input }, { repositories }) => {
            try {
                // Verificar profesor
                const profesor = await repositories.profesorRepository.findById(input.profesorId);
                if (!profesor) {
                    throw new Error(`No se encontró un profesor con el ID ${input.profesorId}`);
                }
                console.log('Profesor encontrado:', profesor);
                // Verificar curso
                const curso = await repositories.cursoRepository.findById(input.cursoId);
                if (!curso) {
                    throw new Error(`No se encontró un curso con el ID ${input.cursoId}`);
                }
                console.log('Curso encontrado:', curso);
                // Crear objeto de asignatura con todos los datos validados
                const asignaturaData = {
                    nombre: input.nombre,
                    horario: input.horario,
                    profesorId: profesor.cedula, // Usar cédula en vez de ObjectId
                    cursoId: curso.id
                };
                console.log('Intentando crear asignatura con datos:', asignaturaData);
                // Crear la asignatura
                const asignatura = await repositories.asignaturaRepository.create(asignaturaData);
                if (!asignatura) {
                    throw new Error('No se pudo crear la asignatura');
                }
                console.log('Asignatura creada exitosamente:', asignatura);
                return asignatura;
            }
            catch (error) {
                console.error('Error completo al crear asignatura:', error);
                console.error('Stack trace:', error.stack);
                throw new Error(`Error al crear asignatura: ${error.message}`);
            }
        },
        actualizarAsignatura: async (_, { id, input }, { repositories }) => {
            return await repositories.asignaturaRepository.update(id, input);
        },
        eliminarAsignatura: async (_, { id }, { repositories }) => {
            const result = await repositories.asignaturaRepository.delete(id);
            return result ? true : false;
        },
        crearAdmin: async (_, { email, password }) => {
            try {
                const result = await authService.register(email, password, 'admin');
                return {
                    token: result.token,
                    user: {
                        id: result.user._id,
                        email: result.user.email,
                        role: result.user.role
                    }
                };
            }
            catch (error) {
                throw new Error(error.message || 'Error al crear administrador');
            }
        },
    },
    User: {
        id: (user) => user._id || user.id,
    },
    AuthPayload: {
        user: (payload) => payload.user,
        token: (payload) => payload.token,
    },
    // En resolvers.ts, reemplaza la definición de Asignatura.estudiante con lo siguiente:
    Asignatura: {
        profesor: async (asignatura, _, { repositories }) => {
            if (!asignatura.profesorId)
                return null;
            return await repositories.profesorRepository.findById(asignatura.profesorId);
        },
        curso: async (asignatura, _, { repositories }) => {
            if (!asignatura.cursoId)
                return null;
            return await repositories.cursoRepository.findById(asignatura.cursoId);
        },
    },
    Estudiante: {
        id: (estudiante) => estudiante._id?.toString() || estudiante.id,
        empleado: async (estudiante, _, { repositories }) => {
            return await repositories.empleadoRepository.findById(estudiante.empleadoId);
        },
        matriculas: async (estudiante, _, { repositories }) => {
            return await repositories.matriculaRepository.findByEstudianteId(estudiante.id);
        },
    },
    Profesor: {
        id: (profesor) => profesor.cedula, // Asegurar que siempre usemos la cédula como ID
        empleado: async (profesor) => {
            return await EmpleadoModel.findById(profesor.empleadoId);
        },
    },
    Curso: {
        id: (curso) => curso._id?.toString() || curso.id,
        profesor: async (curso, _, { repositories }) => {
            if (!curso.profesorId)
                return null;
            return await repositories.profesorRepository.findById(curso.profesorId);
        },
    },
    Matricula: {
        estudiante: async (matricula, _, { repositories }) => {
            if (!matricula.estudianteId)
                return null;
            // Si es un ObjectId, convertirlo a cédula primero
            if (typeof matricula.estudianteId === 'object') {
                try {
                    let idHex;
                    if (matricula.estudianteId.buffer) {
                        idHex = matricula.estudianteId.buffer.toString('hex');
                    }
                    else if (matricula.estudianteId.toString) {
                        idHex = matricula.estudianteId.toString();
                    }
                    if (idHex && mongoose.Types.ObjectId.isValid(idHex)) {
                        const estudianteObj = await EstudianteModel.findById(idHex);
                        if (estudianteObj) {
                            return await repositories.estudianteRepository.findByCedula(estudianteObj.cedula);
                        }
                    }
                }
                catch (e) {
                    console.error("Error al procesar estudianteId en Matricula:", e);
                }
            }
            return await repositories.estudianteRepository.findByCedula(matricula.estudianteId);
        },
        curso: async (matricula, _, { repositories }) => {
            return await repositories.cursoRepository.findById(matricula.cursoId);
        },
        asignaturas: async (matricula, _, { repositories }) => {
            return await repositories.asignaturaRepository.findByIds(matricula.asignaturas);
        },
    },
    Boletin: {
        estudiante: async (boletin, _, { repositories }) => {
            if (!boletin.estudianteId)
                return null;
            // Si es un ObjectId, convertirlo a cédula primero
            if (typeof boletin.estudianteId === 'object') {
                try {
                    let idHex;
                    if (boletin.estudianteId.buffer) {
                        idHex = boletin.estudianteId.buffer.toString('hex');
                    }
                    else if (boletin.estudianteId.toString) {
                        idHex = boletin.estudianteId.toString();
                    }
                    if (idHex && mongoose.Types.ObjectId.isValid(idHex)) {
                        const estudianteObj = await EstudianteModel.findById(idHex);
                        if (estudianteObj) {
                            return await repositories.estudianteRepository.findByCedula(estudianteObj.cedula);
                        }
                    }
                }
                catch (e) {
                    console.error("Error al procesar estudianteId en Boletin:", e);
                }
            }
            return await repositories.estudianteRepository.findByCedula(boletin.estudianteId);
        },
        curso: async (boletin, _, { repositories }) => {
            return await repositories.cursoRepository.findById(boletin.cursoId);
        },
    },
};
//# sourceMappingURL=resolvers.js.map