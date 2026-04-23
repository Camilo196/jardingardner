import bcrypt from 'bcrypt';
import { Matricula, CrearMatriculaInput, ActualizarMatriculaInput } from '../../../core/domain/matricula.js';
import { EmpleadoModel } from '../outputs/models/EmpleadoModel';
import mongoose from 'mongoose';
import { EstudianteModel } from '../outputs/models/EstudianteModel.js';
import { UserModel } from '../outputs/models/UserModel.js';
import { MatriculaModel } from '../outputs/models/MatriculaModel.js';
import { IndicadoresModel } from '../outputs/models/Indicadoresmodel.js';
import { PeriodoConfigModel } from '../outputs/models/PeriodoConfigModel.js';
import { ComportamientoModel } from '../outputs/models/ComportamientoModel.js';
import { AsistenciaModel } from '../outputs/models/AsistenciaModel.js';
import { CronogramaModel } from '../outputs/models/CronogramaModel.js';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { AuthService } from '../../../core/services/AuthService';
import {
    enviarCredenciales,
    enviarPasswordRecuperacion,
    enviarConfirmacionMatricula,
    notificarNuevaCalificacion,
} from '../../../core/services/Emailservice.js';
import { Asignatura } from '@core/domain/asignatura.js';
import { pdfService } from '../../../core/services/pdfService.js';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function generarClaveAleatoria(longitud = 8): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const bytes = crypto.randomBytes(longitud);
    return Array.from(bytes).map(b => chars[b % chars.length]).join('');
}

function normalizarRol(rol: string): 'ADMIN' | 'PROFESOR' | 'ESTUDIANTE' {
    const map: Record<string, 'ADMIN' | 'PROFESOR' | 'ESTUDIANTE'> = {
        admin: 'ADMIN', administrator: 'ADMIN', ADMIN: 'ADMIN', ADMINISTRATOR: 'ADMIN',
        teacher: 'PROFESOR', profesor: 'PROFESOR', TEACHER: 'PROFESOR', PROFESOR: 'PROFESOR',
        student: 'ESTUDIANTE', estudiante: 'ESTUDIANTE', STUDENT: 'ESTUDIANTE', ESTUDIANTE: 'ESTUDIANTE',
    };
    return map[rol] ?? 'ESTUDIANTE';
}

const ESTADOS_MATRICULA_BLOQUEADOS = new Set(['CANCELADA', 'FINALIZADA', 'SIN_PAGAR']);
const LABEL_ESTADO_MATRICULA: Record<string, string> = {
    ACTIVA: 'activa',
    CANCELADA: 'cancelada',
    FINALIZADA: 'finalizada',
    SIN_PAGAR: 'sin pagar',
};

function periodoSortKey(periodo?: string): number {
    if (!periodo) return 0;
    const raw = String(periodo).trim();
    if (/^\d{4}-\d+$/.test(raw)) {
        const [anio, numeroPeriodo] = raw.split('-').map(Number);
        return anio * 10 + numeroPeriodo;
    }
    if (/^\d+$/.test(raw)) {
        return new Date().getFullYear() * 10 + Number(raw);
    }
    return 0;
}

async function validarAccesoEstudiantePorMatricula(username: string): Promise<void> {
    const matriculas = await MatriculaModel.find({ estudianteId: username }).lean();
    if (!matriculas.length) return;

    const ultimaMatricula = [...matriculas].sort((a: any, b: any) => {
        const periodoDiff = periodoSortKey(b.periodo) - periodoSortKey(a.periodo);
        if (periodoDiff !== 0) return periodoDiff;
        return new Date(b.fechaMatricula ?? 0).getTime() - new Date(a.fechaMatricula ?? 0).getTime();
    })[0];

    const estado = String(ultimaMatricula?.estado ?? '').toUpperCase();
    if (estado === 'ACTIVA') return;
    if (!ESTADOS_MATRICULA_BLOQUEADOS.has(estado)) return;

    const estadoLabel = LABEL_ESTADO_MATRICULA[estado] ?? estado.toLowerCase();
    throw new Error(`Acceso bloqueado: tu matrícula está ${estadoLabel}. Contacta a la institución.`);
}

// ─── Helper: verificar que el periodo no esté cerrado ────────────────────────

// Parsear periodo con formato "YYYY-N" o "N"
function parsePeriodo(periodo: string): { anio: number; numeroPeriodo: number } {
    if (periodo.includes('-')) {
        const parts = periodo.split('-');
        // Formato "2026-1": primer segmento es año, segundo es número de periodo
        const anio = parseInt(parts[0]);
        const numeroPeriodo = parseInt(parts[1]);
        if (!isNaN(anio) && !isNaN(numeroPeriodo) && anio > 2000) {
            return { anio, numeroPeriodo };
        }
    }
    // Formato "1", "2", "3" — usar año actual
    return { anio: new Date().getFullYear(), numeroPeriodo: parseInt(periodo) };
}

async function verificarPeriodoAbierto(periodo: string): Promise<void> {
    const { anio, numeroPeriodo } = parsePeriodo(periodo);
    const config = await PeriodoConfigModel.findOne({ anio, numeroPeriodo });
    if (!config) return; // sin configuración = abierto por defecto
    if (!config.abierto) {
        throw new Error(
            `El periodo ${periodo} está cerrado. Contacte al administrador para reactivarlo.`
        );
    }
    if (config.fechaCierre && new Date() > config.fechaCierre) {
        await PeriodoConfigModel.updateOne({ anio, numeroPeriodo }, { abierto: false });
        throw new Error(
            `El periodo ${periodo} cerró el ${config.fechaCierre.toLocaleDateString('es-CO')}. Contacte al administrador.`
        );
    }
}

// ─── Resolvers ────────────────────────────────────────────────────────────────

