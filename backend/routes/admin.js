const express = require('express');
const rateLimit = require('express-rate-limit');
const db = require('../database');
const config = require('../config');
const auth = require('../auth');
const servico = require('../services/agendamentos');
const {
  RE_DATA, RE_EMAIL, RE_CODIGO, asyncHandler, isNonEmptyString, normalizarCodigo, hojeISO,
} = require('../utils');

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: config.LOGIN_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitas tentativas de login. Aguarde 15 minutos.' },
});

function validarAdmin(body) {
  body = body || {};
  const nome = isNonEmptyString(body.nome) ? body.nome.trim().slice(0, 120) : '';
  const email = isNonEmptyString(body.email) ? body.email.trim().toLowerCase().slice(0, 254) : '';
  const senha = typeof body.senha === 'string' ? body.senha : '';

  const erros = [];
  if (!nome) erros.push('nome é obrigatório');
  if (!RE_EMAIL.test(email)) erros.push('email inválido');
  if (senha.length < 8) erros.push('a senha deve ter pelo menos 8 caracteres');
  if (senha.length > 128) erros.push('a senha deve ter no máximo 128 caracteres');
  return { nome, email, senha, erros };
}

async function inserirAdmin({ nome, email, senha }) {
  try {
    const { lastID } = await db.run(
      'INSERT INTO admins (nome, email, senhaHash) VALUES (?, ?, ?)',
      [nome, email, auth.hashSenha(senha)]
    );
    return { id: lastID, nome, email };
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT') {
      throw new servico.ErroNegocio(409, 'Já existe um administrador com este e-mail');
    }
    throw err;
  }
}

async function totalAdmins() {
  const { total } = await db.get('SELECT COUNT(*) AS total FROM admins');
  return total;
}

router.get('/status', asyncHandler(async (req, res) => {
  res.json({ configurado: (await totalAdmins()) > 0 });
}));

router.post('/setup', loginLimiter, asyncHandler(async (req, res) => {
  if ((await totalAdmins()) > 0) {
    return res.status(403).json({ error: 'O painel já foi configurado. Faça login.' });
  }
  const { erros, ...dados } = validarAdmin(req.body);
  if (erros.length) return res.status(400).json({ error: 'Validação falhou', detalhes: erros });

  const admin = await inserirAdmin(dados);
  const sessao = await auth.criarSessao(admin.id);
  res.status(201).json({ admin, ...sessao });
}));

router.post('/login', loginLimiter, asyncHandler(async (req, res) => {
  const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const senha = typeof req.body?.senha === 'string' ? req.body.senha : '';

  const admin = email ? await db.get('SELECT * FROM admins WHERE email = ?', [email]) : null;
  const ok = auth.verificarSenha(senha, admin ? admin.senhaHash : auth.HASH_FALSO);
  if (!admin || !ok) return res.status(401).json({ error: 'E-mail ou senha incorretos' });

  const sessao = await auth.criarSessao(admin.id);
  res.json({ admin: { id: admin.id, nome: admin.nome, email: admin.email }, ...sessao });
}));

router.use(auth.exigirAdmin);

router.post('/logout', asyncHandler(async (req, res) => {
  await auth.encerrarSessao(req.sessaoToken);
  res.json({ mensagem: 'Sessão encerrada' });
}));

router.get('/me', (req, res) => res.json({ admin: req.admin }));

router.get('/usuarios', asyncHandler(async (req, res) => {
  res.json(await db.all('SELECT id, nome, email, criadoEm FROM admins ORDER BY nome'));
}));

router.post('/usuarios', asyncHandler(async (req, res) => {
  const { erros, ...dados } = validarAdmin(req.body);
  if (erros.length) return res.status(400).json({ error: 'Validação falhou', detalhes: erros });
  res.status(201).json(await inserirAdmin(dados));
}));

router.delete('/usuarios/:id', asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  if (id === req.admin.id) return res.status(400).json({ error: 'Você não pode remover a própria conta' });
  const { changes } = await db.run('DELETE FROM admins WHERE id = ?', [id]);
  if (!changes) return res.status(404).json({ error: 'Administrador não encontrado' });
  await db.run('DELETE FROM sessoes WHERE adminId = ?', [id]);
  res.json({ mensagem: 'Administrador removido' });
}));

