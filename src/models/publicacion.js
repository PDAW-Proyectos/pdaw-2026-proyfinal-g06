const { randomUUID } = require('crypto');

const crearErrorValidacion = (mensaje) => {
  const error = new Error(mensaje);
  error.statusCode = 400;
  error.status = 400;
  return error;
};

class Publicacion {
  #id;
  #titulo;
  #categoria;
  #contenido;
  #juego;
  #imagenJuego;
  #datosJuego;
  #autor;
  #fechaCreacion;

  constructor({
    id = randomUUID(),
    title,
    titulo,
    category = 'Informativa',
    categoria,
    content = '',
    contenido,
    game,
    juego,
    imagenJuego = '',
    datosJuego = null,
    author,
    autor,
    createdAt = new Date().toISOString(),
    fechaCreacion
  }) {
    const tituloFinal = titulo !== undefined ? titulo : title;
    const categoriaFinal = categoria !== undefined ? categoria : category;
    const contenidoFinal = contenido !== undefined ? contenido : content;
    const juegoFinal = juego !== undefined ? juego : game;
    const autorFinal = autor !== undefined ? autor : author;

    if (typeof tituloFinal !== 'string' || !tituloFinal.trim()) {
      throw crearErrorValidacion('El título de la publicación es obligatorio');
    }
    if (typeof juegoFinal !== 'string' || !juegoFinal.trim()) {
      throw crearErrorValidacion('El juego asociado es obligatorio');
    }
    if (!autorFinal || typeof autorFinal !== 'object' || !autorFinal.id) {
      throw crearErrorValidacion('El autor de la publicación es obligatorio');
    }

    this.#id = id;
    this.#titulo = tituloFinal.trim();
    this.#categoria = typeof categoriaFinal === 'string' && categoriaFinal.trim()
      ? categoriaFinal.trim()
      : 'Informativa';
    this.#contenido = typeof contenidoFinal === 'string' ? contenidoFinal.trim() : '';
    this.#juego = juegoFinal.trim();
    this.#imagenJuego = imagenJuego || '';
    this.#datosJuego = datosJuego || null;
    this.#autor = { id: autorFinal.id, name: autorFinal.name || autorFinal.nombre || 'Usuario' };
    this.#fechaCreacion = fechaCreacion || createdAt;
  }

  get id() {
    return this.#id;
  }

  get title() {
    return this.#titulo;
  }

  get titulo() {
    return this.#titulo;
  }

  get category() {
    return this.#categoria;
  }

  get categoria() {
    return this.#categoria;
  }

  get content() {
    return this.#contenido;
  }

  get contenido() {
    return this.#contenido;
  }

  get game() {
    return this.#juego;
  }

  get juego() {
    return this.#juego;
  }

  get imagenJuego() {
    return this.#imagenJuego;
  }

  get datosJuego() {
    return this.#datosJuego;
  }

  get author() {
    return { ...this.#autor };
  }

  get autor() {
    return { ...this.#autor };
  }

  get createdAt() {
    return this.#fechaCreacion;
  }

  actualizar(datos = {}) {
    const nuevoTitulo = datos.titulo !== undefined ? datos.titulo : datos.title;
    const nuevaCategoria = datos.categoria !== undefined ? datos.categoria : datos.category;
    const nuevoContenido = datos.contenido !== undefined ? datos.contenido : datos.content;
    const nuevoJuego = datos.juego !== undefined ? datos.juego : datos.game;

    if (nuevoTitulo !== undefined) {
      if (typeof nuevoTitulo !== 'string' || !nuevoTitulo.trim()) {
        throw crearErrorValidacion('El título de la publicación es obligatorio');
      }
      this.#titulo = nuevoTitulo.trim();
    }
    if (nuevaCategoria !== undefined && typeof nuevaCategoria === 'string' && nuevaCategoria.trim()) {
      this.#categoria = nuevaCategoria.trim();
    }
    if (nuevoContenido !== undefined && typeof nuevoContenido === 'string') {
      this.#contenido = nuevoContenido.trim();
    }
    if (nuevoJuego !== undefined && typeof nuevoJuego === 'string' && nuevoJuego.trim()) {
      this.#juego = nuevoJuego.trim();
    }
    if (datos.imagenJuego !== undefined) {
      this.#imagenJuego = datos.imagenJuego || '';
    }
    if (datos.datosJuego !== undefined) {
      this.#datosJuego = datos.datosJuego || null;
    }
  }

  toJSON() {
    return {
      id: this.#id,
      title: this.#titulo,
      titulo: this.#titulo,
      category: this.#categoria,
      categoria: this.#categoria,
      content: this.#contenido,
      contenido: this.#contenido,
      game: this.#juego,
      juego: this.#juego,
      imagenJuego: this.#imagenJuego,
      datosJuego: this.#datosJuego,
      author: { ...this.#autor },
      createdAt: this.#fechaCreacion
    };
  }

  static fromJSON(datos) {
    return new Publicacion(datos);
  }
}

module.exports = { Publicacion };
