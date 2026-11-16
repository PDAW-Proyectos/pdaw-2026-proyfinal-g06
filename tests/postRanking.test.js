const assert = require('node:assert/strict');
const test = require('node:test');
const repositorioPublicaciones = require('../src/repositories/postRepository');

test('ordena las publicaciones destacadas por puntaje de votos, cantidad de votos y fecha', async () => {
  const sinVotos = await repositorioPublicaciones.crearPublicacion({
    title: 'Sin votos',
    game: 'Juego',
    author: { id: 'autor-sin-votos', name: 'Autor' }
  });
  assert.deepEqual(await repositorioPublicaciones.obtenerPublicacionesMejorPuntuadas(), []);

  const publicarConVotos = async (titulo, votos) => {
    const publicacion = await repositorioPublicaciones.crearPublicacion({
      title: titulo,
      game: 'Juego',
      author: { id: `autor-${titulo}`, name: 'Autor' }
    });

    for (let indice = 0; indice < votos.length; indice += 1) {
      await repositorioPublicaciones.registrarVotoPublicacion(
        publicacion.id,
        `usuario-${titulo}-${indice}`,
        votos[indice]
      );
    }

    return publicacion;
  };

  const empateAnterior = await publicarConVotos('Empate anterior', [1, 1]);
  await new Promise((resolver) => setTimeout(resolver, 10));
  const empateReciente = await publicarConVotos('Empate reciente', [1, 1]);
  const unVotoPositivo = await publicarConVotos('Un voto positivo', [1]);
  const tresVotosPositivos = await publicarConVotos('Tres votos positivos', [1, 1, 1]);

  const destacadas = await repositorioPublicaciones.obtenerPublicacionesMejorPuntuadas(5);

  assert.equal(destacadas.length, 4);
  assert.deepEqual(destacadas.map((publicacion) => publicacion.id), [
    tresVotosPositivos.id,
    empateReciente.id,
    empateAnterior.id,
    unVotoPositivo.id
  ]);
  assert.equal(destacadas.some((publicacion) => publicacion.id === sinVotos.id), false);
});
