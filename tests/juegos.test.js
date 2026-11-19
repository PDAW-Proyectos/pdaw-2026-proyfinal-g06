const assert = require('node:assert/strict');
const { once } = require('node:events');
const test = require('node:test');
const app = require('../src/app');
const repositorioPuntuaciones = require('../src/repositories/repositorioPuntuaciones');

test('puntos de acceso para busqueda y puntuacion de videojuegos', async (t) => {
  repositorioPuntuaciones.limpiarPuntuaciones();
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

  let respuesta = await solicitud('/api/juegos');
  assert.equal(respuesta.status, 200);
  const listaInicial = await respuesta.json();
  assert.ok(Array.isArray(listaInicial.datos));
  assert.ok(listaInicial.datos.length >= 1);

  respuesta = await solicitud('/api/juegos?busqueda=Elden%20Ring');
  assert.equal(respuesta.status, 200);
  const busqueda = await respuesta.json();
  assert.equal(busqueda.datos[0].titulo, 'Elden Ring');

  respuesta = await solicitud('/api/juegos/119133');
  assert.equal(respuesta.status, 200);
  assert.equal((await respuesta.json()).datos.titulo, 'Elden Ring');

  respuesta = await solicitud('/api/juegos/999999999');
  assert.equal(respuesta.status, 404);

  respuesta = await enviarPost('/api/juegos/puntuaciones', { juego: 'Elden Ring', nota: 5 });
  assert.equal(respuesta.status, 401);

  await enviarPost('/api/auth/register', {
    name: 'JugadorTest',
    email: 'jugadortest@example.com',
    password: 'password123'
  });
  const login = await enviarPost('/api/auth/login', {
    email: 'jugadortest@example.com',
    password: 'password123'
  });
  const cookie = login.headers.get('set-cookie').split(';')[0];

  respuesta = await enviarPost('/api/juegos/puntuaciones', { juego: 'Elden Ring', nota: 5 }, cookie);
  assert.equal(respuesta.status, 200);
  assert.equal((await respuesta.json()).datos.promedio, 5);

  respuesta = await solicitud('/api/juegos/puntuaciones?juego=Elden%20Ring', {
    headers: { Cookie: cookie }
  });
  assert.equal(respuesta.status, 200);
  assert.equal((await respuesta.json()).datos.miPuntuacion, 5);

  respuesta = await solicitud('/api/juegos/mejores-puntuados');
  assert.equal(respuesta.status, 200);
  const mejores = await respuesta.json();
  assert.equal(mejores.datos[0].juego, 'Elden Ring');
  assert.equal(mejores.datos[0].promedio, 5);
});

