import { ActualizarMatriculaInput, CrearMatriculaInput, Matricula } from "@core/domain/matricula";
import { Profesor } from "@core/domain/profesor";
import mongoose from "mongoose";
export declare const resolvers: {
    Query: {
        me: (_: any, __: any, { user }: any) => Promise<(mongoose.Document<unknown, {}, {
            email: string;
            password: string;
            role: "admin" | "teacher" | "student";
        }> & {
            email: string;
            password: string;
            role: "admin" | "teacher" | "student";
        } & {
            _id: mongoose.Types.ObjectId;
        } & {
            __v: number;
        }) | null>;
        estudiantes: (_: unknown, __: unknown, { repositories }: any) => Promise<any>;
        estudiante: (_: unknown, { id }: any, { repositories }: any) => Promise<any>;
        profesores: (_: unknown, __: unknown, { repositories }: any) => Promise<any>;
        profesor: (_: unknown, { id }: any, { repositories }: any) => Promise<any>;
        cursos: (_: unknown, __: unknown, { repositories }: any) => Promise<any>;
        curso: (_: unknown, { id }: any, { repositories }: any) => Promise<any>;
        calificaciones: (_: unknown, __: unknown, { repositories }: any) => Promise<any>;
        calificacion: (_: unknown, { id }: any, { repositories }: any) => Promise<any>;
        calificacionesPorEstudiante: (_: unknown, { estudianteId }: any, { user, repositories }: any) => Promise<any>;
        boletines: (_: unknown, __: unknown, { repositories }: any) => Promise<any>;
        boletin: (_: unknown, { id }: any, { repositories }: any) => Promise<any>;
        boletinesPorEstudiante: (_: unknown, { estudianteId }: any, { user, repositories }: any) => Promise<any>;
        matriculas: (_: unknown, __: unknown, { repositories }: any) => Promise<Matricula[]>;
        matricula: (_: unknown, { id }: {
            id: string;
        }, { repositories }: any) => Promise<Matricula | null>;
        matriculasPorEstudiante: (_: unknown, { estudianteId }: {
            estudianteId: string;
        }, { repositories }: any) => Promise<Matricula[]>;
        asignaturas: (_: unknown, __: unknown, { repositories }: any) => Promise<any>;
        asignatura: (_: unknown, { id }: any, { repositories }: any) => Promise<any>;
    };
    Mutation: {
        login: (_: any, { email, password }: any) => Promise<{
            token: string;
            user: {
                id: mongoose.Types.ObjectId;
                email: string;
                role: "admin" | "teacher" | "student";
            };
        }>;
        crearEstudiante: (_: unknown, { input }: {
            input: any;
        }, { repositories }: any) => Promise<any>;
        actualizarEstudiante: (_: unknown, { id, input }: any, { repositories }: any) => Promise<any>;
        eliminarEstudiante: (_: unknown, { id }: any, { repositories }: any) => Promise<any>;
        crearProfesor: (_: unknown, { input }: {
            input: Omit<Profesor, "id">;
        }, { repositories }: any) => Promise<any>;
        actualizarProfesor: (_: unknown, { id, input }: any, { repositories }: any) => Promise<any>;
        eliminarProfesor: (_: unknown, { id }: any, { repositories }: any) => Promise<any>;
        crearCurso: (_: unknown, { input }: any, { repositories }: any) => Promise<any>;
        actualizarCurso: (_: unknown, { id, input }: any, { repositories }: any) => Promise<any>;
        eliminarCurso: (_: unknown, { id }: any, { repositories }: any) => Promise<boolean>;
        crearCalificacion: (_: unknown, { input }: any, { repositories }: any) => Promise<any>;
        actualizarCalificacion: (_: unknown, { id, input }: any, { repositories }: any) => Promise<any>;
        eliminarCalificacion: (_: unknown, { id }: any, { repositories }: any) => Promise<boolean>;
        generarBoletin: (_: unknown, { input }: any, { repositories }: any) => Promise<any>;
        actualizarBoletin: (_: unknown, { id, input }: any, { repositories }: any) => Promise<any>;
        eliminarBoletin: (_: unknown, { id }: any, { repositories }: any) => Promise<boolean>;
        crearMatricula: (_: unknown, { input }: {
            input: CrearMatriculaInput;
        }, { repositories }: any) => Promise<Matricula>;
        actualizarMatricula: (_: unknown, { id, input }: {
            id: string;
            input: ActualizarMatriculaInput;
        }, { repositories }: any) => Promise<Matricula>;
        actualizarEstadoMatricula: (_: unknown, { id, estado }: {
            id: string;
            estado: "ACTIVA" | "CANCELADA" | "FINALIZADA";
        }, { repositories }: any) => Promise<Matricula>;
        eliminarMatricula: (_: unknown, { id }: {
            id: string;
        }, { repositories }: any) => Promise<boolean>;
        crearAsignatura: (_: unknown, { input }: any, { repositories }: any) => Promise<any>;
        actualizarAsignatura: (_: unknown, { id, input }: any, { repositories }: any) => Promise<any>;
        eliminarAsignatura: (_: unknown, { id }: any, { repositories }: any) => Promise<boolean>;
        crearAdmin: (_: any, { email, password }: any) => Promise<{
            token: string;
            user: {
                id: mongoose.Types.ObjectId;
                email: string;
                role: "admin" | "teacher" | "student";
            };
        }>;
    };
    User: {
        id: (user: any) => any;
    };
    AuthPayload: {
        user: (payload: any) => any;
        token: (payload: any) => any;
    };
    Asignatura: {
        profesor: (asignatura: {
            profesorId: string;
        }, _: any, { repositories }: any) => Promise<any>;
        curso: (asignatura: {
            cursoId: string;
        }, _: any, { repositories }: any) => Promise<any>;
    };
    Estudiante: {
        id: (estudiante: any) => any;
        empleado: (estudiante: {
            empleadoId: any;
        }, _: any, { repositories }: any) => Promise<any>;
        matriculas: (estudiante: {
            id: any;
        }, _: any, { repositories }: any) => Promise<any>;
    };
    Profesor: {
        id: (profesor: any) => any;
        empleado: (profesor: any) => Promise<(mongoose.Document<unknown, {}, {
            createdAt: NativeDate;
            updatedAt: NativeDate;
        } & {
            _id: any;
            email: string;
            cedula: string;
            nombre: string;
            primerApellido: string;
            tipo: "profesor" | "administrativo" | "otro";
            segundoApellido?: string | null | undefined;
            telefono?: string | null | undefined;
            direccion?: string | null | undefined;
        }> & {
            createdAt: NativeDate;
            updatedAt: NativeDate;
        } & {
            _id: any;
            email: string;
            cedula: string;
            nombre: string;
            primerApellido: string;
            tipo: "profesor" | "administrativo" | "otro";
            segundoApellido?: string | null | undefined;
            telefono?: string | null | undefined;
            direccion?: string | null | undefined;
        } & {
            _id: mongoose.Types.ObjectId;
        } & {
            __v: number;
        }) | null>;
    };
    Curso: {
        profesor: (curso: {
            profesorId: string;
        }, _: any, { repositories }: any) => Promise<any>;
    };
    Matricula: {
        estudiante: (matricula: {
            estudianteId: any;
        }, _: any, { repositories }: any) => Promise<any>;
        curso: (matricula: {
            cursoId: string;
        }, _: any, { repositories }: any) => Promise<any>;
        asignaturas: (matricula: {
            asignaturas: string[];
        }, _: any, { repositories }: any) => Promise<any>;
    };
    Boletin: {
        estudiante: (boletin: {
            estudianteId: any;
        }, _: any, { repositories }: any) => Promise<any>;
        curso: (boletin: {
            cursoId: any;
        }, _: any, { repositories }: any) => Promise<any>;
    };
};
