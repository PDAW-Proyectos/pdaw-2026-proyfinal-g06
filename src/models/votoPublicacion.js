const crearErrorValidacionVoto = (mensaje) => {
  const error = new Error(mensaje);
  error.statusCode = 400;
  error.status = 400;
  return error;
};

class VotoPublicacion {
  #idUsuario;
  #idPublicacion;
  #valor;
  #fechaActualizacion;

  constructor({ idUsuario, idPublicacion, valor, fechaActualizacion = new Date().toISOString() }) {
    if (typeof idUsuario !== 'string' || !idUsuario.trim()) {
      throw crearErrorValidacionVoto('El identificador de usuario es obligatorio');
    }
    if (typeof idPublicacion !== 'string' || !idPublicacion.trim()) {
      throw crearErrorValidacionVoto('El identificador de publicación es obligatorio');
    }
    const valorNumerico = Number(valor);
    if (valorNumerico !== 1 && valorNumerico !== -1) {
      throw crearErrorValidacionVoto('El voto debe ser positivo (1) o negativo (-1)');
    }

    this.#idUsuario = idUsuario.trim();
    this.#idPublicacion = idPublicacion.trim();
    this.#valor = valorNumerico;
    this.#fechaActualizacion = fechaActualizacion;
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

  get fechaActualizacion() {
    return this.#fechaActualizacion;
  }

  actualizarValor(nuevoValor) {
    const valorNumerico = Number(nuevoValor);
    if (valorNumerico !== 1 && valorNumerico !== -1) {
      throw crearErrorValidacionVoto('El voto debe ser positivo (1) o negativo (-1)');
    }
    this.#valor = valorNumerico;
    this.#fechaActualizacion = new Date().toISOString();
    return this;
  }

  toJSON() {
    return {
      idUsuario: this.#idUsuario,
      idPublicacion: this.#idPublicacion,
      valor: this.#valor,
      fechaActualizacion: this.#fechaActualizacion
    };
  }

  static fromJSON(datos) {
    return new VotoPublicacion(datos);
  }
}

module.exports = { VotoPublicacion };
