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
      public dimensionActividad?: DimensionActividad, // SABER, HACER o SER
      public corte?: number  
    ) {}
  }

  export enum TipoActividad {
  EXAMEN = 'EXAMEN',
  QUIZ = 'QUIZ',
  EVALUACION_ORAL = 'EVALUACION_ORAL',
  EVALUACION_ESCRITA = 'EVALUACION_ESCRITA',
  EXPOSICION = 'EXPOSICION',
  TRABAJO = 'TRABAJO',
  TALLER = 'TALLER',
  TAREA = 'TAREA',
  EJERCICIO_CLASE = 'EJERCICIO_CLASE',
  CUADERNO = 'CUADERNO',
  AUTOEVALUACION = 'AUTOEVALUACION',
  COEVALUACION = 'COEVALUACION',
  HETEROEVALUACION = 'HETEROEVALUACION',
  PARTICIPACION = 'PARTICIPACION'
}

export enum DimensionActividad {
  SABER = 'SABER',
  HACER = 'HACER',
  SER = 'SER'
}
