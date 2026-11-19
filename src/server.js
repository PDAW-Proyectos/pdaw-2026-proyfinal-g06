require('dotenv').config();

const app = require('./app');
const { cargarConfiguracion } = require('./config');

const config = cargarConfiguracion();

const servidor = app.listen(config.puerto, () => {
  console.log(`Servidor corriendo en el puerto ${config.puerto} (${config.entorno})`);
});

const apagarOrdenadamente = (senal) => {
  console.log(`Recibida señal ${senal}, cerrando servidor...`);
  servidor.close(() => {
    process.exit(0);
  });
};

process.on('SIGTERM', () => apagarOrdenadamente('SIGTERM'));
process.on('SIGINT', () => apagarOrdenadamente('SIGINT'));
