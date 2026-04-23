export class Profesor {
    cedula;
    nombre;
    primerApellido;
    segundoApellido;
    email;
    telefono;
    direccion;
    empleado;
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
//# sourceMappingURL=profesor.js.map