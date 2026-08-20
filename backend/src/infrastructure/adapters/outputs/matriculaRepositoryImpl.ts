import { MatriculaRepository } from './../../../core/ports/MatriculaRepository';
import { Matricula, CrearMatriculaInput, ActualizarMatriculaInput } from '../../../core/domain/matricula';
import { MatriculaModel } from './models/MatriculaModel';
import { EstudianteModel } from './models/EstudianteModel';
import mongoose from 'mongoose';

export class MatriculaRepositoryImpl implements MatriculaRepository {
    // Esta función solo está como placeholder porque está en la interfaz
    // Debe ser implementada en AsignaturaRepositoryImpl, no aquí
    async findByIds(ids: string[]): Promise<Matricula[]> {
        try {
            const matriculas = await MatriculaModel.find({ 
                _id: { $in: ids } 
            })
            .populate({
                path: 'estudianteId',
                select: 'cedula nombre primerApellido segundoApellido'
            })
            .populate({
                path: 'cursoId',
                select: 'nombre'
            })
            .populate({
                path: 'asignaturas',
                select: 'nombre horario'
            });

            return matriculas.map(doc => this.mapToEntity(doc));
        } catch (error) {
            console.error('Error al obtener matrículas por IDs:', error);
            throw new Error('Error al obtener matrículas por IDs');
        }
    }

    async findAll(): Promise<Matricula[]> {
        try {
            const matriculas = await MatriculaModel.find()
                .populate({
                    path: 'estudianteId',
                    select: 'cedula nombre primerApellido segundoApellido'
                })
                .populate({
                    path: 'cursoId',
                    select: 'nombre'
                })
                .populate({
                    path: 'asignaturas',
                    select: 'nombre horario'
                });

            return matriculas.map(doc => this.mapToEntity(doc));
        } catch (error) {
            console.error('Error al obtener todas las matrículas:', error);
            throw new Error('Error al obtener todas las matrículas');
        }
    }

    async findById(id: string): Promise<Matricula | null> {
        try {
            const matricula = await MatriculaModel.findById(id)
                .populate({
                    path: 'estudianteId',
                    select: 'cedula nombre primerApellido segundoApellido'
                })
                .populate({
                    path: 'cursoId',
                    select: 'nombre'
                })
                .populate({
                    path: 'asignaturas',
                    select: 'nombre horario'
                });

            return matricula ? this.mapToEntity(matricula) : null;
        } catch (error) {
            console.error(`Error al obtener la matrícula con ID ${id}:`, error);
            throw new Error(`Error al obtener la matrícula con ID ${id}`);
        }
    }
    
    async findByEstudianteId(estudianteId: string): Promise<Matricula[]> {
        try {
            console.log(`Buscando estudiante por cédula: ${estudianteId}`);
            
            // Buscar directamente usando la cédula como estudianteId
            let matriculas = await MatriculaModel.find({
                estudianteId: estudianteId // Usar directamente la cédula
            })
            .populate({
                path: 'estudianteId',
                select: 'cedula nombre primerApellido segundoApellido'
            })
            .populate({
                path: 'cursoId',
                select: 'nombre'
            })
            .populate({
                path: 'asignaturas',
                select: 'nombre horario'
            });

            console.log(`Matrículas encontradas: ${matriculas.length}`);
            return matriculas.map(doc => this.mapToEntity(doc));
        } catch (error) {
            console.error(`Error al obtener matrículas del estudiante ${estudianteId}:`, error);
            throw new Error(`Error al obtener las matrículas del estudiante con ID ${estudianteId}`);
        }
    }
    async findByAsignaturaId(asignaturaId: string): Promise<Matricula[]> {
        const documents = await MatriculaModel.find({ asignaturas: asignaturaId }).populate('estudiante').exec();
        return documents.map(doc => this.mapToEntity(doc));
    }
    
    async create(input: CrearMatriculaInput): Promise<Matricula> {
        try {
            // 1. Buscar el estudiante para verificar que existe
            console.log(`Buscando estudiante con cédula: ${input.estudianteId}`);
            const estudiante = await EstudianteModel.findOne({ cedula: input.estudianteId });
            if (!estudiante) {
                throw new Error(`No se encontró estudiante con cédula ${input.estudianteId}`);
            }
            
            // 2. Verificar matrícula existente
            const matriculaExistente = await MatriculaModel.findOne({
                estudianteId: input.estudianteId, // Usar directamente la cédula
                cursoId: input.cursoId,
                estado: 'ACTIVA',
                periodo: input.periodo
            });

            if (matriculaExistente) {
                throw new Error(`El estudiante ya tiene una matrícula activa en este curso para el periodo ${input.periodo}`);
            }

            // 3. Verificar que las asignaturas existan
            if (input.asignaturas && input.asignaturas.length > 0) {
                console.log(`Verificando ${input.asignaturas.length} asignaturas`);
                const asignaturasValidas = await mongoose.model('Asignatura').find({
                    _id: { $in: input.asignaturas },
                    cursoId: input.cursoId
                });

                if (asignaturasValidas.length !== input.asignaturas.length) {
                    throw new Error('Una o más asignaturas no son válidas para este curso');
                }
                console.log(`Todas las asignaturas son válidas`);
            }

            // 4. Crear y guardar la matrícula
            const matricula = new MatriculaModel({
                estudianteId: input.estudianteId, // Usar directamente la cédula
                cursoId: input.cursoId,
                asignaturas: input.asignaturas,
                estado: input.estado || 'ACTIVA',
                periodo: input.periodo,
                fechaMatricula: new Date()
            });

            console.log(`Guardando matrícula`);
            const saved = await matricula.save();

            // 5. Poblar los datos relacionados
            const populated = await MatriculaModel.findById(saved._id)
                .populate({
                    path: 'estudianteId',
                    select: 'cedula nombre primerApellido segundoApellido email'
                })
                .populate({
                    path: 'cursoId',
                    select: 'nombre'
                })
                .populate({
                    path: 'asignaturas',
                    select: 'nombre horario'
                });

            if (!populated) {
                throw new Error('Error al crear la matrícula: no se pudo recuperar la información completa');
            }

            console.log(`Matrícula creada exitosamente: ${populated._id}`);
            return this.mapToEntity(populated);
        } catch (error: any) {
            console.error('Error al crear matrícula:', error);
            throw new Error(`Error al crear la matrícula: ${error.message}`);
        }
    }

