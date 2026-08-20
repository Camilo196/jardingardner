import mongoose from 'mongoose';
import { connectMongo } from './mongo.js';

export async function connectToDatabase() {
  try {
    await connectMongo();
    console.log('Conexion exitosa a MongoDB');
  } catch (error) {
    const errorMessage = (error as Error).message || error;
    console.error('Error al conectar a MongoDB:', errorMessage);
    throw new Error('Fallo al conectar a MongoDB');
  }
}

export { mongoose };
