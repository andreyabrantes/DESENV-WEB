const crypto = require('crypto');
const db = require('./database');
const { SESSAO_HORAS } = require('./config');

const SCRYPT_KEYLEN = 64;

function hashSenha(senha) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(senha, salt, SCRYPT_KEYLEN).toString('hex');
  return `scrypt$${salt}$${hash}`;
}

function verificarSenha(senha, armazenado) {
  const [alg, salt, hash] = String(armazenado).split('$');
  if (alg !== 'scrypt' || !salt || !hash) return false;
  const calculado = crypto.scryptSync(senha, salt, SCRYPT_KEYLEN);
  const esperado = Buffer.from(hash, 'hex');
  return esperado.length === calculado.length && crypto.timingSafeEqual(esperado, calculado);
}

const HASH_FALSO = hashSenha(crypto.randomBytes(16).toString('hex'));

function sha256(valor) {
  return crypto.createHash('sha256').update(valor).digest('hex');
}

// no banco fica so o hash do token
async function criarSessao(adminId) {
  const token = crypto.randomBytes(32).toString('hex');
  const expiraEm = Date.now() + SESSAO_HORAS * 60 * 60 * 1000;
  await db.run('DELETE FROM sessoes WHERE expiraEm < ?', [Date.now()]);
  await db.run('INSERT INTO sessoes (tokenHash, adminId, expiraEm) VALUES (?, ?, ?)', [sha256(token), adminId, expiraEm]);
  return { token, expiraEm: new Date(expiraEm).toISOString() };
}

async function encerrarSessao(token) {
  await db.run('DELETE FROM sessoes WHERE tokenHash = ?', [sha256(token)]);
}

function extrairToken(req) {
  const header = req.get('authorization') || '';
  const [tipo, token] = header.split(' ');
  return tipo === 'Bearer' && /^[a-f0-9]{64}$/.test(token || '') ? token : null;
}

async function exigirAdmin(req, res, next) {
  try {
    const token = extrairToken(req);
    if (!token) return res.status(401).json({ error: 'Faça login para continuar' });

    const admin = await db.get(
      `SELECT a.id, a.nome, a.email FROM sessoes s
       JOIN admins a ON a.id = s.adminId
       WHERE s.tokenHash = ? AND s.expiraEm > ?`,
      [sha256(token), Date.now()]
    );
    if (!admin) return res.status(401).json({ error: 'Sessão expirada. Faça login novamente.' });

    req.admin = admin;
    req.sessaoToken = token;
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = {
  hashSenha,
  verificarSenha,
  HASH_FALSO,
  criarSessao,
  encerrarSessao,
  exigirAdmin,
};
