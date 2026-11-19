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
  assert.doesNotMatch(paginaDetalleHtml, /id="campo-juego-publicacion"/);
  assert.match(paginaDetalleHtml, /id="formulario-comentario"/);
  assert.match(paginaDetalleHtml, /id="lista-comentarios"/);

  respuesta = await solicitud('/index.html');
  assert.equal(respuesta.status, 200);
  const paginaInicioHtml = await respuesta.text();
  assert.match(paginaInicioHtml, /class="publicacion-portada post-cover/);
  assert.doesNotMatch(paginaInicioHtml, /jugadores en línea/);

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

  respuesta = await enviarPost('/api/juegos/puntuaciones', { juego: 'Elden Ring', nota: 6 }, cookieLogin);
  assert.equal(respuesta.status, 400);

  respuesta = await enviarPost('/api/juegos/puntuaciones', { juego: 'Elden Ring', nota: 4 }, cookieLogin);
  assert.equal(respuesta.status, 200);
  let puntuacionResultado = await respuesta.json();
  assert.equal(puntuacionResultado.datos.promedio, 4);
  assert.equal(puntuacionResultado.datos.cantidadVotos, 1);
  assert.equal(puntuacionResultado.datos.miPuntuacion, 4);

  respuesta = await enviarPost('/api/juegos/puntuaciones', { juego: 'Elden Ring', nota: 5 }, cookieLogin);
  assert.equal(respuesta.status, 200);
  puntuacionResultado = await respuesta.json();
  assert.equal(puntuacionResultado.datos.promedio, 5);
  assert.equal(puntuacionResultado.datos.cantidadVotos, 1);
  assert.equal(puntuacionResultado.datos.miPuntuacion, 5);

  respuesta = await enviarPost('/api/juegos/puntuaciones', { juego: 'Elden Ring', nota: 3 }, cookieSegundoUsuario);
  assert.equal(respuesta.status, 200);
  puntuacionResultado = await respuesta.json();
  assert.equal(puntuacionResultado.datos.promedio, 4);
  assert.equal(puntuacionResultado.datos.cantidadVotos, 2);

  respuesta = await solicitud('/api/juegos/mejores-puntuados');
  assert.equal(respuesta.status, 200);
  const juegosMejorValorados = await respuesta.json();
  assert.deepEqual(juegosMejorValorados.datos[0], {
    juego: 'Elden Ring',
    promedio: 4,
    cantidadVotos: 2
  });

  respuesta = await enviarPost(`/api/posts/${idPublicacion}/voto`, { valor: 1 }, cookieLogin);
  assert.equal(respuesta.status, 200);

  respuesta = await solicitud('/api/posts?orden=votados');
  assert.equal(respuesta.status, 200);
  const ordenadasPorVotos = await respuesta.json();
  assert.equal(ordenadasPorVotos.data[0].id, idPublicacion);

  respuesta = await solicitud('/api/posts/mejores-puntuadas');
  assert.equal(respuesta.status, 200);
  const destacadas = await respuesta.json();
  assert.equal(destacadas.data[0].id, idPublicacion);

  respuesta = await enviarPost('/api/posts', {
    title: 'Atajo oculto en el castillo',
    category: 'Descubrimiento o secreto',
    content: 'Saltando desde el balcón se accede al cofre oculto.',
    game: 'Elden Ring'
  }, cookieLogin);
  assert.equal(respuesta.status, 201);
  const descubrimientoCreado = await respuesta.json();
  assert.equal(descubrimientoCreado.post.category, 'Descubrimiento o secreto');
  assert.equal(descubrimientoCreado.post.author.name, 'GamerUno');

  respuesta = await solicitud('/api/posts?categoria=Descubrimiento%20o%20secreto');
  assert.equal(respuesta.status, 200);
  const descubrimientosFiltrados = await respuesta.json();
  assert.equal(descubrimientosFiltrados.total, 1);
  assert.equal(descubrimientosFiltrados.data[0].id, descubrimientoCreado.post.id);

  respuesta = await enviarPost(`/api/posts/${idPublicacion}/reportes`, { motivo: 'Spam' });
  assert.equal(respuesta.status, 401);

  respuesta = await enviarPost(`/api/posts/${idPublicacion}/reportes`, { motivo: 'Spam' }, cookieLogin);
  assert.equal(respuesta.status, 201);
  let reporteRes = await respuesta.json();
  assert.equal(reporteRes.cantidadReportes, 1);
  assert.equal(reporteRes.requiereRevision, false);
  assert.equal(reporteRes.yaReportado, true);

  respuesta = await enviarPost(`/api/posts/${idPublicacion}/reportes`, { motivo: 'Spam' }, cookieLogin);
  assert.equal(respuesta.status, 409);

  respuesta = await enviarPost(`/api/posts/${idPublicacion}/reportes`, { motivo: 'Spoilers sin aviso' }, cookieSegundoUsuario);
  assert.equal(respuesta.status, 201);
  assert.equal((await respuesta.json()).requiereRevision, false);

  await enviarPost('/api/auth/register', {
    name: 'GamerTres',
    email: 'gamer3@example.com',
    password: 'password123'
  });
  const loginTres = await enviarPost('/api/auth/login', {
    email: 'gamer3@example.com',
    password: 'password123'
  });
  const cookieTercerUsuario = loginTres.headers.get('set-cookie').split(';')[0];

  respuesta = await enviarPost(`/api/posts/${idPublicacion}/reportes`, { motivo: 'Contenido ofensivo' }, cookieTercerUsuario);
  assert.equal(respuesta.status, 201);
  reporteRes = await respuesta.json();
  assert.equal(reporteRes.cantidadReportes, 3);
  assert.equal(reporteRes.requiereRevision, true);

  respuesta = await solicitud(`/api/posts/${idPublicacion}`, {
    method: 'DELETE',
    headers: { Cookie: cookieSegundoUsuario }
  });
  assert.equal(respuesta.status, 403);

  respuesta = await solicitud(`/api/posts/${idPublicacion}`, {
    method: 'DELETE',
    headers: { Cookie: cookieLogin }
  });
  assert.equal(respuesta.status, 200);

  respuesta = await solicitud(`/api/posts/${idPublicacion}`);
  assert.equal(respuesta.status, 404);
});