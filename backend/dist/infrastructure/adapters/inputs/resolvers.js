"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolvers = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const matricula_js_1 = require("../../../core/domain/matricula.js");
const EmpleadoModel_1 = require("../outputs/models/EmpleadoModel");
const mongoose_1 = __importDefault(require("mongoose"));
const EstudianteModel_js_1 = require("../outputs/models/EstudianteModel.js");
const UserModel_js_1 = require("../outputs/models/UserModel.js");
const MatriculaModel_js_1 = require("../outputs/models/MatriculaModel.js");
const CalificacionModel_js_1 = require("../outputs/models/CalificacionModel.js");
const Indicadoresmodel_js_1 = require("../outputs/models/Indicadoresmodel.js");
const PeriodoConfigModel_js_1 = require("../outputs/models/PeriodoConfigModel.js");
const ComportamientoModel_js_1 = require("../outputs/models/ComportamientoModel.js");
const AsistenciaModel_js_1 = require("../outputs/models/AsistenciaModel.js");
const CronogramaModel_js_1 = require("../outputs/models/CronogramaModel.js");
const crypto_1 = __importDefault(require("crypto"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const AuthService_1 = require("../../../core/services/AuthService");
const Emailservice_js_1 = require("../../../core/services/Emailservice.js");
const pdfService_js_1 = require("../../../core/services/pdfService.js");
// ─── Helpers ─────────────────────────────────────────────────────────────────
function generarClaveAleatoria(longitud = 8) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const bytes = crypto_1.default.randomBytes(longitud);
    return Array.from(bytes).map(b => chars[b % chars.length]).join('');
}
function normalizarRol(rol) {
    const map = {
        admin: 'ADMIN', administrator: 'ADMIN', ADMIN: 'ADMIN', ADMINISTRATOR: 'ADMIN',
        teacher: 'PROFESOR', profesor: 'PROFESOR', TEACHER: 'PROFESOR', PROFESOR: 'PROFESOR',
        student: 'ESTUDIANTE', estudiante: 'ESTUDIANTE', STUDENT: 'ESTUDIANTE', ESTUDIANTE: 'ESTUDIANTE',
    };
    return map[rol] ?? 'ESTUDIANTE';
}
const ESTADOS_MATRICULA_BLOQUEADOS = new Set(['CANCELADA', 'FINALIZADA', 'SIN_PAGAR']);
const LABEL_ESTADO_MATRICULA = {
    ACTIVA: 'activa',
    CANCELADA: 'cancelada',
    FINALIZADA: 'finalizada',
    SIN_PAGAR: 'sin pagar',
};
function periodoSortKey(periodo) {
    if (!periodo)
        return 0;
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
async function validarAccesoEstudiantePorMatricula(username) {
    const matriculas = await MatriculaModel_js_1.MatriculaModel.find({ estudianteId: username }).lean();
    if (!matriculas.length)
        return;
    const ultimaMatricula = [...matriculas].sort((a, b) => {
        const periodoDiff = periodoSortKey(b.periodo) - periodoSortKey(a.periodo);
        if (periodoDiff !== 0)
            return periodoDiff;
        return new Date(b.fechaMatricula ?? 0).getTime() - new Date(a.fechaMatricula ?? 0).getTime();
    })[0];
    const estado = String(ultimaMatricula?.estado ?? '').toUpperCase();
    if (estado === 'ACTIVA')
        return;
    if (!ESTADOS_MATRICULA_BLOQUEADOS.has(estado))
        return;
    const estadoLabel = LABEL_ESTADO_MATRICULA[estado] ?? estado.toLowerCase();
    throw new Error(`Acceso bloqueado: tu matr�cula est� ${estadoLabel}. Contacta a la instituci�n.`);
}
// ─── Helper: verificar que el periodo no esté cerrado ────────────────────────
// Parsear periodo con formato "YYYY-N" o "N"
function parsePeriodo(periodo) {
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
function mismoAnioYPrevios(periodoBase, periodoComparado) {
    if (!periodoComparado)
        return false;
    const base = parsePeriodo(periodoBase);
    const actual = parsePeriodo(String(periodoComparado));
    return actual.anio === base.anio && actual.numeroPeriodo <= base.numeroPeriodo;
}
function promedioNumeros(numeros) {
    if (!numeros.length)
        return null;
    return numeros.reduce((s, n) => s + Number(n), 0) / numeros.length;
}
function valoracionDesdeNota(nota) {
    if (nota === null)
        return 'Sin nota';
    if (nota >= 4.6)
        return 'Superior';
    if (nota >= 4.0)
        return 'Alto';
    if (nota >= 3.5)
        return 'B�sico';
    return 'Bajo';
}
function normalizarCursoNombre(nombre = '') {
    return String(nombre)
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();
}
function esCursoPreescolarNombre(nombre = '') {
    const n = normalizarCursoNombre(nombre);
    return ['parvulos', 'parvulo', 'pre jardin', 'prejardin', 'jardin', 'transicion'].some(k => n.includes(k));
}
function indicadoresParaEstudiante(ind, estudianteId) {
    const estId = estudianteId ? String(estudianteId) : '';
    const porEstudiante = Array.isArray(ind?.porEstudiante) ? ind.porEstudiante : [];
    const especifico = estId
        ? porEstudiante.find((item) => String(item.estudianteId) === estId)
        : null;
    const base = ind ?? {};
    const fuente = especifico
        ? {
            ...especifico,
            saber: Array.isArray(especifico.saber) && especifico.saber.length ? especifico.saber : base.saber,
            hacer: Array.isArray(especifico.hacer) && especifico.hacer.length ? especifico.hacer : base.hacer,
            ser: Array.isArray(especifico.ser) ? especifico.ser : base.ser,
        }
        : (estId && porEstudiante.length ? {} : base);
    const estudianteIds = especifico
        ? [String(especifico.estudianteId)]
        : porEstudiante
            .filter((item) => JSON.stringify(item.saber ?? []) === JSON.stringify(fuente.saber ?? []) &&
            JSON.stringify(item.hacer ?? []) === JSON.stringify(fuente.hacer ?? []) &&
            JSON.stringify(item.ser ?? []) === JSON.stringify(fuente.ser ?? []))
            .map((item) => String(item.estudianteId));
    return {
        id: ind?._id?.toString?.() ?? ind?.id ?? '',
        asignaturaId: String(ind?.asignaturaId ?? ''),
        periodo: String(ind?.periodo ?? ''),
        saber: Array.isArray(fuente.saber) ? fuente.saber : [],
        hacer: Array.isArray(fuente.hacer) ? fuente.hacer : [],
        ser: Array.isArray(fuente.ser) ? fuente.ser : [],
        estudianteIds,
        creadoPor: ind?.creadoPor,
    };
}
async function calcularPuestoCurso(cursoId, periodo, estudianteObjetivoId, asigIdsCurso) {
    var _a, _b;
    const matriculas = await MatriculaModel_js_1.MatriculaModel.find({
        cursoId,
        periodo,
        estado: { $in: ['ACTIVA', 'FINALIZADA'] },
    }).lean().catch(() => []);
    const estudiantesCurso = [...new Set(matriculas.map((m) => String(m.estudianteId)).filter(Boolean))];
    if (!estudiantesCurso.length || !asigIdsCurso.size)
        return null;
    const calificaciones = await CalificacionModel_js_1.CalificacionModel.find({
        estudianteId: { $in: estudiantesCurso },
        asignaturaId: { $in: [...asigIdsCurso] },
        nombreActividad: { $ne: '__boletin__' },
    }).lean().catch(() => []);
    const periodoObjetivo = parsePeriodo(periodo).numeroPeriodo;
    const estudianteMap = {};
    for (const cal of calificaciones) {
        if (!mismoAnioYPrevios(periodo, cal.periodo))
            continue;
        const estId = String(cal.estudianteId);
        const asigId = String(cal.asignaturaId);
        const numeroPeriodo = parsePeriodo(String(cal.periodo || periodo)).numeroPeriodo;
        estudianteMap[estId] || (estudianteMap[estId] = {});
        (_a = estudianteMap[estId])[asigId] || (_a[asigId] = {});
        (_b = estudianteMap[estId][asigId])[numeroPeriodo] || (_b[numeroPeriodo] = []);
        estudianteMap[estId][asigId][numeroPeriodo].push(Number(cal.nota));
    }
    const promedios = estudiantesCurso
        .map((estId) => {
        const asignaturas = estudianteMap[estId] || {};
        const promediosMaterias = Object.values(asignaturas)
            .map((notasPorPeriodo) => {
            const promediosPeriodos = [1, 2, 3].map((numeroPeriodo) => promedioNumeros(notasPorPeriodo[numeroPeriodo] ?? []));
            const acumulados = promediosPeriodos
                .slice(0, periodoObjetivo)
                .filter((nota) => nota !== null);
            return promedioNumeros(acumulados);
        })
            .filter((nota) => nota !== null);
        const promedio = promedioNumeros(promediosMaterias);
        return promedio === null ? null : { estId, promedio };
    })
        .filter((item) => item !== null)
        .sort((a, b) => b.promedio - a.promedio);
    if (!promedios.length)
        return null;
    let puesto = 1;
    let anterior = null;
    for (let i = 0; i < promedios.length; i++) {
        const actual = promedios[i];
        if (anterior !== null && Math.abs(actual.promedio - anterior) > 0.0001) {
            puesto = i + 1;
        }
        if (actual.estId === String(estudianteObjetivoId))
            return puesto;
        anterior = actual.promedio;
    }
    return null;
}
async function generarBoletinAcumuladoBase64(repositories, estudianteId, periodo, observacionGeneral = '') {
    const estudiantePorCedula = await repositories.estudianteRepository.findByCedula(estudianteId).catch(() => null);
    const estudiante = estudiantePorCedula ??
        await repositories.estudianteRepository.findById(estudianteId).catch(() => null);
    if (!estudiante)
        throw new Error(`Estudiante ${estudianteId} no encontrado`);
    const estIdBoletin = estudiante.cedula ?? estudianteId;
    const matriculas = await repositories.matriculaRepository
        .findByEstudianteId(estudiante.cedula ?? estudianteId).catch(() => []);
    const mat = matriculas.find((m) => m.periodo === periodo) ?? matriculas[0];
    const curso = mat ? await repositories.cursoRepository.findById(mat.cursoId).catch(() => null) : null;
    const esPreescolar = esCursoPreescolarNombre(curso?.nombre ?? '');
    const todasLasCalificaciones = await repositories.calificacionRepository.findByEstudianteId(estIdBoletin).catch(() => []);
    const calsAcumuladasBase = (todasLasCalificaciones || []).filter((c) => c.nombreActividad !== '__boletin__' && mismoAnioYPrevios(periodo, c.periodo));
    const asignaturasCurso = curso
        ? await repositories.asignaturaRepository.findByCursoId(String(curso.id ?? curso._id)).catch(() => [])
        : [];
    const asigIdsCurso = new Set((asignaturasCurso || []).map((a) => String(a.id ?? a._id)));
    let calsAcumuladas = calsAcumuladasBase;
    const calsCursoPeriodo = calsAcumuladasBase.filter((c) => asigIdsCurso.has(String(c.asignaturaId)) && String(c.periodo) === String(periodo));
    if (asigIdsCurso.size && calsCursoPeriodo.length) {
        calsAcumuladas = calsAcumuladasBase.filter((c) => asigIdsCurso.has(String(c.asignaturaId)));
    }
    const calsDelPeriodo = calsAcumuladas.filter((c) => String(c.periodo) === String(periodo));
    if (!calsDelPeriodo.length && !esPreescolar)
        throw new Error('No hay calificaciones para este per�odo');
    const asigIdsUnicos = [...new Set([
            ...calsAcumuladas.map((c) => String(c.asignaturaId)),
            ...(esPreescolar ? [...asigIdsCurso] : []),
        ])];
    const asigsBatch = await repositories.asignaturaRepository.findByIds(asigIdsUnicos).catch(() => []);
    const asigById = {};
    for (const a of asigsBatch)
        asigById[String(a.id ?? a._id)] = a;
    const asigMap = {};
    for (const cal of calsAcumuladas) {
        const k = String(cal.asignaturaId);
        if (!asigMap[k]) {
            asigMap[k] = { asig: asigById[k] ?? null, notasPorPeriodo: {} };
        }
        const numeroPeriodo = parsePeriodo(String(cal.periodo || periodo)).numeroPeriodo;
        if (!asigMap[k].notasPorPeriodo[numeroPeriodo])
            asigMap[k].notasPorPeriodo[numeroPeriodo] = [];
        asigMap[k].notasPorPeriodo[numeroPeriodo].push(Number(cal.nota));
    }
    if (esPreescolar) {
        for (const a of asignaturasCurso || []) {
            const k = String(a.id ?? a._id);
            if (!asigMap[k])
                asigMap[k] = { asig: asigById[k] ?? a, notasPorPeriodo: {} };
        }
    }
    const profIdSet = new Set();
    for (const { asig } of Object.values(asigMap)) {
        if (asig?.profesorId)
            profIdSet.add(String(asig.profesorId));
    }
    const profIds = [...profIdSet];
    const profsBatch = profIds.length
        ? await Promise.all(profIds.map(id => repositories.profesorRepository.findById(id).catch(() => null)))
        : [];
    const profById = {};
    profsBatch.forEach(p => { if (p)
        profById[String(p.id ?? p._id)] = p; });
    const asigIdsList = Object.keys(asigMap);
    const estIdStr = String(estudiante.cedula ?? estudiante.id);
    const [indicadoresBatch, comportamientosBatch, asistenciasData] = await Promise.all([
        Indicadoresmodel_js_1.IndicadoresModel.find({
            $or: [
                { asignaturaId: { $in: asigIdsList } },
                { asignaturaId: { $in: asigIdsList.map(id => id.toString()) } },
            ],
            periodo,
        }).lean().catch(() => []),
        ComportamientoModel_js_1.ComportamientoModel.find({
            estudianteId: estIdStr,
            asignaturaId: { $in: asigIdsList },
            periodo,
        }).lean().catch(() => []),
        AsistenciaModel_js_1.AsistenciaModel.aggregate([
            { $match: { estudianteId: estIdStr, asignaturaId: { $in: asigIdsList }, periodo, estado: { $in: ['AUSENTE', 'EXCUSA'] } } },
            { $group: { _id: { asignaturaId: '$asignaturaId', estado: '$estado' }, count: { $sum: 1 } } },
        ]).catch(() => []),
    ]);
    const indByAsig = {};
    for (const ind of indicadoresBatch)
        indByAsig[String(ind.asignaturaId)] = ind;
    const compByAsig = {};
    for (const comp of comportamientosBatch)
        compByAsig[String(comp.asignaturaId)] = comp;
    const faltasByAsig = {};
    const faltasJustificadasByAsig = {};
    for (const row of asistenciasData) {
        const asignaturaId = String(row._id?.asignaturaId ?? row._id);
        const estado = String(row._id?.estado ?? 'AUSENTE');
        if (estado === 'EXCUSA')
            faltasJustificadasByAsig[asignaturaId] = row.count;
        else
            faltasByAsig[asignaturaId] = row.count;
    }
    const periodoObjetivo = parsePeriodo(periodo).numeroPeriodo;
    const calificacionesBoletin = Object.entries(asigMap).map(([asignaturaId, { asig, notasPorPeriodo }]) => {
        const promediosPeriodos = [1, 2, 3].map((numeroPeriodo) => promedioNumeros(notasPorPeriodo[numeroPeriodo] ?? []));
        const promediosAcumulados = promediosPeriodos
            .slice(0, periodoObjetivo)
            .filter((nota) => nota !== null);
        const prom = promedioNumeros(promediosAcumulados) ?? 0;
        const valoracion = valoracionDesdeNota(prom);
        const resumenNotas = periodoObjetivo === 1
            ? `P1: ${promediosPeriodos[0] !== null ? promediosPeriodos[0].toFixed(2) : '�'}`
            : periodoObjetivo === 2
                ? `P1: ${promediosPeriodos[0] !== null ? promediosPeriodos[0].toFixed(2) : '�'} � P2: ${promediosPeriodos[1] !== null ? promediosPeriodos[1].toFixed(2) : '�'} � Promedio: ${prom.toFixed(2)}`
                : `P1: ${promediosPeriodos[0] !== null ? promediosPeriodos[0].toFixed(2) : '�'} � P2: ${promediosPeriodos[1] !== null ? promediosPeriodos[1].toFixed(2) : '�'} � P3: ${promediosPeriodos[2] !== null ? promediosPeriodos[2].toFixed(2) : '�'} � Nota final: ${prom.toFixed(2)}`;
        let docenteNombre = 'Docente';
        if (asig?.profesorId) {
            const doc = profById[String(asig.profesorId)];
            if (doc)
                docenteNombre = `${doc.nombre} ${doc.primerApellido}`;
        }
        const ind = indByAsig[asignaturaId] ? indicadoresParaEstudiante(indByAsig[asignaturaId], estIdStr) : null;
        const comp = compByAsig[asignaturaId] ?? null;
        const faltasSinJustificar = faltasByAsig[asignaturaId] ?? 0;
        const faltasJustificadas = faltasJustificadasByAsig[asignaturaId] ?? 0;
        const faltasCount = faltasSinJustificar + faltasJustificadas;
        return {
            asignaturaId,
            asignaturaNombre: asig?.nombre ?? asignaturaId,
            docenteNombre,
            valoracion,
            nota: prom,
            resumenNotas,
            faltas: faltasCount,
            faltasJustificadas,
            observacion: '',
            indicadores: {
                saber: ind?.saber ?? [],
                hacer: ind?.hacer ?? [],
                ser: ind?.ser ?? [],
            },
            comportamiento: comp ? { nota: comp.nota, nivel: comp.nivel, descripcion: comp.descripcion } : undefined,
        };
    });
    let directorNombre = 'Coordinaci�n Acad�mica';
    if (curso?.profesorId) {
        const dirProf = await repositories.profesorRepository.findById(curso.profesorId).catch(() => null);
        if (dirProf)
            directorNombre = `${dirProf.nombre} ${dirProf.primerApellido}`;
    }
    const puestoCurso = curso
        ? await calcularPuestoCurso(String(curso.id ?? curso._id), String(periodo), String(estIdBoletin), asigIdsCurso.size ? asigIdsCurso : new Set(asigIdsList.map(String)))
        : null;
    const buf = await pdfService_js_1.pdfService.generateBoletinGardner({
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
        puestoCurso,
    });
    return Buffer.from(buf).toString('base64');
}
async function validarCalificacionNoPreescolar(asignaturaId, repositories) {
    const asignatura = await repositories.asignaturaRepository.findById(asignaturaId).catch(() => null);
    if (!asignatura?.cursoId)
        return;
    const curso = await repositories.cursoRepository.findById(String(asignatura.cursoId)).catch(() => null);
    if (curso && esCursoPreescolarNombre(curso.nombre)) {
        throw new Error('En preescolar no se registran notas num�ricas por materia. Usa indicadores pedag�gicos.');
    }
}
async function validarComportamientoNoPreescolar(asignaturaId, repositories) {
    const asignatura = await repositories.asignaturaRepository.findById(asignaturaId).catch(() => null);
    if (!asignatura?.cursoId)
        return;
    const curso = await repositories.cursoRepository.findById(String(asignatura.cursoId)).catch(() => null);
    if (curso && esCursoPreescolarNombre(curso.nombre)) {
        throw new Error('En preescolar no se registra comportamiento. Usa solo indicadores pedag�gicos.');
    }
}
async function verificarPeriodoAbierto(periodo) {
    const { anio, numeroPeriodo } = parsePeriodo(periodo);
    const config = await PeriodoConfigModel_js_1.PeriodoConfigModel.findOne({ anio, numeroPeriodo });
    if (!config)
        return; // sin configuración = abierto por defecto
    if (!config.abierto) {
        throw new Error(`El periodo ${periodo} est� cerrado. Contacte al administrador para reactivarlo.`);
    }
    if (config.fechaCierre && new Date() > config.fechaCierre) {
        await PeriodoConfigModel_js_1.PeriodoConfigModel.updateOne({ anio, numeroPeriodo }, { abierto: false });
        throw new Error(`El periodo ${periodo} cerró el ${config.fechaCierre.toLocaleDateString('es-CO')}. Contacte al administrador.`);
    }
}
// ─── Resolvers ────────────────────────────────────────────────────────────────
exports.resolvers = {
    // ═══════════════════════════
    //  QUERIES
    // ═══════════════════════════
    Query: {
        me: async (_, __, { user, repositories }) => {
            if (!user)
                throw new Error('No autenticado');
            return repositories.userRepository.findByUsername(user.username);
        },
        // Estudiantes
        estudiantes: async (_, __, { repositories }) => await repositories.estudianteRepository.findAll(),
        estudiante: async (_, { id }, { repositories }) => await repositories.estudianteRepository.findById(id),
        estudiantesPorIds: async (_, { ids }, { repositories }) => {
            if (!ids?.length)
                return [];
            return await repositories.estudianteRepository.findByIds(ids);
        },
        // Profesores
        profesores: async (_, __, { repositories }) => await repositories.profesorRepository.findAll(),
        profesor: async (_, { id }, { repositories }) => await repositories.profesorRepository.findById(id),
        // Cursos
        cursos: async (_, __, { repositories }) => await repositories.cursoRepository.findAll(),
        curso: async (_, { id }, { repositories }) => await repositories.cursoRepository.findById(id),
        // Calificaciones
        calificaciones: async (_, __, { repositories }) => await repositories.calificacionRepository.findAll(),
        calificacion: async (_, { id }, { repositories }) => await repositories.calificacionRepository.findById(id),
        calificacionesPorEstudiante: async (_, { estudianteId }, { repositories }) => await repositories.calificacionRepository.findByEstudianteId(estudianteId),
        calificacionesPorCurso: async (_, { cursoId }, { repositories }) => await repositories.calificacionRepository.findByCursoId(cursoId),
        calificacionesPorAsignaturaYPeriodo: async (_, { asignaturaId, periodo }, { repositories }) => {
            // Fix N+1: query directa en MongoDB en lugar de findAll() + filter en JS
            return await repositories.calificacionRepository.findByAsignaturaYPeriodo(asignaturaId, periodo);
        },
        // Indicadores
        indicadoresPorAsignatura: async (_, { asignaturaId, periodo, estudianteId }) => {
            const doc = await Indicadoresmodel_js_1.IndicadoresModel.findOne({ asignaturaId, periodo }).lean();
            return doc ? indicadoresParaEstudiante(doc, estudianteId) : null;
        },
        indicadoresPorProfesor: async (_, { profesorId, periodo }, { repositories }) => {
            const asigs = await repositories.asignaturaRepository.findByProfesorId(profesorId);
            const ids = asigs.map((a) => a.id);
            if (!ids.length)
                return [];
            const docs = await Indicadoresmodel_js_1.IndicadoresModel.find({ asignaturaId: { $in: ids }, periodo }).lean();
            return docs.map((doc) => indicadoresParaEstudiante(doc));
        },
        // Configuración de periodos
        periodoConfig: async (_, { anio, numeroPeriodo }) => {
            const config = await PeriodoConfigModel_js_1.PeriodoConfigModel.findOne({ anio, numeroPeriodo }).lean();
            if (!config)
                return null;
            return { ...config, id: config._id?.toString(), pesoPorCorte: 100 / config.numCortes };
        },
        periodosConfig: async (_, { anio }) => {
            const configs = await PeriodoConfigModel_js_1.PeriodoConfigModel.find({ anio }).sort({ numeroPeriodo: 1 }).lean();
            return configs.map((c) => ({
                ...c,
                id: c._id?.toString(),
                pesoPorCorte: 100 / c.numCortes,
                fechaApertura: c.fechaApertura ? new Date(c.fechaApertura).toISOString() : null,
                fechaCierre: c.fechaCierre ? new Date(c.fechaCierre).toISOString() : null,
            }));
        },
        // Comportamiento
        comportamientosPorAsignatura: async (_, { asignaturaId, periodo }) => await ComportamientoModel_js_1.ComportamientoModel.find({ asignaturaId, periodo }).lean(),
        comportamientoEstudiante: async (_, { estudianteId, asignaturaId, periodo }) => await ComportamientoModel_js_1.ComportamientoModel.findOne({ estudianteId, asignaturaId, periodo }).lean(),
        // Cronograma
        cronograma: async (_, { anio }) => {
            const inicio = new Date(`${anio}-01-01`);
            const fin = new Date(`${anio}-12-31`);
            const docs = await CronogramaModel_js_1.CronogramaModel.find({ fechaInicio: { $gte: inicio, $lte: fin } })
                .sort({ fechaInicio: 1 }).lean();
            return docs.map((d) => ({
                ...d,
                id: d._id?.toString(),
                fechaInicio: d.fechaInicio instanceof Date ? d.fechaInicio.toISOString().split('T')[0] : d.fechaInicio,
                fechaFin: d.fechaFin instanceof Date ? d.fechaFin.toISOString().split('T')[0] : d.fechaFin,
            }));
        },
        cronogramaPorCurso: async (_, { cursoId, anio }) => {
            const inicio = new Date(`${anio}-01-01`);
            const fin = new Date(`${anio}-12-31`);
            const docs = await CronogramaModel_js_1.CronogramaModel.find({
                $or: [{ cursoId }, { cursoId: null }, { cursoId: { $exists: false } }],
                fechaInicio: { $gte: inicio, $lte: fin }
            }).sort({ fechaInicio: 1 }).lean();
            return docs.map((d) => ({
                ...d,
                id: d._id?.toString(),
                fechaInicio: d.fechaInicio instanceof Date ? d.fechaInicio.toISOString().split('T')[0] : d.fechaInicio,
                fechaFin: d.fechaFin instanceof Date ? d.fechaFin.toISOString().split('T')[0] : d.fechaFin,
            }));
        },
        // Boletines
        boletines: async (_, __, { repositories }) => await repositories.boletinRepository.findAll(),
        boletin: async (_, { id }, { repositories }) => await repositories.boletinRepository.findById(id),
        boletinesPorEstudiante: async (_, { estudianteId }, { repositories }) => await repositories.boletinRepository.findByEstudianteId(estudianteId),
        exportarBoletin: async (_, { id }, { repositories }) => {
            const boletin = await repositories.boletinRepository.findById(id);
            if (!boletin)
                throw new Error(`Bolet�n ${id} no encontrado`);
            return await generarBoletinAcumuladoBase64(repositories, String(boletin.estudianteId), String(boletin.periodo), String(boletin.observaciones ?? ''));
        },
        exportarBoletinEstudiante: async (_, { estudianteId, periodo }, { repositories }) => {
            return await generarBoletinAcumuladoBase64(repositories, String(estudianteId), String(periodo), '');
        },
        boletinesPorCursoPeriodo: async (_, { cursoId, periodo }, { repositories }) => {
            // Fix N+1: query directa en lugar de findAll() + filter en JS
            return await repositories.boletinRepository.findByCursoYPeriodo(cursoId, periodo);
        },
        // Matrículas
        matriculas: async (_, __, { repositories }) => await repositories.matriculaRepository.findAll(),
        matricula: async (_, { id }, { repositories }) => await repositories.matriculaRepository.findById(id),
        matriculasPorEstudiante: async (_, { estudianteId }, { repositories }) => {
            const est = await repositories.estudianteRepository.findByCedula(estudianteId);
            if (!est)
                return [];
            return await repositories.matriculaRepository.findByEstudianteId(est.cedula);
        },
        matriculasPorAsignatura: async (_, { asignaturaId }) => {
            const docs = await MatriculaModel_js_1.MatriculaModel.find({ asignaturas: asignaturaId }).exec();
            return docs
                .filter(d => d.estudianteId)
                .map(d => new matricula_js_1.Matricula(d._id.toString(), d.estudianteId, d.cursoId, (d.asignaturas || []).map((a) => a.toString()), d.estado, d.periodo, d.fechaMatricula));
        },
        // Asignaturas
        asignaturas: async (_, __, { repositories }) => await repositories.asignaturaRepository.findAll(),
        asignatura: async (_, { id }, { repositories }) => await repositories.asignaturaRepository.findById(id),
        asignaturasPorProfesor: async (_, { profesorId }, { repositories }) => {
            const prof = await repositories.profesorRepository.findById(profesorId);
            if (!prof)
                return [];
            return await repositories.asignaturaRepository.findByProfesorId(profesorId);
        },
        asignaturasPorCurso: async (_, { cursoId }, { repositories }) => await repositories.asignaturaRepository.findByCursoId(cursoId),
        // Asistencias
        asistencias: async (_, __, { repositories }) => await repositories.asistenciaRepository.findAll(),
        asistencia: async (_, { id }, { repositories }) => await repositories.asistenciaRepository.findById(id),
        asistenciasPorAsignatura: async (_, { asignaturaId }, { repositories }) => await repositories.asistenciaRepository.findByAsignaturaId(asignaturaId),
        asistenciasPorFecha: async (_, { asignaturaId, fecha }, { repositories }) => await repositories.asistenciaRepository.findByAsignaturaFecha(asignaturaId, fecha),
        asistenciasPorPeriodo: async (_, { asignaturaId, periodo }, { repositories }) => await repositories.asistenciaRepository.findByAsignaturaPeriodo(asignaturaId, periodo),
        resumenAsistencia: async (_, { asignaturaId, periodo }, { repositories }) => {
            const regs = await repositories.asistenciaRepository.findByAsignaturaPeriodo(asignaturaId, periodo);
            const map = {};
            for (const r of regs) {
                if (!map[r.estudianteId])
                    map[r.estudianteId] = [];
                map[r.estudianteId].push(r);
            }
            return Object.entries(map).map(([estudianteId, rs]) => {
                const total = rs.length;
                const pres = rs.filter(r => r.estado === 'PRESENTE').length;
                const aus = rs.filter(r => r.estado === 'AUSENTE').length;
                const tard = rs.filter(r => r.estado === 'TARDE').length;
                const exc = rs.filter(r => r.estado === 'EXCUSA').length;
                return {
                    estudianteId, totalClases: total, presentes: pres,
                    ausentes: aus, tardes: tard, excusas: exc,
                    porcentajeAsistencia: total > 0 ? Math.round(((pres + exc) / total) * 1000) / 10 : 0,
                };
            });
        },
        asistenciasPorEstudiante: async (_, { estudianteId, periodo }, { repositories }) => {
            const todas = await repositories.asistenciaRepository.findByEstudianteId(estudianteId);
            return periodo ? todas.filter((a) => a.periodo === periodo) : todas;
        },
        resumenAsistenciaEstudiante: async (_, { estudianteId, periodo }, { repositories }) => {
            const todas = await repositories.asistenciaRepository.findByEstudianteId(estudianteId);
            const regs = periodo ? todas.filter((a) => a.periodo === periodo) : todas;
            const map = {};
            for (const r of regs) {
                const k = String(r.asignaturaId);
                if (!map[k])
                    map[k] = [];
                map[k].push(r);
            }
            return Object.entries(map).map(([asignaturaId, rs]) => {
                const total = rs.length;
                const pres = rs.filter(r => r.estado === 'PRESENTE').length;
                const aus = rs.filter(r => r.estado === 'AUSENTE').length;
                const tard = rs.filter(r => r.estado === 'TARDE').length;
                const exc = rs.filter(r => r.estado === 'EXCUSA').length;
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
        login: async (_, { identifier, password }, { repositories }) => {
            const authService = new AuthService_1.AuthService(repositories.userRepository);
            let result;
            try {
                result = await authService.authenticate(identifier, password);
            }
            catch (error) {
                const identificador = String(identifier ?? '').trim();
                const clave = String(password ?? '').trim();
                const intentoAutoProvision = identificador &&
                    clave &&
                    identificador === clave &&
                    /^\d+$/.test(identificador);
                if (!intentoAutoProvision)
                    throw error;
                const estudiante = await repositories.estudianteRepository.findByCedula(identificador).catch(() => null);
                if (!estudiante)
                    throw error;
                await authService.createUserCredentials(identificador, 'ESTUDIANTE');
                result = await authService.authenticate(identificador, clave);
            }
            if (!result?.user)
                throw new Error('Credenciales inv�lidas');
            const user = result.user;
            const role = normalizarRol(user.role);
            let email = user.email ?? user.username;
            // Enriquecer email para estudiantes
            const isEstudiante = ['student', 'estudiante', 'STUDENT', 'ESTUDIANTE'].includes(user.role);
            if (isEstudiante) {
                await validarAccesoEstudiantePorMatricula(user.username);
                const est = await repositories.estudianteRepository.findByCedula(user.username).catch(() => null);
                if (est?.email)
                    email = est.email;
            }
            const expiresIn = '24h';
            const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
            const token = jsonwebtoken_1.default.sign({ id: user.id, username: user.username, role, email }, process.env.JWT_SECRET, { expiresIn });
            return {
                token,
                user: { id: user.id, username: user.username, role, email },
                isFirstLogin: result.isFirstLogin ?? false,
                expiresAt,
            };
        },
        register: async (_, { email, password, role }, { user, repositories }) => {
            if (!user || user.role !== 'ADMIN')
                throw new Error('No autorizado: se requiere rol ADMIN');
            const authService = new AuthService_1.AuthService(repositories.userRepository);
            const result = await authService.register(email, password, role);
            return { token: result.token, user: { id: result.user.id, username: email, email, role: normalizarRol(result.user.role) } };
        },
        crearAdmin: async (_, { email, password }, { user, repositories }) => {
            if (!user || user.role !== 'ADMIN')
                throw new Error('No autorizado: se requiere rol ADMIN');
            const authService = new AuthService_1.AuthService(repositories.userRepository);
            const result = await authService.register(email, password, 'ADMIN');
            return { token: result.token, user: { id: result.user.id, email, role: 'ADMIN' } };
        },
        cambiarPassword: async (_, { username, oldPassword, newPassword }, { repositories }) => {
            const user = await repositories.userRepository.findByUsername(username);
            if (!user)
                throw new Error('Usuario no encontrado');
            const authService = new AuthService_1.AuthService(repositories.userRepository);
            try {
                await authService.authenticate(username, oldPassword);
            }
            catch {
                throw new Error('La contrase�a actual es incorrecta');
            }
            if (!newPassword || newPassword.length < 6)
                throw new Error('M�nimo 6 caracteres');
            const hashed = await bcryptjs_1.default.hash(newPassword, 10);
            const ok = await repositories.userRepository.updatePassword(username, hashed);
            if (!ok)
                throw new Error('No se pudo actualizar la contrase�a');
            return true;
        },
        cambiarPasswordPrimerLogin: async (_, { username, newPassword }, { user, repositories }) => {
            // Requiere token válido y que el usuario solo pueda cambiar su propia contraseña
            if (!user)
                throw new Error('No autenticado');
            if (user.username !== username)
                throw new Error('No autorizado: solo puedes cambiar tu propia contrase�a');
            const dbUser = await repositories.userRepository.findByUsername(username);
            if (!dbUser)
                throw new Error('Credenciales inv�lidas');
            if (!newPassword || newPassword.length < 6)
                throw new Error('M�nimo 6 caracteres');
            const hashed = await bcryptjs_1.default.hash(newPassword, 10);
            const ok = await repositories.userRepository.updatePassword(username, hashed);
            if (!ok)
                throw new Error('No se pudo actualizar la contrase�a');
            return true;
        },
        olvidarPassword: async (_, { identifier }, { repositories }) => {
            let email = '', nombre = '', cedula = identifier;
            // Fix N+1: buscar primero por cédula, luego por email directo en DB (sin findAll)
            const est = await repositories.estudianteRepository.findByCedula(identifier).catch(() => null)
                ?? await repositories.estudianteRepository.findByEmail(identifier).catch(() => null);
            if (est) {
                email = est.email;
                nombre = est.nombre;
                cedula = est.cedula;
            }
            else {
                const prof = await repositories.profesorRepository.findByCedula(identifier).catch(() => null)
                    ?? await repositories.profesorRepository.findByEmail(identifier).catch(() => null);
                if (prof) {
                    email = prof.email;
                    nombre = prof.nombre;
                    cedula = prof.cedula;
                }
            }
            if (!email)
                throw new Error('No se encontr� usuario con ese identificador');
            const clave = generarClaveAleatoria();
            const passwordReset = await repositories.userRepository.resetPassword(cedula, clave);
            if (!passwordReset)
                throw new Error('No se pudo restablecer la contrase�a');
            const emailSent = await (0, Emailservice_js_1.enviarPasswordRecuperacion)({ email, nombre, cedula, passwordTemporal: clave });
            if (!emailSent)
                throw new Error('La contrase�a se restableci�, pero no se pudo enviar el correo');
            return true;
        },
        // ── Credenciales ──────────────────────────────────────
        enviarCrearCredenciales: async (_, { estudianteId, profesorId }, { user, repositories }) => {
            if (!user || user.role !== 'ADMIN')
                throw new Error('No autorizado: se requiere rol ADMIN');
            if (!estudianteId && !profesorId)
                throw new Error('Proporciona estudianteId o profesorId');
            let cedula, email, nombre, apellido, role;
            if (profesorId) {
                const prof = await repositories.profesorRepository.findByCedula(profesorId);
                if (!prof)
                    throw new Error('Profesor no encontrado');
                cedula = profesorId;
                email = prof.email;
                nombre = prof.nombre;
                apellido = prof.primerApellido;
                role = 'PROFESOR';
            }
            else {
                const est = await repositories.estudianteRepository.findByCedula(estudianteId);
                if (!est)
                    throw new Error('Estudiante no encontrado');
                cedula = estudianteId;
                email = est.email;
                nombre = est.nombre;
                apellido = est.primerApellido;
                role = 'ESTUDIANTE';
            }
            const yaExiste = await repositories.userRepository.findByUsername(cedula);
            if (yaExiste)
                return true; // ya tiene credenciales, no generar duplicado
            const authService = new AuthService_1.AuthService(repositories.userRepository);
            const password = await authService.createUserCredentials(cedula, role);
            if (email) {
                const emailSent = await (0, Emailservice_js_1.enviarCredenciales)({ email, nombre, apellido, cedula, password, rol: role });
                if (!emailSent)
                    throw new Error('Las credenciales se crearon, pero no se pudo enviar el correo');
            }
            else {
                console.warn(`No se pudo enviar credenciales por email a ${cedula}: email no registrado`);
            }
            return true;
        },
        generarClaveProvisional: async (_, { estudianteId, profesorId }, { user, repositories }) => {
            if (!user || user.role !== 'ADMIN')
                throw new Error('No autorizado: se requiere rol ADMIN');
            const esProfesor = !!profesorId && !estudianteId;
            let cedula, email, nombre, rolUsuario;
            if (esProfesor) {
                const prof = await repositories.profesorRepository.findByCedula(profesorId);
                if (!prof)
                    throw new Error('Profesor no encontrado');
                cedula = profesorId;
                email = prof.email ?? '';
                nombre = `${prof.nombre} ${prof.primerApellido}`;
                rolUsuario = 'PROFESOR';
            }
            else {
                const est = await repositories.estudianteRepository.findByCedula(estudianteId);
                if (!est)
                    throw new Error('Estudiante no encontrado');
                cedula = estudianteId;
                email = est.email ?? '';
                nombre = `${est.nombre} ${est.primerApellido}`;
                rolUsuario = 'ESTUDIANTE';
            }
            const clave = generarClaveAleatoria();
            const userExists = await repositories.userRepository.findByUsername(cedula);
            if (userExists) {
                await repositories.userRepository.resetPassword(cedula, clave);
            }
            else {
                await repositories.userRepository.create({ username: cedula, password: clave, role: rolUsuario, email: email || undefined });
            }
            if (email) {
                const emailSent = await (0, Emailservice_js_1.enviarPasswordRecuperacion)({ email, nombre: nombre.split(' ')[0], cedula, passwordTemporal: clave });
                if (!emailSent)
                    throw new Error('La clave provisional se gener�, pero no se pudo enviar el correo');
            }
            else {
                console.warn(`No se pudo enviar la clave provisional por email a ${cedula}: email no registrado`);
            }
            return true;
        },
        // ── Limpieza ──────────────────────────────────────────
        limpiarRegistrosProblematicos: async (_, __, { user }) => {
            if (!user || user.role !== 'ADMIN')
                throw new Error('No autorizado: se requiere rol ADMIN');
            await MatriculaModel_js_1.MatriculaModel.deleteMany({ $or: [{ estudianteId: null }, { estudianteId: '' }] }).exec();
            return true;
        },
        // -- Indicadores ---------------------------------------
        guardarIndicadores: async (_, { asignaturaId, periodo, saber, hacer, ser, estudianteIds }, { user }) => {
            const creadoPor = user?.username ?? 'sistema';
            const seleccionados = Array.isArray(estudianteIds)
                ? [...new Set(estudianteIds.map((id) => String(id).trim()).filter(Boolean))]
                : [];
            let doc = await Indicadoresmodel_js_1.IndicadoresModel.findOne({ asignaturaId, periodo }).exec();
            if (!doc) {
                doc = new Indicadoresmodel_js_1.IndicadoresModel({ asignaturaId, periodo, saber: [], hacer: [], ser: [], porEstudiante: [], creadoPor });
            }
            if (seleccionados.length) {
                const actuales = Array.isArray(doc.porEstudiante) ? doc.porEstudiante : [];
                for (const estudianteId of seleccionados) {
                    const idx = actuales.findIndex((item) => String(item.estudianteId) === estudianteId);
                    const item = { estudianteId, saber, hacer, ser };
                    if (idx >= 0)
                        actuales[idx] = item;
                    else
                        actuales.push(item);
                }
                doc.porEstudiante = actuales;
            }
            else {
                doc.saber = saber;
                doc.hacer = hacer;
                doc.ser = ser;
            }
            doc.creadoPor = creadoPor;
            await doc.save();
            return {
                id: doc._id?.toString(),
                asignaturaId: String(doc.asignaturaId),
                periodo: doc.periodo,
                saber: saber || [],
                hacer: hacer || [],
                ser: ser || [],
                estudianteIds: seleccionados,
                creadoPor: doc.creadoPor,
            };
        },
        eliminarIndicadores: async (_, { asignaturaId, periodo }) => {
            const result = await Indicadoresmodel_js_1.IndicadoresModel.deleteOne({ asignaturaId, periodo }).exec();
            return result.deletedCount > 0;
        },
        // -- Boletín avanzado ──────────────────────────────────
        guardarCalificacionBoletin: async (_, { estudianteId, asignaturaId, periodo, valoracion, nota, faltas, observacion }, { repositories }) => {
            // Fix N+1: buscar directamente sin traer todas las calificaciones a memoria
            const todasDelEstudiante = await repositories.calificacionRepository.findByEstudianteId(estudianteId);
            const existente = todasDelEstudiante.find((c) => String(c.asignaturaId) === String(asignaturaId) &&
                c.periodo === periodo &&
                c.nombreActividad === '__boletin__');
            const input = {
                estudianteId, asignaturaId, periodo, nota,
                observaciones: observacion ?? '',
                tipoActividad: 'EXAMEN',
                nombreActividad: '__boletin__',
                corte: 0,
            };
            if (existente) {
                await repositories.calificacionRepository.update(existente.id, input);
            }
            else {
                await repositories.calificacionRepository.create(input);
            }
            return true;
        },
        exportarBoletinCompleto: async (_, { estudianteId, periodo, observacionGeneral }, { repositories }) => {
            return await generarBoletinAcumuladoBase64(repositories, String(estudianteId), String(periodo), String(observacionGeneral ?? ''));
        },
        // ── Estudiantes ───────────────────────────────────────
        crearEstudiante: async (_, { input }, { user, repositories }) => {
            if (!user || user.role !== 'ADMIN')
                throw new Error('No autorizado: se requiere rol ADMIN');
            const cedula = String(input.cedula ?? '').trim();
            if (!cedula)
                throw new Error('La c�dula es obligatoria');
            if (!input.nombre?.trim() || !input.primerApellido?.trim())
                throw new Error('Nombre y primer apellido son obligatorios');
            const existe = await repositories.estudianteRepository.findByCedula(cedula);
            if (existe)
                throw new Error(`Ya existe un estudiante con c�dula ${cedula}`);
            return await repositories.estudianteRepository.create({
                cedula,
                nombre: input.nombre.trim(),
                primerApellido: input.primerApellido.trim(),
                segundoApellido: (input.segundoApellido ?? '').trim(),
                email: (input.email ?? '').trim(),
                telefono: (input.telefono ?? '').trim(),
                direccion: (input.direccion ?? '').trim(),
                acudiente: (input.acudiente ?? '').trim(),
            });
        },
        actualizarEstudiante: async (_, { id, input }, { user, repositories }) => {
            if (!user || user.role !== 'ADMIN')
                throw new Error('No autorizado: se requiere rol ADMIN');
            if (!input.cedula || !input.nombre || !input.primerApellido)
                throw new Error('Cedula, nombre y primer apellido son obligatorios');
            const actualizado = await repositories.estudianteRepository.update(id, {
                ...input,
                email: (input.email ?? '').trim(),
            });
            if (!actualizado)
                throw new Error(`No se pudo actualizar el estudiante ${id}`);
            return actualizado;
        },
        eliminarEstudiante: async (_, { id }, { user, repositories }) => {
            if (!user || user.role !== 'ADMIN')
                throw new Error('No autorizado: se requiere rol ADMIN');
            // Obtener la cédula del estudiante para borrar el usuario asociado
            const estudiante = await repositories.estudianteRepository.findById(id).catch(() => null)
                ?? await repositories.estudianteRepository.findByCedula(id).catch(() => null);
            const ok = await repositories.estudianteRepository.delete(id);
            if (!ok)
                throw new Error(`No se pudo eliminar el estudiante ${id}`);
            // Eliminar el usuario del sistema (username = cédula)
            if (estudiante?.cedula) {
                await UserModel_js_1.UserModel.deleteOne({ username: estudiante.cedula }).catch(() => { });
            }
            return ok;
        },
        // ── Profesores ────────────────────────────────────────
        crearProfesor: async (_, { input }, { user, repositories }) => {
            if (!user || user.role !== 'ADMIN')
                throw new Error('No autorizado: se requiere rol ADMIN');
            const cedula = String(input.cedula ?? '').trim();
            if (!cedula)
                throw new Error('La c�dula es obligatoria');
            if (!input.nombre?.trim() || !input.primerApellido?.trim() || !input.email?.trim())
                throw new Error('Nombre, primer apellido y email son obligatorios');
            const existe = await repositories.profesorRepository.findByCedula(cedula);
            if (existe)
                throw new Error(`Ya existe un profesor con c�dula ${cedula}`);
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
            await exports.resolvers.Mutation.enviarCrearCredenciales(_, { profesorId: cedula }, { user, repositories });
            return profesor;
        },
        actualizarProfesor: async (_, { id, input }, { user, repositories }) => {
            if (!user || user.role !== 'ADMIN')
                throw new Error('No autorizado: se requiere rol ADMIN');
            const ok = await repositories.profesorRepository.update(id, input);
            if (!ok)
                throw new Error(`No se pudo actualizar el profesor ${id}`);
            return ok;
        },
        eliminarProfesor: async (_, { id }, { user, repositories }) => {
            if (!user || user.role !== 'ADMIN')
                throw new Error('No autorizado: se requiere rol ADMIN');
            // Obtener la cédula del profesor para borrar el usuario asociado
            const profesor = await repositories.profesorRepository.findById(id).catch(() => null)
                ?? await repositories.profesorRepository.findByCedula(id).catch(() => null);
            const ok = await repositories.profesorRepository.delete(id);
            if (!ok)
                throw new Error(`No se pudo eliminar el profesor ${id}`);
            // Eliminar el usuario del sistema (username = cédula)
            if (profesor?.cedula) {
                await UserModel_js_1.UserModel.deleteOne({ username: profesor.cedula }).catch(() => { });
            }
            return ok;
        },
        // ── Cursos ────────────────────────────────────────────
        crearCurso: async (_, { input }, { user, repositories }) => {
            if (!user || user.role !== 'ADMIN')
                throw new Error('No autorizado: se requiere rol ADMIN');
            if (!input.id || !input.nombre)
                throw new Error('El ID y nombre del curso son obligatorios');
            const existe = await repositories.cursoRepository.findById(input.id);
            if (existe)
                throw new Error(`Ya existe un curso con ID ${input.id}`);
            let profesorCedula = input.profesorId;
            if (input.profesorId) {
                const prof = (await repositories.profesorRepository.findById(input.profesorId).catch(() => null))
                    ?? (await repositories.profesorRepository.findByCedula(input.profesorId).catch(() => null));
                if (!prof)
                    throw new Error(`Profesor ${input.profesorId} no encontrado`);
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
        actualizarCurso: async (_, { id, input }, { user, repositories }) => {
            if (!user || user.role !== 'ADMIN')
                throw new Error('No autorizado: se requiere rol ADMIN');
            return await repositories.cursoRepository.update(id, input);
        },
        eliminarCurso: async (_, { id }, { user, repositories }) => {
            if (!user || user.role !== 'ADMIN')
                throw new Error('No autorizado: se requiere rol ADMIN');
            return !!(await repositories.cursoRepository.delete(id));
        },
        // ── Calificaciones ────────────────────────────────────
        crearCalificacion: async (_, { input }, { user, repositories }) => {
            if (!user || !['ADMIN', 'PROFESOR'].includes(user.role))
                throw new Error('No autorizado: se requiere rol ADMIN o PROFESOR');
            if (!input.estudianteId)
                throw new Error('El estudianteId es requerido');
            if (!input.asignaturaId)
                throw new Error('El asignaturaId es requerido');
            // Verificar que el periodo esté abierto
            await verificarPeriodoAbierto(input.periodo);
            await validarCalificacionNoPreescolar(input.asignaturaId, repositories);
            const cal = await repositories.calificacionRepository.create(input);
            // Notificación email — best-effort, en background
            (async () => {
                try {
                    const estudiante = await repositories.estudianteRepository.findById(input.estudianteId);
                    const asignatura = await repositories.asignaturaRepository.findById(input.asignaturaId);
                    if (estudiante?.email && asignatura) {
                        await (0, Emailservice_js_1.notificarNuevaCalificacion)({
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
                }
                catch { /* silencioso */ }
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
        actualizarCalificacion: async (_, { id, input }, { user, repositories }) => {
            if (!user || !['ADMIN', 'PROFESOR'].includes(user.role))
                throw new Error('No autorizado: se requiere rol ADMIN o PROFESOR');
            await validarCalificacionNoPreescolar(input.asignaturaId, repositories);
            return await repositories.calificacionRepository.update(id, input);
        },
        eliminarCalificacion: async (_, { id }, { user, repositories }) => {
            if (!user || !['ADMIN', 'PROFESOR'].includes(user.role))
                throw new Error('No autorizado: se requiere rol ADMIN o PROFESOR');
            return !!(await repositories.calificacionRepository.delete(id));
        },
        // ── Boletines ─────────────────────────────────────────
        generarBoletin: async (_, { input }, { repositories }) => {
            if (!input.estudianteId || !input.cursoId || !input.periodo || !Array.isArray(input.calificaciones))
                throw new Error('Datos incompletos para generar bolet�n');
            if (!input.calificaciones.length)
                throw new Error('No se proporcionaron calificaciones');
            const estudiante = (await repositories.estudianteRepository.findByCedula(input.estudianteId).catch(() => null)) ??
                (await repositories.estudianteRepository.findById(input.estudianteId).catch(() => null));
            if (!estudiante)
                throw new Error('Estudiante no encontrado');
            const curso = await repositories.cursoRepository.findById(input.cursoId);
            if (!curso)
                throw new Error('Curso no encontrado');
            const asignaturasCurso = await repositories.asignaturaRepository.findByCursoId(input.cursoId).catch(() => []);
            const asigIdsCurso = new Set((asignaturasCurso || []).map((a) => String(a.id ?? a._id)));
            const estIdBoletin = estudiante.cedula ?? input.estudianteId;
            const todasLasCalificaciones = await repositories.calificacionRepository.findByEstudianteId(estIdBoletin).catch(() => []);
            const calsAcumuladas = (todasLasCalificaciones || []).filter((c) => mismoAnioYPrevios(input.periodo, c.periodo) && asigIdsCurso.has(String(c.asignaturaId)));
            if (!calsAcumuladas.length)
                throw new Error('No se pudo calcular el promedio acumulado');
            const asigMap = {};
            for (const cal of calsAcumuladas) {
                const k = String(cal.asignaturaId);
                if (!asigMap[k])
                    asigMap[k] = {};
                const numeroPeriodo = parsePeriodo(String(cal.periodo || input.periodo)).numeroPeriodo;
                if (!asigMap[k][numeroPeriodo])
                    asigMap[k][numeroPeriodo] = [];
                asigMap[k][numeroPeriodo].push(Number(cal.nota));
            }
            const periodoObjetivo = parsePeriodo(input.periodo).numeroPeriodo;
            const promediosMaterias = Object.values(asigMap)
                .map((notasPorPeriodo) => {
                const promediosAcumulados = [1, 2, 3]
                    .slice(0, periodoObjetivo)
                    .map((numeroPeriodo) => promedioNumeros(notasPorPeriodo[numeroPeriodo] ?? []))
                    .filter((nota) => nota !== null);
                return promedioNumeros(promediosAcumulados);
            })
                .filter((nota) => nota !== null);
            const promedio = promedioNumeros(promediosMaterias);
            if (promedio === null || isNaN(promedio))
                throw new Error('No se pudo calcular el promedio');
            return await repositories.boletinRepository.create({ ...input, estudianteId: estIdBoletin, promedio });
        },
        actualizarBoletin: async (_, { id, input }, { repositories }) => {
            if (!input.estudianteId || !input.cursoId || !input.periodo || !Array.isArray(input.calificaciones))
                throw new Error('Datos incompletos para actualizar bolet�n');
            if (!input.calificaciones.length)
                throw new Error('No se proporcionaron calificaciones');
            const estudiante = (await repositories.estudianteRepository.findByCedula(input.estudianteId).catch(() => null)) ??
                (await repositories.estudianteRepository.findById(input.estudianteId).catch(() => null));
            if (!estudiante)
                throw new Error('Estudiante no encontrado');
            const curso = await repositories.cursoRepository.findById(input.cursoId);
            if (!curso)
                throw new Error('Curso no encontrado');
            const asignaturasCurso = await repositories.asignaturaRepository.findByCursoId(input.cursoId).catch(() => []);
            const asigIdsCurso = new Set((asignaturasCurso || []).map((a) => String(a.id ?? a._id)));
            const estIdBoletin = estudiante.cedula ?? input.estudianteId;
            const todasLasCalificaciones = await repositories.calificacionRepository.findByEstudianteId(estIdBoletin).catch(() => []);
            const calsAcumuladas = (todasLasCalificaciones || []).filter((c) => mismoAnioYPrevios(input.periodo, c.periodo) && asigIdsCurso.has(String(c.asignaturaId)));
            if (!calsAcumuladas.length)
                throw new Error('No se pudo calcular el promedio acumulado');
            const asigMap = {};
            for (const cal of calsAcumuladas) {
                const k = String(cal.asignaturaId);
                if (!asigMap[k])
                    asigMap[k] = {};
                const numeroPeriodo = parsePeriodo(String(cal.periodo || input.periodo)).numeroPeriodo;
                if (!asigMap[k][numeroPeriodo])
                    asigMap[k][numeroPeriodo] = [];
                asigMap[k][numeroPeriodo].push(Number(cal.nota));
            }
            const periodoObjetivo = parsePeriodo(input.periodo).numeroPeriodo;
            const promediosMaterias = Object.values(asigMap)
                .map((notasPorPeriodo) => {
                const promediosAcumulados = [1, 2, 3]
                    .slice(0, periodoObjetivo)
                    .map((numeroPeriodo) => promedioNumeros(notasPorPeriodo[numeroPeriodo] ?? []))
                    .filter((nota) => nota !== null);
                return promedioNumeros(promediosAcumulados);
            })
                .filter((nota) => nota !== null);
            const promedio = promedioNumeros(promediosMaterias);
            if (promedio === null || isNaN(promedio))
                throw new Error('No se pudo calcular el promedio');
            return await repositories.boletinRepository.update(id, { ...input, estudianteId: estIdBoletin, promedio });
        },
        eliminarBoletin: async (_, { id }, { repositories }) => !!(await repositories.boletinRepository.delete(id)),
        // ── Matrículas ────────────────────────────────────────
        crearMatricula: async (_, { input }, { user, repositories }) => {
            if (!user || user.role !== 'ADMIN')
                throw new Error('No autorizado: se requiere rol ADMIN');
            if (!input.estudianteId || !input.cursoId)
                throw new Error('El ID del estudiante y del curso son obligatorios');
            const estudiante = await repositories.estudianteRepository.findByCedula(input.estudianteId);
            if (!estudiante)
                throw new Error(`Estudiante ${input.estudianteId} no encontrado`);
            const curso = await repositories.cursoRepository.findById(input.cursoId);
            if (!curso)
                throw new Error(`Curso ${input.cursoId} no encontrado`);
            const existentes = await repositories.matriculaRepository.findByEstudianteId(input.estudianteId);
            const yaMatriculado = existentes.some((m) => m.cursoId === input.cursoId && m.estado === 'ACTIVA' && m.periodo === input.periodo);
            if (yaMatriculado)
                throw new Error(`El estudiante ya est� matriculado en este curso para ${input.periodo}`);
            for (const asigId of input.asignaturas ?? []) {
                const asig = await repositories.asignaturaRepository.findById(asigId);
                if (!asig)
                    throw new Error(`Asignatura ${asigId} no encontrada`);
                if (asig.cursoId !== input.cursoId)
                    throw new Error(`La asignatura ${asig.nombre} no pertenece al curso`);
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
                        await exports.resolvers.Mutation.enviarCrearCredenciales(_, { estudianteId: estudiante.cedula }, { user, repositories });
                    }
                    else if (estudiante.email) {
                        await (0, Emailservice_js_1.enviarConfirmacionMatricula)({
                            email: estudiante.email,
                            nombre: estudiante.nombre,
                            apellido: estudiante.primerApellido,
                            curso: curso.nombre,
                            asignaturas: input.asignaturas ?? [],
                        }).catch(() => { });
                    }
                }
                catch { /* silencioso */ }
            })();
            return matricula;
        },
        actualizarMatricula: async (_, { id, input }, { repositories }) => await repositories.matriculaRepository.update(id, input),
        actualizarEstadoMatricula: async (_, { id, estado }, { repositories }) => await repositories.matriculaRepository.updateEstado(id, estado),
        eliminarMatricula: async (_, { id }, { repositories }) => await repositories.matriculaRepository.delete(id),
        // ── Asignaturas ───────────────────────────────────────
        crearAsignatura: async (_, { input }, { user, repositories }) => {
            if (!user || user.role !== 'ADMIN')
                throw new Error('No autorizado: se requiere rol ADMIN');
            const profesor = await repositories.profesorRepository.findById(input.profesorId);
            if (!profesor)
                throw new Error(`Profesor ${input.profesorId} no encontrado`);
            const curso = await repositories.cursoRepository.findById(input.cursoId);
            if (!curso)
                throw new Error(`Curso ${input.cursoId} no encontrado`);
            return await repositories.asignaturaRepository.create({
                nombre: input.nombre,
                horario: input.horario,
                profesorId: profesor.cedula,
                cursoId: curso.id,
            });
        },
        // ── Nueva feature: crear la misma asignatura en varios cursos a la vez ──
        crearAsignaturaEnVariosCursos: async (_, { input }, { user, repositories }) => {
            if (!user || user.role !== 'ADMIN')
                throw new Error('No autorizado: se requiere rol ADMIN');
            if (!input.nombre?.trim())
                throw new Error('El nombre de la asignatura es obligatorio');
            if (!input.cursos?.length)
                throw new Error('Debes seleccionar al menos un curso');
            const profesor = await repositories.profesorRepository.findById(input.profesorId)
                ?? await repositories.profesorRepository.findByCedula(input.profesorId);
            if (!profesor)
                throw new Error(`Profesor ${input.profesorId} no encontrado`);
            const resultados = [];
            const errores = [];
            for (const { cursoId, horario } of input.cursos) {
                try {
                    const curso = await repositories.cursoRepository.findById(cursoId);
                    if (!curso) {
                        errores.push(`Curso ${cursoId} no encontrado`);
                        continue;
                    }
                    if (!horario?.trim()) {
                        errores.push(`Falta horario para el curso ${curso.nombre}`);
                        continue;
                    }
                    const nueva = await repositories.asignaturaRepository.create({
                        nombre: input.nombre.trim(),
                        horario: horario.trim(),
                        profesorId: profesor.cedula,
                        cursoId: curso.id,
                    });
                    resultados.push(nueva);
                }
                catch (e) {
                    errores.push(`Curso ${cursoId}: ${e.message}`);
                }
            }
            if (!resultados.length)
                throw new Error(`No se pudo crear ninguna asignatura. ${errores.join('; ')}`);
            return { creadas: resultados, errores };
        },
        actualizarAsignatura: async (_, { id, input }, { user, repositories }) => {
            if (!user || user.role !== 'ADMIN')
                throw new Error('No autorizado: se requiere rol ADMIN');
            return await repositories.asignaturaRepository.update(id, input);
        },
        eliminarAsignatura: async (_, { id }, { user, repositories }) => {
            if (!user || user.role !== 'ADMIN')
                throw new Error('No autorizado: se requiere rol ADMIN');
            return !!(await repositories.asignaturaRepository.delete(id));
        },
        // ── Asistencias ───────────────────────────────────────
        registrarLista: async (_, { input }, { repositories }) => {
            const registros = input.estudiantes.map((est) => ({
                estudianteId: est.estudianteId,
                asignaturaId: input.asignaturaId,
                fecha: input.fecha,
                estado: est.estado,
                periodo: input.periodo,
                observaciones: est.observaciones ?? '',
                registradoPor: input.registradoPor ?? '',
            }));
            return await repositories.asistenciaRepository.registrarLista(registros);
        },
        crearAsistencia: async (_, { input }, { repositories }) => await repositories.asistenciaRepository.create(input),
        actualizarAsistencia: async (_, { id, input }, { repositories }) => await repositories.asistenciaRepository.update(id, input),
        eliminarAsistencia: async (_, { id }, { repositories }) => await repositories.asistenciaRepository.delete(id),
        // ── Periodos ─────────────────────────────────────────
        configurarPeriodo: async (_, { input }, { user }) => {
            if (user?.role !== 'ADMIN')
                throw new Error('Solo administradores');
            const doc = await PeriodoConfigModel_js_1.PeriodoConfigModel.findOneAndUpdate({ anio: input.anio, numeroPeriodo: input.numeroPeriodo }, {
                numCortes: input.numCortes,
                abierto: true,
                ...(input.fechaApertura ? { fechaApertura: new Date(input.fechaApertura) } : {}),
                ...(input.fechaCierre ? { fechaCierre: new Date(input.fechaCierre) } : {}),
            }, { upsert: true, new: true }).lean();
            return { ...doc, id: doc._id?.toString(), pesoPorCorte: 100 / doc.numCortes };
        },
        cerrarPeriodo: async (_, { anio, numeroPeriodo, fechaCierre }, { user }) => {
            if (user?.role !== 'ADMIN')
                throw new Error('Solo administradores');
            const doc = await PeriodoConfigModel_js_1.PeriodoConfigModel.findOneAndUpdate({ anio, numeroPeriodo }, { abierto: false, fechaCierre: fechaCierre ? new Date(fechaCierre) : new Date() }, { upsert: true, new: true }).lean();
            return { ...doc, id: doc._id?.toString(), pesoPorCorte: 100 / doc.numCortes };
        },
        abrirPeriodo: async (_, { anio, numeroPeriodo }, { user }) => {
            if (user?.role !== 'ADMIN')
                throw new Error('Solo administradores');
            const doc = await PeriodoConfigModel_js_1.PeriodoConfigModel.findOneAndUpdate({ anio, numeroPeriodo }, { abierto: true }, { upsert: true, new: true }).lean();
            return { ...doc, id: doc._id?.toString(), pesoPorCorte: 100 / doc.numCortes };
        },
        // ── Comportamiento ───────────────────────────────────
        guardarComportamiento: async (_, { input }, { user, repositories }) => {
            if (!user)
                throw new Error('No autenticado');
            const profesor = await repositories.profesorRepository.findByCedula(user.username).catch(() => null);
            if (!profesor)
                throw new Error('Solo profesores pueden registrar comportamiento');
            await validarComportamientoNoPreescolar(input.asignaturaId, repositories);
            // Calcular nivel automáticamente desde la nota si se proporciona
            let nivel = input.nivel;
            if (input.nota !== undefined && input.nota !== null) {
                const n = parseFloat(input.nota);
                if (n >= 4.6)
                    nivel = 'Superior';
                else if (n >= 4.0)
                    nivel = 'Alto';
                else if (n >= 3.5)
                    nivel = 'Basico';
                else
                    nivel = 'Bajo';
            }
            const doc = await ComportamientoModel_js_1.ComportamientoModel.findOneAndUpdate({ estudianteId: input.estudianteId, asignaturaId: input.asignaturaId, periodo: input.periodo, anio: input.anio }, { ...input, nivel, profesorId: profesor.id ?? profesor.cedula }, { upsert: true, new: true }).lean();
            return { ...doc, id: doc._id?.toString() };
        },
        // ── Cronograma ───────────────────────────────────────
        crearEventoCronograma: async (_, { input }, { user }) => {
            if (!['ADMIN', 'PROFESOR'].includes(user?.role))
                throw new Error('Solo administradores o profesores');
            const doc = await CronogramaModel_js_1.CronogramaModel.create({ ...input, creadoPor: user.username });
            const obj = doc.toObject();
            return {
                ...obj,
                id: doc._id?.toString(),
                fechaInicio: obj.fechaInicio instanceof Date ? obj.fechaInicio.toISOString().split('T')[0] : obj.fechaInicio,
                fechaFin: obj.fechaFin instanceof Date ? obj.fechaFin.toISOString().split('T')[0] : obj.fechaFin,
            };
        },
        actualizarEventoCronograma: async (_, { id, input }, { user }) => {
            if (user?.role !== 'ADMIN')
                throw new Error('Solo administradores');
            const doc = await CronogramaModel_js_1.CronogramaModel.findByIdAndUpdate(id, input, { new: true }).lean();
            if (!doc)
                throw new Error('Evento no encontrado');
            return {
                ...doc,
                id: doc._id?.toString(),
                fechaInicio: doc.fechaInicio instanceof Date ? doc.fechaInicio.toISOString().split('T')[0] : doc.fechaInicio,
                fechaFin: doc.fechaFin instanceof Date ? doc.fechaFin.toISOString().split('T')[0] : doc.fechaFin,
            };
        },
        eliminarEventoCronograma: async (_, { id }, { user }) => {
            if (user?.role !== 'ADMIN')
                throw new Error('Solo administradores');
            const result = await CronogramaModel_js_1.CronogramaModel.findByIdAndDelete(id);
            return !!result;
        },
    },
    // ═══════════════════════════
    //  TYPE RESOLVERS
    // ═══════════════════════════
    User: {
        id: (user) => user._id ?? user.id,
    },
    AuthPayload: {
        user: (payload) => payload.user,
        token: (payload) => payload.token,
    },
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
        id: (e) => e.cedula ?? e._id ?? e.id,
        nombre: (e) => e.nombre ?? '',
        primerApellido: (e) => e.primerApellido ?? '',
        segundoApellido: (e) => e.segundoApellido ?? '',
        email: (e) => e.email ?? '',
        cedula: (e) => e.cedula ?? e._id ?? e.id ?? '',
        empleado: async (e, _, { repositories }) => {
            const fallback = { id: e.cedula ?? '', cedula: e.cedula ?? '', nombre: e.nombre ?? '', primerApellido: e.primerApellido ?? '', segundoApellido: e.segundoApellido ?? '', email: e.email ?? '', tipo: 'estudiante' };
            if (!e.empleadoId)
                return fallback;
            const emp = await repositories.empleadoRepository.findById(e.empleadoId).catch(() => null);
            return emp ?? fallback;
        },
        matriculas: async (e, _, { repositories }) => await repositories.matriculaRepository.findByEstudianteId(e.id),
    },
    Profesor: {
        id: (p) => p.cedula,
        empleado: async (p) => {
            if (!p.empleadoId)
                return null;
            return await EmpleadoModel_1.EmpleadoModel.findById(p.empleadoId);
        },
    },
    Curso: {
        profesor: async (curso, _, { repositories }) => {
            if (!curso.profesorId)
                return null;
            return await repositories.profesorRepository.findById(curso.profesorId);
        },
    },
    Calificacion: {
        fecha: (cal) => {
            if (!cal?.fecha)
                return null;
            const d = new Date(cal.fecha);
            return isNaN(d.getTime()) ? null : d.toISOString();
        },
    },
    Matricula: {
        fechaMatricula: (matricula) => {
            if (!matricula?.fechaMatricula)
                return new Date().toISOString();
            const d = new Date(matricula.fechaMatricula);
            return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
        },
        estudiante: async (matricula, _, { repositories }) => {
            if (!matricula?.estudianteId) {
                return { id: 'n/a', cedula: 'n/a', nombre: 'Sin datos', primerApellido: '', segundoApellido: '', email: '' };
            }
            const est = await repositories.estudianteRepository.findById(matricula.estudianteId);
            return est ?? {
                id: matricula.estudianteId, cedula: matricula.estudianteId,
                nombre: 'No encontrado', primerApellido: '', segundoApellido: '', email: '',
            };
        },
        curso: async (matricula, _, { repositories }) => {
            if (!matricula?.cursoId) {
                return { id: 'n/a', nombre: 'Sin curso', cantidadMax: 0, profesorId: '' };
            }
            const curso = await repositories.cursoRepository.findById(matricula.cursoId);
            return curso ?? { id: matricula.cursoId, nombre: 'No encontrado', cantidadMax: 0, profesorId: '' };
        },
        asignaturas: async (matricula, _, { repositories }) => {
            if (!matricula?.asignaturas)
                return [];
            let ids;
            if (Array.isArray(matricula.asignaturas)) {
                ids = matricula.asignaturas.map(String).filter(Boolean);
            }
            else if (typeof matricula.asignaturas === 'string') {
                ids = matricula.asignaturas.split(',').map((s) => s.trim()).filter(Boolean);
            }
            else {
                return [];
            }
            if (!ids.length)
                return [];
            return await repositories.asignaturaRepository.findByIds(ids);
        },
    },
    Asistencia: {
        fecha: (asistencia) => {
            if (!asistencia?.fecha)
                return null;
            const d = new Date(asistencia.fecha);
            return isNaN(d.getTime()) ? null : d.toISOString();
        },
    },
    Indicadores: {
        id: (indicador) => indicador?.id ?? indicador?._id?.toString() ?? null,
        asignaturaId: (indicador) => indicador?.asignaturaId ? String(indicador.asignaturaId) : null,
        saber: (indicador) => Array.isArray(indicador?.saber) ? indicador.saber : [],
        hacer: (indicador) => Array.isArray(indicador?.hacer) ? indicador.hacer : [],
        ser: (indicador) => Array.isArray(indicador?.ser) ? indicador.ser : [],
        estudianteIds: (indicador) => Array.isArray(indicador?.estudianteIds) ? indicador.estudianteIds : [],
    },
    Boletin: {
        fecha: (boletin) => {
            if (!boletin?.fecha)
                return new Date().toISOString();
            const d = new Date(boletin.fecha);
            return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
        },
        estudiante: async (boletin, _, { repositories }) => {
            if (!boletin.estudianteId)
                return null;
            if (typeof boletin.estudianteId === 'object') {
                try {
                    const idStr = boletin.estudianteId.toString?.() ?? '';
                    if (mongoose_1.default.Types.ObjectId.isValid(idStr)) {
                        const doc = await EstudianteModel_js_1.EstudianteModel.findById(idStr);
                        if (doc)
                            return await repositories.estudianteRepository.findByCedula(doc.cedula);
                    }
                }
                catch { /* continuar con fallback */ }
            }
            return await repositories.estudianteRepository.findByCedula(boletin.estudianteId);
        },
        curso: async (boletin, _, { repositories }) => await repositories.cursoRepository.findById(boletin.cursoId),
    },
};
//# sourceMappingURL=resolvers.js.map