import { ApolloServer } from 'apollo-server';
import { resolvers } from '../adapters/inputs/resolvers.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { readFileSync } from 'fs';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config();
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
    throw new Error('MONGO_URI is not defined in the environment variables.');
}
mongoose.connect(MONGO_URI)
    .then(() => console.log('Connected to MongoDB Atlas'))
    .catch(err => console.error('Error connecting to MongoDB Atlas:', err));
// Leer el schema
const typeDefs = readFileSync(path.join(__dirname, './infrastructure/adapters/inputs/schema.graphql'), 'utf8');
// Importaciones de repositorios
import { EstudianteRepositoryImpl } from '../adapters/outputs/estudianteRepositoryImpl';
import { CalificacionRepositoryImpl } from '../adapters/outputs/calificacionRepositoryImpl';
import { BoletinRepositoryImpl } from '../adapters/outputs/boletinRepositoryImpl';
import { MatriculaRepositoryImpl } from '../adapters/outputs/matriculaRepositoryImpl';
import { CursoRepositoryImpl } from '../adapters/outputs/CursoRepositoryImpl';
import { AsignaturaRepositoryImpl } from '../adapters/outputs/asignaturaRepositoryImpl';
import { ProfesorRepositoryImpl } from '../adapters/outputs/profesorRepositoryImpl';
// Crear instancias de los repositorios
const repositories = {
    estudianteRepository: new EstudianteRepositoryImpl(),
    cursoRepository: new CursoRepositoryImpl(),
    calificacionRepository: new CalificacionRepositoryImpl(),
    boletinRepository: new BoletinRepositoryImpl(),
    matriculaRepository: new MatriculaRepositoryImpl(),
    asignaturaRepository: new AsignaturaRepositoryImpl(),
    profesorRepository: new ProfesorRepositoryImpl(),
};
// Configurar Apollo Server
const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: () => ({
        repositories
    }),
});
// Iniciar el servidor
server.listen().then(({ url }) => {
    console.log(`🚀 Servidor GraphQL listo en ${url}`);
});
//# sourceMappingURL=apollo.js.map