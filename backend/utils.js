const crypto = require('crypto');

const RE_DATA = /^\d{4}-\d{2}-\d{2}$/;
const RE_HORARIO = /^\d{2}:\d{2}$/;
const RE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RE_TOKEN = /^[a-f0-9]{48}$/;
const ALFABETO_CODIGO = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const RE_CODIGO = /^[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{6}$/;

const LIMITS = {
  nomeCliente: 120,
  servico: 60,
  email: 254,
  telefone: 20,
  observacoes: 500,
};

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function optionalString(value, maxLength) {
  if (typeof value !== 'string') return null;
  const v = value.trim().slice(0, maxLength);
  return v.length > 0 ? v : null;
}

function parseData(data) {
  const [ano, mes, dia] = data.split('-').map(Number);
  const d = new Date(ano, mes - 1, dia);
  if (d.getFullYear() !== ano || d.getMonth() !== mes - 1 || d.getDate() !== dia) return null;
  return d;
}

function dataPassada(data) {
  const d = parseData(data);
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  return d < hoje;
}

function isFimDeSemana(data) {
  const dia = parseData(data).getDay();
  return dia === 0 || dia === 6;
}

function horarioJaPassou(data, horario) {
  if (data !== hojeISO()) return data < hojeISO();
  const [h, m] = horario.split(':').map(Number);
  const agora = new Date();
  return h * 60 + m <= agora.getHours() * 60 + agora.getMinutes();
}

function hojeISO() {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${dia}`;
}

function gerarToken() {
  return crypto.randomBytes(24).toString('hex');
}

function gerarCodigo() {
  const bytes = crypto.randomBytes(6);
  let codigo = '';
  for (const b of bytes) codigo += ALFABETO_CODIGO[b % ALFABETO_CODIGO.length];
  return codigo;
}

function normalizarCodigo(valor) {
  return typeof valor === 'string' ? valor.trim().toUpperCase().replace(/[^A-Z0-9]/g, '') : '';
}

function telefoneWhatsApp(telefone) {
  const digitos = String(telefone || '').replace(/\D/g, '');
  if (digitos.length === 10 || digitos.length === 11) return `55${digitos}`;
  if (digitos.length >= 12 && digitos.length <= 13) return digitos;
  return null;
}

function linkWhatsApp(numero, texto) {
  return `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`;
}

function validarAgendamento(body, horarios) {
  body = body || {};
  const dados = {
    nomeCliente: isNonEmptyString(body.nomeCliente) ? body.nomeCliente.trim().slice(0, LIMITS.nomeCliente) : '',
    servico: isNonEmptyString(body.servico) ? body.servico.trim().slice(0, LIMITS.servico) : '',
    data: isNonEmptyString(body.data) ? body.data.trim() : '',
    horario: isNonEmptyString(body.horario) ? body.horario.trim() : '',
    email: optionalString(body.email, LIMITS.email),
    telefone: optionalString(body.telefone, LIMITS.telefone),
    observacoes: optionalString(body.observacoes, LIMITS.observacoes),
  };

  const erros = [];
  if (!dados.nomeCliente) erros.push('nomeCliente é obrigatório');
  if (!dados.servico) erros.push('servico é obrigatório');

  if (!RE_DATA.test(dados.data) || !parseData(dados.data)) {
    erros.push('data é obrigatória (formato YYYY-MM-DD)');
  } else if (dataPassada(dados.data)) {
    erros.push('data não pode estar no passado');
  } else if (isFimDeSemana(dados.data)) {
    erros.push('o consultório não atende aos sábados e domingos');
  }

  if (!RE_HORARIO.test(dados.horario)) {
    erros.push('horario é obrigatório (formato HH:MM)');
  } else if (!horarios.includes(dados.horario)) {
    erros.push(`horario indisponível na grade do consultório (${horarios.join(', ')})`);
  } else if (RE_DATA.test(dados.data) && parseData(dados.data) && horarioJaPassou(dados.data, dados.horario)) {
    erros.push('este horário de hoje já passou');
  }

  if (dados.telefone) {
    const digitos = dados.telefone.replace(/\D/g, '').length;
    if (digitos < 10 || digitos > 13) erros.push('telefone inválido (informe DDD + número)');
  }

  if (dados.email && !RE_EMAIL.test(dados.email)) erros.push('email inválido');

  return { dados, erros };
}

function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

module.exports = {
  RE_DATA,
  RE_TOKEN,
  RE_CODIGO,
  RE_EMAIL,
  LIMITS,
  isNonEmptyString,
  optionalString,
  parseData,
  dataPassada,
  isFimDeSemana,
  hojeISO,
  horarioJaPassou,
  gerarToken,
  gerarCodigo,
  normalizarCodigo,
  telefoneWhatsApp,
  linkWhatsApp,
  validarAgendamento,
  asyncHandler,
};
