"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const EstudianteModel_1 = require("../adapters/outputs/models/EstudianteModel");
const AsignaturaModel_1 = require("../adapters/outputs/models/AsignaturaModel");
const MatriculaModel_1 = require("../adapters/outputs/models/MatriculaModel");
const BoletinModel_1 = require("../adapters/outputs/models/BoletinModel");
const mongo_js_1 = require("../config/mongo.js");
// Conectar a la base de datos
(0, mongo_js_1.connectMongo)()
    .then(() => {
    console.log('âœ… Conectado a MongoDB');
    migrateReferences();
})
    .catch(err => {
    console.error('âŒ Error conectando a MongoDB:', err);
    process.exit(1);
});
async function migrateReferences() {
    try {
        console.log('Iniciando migraciÃ³n de referencias...');
        // 1. Migrar referencias en Asignatura
        console.log('Migrando referencias en Asignatura...');
        const asignaturas = await AsignaturaModel_1.AsignaturaModel.find();
        for (const asignatura of asignaturas) {
            const estudianteId = asignatura.estudianteId;
            if (typeof estudianteId === 'object' ||
                (typeof estudianteId === 'string' && mongoose_1.default.Types.ObjectId.isValid(estudianteId))) {
                // Convertir a string si es un ObjectId
                const idStr = estudianteId.toString();
                try {
                    const estudianteObj = await EstudianteModel_1.EstudianteModel.findById(idStr);
                    if (estudianteObj) {
                        console.log(`Asignatura ${asignatura._id}: Actualizando estudianteId de ${estudianteId} a ${estudianteObj.cedula}`);
                        asignatura.estudianteId = estudianteObj.cedula;
                        await asignatura.save();
                    }
                    else {
                        console.log(`No se encontrÃ³ estudiante con ID ${estudianteId} para la asignatura ${asignatura._id}`);
                    }
                }
                catch (e) {
                    console.error(`Error procesando asignatura ${asignatura._id}:`, e);
                }
            }
        }
        // 2. Migrar referencias en Matricula
        console.log('Migrando referencias en Matricula...');
        const matriculas = await MatriculaModel_1.MatriculaModel.find();
        for (const matricula of matriculas) {
            if (typeof matricula.estudianteId === 'object' ||
                (typeof matricula.estudianteId === 'string' && mongoose_1.default.Types.ObjectId.isValid(matricula.estudianteId))) {
                const idStr = matricula.estudianteId.toString();
                try {
                    const estudianteObj = await EstudianteModel_1.EstudianteModel.findById(idStr);
                    if (estudianteObj) {
                        console.log(`Matricula ${matricula._id}: Actualizando estudianteId de ${matricula.estudianteId} a ${estudianteObj.cedula}`);
                        matricula.estudianteId = estudianteObj.cedula;
                        await matricula.save();
                    }
                    else {
                        console.log(`No se encontrÃ³ estudiante con ID ${matricula.estudianteId} para la matricula ${matricula._id}`);
                    }
                }
                catch (e) {
                    console.error(`Error procesando matricula ${matricula._id}:`, e);
                }
            }
        }
        // 3. Migrar referencias en Boletin
        console.log('Migrando referencias en Boletin...');
        const boletines = await BoletinModel_1.BoletinModel.find();
        for (const boletin of boletines) {
            if (typeof boletin.estudianteId === 'object' ||
                (typeof boletin.estudianteId === 'string' && mongoose_1.default.Types.ObjectId.isValid(boletin.estudianteId))) {
                const idStr = boletin.estudianteId.toString();
                try {
                    const estudianteObj = await EstudianteModel_1.EstudianteModel.findById(idStr);
                    if (estudianteObj) {
                        console.log(`Boletin ${boletin._id}: Actualizando estudianteId de ${boletin.estudianteId} a ${estudianteObj.cedula}`);
                        boletin.estudianteId = estudianteObj.cedula;
                        await boletin.save();
                    }
                    else {
                        console.log(`No se encontrÃ³ estudiante con ID ${boletin.estudianteId} para el boletin ${boletin._id}`);
                    }
                }
                catch (e) {
                    console.error(`Error procesando boletin ${boletin._id}:`, e);
                }
            }
        }
        console.log('âœ… MigraciÃ³n completada exitosamente');
        process.exit(0);
    }
    catch (error) {
        console.error('âŒ Error durante la migraciÃ³n:', error);
        process.exit(1);
    }
}
//# sourceMappingURL=migrateReferences.js.map