router.get('/resumo', asyncHandler(async (req, res) => {
  const hoje = hojeISO();
  const r = await db.get(
    `SELECT
       SUM(CASE WHEN status = 'ativo' AND data = ? THEN 1 ELSE 0 END)  AS hoje,
       SUM(CASE WHEN status = 'ativo' AND data >= ? THEN 1 ELSE 0 END) AS proximos,
       SUM(CASE WHEN status = 'cancelado' THEN 1 ELSE 0 END)           AS cancelados,
       COUNT(*)                                                        AS total
     FROM agendamentos`,
    [hoje, hoje]
  );
  const { preAvaliacoes } = await db.get('SELECT COUNT(*) AS preAvaliacoes FROM pre_avaliacoes');
  res.json({
    hoje: r.hoje || 0,
    proximos: r.proximos || 0,
    cancelados: r.cancelados || 0,
    total: r.total || 0,
    preAvaliacoes,
  });
}));

router.get('/agendamentos', asyncHandler(async (req, res) => {
  const { de, ate, status, busca } = req.query;
  const where = [];
  const params = [];

  if (typeof de === 'string' && RE_DATA.test(de)) { where.push('data >= ?'); params.push(de); }
  if (typeof ate === 'string' && RE_DATA.test(ate)) { where.push('data <= ?'); params.push(ate); }
  if (status === 'ativo' || status === 'cancelado') { where.push('status = ?'); params.push(status); }
  if (typeof busca === 'string' && busca.trim()) {
    const termo = `%${busca.trim().slice(0, 60)}%`;
    where.push('(nomeCliente LIKE ? OR email LIKE ? OR telefone LIKE ? OR codigo LIKE ?)');
    params.push(termo, termo, termo, termo);
  }

  const sql = `
    SELECT id, nomeCliente, servico, data, horario, email, telefone, observacoes,
           codigo, token, origem, status, canceladoEm, canceladoPor, criadoEm
    FROM agendamentos
    ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
    ORDER BY data ASC, horario ASC
    LIMIT 500`;
  res.json(await db.all(sql, params));
}));

router.post('/agendamentos', asyncHandler(async (req, res) => {
  res.status(201).json(await servico.criarAgendamento(req.body, 'admin'));
}));

router.post('/agendamentos/:id/cancelar', asyncHandler(async (req, res) => {
  const agendamento = await db.get('SELECT * FROM agendamentos WHERE id = ?', [Number(req.params.id)]);
  const cancelado = await servico.cancelar(agendamento, `admin:${req.admin.email}`, { permitirPassado: true });
  res.json({ mensagem: 'Agendamento cancelado. O horário foi liberado.', agendamento: cancelado });
}));

async function buscarPorCodigo(req, res) {
  const codigo = normalizarCodigo(req.params.codigo || req.body?.codigo);
  if (!RE_CODIGO.test(codigo)) {
    res.status(400).json({ error: 'Código inválido (são 6 letras/números)' });
    return null;
  }
  const agendamento = await db.get('SELECT * FROM agendamentos WHERE codigo = ?', [codigo]);
  if (!agendamento) {
    res.status(404).json({ error: 'Nenhum agendamento com este código' });
    return null;
  }
  return agendamento;
}

router.get('/codigo/:codigo', asyncHandler(async (req, res) => {
  const agendamento = await buscarPorCodigo(req, res);
  if (agendamento) res.json(agendamento);
}));

router.post('/cancelar-codigo', asyncHandler(async (req, res) => {
  const agendamento = await buscarPorCodigo(req, res);
  if (!agendamento) return;
  const cancelado = await servico.cancelar(agendamento, 'whatsapp');
  res.json({ mensagem: 'Agendamento cancelado via WhatsApp. O horário foi liberado.', agendamento: cancelado });
}));

router.get('/pre-avaliacoes', asyncHandler(async (req, res) => {
  const rows = await db.all('SELECT * FROM pre_avaliacoes ORDER BY criadoEm DESC, id DESC LIMIT 500');
  res.json(rows.map((linha) => {
    let respostas;
    try { respostas = JSON.parse(linha.respostas); } catch { respostas = linha.respostas; }
    return { ...linha, respostas };
  }));
}));

module.exports = router;
