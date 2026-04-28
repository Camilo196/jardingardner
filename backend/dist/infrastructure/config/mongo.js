import dns from 'node:dns';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
function firstDefined(...values) {
    for (const value of values) {
        if (value && value.trim()) {
            return value.trim();
        }
    }
    return undefined;
}
export function getMongoUri() {
    const directUri = firstDefined(process.env.MONGO_URI_DIRECT, process.env.MONGODB_URI_DIRECT);
    const defaultUri = firstDefined(process.env.MONGO_URI, process.env.MONGODB_URI);
    const uri = directUri ?? defaultUri;
    if (!uri) {
        throw new Error('Define MONGO_URI, MONGODB_URI o MONGO_URI_DIRECT en el archivo .env');
    }
    return uri;
}
export function configureMongoDns() {
    const rawServers = process.env.MONGO_DNS_SERVERS;
    if (!rawServers) {
        return;
    }
    const servers = rawServers
        .split(',')
        .map(server => server.trim())
        .filter(Boolean);
    if (servers.length > 0) {
        dns.setServers(servers);
        console.log(`MongoDB DNS configurado con: ${servers.join(', ')}`);
    }
}
function normalizeMongoConnectionError(error, uri) {
    const mongoError = error;
    if (mongoError?.code === 'ECONNREFUSED' && mongoError?.syscall === 'querySrv') {
        return new Error('No se pudo resolver el registro DNS SRV de MongoDB Atlas. ' +
            'Tu red o DNS esta rechazando consultas SRV para mongodb+srv://. ' +
            'Prueba con MONGO_DNS_SERVERS=8.8.8.8,1.1.1.1 o usa MONGO_URI_DIRECT con la cadena directa de Atlas. ' +
            `URI actual usa SRV: ${uri.startsWith('mongodb+srv://') ? 'si' : 'no'}.`);
    }
    return error instanceof Error ? error : new Error(String(error));
}
export async function connectMongo() {
    const uri = getMongoUri();
    configureMongoDns();
    try {
        await mongoose.connect(uri);
    }
    catch (error) {
        throw normalizeMongoConnectionError(error, uri);
    }
}
//# sourceMappingURL=mongo.js.map