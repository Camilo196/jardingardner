"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const mongoose_js_1 = require("./infrastructure/config/mongoose.js");
async function testConnection() {
    try {
        await (0, mongoose_js_1.connectToDatabase)();
        console.log('Conexión exitosa a MongoDB');
    }
    catch (error) {
        console.error('Error al conectar a MongoDB:', error);
    }
    finally {
        // Cerrar la conexión a la base de datos y salir del proceso
        await mongoose_1.default.connection.close();
        process.exit();
    }
}
testConnection();
//# sourceMappingURL=testDatabaseConnection.js.map