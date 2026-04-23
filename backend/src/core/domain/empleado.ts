export class Empleado {
    public id: string;
    
    constructor(
        public cedula: string,
        public nombre: string,
        public primerApellido: string,
        public segundoApellido: string,
        public email: string,
        public telefono: string = '',
        public direccion: string = '',
        public tipo: 'estudiante' | 'profesor'
    ) {
        this.id = cedula;
    }

    public validate(): boolean {
        if (!this.cedula || !this.nombre || !this.primerApellido || !this.email || !this.tipo) {
            return false;
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(this.email)) {
            return false;
        }

        if (this.tipo !== 'estudiante' && this.tipo !== 'profesor') {
            return false;
        }

        return true;
    }

    public static fromObject(obj: any): Empleado {
        return new Empleado(
            obj.cedula,
            obj.nombre,
            obj.primerApellido,
            obj.segundoApellido,
            obj.email,
            obj.telefono,
            obj.direccion,
            obj.tipo
        );
    }

    public toObject() {
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