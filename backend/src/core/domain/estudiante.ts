export class Estudiante {
    public empleado?: any; // Para compatibilidad con los resolvers

    constructor(
        public cedula: string,
        public nombre: string,
        public primerApellido: string,
        public segundoApellido: string,
        public email: string,
        public telefono: string = '',
        public direccion: string = '',
        public acudiente: string = ''
    ) {}

    get id(): string {
        return this.cedula;
    }

    // Método para obtener solo los datos específicos del estudiante
    public toEstudianteData() {
        return {
            cedula: this.cedula,
            acudiente: this.acudiente
        };
    }

    // Método para obtener los datos del empleado
    public toEmpleadoData() {
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