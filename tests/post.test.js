const assert = require('node:assert/strict');
const { once } = require('node:events');
const test = require('node:test');
const app = require('../src/app');

test('puntos de acceso para creación y consulta de publicaciones', async (t) => {
  const servidor = app.listen(0);
  await once(servidor, 'listening');
  t.after(() => new Promise((resolve, reject) => {
    servidor.close((error) => (error ? reject(error) : resolve()));
  }));

  const urlBase = `http://127.0.0.1:${servidor.address().port}`;
  const solicitud = (ruta, opciones = {}) => fetch(`${urlBase}${ruta}`, opciones);
  const enviarPost = (ruta, cuerpo, cookie) => solicitud(ruta, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(cookie ? { Cookie: cookie } : {})
    },
    body: JSON.stringify(cuerpo)
  });

  let respuesta = await solicitud('/post.html');
  assert.equal(respuesta.status, 200);
  assert.match(respuesta.headers.get('content-type'), /text\/html/);
  const paginaDetalleHtml = await respuesta.text();
  assert.match(paginaDetalleHtml, /id="boton-editar-publicacion"/);
  assert.match(paginaDetalleHtml, /id="theme-toggle"/);
  assert.match(paginaDetalleHtml, /id="publicacion-portada"/);
  assert.match(paginaDetalleHtml, /id="modal-crear-publicacion"/);

  respuesta = await solicitud('/index.html');
  assert.equal(respuesta.status, 200);
  assert.match(await respuesta.text(), /class="publicacion-portada post-cover/);

  respuesta = await solicitud('/api/posts');
  assert.equal(respuesta.status, 200);
  let cargaPublicaciones = await respuesta.json();
  assert.ok(Array.isArray(cargaPublicaciones.data));
  assert.equal(typeof cargaPublicaciones.page, 'number');

  respuesta = await enviarPost('/api/posts', {
    title: 'Mi primera build',
    category: 'Informativa',
    content: 'Contenido del post',
    game: 'Elden Ring'
  });
  assert.equal(respuesta.status, 401);

  await enviarPost('/api/auth/register', {
    name: 'GamerUno',
    email: 'gamer1@example.com',
    password: 'password123'
  });

  const respuestaInicio = await enviarPost('/api/auth/login', {
    email: 'gamer1@example.com',
    password: 'password123'
  });
  assert.equal(respuestaInicio.status, 200);
  const cookieLogin = respuestaInicio.headers.get('set-cookie').split(';')[0];

  respuesta = await enviarPost('/api/posts', {
    title: '',
    category: 'Informativa',
    content: 'Contenido',
    game: 'Elden Ring'
  }, cookieLogin);
  assert.equal(respuesta.status, 400);

  respuesta = await enviarPost('/api/posts', {
    title: 'Titulo',
    category: 'CategoriaInexistente',
    content: 'Contenido',
    game: 'Elden Ring'
  }, cookieLogin);
  assert.equal(respuesta.status, 400);

  respuesta = await enviarPost('/api/posts', {
    title: 'Titulo',
    category: 'Informativa',
    content: '',
    game: 'Elden Ring'
  }, cookieLogin);
  assert.equal(respuesta.status, 400);

  respuesta = await enviarPost('/api/posts', {
    title: 'Titulo',
    category: 'Informativa',
    content: 'Contenido',
    game: ''
  }, cookieLogin);
  assert.equal(respuesta.status, 400);

  respuesta = await enviarPost('/api/posts', {
    title: '¿Qué build recomiendan?',
    category: 'Review o reseña',
    content: 'Recomiendo build de destreza con sangre.',
    game: 'Elden Ring'
  }, cookieLogin);
  assert.equal(respuesta.status, 201);
  const publicacionCreada = await respuesta.json();
  assert.equal(publicacionCreada.post.title, '¿Qué build recomiendan?');
  assert.equal(publicacionCreada.post.author.name, 'GamerUno');
  assert.equal('email' in publicacionCreada.post.author, false);
  const idPublicacion = publicacionCreada.post.id;

  respuesta = await solicitud(`/api/posts/${idPublicacion}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'Edición no autenticada' })
  });
  assert.equal(respuesta.status, 401);

  respuesta = await solicitud(`/api/posts/${idPublicacion}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Cookie: cookieLogin
    },
    body: JSON.stringify({
      title: '¿Qué build recomiendan? (editado)',
      content: 'Contenido actualizado'
    })
  });
  assert.equal(respuesta.status, 200);
  const publicacionActualizada = await respuesta.json();
  assert.equal(publicacionActualizada.post.title, '¿Qué build recomiendan? (editado)');
  assert.equal(publicacionActualizada.post.content, 'Contenido actualizado');
  assert.equal(publicacionActualizada.post.author.name, 'GamerUno');

  await enviarPost('/api/auth/register', {
    name: 'GamerDos',
    email: 'gamer2@example.com',
    password: 'password123'
  });
  const respuestaSegundoInicio = await enviarPost('/api/auth/login', {
    email: 'gamer2@example.com',
    password: 'password123'
  });
  assert.equal(respuestaSegundoInicio.status, 200);
  const cookieSegundoUsuario = respuestaSegundoInicio.headers.get('set-cookie').split(';')[0];

  respuesta = await solicitud(`/api/posts/${idPublicacion}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Cookie: cookieSegundoUsuario
    },
    body: JSON.stringify({ title: 'Solo Puede editar el creador' })
  });
  assert.equal(respuesta.status, 403);

  respuesta = await solicitud('/api/posts?game=elden%20ring');
  assert.equal(respuesta.status, 200);
  const publicacionesDelJuego = await respuesta.json();
  assert.equal(publicacionesDelJuego.total, 1);
  assert.equal(publicacionesDelJuego.data[0].game, 'Elden Ring');
  assert.equal(publicacionesDelJuego.data[0].title, '¿Qué build recomiendan? (editado)');

  respuesta = await solicitud('/api/posts?game=Juego%20sin%20publicaciones');
  assert.equal(respuesta.status, 200);
  const publicacionesVacias = await respuesta.json();
  assert.deepEqual(publicacionesVacias.data, []);
  assert.equal(publicacionesVacias.total, 0);

  respuesta = await solicitud(`/api/posts/${publicacionCreada.post.id}`);
  assert.equal(respuesta.status, 200);
  const publicacionDetalle = await respuesta.json();
  assert.equal(publicacionDetalle.id, publicacionCreada.post.id);
  assert.equal(publicacionDetalle.title, '¿Qué build recomiendan? (editado)');
  assert.equal(publicacionDetalle.content, 'Contenido actualizado');

  respuesta = await solicitud('/api/posts/publicacion-inexistente');
  assert.equal(respuesta.status, 404);
  assert.deepEqual(await respuesta.json(), { error: 'Publicación no encontrada' });

  respuesta = await solicitud('/api/posts');
  assert.equal(respuesta.status, 200);
  cargaPublicaciones = await respuesta.json();
  assert.ok(cargaPublicaciones.data.length >= 1);
  assert.equal(cargaPublicaciones.data[0].title, '¿Qué build recomiendan? (editado)');
  assert.equal(cargaPublicaciones.data[0].author.name, 'GamerUno');

  respuesta = await enviarPost(`/api/posts/${idPublicacion}/voto`, { valor: 1 });
  assert.equal(respuesta.status, 401);

  respuesta = await enviarPost(`/api/posts/${idPublicacion}/voto`, { valor: 1 }, cookieLogin);
  assert.equal(respuesta.status, 200);
  let votoResultado = await respuesta.json();
  assert.equal(votoResultado.puntajeVotos, 1);
  assert.equal(votoResultado.miVoto, 1);

  respuesta = await enviarPost(`/api/posts/${idPublicacion}/voto`, { valor: -1 }, cookieLogin);
  assert.equal(respuesta.status, 200);
  votoResultado = await respuesta.json();
  assert.equal(votoResultado.puntajeVotos, -1);
  assert.equal(votoResultado.miVoto, -1);

  respuesta = await enviarPost(`/api/posts/${idPublicacion}/voto`, { valor: -1 }, cookieLogin);
  assert.equal(respuesta.status, 200);
  votoResultado = await respuesta.json();
  assert.equal(votoResultado.puntajeVotos, 0);
  assert.equal(votoResultado.miVoto, 0);

  respuesta = await enviarPost('/api/juegos/puntuaciones', { juego: 'Elden Ring', nota: 9 });
  assert.equal(respuesta.status, 401);

  respuesta = await enviarPost('/api/juegos/puntuaciones', { juego: 'Elden Ring', nota: 11 }, cookieLogin);
  assert.equal(respuesta.status, 400);

  respuesta = await enviarPost('/api/juegos/puntuaciones', { juego: 'Elden Ring', nota: 8 }, cookieLogin);
  assert.equal(respuesta.status, 200);
  let puntuacionResultado = await respuesta.json();
  assert.equal(puntuacionResultado.datos.promedio, 8);
  assert.equal(puntuacionResultado.datos.cantidadVotos, 1);
  assert.equal(puntuacionResultado.datos.miPuntuacion, 8);

  respuesta = await enviarPost('/api/juegos/puntuaciones', { juego: 'Elden Ring', nota: 10 }, cookieLogin);
  assert.equal(respuesta.status, 200);
  puntuacionResultado = await respuesta.json();
  assert.equal(puntuacionResultado.datos.promedio, 10);
  assert.equal(puntuacionResultado.datos.cantidadVotos, 1);
  assert.equal(puntuacionResultado.datos.miPuntuacion, 10);

  respuesta = await enviarPost('/api/juegos/puntuaciones', { juego: 'Elden Ring', nota: 7 }, cookieSegundoUsuario);
  assert.equal(respuesta.status, 200);
  puntuacionResultado = await respuesta.json();
  assert.equal(puntuacionResultado.datos.promedio, 8.5);
  assert.equal(puntuacionResultado.datos.cantidadVotos, 2);
});
