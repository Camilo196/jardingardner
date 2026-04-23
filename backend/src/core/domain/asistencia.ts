export type EstadoAsistencia = 'PRESENTE' | 'AUSENTE' | 'TARDE' | 'EXCUSA';

export class Asistencia {
  constructor(
    public id: string,
    public estudianteId: string,   // cédula del estudiante
    public asignaturaId: string,   // ObjectId de la asignatura
    public fecha: Date,
    public estado: EstadoAsistencia,
    public periodo: string,
    public observaciones?: string,
    public registradoPor?: string  // cédula del profesor
  ) {}
}

export interface CrearAsistenciaInput {
  estudianteId: string;
  asignaturaId: string;
  fecha: string;
  estado: EstadoAsistencia;
  periodo: string;
  observaciones?: string;
  registradoPor?: string;
}