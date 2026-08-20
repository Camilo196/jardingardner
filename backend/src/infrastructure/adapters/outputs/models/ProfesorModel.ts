import mongoose, { Schema } from 'mongoose';

const profesorSchema = new Schema({
  _id: { 
    type: String, // Ya está correcto, usando String para la cédula
    required: true,
    trim: true
  },
  cedula: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  empleadoId: {
    type: Schema.Types.Mixed, // CAMBIO AQUÍ: Ahora acepta tanto ObjectId como String
    ref: 'Empleado',
    required: true
  }
}, { 
  timestamps: true,
  _id: false // Importante: Permitir IDs personalizados
});

// Middleware para asegurar que _id es igual a cedula
profesorSchema.pre('save', function(next) {
  if (this.isNew && this.cedula) {
    this._id = this.cedula;
    
    // Si empleadoId es la misma cédula, asegurarse de que sea string
    if (this.empleadoId && this.empleadoId === this.cedula) {
      this.empleadoId = String(this.empleadoId);
    }
  }
  next();
});

export const ProfesorModel = mongoose.model('Profesor', profesorSchema);