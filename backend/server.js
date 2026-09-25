// server.js
// Servidor Express com CORS configurável, segurança (Helmet + rate limit) e rotas REST.

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const crypto = require('crypto');
const path = require('path');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Diretório do front-end (um nível acima de /backend).
const FRONTEND_DIR = path.join(__dirname, '..');

// ── Middlewares ────────────────────────────────────────────────────────────
// CSP ajustada para permitir o EmailJS (CDN + conexões) e o Google Fonts,
// usados pelas páginas do front-end servidas por este mesmo servidor.
// `scriptSrcAttr: 'unsafe-inline'` é necessário porque as páginas usam
// handlers inline (ex.: onclick="closeModal()"); sem isso o Helmet aplica
// `script-src-attr 'none'` e os botões inline param de funcionar.
// `upgradeInsecureRequests: null` evita forçar HTTPS em http://localhost.
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
app.disable('x-powered-by'); // remove o header que expõe o Express

// CORS com allowlist configurável via variável de ambiente ALLOWED_ORIGINS
// (ex.: ALLOWED_ORIGINS="https://meudominio.com,https://www.meudominio.com").
// Sem a variável, usa um fallback seguro para desenvolvimento local
// (localhost/127.0.0.1 e file://, cujo Origin é "null").
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true); // curl/Postman/same-origin
      if (allowedOrigins.length > 0) {
        return callback(null, allowedOrigins.includes(origin));
      }
      const isDevOrigin =
        /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin) || origin === 'null';
      return callback(null, isDevOrigin);
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
  })
);

app.use(express.json({ limit: '100kb' })); // limita o tamanho do corpo JSON

// Serve o front-end (HTML/CSS/JS) pelo mesmo servidor, para que os links
// enviados por e-mail usem URLs http:// clicáveis (links file:// são
// bloqueados pela maioria dos clientes de e-mail).
// `setHeaders` desativa o cache do navegador para HTML/CSS/JS em
// desenvolvimento, evitando que versões antigas das páginas (ex.: o
// cancelar.html sem o botão) continuem sendo exibidas após uma alteração.
app.use(
  express.static(FRONTEND_DIR, {
    extensions: ['html'],
    setHeaders(res, filePath) {
      if (/\.(html|css|js)$/i.test(filePath)) {
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
      }
    },
  })
);

// Rate limiting por IP para mitigar abuso/brute force nas rotas da API.
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100,                 // máximo de 100 requisições por IP na janela
  standardHeaders: true,    // envia headers RateLimit-*
  legacyHeaders: false,     // desativa X-RateLimit-* (deprecated)
  message: { error: 'Muitas requisições. Tente novamente mais tarde.' },
});
app.use('/api/', apiLimiter);

// ── Helpers ────────────────────────────────────────────────────────────────
function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

// Normaliza strings opcionais: limita o tamanho e converte vazias em null.
function optionalString(value, maxLength) {
  if (typeof value !== 'string') return null;
  const v = value.trim().slice(0, maxLength);
  return v.length > 0 ? v : null;
}

const LIMITS = {
  nomeCliente: 120,
  servico: 60,
  email: 254,
  telefone: 20,
  observacoes: 500,
};

const RE_DATA = /^\d{4}-\d{2}-\d{2}$/;
const RE_HORARIO = /^\d{2}:\d{2}$/;
const RE_EMAIL = /^[^\s@]+@[^\s@]+$/;

function dataPassada(data) {
  const [ano, mes, dia] = data.split('-').map(Number);
  const d = new Date(ano, mes - 1, dia);
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  return d < hoje;
}

// Gera um token único e imprevisível usado no link de cancelamento enviado por e-mail.
function gerarToken() {
  return crypto.randomBytes(24).toString('hex'); // 48 caracteres hexadecimais
}

// ── Agendamentos ───────────────────────────────────────────────────────────

// POST /api/agendamentos — valida e insere um agendamento.
app.post('/api/agendamentos', (req, res) => {
  const body = req.body || {};

  const nomeCliente = isNonEmptyString(body.nomeCliente)
    ? body.nomeCliente.trim().slice(0, LIMITS.nomeCliente)
    : '';
  const servico = isNonEmptyString(body.servico) ? body.servico.trim().slice(0, LIMITS.servico) : '';
  const data = isNonEmptyString(body.data) ? body.data.trim() : '';
  const horario = isNonEmptyString(body.horario) ? body.horario.trim() : '';

  const email = optionalString(body.email, LIMITS.email);
  const telefone = optionalString(body.telefone, LIMITS.telefone);
  const observacoes = optionalString(body.observacoes, LIMITS.observacoes);

  const erros = [];
  if (!nomeCliente) erros.push('nomeCliente é obrigatório');
  if (!servico) erros.push('servico é obrigatório');
  if (!RE_DATA.test(data)) {
    erros.push('data é obrigatória (formato YYYY-MM-DD)');
  } else if (dataPassada(data)) {
    erros.push('data não pode estar no passado');
  }
  if (!RE_HORARIO.test(horario)) erros.push('horario é obrigatório (formato HH:MM)');
  if (email && !RE_EMAIL.test(email)) erros.push('email inválido');

  if (erros.length > 0) {
    return res.status(400).json({ error: 'Validação falhou', detalhes: erros });
  }

  const token = gerarToken();

  const sql = `
    INSERT INTO agendamentos (nomeCliente, servico, data, horario, email, telefone, observacoes, token, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'ativo')
  `;

  db.run(
    sql,
    [nomeCliente, servico, data, horario, email, telefone, observacoes, token],
    function (err) {
      if (err) {
        console.error('Erro ao inserir agendamento:', err.message);
        return res.status(500).json({ error: 'Erro ao salvar agendamento' });
      }

      res.status(201).json({
        id: this.lastID,
        nomeCliente,
        servico,
        data,
        horario,
        email,
        telefone,
        observacoes,
        token,
        status: 'ativo',
        criadoEm: new Date().toISOString(),
      });
    }
  );
});

