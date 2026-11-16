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
  assert.match(paginaDetalleHtml, /data-calificacion-publicacion="5"/);
  assert.match(paginaDetalleHtml, /id="promedio-calificacion-publicacion"/);
  assert.doesNotMatch(paginaDetalleHtml, /id="campo-juego-publicacion"/);
  assert.match(paginaDetalleHtml, /id="formulario-comentario"/);
  assert.match(paginaDetalleHtml, /id="lista-comentarios"/);

  respuesta = await solicitud('/index.html');
  assert.equal(respuesta.status, 200);
  const paginaInicioHtml = await respuesta.text();
  assert.match(paginaInicioHtml, /class="publicacion-portada post-cover/);
  assert.match(paginaInicioHtml, /id="contenedor-publicaciones-destacadas"/);
  assert.match(paginaInicioHtml, /Publicaciones mejor puntuadas/);
  assert.doesNotMatch(paginaInicioHtml, /En tu radar/);
  assert.doesNotMatch(paginaInicioHtml, /jugadores en línea/);

  respuesta = await solicitud('/api/posts/mejores-puntuadas');
  assert.equal(respuesta.status, 200);
  assert.deepEqual((await respuesta.json()).data, []);

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
  assert.equal(publicacionCreada.post.promedioPuntuacion, 0);
  assert.equal(publicacionCreada.post.cantidadPuntuaciones, 0);
  assert.equal(publicacionCreada.post.miCalificacionPublicacion, null);
  const idPublicacion = publicacionCreada.post.id;

  respuesta = await solicitud('/api/posts/mejores-puntuadas');
  assert.equal(respuesta.status, 200);
  assert.deepEqual((await respuesta.json()).data, []);

  respuesta = await enviarPost(`/api/posts/${idPublicacion}/calificacion`, { valor: 5 });
  assert.equal(respuesta.status, 401);

  respuesta = await enviarPost(`/api/posts/${idPublicacion}/calificacion`, { valor: 5 }, cookieLogin);
  assert.equal(respuesta.status, 403);

  respuesta = await solicitud(`/api/posts/${idPublicacion}/comments`);
  assert.equal(respuesta.status, 200);
  assert.deepEqual((await respuesta.json()).comments, []);

  respuesta = await enviarPost(`/api/posts/${idPublicacion}/comments`, { content: 'Sin iniciar sesión' });
  assert.equal(respuesta.status, 401);

  respuesta = await enviarPost(`/api/posts/${idPublicacion}/comments`, { content: '   ' }, cookieLogin);
  assert.equal(respuesta.status, 400);

  respuesta = await enviarPost(`/api/posts/${idPublicacion}/comments`, {
    content: '¿Qué tal está este juego?'
  }, cookieLogin);
  assert.equal(respuesta.status, 201);
  const comentarioPrincipal = (await respuesta.json()).comment;
  assert.equal(comentarioPrincipal.author.name, 'GamerUno');
  assert.equal(comentarioPrincipal.parentId, null);
  assert.equal('email' in comentarioPrincipal.author, false);

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
  assert.equal(publicacionActualizada.post.game, 'Elden Ring');
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

  respuesta = await enviarPost(`/api/posts/${idPublicacion}/calificacion`, { valor: 0 }, cookieSegundoUsuario);
  assert.equal(respuesta.status, 400);

  respuesta = await enviarPost(`/api/posts/${idPublicacion}/calificacion`, { valor: 6 }, cookieSegundoUsuario);
  assert.equal(respuesta.status, 400);

  respuesta = await enviarPost(`/api/posts/${idPublicacion}/calificacion`, { valor: 3.5 }, cookieSegundoUsuario);
  assert.equal(respuesta.status, 400);

  respuesta = await enviarPost(`/api/posts/${idPublicacion}/calificacion`, { valor: 4 }, cookieSegundoUsuario);
  assert.equal(respuesta.status, 201);
  let calificacionResultado = await respuesta.json();
  assert.equal(calificacionResultado.promedioPuntuacion, 4);
  assert.equal(calificacionResultado.cantidadPuntuaciones, 1);
  assert.equal(calificacionResultado.miCalificacionPublicacion, 4);

  respuesta = await enviarPost(`/api/posts/${idPublicacion}/calificacion`, { valor: 5 }, cookieSegundoUsuario);
  assert.equal(respuesta.status, 409);

  await enviarPost('/api/auth/register', {
    name: 'GamerTres',
    email: 'gamer3@example.com',
    password: 'password123'
  });
  const respuestaTercerInicio = await enviarPost('/api/auth/login', {
    email: 'gamer3@example.com',
    password: 'password123'
  });
  assert.equal(respuestaTercerInicio.status, 200);
  const cookieTercerUsuario = respuestaTercerInicio.headers.get('set-cookie').split(';')[0];

  respuesta = await enviarPost(`/api/posts/${idPublicacion}/calificacion`, { valor: 5 }, cookieTercerUsuario);
  assert.equal(respuesta.status, 201);
  calificacionResultado = await respuesta.json();
  assert.equal(calificacionResultado.promedioPuntuacion, 4.5);
  assert.equal(calificacionResultado.cantidadPuntuaciones, 2);
  assert.equal(calificacionResultado.miCalificacionPublicacion, 5);

  respuesta = await solicitud(`/api/posts/${idPublicacion}`, {
    headers: { Cookie: cookieSegundoUsuario }
  });
  assert.equal(respuesta.status, 200);
  const detallePuntuado = await respuesta.json();
  assert.equal(detallePuntuado.promedioPuntuacion, 4.5);
  assert.equal(detallePuntuado.cantidadPuntuaciones, 2);
  assert.equal(detallePuntuado.miCalificacionPublicacion, 4);

  respuesta = await solicitud(`/api/posts/${idPublicacion}`);
  assert.equal(respuesta.status, 200);
  const detallePublicoPuntuado = await respuesta.json();
  assert.equal(detallePublicoPuntuado.promedioPuntuacion, 4.5);
  assert.equal(detallePublicoPuntuado.cantidadPuntuaciones, 2);
  assert.equal(detallePublicoPuntuado.miCalificacionPublicacion, null);

  respuesta = await enviarPost(`/api/posts/${idPublicacion}/comments`, {
    content: 'Está muy bueno.',
    parentId: comentarioPrincipal.id
  }, cookieSegundoUsuario);
  assert.equal(respuesta.status, 201);
  const respuestaComentario = (await respuesta.json()).comment;
  assert.equal(respuestaComentario.author.name, 'GamerDos');
  assert.equal(respuestaComentario.parentId, comentarioPrincipal.id);

  respuesta = await enviarPost(`/api/posts/${idPublicacion}/comments`, {
    content: 'Agrego otra idea a mi comentario.',
    parentId: comentarioPrincipal.id
  }, cookieLogin);
  assert.equal(respuesta.status, 201);
  const respuestaDelAutor = (await respuesta.json()).comment;
  assert.equal(respuestaDelAutor.author.name, 'GamerUno');
  assert.equal(respuestaDelAutor.parentId, comentarioPrincipal.id);

  respuesta = await enviarPost(`/api/posts/${idPublicacion}/comments`, {
    content: '¡Coincido!',
    parentId: respuestaComentario.id
  }, cookieLogin);
  assert.equal(respuesta.status, 201);
  const respuestaAnidada = (await respuesta.json()).comment;
  assert.equal(respuestaAnidada.parentId, respuestaComentario.id);

  respuesta = await solicitud(`/api/posts/${idPublicacion}/comments`);
  assert.equal(respuesta.status, 200);
  const comentariosCargados = (await respuesta.json()).comments;
  assert.equal(comentariosCargados.length, 4);
  assert.equal(comentariosCargados[1].parentId, comentarioPrincipal.id);
  assert.equal(comentariosCargados[2].parentId, comentarioPrincipal.id);
  assert.equal(comentariosCargados[3].parentId, respuestaComentario.id);

  respuesta = await enviarPost(`/api/posts/${idPublicacion}/comments`, {
    content: 'Respuesta inválida',
    parentId: 'comentario-inexistente'
  }, cookieLogin);
  assert.equal(respuesta.status, 404);

  respuesta = await solicitud(`/api/posts/${idPublicacion}/comments/${comentarioPrincipal.id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Cookie: cookieSegundoUsuario
    },
    body: JSON.stringify({ content: 'Edición de otra persona' })
  });
  assert.equal(respuesta.status, 403);

  respuesta = await solicitud(`/api/posts/${idPublicacion}/comments/${comentarioPrincipal.id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Cookie: cookieLogin
    },
    body: JSON.stringify({ content: 'Comentario editado por su autor' })
  });
  assert.equal(respuesta.status, 200);
  assert.equal((await respuesta.json()).comment.content, 'Comentario editado por su autor');

  respuesta = await solicitud(`/api/posts/${idPublicacion}/comments/${comentarioPrincipal.id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Cookie: cookieLogin
    },
    body: JSON.stringify({ content: '  ' })
  });
  assert.equal(respuesta.status, 400);

  respuesta = await solicitud(`/api/posts/${idPublicacion}/comments/${comentarioPrincipal.id}`, {
    method: 'DELETE',
    headers: { Cookie: cookieSegundoUsuario }
  });
  assert.equal(respuesta.status, 403);

  respuesta = await solicitud(`/api/posts/${idPublicacion}/comments/${comentarioPrincipal.id}`, {
    method: 'DELETE'
  });
  assert.equal(respuesta.status, 401);

  respuesta = await solicitud(`/api/posts/${idPublicacion}/comments/${comentarioPrincipal.id}`, {
    method: 'DELETE',
    headers: { Cookie: cookieLogin }
  });
  assert.equal(respuesta.status, 200);
  assert.equal((await respuesta.json()).comment.deleted, true);

  respuesta = await solicitud(`/api/posts/${idPublicacion}/comments`);
  assert.equal(respuesta.status, 200);
  const comentariosRestantes = (await respuesta.json()).comments;
  assert.deepEqual(comentariosRestantes, []);

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
  assert.equal(publicacionesDelJuego.data[0].promedioPuntuacion, 4.5);
  assert.equal(publicacionesDelJuego.data[0].cantidadPuntuaciones, 2);

  respuesta = await solicitud('/api/posts/mejores-puntuadas');
  assert.equal(respuesta.status, 200);
  const publicacionesMejorPuntuadas = await respuesta.json();
  assert.equal(publicacionesMejorPuntuadas.data.length, 1);
  assert.equal(publicacionesMejorPuntuadas.data[0].id, idPublicacion);
  assert.equal(publicacionesMejorPuntuadas.data[0].promedioPuntuacion, 4.5);
  assert.equal(publicacionesMejorPuntuadas.data[0].cantidadPuntuaciones, 2);

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
