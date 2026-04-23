export class Matricula {
    constructor(
      public id: string,
      public estudianteId: string,
      public cursoId: string,
      public asignaturas: string[], // IDs de las asignaturas
      public estado: 'ACTIVA' | 'CANCELADA' | 'FINALIZADA' | 'SIN_PAGAR',
      public periodo: string,
      public fechaMatricula: Date
    ) {}
  }
  
  // Definir la interfaz para crear una matrícula
  export interface CrearMatriculaInput {
    estudianteId: string;
    cursoId: string;
    asignaturas: string[]; // IDs de las asignaturas
    estado: 'ACTIVA' | 'CANCELADA' | 'FINALIZADA' | 'SIN_PAGAR';
    periodo: string;
  }
  
  // Definir la interfaz para actualizar una matrícula
  export interface ActualizarMatriculaInput {
    estudianteId?: string;
    cursoId?: string;
    asignaturas?: string[]; // IDs de las asignaturas
    estado?: 'ACTIVA' | 'CANCELADA' | 'FINALIZADA' | 'SIN_PAGAR';
    periodo?: string;
  }
