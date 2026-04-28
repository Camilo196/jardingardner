"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Profesor = void 0;
class Profesor {
    constructor(cedula, nombre, primerApellido, segundoApellido, email, telefono = '', direccion = '') {
        this.cedula = cedula;
        this.nombre = nombre;
        this.primerApellido = primerApellido;
        this.segundoApellido = segundoApellido;
        this.email = email;
        this.telefono = telefono;
        this.direccion = direccion;
    }
    get id() {
        return this.cedula;
    }
}
exports.Profesor = Profesor;
//# sourceMappingURL=profesor.js.map