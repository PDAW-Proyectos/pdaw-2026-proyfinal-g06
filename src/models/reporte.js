const crearErrorValidacionReporte = (mensaje) => {
  const error = new Error(mensaje);
  error.statusCode = 400;
  error.status = 400;
  return error;
};

class Reporte {
  #idUsuario;
  #idPublicacion;
  #motivo;
  #fecha;

  constructor({
    idUsuario,
    idPublicacion,
    motivo,
    fecha = new Date().toISOString()
  }) {
    if (typeof idUsuario !== 'string' || !idUsuario.trim()) {
      throw crearErrorValidacionReporte('El identificador de usuario es obligatorio');
    }
    if (typeof idPublicacion !== 'string' || !idPublicacion.trim()) {
      throw crearErrorValidacionReporte('El identificador de publicación es obligatorio');
    }
    const motivoNormalizado = typeof motivo === 'string' ? motivo.trim() : '';
    if (!motivoNormalizado) {
      throw crearErrorValidacionReporte('El motivo del reporte es obligatorio');
    }

    this.#idUsuario = idUsuario.trim();
    this.#idPublicacion = idPublicacion.trim();
    this.#motivo = motivoNormalizado;
    this.#fecha = fecha;
  }

  get idUsuario() {
    return this.#idUsuario;
  }

  get idPublicacion() {
    return this.#idPublicacion;
  }

  get motivo() {
    return this.#motivo;
  }

  get fecha() {
    return this.#fecha;
  }

  toJSON() {
    return {
      idUsuario: this.#idUsuario,
      idPublicacion: this.#idPublicacion,
      motivo: this.#motivo,
      fecha: this.#fecha
    };
  }

  static fromJSON(datos) {
    return new Reporte(datos);
  }
}

module.exports = { Reporte };

