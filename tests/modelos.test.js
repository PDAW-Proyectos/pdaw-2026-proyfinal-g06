const assert = require('node:assert/strict');
const test = require('node:test');
const { Usuario } = require('../src/models/usuario');
const { Publicacion } = require('../src/models/publicacion');
const { Comentario } = require('../src/models/comentario');
const { Puntuacion } = require('../src/models/puntuacion');
const { VotoPublicacion } = require('../src/models/votoPublicacion');
const { Reporte } = require('../src/models/reporte');
const { cargarConfiguracion } = require('../src/config');
const {
  buscarJuegosEnIgdb,
  obtenerJuegoPorIdEnIgdb,
  limpiarCacheIgdb,
  normalizarJuegoIgdb,
  obtenerDeCache,
  guardarEnCache
} = require('../src/utils/adaptadorIgdb');
const servicioPuntuaciones = require('../src/services/servicioPuntuaciones');
const repositorioPuntuaciones = require('../src/repositories/repositorioPuntuaciones');

test('Usuario valida campos obligatorios y normaliza el correo', () => {
  const usuario = new Usuario({
    name: '  Luca  ',
    email: '  LUCA@Example.COM  ',
    passwordHash: 'hash-seguro'
  });

  assert.equal(usuario.nombre, 'Luca');
  assert.equal(usuario.obtenerNombre(), 'Luca');
  assert.equal(usuario.correo, 'luca@example.com');
  assert.equal(usuario.obtenerCorreo(), 'luca@example.com');
  assert.equal(Usuario.fromJSON(usuario.toJSON()).obtenerCorreo(), 'luca@example.com');

  assert.throws(() => new Usuario({ name: '  ', email: 'a@b.com', passwordHash: 'x' }), { statusCode: 400 });
  assert.throws(() => new Usuario({ name: 'Luca', email: 'invalido', passwordHash: 'x' }), { statusCode: 400 });
  assert.throws(() => new Usuario({ name: 'Luca', email: 'a@b.com', passwordHash: '' }), { statusCode: 400 });
});

test('Publicacion valida estado y permite actualizar campos', () => {
  const publicacion = new Publicacion({
    title: 'Guía inicial',
    category: 'Informativa',
    content: 'Texto inicial',
    game: 'Elden Ring',
    author: { id: 'u1', name: 'Luca' }
  });

  assert.equal(publicacion.titulo, 'Guía inicial');
  assert.equal(publicacion.obtenerTitulo(), 'Guía inicial');
  publicacion.actualizar({ title: 'Guía editada', category: 'Descubrimiento o secreto', content: 'Nuevo' });
  assert.equal(publicacion.titulo, 'Guía editada');
  assert.equal(publicacion.obtenerTitulo(), 'Guía editada');
  assert.equal(publicacion.obtenerCategoria(), 'Descubrimiento o secreto');
  assert.equal(Publicacion.fromJSON(publicacion.toJSON()).obtenerJuego(), 'Elden Ring');

  assert.throws(() => publicacion.actualizar({ title: '   ' }), { statusCode: 400 });
  assert.throws(() => new Publicacion({ title: 'Hola', game: '', author: { id: 'u1' } }), { statusCode: 400 });
});

test('Comentario aplica valores limite de longitud y estado eliminado', () => {
  const textoLimite = 'a'.repeat(2000);
  const textoExcedido = 'a'.repeat(2001);

  const comentario = new Comentario({
    postId: 'p1',
    content: textoLimite,
    author: { id: 'u1', name: 'Luca' }
  });
  assert.equal(comentario.contenido.length, 2000);
  assert.equal(comentario.obtenerContenido().length, 2000);

  assert.throws(
    () => new Comentario({ postId: 'p1', content: textoExcedido, author: { id: 'u1' } }),
    { statusCode: 400 }
  );
  assert.throws(
    () => new Comentario({ postId: 'p1', content: '   ', author: { id: 'u1' } }),
    { statusCode: 400 }
  );

  comentario.actualizarContenido('Editado');
  assert.equal(comentario.contenido, 'Editado');
  assert.ok(comentario.obtenerFechaActualizacion());

  comentario.marcarEliminado();
  assert.equal(comentario.eliminado, true);
  assert.equal(comentario.contenido, '');
  assert.throws(() => comentario.actualizarContenido('Otro'), { statusCode: 400 });
});

test('Puntuacion aplica valores limite del 1 al 5', () => {
  const casos = [
    { nota: 0, valido: false },
    { nota: 1, valido: true },
    { nota: 5, valido: true },
    { nota: 6, valido: false },
    { nota: 3.5, valido: false }
  ];

  for (const caso of casos) {
    if (caso.valido) {
      const puntuacion = new Puntuacion({ idUsuario: 'u1', juego: 'Hades', nota: caso.nota });
      assert.equal(puntuacion.nota, caso.nota);
    } else {
      assert.throws(
        () => new Puntuacion({ idUsuario: 'u1', juego: 'Hades', nota: caso.nota }),
        { statusCode: 400 }
      );
    }
  }

  const puntuacion = new Puntuacion({ idUsuario: 'u1', juego: 'Hades', nota: 3 });
  puntuacion.actualizarNota(5);
  assert.equal(puntuacion.nota, 5);
  assert.throws(() => puntuacion.actualizarNota(6), { statusCode: 400 });
});

