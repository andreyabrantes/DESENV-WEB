const sqlite3 = require('sqlite3');
const { DB_PATH } = require('./config');
const { gerarCodigo } = require('./utils');

const conn = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Erro ao abrir o banco de dados:', err.message);
    process.exit(1);
  }
});

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    conn.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    conn.get(sql, params, (err, row) => (err ? reject(err) : resolve(row)));
  });
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    conn.all(sql, params, (err, rows) => (err ? reject(err) : resolve(rows)));
  });
}

async function init() {
  await run('PRAGMA foreign_keys = ON');

  await run(`
    CREATE TABLE IF NOT EXISTS agendamentos (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      nomeCliente TEXT    NOT NULL,
      servico     TEXT    NOT NULL,
      data        TEXT    NOT NULL,
      horario     TEXT    NOT NULL,
      email       TEXT,
      telefone    TEXT,
      observacoes TEXT,
      token       TEXT    UNIQUE,
      codigo      TEXT,
      origem      TEXT    NOT NULL DEFAULT 'site',
      status      TEXT    NOT NULL DEFAULT 'ativo',
      canceladoEm DATETIME,
      canceladoPor TEXT,
      criadoEm    DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS pre_avaliacoes (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      respostas TEXT    NOT NULL,
      criadoEm  DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS admins (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      nome      TEXT    NOT NULL,
      email     TEXT    NOT NULL UNIQUE COLLATE NOCASE,
      senhaHash TEXT    NOT NULL,
      criadoEm  DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS sessoes (
      tokenHash TEXT    PRIMARY KEY,
      adminId   INTEGER NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
      expiraEm  INTEGER NOT NULL
    )
  `);

  await migrarAgendamentos();
}

async function migrarAgendamentos() {
  const novasColunas = {
    email: 'TEXT',
    telefone: 'TEXT',
    observacoes: 'TEXT',
    token: 'TEXT',
    codigo: 'TEXT',
    origem: "TEXT NOT NULL DEFAULT 'site'",
    status: "TEXT NOT NULL DEFAULT 'ativo'",
    canceladoEm: 'DATETIME',
    canceladoPor: 'TEXT',
  };

  const colunas = await all('PRAGMA table_info(agendamentos)');
  const existentes = new Set(colunas.map((c) => c.name));

  for (const [coluna, tipo] of Object.entries(novasColunas)) {
    if (!existentes.has(coluna)) {
      await run(`ALTER TABLE agendamentos ADD COLUMN ${coluna} ${tipo}`);
      console.log(`Coluna agendamentos.${coluna} adicionada.`);
    }
  }

  const semCodigo = await all('SELECT id FROM agendamentos WHERE codigo IS NULL');
  for (const { id } of semCodigo) {
    await run('UPDATE agendamentos SET codigo = ? WHERE id = ?', [gerarCodigo(), id]);
  }

  await run('CREATE UNIQUE INDEX IF NOT EXISTS idx_agendamentos_token  ON agendamentos(token)');
  await run('CREATE UNIQUE INDEX IF NOT EXISTS idx_agendamentos_codigo ON agendamentos(codigo)');
  await run('CREATE INDEX IF NOT EXISTS idx_agendamentos_data ON agendamentos(data, horario)');

  // nao deixa 2 consultas ativas no mesmo horario
  try {
    await run(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_agendamentos_slot_ativo
      ON agendamentos(data, horario) WHERE status = 'ativo'
    `);
  } catch (e) {
    console.warn('Aviso: há horários duplicados no banco; índice de unicidade não criado.', e.message);
  }
}

const ready = init();

module.exports = { run, get, all, ready, conn };
