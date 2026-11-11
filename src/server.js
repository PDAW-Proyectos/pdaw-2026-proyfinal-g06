require('dotenv').config();

const app = require('./app');
const PUERTO = Number(process.env.PORT) || 3000;

app.listen(PUERTO, () => {
  console.log(`Servidor corriendo en el puerto ${PUERTO}`);
});