// GET /api/agendamentos — lista agendamentos ordenados por data e horário.
app.get('/api/agendamentos', (req, res) => {
  const sql = 'SELECT * FROM agendamentos ORDER BY data ASC, horario ASC';

  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error('Erro ao listar agendamentos:', err.message);
      return res.status(500).json({ error: 'Erro ao listar agendamentos' });
    }
    res.json(rows);
  });
});

// ── Pré-Avaliação ──────────────────────────────────────────────────────────

// POST /api/pre-avaliacao — recebe o formulário completo e grava como JSON.
app.post('/api/pre-avaliacao', (req, res) => {
  const respostas = req.body;

  if (!respostas || typeof respostas !== 'object' || Array.isArray(respostas) || Object.keys(respostas).length === 0) {
    return res.status(400).json({ error: 'É necessário enviar um objeto JSON com as respostas' });
  }

  // Guarda contra payloads excessivamente largos.
  if (Object.keys(respostas).length > 200) {
    return res.status(400).json({ error: 'Payload inválido: muitos campos' });
  }

  const json = JSON.stringify(respostas);
  const sql = 'INSERT INTO pre_avaliacoes (respostas) VALUES (?)';

  db.run(sql, [json], function (err) {
    if (err) {
      console.error('Erro ao salvar pré-avaliação:', err.message);
      return res.status(500).json({ error: 'Erro ao salvar pré-avaliação' });
    }

    res.status(201).json({
      id: this.lastID,
      respostas,
      criadoEm: new Date().toISOString(),
    });
  });
});

// GET /api/pre-avaliacao — consulta os registros salvos (respostas já convertidas para objeto).
app.get('/api/pre-avaliacao', (req, res) => {
  const sql = 'SELECT * FROM pre_avaliacoes ORDER BY criadoEm DESC, id DESC';

  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error('Erro ao listar pré-avaliações:', err.message);
      return res.status(500).json({ error: 'Erro ao listar pré-avaliações' });
    }

    const resultado = rows.map((linha) => {
      let respostas;
      try {
        respostas = JSON.parse(linha.respostas);
      } catch (e) {
        respostas = linha.respostas; // fallback: retorna a string crua se o JSON estiver corrompido
      }
      return { ...linha, respostas };
    });

    res.json(resultado);
  });
});

// ── Disponibilidade ────────────────────────────────────────────────────────

// GET /api/horarios-ocupados — lista os horários já ocupados na data informada.
app.get('/api/horarios-ocupados', (req, res) => {
  const data = typeof req.query.data === 'string' ? req.query.data.trim() : '';

  if (!RE_DATA.test(data)) {
    return res.status(400).json({ error: 'Parâmetro data é obrigatório (formato YYYY-MM-DD)' });
  }

  // Apenas agendamentos ativos ocupam o horário; cancelados voltam a ficar livres.
  const sql = `
    SELECT DISTINCT horario FROM agendamentos
    WHERE data = ? AND status = 'ativo'
    ORDER BY horario ASC
  `;

  db.all(sql, [data], (err, rows) => {
    if (err) {
      console.error('Erro ao consultar horários ocupados:', err.message);
      return res.status(500).json({ error: 'Erro ao consultar horários ocupados' });
    }
    res.json({ data, ocupados: rows.map((r) => r.horario) });
  });
});

// ── Cancelamento ───────────────────────────────────────────────────────────

// GET /api/cancelar/:token — cancela o agendamento e libera o horário.
// O token é enviado no link do e-mail de confirmação; é único e imprevisível.
app.get('/api/cancelar/:token', (req, res) => {
  const token = typeof req.params.token === 'string' ? req.params.token.trim() : '';

  if (!/^[a-f0-9]{48}$/.test(token)) {
    return res.status(400).json({ error: 'Token de cancelamento inválido' });
  }

  const sqlBusca = 'SELECT * FROM agendamentos WHERE token = ?';

  db.get(sqlBusca, [token], (err, agendamento) => {
    if (err) {
      console.error('Erro ao buscar agendamento para cancelamento:', err.message);
      return res.status(500).json({ error: 'Erro ao processar cancelamento' });
    }

    if (!agendamento) {
      return res.status(404).json({ error: 'Agendamento não encontrado' });
    }

    if (agendamento.status === 'cancelado') {
      return res.status(409).json({
        error: 'Este agendamento já foi cancelado',
        agendamento: {
          id: agendamento.id,
          data: agendamento.data,
          horario: agendamento.horario,
          status: agendamento.status,
        },
      });
    }

    const sqlUpdate = "UPDATE agendamentos SET status = 'cancelado' WHERE id = ?";

    db.run(sqlUpdate, [agendamento.id], function (updateErr) {
      if (updateErr) {
        console.error('Erro ao cancelar agendamento:', updateErr.message);
        return res.status(500).json({ error: 'Erro ao cancelar agendamento' });
      }

      res.json({
        mensagem: 'Agendamento cancelado com sucesso. O horário foi liberado.',
        agendamento: {
          id: agendamento.id,
          nomeCliente: agendamento.nomeCliente,
          servico: agendamento.servico,
          data: agendamento.data,
          horario: agendamento.horario,
          status: 'cancelado',
        },
      });
    });
  });
});

// ── 404 ────────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

// ── Inicialização ──────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
