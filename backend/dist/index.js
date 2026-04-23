import { ApolloServer } from 'apollo-server-express';
import { resolvers } from './infrastructure/adapters/inputs/resolvers';
import express from 'express';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { User } from './core/domain/user';
import { EstudianteRepositoryImpl } from './infrastructure/adapters/outputs/estudianteRepositoryImpl';
import { ProfesorRepositoryImpl } from './infrastructure/adapters/outputs/profesorRepositoryImpl';
import { CursoRepositoryImpl } from './infrastructure/adapters/outputs/CursoRepositoryImpl';
import { AsignaturaRepositoryImpl } from './infrastructure/adapters/outputs/asignaturaRepositoryImpl';
import { CalificacionRepositoryImpl } from './infrastructure/adapters/outputs/calificacionRepositoryImpl';
import { BoletinRepositoryImpl } from './infrastructure/adapters/outputs/boletinRepositoryImpl';
import { MatriculaRepositoryImpl } from './infrastructure/adapters/outputs/matriculaRepositoryImpl';
import { EmpleadoRepositoryImpl } from './infrastructure/adapters/outputs/empleadosRepositoryImpl';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config();
// Configuración de MongoDB Atlas
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
    throw new Error('MONGO_URI no está definida en las variables de entorno');
}
// Conexión a MongoDB Atlas
let db;
try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Conectado a MongoDB Atlas');
    db = mongoose.connection;
}
catch (err) {
    console.error('❌ Error conectando a MongoDB Atlas:', err);
    process.exit(1);
}
// Inicializar repositorios
const repositories = {
    estudianteRepository: new EstudianteRepositoryImpl(),
    profesorRepository: new ProfesorRepositoryImpl(),
    cursoRepository: new CursoRepositoryImpl(),
    asignaturaRepository: new AsignaturaRepositoryImpl(),
    calificacionRepository: new CalificacionRepositoryImpl(),
    boletinRepository: new BoletinRepositoryImpl(),
    matriculaRepository: new MatriculaRepositoryImpl(),
    empleadoRepository: new EmpleadoRepositoryImpl()
};
// Configuración de Apollo Server
const typeDefs = readFileSync(path.join(__dirname, './infrastructure/adapters/inputs/schema.graphql'), 'utf8');
const schema = makeExecutableSchema({ typeDefs, resolvers });
const server = new ApolloServer({
    schema,
    context: async ({ req }) => {
        try {
            let user = null;
            const token = req.headers.authorization?.split(' ')[1];
            if (token) {
                const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
                const userFromDB = await User.findById(decoded.id);
                if (userFromDB) {
                    user = {
                        id: userFromDB._id,
                        email: userFromDB.email,
                        role: userFromDB.role
                    };
                }
            }
            console.log('Context creado:', {
                userExists: !!user,
                repositoriesExist: !!repositories,
                availableRepositories: Object.keys(repositories)
            });
            return {
                user,
                repositories
            };
        }
        catch (error) {
            console.error('Error en context:', error);
            return {
                user: null,
                repositories
            };
        }
    },
    formatError: (error) => {
        console.error('GraphQL Error:', error);
        return error;
    }
});
const app = express();
app.use((req, res, next) => {
    console.log('📝 Petición recibida:', {
        method: req.method,
        path: req.path,
        headers: req.headers,
        body: req.body
    });
    next();
});
// Middleware para CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
        return res.status(200).json({});
    }
    next();
});
app.use(express.json());
// Middleware para depuración de peticiones GraphQL
app.use('/graphql', (req, res, next) => {
    if (req.method === 'POST' && req.body) {
        console.log('📊 GraphQL Request Body:', JSON.stringify(req.body, null, 2));
    }
    next();
});
// Iniciar servidor
const startServer = async () => {
    try {
        await server.start();
        server.applyMiddleware({ app });
        const PORT = process.env.PORT || 4000;
        app.listen(PORT, () => {
            console.log(`
🚀 Servidor GraphQL listo en http://localhost:${PORT}${server.graphqlPath}
📦 Repositorios inicializados: ${Object.keys(repositories).join(', ')}
🔐 JWT Secret configurado: ${!!process.env.JWT_SECRET}
      `);
        });
    }
    catch (error) {
        console.error('❌ Error fatal al iniciar el servidor:', error);
        process.exit(1);
    }
};
startServer();
//# sourceMappingURL=index.js.map