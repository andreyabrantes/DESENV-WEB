process.env.DB_PATH = ':memory:';
process.env.RATE_LIMIT_MAX = '100000';
process.env.LOGIN_LIMIT_MAX = '100000';
process.env.WHATSAPP_CONSULTORIO = '5511988887777';

const { test, before, after, describe } = require('node:test');
const assert = require('node:assert/strict');
const app = require('../app');
const db = require('../database');

let server;
let BASE;

function diaUtil(diasAFrente) {
  const d = new Date();
  d.setDate(d.getDate() + diasAFrente);
  while (d.getDay() === 0 || d.getDay() === 6) d.setDate(d.getDate() + 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function proximoSabado() {
  const d = new Date();
  d.setDate(d.getDate() + ((6 - d.getDay() + 7) % 7 || 7));
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

async function req(method, path, { body, token } = {}) {
  const headers = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(BASE + path, {
    method,
    headers,
    body: body === undefined ? undefined : typeof body === 'string' ? body : JSON.stringify(body),
  });
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { json = text; }
  return { status: res.status, body: json, headers: res.headers };
}

const DATA = diaUtil(10);
const novo = (extra = {}) => ({
  nomeCliente: 'Maria Silva',
  servico: 'Retorno',
  data: DATA,
  horario: '09:00',
  email: 'maria@email.com',
  telefone: '(11) 98888-7777',
  ...extra,
});

before(async () => {
  await db.ready;
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      BASE = `http://127.0.0.1:${server.address().port}`;
      resolve();
    });
  });
});

after(() => new Promise((resolve) => server.close(resolve)));

describe('Segurança dos arquivos estáticos', () => {
  test('serve as páginas do front-end', async () => {
    const r = await req('GET', '/index.html');
    assert.equal(r.status, 200);
  });

  test('não expõe o banco de dados nem o código do backend', async () => {
    for (const p of ['/backend/database.db', '/backend/server.js', '/backend/package.json', '/BACKEND/app.js', '/%62ackend/app.js', '/.gitignore']) {
      const r = await req('GET', p);
      assert.equal(r.status, 404, `${p} deveria retornar 404`);
    }
  });

  test('envia headers de segurança do Helmet', async () => {
    const r = await req('GET', '/api/config');
    assert.equal(r.headers.get('x-powered-by'), null);
    assert.ok(r.headers.get('content-security-policy'));
    assert.equal(r.headers.get('cache-control'), 'no-store');
  });
});

