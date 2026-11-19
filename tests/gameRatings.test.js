const assert = require('node:assert/strict');
const test = require('node:test');
const repositorioPuntuaciones = require('../src/repositories/repositorioPuntuaciones');

test('ordena juegos por promedio y desempata por cantidad de votos', async (t) => {
  repositorioPuntuaciones.limpiarPuntuaciones();
  t.after(() => repositorioPuntuaciones.limpiarPuntuaciones());

  await repositorioPuntuaciones.guardarPuntuacion({
    idUsuario: 'empate-usuario-1',
    juego: 'Juego empate',
    nota: 3
  });
  await repositorioPuntuaciones.guardarPuntuacion({
    idUsuario: 'empate-usuario-2',
    juego: ' juego EMPATE ',
    nota: 5
  });
  await repositorioPuntuaciones.guardarPuntuacion({
    idUsuario: 'otro-empate-usuario',
    juego: 'Otro empate',
    nota: 4
  });
  await repositorioPuntuaciones.guardarPuntuacion({
    idUsuario: 'mejor-usuario',
    juego: 'Mejor promedio',
    nota: 5
  });
  for (const [juego, nota] of [
    ['Tercer puesto', 3],
    ['Cuarto puesto', 2],
    ['Quinto puesto', 1]
  ]) {
    await repositorioPuntuaciones.guardarPuntuacion({
      idUsuario: `usuario-${juego}`,
      juego,
      nota
    });
  }

  const destacados = await repositorioPuntuaciones.obtenerJuegosMejorPuntuados(5);

  assert.equal(destacados.length, 5);
  assert.deepEqual(
    destacados.map(({ juego, promedio, cantidadVotos }) => [juego, promedio, cantidadVotos]),
    [
      ['Mejor promedio', 5, 1],
      ['Juego empate', 4, 2],
      ['Otro empate', 4, 1],
      ['Tercer puesto', 3, 1],
      ['Cuarto puesto', 2, 1]
    ]
  );
});
