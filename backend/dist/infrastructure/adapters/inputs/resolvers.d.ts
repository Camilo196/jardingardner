import { Matricula } from '../../../core/domain/matricula.js';
import mongoose from 'mongoose';
import { Asignatura } from '@core/domain/asignatura.js';
export declare const resolvers: {
    Query: {
        me: (_: any, __: any, { user, repositories }: any) => Promise<any>;
        estudiantes: (_: any, __: any, { repositories }: any) => Promise<any>;
        estudiante: (_: any, { id }: any, { repositories }: any) => Promise<any>;
        estudiantesPorIds: (_: any, { ids }: {
            ids: string[];
        }, { repositories }: any) => Promise<any>;
        profesores: (_: any, __: any, { repositories }: any) => Promise<any>;
        profesor: (_: any, { id }: any, { repositories }: any) => Promise<any>;
        cursos: (_: any, __: any, { repositories }: any) => Promise<any>;
        curso: (_: any, { id }: any, { repositories }: any) => Promise<any>;
        calificaciones: (_: any, __: any, { repositories }: any) => Promise<any>;
        calificacion: (_: any, { id }: any, { repositories }: any) => Promise<any>;
        calificacionesPorEstudiante: (_: any, { estudianteId }: any, { repositories }: any) => Promise<any>;
        calificacionesPorCurso: (_: any, { cursoId }: any, { repositories }: any) => Promise<any>;
        calificacionesPorAsignaturaYPeriodo: (_: any, { asignaturaId, periodo }: {
            asignaturaId: string;
            periodo: string;
        }, { repositories }: any) => Promise<any>;
        indicadoresPorAsignatura: (_: any, { asignaturaId, periodo }: any) => Promise<(mongoose.FlattenMaps<import("../outputs/models/Indicadoresmodel.js").IndicadoresDocument> & Required<{
            _id: mongoose.FlattenMaps<unknown>;
        }> & {
            __v: number;
        }) | null>;
        indicadoresPorProfesor: (_: any, { profesorId, periodo }: any, { repositories }: any) => Promise<(mongoose.FlattenMaps<import("../outputs/models/Indicadoresmodel.js").IndicadoresDocument> & Required<{
            _id: mongoose.FlattenMaps<unknown>;
        }> & {
            __v: number;
        })[]>;
        periodoConfig: (_: any, { anio, numeroPeriodo }: any) => Promise<{
            id: any;
            pesoPorCorte: number;
            anio: number;
            numeroPeriodo: number;
            numCortes: number;
            abierto: boolean;
            fechaApertura?: Date | undefined;
            fechaCierre?: Date | undefined;
            _id: mongoose.FlattenMaps<unknown>;
            $assertPopulated: <Paths = {}>(path: string | string[], values?: Partial<Paths> | undefined) => Omit<import("../outputs/models/PeriodoConfigModel.js").PeriodoConfigDocument, keyof Paths> & Paths;
            $clearModifiedPaths: () => import("../outputs/models/PeriodoConfigModel.js").PeriodoConfigDocument;
            $clone: () => import("../outputs/models/PeriodoConfigModel.js").PeriodoConfigDocument;
            $createModifiedPathsSnapshot: () => mongoose.ModifiedPathsSnapshot;
            $getAllSubdocs: () => mongoose.Document[];
            $ignore: (path: string) => void;
            $isDefault: (path: string) => boolean;
            $isDeleted: (val?: boolean) => boolean;
            $getPopulatedDocs: () => mongoose.Document[];
            $inc: (path: string | string[], val?: number) => import("../outputs/models/PeriodoConfigModel.js").PeriodoConfigDocument;
            $isEmpty: (path: string) => boolean;
            $isValid: (path: string) => boolean;
            $locals: mongoose.FlattenMaps<Record<string, unknown>>;
            $markValid: (path: string) => void;
            $model: {
                <ModelType = mongoose.Model<unknown, {}, {}, {}, mongoose.Document<unknown, {}, unknown> & {
                    _id: mongoose.Types.ObjectId;
                } & {
                    __v: number;
                }, any>>(name: string): ModelType;
                <ModelType = mongoose.Model<any, {}, {}, {}, any, any>>(): ModelType;
            };
            $op: "save" | "validate" | "remove" | null;
            $restoreModifiedPathsSnapshot: (snapshot: mongoose.ModifiedPathsSnapshot) => import("../outputs/models/PeriodoConfigModel.js").PeriodoConfigDocument;
            $session: (session?: mongoose.ClientSession | null) => mongoose.ClientSession | null;
            $set: {
                (path: string | Record<string, any>, val: any, type: any, options?: mongoose.DocumentSetOptions): import("../outputs/models/PeriodoConfigModel.js").PeriodoConfigDocument;
                (path: string | Record<string, any>, val: any, options?: mongoose.DocumentSetOptions): import("../outputs/models/PeriodoConfigModel.js").PeriodoConfigDocument;
                (value: string | Record<string, any>): import("../outputs/models/PeriodoConfigModel.js").PeriodoConfigDocument;
            };
            $where: mongoose.FlattenMaps<Record<string, unknown>>;
            baseModelName?: string | undefined;
            collection: mongoose.Collection;
            db: mongoose.FlattenMaps<mongoose.Connection>;
            deleteOne: (options?: mongoose.QueryOptions) => any;
            depopulate: <Paths = {}>(path?: string | string[]) => mongoose.MergeType<import("../outputs/models/PeriodoConfigModel.js").PeriodoConfigDocument, Paths>;
            directModifiedPaths: () => Array<string>;
            equals: (doc: mongoose.Document<unknown, any, any>) => boolean;
            errors?: mongoose.Error.ValidationError | undefined;
            get: {
                <T extends string | number | symbol>(path: T, type?: any, options?: any): any;
                (path: string, type?: any, options?: any): any;
            };
            getChanges: () => mongoose.UpdateQuery<import("../outputs/models/PeriodoConfigModel.js").PeriodoConfigDocument>;
            increment: () => import("../outputs/models/PeriodoConfigModel.js").PeriodoConfigDocument;
            init: (obj: mongoose.AnyObject, opts?: mongoose.AnyObject) => import("../outputs/models/PeriodoConfigModel.js").PeriodoConfigDocument;
            invalidate: {
                <T extends string | number | symbol>(path: T, errorMsg: string | NativeError, value?: any, kind?: string): NativeError | null;
                (path: string, errorMsg: string | NativeError, value?: any, kind?: string): NativeError | null;
            };
            isDirectModified: {
                <T extends string | number | symbol>(path: T | T[]): boolean;
                (path: string | Array<string>): boolean;
            };
            isDirectSelected: {
                <T extends string | number | symbol>(path: T): boolean;
                (path: string): boolean;
            };
            isInit: {
                <T extends string | number | symbol>(path: T): boolean;
                (path: string): boolean;
            };
            isModified: {
                <T extends string | number | symbol>(path?: T | T[] | undefined, options?: {
                    ignoreAtomics?: boolean;
                } | null): boolean;
                (path?: string | Array<string>, options?: {
                    ignoreAtomics?: boolean;
                } | null): boolean;
            };
            isNew: boolean;
            isSelected: {
                <T extends string | number | symbol>(path: T): boolean;
                (path: string): boolean;
            };
            markModified: {
                <T extends string | number | symbol>(path: T, scope?: any): void;
                (path: string, scope?: any): void;
            };
            model: {
                <ModelType = mongoose.Model<unknown, {}, {}, {}, mongoose.Document<unknown, {}, unknown> & {
                    _id: mongoose.Types.ObjectId;
                } & {
                    __v: number;
                }, any>>(name: string): ModelType;
                <ModelType = mongoose.Model<any, {}, {}, {}, any, any>>(): ModelType;
            };
            modifiedPaths: (options?: {
                includeChildren?: boolean;
            }) => Array<string>;
            overwrite: (obj: mongoose.AnyObject) => import("../outputs/models/PeriodoConfigModel.js").PeriodoConfigDocument;
            $parent: () => mongoose.Document | undefined;
            populate: {
                <Paths = {}>(path: string | mongoose.PopulateOptions | (string | mongoose.PopulateOptions)[]): Promise<mongoose.MergeType<import("../outputs/models/PeriodoConfigModel.js").PeriodoConfigDocument, Paths>>;
                <Paths = {}>(path: string, select?: string | mongoose.AnyObject, model?: mongoose.Model<any>, match?: mongoose.AnyObject, options?: mongoose.PopulateOptions): Promise<mongoose.MergeType<import("../outputs/models/PeriodoConfigModel.js").PeriodoConfigDocument, Paths>>;
            };
            populated: (path: string) => any;
            replaceOne: (replacement?: mongoose.AnyObject, options?: mongoose.QueryOptions | null) => mongoose.Query<any, import("../outputs/models/PeriodoConfigModel.js").PeriodoConfigDocument, {}, unknown, "find", Record<string, never>>;
            save: (options?: mongoose.SaveOptions) => Promise<import("../outputs/models/PeriodoConfigModel.js").PeriodoConfigDocument>;
            schema: mongoose.FlattenMaps<mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, {
                [x: string]: unknown;
            }, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
                [x: string]: unknown;
            }>> & mongoose.FlatRecord<{
                [x: string]: unknown;
            }> & Required<{
                _id: unknown;
            }> & {
                __v: number;
            }>>;
            set: {
                <T extends string | number | symbol>(path: T, val: any, type: any, options?: mongoose.DocumentSetOptions): import("../outputs/models/PeriodoConfigModel.js").PeriodoConfigDocument;
                (path: string | Record<string, any>, val: any, type: any, options?: mongoose.DocumentSetOptions): import("../outputs/models/PeriodoConfigModel.js").PeriodoConfigDocument;
                (path: string | Record<string, any>, val: any, options?: mongoose.DocumentSetOptions): import("../outputs/models/PeriodoConfigModel.js").PeriodoConfigDocument;
                (value: string | Record<string, any>): import("../outputs/models/PeriodoConfigModel.js").PeriodoConfigDocument;
            };
            toJSON: {
                (options?: mongoose.ToObjectOptions & {
                    flattenMaps?: true;
                    flattenObjectIds?: false;
                }): mongoose.FlattenMaps<any>;
                (options: mongoose.ToObjectOptions & {
                    flattenObjectIds: false;
                }): mongoose.FlattenMaps<any>;
                (options: mongoose.ToObjectOptions & {
                    flattenObjectIds: true;
                }): {
                    [x: string]: any;
                };
                (options: mongoose.ToObjectOptions & {
                    flattenMaps: false;
                }): any;
                (options: mongoose.ToObjectOptions & {
                    flattenMaps: false;
                    flattenObjectIds: true;
                }): any;
                <T = any>(options?: mongoose.ToObjectOptions & {
                    flattenMaps?: true;
                    flattenObjectIds?: false;
                }): mongoose.FlattenMaps<T>;
                <T = any>(options: mongoose.ToObjectOptions & {
                    flattenObjectIds: false;
                }): mongoose.FlattenMaps<T>;
                <T = any>(options: mongoose.ToObjectOptions & {
                    flattenObjectIds: true;
                }): mongoose.ObjectIdToString<mongoose.FlattenMaps<T>>;
                <T = any>(options: mongoose.ToObjectOptions & {
                    flattenMaps: false;
                }): T;
                <T = any>(options: mongoose.ToObjectOptions & {
                    flattenMaps: false;
                    flattenObjectIds: true;
                }): mongoose.ObjectIdToString<T>;
            };
            toObject: {
                (options?: mongoose.ToObjectOptions): any;
                <T>(options?: mongoose.ToObjectOptions): mongoose.Default__v<mongoose.Require_id<T>>;
            };
            unmarkModified: {
                <T extends string | number | symbol>(path: T): void;
                (path: string): void;
            };
            updateOne: (update?: mongoose.UpdateWithAggregationPipeline | mongoose.UpdateQuery<import("../outputs/models/PeriodoConfigModel.js").PeriodoConfigDocument> | undefined, options?: mongoose.QueryOptions | null) => mongoose.Query<any, import("../outputs/models/PeriodoConfigModel.js").PeriodoConfigDocument, {}, unknown, "find", Record<string, never>>;
            validate: {
                <T extends string | number | symbol>(pathsToValidate?: T | T[] | undefined, options?: mongoose.AnyObject): Promise<void>;
                (pathsToValidate?: mongoose.pathsToValidate, options?: mongoose.AnyObject): Promise<void>;
                (options: {
                    pathsToSkip?: mongoose.pathsToSkip;
                }): Promise<void>;
            };
            validateSync: {
                (options: {
                    pathsToSkip?: mongoose.pathsToSkip;
                    [k: string]: any;
                }): mongoose.Error.ValidationError | null;
                <T extends string | number | symbol>(pathsToValidate?: T | T[] | undefined, options?: mongoose.AnyObject): mongoose.Error.ValidationError | null;
                (pathsToValidate?: mongoose.pathsToValidate, options?: mongoose.AnyObject): mongoose.Error.ValidationError | null;
            };
            __v: number;
        } | null>;
        periodosConfig: (_: any, { anio }: any) => Promise<any[]>;
        comportamientosPorAsignatura: (_: any, { asignaturaId, periodo }: any) => Promise<(mongoose.FlattenMaps<import("../outputs/models/ComportamientoModel.js").ComportamientoDocument> & Required<{
            _id: mongoose.FlattenMaps<unknown>;
        }> & {
            __v: number;
        })[]>;
        comportamientoEstudiante: (_: any, { estudianteId, asignaturaId, periodo }: any) => Promise<(mongoose.FlattenMaps<import("../outputs/models/ComportamientoModel.js").ComportamientoDocument> & Required<{
            _id: mongoose.FlattenMaps<unknown>;
        }> & {
            __v: number;
        }) | null>;
        cronograma: (_: any, { anio }: any) => Promise<any[]>;
        cronogramaPorCurso: (_: any, { cursoId, anio }: any) => Promise<any[]>;
        boletines: (_: any, __: any, { repositories }: any) => Promise<any>;
        boletin: (_: any, { id }: any, { repositories }: any) => Promise<any>;
        boletinesPorEstudiante: (_: any, { estudianteId }: any, { repositories }: any) => Promise<any>;
        exportarBoletin: (_: any, { id }: {
            id: string;
        }, { repositories }: any) => Promise<string>;
        exportarBoletinEstudiante: (_: any, { estudianteId, periodo }: {
            estudianteId: string;
            periodo: string;
        }, { repositories }: any) => Promise<string>;
        boletinesPorCursoPeriodo: (_: any, { cursoId, periodo }: any, { repositories }: any) => Promise<any>;
        matriculas: (_: any, __: any, { repositories }: any) => Promise<any>;
        matricula: (_: any, { id }: any, { repositories }: any) => Promise<any>;
        matriculasPorEstudiante: (_: any, { estudianteId }: any, { repositories }: any) => Promise<any>;
        matriculasPorAsignatura: (_: any, { asignaturaId }: any) => Promise<Matricula[]>;
        asignaturas: (_: any, __: any, { repositories }: any) => Promise<any>;
        asignatura: (_: any, { id }: any, { repositories }: any) => Promise<any>;
        asignaturasPorProfesor: (_: any, { profesorId }: any, { repositories }: any) => Promise<Asignatura[]>;
        asignaturasPorCurso: (_: any, { cursoId }: any, { repositories }: any) => Promise<any>;
        asistencias: (_: any, __: any, { repositories }: any) => Promise<any>;
        asistencia: (_: any, { id }: any, { repositories }: any) => Promise<any>;
        asistenciasPorAsignatura: (_: any, { asignaturaId }: any, { repositories }: any) => Promise<any>;
        asistenciasPorFecha: (_: any, { asignaturaId, fecha }: any, { repositories }: any) => Promise<any>;
        asistenciasPorPeriodo: (_: any, { asignaturaId, periodo }: any, { repositories }: any) => Promise<any>;
        resumenAsistencia: (_: any, { asignaturaId, periodo }: any, { repositories }: any) => Promise<{
            estudianteId: string;
            totalClases: number;
            presentes: number;
            ausentes: number;
            tardes: number;
            excusas: number;
            porcentajeAsistencia: number;
        }[]>;
        asistenciasPorEstudiante: (_: any, { estudianteId, periodo }: any, { repositories }: any) => Promise<any>;
        resumenAsistenciaEstudiante: (_: any, { estudianteId, periodo }: any, { repositories }: any) => Promise<{
            estudianteId: any;
            asignaturaId: string;
            totalClases: number;
            presentes: number;
            ausentes: number;
            tardes: number;
            excusas: number;
            porcentajeAsistencia: number;
        }[]>;
    };
    Mutation: {
        login: (_: any, { identifier, password }: any, { repositories }: any) => Promise<{
            token: string;
            user: {
                id: string;
                username: string;
                role: "ESTUDIANTE" | "PROFESOR" | "ADMIN";
                email: string;
            };
            isFirstLogin: boolean;
            expiresAt: string;
        }>;
        register: (_: any, { email, password, role }: any, { user, repositories }: any) => Promise<{
            token: string;
            user: {
                id: string;
                username: any;
                email: any;
                role: "ESTUDIANTE" | "PROFESOR" | "ADMIN";
            };
        }>;
        crearAdmin: (_: any, { email, password }: any, { user, repositories }: any) => Promise<{
            token: string;
            user: {
                id: string;
                email: any;
                role: string;
            };
        }>;
        cambiarPassword: (_: any, { username, oldPassword, newPassword }: any, { repositories }: any) => Promise<boolean>;
        cambiarPasswordPrimerLogin: (_: any, { username, newPassword }: any, { user, repositories }: any) => Promise<boolean>;
        olvidarPassword: (_: any, { identifier }: any, { repositories }: any) => Promise<boolean>;
        enviarCrearCredenciales: (_: any, { estudianteId, profesorId }: {
            estudianteId?: string;
            profesorId?: string;
        }, { user, repositories }: any) => Promise<boolean>;
        generarClaveProvisional: (_: any, { estudianteId, profesorId }: {
            estudianteId?: string;
            profesorId?: string;
        }, { user, repositories }: any) => Promise<boolean>;
        limpiarRegistrosProblematicos: (_: any, __: any, { user }: any) => Promise<boolean>;
        guardarIndicadores: (_: any, { asignaturaId, periodo, saber, hacer, ser }: any, { user }: any) => Promise<{
            id: string | undefined;
            asignaturaId: string;
            periodo: string;
            saber: string[];
            hacer: string[];
            ser: string[];
            creadoPor: string;
        } | null>;
        eliminarIndicadores: (_: any, { asignaturaId, periodo }: any) => Promise<boolean>;
        guardarCalificacionBoletin: (_: any, { estudianteId, asignaturaId, periodo, valoracion, nota, faltas, observacion }: any, { repositories }: any) => Promise<boolean>;
        exportarBoletinCompleto: (_: any, { estudianteId, periodo, observacionGeneral }: any, { repositories }: any) => Promise<string>;
        crearEstudiante: (_: any, { input }: any, { user, repositories }: any) => Promise<any>;
        actualizarEstudiante: (_: any, { id, input }: any, { user, repositories }: any) => Promise<any>;
        eliminarEstudiante: (_: any, { id }: any, { user, repositories }: any) => Promise<any>;
        crearProfesor: (_: any, { input }: any, { user, repositories }: any) => Promise<any>;
        actualizarProfesor: (_: any, { id, input }: any, { user, repositories }: any) => Promise<any>;
        eliminarProfesor: (_: any, { id }: any, { user, repositories }: any) => Promise<any>;
        crearCurso: (_: any, { input }: any, { user, repositories }: any) => Promise<any>;
        actualizarCurso: (_: any, { id, input }: any, { user, repositories }: any) => Promise<any>;
        eliminarCurso: (_: any, { id }: any, { user, repositories }: any) => Promise<boolean>;
        crearCalificacion: (_: any, { input }: any, { user, repositories }: any) => Promise<{
            id: any;
            estudianteId: any;
            asignaturaId: any;
            nota: any;
            periodo: any;
            observaciones: any;
            tipoActividad: any;
            nombreActividad: any;
            corte: any;
        }>;
        actualizarCalificacion: (_: any, { id, input }: any, { user, repositories }: any) => Promise<any>;
        eliminarCalificacion: (_: any, { id }: any, { user, repositories }: any) => Promise<boolean>;
        generarBoletin: (_: any, { input }: any, { repositories }: any) => Promise<any>;
        actualizarBoletin: (_: any, { id, input }: any, { repositories }: any) => Promise<any>;
        eliminarBoletin: (_: any, { id }: any, { repositories }: any) => Promise<boolean>;
        crearMatricula: (_: any, { input }: any, { user, repositories }: any) => Promise<any>;
        actualizarMatricula: (_: any, { id, input }: any, { repositories }: any) => Promise<any>;
        actualizarEstadoMatricula: (_: any, { id, estado }: any, { repositories }: any) => Promise<any>;
        eliminarMatricula: (_: any, { id }: any, { repositories }: any) => Promise<any>;
        crearAsignatura: (_: any, { input }: any, { user, repositories }: any) => Promise<any>;
        crearAsignaturaEnVariosCursos: (_: any, { input }: {
            input: {
                nombre: string;
                profesorId: string;
                cursos: Array<{
                    cursoId: string;
                    horario: string;
                }>;
            };
        }, { user, repositories }: any) => Promise<{
            creadas: any[];
            errores: string[];
        }>;
        actualizarAsignatura: (_: any, { id, input }: any, { user, repositories }: any) => Promise<any>;
        eliminarAsignatura: (_: any, { id }: any, { user, repositories }: any) => Promise<boolean>;
        registrarLista: (_: any, { input }: any, { repositories }: any) => Promise<any>;
        crearAsistencia: (_: any, { input }: any, { repositories }: any) => Promise<any>;
        actualizarAsistencia: (_: any, { id, input }: any, { repositories }: any) => Promise<any>;
        eliminarAsistencia: (_: any, { id }: any, { repositories }: any) => Promise<any>;
        configurarPeriodo: (_: any, { input }: any, { user }: any) => Promise<any>;
        cerrarPeriodo: (_: any, { anio, numeroPeriodo, fechaCierre }: any, { user }: any) => Promise<any>;
        abrirPeriodo: (_: any, { anio, numeroPeriodo }: any, { user }: any) => Promise<any>;
        guardarComportamiento: (_: any, { input }: any, { user, repositories }: any) => Promise<any>;
        crearEventoCronograma: (_: any, { input }: any, { user }: any) => Promise<any>;
        actualizarEventoCronograma: (_: any, { id, input }: any, { user }: any) => Promise<any>;
        eliminarEventoCronograma: (_: any, { id }: any, { user }: any) => Promise<boolean>;
    };
    User: {
        id: (user: any) => any;
    };
    AuthPayload: {
        user: (payload: any) => any;
        token: (payload: any) => any;
    };
    Asignatura: {
        profesor: (asignatura: any, _: any, { repositories }: any) => Promise<any>;
        curso: (asignatura: any, _: any, { repositories }: any) => Promise<any>;
    };
    Estudiante: {
        id: (e: any) => any;
        nombre: (e: any) => any;
        primerApellido: (e: any) => any;
        segundoApellido: (e: any) => any;
        email: (e: any) => any;
        cedula: (e: any) => any;
        empleado: (e: any, _: any, { repositories }: any) => Promise<any>;
        matriculas: (e: any, _: any, { repositories }: any) => Promise<any>;
    };
    Profesor: {
        id: (p: any) => any;
        empleado: (p: any) => Promise<(mongoose.Document<unknown, {}, {
            createdAt: NativeDate;
            updatedAt: NativeDate;
        } & {
            _id: any;
            cedula: string;
            nombre: string;
            primerApellido: string;
            tipo: "profesor" | "administrativo" | "estudiante" | "otro";
            segundoApellido?: string | null | undefined;
            email?: string | null | undefined;
            telefono?: string | null | undefined;
            direccion?: string | null | undefined;
        }> & {
            createdAt: NativeDate;
            updatedAt: NativeDate;
        } & {
            _id: any;
            cedula: string;
            nombre: string;
            primerApellido: string;
            tipo: "profesor" | "administrativo" | "estudiante" | "otro";
            segundoApellido?: string | null | undefined;
            email?: string | null | undefined;
            telefono?: string | null | undefined;
            direccion?: string | null | undefined;
        } & {
            _id: mongoose.Types.ObjectId;
        } & {
            __v: number;
        }) | null>;
    };
    Curso: {
        profesor: (curso: any, _: any, { repositories }: any) => Promise<any>;
    };
    Calificacion: {
        fecha: (cal: any) => string | null;
    };
    Matricula: {
        fechaMatricula: (matricula: any) => string;
        estudiante: (matricula: any, _: any, { repositories }: any) => Promise<any>;
        curso: (matricula: any, _: any, { repositories }: any) => Promise<any>;
        asignaturas: (matricula: any, _: any, { repositories }: any) => Promise<any>;
    };
    Asistencia: {
        fecha: (asistencia: any) => string | null;
    };
    Indicadores: {
        id: (indicador: any) => any;
        asignaturaId: (indicador: any) => string | null;
        saber: (indicador: any) => any;
        hacer: (indicador: any) => any;
        ser: (indicador: any) => any;
    };
    Boletin: {
        fecha: (boletin: any) => string;
        estudiante: (boletin: any, _: any, { repositories }: any) => Promise<any>;
        curso: (boletin: any, _: any, { repositories }: any) => Promise<any>;
    };
};