describe('Agendamentos públicos', () => {
  let criado;

  test('GET /api/config devolve horários, serviços e WhatsApp', async () => {
    const r = await req('GET', '/api/config');
    assert.equal(r.status, 200);
    assert.equal(r.body.horarios.length, 10);
    assert.equal(r.body.whatsapp, '5511988887777');
  });

  test('POST /api/agendamentos cria com token, código e link de WhatsApp', async () => {
    const r = await req('POST', '/api/agendamentos', { body: novo() });
    assert.equal(r.status, 201);
    criado = r.body;
    assert.match(criado.token, /^[a-f0-9]{48}$/);
    assert.match(criado.codigo, /^[A-Z2-9]{6}$/);
    assert.equal(criado.status, 'ativo');
    assert.ok(criado.whatsappCancelamento.startsWith('https://wa.me/5511988887777?text='));
    assert.ok(decodeURIComponent(criado.whatsappCancelamento).includes(criado.codigo));
  });

  test('horário reservado aparece em /api/horarios-ocupados', async () => {
    const r = await req('GET', `/api/horarios-ocupados?data=${DATA}`);
    assert.equal(r.status, 200);
    assert.deepEqual(r.body.ocupados, ['09:00']);
  });

  test('impede reservar o mesmo horário duas vezes (409)', async () => {
    const r = await req('POST', '/api/agendamentos', { body: novo({ nomeCliente: 'João' }) });
    assert.equal(r.status, 409);
  });

  test('reservas simultâneas do mesmo horário: só uma vence', async () => {
    const corpo = novo({ horario: '11:00' });
    const respostas = await Promise.all(Array.from({ length: 5 }, () => req('POST', '/api/agendamentos', { body: corpo })));
    const status = respostas.map((r) => r.status).sort();
    assert.deepEqual(status, [201, 409, 409, 409, 409]);
  });

  test('valida campos obrigatórios, formato e regras de agenda (400)', async () => {
    const r = await req('POST', '/api/agendamentos', {
      body: { nomeCliente: '', servico: '', data: '2020-01-01', horario: '99:99', email: 'x' },
    });
    assert.equal(r.status, 400);
    const d = r.body.detalhes.join(' | ');
    assert.match(d, /nomeCliente/);
    assert.match(d, /servico/);
    assert.match(d, /passado/);
    assert.match(d, /email/);
  });

  test('rejeita sábado/domingo, data inexistente e horário fora da grade', async () => {
    let r = await req('POST', '/api/agendamentos', { body: novo({ data: proximoSabado() }) });
    assert.equal(r.status, 400);
    assert.match(r.body.detalhes.join(), /sábados e domingos/);

    r = await req('POST', '/api/agendamentos', { body: novo({ data: '2027-02-31' }) });
    assert.equal(r.status, 400);

    r = await req('POST', '/api/agendamentos', { body: novo({ horario: '12:00' }) });
    assert.equal(r.status, 400);
    assert.match(r.body.detalhes.join(), /grade/);
  });

  test('rejeita telefone sem DDD', async () => {
    const r = await req('POST', '/api/agendamentos', { body: novo({ horario: '13:00', telefone: '9888-7777' }) });
    assert.equal(r.status, 400);
    assert.match(r.body.detalhes.join(), /telefone/);
  });

  test('rejeita horário de hoje que já passou', async () => {
    const { horarioJaPassou, hojeISO } = require('../utils');
    const hoje = hojeISO();
    assert.equal(horarioJaPassou(hoje, '00:00'), true);
    assert.equal(horarioJaPassou(hoje, '23:59'), false);
    assert.equal(horarioJaPassou('2000-01-03', '10:00'), true);
    assert.equal(horarioJaPassou('2099-01-05', '10:00'), false);
    const d = new Date().getDay();
    if (d !== 0 && d !== 6 && new Date().getHours() >= 9) {
      const r = await req('POST', '/api/agendamentos', { body: novo({ data: hoje, horario: '08:00' }) });
      assert.equal(r.status, 400);
      assert.match(r.body.detalhes.join(), /já passou/);
    }
  });

  test('JSON malformado retorna 400 (não 500)', async () => {
    const r = await req('POST', '/api/agendamentos', { body: '{"nome":' });
    assert.equal(r.status, 400);
  });

  test('listagem pública de agendamentos não existe mais (dados sensíveis)', async () => {
    const r = await req('GET', '/api/agendamentos');
    assert.equal(r.status, 404);
  });

  test('GET /api/cancelar/:token só consulta (não cancela)', async () => {
    const r = await req('GET', `/api/cancelar/${criado.token}`);
    assert.equal(r.status, 200);
    assert.equal(r.body.agendamento.status, 'ativo');
    assert.equal(r.body.agendamento.email, undefined, 'não deve expor e-mail');
    const r2 = await req('GET', `/api/horarios-ocupados?data=${DATA}`);
    assert.ok(r2.body.ocupados.includes('09:00'));
  });

  test('POST /api/cancelar/:token cancela e libera o horário', async () => {
    const r = await req('POST', `/api/cancelar/${criado.token}`, { body: {} });
    assert.equal(r.status, 200);
    assert.equal(r.body.agendamento.status, 'cancelado');
    const r2 = await req('GET', `/api/horarios-ocupados?data=${DATA}`);
    assert.ok(!r2.body.ocupados.includes('09:00'));
  });

  test('GET do link informa se ainda pode cancelar', async () => {
    const r = await req('GET', `/api/cancelar/${criado.token}`);
    assert.equal(r.body.podeCancelar, false);
  });

  test('paciente não cancela consulta que já passou, mas o admin pode', async () => {
    const token = 'b'.repeat(48);
    await db.run(
      "INSERT INTO agendamentos (nomeCliente, servico, data, horario, token, codigo, status) VALUES ('Antiga', 'Retorno', '2020-03-02', '10:00', ?, 'PASS22', 'ativo')",
      [token]
    );
    const info = await req('GET', `/api/cancelar/${token}`);
    assert.equal(info.body.podeCancelar, false);
    const r = await req('POST', `/api/cancelar/${token}`, { body: {} });
    assert.equal(r.status, 409);
    assert.match(r.body.error, /já aconteceu/);
  });

  test('cancelar de novo retorna 409; token inválido 400; inexistente 404', async () => {
    assert.equal((await req('POST', `/api/cancelar/${criado.token}`, { body: {} })).status, 409);
    assert.equal((await req('POST', '/api/cancelar/abc', { body: {} })).status, 400);
    assert.equal((await req('POST', `/api/cancelar/${'a'.repeat(48)}`, { body: {} })).status, 404);
  });

  test('horário liberado pode ser reservado de novo', async () => {
    const r = await req('POST', '/api/agendamentos', { body: novo({ nomeCliente: 'Ana' }) });
    assert.equal(r.status, 201);
  });
});

