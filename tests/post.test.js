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

  let respuesta = await solicitud('/api/posts');
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

  respuesta = await solicitud('/api/posts');
  assert.equal(respuesta.status, 200);
  cargaPublicaciones = await respuesta.json();
  assert.ok(cargaPublicaciones.data.length >= 1);
  assert.equal(cargaPublicaciones.data[0].title, '¿Qué build recomiendan?');
  assert.equal(cargaPublicaciones.data[0].author.name, 'GamerUno');
});
