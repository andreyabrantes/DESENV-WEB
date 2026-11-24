const path = require('path');

const config = {
  PORT: Number(process.env.PORT) || 3000,

  DB_PATH: process.env.DB_PATH || path.join(__dirname, 'database.db'),

  ALLOWED_ORIGINS: (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean),

  WHATSAPP_CONSULTORIO: (process.env.WHATSAPP_CONSULTORIO || '5500000000000').replace(/\D/g, ''),

  RATE_LIMIT_MAX: Number(process.env.RATE_LIMIT_MAX) || 100,
  LOGIN_LIMIT_MAX: Number(process.env.LOGIN_LIMIT_MAX) || 10,

  SESSAO_HORAS: Number(process.env.SESSAO_HORAS) || 8,
};

config.HORARIOS = ['08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '14:30', '15:30', '16:00', '17:00'];

config.SERVICOS = ['Primeira consulta', 'Retorno', 'Telemedicina', 'Exame de resultado'];

module.exports = config;
