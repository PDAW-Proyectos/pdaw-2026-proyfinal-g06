const assert = require('node:assert/strict');
const test = require('node:test');
const repositorioPublicaciones = require('../src/repositories/postRepository');

test('ordena las cinco publicaciones por promedio, cantidad de votos y fecha', async () => {
  const sinPuntuacion = await repositorioPublicaciones.crearPublicacion({
    title: 'Sin puntuación',
    game: 'Juego',
    author: { id: 'autor-sin-puntuacion', name: 'Autor' }
  });
  assert.deepEqual(await repositorioPublicaciones.obtenerPublicacionesMejorPuntuadas(), []);

  const publicar = async (titulo, puntuaciones) => {
    const publicacion = await repositorioPublicaciones.crearPublicacion({
      title: titulo,
      game: 'Juego',
      author: { id: `autor-${titulo}`, name: 'Autor' }
    });

    for (let indice = 0; indice < puntuaciones.length; indice += 1) {
      await repositorioPublicaciones.registrarCalificacionPublicacion(
        publicacion.id,
        `usuario-${titulo}-${indice}`,
        puntuaciones[indice]
      );
    }

    return publicacion;
  };

  const empateAnterior = await publicar('Empate anterior', [4, 4]);
  await new Promise((resolver) => setTimeout(resolver, 10));
  const empateReciente = await publicar('Empate reciente', [4, 4]);
  const empateConMenosVotos = await publicar('Empate con menos votos', [4]);
  const mejorPromedioConUnVoto = await publicar('Mejor promedio con un voto', [5]);
  const mejorPromedioConMasVotos = await publicar('Mejor promedio con más votos', [5, 5]);
  await publicar('Puesto seis', [3]);

  const publicaciones = await repositorioPublicaciones.obtenerPublicacionesMejorPuntuadas();

  assert.equal(publicaciones.length, 5);
  assert.deepEqual(publicaciones.map((publicacion) => publicacion.id), [
    mejorPromedioConMasVotos.id,
    mejorPromedioConUnVoto.id,
    empateReciente.id,
    empateAnterior.id,
    empateConMenosVotos.id
  ]);
  const todasLasPuntuadas = await repositorioPublicaciones.obtenerPublicacionesMejorPuntuadas(10);
  assert.equal(todasLasPuntuadas.length, 6);
  assert.equal(todasLasPuntuadas.some((publicacion) => publicacion.id === sinPuntuacion.id), false);
});