    async update(id: string, matricula: ActualizarMatriculaInput): Promise<Matricula> {
        try {
            // Verificar que la matrícula existe
            const exists = await MatriculaModel.findById(id);
            if (!exists) {
                throw new Error(`No se encontró matrícula con ID ${id}`);
            }

            // Si se está actualizando el estudiante, verificar que existe
            if (matricula.estudianteId) {
                const estudiante = await EstudianteModel.findOne({ cedula: matricula.estudianteId });
                if (!estudiante) {
                    throw new Error(`No se encontró estudiante con cédula ${matricula.estudianteId}`);
                }
                // Usar la cédula como estudianteId
                matricula.estudianteId = estudiante.cedula;
            }

            // Actualizar y obtener el resultado actualizado
            const matriculaActualizada = await MatriculaModel.findByIdAndUpdate(
                id,
                { ...matricula },
                { new: true }
            )
            .populate({
                path: 'estudianteId',
                select: 'cedula nombre primerApellido segundoApellido email'
            })
            .populate({
                path: 'cursoId',
                select: 'nombre'
            })
            .populate({
                path: 'asignaturas',
                select: 'nombre horario'
            });

            if (!matriculaActualizada) {
                throw new Error(`Matrícula con ID ${id} no encontrada`);
            }

            return this.mapToEntity(matriculaActualizada);
        } catch (error: any) {
            console.error(`Error al actualizar la matrícula con ID ${id}:`, error);
            throw new Error(`Error al actualizar la matrícula con ID ${id}: ${error.message}`);
        }
    }

    async updateEstado(id: string, estado: 'ACTIVA' | 'CANCELADA' | 'FINALIZADA' | 'SIN_PAGAR'): Promise<Matricula> {
        try {
            console.log(`Actualizando estado de matrícula ${id} a ${estado}`);
            const matriculaActualizada = await MatriculaModel.findByIdAndUpdate(
                id,
                { estado },
                { new: true }
            )
            .populate({
                path: 'estudianteId',
                select: 'cedula nombre primerApellido segundoApellido email'
            })
            .populate({
                path: 'cursoId',
                select: 'nombre'
            })
            .populate({
                path: 'asignaturas',
                select: 'nombre horario'
            });

            if (!matriculaActualizada) {
                throw new Error(`Matrícula con ID ${id} no encontrada`);
            }

            console.log(`Estado de matrícula actualizado correctamente`);
            return this.mapToEntity(matriculaActualizada);
        } catch (error: any) {
            console.error(`Error al actualizar estado de matrícula ${id}:`, error);
            throw new Error(`Error al actualizar el estado de la matrícula con ID ${id}: ${error.message}`);
        }
    }

    async delete(id: string): Promise<boolean> {
        try {
            console.log(`Eliminando matrícula con ID ${id}`);
            const result = await MatriculaModel.findByIdAndDelete(id);
            console.log(result ? 'Matrícula eliminada correctamente' : 'No se encontró la matrícula');
            return !!result;
        } catch (error: any) {
            console.error(`Error al eliminar la matrícula con ID ${id}:`, error);
            throw new Error(`Error al eliminar la matrícula con ID ${id}: ${error.message}`);
        }
    }

    private mapToEntity(doc: any): Matricula {
        try {
            return new Matricula(
                doc._id.toString(),
                doc.estudianteId ? (doc.estudianteId.cedula || (typeof doc.estudianteId === 'string' ? doc.estudianteId : doc.estudianteId._id.toString())) : '',
                doc.cursoId ? (typeof doc.cursoId === 'string' ? doc.cursoId : doc.cursoId._id.toString()) : '',
                doc.asignaturas?.map((asig: any) => asig._id ? asig._id.toString() : String(asig)) || [],
                doc.estado,
                doc.periodo,
                doc.fechaMatricula ? new Date(doc.fechaMatricula) : new Date()
            );
        } catch (error) {
            console.error('Error al mapear entidad Matricula:', error, 'Documento:', doc);
            throw new Error(`Error al mapear entidad Matricula`);
        }
    }
}
