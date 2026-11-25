const express = require('express');
const db = require('../database');
const { HORARIOS, SERVICOS, WHATSAPP_CONSULTORIO } = require('../config');
const { RE_DATA, RE_TOKEN, asyncHandler, parseData, horarioJaPassou } = require('../utils');
const servico = require('../services/agendamentos');

const router = express.Router();

router.get('/config', (req, res) => {
  res.json({ horarios: HORARIOS, servicos: SERVICOS, whatsapp: WHATSAPP_CONSULTORIO });
});

router.post('/agendamentos', asyncHandler(async (req, res) => {
  const criado = await servico.criarAgendamento(req.body, 'site');
  res.status(201).json(criado);
}));

router.get('/horarios-ocupados', asyncHandler(async (req, res) => {
  const data = typeof req.query.data === 'string' ? req.query.data.trim() : '';
  if (!RE_DATA.test(data) || !parseData(data)) {
    return res.status(400).json({ error: 'Parâmetro data é obrigatório (formato YYYY-MM-DD)' });
  }
  res.json({ data, ocupados: await servico.horariosOcupados(data) });
}));

const carregarPorToken = asyncHandler(async (req, res, next) => {
  const token = String(req.params.token || '').trim();
  if (!RE_TOKEN.test(token)) {
    return res.status(400).json({ error: 'Token de cancelamento inválido' });
  }
  req.agendamento = await db.get('SELECT * FROM agendamentos WHERE token = ?', [token]);
  if (!req.agendamento) return res.status(404).json({ error: 'Agendamento não encontrado' });
  next();
});

// get so mostra os dados quem cancela e o post
router.get('/cancelar/:token', carregarPorToken, (req, res) => {
  const a = req.agendamento;
  res.json({
    agendamento: servico.resumoPublico(a),
    podeCancelar: a.status === 'ativo' && !horarioJaPassou(a.data, a.horario),
  });
});

router.post('/cancelar/:token', carregarPorToken, asyncHandler(async (req, res) => {
  const cancelado = await servico.cancelar(req.agendamento, 'paciente-email');
  res.json({
    mensagem: 'Agendamento cancelado com sucesso. O horário foi liberado.',
    agendamento: servico.resumoPublico(cancelado),
  });
}));

router.post('/pre-avaliacao', asyncHandler(async (req, res) => {
  const respostas = req.body;
  if (!respostas || typeof respostas !== 'object' || Array.isArray(respostas) || Object.keys(respostas).length === 0) {
    return res.status(400).json({ error: 'É necessário enviar um objeto JSON com as respostas' });
  }
  if (Object.keys(respostas).length > 200) {
    return res.status(400).json({ error: 'Payload inválido: muitos campos' });
  }

  const { lastID } = await db.run('INSERT INTO pre_avaliacoes (respostas) VALUES (?)', [JSON.stringify(respostas)]);
  res.status(201).json({ id: lastID, criadoEm: new Date().toISOString() });
}));

module.exports = router;
