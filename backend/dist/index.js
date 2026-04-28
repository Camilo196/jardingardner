"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const apollo_server_express_1 = require("apollo-server-express");
const resolvers_1 = require("./infrastructure/adapters/inputs/resolvers");
const express_1 = __importDefault(require("express"));
const schema_1 = require("@graphql-tools/schema");
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const estudianteRepositoryImpl_1 = require("./infrastructure/adapters/outputs/estudianteRepositoryImpl");
const profesorRepositoryImpl_1 = require("./infrastructure/adapters/outputs/profesorRepositoryImpl");
const CursoRepositoryImpl_1 = require("./infrastructure/adapters/outputs/CursoRepositoryImpl");
const calificacionRepositoryImpl_1 = require("./infrastructure/adapters/outputs/calificacionRepositoryImpl");
const boletinRepositoryImpl_1 = require("./infrastructure/adapters/outputs/boletinRepositoryImpl");
const matriculaRepositoryImpl_1 = require("./infrastructure/adapters/outputs/matriculaRepositoryImpl");
const empleadosRepositoryImpl_1 = require("./infrastructure/adapters/outputs/empleadosRepositoryImpl");
const asignaturaRepositoryImpl_1 = require("./infrastructure/adapters/outputs/asignaturaRepositoryImpl");
const userRepositoryImpl_1 = require("./infrastructure/adapters/outputs/userRepositoryImpl");
const UserModel_1 = require("./infrastructure/adapters/outputs/models/UserModel");
const adminSetup_1 = require("./core/services/adminSetup");
const Emailservice_1 = require("./core/services/Emailservice");
const asistenciaRepositoryImpl_1 = require("./infrastructure/adapters/outputs/asistenciaRepositoryImpl");
const mongo_1 = require("./infrastructure/config/mongo");
dotenv_1.default.config();
// Configuración de MongoDB Atlas
const MONGO_URI = process.env.MONGO_URI ??
    process.env.MONGODB_URI ??
    process.env.MONGO_URI_DIRECT ??
    process.env.MONGODB_URI_DIRECT;
if (!MONGO_URI) {
    throw new Error('MONGO_URI no está definida en las variables de entorno');
}
// Fallar inmediatamente si JWT_SECRET no está configurado
if (!process.env.JWT_SECRET) {
    throw new Error('FATAL: JWT_SECRET no está definido en .env — el servidor no puede arrancar sin una clave segura');
}
let repositories;
let db;
// Inicializar repositorios
const initializeRepositories = () => {
    repositories = {
        estudianteRepository: new estudianteRepositoryImpl_1.EstudianteRepositoryImpl(),
        profesorRepository: new profesorRepositoryImpl_1.ProfesorRepositoryImpl(),
        cursoRepository: new CursoRepositoryImpl_1.CursoRepositoryImpl(),
        calificacionRepository: new calificacionRepositoryImpl_1.CalificacionRepositoryImpl(),
        boletinRepository: new boletinRepositoryImpl_1.BoletinRepositoryImpl(),
        matriculaRepository: new matriculaRepositoryImpl_1.MatriculaRepositoryImpl(),
        empleadoRepository: new empleadosRepositoryImpl_1.EmpleadoRepositoryImpl(),
        asignaturaRepository: new asignaturaRepositoryImpl_1.AsignaturaRepositoryImpl(),
        userRepository: new userRepositoryImpl_1.UserRepositoryImpl(),
        asistenciaRepository: new asistenciaRepositoryImpl_1.AsistenciaRepositoryImpl(),
    };
};
// Configuración de Apollo Server
const typeDefs = (0, fs_1.readFileSync)(path_1.default.join(__dirname, './infrastructure/adapters/inputs/schema.graphql'), 'utf8');
const schema = (0, schema_1.makeExecutableSchema)({ typeDefs, resolvers: resolvers_1.resolvers });
const server = new apollo_server_express_1.ApolloServer({
    schema,
    context: async ({ req }) => {
        try {
            let user = null;
            const token = req.headers.authorization?.split(' ')[1];
            if (token) {
                try {
                    const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
                    // Usar UserModel en lugar de User.findById
                    const userFromDB = await UserModel_1.UserModel.findById(decoded.id);
                    if (userFromDB) {
                        // Normalizar el rol para que las verificaciones sean consistentes
                        const rawRole = userFromDB.role || '';
                        const normalizedRole = ['admin', 'administrator', 'ADMIN', 'ADMINISTRATOR'].includes(rawRole) ? 'ADMIN' :
                            ['teacher', 'profesor', 'TEACHER', 'PROFESOR'].includes(rawRole) ? 'PROFESOR' :
                                ['student', 'estudiante', 'STUDENT', 'ESTUDIANTE'].includes(rawRole) ? 'ESTUDIANTE' :
                                    rawRole.toUpperCase();
                        user = {
                            id: userFromDB._id,
                            username: userFromDB.username,
                            role: normalizedRole
                        };
                    }
                }
                catch (tokenError) {
                    console.error('Error al verificar token:', tokenError);
                }
            }
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
const app = (0, express_1.default)();
const projectRoot = path_1.default.resolve(__dirname, '../..');
const frontendAppPath = path_1.default.join(projectRoot, 'frondend', 'src', 'app');
const frontendComponentsPath = path_1.default.join(frontendAppPath, 'components');
app.use((req, res, next) => {
    // Solo loguear en desarrollo — nunca en producción (contiene tokens y contraseñas)
    if (process.env.NODE_ENV !== 'production') {
        console.log(`📝 ${req.method} ${req.path}`);
    }
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
app.use(express_1.default.json());
// Servir frontend local para pruebas en localhost
app.use(express_1.default.static(frontendAppPath));
app.use(express_1.default.static(frontendComponentsPath));
app.get('/', (_req, res) => {
    res.sendFile(path_1.default.join(frontendComponentsPath, 'principal.html'));
});
// Middleware de depuración solo en desarrollo
app.use('/graphql', (req, res, next) => {
    if (process.env.NODE_ENV !== 'production' && req.method === 'POST' && req.body) {
        console.log('📊 GraphQL:', req.body?.operationName ?? req.body?.query?.slice(0, 60));
    }
    next();
});
// Iniciar servidor
const startServer = async () => {
    try {
        // Conexión a MongoDB Atlas
        await (0, mongo_1.connectMongo)();
        console.log('✅ Conectado a MongoDB Atlas');
        db = mongoose_1.default.connection;
        // Crear admin si no existe (no detiene el servidor si falla)
        await (0, adminSetup_1.crearAdminSiNoExiste)();
        // Verificar servicio de correo (no detiene el servidor si falla)
        await (0, Emailservice_1.verificarConexionEmail)();
        // Inicializar repositorios
        initializeRepositories();
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