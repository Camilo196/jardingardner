import mongoose from 'mongoose';
import { EmpleadoModel } from './models/EmpleadoModel';

export class EmpleadoRepositoryImpl {
    async findByCedula(cedula: string): Promise<any> {
        try {
            return await EmpleadoModel.findOne({ cedula });
        } catch (error) {
            console.error('Error en findByCedula:', error);
            throw error;
        }
    }

    async findByEmail(email: string): Promise<any> {
        try {
            return await EmpleadoModel.findOne({ email });
        } catch (error) {
            console.error('Error en findByEmail:', error);
            throw error;
        }
    }

    async create(empleado: any): Promise<any> {
        const session = await mongoose.startSession();
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
            const nuevoEmpleado = new EmpleadoModel({
                _id: empleado.cedula,
                ...empleado
            });
            
            const savedEmpleado = await nuevoEmpleado.save({ session });
            await session.commitTransaction();
            
            return savedEmpleado;
        } catch (error) {
            await session.abortTransaction();
            console.error('Error en create:', error);
            throw error;
        } finally {
            session.endSession();
        }
    }

    async update(id: string, empleadoData: any): Promise<any> {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const updatedEmpleado = await EmpleadoModel.findByIdAndUpdate(
                id,
                { $set: empleadoData },
                { new: true, session }
            );

            if (!updatedEmpleado) {
                throw new Error('No se encontró el empleado a actualizar');
            }

            await session.commitTransaction();
            return updatedEmpleado;
        } catch (error) {
            await session.abortTransaction();
            console.error('Error en update:', error);
            throw error;
        } finally {
            session.endSession();
        }
    }

    async delete(id: string): Promise<boolean> {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const result = await EmpleadoModel.findByIdAndDelete(id, { session });
            
            if (!result) {
                throw new Error('No se encontró el empleado a eliminar');
            }

            await session.commitTransaction();
            return true;
        } catch (error) {
            await session.abortTransaction();
            console.error('Error en delete:', error);
            throw error;
        } finally {
            session.endSession();
        }
    }

    async findAll(): Promise<any[]> {
        try {
            return await EmpleadoModel.find().lean().exec();
        } catch (error) {
            console.error('Error en findAll:', error);
            throw error;
        }
    }
}