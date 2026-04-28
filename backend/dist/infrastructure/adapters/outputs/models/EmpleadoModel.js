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
exports.EmpleadoModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const empleadoSchema = new mongoose_1.Schema({
    _id: {
        type: mongoose_1.Schema.Types.Mixed, // Esto permite usar tanto ObjectId como String
        required: true
    },
    cedula: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    nombre: {
        type: String,
        required: true,
        trim: true
    },
    primerApellido: {
        type: String,
        required: true,
        trim: true
    },
    segundoApellido: {
        type: String,
        trim: true
    },
    email: {
        type: String,
        trim: true,
        unique: true,
        sparse: true
    },
    telefono: {
        type: String,
        trim: true
    },
    direccion: {
        type: String,
        trim: true
    },
    tipo: {
        type: String,
        enum: ['profesor', 'administrativo', 'estudiante', 'otro'], // Añadir 'estudiante' a la lista
        default: 'otro'
    }
}, {
    timestamps: true,
    // Esto es crucial para permitir IDs personalizados que no sean ObjectId
    _id: false
});
// Este middleware hace que la cédula se use como _id para profesores y estudiantes
empleadoSchema.pre('save', function (next) {
    // Aplicar la misma lógica para profesores y estudiantes
    if (this.isNew && (this.tipo === 'profesor' || this.tipo === 'estudiante') && this.cedula) {
        this._id = this.cedula;
    }
    next();
});
exports.EmpleadoModel = mongoose_1.default.model('Empleado', empleadoSchema);
//# sourceMappingURL=EmpleadoModel.js.map