const { randomUUID } = require('crypto');

const crearErrorValidacion = (mensaje) => {
  const error = new Error(mensaje);
  error.statusCode = 400;
  error.status = 400;
  return error;
};

class Usuario {
  id;
  nombre;
  correo;
  contrasenaHash;
  fechaCreacion;

  constructor({
    id = randomUUID(),
    name,
    nombre,
    email,
    correo,
    passwordHash,
    contrasenaHash,
    createdAt = new Date().toISOString(),
    fechaCreacion
  }) {
    const nombreFinal = nombre !== undefined ? nombre : name;
    const correoFinal = correo !== undefined ? correo : email;
    const hashFinal = contrasenaHash !== undefined ? contrasenaHash : passwordHash;

    if (typeof nombreFinal !== 'string' || !nombreFinal.trim()) {
      throw crearErrorValidacion('El nombre de usuario es obligatorio');
    }
    if (typeof correoFinal !== 'string' || !correoFinal.trim() || !correoFinal.includes('@')) {
      throw crearErrorValidacion('El correo electrónico es inválido');
    }
    if (typeof hashFinal !== 'string' || !hashFinal.trim()) {
      throw crearErrorValidacion('La contraseña procesada es obligatoria');
    }

    this.id = id;
    this.nombre = nombreFinal.trim();
    this.correo = correoFinal.trim().toLowerCase();
    this.contrasenaHash = hashFinal;
    this.fechaCreacion = fechaCreacion || createdAt;
  }

  obtenerNombre() {
    return this.nombre;
  }

  obtenerCorreo() {
    return this.correo;
  }

  obtenerContrasenaHash() {
    return this.contrasenaHash;
  }

  obtenerFechaCreacion() {
    return this.fechaCreacion;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.nombre,
      email: this.correo,
      passwordHash: this.contrasenaHash,
      createdAt: this.fechaCreacion
    };
  }

  static fromJSON(datos) {
    return new Usuario(datos);
  }
}

module.exports = { Usuario };
