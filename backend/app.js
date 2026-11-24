const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const config = require('./config');
const rotasPublicas = require('./routes/publicas');
const rotasAdmin = require('./routes/admin');
const { ErroNegocio } = require('./services/agendamentos');

const FRONTEND_DIR = path.join(__dirname, '..');

const app = express();
app.disable('x-powered-by');

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", 'https://cdn.jsdelivr.net'],
        scriptSrcAttr: ["'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        connectSrc: ["'self'", 'https://api.emailjs.com'],
        imgSrc: ["'self'", 'data:'],
        upgradeInsecureRequests: null,
      },
    },
  })
);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (config.ALLOWED_ORIGINS.length > 0) return callback(null, config.ALLOWED_ORIGINS.includes(origin));
      const dev = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin) || origin === 'null';
      return callback(null, dev);
    },
    methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json({ limit: '100kb' }));

// bloqueia a pasta backend pra ninguem baixar o banco
app.use((req, res, next) => {
  let p;
  try {
    p = decodeURIComponent(req.path).toLowerCase();
  } catch {
    return res.status(400).json({ error: 'URL inválida' });
  }
  if (p.startsWith('/backend') || /\.(db|db-wal|db-shm|md)$/.test(p) || p.includes('/.')) {
    return res.status(404).json({ error: 'Rota não encontrada' });
  }
  next();
});

app.use(
  express.static(FRONTEND_DIR, {
    extensions: ['html'],
    dotfiles: 'deny',
    setHeaders(res, filePath) {
      if (/\.(html|css|js)$/i.test(filePath)) res.setHeader('Cache-Control', 'no-store');
    },
  })
);

app.use(
  '/api/',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: config.RATE_LIMIT_MAX,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Muitas requisições. Tente novamente mais tarde.' },
  })
);

app.use('/api/', (req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');
  next();
});

app.use('/api/admin', rotasAdmin);
app.use('/api', rotasPublicas);

app.use((req, res) => res.status(404).json({ error: 'Rota não encontrada' }));

app.use((err, req, res, next) => {
  if (err instanceof ErroNegocio) {
    return res.status(err.status).json({ error: err.message, ...err.extra });
  }
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'JSON inválido no corpo da requisição' });
  }
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Corpo da requisição muito grande' });
  }
  console.error('Erro interno:', err);
  res.status(500).json({ error: 'Erro interno no servidor' });
});

module.exports = app;