test('VotoPublicacion aplica tabla de decision para votos validos e invalidos', () => {
  const voto = new VotoPublicacion({ idUsuario: 'u1', idPublicacion: 'p1', valor: 1 });
  assert.equal(voto.valor, 1);
  voto.actualizarValor(-1);
  assert.equal(voto.valor, -1);

  assert.throws(() => new VotoPublicacion({ idUsuario: 'u1', idPublicacion: 'p1', valor: 0 }), { statusCode: 400 });
  assert.throws(() => voto.actualizarValor(2), { statusCode: 400 });
});

test('adaptadorIgdb normaliza juegos, usa cache con expiracion y doble de prueba fetch', async () => {
  limpiarCacheIgdb();

  const juegoNormalizado = normalizarJuegoIgdb({
    id: 10,
    name: 'Celeste',
    summary: 'Plataformas',
    cover: { url: '//images.igdb.com/igdb/image/upload/t_thumb/co3byy.jpg' },
    platforms: [{ name: 'PC' }],
    genres: [{ name: 'Indie' }],
    rating: 92.4
  });

  assert.equal(juegoNormalizado.imagen, 'https://images.igdb.com/igdb/image/upload/t_cover_big/co3byy.jpg');
  assert.equal(juegoNormalizado.puntaje, 9.2);

  guardarEnCache('clave-expira', ['dato'], -1);
  assert.equal(obtenerDeCache('clave-expira'), null);

  let llamadas = 0;
  const fetchDoble = async () => {
    llamadas += 1;
    return {
      ok: true,
      json: async () => ({ access_token: 'tok', expires_in: 3600 })
    };
  };

  const juegos = await buscarJuegosEnIgdb('elden', { fetchImpl: fetchDoble, tiempoVidaMs: 5000 });
  assert.ok(juegos.length >= 1);
  assert.equal(juegos[0].titulo, 'Elden Ring');

  const desdeCache = await buscarJuegosEnIgdb('elden', { fetchImpl: fetchDoble, tiempoVidaMs: 5000 });
  assert.equal(desdeCache.length, juegos.length);
  assert.equal(llamadas, 0);

  const encontrado = await obtenerJuegoPorIdEnIgdb(119133);
  assert.equal(encontrado.titulo, 'Elden Ring');
  assert.equal(await obtenerJuegoPorIdEnIgdb(999999999), null);
});

test('servicioPuntuaciones calcula promedio y valida autenticacion y juego', async () => {
  repositorioPuntuaciones.limpiarPuntuaciones();

  await assert.rejects(
    () => servicioPuntuaciones.registrarPuntuacion('Hades', 5, null),
    { statusCode: 401 }
  );
  await assert.rejects(
    () => servicioPuntuaciones.registrarPuntuacion('   ', 5, 'u1'),
    { statusCode: 400 }
  );

  const resumen1 = await servicioPuntuaciones.registrarPuntuacion('Hades', 4, 'u1');
  assert.equal(resumen1.promedio, 4);
  assert.equal(resumen1.cantidadVotos, 1);

  const resumen2 = await servicioPuntuaciones.registrarPuntuacion('Hades', 5, 'u2');
  assert.equal(resumen2.promedio, 4.5);
  assert.equal(resumen2.cantidadVotos, 2);

  const resumenPublico = await servicioPuntuaciones.obtenerResumenPuntuacion('Hades', null);
  assert.equal(resumenPublico.miPuntuacion, null);
});

test('Reporte valida motivo obligatorio y serializa correctamente', () => {
  const reporte = new Reporte({
    idUsuario: 'u1',
    idPublicacion: 'p1',
    motivo: '  Spam o publicidad  '
  });

  assert.equal(reporte.motivo, 'Spam o publicidad');
  assert.equal(Reporte.fromJSON(reporte.toJSON()).idPublicacion, 'p1');

  assert.throws(
    () => new Reporte({ idUsuario: 'u1', idPublicacion: 'p1', motivo: '   ' }),
    { statusCode: 400 }
  );
  assert.throws(
    () => new Reporte({ idUsuario: '', idPublicacion: 'p1', motivo: 'Spam' }),
    { statusCode: 400 }
  );
});

test('cargarConfiguracion valida SESSION_SECRET en produccion y congela el objeto', () => {
  const dev = cargarConfiguracion({ NODE_ENV: 'development', PORT: '4000' });
  assert.equal(dev.puerto, 4000);
  assert.equal(dev.esProduccion, false);
  assert.equal(Object.isFrozen(dev), true);

  assert.throws(
    () => cargarConfiguracion({ NODE_ENV: 'production' }),
    /SESSION_SECRET/
  );
});

