const { randomUUID } = require('crypto');

const crearErrorValidacion = (mensaje) => {
  const error = new Error(mensaje);
  error.statusCode = 400;
  error.status = 400;
  return error;
};

class Comentario {
  #id;
  #idPublicacion;
  #idPadre;
  #contenido;
  #autor;
  #eliminado;
  #fechaCreacion;
  #fechaActualizacion;
  #fechaEliminacion;

  constructor({
    id = randomUUID(),
    postId,
    idPublicacion,
    parentId = null,
    idPadre = null,
    content,
    contenido,
    author,
    autor,
    deleted = false,
    eliminado = false,
    createdAt = new Date().toISOString(),
    fechaCreacion,
    updatedAt = null,
    fechaActualizacion = null,
    deletedAt = null,
    fechaEliminacion = null
  }) {
    const publicacionFinal = idPublicacion !== undefined ? idPublicacion : postId;
    const padreFinal = idPadre !== undefined && idPadre !== null ? idPadre : (parentId || null);
    const contenidoFinal = contenido !== undefined ? contenido : content;
    const autorFinal = autor !== undefined ? autor : author;
    const eliminadoFinal = Boolean(eliminado || deleted);

    if (typeof publicacionFinal !== 'string' || !publicacionFinal.trim()) {
      throw crearErrorValidacion('El identificador de la publicación es obligatorio');
    }
    if (!eliminadoFinal && (typeof contenidoFinal !== 'string' || !contenidoFinal.trim())) {
      throw crearErrorValidacion('El comentario no puede estar vacío');
    }
    if (typeof contenidoFinal === 'string' && contenidoFinal.trim().length > 2000) {
      throw crearErrorValidacion('El comentario no puede superar los 2000 caracteres');
    }
    if (!autorFinal || typeof autorFinal !== 'object' || !autorFinal.id) {
      throw crearErrorValidacion('El autor del comentario es obligatorio');
    }

    this.#id = id;
    this.#idPublicacion = publicacionFinal.trim();
    this.#idPadre = padreFinal ? String(padreFinal) : null;
    this.#contenido = eliminadoFinal ? '' : contenidoFinal.trim();
    this.#autor = { id: autorFinal.id, name: autorFinal.name || autorFinal.nombre || 'Usuario' };
    this.#eliminado = eliminadoFinal;
    this.#fechaCreacion = fechaCreacion || createdAt;
    this.#fechaActualizacion = fechaActualizacion || updatedAt;
    this.#fechaEliminacion = fechaEliminacion || deletedAt;
  }

  get id() {
    return this.#id;
  }

  get postId() {
    return this.#idPublicacion;
  }

  get parentId() {
    return this.#idPadre;
  }

  get content() {
    return this.#contenido;
  }

  get author() {
    return { ...this.#autor };
  }

  get deleted() {
    return this.#eliminado;
  }

  get createdAt() {
    return this.#fechaCreacion;
  }

  get updatedAt() {
    return this.#fechaActualizacion;
  }

  get deletedAt() {
    return this.#fechaEliminacion;
  }

  actualizarContenido(nuevoContenido) {
    if (this.#eliminado) {
      throw crearErrorValidacion('No se puede editar un comentario eliminado');
    }
    if (typeof nuevoContenido !== 'string' || !nuevoContenido.trim()) {
      throw crearErrorValidacion('El comentario no puede estar vacío');
    }
    if (nuevoContenido.trim().length > 2000) {
      throw crearErrorValidacion('El comentario no puede superar los 2000 caracteres');
    }
    this.#contenido = nuevoContenido.trim();
    this.#fechaActualizacion = new Date().toISOString();
  }

  marcarEliminado() {
    this.#contenido = '';
    this.#eliminado = true;
    this.#fechaEliminacion = new Date().toISOString();
  }

  toJSON() {
    const objeto = {
      id: this.#id,
      postId: this.#idPublicacion,
      parentId: this.#idPadre,
      content: this.#contenido,
      author: { ...this.#autor },
      createdAt: this.#fechaCreacion
    };
    if (this.#fechaActualizacion) {
      objeto.updatedAt = this.#fechaActualizacion;
    }
    if (this.#eliminado) {
      objeto.deleted = true;
      objeto.deletedAt = this.#fechaEliminacion;
    }
    return objeto;
  }

  static fromJSON(datos) {
    return new Comentario(datos);
  }
}

module.exports = { Comentario };
