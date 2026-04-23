import mongoose from 'mongoose';
import { connectToDatabase } from './infrastructure/config/mongoose.js';

async function testConnection() {
  try {
    await connectToDatabase();
    console.log('Conexión exitosa a MongoDB');
  } catch (error) {
    console.error('Error al conectar a MongoDB:', error);
  } finally {
    // Cerrar la conexión a la base de datos y salir del proceso
    await mongoose.connection.close();
    process.exit();
  }
}

testConnection();