export const resolvers = {

    // ═══════════════════════════
    //  QUERIES
    // ═══════════════════════════
    Query: {

        me: async (_: any, __: any, { user, repositories }: any) => {
            if (!user) throw new Error('No autenticado');
            return repositories.userRepository.findByUsername(user.username);
        },

        // Estudiantes
        estudiantes: async (_: any, __: any, { repositories }: any) =>
            await repositories.estudianteRepository.findAll(),

        estudiante: async (_: any, { id }: any, { repositories }: any) =>
            await repositories.estudianteRepository.findById(id),

        estudiantesPorIds: async (_: any, { ids }: { ids: string[] }, { repositories }: any) => {
            if (!ids?.length) return [];
            return await repositories.estudianteRepository.findByIds(ids);
        },

        // Profesores
        profesores: async (_: any, __: any, { repositories }: any) =>
            await repositories.profesorRepository.findAll(),

        profesor: async (_: any, { id }: any, { repositories }: any) =>
            await repositories.profesorRepository.findById(id),

        // Cursos
        cursos: async (_: any, __: any, { repositories }: any) =>
            await repositories.cursoRepository.findAll(),

        curso: async (_: any, { id }: any, { repositories }: any) =>
            await repositories.cursoRepository.findById(id),

        // Calificaciones
        calificaciones: async (_: any, __: any, { repositories }: any) =>
            await repositories.calificacionRepository.findAll(),

        calificacion: async (_: any, { id }: any, { repositories }: any) =>
            await repositories.calificacionRepository.findById(id),

        calificacionesPorEstudiante: async (_: any, { estudianteId }: any, { repositories }: any) =>
            await repositories.calificacionRepository.findByEstudianteId(estudianteId),

        calificacionesPorCurso: async (_: any, { cursoId }: any, { repositories }: any) =>
            await repositories.calificacionRepository.findByCursoId(cursoId),

        calificacionesPorAsignaturaYPeriodo: async (
            _: any,
            { asignaturaId, periodo }: { asignaturaId: string; periodo: string },
            { repositories }: any,
        ) => {
            // Fix N+1: query directa en MongoDB en lugar de findAll() + filter en JS
            return await repositories.calificacionRepository.findByAsignaturaYPeriodo(asignaturaId, periodo);
        },

        // Indicadores
        indicadoresPorAsignatura: async (_: any, { asignaturaId, periodo }: any) =>
            await IndicadoresModel.findOne({ asignaturaId, periodo }).lean(),

        indicadoresPorProfesor: async (_: any, { profesorId, periodo }: any, { repositories }: any) => {
            const asigs = await repositories.asignaturaRepository.findByProfesorId(profesorId);
            const ids = asigs.map((a: any) => a.id);
            if (!ids.length) return [];
            return await IndicadoresModel.find({ asignaturaId: { $in: ids }, periodo }).lean();
        },

        // Configuración de periodos
        periodoConfig: async (_: any, { anio, numeroPeriodo }: any) => {
            const config = await PeriodoConfigModel.findOne({ anio, numeroPeriodo }).lean();
            if (!config) return null;
            return { ...config, id: (config as any)._id?.toString(), pesoPorCorte: 100 / config.numCortes };
        },

        periodosConfig: async (_: any, { anio }: any) => {
            const configs = await PeriodoConfigModel.find({ anio }).sort({ numeroPeriodo: 1 }).lean();
            return configs.map((c: any) => ({
                ...c,
                id: c._id?.toString(),
                pesoPorCorte: 100 / c.numCortes,
                fechaApertura: c.fechaApertura ? new Date(c.fechaApertura).toISOString() : null,
                fechaCierre:   c.fechaCierre   ? new Date(c.fechaCierre).toISOString()   : null,
            }));
        },

        // Comportamiento
        comportamientosPorAsignatura: async (_: any, { asignaturaId, periodo }: any) =>
            await ComportamientoModel.find({ asignaturaId, periodo }).lean(),

        comportamientoEstudiante: async (_: any, { estudianteId, asignaturaId, periodo }: any) =>
            await ComportamientoModel.findOne({ estudianteId, asignaturaId, periodo }).lean(),

        // Cronograma
        cronograma: async (_: any, { anio }: any) => {
            const inicio = new Date(`${anio}-01-01`);
            const fin    = new Date(`${anio}-12-31`);
            const docs = await CronogramaModel.find({ fechaInicio: { $gte: inicio, $lte: fin } })
                .sort({ fechaInicio: 1 }).lean();
            return docs.map((d: any) => ({
                ...d,
                id: d._id?.toString(),
                fechaInicio: d.fechaInicio instanceof Date ? d.fechaInicio.toISOString().split('T')[0] : d.fechaInicio,
                fechaFin:    d.fechaFin    instanceof Date ? d.fechaFin.toISOString().split('T')[0]    : d.fechaFin,
            }));
        },

        cronogramaPorCurso: async (_: any, { cursoId, anio }: any) => {
            const inicio = new Date(`${anio}-01-01`);
            const fin    = new Date(`${anio}-12-31`);
            const docs = await CronogramaModel.find({
                $or: [{ cursoId }, { cursoId: null }, { cursoId: { $exists: false } }],
                fechaInicio: { $gte: inicio, $lte: fin }
            }).sort({ fechaInicio: 1 }).lean();
            return docs.map((d: any) => ({
                ...d,
                id: d._id?.toString(),
                fechaInicio: d.fechaInicio instanceof Date ? d.fechaInicio.toISOString().split('T')[0] : d.fechaInicio,
                fechaFin:    d.fechaFin    instanceof Date ? d.fechaFin.toISOString().split('T')[0]    : d.fechaFin,
            }));
        },

        // Boletines
        boletines: async (_: any, __: any, { repositories }: any) =>
            await repositories.boletinRepository.findAll(),

        boletin: async (_: any, { id }: any, { repositories }: any) =>
            await repositories.boletinRepository.findById(id),

        boletinesPorEstudiante: async (_: any, { estudianteId }: any, { repositories }: any) =>
            await repositories.boletinRepository.findByEstudianteId(estudianteId),

        exportarBoletin: async (_: any, { id }: { id: string }, { repositories }: any) => {
            const boletin = await repositories.boletinRepository.findById(id);
            if (!boletin) throw new Error(`Boletín ${id} no encontrado`);
            const estudiante = await repositories.estudianteRepository.findById(boletin.estudianteId);
            if (!estudiante) throw new Error(`Estudiante no encontrado`);
            const curso = await repositories.cursoRepository.findById(boletin.cursoId);
            if (!curso) throw new Error(`Curso no encontrado`);
            const cals = await repositories.calificacionRepository.findByEstudianteId(estudiante.id);
            const buf = await pdfService.generateBoletinPDF(boletin, estudiante, curso, cals);
            return Buffer.from(buf).toString('base64');
        },

        exportarBoletinEstudiante: async (
            _: any,
            { estudianteId, periodo }: { estudianteId: string; periodo: string },
            { repositories }: any,
        ) => {
            const estudiante =
                (await repositories.estudianteRepository.findByCedula(estudianteId).catch(() => null)) ??
                (await repositories.estudianteRepository.findById(estudianteId).catch(() => null));
            if (!estudiante) throw new Error(`Estudiante ${estudianteId} no encontrado`);

            const calsDelPeriodo = await repositories.calificacionRepository.findByEstudianteIdAndPeriodo(
                estudianteId, periodo,
            );
            if (!calsDelPeriodo.length) throw new Error('No hay calificaciones para este período');

            // Batch: collect unique asignaturaIds first
            const asigIdsUnicosEst = [...new Set(calsDelPeriodo.map((c: any) => String(c.asignaturaId)))];
            const asigsBatchEst: any[] = await repositories.asignaturaRepository
                .findByIds(asigIdsUnicosEst).catch(() => []);
            const asigByIdEst: Record<string, any> = {};
            for (const a of asigsBatchEst) asigByIdEst[String(a.id ?? a._id)] = a;

            // Agrupar por asignatura
            const asigMap: Record<string, { asig: any; notas: number[] }> = {};
            for (const cal of calsDelPeriodo) {
                const k = String(cal.asignaturaId);
                if (!asigMap[k]) {
                    asigMap[k] = { asig: asigByIdEst[k] ?? null, notas: [] };
                }
                asigMap[k].notas.push(Number(cal.nota));
            }

            // Batch remaining queries
            const profIdSetEst = new Set<string>();
            for (const { asig } of Object.values(asigMap)) {
                if (asig?.profesorId) profIdSetEst.add(String(asig.profesorId));
            }
            const profsBatchEst: any[] = profIdSetEst.size
                ? await Promise.all([...profIdSetEst].map(id => repositories.profesorRepository.findById(id).catch(() => null)))
                : [];
            const profByIdEst: Record<string, any> = {};
            profsBatchEst.forEach(p => { if (p) profByIdEst[String(p.id ?? p._id)] = p; });

            const estIdStrEst = String(estudiante.cedula ?? estudiante.id);
            const [indicadoresBatchEst, comportamientosBatchEst, asistenciasDataEst] = await Promise.all([
                IndicadoresModel.find({ asignaturaId: { $in: asigIdsUnicosEst }, periodo }).lean().catch(() => []),
                ComportamientoModel.find({
                    estudianteId: estIdStrEst,
                    asignaturaId: { $in: asigIdsUnicosEst },
                    periodo,
                }).lean().catch(() => []),
                AsistenciaModel.aggregate([
                    { $match: { estudianteId: estIdStrEst, asignaturaId: { $in: asigIdsUnicosEst }, periodo, estado: 'AUSENTE' } },
                    { $group: { _id: '$asignaturaId', count: { $sum: 1 } } },
                ]).catch(() => []),
            ]);

            const indByAsigEst: Record<string, any> = {};
            for (const ind of indicadoresBatchEst as any[]) indByAsigEst[String(ind.asignaturaId)] = ind;
            const compByAsigEst: Record<string, any> = {};
            for (const comp of comportamientosBatchEst as any[]) compByAsigEst[String(comp.asignaturaId)] = comp;
            const faltasByAsigEst: Record<string, number> = {};
            for (const row of asistenciasDataEst as any[]) faltasByAsigEst[String(row._id)] = row.count;

            const calificacionesBoletin = Object.entries(asigMap).map(([asignaturaId, { asig, notas }]) => {
                    const prom = notas.reduce((s, n) => s + n, 0) / notas.length;
                    const valoracion = prom >= 4.5 ? 'Superior' : prom >= 4.0 ? 'Alto' : prom >= 3.0 ? 'Básico' : 'Bajo';
                    let docenteNombre = 'Docente';
                    if (asig?.profesorId) {
                        const doc = profByIdEst[String(asig.profesorId)];
                        if (doc) docenteNombre = `${doc.nombre} ${doc.primerApellido}`;
                    }
                    const ind = indByAsigEst[asignaturaId] ?? null;
                    const comp = compByAsigEst[asignaturaId] ?? null;
                    const faltasCount = faltasByAsigEst[asignaturaId] ?? 0;
                    return {
                        asignaturaId,
                        asignaturaNombre: asig?.nombre ?? asignaturaId,
                        docenteNombre,
                        valoracion,
                        nota: prom,
                        faltas: faltasCount,
                        observacion: '',
                        indicadores: ind ? { saber: ind.saber, hacer: ind.hacer, ser: ind.ser } : undefined,
                        comportamiento: comp ? { nivel: comp.nivel, descripcion: comp.descripcion } : undefined,
                    };
                });

            const matriculas = await repositories.matriculaRepository
                .findByEstudianteId(estudiante.cedula ?? estudianteId)
                .catch(() => []);
            const mat = matriculas.find((m: any) => m.periodo === periodo) ?? matriculas[0];
            const curso = mat
                ? await repositories.cursoRepository.findById(mat.cursoId).catch(() => null)
                : null;

            // Bug 10 fix: Buscar el nombre del docente director del curso
            let directorNombre = 'Coordinación Académica';
            if (curso?.profesorId) {
                const dirProf = await repositories.profesorRepository.findById(curso.profesorId).catch(() => null);
                if (dirProf) directorNombre = `${dirProf.nombre} ${dirProf.primerApellido}`;
            }

            const buf = await pdfService.generateBoletinGardner({
                estudiante: {
                    nombre: estudiante.nombre,
                    primerApellido: estudiante.primerApellido,
                    segundoApellido: estudiante.segundoApellido,
                    cedula: estudiante.cedula,
                },
                curso: { nombre: curso?.nombre ?? 'Sin curso' },
                director: directorNombre,
                periodo,
                anio: new Date().getFullYear().toString(),
                calificaciones: calificacionesBoletin,
            });
            return Buffer.from(buf).toString('base64');
        },

        boletinesPorCursoPeriodo: async (_: any, { cursoId, periodo }: any, { repositories }: any) => {
            // Fix N+1: query directa en lugar de findAll() + filter en JS
            return await repositories.boletinRepository.findByCursoYPeriodo(cursoId, periodo);
        },

        // Matrículas
        matriculas: async (_: any, __: any, { repositories }: any) =>
            await repositories.matriculaRepository.findAll(),

        matricula: async (_: any, { id }: any, { repositories }: any) =>
            await repositories.matriculaRepository.findById(id),

        matriculasPorEstudiante: async (_: any, { estudianteId }: any, { repositories }: any) => {
            const est = await repositories.estudianteRepository.findByCedula(estudianteId);
            if (!est) return [];
            return await repositories.matriculaRepository.findByEstudianteId(est.cedula);
        },

        matriculasPorAsignatura: async (_: any, { asignaturaId }: any) => {
            const docs = await MatriculaModel.find({ asignaturas: asignaturaId }).exec();
            return docs
                .filter(d => d.estudianteId)
                .map(d => new Matricula(
                    d._id.toString(),
                    d.estudianteId,
                    d.cursoId,
                    (d.asignaturas || []).map((a: any) => a.toString()),
                    d.estado,
                    d.periodo,
                    d.fechaMatricula,
                ));
        },

        // Asignaturas
        asignaturas: async (_: any, __: any, { repositories }: any) =>
            await repositories.asignaturaRepository.findAll(),

        asignatura: async (_: any, { id }: any, { repositories }: any) =>
            await repositories.asignaturaRepository.findById(id),

        asignaturasPorProfesor: async (_: any, { profesorId }: any, { repositories }: any): Promise<Asignatura[]> => {
            const prof = await repositories.profesorRepository.findById(profesorId);
            if (!prof) return [];
            return await repositories.asignaturaRepository.findByProfesorId(profesorId);
        },

        asignaturasPorCurso: async (_: any, { cursoId }: any, { repositories }: any) =>
            await repositories.asignaturaRepository.findByCursoId(cursoId),

        // Asistencias
        asistencias: async (_: any, __: any, { repositories }: any) =>
            await repositories.asistenciaRepository.findAll(),

        asistencia: async (_: any, { id }: any, { repositories }: any) =>
            await repositories.asistenciaRepository.findById(id),

        asistenciasPorAsignatura: async (_: any, { asignaturaId }: any, { repositories }: any) =>
            await repositories.asistenciaRepository.findByAsignaturaId(asignaturaId),

        asistenciasPorFecha: async (_: any, { asignaturaId, fecha }: any, { repositories }: any) =>
            await repositories.asistenciaRepository.findByAsignaturaFecha(asignaturaId, fecha),

        asistenciasPorPeriodo: async (_: any, { asignaturaId, periodo }: any, { repositories }: any) =>
            await repositories.asistenciaRepository.findByAsignaturaPeriodo(asignaturaId, periodo),

        resumenAsistencia: async (_: any, { asignaturaId, periodo }: any, { repositories }: any) => {
            const regs = await repositories.asistenciaRepository.findByAsignaturaPeriodo(asignaturaId, periodo);
            const map: Record<string, any[]> = {};
            for (const r of regs) {
                if (!map[r.estudianteId]) map[r.estudianteId] = [];
                map[r.estudianteId].push(r);
            }
            return Object.entries(map).map(([estudianteId, rs]) => {
                const total = rs.length;
                const pres = rs.filter(r => r.estado === 'PRESENTE').length;
                const aus  = rs.filter(r => r.estado === 'AUSENTE').length;
                const tard = rs.filter(r => r.estado === 'TARDE').length;
                const exc  = rs.filter(r => r.estado === 'EXCUSA').length;
                return {
                    estudianteId, totalClases: total, presentes: pres,
                    ausentes: aus, tardes: tard, excusas: exc,
                    porcentajeAsistencia: total > 0 ? Math.round(((pres + exc) / total) * 1000) / 10 : 0,
                };
            });
        },

        asistenciasPorEstudiante: async (_: any, { estudianteId, periodo }: any, { repositories }: any) => {
            const todas = await repositories.asistenciaRepository.findByEstudianteId(estudianteId);
            return periodo ? todas.filter((a: any) => a.periodo === periodo) : todas;
        },

        resumenAsistenciaEstudiante: async (_: any, { estudianteId, periodo }: any, { repositories }: any) => {
            const todas = await repositories.asistenciaRepository.findByEstudianteId(estudianteId);
            const regs = periodo ? todas.filter((a: any) => a.periodo === periodo) : todas;
            const map: Record<string, any[]> = {};
            for (const r of regs) {
                const k = String(r.asignaturaId);
                if (!map[k]) map[k] = [];
                map[k].push(r);
            }
            return Object.entries(map).map(([asignaturaId, rs]) => {
                const total = rs.length;
                const pres = rs.filter(r => r.estado === 'PRESENTE').length;
                const aus  = rs.filter(r => r.estado === 'AUSENTE').length;
                const tard = rs.filter(r => r.estado === 'TARDE').length;
                const exc  = rs.filter(r => r.estado === 'EXCUSA').length;
                return {
                    estudianteId,
                    asignaturaId,
                    totalClases: total, presentes: pres,
                    ausentes: aus, tardes: tard, excusas: exc,
                    porcentajeAsistencia: total > 0 ? Math.round(((pres + exc) / total) * 1000) / 10 : 0,
                };
            });
        },
    },

    // ═══════════════════════════
    //  MUTATIONS
    // ═══════════════════════════
    Mutation: {

        // ── Auth ──────────────────────────────────────────────
        login: async (_: any, { identifier, password }: any, { repositories }: any) => {
            const authService = new AuthService(repositories.userRepository);
            const result = await authService.authenticate(identifier, password);
            if (!result?.user) throw new Error('Credenciales inválidas');

            const user = result.user;
            const role = normalizarRol(user.role);
            let email = user.email ?? user.username;

            // Enriquecer email para estudiantes
            const isEstudiante = ['student','estudiante','STUDENT','ESTUDIANTE'].includes(user.role);
            if (isEstudiante) {
                await validarAccesoEstudiantePorMatricula(user.username);
                const est = await repositories.estudianteRepository.findByCedula(user.username).catch(() => null);
                if (est?.email) email = est.email;
            }

            const expiresIn = '24h';
            const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
            const token = jwt.sign(
                { id: user.id, username: user.username, role, email },
                process.env.JWT_SECRET!,
                { expiresIn },
            );

            return {
                token,
                user: { id: user.id, username: user.username, role, email },
                isFirstLogin: result.isFirstLogin ?? false,
                expiresAt,
            };
        },

        register: async (_: any, { email, password, role }: any, { user, repositories }: any) => {
            if (!user || user.role !== 'ADMIN') throw new Error('No autorizado: se requiere rol ADMIN');
            const authService = new AuthService(repositories.userRepository);
            const result = await authService.register(email, password, role);
            return { token: result.token, user: { id: result.user.id, username: email, email, role: normalizarRol(result.user.role) } };
        },

        crearAdmin: async (_: any, { email, password }: any, { user, repositories }: any) => {
            if (!user || user.role !== 'ADMIN') throw new Error('No autorizado: se requiere rol ADMIN');
            const authService = new AuthService(repositories.userRepository);
            const result = await authService.register(email, password, 'ADMIN');
            return { token: result.token, user: { id: result.user.id, email, role: 'ADMIN' } };
        },

        cambiarPassword: async (_: any, { username, oldPassword, newPassword }: any, { repositories }: any): Promise<boolean> => {
            const user = await repositories.userRepository.findByUsername(username);
            if (!user) throw new Error('Usuario no encontrado');
            const authService = new AuthService(repositories.userRepository);
            try { await authService.authenticate(username, oldPassword); }
            catch { throw new Error('La contraseña actual es incorrecta'); }
            if (!newPassword || newPassword.length < 6) throw new Error('Mínimo 6 caracteres');
            const hashed = await bcrypt.hash(newPassword, 10);
            const ok = await repositories.userRepository.updatePassword(username, hashed);
            if (!ok) throw new Error('No se pudo actualizar la contraseña');
            return true;
        },

        cambiarPasswordPrimerLogin: async (_: any, { username, newPassword }: any, { user, repositories }: any): Promise<boolean> => {
            // Requiere token válido y que el usuario solo pueda cambiar su propia contraseña
            if (!user) throw new Error('No autenticado');
            if (user.username !== username) throw new Error('No autorizado: solo puedes cambiar tu propia contraseña');
            const dbUser = await repositories.userRepository.findByUsername(username);
            if (!dbUser) throw new Error('Credenciales inválidas');
            if (!newPassword || newPassword.length < 6) throw new Error('Mínimo 6 caracteres');
            const hashed = await bcrypt.hash(newPassword, 10);
            const ok = await repositories.userRepository.updatePassword(username, hashed);
            if (!ok) throw new Error('No se pudo actualizar la contraseña');
            return true;
        },

        olvidarPassword: async (_: any, { identifier }: any, { repositories }: any): Promise<boolean> => {
            let email = '', nombre = '', cedula = identifier;

            // Fix N+1: buscar primero por cédula, luego por email directo en DB (sin findAll)
            const est = await repositories.estudianteRepository.findByCedula(identifier).catch(() => null)
                ?? await repositories.estudianteRepository.findByEmail(identifier).catch(() => null);

            if (est) {
                email = est.email; nombre = est.nombre; cedula = est.cedula;
            } else {
                const prof = await repositories.profesorRepository.findByCedula(identifier).catch(() => null)
                    ?? await repositories.profesorRepository.findByEmail(identifier).catch(() => null);
                if (prof) { email = prof.email; nombre = prof.nombre; cedula = prof.cedula; }
            }

            if (!email) throw new Error('No se encontró usuario con ese identificador');
            const clave = generarClaveAleatoria();
            const passwordReset = await repositories.userRepository.resetPassword(cedula, clave);
            if (!passwordReset) throw new Error('No se pudo restablecer la contraseÃ±a');
            const emailSent = await enviarPasswordRecuperacion({ email, nombre, cedula, passwordTemporal: clave });
            if (!emailSent) throw new Error('La contraseÃ±a se restableciÃ³, pero no se pudo enviar el correo');
            return true;
        },

        // ── Credenciales ──────────────────────────────────────
        enviarCrearCredenciales: async (
            _: any,
            { estudianteId, profesorId }: { estudianteId?: string; profesorId?: string },
            { user, repositories }: any,
        ): Promise<boolean> => {
            if (!user || user.role !== 'ADMIN') throw new Error('No autorizado: se requiere rol ADMIN');
            if (!estudianteId && !profesorId) throw new Error('Proporciona estudianteId o profesorId');
            let cedula: string, email: string, nombre: string, apellido: string, role: string;

            if (profesorId) {
                const prof = await repositories.profesorRepository.findByCedula(profesorId);
                if (!prof) throw new Error('Profesor no encontrado');
                cedula = profesorId; email = prof.email; nombre = prof.nombre; apellido = prof.primerApellido; role = 'PROFESOR';
            } else {
                const est = await repositories.estudianteRepository.findByCedula(estudianteId!);
                if (!est) throw new Error('Estudiante no encontrado');
                cedula = estudianteId!; email = est.email; nombre = est.nombre; apellido = est.primerApellido; role = 'ESTUDIANTE';
            }

            if (!email) throw new Error('El usuario no tiene email registrado');
            const yaExiste = await repositories.userRepository.findByUsername(cedula);
            if (yaExiste) return true; // ya tiene credenciales, no generar duplicado

            const authService = new AuthService(repositories.userRepository);
            const password = await authService.createUserCredentials(cedula, role);
            const emailSent = await enviarCredenciales({ email, nombre, apellido, cedula, password, rol: role });
            if (!emailSent) throw new Error('Las credenciales se crearon, pero no se pudo enviar el correo');
            return true;
        },

        generarClaveProvisional: async (
            _: any,
            { estudianteId, profesorId }: { estudianteId?: string; profesorId?: string },
            { user, repositories }: any,
        ): Promise<boolean> => {
            if (!user || user.role !== 'ADMIN') throw new Error('No autorizado: se requiere rol ADMIN');
            const esProfesor = !!profesorId && !estudianteId;
            let cedula: string, email: string, nombre: string, rolUsuario: string;

            if (esProfesor) {
                const prof = await repositories.profesorRepository.findByCedula(profesorId!);
                if (!prof?.email) throw new Error('Profesor no encontrado o sin email');
                cedula = profesorId!; email = prof.email; nombre = `${prof.nombre} ${prof.primerApellido}`; rolUsuario = 'PROFESOR';
            } else {
                const est = await repositories.estudianteRepository.findByCedula(estudianteId!);
                if (!est?.email) throw new Error('Estudiante no encontrado o sin email');
                cedula = estudianteId!; email = est.email; nombre = `${est.nombre} ${est.primerApellido}`; rolUsuario = 'ESTUDIANTE';
            }

            const clave = generarClaveAleatoria();
            const userExists = await repositories.userRepository.findByUsername(cedula);
            if (userExists) {
                await repositories.userRepository.resetPassword(cedula, clave);
            } else {
                await repositories.userRepository.create({ username: cedula, password: clave, role: rolUsuario, email });
            }
            const emailSent = await enviarPasswordRecuperacion({ email, nombre: nombre.split(' ')[0], cedula, passwordTemporal: clave });
            if (!emailSent) throw new Error('La clave provisional se generÃ³, pero no se pudo enviar el correo');
            return true;
        },

        // ── Limpieza ──────────────────────────────────────────
        limpiarRegistrosProblematicos: async (_: any, __: any, { user }: any): Promise<boolean> => {
            if (!user || user.role !== 'ADMIN') throw new Error('No autorizado: se requiere rol ADMIN');
            await MatriculaModel.deleteMany({ $or: [{ estudianteId: null }, { estudianteId: '' }] }).exec();
            return true;
        },

        // ── Indicadores ───────────────────────────────────────
        guardarIndicadores: async (_: any, { asignaturaId, periodo, saber, hacer, ser }: any, { user }: any) => {
            const creadoPor = user?.username ?? 'sistema';
            return await IndicadoresModel.findOneAndUpdate(
                { asignaturaId, periodo },
                { asignaturaId, periodo, saber, hacer, ser, creadoPor },
                { upsert: true, new: true, setDefaultsOnInsert: true },
            ).lean();
        },

        eliminarIndicadores: async (_: any, { asignaturaId, periodo }: any): Promise<boolean> => {
            const result = await IndicadoresModel.deleteOne({ asignaturaId, periodo }).exec();
            return result.deletedCount > 0;
        },

        // ── Boletín avanzado ──────────────────────────────────
        guardarCalificacionBoletin: async (
            _: any,
            { estudianteId, asignaturaId, periodo, valoracion, nota, faltas, observacion }: any,
            { repositories }: any,
        ): Promise<boolean> => {
            // Fix N+1: buscar directamente sin traer todas las calificaciones a memoria
            const todasDelEstudiante = await repositories.calificacionRepository.findByEstudianteId(estudianteId);
            const existente = todasDelEstudiante.find(
                (c: any) =>
                    String(c.asignaturaId) === String(asignaturaId) &&
                    c.periodo === periodo &&
                    c.nombreActividad === '__boletin__',
            );
            const input = {
                estudianteId, asignaturaId, periodo, nota,
                observaciones: observacion ?? '',
                tipoActividad: 'EXAMEN',
                nombreActividad: '__boletin__',
                corte: 0,
            };
            if (existente) {
                await repositories.calificacionRepository.update(existente.id, input);
            } else {
                await repositories.calificacionRepository.create(input);
            }
            return true;
        },

        exportarBoletinCompleto: async (
            _: any,
            { estudianteId, periodo, observacionGeneral }: any,
            { repositories }: any,
        ): Promise<string> => {
            // Fetch estudiante y calificaciones en paralelo
            const [estudiantePorCedula, calsDelPeriodoRaw] = await Promise.all([
                repositories.estudianteRepository.findByCedula(estudianteId).catch(() => null),
                repositories.calificacionRepository.findByEstudianteIdAndPeriodo(estudianteId, periodo).catch(() => []),
            ]);
            const estudiante = estudiantePorCedula ??
                await repositories.estudianteRepository.findById(estudianteId).catch(() => null);
            if (!estudiante) throw new Error(`Estudiante ${estudianteId} no encontrado`);

            const calsDelPeriodo = calsDelPeriodoRaw.filter((c: any) => c.nombreActividad !== '__boletin__');
            if (!calsDelPeriodo.length) throw new Error('No hay calificaciones para este período');

            // Batch: collect unique asignaturaIds first, then fetch all at once
            const asigIdsUnicos = [...new Set(calsDelPeriodo.map((c: any) => String(c.asignaturaId)))];
            const asigsBatch: any[] = await repositories.asignaturaRepository
                .findByIds(asigIdsUnicos).catch(() => []);
            const asigById: Record<string, any> = {};
            for (const a of asigsBatch) asigById[String(a.id ?? a._id)] = a;

            const asigMap: Record<string, { asig: any; notasPorCorte: Record<number, number[]> }> = {};
            for (const cal of calsDelPeriodo) {
                const k = String(cal.asignaturaId);
                if (!asigMap[k]) {
                    asigMap[k] = { asig: asigById[k] ?? null, notasPorCorte: {} };
                }
                const corte = (cal as any).corte ?? 1;
                if (!asigMap[k].notasPorCorte[corte]) asigMap[k].notasPorCorte[corte] = [];
                asigMap[k].notasPorCorte[corte].push(Number(cal.nota));
            }

            // Obtener config del periodo para pesos de cortes
            const { anio: pAnio, numeroPeriodo: pNum } = parsePeriodo(periodo);
            const periodoConfig = await PeriodoConfigModel.findOne({
                anio: pAnio,
                numeroPeriodo: pNum,
            });
            const numCortes = periodoConfig?.numCortes ?? 3;
            const pesoPorCorte = 100 / numCortes;

            // Pre-batch: collect all unique profesorIds to avoid per-asignatura queries
            const profIdSet = new Set<string>();
            for (const { asig } of Object.values(asigMap)) {
                if (asig?.profesorId) profIdSet.add(String(asig.profesorId));
            }
            const profIds = [...profIdSet];
            const profsBatch: any[] = profIds.length
                ? await Promise.all(profIds.map(id => repositories.profesorRepository.findById(id).catch(() => null)))
                : [];
            const profById: Record<string, any> = {};
            profsBatch.forEach(p => { if (p) profById[String(p.id ?? p._id)] = p; });

            const asigIdsList = Object.keys(asigMap);
            const estIdStr = String(estudiante.cedula ?? estudiante.id);

            // Batch all supplementary queries in parallel
            const [indicadoresBatch, comportamientosBatch, asistenciasData] = await Promise.all([
                IndicadoresModel.find({
                    $or: [
                        { asignaturaId: { $in: asigIdsList } },
                        { asignaturaId: { $in: asigIdsList.map(id => id.toString()) } },
                    ],
                    periodo,
                }).lean().catch(() => []),
                ComportamientoModel.find({
                    estudianteId: estIdStr,
                    asignaturaId: { $in: asigIdsList },
                    periodo,
                }).lean().catch(() => []),
                AsistenciaModel.aggregate([
                    { $match: { estudianteId: estIdStr, asignaturaId: { $in: asigIdsList }, periodo, estado: 'AUSENTE' } },
                    { $group: { _id: '$asignaturaId', count: { $sum: 1 } } },
                ]).catch(() => []),
            ]);

            const indByAsig: Record<string, any> = {};
            for (const ind of indicadoresBatch as any[]) {
                indByAsig[String(ind.asignaturaId)] = ind;
            }
            const compByAsig: Record<string, any> = {};
            for (const comp of comportamientosBatch as any[]) {
                compByAsig[String(comp.asignaturaId)] = comp;
            }
            const faltasByAsig: Record<string, number> = {};
            for (const row of asistenciasData as any[]) {
                faltasByAsig[String(row._id)] = row.count;
            }

            const calificacionesBoletin = Object.entries(asigMap).map(([asignaturaId, { asig, notasPorCorte }]) => {
                    // Calcular promedio ponderado por cortes
                    let notaFinal = 0;
                    let pesoAcumulado = 0;
                    for (let c = 1; c <= numCortes; c++) {
                        const notas = notasPorCorte[c] ?? [];
                        if (notas.length > 0) {
                            const promCorte = notas.reduce((s, n) => s + n, 0) / notas.length;
                            notaFinal += promCorte * (pesoPorCorte / 100);
                            pesoAcumulado += pesoPorCorte;
                        }
                    }
                    const todasNotas = Object.values(notasPorCorte).flat();
                    const prom = pesoAcumulado > 0
                        ? notaFinal / (pesoAcumulado / 100)
                        : todasNotas.reduce((s, n) => s + n, 0) / (todasNotas.length || 1);

                    const valoracion = prom >= 4.5 ? 'Superior' : prom >= 4.0 ? 'Alto' : prom >= 3.0 ? 'Básico' : 'Bajo';
                    let docenteNombre = 'Docente';
                    if (asig?.profesorId) {
                        const doc = profById[String(asig.profesorId)];
                        if (doc) docenteNombre = `${doc.nombre} ${doc.primerApellido}`;
                    }

                    const ind = indByAsig[asignaturaId] ?? null;
                    const comp = compByAsig[asignaturaId] ?? null;
                    const faltasCount = faltasByAsig[asignaturaId] ?? 0;

                    return {
                        asignaturaId,
                        asignaturaNombre: asig?.nombre ?? asignaturaId,
                        docenteNombre, valoracion, nota: prom, faltas: faltasCount, observacion: '',
                        indicadores: {
                            saber: ind?.saber ?? [],
                            hacer: ind?.hacer ?? [],
                            ser:   ind?.ser   ?? [],
                        },
                        comportamiento: comp ? { nivel: comp.nivel, descripcion: comp.descripcion } : undefined,
                    };
                });

            const matriculas = await repositories.matriculaRepository
                .findByEstudianteId(estudiante.cedula ?? estudianteId).catch(() => []);
            const mat = matriculas.find((m: any) => m.periodo === periodo) ?? matriculas[0];
            const curso = mat ? await repositories.cursoRepository.findById(mat.cursoId).catch(() => null) : null;

            // Bug 10 fix: Buscar el nombre del docente director del curso
            let directorNombre = 'Coordinación Académica';
            if (curso?.profesorId) {
                const dirProf = await repositories.profesorRepository.findById(curso.profesorId).catch(() => null);
                if (dirProf) directorNombre = `${dirProf.nombre} ${dirProf.primerApellido}`;
            }

            const buf = await pdfService.generateBoletinGardner({
                estudiante: {
                    nombre: estudiante.nombre,
                    primerApellido: estudiante.primerApellido,
                    segundoApellido: estudiante.segundoApellido,
                    cedula: estudiante.cedula,
                },
                curso: { nombre: curso?.nombre ?? 'Sin curso' },
                director: directorNombre,
                periodo,
                anio: new Date().getFullYear().toString(),
                calificaciones: calificacionesBoletin,
                observacionGeneral,
            });
            return Buffer.from(buf).toString('base64');
        },

        // ── Estudiantes ───────────────────────────────────────
        crearEstudiante: async (_: any, { input }: any, { user, repositories }: any) => {
            if (!user || user.role !== 'ADMIN') throw new Error('No autorizado: se requiere rol ADMIN');
            const cedula = String(input.cedula ?? '').trim();
            if (!cedula) throw new Error('La cédula es obligatoria');
            if (!input.nombre?.trim() || !input.primerApellido?.trim() || !input.email?.trim())
                throw new Error('Nombre, primer apellido y email son obligatorios');
            const existe = await repositories.estudianteRepository.findByCedula(cedula);
            if (existe) throw new Error(`Ya existe un estudiante con cédula ${cedula}`);
            return await repositories.estudianteRepository.create({
                cedula,
                nombre: input.nombre.trim(),
                primerApellido: input.primerApellido.trim(),
                segundoApellido: (input.segundoApellido ?? '').trim(),
                email: input.email.trim(),
                telefono: (input.telefono ?? '').trim(),
                direccion: (input.direccion ?? '').trim(),
                acudiente: (input.acudiente ?? '').trim(),
            });
        },

        actualizarEstudiante: async (_: any, { id, input }: any, { user, repositories }: any) => {
            if (!user || user.role !== 'ADMIN') throw new Error('No autorizado: se requiere rol ADMIN');
            if (!input.cedula || !input.nombre || !input.primerApellido || !input.email)
                throw new Error('Cedula, nombre, primer apellido y email son obligatorios');
            const actualizado = await repositories.estudianteRepository.update(id, input);
            if (!actualizado) throw new Error(`No se pudo actualizar el estudiante ${id}`);
            return actualizado;
        },

        eliminarEstudiante: async (_: any, { id }: any, { user, repositories }: any) => {
            if (!user || user.role !== 'ADMIN') throw new Error('No autorizado: se requiere rol ADMIN');
            // Obtener la cédula del estudiante para borrar el usuario asociado
            const estudiante = await repositories.estudianteRepository.findById(id).catch(() => null)
                ?? await repositories.estudianteRepository.findByCedula(id).catch(() => null);
            const ok = await repositories.estudianteRepository.delete(id);
            if (!ok) throw new Error(`No se pudo eliminar el estudiante ${id}`);
            // Eliminar el usuario del sistema (username = cédula)
            if (estudiante?.cedula) {
                await UserModel.deleteOne({ username: estudiante.cedula }).catch(() => {});
            }
            return ok;
        },

        // ── Profesores ────────────────────────────────────────
        crearProfesor: async (_: any, { input }: any, { user, repositories }: any) => {
            if (!user || user.role !== 'ADMIN') throw new Error('No autorizado: se requiere rol ADMIN');
            const cedula = String(input.cedula ?? '').trim();
            if (!cedula) throw new Error('La cédula es obligatoria');
            if (!input.nombre?.trim() || !input.primerApellido?.trim() || !input.email?.trim())
                throw new Error('Nombre, primer apellido y email son obligatorios');
            const existe = await repositories.profesorRepository.findByCedula(cedula);
            if (existe) throw new Error(`Ya existe un profesor con cédula ${cedula}`);
            const profesor = await repositories.profesorRepository.create({
                cedula,
                nombre: input.nombre.trim(),
                primerApellido: input.primerApellido.trim(),
                segundoApellido: (input.segundoApellido ?? '').trim(),
                email: input.email.trim(),
                telefono: (input.telefono ?? '').trim(),
                direccion: (input.direccion ?? '').trim(),
            });
            // Crear credenciales automáticamente — best-effort
            await resolvers.Mutation.enviarCrearCredenciales(_, { profesorId: cedula }, { user, repositories });
            return profesor;
        },

        actualizarProfesor: async (_: any, { id, input }: any, { user, repositories }: any) => {
            if (!user || user.role !== 'ADMIN') throw new Error('No autorizado: se requiere rol ADMIN');
            const ok = await repositories.profesorRepository.update(id, input);
            if (!ok) throw new Error(`No se pudo actualizar el profesor ${id}`);
            return ok;
        },

        eliminarProfesor: async (_: any, { id }: any, { user, repositories }: any) => {
            if (!user || user.role !== 'ADMIN') throw new Error('No autorizado: se requiere rol ADMIN');
            // Obtener la cédula del profesor para borrar el usuario asociado
            const profesor = await repositories.profesorRepository.findById(id).catch(() => null)
                ?? await repositories.profesorRepository.findByCedula(id).catch(() => null);
            const ok = await repositories.profesorRepository.delete(id);
            if (!ok) throw new Error(`No se pudo eliminar el profesor ${id}`);
            // Eliminar el usuario del sistema (username = cédula)
            if (profesor?.cedula) {
                await UserModel.deleteOne({ username: profesor.cedula }).catch(() => {});
            }
            return ok;
        },

        // ── Cursos ────────────────────────────────────────────
        crearCurso: async (_: any, { input }: any, { user, repositories }: any) => {
            if (!user || user.role !== 'ADMIN') throw new Error('No autorizado: se requiere rol ADMIN');
            if (!input.id || !input.nombre) throw new Error('El ID y nombre del curso son obligatorios');
            const existe = await repositories.cursoRepository.findById(input.id);
            if (existe) throw new Error(`Ya existe un curso con ID ${input.id}`);
            let profesorCedula = input.profesorId;
            if (input.profesorId) {
                const prof = (await repositories.profesorRepository.findById(input.profesorId).catch(() => null))
                    ?? (await repositories.profesorRepository.findByCedula(input.profesorId).catch(() => null));
                if (!prof) throw new Error(`Profesor ${input.profesorId} no encontrado`);
                profesorCedula = prof.cedula;
            }
            return await repositories.cursoRepository.create({
                _id: input.id,
                nombre: input.nombre,
                duracion: input.duracion ?? 0,
                cantidadMax: input.cantidadMax ?? 0,
                profesorId: profesorCedula,
            });
        },

        actualizarCurso: async (_: any, { id, input }: any, { user, repositories }: any) => {
            if (!user || user.role !== 'ADMIN') throw new Error('No autorizado: se requiere rol ADMIN');
            return await repositories.cursoRepository.update(id, input);
        },

        eliminarCurso: async (_: any, { id }: any, { user, repositories }: any) => {
            if (!user || user.role !== 'ADMIN') throw new Error('No autorizado: se requiere rol ADMIN');
            return !!(await repositories.cursoRepository.delete(id));
        },

        // ── Calificaciones ────────────────────────────────────
        crearCalificacion: async (_: any, { input }: any, { user, repositories }: any) => {
            if (!user || !['ADMIN', 'PROFESOR'].includes(user.role)) throw new Error('No autorizado: se requiere rol ADMIN o PROFESOR');
            if (!input.estudianteId) throw new Error('El estudianteId es requerido');
            if (!input.asignaturaId) throw new Error('El asignaturaId es requerido');

            // Verificar que el periodo esté abierto
            await verificarPeriodoAbierto(input.periodo);

            const cal = await repositories.calificacionRepository.create(input);

            // Notificación email — best-effort, en background
            (async () => {
                try {
                    const estudiante = await repositories.estudianteRepository.findById(input.estudianteId);
                    const asignatura = await repositories.asignaturaRepository.findById(input.asignaturaId);
                    if (estudiante?.email && asignatura) {
                        await notificarNuevaCalificacion({
                            email: estudiante.email,
                            nombre: estudiante.nombre,
                            apellido: estudiante.primerApellido,
                            asignaturaNombre: asignatura.nombre,
                            cursoNombre: asignatura.curso?.nombre ?? asignatura.cursoId ?? '',
                            tipoActividad: input.tipoActividad ?? 'EXAMEN',
                            nombreActividad: input.nombreActividad ?? 'Actividad',
                            nota: Number(input.nota),
                            periodo: input.periodo,
                            corte: input.corte ?? 1,
                            observaciones: input.observaciones,
                        });
                    }
                } catch { /* silencioso */ }
            })();

            return {
                id: cal.id,
                estudianteId: cal.estudianteId,
                asignaturaId: cal.asignaturaId,
                nota: cal.nota,
                periodo: cal.periodo,
                observaciones: cal.observaciones,
                tipoActividad: cal.tipoActividad,
                nombreActividad: cal.nombreActividad,
                corte: cal.corte,
            };
        },

        actualizarCalificacion: async (_: any, { id, input }: any, { user, repositories }: any) => {
            if (!user || !['ADMIN', 'PROFESOR'].includes(user.role)) throw new Error('No autorizado: se requiere rol ADMIN o PROFESOR');
            return await repositories.calificacionRepository.update(id, input);
        },

        eliminarCalificacion: async (_: any, { id }: any, { user, repositories }: any) => {
            if (!user || !['ADMIN', 'PROFESOR'].includes(user.role)) throw new Error('No autorizado: se requiere rol ADMIN o PROFESOR');
            return !!(await repositories.calificacionRepository.delete(id));
        },

        // ── Boletines ─────────────────────────────────────────
        generarBoletin: async (_: any, { input }: any, { repositories }: any) => {
            if (!input.estudianteId || !input.cursoId || !input.periodo || !Array.isArray(input.calificaciones))
                throw new Error('Datos incompletos para generar boletín');
            if (!input.calificaciones.length)
                throw new Error('No se proporcionaron calificaciones');
            const estudiante = await repositories.estudianteRepository.findById(input.estudianteId);
            if (!estudiante) throw new Error('Estudiante no encontrado');
            const curso = await repositories.cursoRepository.findById(input.cursoId);
            if (!curso) throw new Error('Curso no encontrado');
            const suma = input.calificaciones.reduce((acc: number, c: any) => acc + Number(c.nota), 0);
            const promedio = suma / input.calificaciones.length;
            if (isNaN(promedio)) throw new Error('No se pudo calcular el promedio');
            return await repositories.boletinRepository.create({ ...input, promedio });
        },

        actualizarBoletin: async (_: any, { id, input }: any, { repositories }: any) => {
            const suma = input.calificaciones.reduce((acc: number, c: any) => acc + c.nota, 0);
            const promedio = suma / input.calificaciones.length;
            return await repositories.boletinRepository.update(id, { ...input, promedio });
        },

        eliminarBoletin: async (_: any, { id }: any, { repositories }: any) =>
            !!(await repositories.boletinRepository.delete(id)),

        // ── Matrículas ────────────────────────────────────────
        crearMatricula: async (_: any, { input }: any, { user, repositories }: any) => {
            if (!user || user.role !== 'ADMIN') throw new Error('No autorizado: se requiere rol ADMIN');
            if (!input.estudianteId || !input.cursoId)
                throw new Error('El ID del estudiante y del curso son obligatorios');

            const estudiante = await repositories.estudianteRepository.findByCedula(input.estudianteId);
            if (!estudiante) throw new Error(`Estudiante ${input.estudianteId} no encontrado`);

            const curso = await repositories.cursoRepository.findById(input.cursoId);
            if (!curso) throw new Error(`Curso ${input.cursoId} no encontrado`);

            const existentes = await repositories.matriculaRepository.findByEstudianteId(input.estudianteId);
            const yaMatriculado = existentes.some(
                (m: any) => m.cursoId === input.cursoId && m.estado === 'ACTIVA' && m.periodo === input.periodo,
            );
            if (yaMatriculado) throw new Error(`El estudiante ya está matriculado en este curso para ${input.periodo}`);

            for (const asigId of input.asignaturas ?? []) {
                const asig = await repositories.asignaturaRepository.findById(asigId);
                if (!asig) throw new Error(`Asignatura ${asigId} no encontrada`);
                if (asig.cursoId !== input.cursoId) throw new Error(`La asignatura ${asig.nombre} no pertenece al curso`);
            }

            const matricula = await repositories.matriculaRepository.create({
                estudianteId: estudiante.cedula,
                cursoId: input.cursoId,
                estado: input.estado ?? 'ACTIVA',
                periodo: input.periodo,
                fechaMatricula: new Date(),
                asignaturas: input.asignaturas ?? [],
            });

            // Credenciales y confirmación — best-effort
            (async () => {
                try {
                    const yaExiste = await repositories.userRepository.findByUsername(estudiante.cedula);
                    if (!yaExiste) {
                        await resolvers.Mutation.enviarCrearCredenciales(_, { estudianteId: estudiante.cedula }, { user, repositories });
                    } else if (estudiante.email) {
                        await enviarConfirmacionMatricula({
                            email: estudiante.email,
                            nombre: estudiante.nombre,
                            apellido: estudiante.primerApellido,
                            curso: curso.nombre,
                            asignaturas: input.asignaturas ?? [],
                        }).catch(() => {});
                    }
                } catch { /* silencioso */ }
            })();

            return matricula;
        },

        actualizarMatricula: async (_: any, { id, input }: any, { repositories }: any) =>
            await repositories.matriculaRepository.update(id, input),

        actualizarEstadoMatricula: async (_: any, { id, estado }: any, { repositories }: any) =>
            await repositories.matriculaRepository.updateEstado(id, estado),

        eliminarMatricula: async (_: any, { id }: any, { repositories }: any) =>
            await repositories.matriculaRepository.delete(id),

        // ── Asignaturas ───────────────────────────────────────
        crearAsignatura: async (_: any, { input }: any, { user, repositories }: any) => {
            if (!user || user.role !== 'ADMIN') throw new Error('No autorizado: se requiere rol ADMIN');
            const profesor = await repositories.profesorRepository.findById(input.profesorId);
            if (!profesor) throw new Error(`Profesor ${input.profesorId} no encontrado`);
            const curso = await repositories.cursoRepository.findById(input.cursoId);
            if (!curso) throw new Error(`Curso ${input.cursoId} no encontrado`);
            return await repositories.asignaturaRepository.create({
                nombre: input.nombre,
                horario: input.horario,
                profesorId: profesor.cedula,
                cursoId: curso.id,
            });
        },

        // ── Nueva feature: crear la misma asignatura en varios cursos a la vez ──
        crearAsignaturaEnVariosCursos: async (
            _: any,
            { input }: { input: { nombre: string; profesorId: string; cursos: Array<{ cursoId: string; horario: string }> } },
            { user, repositories }: any,
        ) => {
            if (!user || user.role !== 'ADMIN') throw new Error('No autorizado: se requiere rol ADMIN');
            if (!input.nombre?.trim()) throw new Error('El nombre de la asignatura es obligatorio');
            if (!input.cursos?.length) throw new Error('Debes seleccionar al menos un curso');

            const profesor = await repositories.profesorRepository.findById(input.profesorId)
                ?? await repositories.profesorRepository.findByCedula(input.profesorId);
            if (!profesor) throw new Error(`Profesor ${input.profesorId} no encontrado`);

            const resultados: any[] = [];
            const errores: string[] = [];

            for (const { cursoId, horario } of input.cursos) {
                try {
                    const curso = await repositories.cursoRepository.findById(cursoId);
                    if (!curso) { errores.push(`Curso ${cursoId} no encontrado`); continue; }
                    if (!horario?.trim()) { errores.push(`Falta horario para el curso ${curso.nombre}`); continue; }
                    const nueva = await repositories.asignaturaRepository.create({
                        nombre: input.nombre.trim(),
                        horario: horario.trim(),
                        profesorId: profesor.cedula,
                        cursoId: curso.id,
                    });
                    resultados.push(nueva);
                } catch (e: any) {
                    errores.push(`Curso ${cursoId}: ${e.message}`);
                }
            }

            if (!resultados.length) throw new Error(`No se pudo crear ninguna asignatura. ${errores.join('; ')}`);
            return { creadas: resultados, errores };
        },

        actualizarAsignatura: async (_: any, { id, input }: any, { user, repositories }: any) => {
            if (!user || user.role !== 'ADMIN') throw new Error('No autorizado: se requiere rol ADMIN');
            return await repositories.asignaturaRepository.update(id, input);
        },

        eliminarAsignatura: async (_: any, { id }: any, { user, repositories }: any) => {
            if (!user || user.role !== 'ADMIN') throw new Error('No autorizado: se requiere rol ADMIN');
            return !!(await repositories.asignaturaRepository.delete(id));
        },

        // ── Asistencias ───────────────────────────────────────
        registrarLista: async (_: any, { input }: any, { repositories }: any) => {
            const registros = input.estudiantes.map((est: any) => ({
                estudianteId:  est.estudianteId,
                asignaturaId:  input.asignaturaId,
                fecha:         input.fecha,
                estado:        est.estado,
                periodo:       input.periodo,
                observaciones: est.observaciones ?? '',
                registradoPor: input.registradoPor ?? '',
            }));
            return await repositories.asistenciaRepository.registrarLista(registros);
        },

        crearAsistencia: async (_: any, { input }: any, { repositories }: any) =>
            await repositories.asistenciaRepository.create(input),

        actualizarAsistencia: async (_: any, { id, input }: any, { repositories }: any) =>
            await repositories.asistenciaRepository.update(id, input),

        eliminarAsistencia: async (_: any, { id }: any, { repositories }: any) =>
            await repositories.asistenciaRepository.delete(id),

        // ── Periodos ─────────────────────────────────────────
        configurarPeriodo: async (_: any, { input }: any, { user }: any) => {
            if (user?.role !== 'ADMIN') throw new Error('Solo administradores');
            const doc = await PeriodoConfigModel.findOneAndUpdate(
                { anio: input.anio, numeroPeriodo: input.numeroPeriodo },
                {
                    numCortes: input.numCortes,
                    abierto: true,
                    ...(input.fechaApertura ? { fechaApertura: new Date(input.fechaApertura) } : {}),
                    ...(input.fechaCierre   ? { fechaCierre:   new Date(input.fechaCierre)   } : {}),
                },
                { upsert: true, new: true }
            ).lean();
            return { ...(doc as any), id: (doc as any)._id?.toString(), pesoPorCorte: 100 / (doc as any).numCortes };
        },

        cerrarPeriodo: async (_: any, { anio, numeroPeriodo, fechaCierre }: any, { user }: any) => {
            if (user?.role !== 'ADMIN') throw new Error('Solo administradores');
            const doc = await PeriodoConfigModel.findOneAndUpdate(
                { anio, numeroPeriodo },
                { abierto: false, fechaCierre: fechaCierre ? new Date(fechaCierre) : new Date() },
                { upsert: true, new: true }
            ).lean();
            return { ...(doc as any), id: (doc as any)._id?.toString(), pesoPorCorte: 100 / (doc as any).numCortes };
        },

        abrirPeriodo: async (_: any, { anio, numeroPeriodo }: any, { user }: any) => {
            if (user?.role !== 'ADMIN') throw new Error('Solo administradores');
            const doc = await PeriodoConfigModel.findOneAndUpdate(
                { anio, numeroPeriodo },
                { abierto: true },
                { upsert: true, new: true }
            ).lean();
            return { ...(doc as any), id: (doc as any)._id?.toString(), pesoPorCorte: 100 / (doc as any).numCortes };
        },

        // ── Comportamiento ───────────────────────────────────
        guardarComportamiento: async (_: any, { input }: any, { user, repositories }: any) => {
            if (!user) throw new Error('No autenticado');
            const profesor = await repositories.profesorRepository.findByCedula(user.username).catch(() => null);
            if (!profesor) throw new Error('Solo profesores pueden registrar comportamiento');

            // Calcular nivel automáticamente desde la nota si se proporciona
            let nivel = input.nivel;
            if (input.nota !== undefined && input.nota !== null) {
                const n = parseFloat(input.nota);
                if (n >= 4.6)      nivel = 'Superior';
                else if (n >= 4.0) nivel = 'Alto';
                else if (n >= 3.0) nivel = 'Basico';
                else               nivel = 'Bajo';
            }

            const doc = await ComportamientoModel.findOneAndUpdate(
                { estudianteId: input.estudianteId, asignaturaId: input.asignaturaId, periodo: input.periodo, anio: input.anio },
                { ...input, nivel, profesorId: profesor.id ?? profesor.cedula },
                { upsert: true, new: true }
            ).lean();
            return { ...(doc as any), id: (doc as any)._id?.toString() };
        },

        // ── Cronograma ───────────────────────────────────────
        crearEventoCronograma: async (_: any, { input }: any, { user }: any) => {
            if (user?.role !== 'ADMIN') throw new Error('Solo administradores');
            const doc = await CronogramaModel.create({ ...input, creadoPor: user.username });
            const obj = doc.toObject() as any;
            return {
                ...obj,
                id: doc._id?.toString(),
                fechaInicio: obj.fechaInicio instanceof Date ? obj.fechaInicio.toISOString().split('T')[0] : obj.fechaInicio,
                fechaFin:    obj.fechaFin    instanceof Date ? obj.fechaFin.toISOString().split('T')[0]    : obj.fechaFin,
            };
        },

        actualizarEventoCronograma: async (_: any, { id, input }: any, { user }: any) => {
            if (user?.role !== 'ADMIN') throw new Error('Solo administradores');
            const doc = await CronogramaModel.findByIdAndUpdate(id, input, { new: true }).lean() as any;
            if (!doc) throw new Error('Evento no encontrado');
            return {
                ...doc,
                id: doc._id?.toString(),
                fechaInicio: doc.fechaInicio instanceof Date ? doc.fechaInicio.toISOString().split('T')[0] : doc.fechaInicio,
                fechaFin:    doc.fechaFin    instanceof Date ? doc.fechaFin.toISOString().split('T')[0]    : doc.fechaFin,
            };
        },

        eliminarEventoCronograma: async (_: any, { id }: any, { user }: any) => {
            if (user?.role !== 'ADMIN') throw new Error('Solo administradores');
            const result = await CronogramaModel.findByIdAndDelete(id);
            return !!result;
        },
    },

    // ═══════════════════════════
    //  TYPE RESOLVERS
    // ═══════════════════════════
    User: {
        id: (user: any) => user._id ?? user.id,
    },

    AuthPayload: {
        user: (payload: any) => payload.user,
        token: (payload: any) => payload.token,
    },

    Asignatura: {
        profesor: async (asignatura: any, _: any, { repositories }: any) => {
            if (!asignatura.profesorId) return null;
            return await repositories.profesorRepository.findById(asignatura.profesorId);
        },
        curso: async (asignatura: any, _: any, { repositories }: any) => {
            if (!asignatura.cursoId) return null;
            return await repositories.cursoRepository.findById(asignatura.cursoId);
        },
    },

    Estudiante: {
        id: (e: any) => e.cedula ?? e._id ?? e.id,
        nombre: (e: any) => e.nombre ?? '',
        primerApellido: (e: any) => e.primerApellido ?? '',
        segundoApellido: (e: any) => e.segundoApellido ?? '',
        email: (e: any) => e.email ?? '',
        cedula: (e: any) => e.cedula ?? e._id ?? e.id ?? '',
        empleado: async (e: any, _: any, { repositories }: any) => {
            const fallback = { id: e.cedula??'', cedula: e.cedula??'', nombre: e.nombre??'', primerApellido: e.primerApellido??'', segundoApellido: e.segundoApellido??'', email: e.email??'', tipo: 'estudiante' };
            if (!e.empleadoId) return fallback;
            const emp = await repositories.empleadoRepository.findById(e.empleadoId).catch(() => null);
            return emp ?? fallback;
        },
        matriculas: async (e: any, _: any, { repositories }: any) =>
            await repositories.matriculaRepository.findByEstudianteId(e.id),
    },

    Profesor: {
        id: (p: any) => p.cedula,
        empleado: async (p: any) => {
            if (!p.empleadoId) return null;
            return await EmpleadoModel.findById(p.empleadoId);
        },
    },

    Curso: {
        profesor: async (curso: any, _: any, { repositories }: any) => {
            if (!curso.profesorId) return null;
            return await repositories.profesorRepository.findById(curso.profesorId);
        },
    },

    Calificacion: {
        fecha: (cal: any) => {
            if (!cal?.fecha) return null;
            const d = new Date(cal.fecha);
            return isNaN(d.getTime()) ? null : d.toISOString();
        },
    },

    Matricula: {
        fechaMatricula: (matricula: any) => {
            if (!matricula?.fechaMatricula) return new Date().toISOString();
            const d = new Date(matricula.fechaMatricula);
            return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
        },
        estudiante: async (matricula: any, _: any, { repositories }: any) => {
            if (!matricula?.estudianteId) {
                return { id: 'n/a', cedula: 'n/a', nombre: 'Sin datos', primerApellido: '', segundoApellido: '', email: '' };
            }
            const est = await repositories.estudianteRepository.findById(matricula.estudianteId);
            return est ?? {
                id: matricula.estudianteId, cedula: matricula.estudianteId,
                nombre: 'No encontrado', primerApellido: '', segundoApellido: '', email: '',
            };
        },
        curso: async (matricula: any, _: any, { repositories }: any) => {
            if (!matricula?.cursoId) {
                return { id: 'n/a', nombre: 'Sin curso', cantidadMax: 0, profesorId: '' };
            }
            const curso = await repositories.cursoRepository.findById(matricula.cursoId);
            return curso ?? { id: matricula.cursoId, nombre: 'No encontrado', cantidadMax: 0, profesorId: '' };
        },
        asignaturas: async (matricula: any, _: any, { repositories }: any) => {
            if (!matricula?.asignaturas) return [];
            let ids: string[];
            if (Array.isArray(matricula.asignaturas)) {
                ids = matricula.asignaturas.map(String).filter(Boolean);
            } else if (typeof matricula.asignaturas === 'string') {
                ids = matricula.asignaturas.split(',').map((s: string) => s.trim()).filter(Boolean);
            } else {
                return [];
            }
            if (!ids.length) return [];
            return await repositories.asignaturaRepository.findByIds(ids);
        },
    },

    Asistencia: {
        fecha: (asistencia: any) => {
            if (!asistencia?.fecha) return null;
            const d = new Date(asistencia.fecha);
            return isNaN(d.getTime()) ? null : d.toISOString();
        },
    },

    Boletin: {
        fecha: (boletin: any) => {
            if (!boletin?.fecha) return new Date().toISOString();
            const d = new Date(boletin.fecha);
            return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
        },
        estudiante: async (boletin: any, _: any, { repositories }: any) => {
            if (!boletin.estudianteId) return null;
            if (typeof boletin.estudianteId === 'object') {
                try {
                    const idStr = boletin.estudianteId.toString?.() ?? '';
                    if (mongoose.Types.ObjectId.isValid(idStr)) {
                        const doc = await EstudianteModel.findById(idStr);
                        if (doc) return await repositories.estudianteRepository.findByCedula(doc.cedula);
                    }
                } catch { /* continuar con fallback */ }
            }
            return await repositories.estudianteRepository.findByCedula(boletin.estudianteId);
        },
        curso: async (boletin: any, _: any, { repositories }: any) =>
            await repositories.cursoRepository.findById(boletin.cursoId),
    },
};
