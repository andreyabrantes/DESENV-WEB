const db = require('../database');
const { HORARIOS, WHATSAPP_CONSULTORIO } = require('../config');
const { gerarToken, gerarCodigo, validarAgendamento, linkWhatsApp, horarioJaPassou } = require('../utils');

class ErroNegocio extends Error {
  constructor(status, mensagem, extra = {}) {
    super(mensagem);
    this.status = status;
    this.extra = extra;
  }
}

async function horariosOcupados(data) {
  const rows = await db.all(
    "SELECT DISTINCT horario FROM agendamentos WHERE data = ? AND status = 'ativo' ORDER BY horario ASC",
    [data]
  );
  return rows.map((r) => r.horario);
}

function linkCancelamentoWhatsApp(agendamento) {
  const texto =
    `Olá! Gostaria de cancelar minha consulta no Consultório Ramos.\n` +
    `Código: ${agendamento.codigo}\n` +
    `Data: ${agendamento.data.split('-').reverse().join('/')} às ${agendamento.horario}`;
  return linkWhatsApp(WHATSAPP_CONSULTORIO, texto);
}

async function criarAgendamento(body, origem = 'site') {
  const { dados, erros } = validarAgendamento(body, HORARIOS);
  if (erros.length > 0) {
    throw new ErroNegocio(400, 'Validação falhou', { detalhes: erros });
  }

  const ocupados = await horariosOcupados(dados.data);
  if (ocupados.includes(dados.horario)) {
    throw new ErroNegocio(409, 'Este horário acabou de ser reservado. Escolha outro horário.');
  }

  const token = gerarToken();

  for (let tentativa = 0; tentativa < 5; tentativa++) {
    const codigo = gerarCodigo();
    try {
      const { lastID } = await db.run(
        `INSERT INTO agendamentos
           (nomeCliente, servico, data, horario, email, telefone, observacoes, token, codigo, origem, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ativo')`,
        [dados.nomeCliente, dados.servico, dados.data, dados.horario, dados.email,
          dados.telefone, dados.observacoes, token, codigo, origem]
      );
      const criado = { id: lastID, ...dados, token, codigo, origem, status: 'ativo', criadoEm: new Date().toISOString() };
      criado.whatsappCancelamento = linkCancelamentoWhatsApp(criado);
      return criado;
    } catch (err) {
      if (err.code !== 'SQLITE_CONSTRAINT') throw err;
      if (/codigo/.test(err.message)) continue;
      throw new ErroNegocio(409, 'Este horário acabou de ser reservado. Escolha outro horário.');
    }
  }
  throw new Error('Não foi possível gerar um código único');
}

function resumoPublico(a) {
  return {
    id: a.id,
    nomeCliente: a.nomeCliente,
    servico: a.servico,
    data: a.data,
    horario: a.horario,
    status: a.status,
  };
}

async function cancelar(agendamento, por, { permitirPassado = false } = {}) {
  if (!agendamento) throw new ErroNegocio(404, 'Agendamento não encontrado');
  if (agendamento.status === 'cancelado') {
    throw new ErroNegocio(409, 'Este agendamento já foi cancelado', { agendamento: resumoPublico(agendamento) });
  }
  if (!permitirPassado && horarioJaPassou(agendamento.data, agendamento.horario)) {
    throw new ErroNegocio(409, 'Esta consulta já aconteceu e não pode mais ser cancelada', { agendamento: resumoPublico(agendamento) });
  }

  const { changes } = await db.run(
    "UPDATE agendamentos SET status = 'cancelado', canceladoEm = CURRENT_TIMESTAMP, canceladoPor = ? WHERE id = ? AND status = 'ativo'",
    [por, agendamento.id]
  );
  if (changes === 0) throw new ErroNegocio(409, 'Este agendamento já foi cancelado');

  return { ...agendamento, status: 'cancelado', canceladoPor: por };
}

module.exports = {
  ErroNegocio,
  horariosOcupados,
  criarAgendamento,
  cancelar,
  resumoPublico,
  linkCancelamentoWhatsApp,
};
