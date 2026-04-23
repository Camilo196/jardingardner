import mongoose from 'mongoose';
import dotenv from 'dotenv';
// Cargar variables de entorno
dotenv.config();
// Obtener la URI de la base de datos
const uri = process.env.MONGODB_URI;
// Verificar que la URI esté definida
if (!uri) {
    throw new Error('Por favor define la variable de entorno MONGODB_URI en el archivo .env');
}
console.log('MongoDB URI:', uri); // Verifica que la URI sea correcta
// Función para conectar a la base de datos
export async function connectToDatabase() {
    try {
        // Intentar conectar a MongoDB
        await mongoose.connect(uri);
        console.log('Conexión exitosa a MongoDB');
    }
    catch (error) {
        const errorMessage = error.message || error;
        console.error('Error al conectar a MongoDB:', errorMessage);
        throw new Error('Fallo al conectar a MongoDB');
    }
}
//# sourceMappingURL=mongoose.js.map