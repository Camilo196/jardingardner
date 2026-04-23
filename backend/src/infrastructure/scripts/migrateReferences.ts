import mongoose from 'mongoose';
import { EstudianteModel } from '../adapters/outputs/models/EstudianteModel';
import { AsignaturaModel } from '../adapters/outputs/models/AsignaturaModel';
import { MatriculaModel } from '../adapters/outputs/models/MatriculaModel';
import { BoletinModel } from '../adapters/outputs/models/BoletinModel';
import { connectMongo } from '../config/mongo.js';

// Conectar a la base de datos
connectMongo()
  .then(() => {
    console.log('✅ Conectado a MongoDB');
    migrateReferences();
  })
  .catch(err => {
    console.error('❌ Error conectando a MongoDB:', err);
    process.exit(1);
  });

async function migrateReferences() {
  try {
    console.log('Iniciando migración de referencias...');
    
    // 1. Migrar referencias en Asignatura
    console.log('Migrando referencias en Asignatura...');
    const asignaturas = await AsignaturaModel.find();
    
    for (const asignatura of asignaturas) {
      if (typeof asignatura.estudianteId === 'object' || 
          (typeof asignatura.estudianteId === 'string' && mongoose.Types.ObjectId.isValid(asignatura.estudianteId))) {
        
        // Convertir a string si es un ObjectId
        const idStr = asignatura.estudianteId.toString();
        
        try {
          const estudianteObj = await EstudianteModel.findById(idStr);
          if (estudianteObj) {
            console.log(`Asignatura ${asignatura._id}: Actualizando estudianteId de ${asignatura.estudianteId} a ${estudianteObj.cedula}`);
            asignatura.estudianteId = estudianteObj.cedula;
            await asignatura.save();
          } else {
            console.log(`No se encontró estudiante con ID ${asignatura.estudianteId} para la asignatura ${asignatura._id}`);
          }
        } catch (e) {
          console.error(`Error procesando asignatura ${asignatura._id}:`, e);
        }
      }
    }
    
    // 2. Migrar referencias en Matricula
    console.log('Migrando referencias en Matricula...');
    const matriculas = await MatriculaModel.find();
    
    for (const matricula of matriculas) {
      if (typeof matricula.estudianteId === 'object' || 
          (typeof matricula.estudianteId === 'string' && mongoose.Types.ObjectId.isValid(matricula.estudianteId))) {
        
        const idStr = matricula.estudianteId.toString();
        
        try {
          const estudianteObj = await EstudianteModel.findById(idStr);
          if (estudianteObj) {
            console.log(`Matricula ${matricula._id}: Actualizando estudianteId de ${matricula.estudianteId} a ${estudianteObj.cedula}`);
            matricula.estudianteId = estudianteObj.cedula;
            await matricula.save();
          } else {
            console.log(`No se encontró estudiante con ID ${matricula.estudianteId} para la matricula ${matricula._id}`);
          }
        } catch (e) {
          console.error(`Error procesando matricula ${matricula._id}:`, e);
        }
      }
    }
    
    // 3. Migrar referencias en Boletin
    console.log('Migrando referencias en Boletin...');
    const boletines = await BoletinModel.find();
    
    for (const boletin of boletines) {
      if (typeof boletin.estudianteId === 'object' || 
          (typeof boletin.estudianteId === 'string' && mongoose.Types.ObjectId.isValid(boletin.estudianteId))) {
        
        const idStr = boletin.estudianteId.toString();
        
        try {
          const estudianteObj = await EstudianteModel.findById(idStr);
          if (estudianteObj) {
            console.log(`Boletin ${boletin._id}: Actualizando estudianteId de ${boletin.estudianteId} a ${estudianteObj.cedula}`);
            boletin.estudianteId = estudianteObj.cedula;
            await boletin.save();
          } else {
            console.log(`No se encontró estudiante con ID ${boletin.estudianteId} para el boletin ${boletin._id}`);
          }
        } catch (e) {
          console.error(`Error procesando boletin ${boletin._id}:`, e);
        }
      }
    }
    
    console.log('✅ Migración completada exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    process.exit(1);
  }
}
