const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const sqlite3 = require('sqlite3');

test('migra banco no schema antigo sem perder dados', async () => {
  const arquivo = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'cr-')), 'antigo.db');

  await new Promise((resolve, reject) => {
    const antigo = new sqlite3.Database(arquivo);
    antigo.serialize(() => {
      antigo.run(`CREATE TABLE agendamentos (
        id INTEGER PRIMARY KEY AUTOINCREMENT, nomeCliente TEXT NOT NULL, servico TEXT NOT NULL,
        data TEXT NOT NULL, horario TEXT NOT NULL, criadoEm DATETIME DEFAULT CURRENT_TIMESTAMP)`);
      antigo.run("INSERT INTO agendamentos (nomeCliente, servico, data, horario) VALUES ('Antiga', 'Retorno', '2030-01-07', '10:00')");
      antigo.close((err) => (err ? reject(err) : resolve()));
    });
  });

  const script = `
    const db = require(${JSON.stringify(path.join(__dirname, '..', 'database.js'))});
    db.ready.then(() => db.all('SELECT * FROM agendamentos')).then((rows) => {
      process.stdout.write(JSON.stringify(rows));
      db.conn.close();
    });
  `;
  const saida = execFileSync(process.execPath, ['-e', script], {
    env: { ...process.env, DB_PATH: arquivo },
    encoding: 'utf8',
  });
  const linhas = JSON.parse(saida.slice(saida.indexOf('[')));

  assert.equal(linhas.length, 1);
  assert.equal(linhas[0].nomeCliente, 'Antiga');
  assert.equal(linhas[0].status, 'ativo');
  assert.equal(linhas[0].origem, 'site');
  assert.match(linhas[0].codigo, /^[A-Z2-9]{6}$/);
  assert.ok('canceladoEm' in linhas[0]);
});
