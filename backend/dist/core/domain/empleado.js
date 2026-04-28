export class Empleado {
    cedula;
    nombre;
    primerApellido;
    segundoApellido;
    email;
    telefono;
    direccion;
    tipo;
    id;
    constructor(cedula, nombre, primerApellido, segundoApellido, email, telefono = '', direccion = '', tipo) {
        this.cedula = cedula;
        this.nombre = nombre;
        this.primerApellido = primerApellido;
        this.segundoApellido = segundoApellido;
        this.email = email;
        this.telefono = telefono;
        this.direccion = direccion;
        this.tipo = tipo;
        this.id = cedula;
    }
    validate() {
        if (!this.cedula || !this.nombre || !this.primerApellido || !this.tipo) {
            return false;
        }
        if (this.tipo === 'profesor' && !this.email) {
            return false;
        }
        if (this.email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(this.email)) {
                return false;
            }
        }
        if (this.tipo !== 'estudiante' && this.tipo !== 'profesor') {
            return false;
        }
        return true;
    }
    static fromObject(obj) {
        return new Empleado(obj.cedula, obj.nombre, obj.primerApellido, obj.segundoApellido, obj.email, obj.telefono, obj.direccion, obj.tipo);
    }
    toObject() {
        return {
            id: this.id,
            cedula: this.cedula,
            nombre: this.nombre,
            primerApellido: this.primerApellido,
            segundoApellido: this.segundoApellido,
            email: this.email,
            telefono: this.telefono,
            direccion: this.direccion,
            tipo: this.tipo
        };
    }
}
//# sourceMappingURL=empleado.js.map