describe('Pré-avaliação', () => {
  test('POST salva e não devolve os dados de saúde', async () => {
    const r = await req('POST', '/api/pre-avaliacao', { body: { nomeCompleto: 'Maria', motivo: 'Rotina' } });
    assert.equal(r.status, 201);
    assert.ok(r.body.id);
    assert.equal(r.body.respostas, undefined);
  });

  test('rejeita corpo vazio, array e excesso de campos', async () => {
    assert.equal((await req('POST', '/api/pre-avaliacao', { body: {} })).status, 400);
    assert.equal((await req('POST', '/api/pre-avaliacao', { body: [1, 2] })).status, 400);
    const grande = Object.fromEntries(Array.from({ length: 201 }, (_, i) => [`c${i}`, 'x']));
    assert.equal((await req('POST', '/api/pre-avaliacao', { body: grande })).status, 400);
  });

  test('listagem pública de pré-avaliações não existe mais', async () => {
    assert.equal((await req('GET', '/api/pre-avaliacao')).status, 404);
  });
});

describe('Painel administrativo', () => {
  let token;
  let adminId;

  test('rotas protegidas exigem login (401)', async () => {
    for (const p of ['/api/admin/agendamentos', '/api/admin/pre-avaliacoes', '/api/admin/usuarios', '/api/admin/resumo']) {
      assert.equal((await req('GET', p)).status, 401, p);
    }
    assert.equal((await req('GET', '/api/admin/agendamentos', { token: 'f'.repeat(64) })).status, 401);
  });

  test('status indica que o painel ainda não foi configurado', async () => {
    const r = await req('GET', '/api/admin/status');
    assert.deepEqual(r.body, { configurado: false });
  });

  test('setup valida senha curta e e-mail', async () => {
    const r = await req('POST', '/api/admin/setup', { body: { nome: 'A', email: 'x', senha: '123' } });
    assert.equal(r.status, 400);
  });

  test('setup cria o primeiro admin e já devolve a sessão', async () => {
    const r = await req('POST', '/api/admin/setup', {
      body: { nome: 'Dra. Fernanda', email: 'Fernanda@Consultorio.com', senha: 'senhaForte123' },
    });
    assert.equal(r.status, 201);
    assert.match(r.body.token, /^[a-f0-9]{64}$/);
    assert.equal(r.body.admin.email, 'fernanda@consultorio.com');
    token = r.body.token;
    adminId = r.body.admin.id;
  });

  test('setup não pode ser usado de novo (403)', async () => {
    const r = await req('POST', '/api/admin/setup', { body: { nome: 'Invasor', email: 'x@y.com', senha: '12345678' } });
    assert.equal(r.status, 403);
  });

  test('senha é guardada com hash (scrypt), nunca em texto puro', async () => {
    const row = await db.get('SELECT senhaHash FROM admins WHERE id = ?', [adminId]);
    assert.match(row.senhaHash, /^scrypt\$[a-f0-9]{32}\$[a-f0-9]{128}$/);
    assert.ok(!row.senhaHash.includes('senhaForte123'));
  });

  test('login com senha errada ou e-mail inexistente retorna 401 genérico', async () => {
    const a = await req('POST', '/api/admin/login', { body: { email: 'fernanda@consultorio.com', senha: 'errada123' } });
    const b = await req('POST', '/api/admin/login', { body: { email: 'ninguem@x.com', senha: 'errada123' } });
    assert.equal(a.status, 401);
    assert.equal(b.status, 401);
    assert.equal(a.body.error, b.body.error);
  });

  test('login correto (e-mail sem diferenciar maiúsculas) e /me', async () => {
    const r = await req('POST', '/api/admin/login', { body: { email: 'FERNANDA@consultorio.com', senha: 'senhaForte123' } });
    assert.equal(r.status, 200);
    const me = await req('GET', '/api/admin/me', { token: r.body.token });
    assert.equal(me.body.admin.nome, 'Dra. Fernanda');
  });

  test('lista agendamentos com filtros de status e busca', async () => {
    let r = await req('GET', '/api/admin/agendamentos', { token });
    assert.equal(r.status, 200);
    assert.ok(r.body.length >= 4);

    r = await req('GET', '/api/admin/agendamentos?status=cancelado', { token });
    assert.ok(r.body.length >= 1);
    assert.ok(r.body.every((a) => a.status === 'cancelado'));

    r = await req('GET', '/api/admin/agendamentos?busca=Ana', { token });
    assert.equal(r.body.length, 1);
    assert.equal(r.body[0].nomeCliente, 'Ana');

    r = await req('GET', `/api/admin/agendamentos?de=${DATA}&ate=${DATA}&status=ativo`, { token });
    assert.ok(r.body.every((a) => a.data === DATA && a.status === 'ativo'));
  });

  test('busca não é vulnerável a SQL injection', async () => {
    const r = await req('GET', `/api/admin/agendamentos?busca=${encodeURIComponent("' OR 1=1 --")}`, { token });
    assert.equal(r.status, 200);
    assert.equal(r.body.length, 0);
  });

  test('recepção cadastra consulta manualmente (origem admin)', async () => {
    const r = await req('POST', '/api/admin/agendamentos', {
      token,
      body: novo({ nomeCliente: 'Carlos', horario: '14:30', email: '' }),
    });
    assert.equal(r.status, 201);
    assert.equal(r.body.origem, 'admin');
    assert.equal(r.body.email, null);
  });

  test('admin cancela por id e registra quem cancelou', async () => {
    const { body: lista } = await req('GET', '/api/admin/agendamentos?busca=Carlos', { token });
    const r = await req('POST', `/api/admin/agendamentos/${lista[0].id}/cancelar`, { token, body: {} });
    assert.equal(r.status, 200);
    assert.equal(r.body.agendamento.canceladoPor, 'admin:fernanda@consultorio.com');
    assert.equal((await req('POST', `/api/admin/agendamentos/${lista[0].id}/cancelar`, { token, body: {} })).status, 409);
    assert.equal((await req('POST', '/api/admin/agendamentos/99999/cancelar', { token, body: {} })).status, 404);
  });

  test('cancelar por código bloqueia consulta passada; por id o admin consegue', async () => {
    const r = await req('POST', '/api/admin/cancelar-codigo', { token, body: { codigo: 'PASS22' } });
    assert.equal(r.status, 409);
    const { body: [antiga] } = await req('GET', '/api/admin/agendamentos?busca=PASS22', { token });
    const ok = await req('POST', `/api/admin/agendamentos/${antiga.id}/cancelar`, { token, body: {} });
    assert.equal(ok.status, 200);
  });

  test('resumo traz os contadores do painel', async () => {
    const r = await req('GET', '/api/admin/resumo', { token });
    assert.equal(r.status, 200);
    for (const k of ['hoje', 'proximos', 'cancelados', 'total', 'preAvaliacoes']) assert.equal(typeof r.body[k], 'number');
    assert.ok(r.body.cancelados >= 3);
    assert.equal(r.body.preAvaliacoes, 1);
  });

  test('lista pré-avaliações com respostas convertidas em objeto', async () => {
    const r = await req('GET', '/api/admin/pre-avaliacoes', { token });
    assert.equal(r.status, 200);
    assert.equal(r.body[0].respostas.nomeCompleto, 'Maria');
  });

  test('cadastra, lista e remove administradores', async () => {
    let r = await req('POST', '/api/admin/usuarios', { token, body: { nome: 'Recepção', email: 'recepcao@consultorio.com', senha: 'recepcao2026' } });
    assert.equal(r.status, 201);
    const novoId = r.body.id;

    r = await req('POST', '/api/admin/usuarios', { token, body: { nome: 'Dup', email: 'RECEPCAO@consultorio.com', senha: 'recepcao2026' } });
    assert.equal(r.status, 409, 'e-mail duplicado');

    r = await req('GET', '/api/admin/usuarios', { token });
    assert.equal(r.body.length, 2);
    assert.ok(r.body.every((u) => u.senhaHash === undefined), 'nunca devolve o hash');

    const login = await req('POST', '/api/admin/login', { body: { email: 'recepcao@consultorio.com', senha: 'recepcao2026' } });
    assert.equal(login.status, 200);

    assert.equal((await req('DELETE', `/api/admin/usuarios/${adminId}`, { token })).status, 400, 'não remove a si mesmo');
    assert.equal((await req('DELETE', `/api/admin/usuarios/${novoId}`, { token })).status, 200);
    assert.equal((await req('GET', '/api/admin/me', { token: login.body.token })).status, 401);
  });

  describe('Cancelamento via WhatsApp', () => {
    let ag;

    before(async () => {
      ag = (await req('POST', '/api/agendamentos', { body: novo({ nomeCliente: 'Paula', horario: '16:00' }) })).body;
    });

    test('busca por código (aceita minúsculas e espaços)', async () => {
      const r = await req('GET', `/api/admin/codigo/${encodeURIComponent(' ' + ag.codigo.toLowerCase() + ' ')}`, { token });
      assert.equal(r.status, 200);
      assert.equal(r.body.nomeCliente, 'Paula');
    });

    test('código inválido 400 e inexistente 404', async () => {
      assert.equal((await req('GET', '/api/admin/codigo/12', { token })).status, 400);
      assert.equal((await req('GET', '/api/admin/codigo/ZZZZZZ', { token })).status, 404);
    });

    test('cancelar por código libera o horário e marca origem whatsapp', async () => {
      const r = await req('POST', '/api/admin/cancelar-codigo', { token, body: { codigo: ag.codigo } });
      assert.equal(r.status, 200);
      assert.equal(r.body.agendamento.canceladoPor, 'whatsapp');
      const occ = await req('GET', `/api/horarios-ocupados?data=${DATA}`);
      assert.ok(!occ.body.ocupados.includes('16:00'));
      assert.equal((await req('POST', '/api/admin/cancelar-codigo', { token, body: { codigo: ag.codigo } })).status, 409);
    });

    test('cancelar por código exige login', async () => {
      assert.equal((await req('POST', '/api/admin/cancelar-codigo', { body: { codigo: ag.codigo } })).status, 401);
    });
  });

  test('logout invalida o token', async () => {
    assert.equal((await req('POST', '/api/admin/logout', { token, body: {} })).status, 200);
    assert.equal((await req('GET', '/api/admin/me', { token })).status, 401);
  });
});

test('rota inexistente retorna 404 em JSON', async () => {
  const r = await req('GET', '/api/rota-inexistente');
  assert.equal(r.status, 404);
  assert.equal(r.body.error, 'Rota não encontrada');
});
