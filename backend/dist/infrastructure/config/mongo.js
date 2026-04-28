"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMongoUri = getMongoUri;
exports.configureMongoDns = configureMongoDns;
exports.connectMongo = connectMongo;
const node_dns_1 = __importDefault(require("node:dns"));
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
function firstDefined(...values) {
    for (const value of values) {
        if (value && value.trim()) {
            return value.trim();
        }
    }
    return undefined;
}
function getMongoUri() {
    const directUri = firstDefined(process.env.MONGO_URI_DIRECT, process.env.MONGODB_URI_DIRECT);
    const defaultUri = firstDefined(process.env.MONGO_URI, process.env.MONGODB_URI);
    const uri = directUri ?? defaultUri;
    if (!uri) {
        throw new Error('Define MONGO_URI, MONGODB_URI o MONGO_URI_DIRECT en el archivo .env');
    }
    return uri;
}
function configureMongoDns() {
    const rawServers = process.env.MONGO_DNS_SERVERS;
    if (!rawServers) {
        return;
    }
    const servers = rawServers
        .split(',')
        .map(server => server.trim())
        .filter(Boolean);
    if (servers.length > 0) {
        node_dns_1.default.setServers(servers);
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
async function connectMongo() {
    const uri = getMongoUri();
    configureMongoDns();
    try {
        await mongoose_1.default.connect(uri);
    }
    catch (error) {
        throw normalizeMongoConnectionError(error, uri);
    }
}
//# sourceMappingURL=mongo.js.map