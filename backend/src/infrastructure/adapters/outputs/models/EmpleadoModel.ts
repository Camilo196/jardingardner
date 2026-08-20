import mongoose, { Schema } from 'mongoose';

const empleadoSchema = new Schema({
  _id: {
    type: Schema.Types.Mixed, // Esto permite usar tanto ObjectId como String
    required: true
  },
  cedula: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  nombre: {
    type: String,
    required: true,
    trim: true
  },
  primerApellido: {
    type: String,
    required: true,
    trim: true
  },
  segundoApellido: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    unique: true,
    sparse: true
  },
  telefono: {
    type: String,
    trim: true
  },
  direccion: {
    type: String,
    trim: true
  },
  tipo: {
    type: String,
    enum: ['profesor', 'administrativo', 'estudiante', 'otro'], // Añadir 'estudiante' a la lista
    default: 'otro'
  }
}, { 
  timestamps: true,
  // Esto es crucial para permitir IDs personalizados que no sean ObjectId
  _id: false 
});

// Este middleware hace que la cédula se use como _id para profesores y estudiantes
empleadoSchema.pre('save', function(next) {
  // Aplicar la misma lógica para profesores y estudiantes
  if (this.isNew && (this.tipo === 'profesor' || this.tipo === 'estudiante') && this.cedula) {
    this._id = this.cedula;
  }
  next();
});

export const EmpleadoModel = mongoose.model('Empleado', empleadoSchema);
