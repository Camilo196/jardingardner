import { ApolloServer } from 'apollo-server-express';
import { resolvers } from './infrastructure/adapters/inputs/resolvers';
import express from 'express';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { readFileSync } from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { EstudianteRepositoryImpl } from './infrastructure/adapters/outputs/estudianteRepositoryImpl';
import { ProfesorRepositoryImpl } from './infrastructure/adapters/outputs/profesorRepositoryImpl';
import { CursoRepositoryImpl } from './infrastructure/adapters/outputs/CursoRepositoryImpl';
import { CalificacionRepositoryImpl } from './infrastructure/adapters/outputs/calificacionRepositoryImpl';
import { BoletinRepositoryImpl } from './infrastructure/adapters/outputs/boletinRepositoryImpl';
import { MatriculaRepositoryImpl } from './infrastructure/adapters/outputs/matriculaRepositoryImpl';
import { EmpleadoRepositoryImpl } from './infrastructure/adapters/outputs/empleadosRepositoryImpl';
import { AsignaturaRepositoryImpl } from './infrastructure/adapters/outputs/asignaturaRepositoryImpl';
import { UserRepositoryImpl } from './infrastructure/adapters/outputs/userRepositoryImpl';
import { UserModel } from './infrastructure/adapters/outputs/models/UserModel';
import { crearAdminSiNoExiste } from './core/services/adminSetup';
import { verificarConexionEmail } from './core/services/Emailservice';
import { AsistenciaRepositoryImpl } from './infrastructure/adapters/outputs/asistenciaRepositoryImpl';
import { connectMongo } from './infrastructure/config/mongo';

dotenv.config();

// Configuración de MongoDB Atlas
const MONGO_URI =
  process.env.MONGO_URI ??
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

let repositories: any;
let db: any;

// Inicializar repositorios
const initializeRepositories = () => {
  repositories = {
    estudianteRepository: new EstudianteRepositoryImpl(),
    profesorRepository: new ProfesorRepositoryImpl(),
    cursoRepository: new CursoRepositoryImpl(),
    calificacionRepository: new CalificacionRepositoryImpl(),
    boletinRepository: new BoletinRepositoryImpl(),
    matriculaRepository: new MatriculaRepositoryImpl(),
    empleadoRepository: new EmpleadoRepositoryImpl(),    
    asignaturaRepository: new AsignaturaRepositoryImpl(),
    userRepository: new UserRepositoryImpl(),
    asistenciaRepository: new AsistenciaRepositoryImpl(),
  };
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
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
          
          // Usar UserModel en lugar de User.findById
          const userFromDB = await UserModel.findById(decoded.id);
          
          if (userFromDB) {
            // Normalizar el rol para que las verificaciones sean consistentes
            const rawRole = userFromDB.role || '';
            const normalizedRole =
              ['admin','administrator','ADMIN','ADMINISTRATOR'].includes(rawRole) ? 'ADMIN' :
              ['teacher','profesor','TEACHER','PROFESOR'].includes(rawRole) ? 'PROFESOR' :
              ['student','estudiante','STUDENT','ESTUDIANTE'].includes(rawRole) ? 'ESTUDIANTE' :
              rawRole.toUpperCase();
            user = {
              id: userFromDB._id,
              username: userFromDB.username,
              role: normalizedRole
            };
          }
        } catch (tokenError) {
          console.error('Error al verificar token:', tokenError);
        }
      }

      return {
        user,
        repositories
      };
    } catch (error) {
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
const projectRoot = path.resolve(__dirname, '../..');
const frontendAppPath = path.join(projectRoot, 'frondend', 'src', 'app');
const frontendComponentsPath = path.join(frontendAppPath, 'components');

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

app.use(express.json());

// Servir frontend local para pruebas en localhost
app.use(express.static(frontendAppPath));
app.use(express.static(frontendComponentsPath));
app.get('/', (_req, res) => {
  res.sendFile(path.join(frontendComponentsPath, 'principal.html'));
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
    await connectMongo();
    console.log('✅ Conectado a MongoDB Atlas');
    db = mongoose.connection;

    // Crear admin si no existe (no detiene el servidor si falla)
    await crearAdminSiNoExiste();

    // Verificar servicio de correo (no detiene el servidor si falla)
    await verificarConexionEmail();

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
  } catch (error) {
    console.error('❌ Error fatal al iniciar el servidor:', error);
    process.exit(1);
  }
};

startServer();
