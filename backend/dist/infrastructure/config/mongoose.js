"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mongoose = void 0;
exports.connectToDatabase = connectToDatabase;
const mongoose_1 = __importDefault(require("mongoose"));
exports.mongoose = mongoose_1.default;
const mongo_js_1 = require("./mongo.js");
async function connectToDatabase() {
    try {
        await (0, mongo_js_1.connectMongo)();
        console.log('Conexion exitosa a MongoDB');
    }
    catch (error) {
        const errorMessage = error.message || error;
        console.error('Error al conectar a MongoDB:', errorMessage);
        throw new Error('Fallo al conectar a MongoDB');
    }
}
//# sourceMappingURL=mongoose.js.map