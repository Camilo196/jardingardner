export class Calificacion {
    constructor(
      public id: string,
      public estudianteId: string, // ID del estudiante (ObjectId)
      public asignaturaId: string, // ID de la asignatura (ObjectId)
      public nota: number,
      public periodo: string,
      public observaciones: string,
      public fecha: Date = new Date(),
      public boletinId?: string, // Opcional, puede ser null
      public tipoActividad?: TipoActividad, // TRABAJO, EXAMEN, QUIZ, etc.
      public nombreActividad?: string,      // Ej: "Trabajo 1 - Fracciones"
      public corte?: number  
    ) {}
  }

  export enum TipoActividad {
  TRABAJO = 'TRABAJO',
  EXAMEN = 'EXAMEN',
  QUIZ = 'QUIZ',
  PARTICIPACION = 'PARTICIPACION',
  TALLER = 'TALLER'
}