const app = require('./app');
const db = require('./database');
const { PORT, DB_PATH, WHATSAPP_CONSULTORIO } = require('./config');

db.ready
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Banco SQLite: ${DB_PATH}`);
      console.log(`Servidor rodando em http://localhost:${PORT}`);
      console.log(`Painel admin:   http://localhost:${PORT}/admin.html`);
      if (/^550+$/.test(WHATSAPP_CONSULTORIO)) {
        console.warn('Aviso: defina WHATSAPP_CONSULTORIO com o número real do consultório (ex.: 5511999998888).');
      }
    });
  })
  .catch((err) => {
    console.error('Falha ao inicializar o banco:', err);
    process.exit(1);
  });
