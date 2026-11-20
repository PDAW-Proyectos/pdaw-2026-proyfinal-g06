const assert = require('node:assert/strict');
const { once } = require('node:events');
const test = require('node:test');
const app = require('../src/app');

test('permisos y endpoints del perfil administrador', async (t) => {
  const servidor = app.listen(0);
  await once(servidor, 'listening');
  t.after(() => new Promise((resolve, reject) => {
    servidor.close((error) => (error ? reject(error) : resolve()));
  }));

  const urlBase = `http://127.0.0.1:${servidor.address().port}`;
  const solicitud = (ruta, opciones = {}) => fetch(`${urlBase}${ruta}`, opciones);
  const enviarJson = (ruta, metodo, cuerpo, cookie) => solicitud(ruta, {
    method: metodo,
    headers: {
      'Content-Type': 'application/json',
      ...(cookie ? { Cookie: cookie } : {})
    },
    body: JSON.stringify(cuerpo)
  });

  let respuesta = await solicitud('/api/admin/usuarios');
  assert.equal(respuesta.status, 401);

  const sufijo = Date.now();
  const usuariosPrueba = [1, 2, 3, 4].map((n) => ({
    name: `Jugador ${n}`,
    email: `jugador-${n}-${sufijo}@example.com`,
    password: 'Password123!'
  }));

  for (const u of usuariosPrueba) {
    const reg = await enviarJson('/api/auth/register', 'POST', u);
    assert.equal(reg.status, 201);
  }

  const cookiesUsuarios = [];
  for (const u of usuariosPrueba) {
    const log = await enviarJson('/api/auth/login', 'POST', { email: u.email, password: u.password });
    assert.equal(log.status, 200);
    cookiesUsuarios.push(log.headers.get('set-cookie').split(';')[0]);
  }

  respuesta = await solicitud('/api/admin/usuarios', { headers: { Cookie: cookiesUsuarios[0] } });
  assert.equal(respuesta.status, 403);

  const creacionPost = await enviarJson('/api/posts', 'POST', {
    title: 'Post para moderación admin',
    category: 'Crítica',
    content: 'Contenido de prueba para moderar desde el panel de administrador.',
    game: 'Elden Ring'
  }, cookiesUsuarios[0]);
  assert.equal(creacionPost.status, 201);
  const idPost = (await creacionPost.json()).post.id;

  for (let i = 1; i <= 3; i += 1) {
    const rep = await enviarJson(`/api/posts/${idPost}/reportes`, 'POST', {
      motivo: `Motivo de prueba ${i}`
    }, cookiesUsuarios[i]);
    assert.equal(rep.status, 201);
  }

  const loginAdmin = await enviarJson('/api/auth/login', 'POST', {
    email: 'admin@respawn.com',
    password: 'Admin1234!'
  });
  assert.equal(loginAdmin.status, 200);
  const datosAdmin = await loginAdmin.json();
  assert.equal(datosAdmin.user.rol, 'admin');
  const cookieAdmin = loginAdmin.headers.get('set-cookie').split(';')[0];

  const editarComoAdmin = await enviarJson(`/api/posts/${idPost}`, 'PATCH', {
    title: 'Intento de edición admin'
  }, cookieAdmin);
  assert.equal(editarComoAdmin.status, 403);

  const reportarComoAdmin = await enviarJson(`/api/posts/${idPost}/reportes`, 'POST', {
    motivo: 'Intento de reporte admin'
  }, cookieAdmin);
  assert.equal(reportarComoAdmin.status, 403);

  const listaReportadas = await solicitud('/api/admin/publicaciones-reportadas', {
    headers: { Cookie: cookieAdmin }
  });
  assert.equal(listaReportadas.status, 200);
  const reportadas = (await listaReportadas.json()).datos;
  assert.ok(reportadas.some((p) => p.id === idPost && p.requiereRevision));

  const eliminarComoAdmin = await solicitud(`/api/posts/${idPost}`, {
    method: 'DELETE',
    headers: { Cookie: cookieAdmin }
  });
  assert.equal(eliminarComoAdmin.status, 200);

  const listaUsuarios = await solicitud('/api/admin/usuarios', {
    headers: { Cookie: cookieAdmin }
  });
  assert.equal(listaUsuarios.status, 200);
  const usuarios = (await listaUsuarios.json()).datos;
  const usuarioObjetivo = usuarios.find((u) => u.email === usuariosPrueba[3].email);
  assert.ok(usuarioObjetivo);

  const eliminarAuto = await solicitud(`/api/admin/usuarios/${datosAdmin.user.id}`, {
    method: 'DELETE',
    headers: { Cookie: cookieAdmin }
  });
  assert.equal(eliminarAuto.status, 400);

  const postUsuarioObjetivo = await enviarJson('/api/posts', 'POST', {
    title: 'Post que debe borrarse con el usuario',
    category: 'Informativa',
    content: 'Este post debe desaparecer cuando el admin borra al usuario.',
    game: 'Elden Ring'
  }, cookiesUsuarios[3]);
  assert.equal(postUsuarioObjetivo.status, 201);
  const idPostUsuarioObjetivo = (await postUsuarioObjetivo.json()).post.id;

  const eliminarUsuario = await solicitud(`/api/admin/usuarios/${usuarioObjetivo.id}`, {
    method: 'DELETE',
    headers: { Cookie: cookieAdmin }
  });
  assert.equal(eliminarUsuario.status, 200);

  const postTrasBorrarUsuario = await solicitud(`/api/posts/${idPostUsuarioObjetivo}`);
  assert.equal(postTrasBorrarUsuario.status, 404);
});
