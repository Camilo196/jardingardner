"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmpleadoRepositoryImpl = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const EmpleadoModel_1 = require("./models/EmpleadoModel");
class EmpleadoRepositoryImpl {
    async findByCedula(cedula) {
        try {
            return await EmpleadoModel_1.EmpleadoModel.findOne({ cedula });
        }
        catch (error) {
            console.error('Error en findByCedula:', error);
            throw error;
        }
    }
    async findByEmail(email) {
        try {
            return await EmpleadoModel_1.EmpleadoModel.findOne({ email });
        }
        catch (error) {
            console.error('Error en findByEmail:', error);
            throw error;
        }
    }
    async create(empleado) {
        const session = await mongoose_1.default.startSession();
        session.startTransaction();
        try {
            // Verificar si ya existe
            const existente = await this.findByCedula(empleado.cedula);
            if (existente) {
                throw new Error(`Ya existe un empleado con la cédula ${empleado.cedula}`);
            }
            // Verificar email único
            const emailExistente = await this.findByEmail(empleado.email);
            if (emailExistente) {
                throw new Error(`Ya existe un empleado con el email ${empleado.email}`);
            }
            // Crear el empleado
            const nuevoEmpleado = new EmpleadoModel_1.EmpleadoModel({
                _id: empleado.cedula,
                ...empleado
            });
            const savedEmpleado = await nuevoEmpleado.save({ session });
            await session.commitTransaction();
            return savedEmpleado;
        }
        catch (error) {
            await session.abortTransaction();
            console.error('Error en create:', error);
            throw error;
        }
        finally {
            session.endSession();
        }
    }
    async update(id, empleadoData) {
        const session = await mongoose_1.default.startSession();
        session.startTransaction();
        try {
            const updatedEmpleado = await EmpleadoModel_1.EmpleadoModel.findByIdAndUpdate(id, { $set: empleadoData }, { new: true, session });
            if (!updatedEmpleado) {
                throw new Error('No se encontró el empleado a actualizar');
            }
            await session.commitTransaction();
            return updatedEmpleado;
        }
        catch (error) {
            await session.abortTransaction();
            console.error('Error en update:', error);
            throw error;
        }
        finally {
            session.endSession();
        }
    }
    async delete(id) {
        const session = await mongoose_1.default.startSession();
        session.startTransaction();
        try {
            const result = await EmpleadoModel_1.EmpleadoModel.findByIdAndDelete(id, { session });
            if (!result) {
                throw new Error('No se encontró el empleado a eliminar');
            }
            await session.commitTransaction();
            return true;
        }
        catch (error) {
            await session.abortTransaction();
            console.error('Error en delete:', error);
            throw error;
        }
        finally {
            session.endSession();
        }
    }
    async findAll() {
        try {
            return await EmpleadoModel_1.EmpleadoModel.find().lean().exec();
        }
        catch (error) {
            console.error('Error en findAll:', error);
            throw error;
        }
    }
}
exports.EmpleadoRepositoryImpl = EmpleadoRepositoryImpl;
//# sourceMappingURL=empleadosRepositoryImpl.js.map