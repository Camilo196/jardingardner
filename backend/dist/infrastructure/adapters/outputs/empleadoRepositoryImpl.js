import { Empleado } from '../../../core/domain/empleado';
import { EmpleadoModel } from './models/EmpleadoModel';
export class EmpleadoRepositoryImpl {
    async create(empleadoData) {
        const nuevoEmpleado = new EmpleadoModel(empleadoData);
        const savedEmpleado = await nuevoEmpleado.save();
        return this.mapToEntity(savedEmpleado);
    }
    async findAll() {
        const empleadosDoc = await EmpleadoModel.find().exec();
        return empleadosDoc.map(this.mapToEntity);
    }
    async findById(id) {
        const empleadoDoc = await EmpleadoModel.findById(id).exec();
        return empleadoDoc ? this.mapToEntity(empleadoDoc) : null;
    }
    async update(id, empleadoData) {
        const updatedEmpleado = await EmpleadoModel.findByIdAndUpdate(id, empleadoData, { new: true }).exec();
        return updatedEmpleado ? this.mapToEntity(updatedEmpleado) : null;
    }
    async delete(id) {
        const result = await EmpleadoModel.findByIdAndDelete(id).exec();
        return !!result;
    }
    mapToEntity(doc) {
        return new Empleado(doc._id.toString(), doc.nombre, doc.primerApellido, doc.segundoApellido, doc.cedula, doc.email, doc.telefono, doc.direccion);
    }
}
//# sourceMappingURL=empleadoRepositoryImpl.js.map