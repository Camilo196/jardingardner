"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Estudiante = void 0;
class Estudiante {
    constructor(cedula, nombre, primerApellido, segundoApellido, email = '', telefono = '', direccion = '', acudiente = '') {
        this.cedula = cedula;
        this.nombre = nombre;
        this.primerApellido = primerApellido;
        this.segundoApellido = segundoApellido;
        this.email = email;
        this.telefono = telefono;
        this.direccion = direccion;
        this.acudiente = acudiente;
    }
    get id() {
        return this.cedula;
    }
    // Método para obtener solo los datos específicos del estudiante
    toEstudianteData() {
        return {
            cedula: this.cedula,
            acudiente: this.acudiente
        };
    }
    // Método para obtener los datos del empleado
    toEmpleadoData() {
        return {
            cedula: this.cedula,
            nombre: this.nombre,
            primerApellido: this.primerApellido,
            segundoApellido: this.segundoApellido,
            email: this.email,
            telefono: this.telefono,
            direccion: this.direccion,
            tipo: 'estudiante'
        };
    }
}
exports.Estudiante = Estudiante;
//# sourceMappingURL=estudiante.js.map