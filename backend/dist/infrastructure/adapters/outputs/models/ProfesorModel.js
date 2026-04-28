"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfesorModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const profesorSchema = new mongoose_1.Schema({
    _id: {
        type: String, // Ya está correcto, usando String para la cédula
        required: true,
        trim: true
    },
    cedula: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    empleadoId: {
        type: mongoose_1.Schema.Types.Mixed, // CAMBIO AQUÍ: Ahora acepta tanto ObjectId como String
        ref: 'Empleado',
        required: true
    }
}, {
    timestamps: true,
    _id: false // Importante: Permitir IDs personalizados
});
// Middleware para asegurar que _id es igual a cedula
profesorSchema.pre('save', function (next) {
    if (this.isNew && this.cedula) {
        this._id = this.cedula;
        // Si empleadoId es la misma cédula, asegurarse de que sea string
        if (this.empleadoId && this.empleadoId === this.cedula) {
            this.empleadoId = String(this.empleadoId);
        }
    }
    next();
});
exports.ProfesorModel = mongoose_1.default.model('Profesor', profesorSchema);
//# sourceMappingURL=ProfesorModel.js.map