const { randomUUID } = require('crypto');

const crearErrorValidacion = (mensaje) => {
  const error = new Error(mensaje);
  error.statusCode = 400;
  error.status = 400;
  return error;
};

class Puntuacion {
  #id;
  #idUsuario;
  #juego;
  #nota;
  #fechaActualizacion;

  constructor({ id = randomUUID(), idUsuario, juego, nota, fechaActualizacion = new Date().toISOString() }) {
    if (typeof idUsuario !== 'string' || !idUsuario.trim()) {
      throw crearErrorValidacion('El identificador de usuario es obligatorio');
    }
    if (typeof juego !== 'string' || !juego.trim()) {
      throw crearErrorValidacion('El nombre del videojuego es obligatorio');
    }
    const notaEntera = Number(nota);
    if (!Number.isInteger(notaEntera) || notaEntera < 1 || notaEntera > 10) {
      throw crearErrorValidacion('La puntuación debe ser un número entero entre 1 y 10');
    }

    this.#id = id;
    this.#idUsuario = idUsuario.trim();
    this.#juego = juego.trim();
    this.#nota = notaEntera;
    this.#fechaActualizacion = fechaActualizacion;
  }

  get id() {
    return this.#id;
  }

  get idUsuario() {
    return this.#idUsuario;
  }

  get juego() {
    return this.#juego;
  }

  get nota() {
    return this.#nota;
  }

  get fechaActualizacion() {
    return this.#fechaActualizacion;
  }

  actualizarNota(nuevaNota) {
    const notaEntera = Number(nuevaNota);
    if (!Number.isInteger(notaEntera) || notaEntera < 1 || notaEntera > 10) {
      throw crearErrorValidacion('La puntuación debe ser un número entero entre 1 y 10');
    }
    this.#nota = notaEntera;
    this.#fechaActualizacion = new Date().toISOString();
    return this;
  }

  toJSON() {
    return {
      id: this.#id,
      idUsuario: this.#idUsuario,
      juego: this.#juego,
      nota: this.#nota,
      fechaActualizacion: this.#fechaActualizacion
    };
  }

  static fromJSON(datos) {
    return new Puntuacion(datos);
  }
}

module.exports = { Puntuacion };
