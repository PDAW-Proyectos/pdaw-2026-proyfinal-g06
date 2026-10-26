const assert = require('node:assert/strict');
const { once } = require('node:events');
const test = require('node:test');
const app = require('../src/app');

test('registration and session-backed authentication', async (t) => {
  const server = app.listen(0);
  await once(server, 'listening');
  t.after(() => new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  }));

  const baseUrl = `http://127.0.0.1:${server.address().port}`;
  const request = (path, options = {}) => fetch(`${baseUrl}${path}`, options);
  const post = (path, body, cookie) => request(path, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(cookie ? { Cookie: cookie } : {})
    },
    body: JSON.stringify(body)
  });

  let response = await request('/api/auth/me');
  assert.equal(response.status, 200);
  assert.equal((await response.json()).user, null);

  response = await post('/api/auth/register', {
    name: '   ',
    email: 'user@example.com',
    password: 'password123'
  });
  assert.equal(response.status, 400);

  response = await post('/api/auth/register', {
    name: 'Test User',
    email: 'not-an-email',
    password: 'password123'
  });
  assert.equal(response.status, 400);

  response = await post('/api/auth/register', {
    name: 'Test User',
    email: 'USER@example.com',
    password: 'short'
  });
  assert.equal(response.status, 400);

  response = await post('/api/auth/register', {
    name: 'Test User',
    email: 'USER@example.com',
    password: 'password123'
  });
  assert.equal(response.status, 201);
  const registration = await response.json();
  assert.equal(registration.user.name, 'Test User');
  assert.equal('email' in registration.user, false);
  assert.equal('passwordHash' in registration.user, false);

  response = await post('/api/auth/register', {
    name: 'Another User',
    email: 'user@example.com',
    password: 'password123'
  });
  assert.equal(response.status, 409);

  response = await post('/api/auth/login', {
    email: 'user@example.com',
    password: 'incorrect-password'
  });
  assert.equal(response.status, 401);

  response = await post('/api/auth/login', {
    email: 'USER@example.com',
    password: 'password123'
  });
  assert.equal(response.status, 200);
  const loginSetCookie = response.headers.get('set-cookie');
  assert.match(loginSetCookie, /HttpOnly/i);
  const loginCookie = loginSetCookie.split(';')[0];
  const login = await response.json();
  assert.equal(login.user.name, 'Test User');

  response = await request('/api/auth/me', { headers: { Cookie: loginCookie } });
  assert.equal((await response.json()).user.name, 'Test User');

  response = await post('/api/auth/login', {
    email: 'user@example.com',
    password: 'password123'
  }, loginCookie);
  assert.equal(response.status, 200);
  const regeneratedCookie = response.headers.get('set-cookie').split(';')[0];
  assert.notEqual(regeneratedCookie, loginCookie);

  response = await post('/api/auth/logout', {}, regeneratedCookie);
  assert.equal(response.status, 200);
  response = await request('/api/auth/me', { headers: { Cookie: regeneratedCookie } });
  assert.equal((await response.json()).user, null);
});
