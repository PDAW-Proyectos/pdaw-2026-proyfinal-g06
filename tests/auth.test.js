const assert = require('node:assert/strict');
const { once } = require('node:events');
const test = require('node:test');
const app = require('../src/app');

test('registration and session-backed authentication', async (t) => {
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

  let respuesta = await solicitud('/api/auth/me');
  assert.equal(respuesta.status, 200);
  assert.equal((await respuesta.json()).user, null);

  respuesta = await enviarPost('/api/auth/register', {
    name: '   ',
    email: 'user@example.com',
    password: 'password123'
  });
  assert.equal(respuesta.status, 400);

  respuesta = await enviarPost('/api/auth/register', {
    name: 'Test User',
    email: 'not-an-email',
    password: 'password123'
  });
  assert.equal(respuesta.status, 400);

  respuesta = await enviarPost('/api/auth/register', {
    name: 'Test User',
    email: 'USER@example.com',
    password: 'short'
  });
  assert.equal(respuesta.status, 400);

  respuesta = await enviarPost('/api/auth/register', {
    name: 'Test User',
    email: 'USER@example.com',
    password: 'password123'
  });
  assert.equal(respuesta.status, 201);
  const registro = await respuesta.json();
  assert.equal(registro.user.name, 'Test User');
  assert.equal('email' in registro.user, false);
  assert.equal('passwordHash' in registro.user, false);

  respuesta = await enviarPost('/api/auth/register', {
    name: 'Another User',
    email: 'user@example.com',
    password: 'password123'
  });
  assert.equal(respuesta.status, 409);

  respuesta = await enviarPost('/api/auth/login', {
    email: 'user@example.com',
    password: 'incorrect-password'
  });
  assert.equal(respuesta.status, 401);

  respuesta = await enviarPost('/api/auth/login', {
    email: 'USER@example.com',
    password: 'password123'
  });
  assert.equal(respuesta.status, 200);
  const cookieRespuestaLogin = respuesta.headers.get('set-cookie');
  assert.match(cookieRespuestaLogin, /HttpOnly/i);
  const cookieLogin = cookieRespuestaLogin.split(';')[0];
  const datosLogin = await respuesta.json();
  assert.equal(datosLogin.user.name, 'Test User');

  respuesta = await solicitud('/api/auth/me', { headers: { Cookie: cookieLogin } });
  assert.equal((await respuesta.json()).user.name, 'Test User');

  respuesta = await enviarPost('/api/auth/login', {
    email: 'user@example.com',
    password: 'password123'
  }, cookieLogin);
  assert.equal(respuesta.status, 200);
  const cookieRegenerada = respuesta.headers.get('set-cookie').split(';')[0];
  assert.notEqual(cookieRegenerada, cookieLogin);

  respuesta = await enviarPost('/api/auth/logout', {}, cookieRegenerada);
  assert.equal(respuesta.status, 200);
  respuesta = await solicitud('/api/auth/me', { headers: { Cookie: cookieRegenerada } });
  assert.equal((await respuesta.json()).user, null);
});
