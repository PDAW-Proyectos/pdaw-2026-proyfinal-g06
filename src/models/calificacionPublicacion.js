const { randomUUID } = require('crypto');

const crearErrorValidacion = (mensaje) => {
  const error = new Error(mensaje);
  error.statusCode = 400;
  error.status = 400;
  return error;
};

class CalificacionPublicacion {
  #id;
  #idUsuario;
  #idPublicacion;
  #valor;
  #fechaCreacion;

  constructor({
    id = randomUUID(),
    idUsuario,
    idPublicacion,
    valor,
    fechaCreacion = new Date().toISOString()
  }) {
    if (typeof idUsuario !== 'string' || !idUsuario.trim()) {
      throw crearErrorValidacion('El identificador de usuario es obligatorio');
    }
    if (typeof idPublicacion !== 'string' || !idPublicacion.trim()) {
      throw crearErrorValidacion('El identificador de publicación es obligatorio');
    }
    const valorNumerico = Number(valor);
    if (!Number.isInteger(valorNumerico) || valorNumerico < 1 || valorNumerico > 5) {
      throw crearErrorValidacion('La puntuación debe ser un número entero entre 1 y 5');
    }

    this.#id = id;
    this.#idUsuario = idUsuario.trim();
    this.#idPublicacion = idPublicacion.trim();
    this.#valor = valorNumerico;
    this.#fechaCreacion = fechaCreacion;
  }

  get id() {
    return this.#id;
  }

  get idUsuario() {
    return this.#idUsuario;
  }

  get idPublicacion() {
    return this.#idPublicacion;
  }

  get valor() {
    return this.#valor;
  }

  get fechaCreacion() {
    return this.#fechaCreacion;
  }

  toJSON() {
    return {
      id: this.#id,
      idUsuario: this.#idUsuario,
      idPublicacion: this.#idPublicacion,
      valor: this.#valor,
      fechaCreacion: this.#fechaCreacion
    };
  }

  static fromJSON(datos) {
    return new CalificacionPublicacion(datos);
  }
}

module.exports = { CalificacionPublicacion };
