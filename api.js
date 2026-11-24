const API_BASE = /^https?:$/.test(window.location.protocol)
  ? window.location.origin
  : 'http://localhost:3000';

class ApiError extends Error {
  constructor(mensagem, status, data) {
    super(mensagem);
    this.status = status;
    this.data = data;
  }
}

async function requestJSON(url, { method = 'GET', body, headers = {} } = {}) {
  const opts = { method, headers: { ...headers } };
  if (body !== undefined) {
    opts.headers['Content-Type'] = 'application/json';
    opts.body = JSON.stringify(body);
  }

  let res;
  try {
    res = await fetch(`${API_BASE}${url}`, opts);
  } catch (e) {
    throw new ApiError('Não foi possível conectar ao servidor. Verifique se o backend está rodando.', 0);
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const detalhes = Array.isArray(data.detalhes) ? ` (${data.detalhes.join('; ')})` : '';
    throw new ApiError(`${data.error || 'Erro inesperado no servidor'}${detalhes}`, res.status, data);
  }
  return data;
}

function postJSON(url, payload) {
  return requestJSON(url, { method: 'POST', body: payload });
}

function getJSON(url) {
  return requestJSON(url);
}

function toISODate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
