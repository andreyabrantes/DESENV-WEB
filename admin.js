(() => {
  'use strict';

  const CHAVE_TOKEN = 'cr_admin_token';
  let tokenMemoria = null;

  const sessao = {
    get() {
      try { return sessionStorage.getItem(CHAVE_TOKEN) || tokenMemoria; } catch { return tokenMemoria; }
    },
    set(t) {
      tokenMemoria = t;
      try { sessionStorage.setItem(CHAVE_TOKEN, t); } catch {}
    },
    limpar() {
      tokenMemoria = null;
      try { sessionStorage.removeItem(CHAVE_TOKEN); } catch {}
    },
  };

  async function api(url, opts = {}) {
    const token = sessao.get();
    try {
      return await requestJSON(`/api/admin${url}`, {
        ...opts,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
    } catch (err) {
      if (err.status === 401 && !url.startsWith('/login') && !url.startsWith('/setup')) {
        sessao.limpar();
        mostrarAcesso(false, 'Sua sessão expirou. Entre novamente.');
      }
      throw err;
    }
  }

  const $ = (sel) => document.querySelector(sel);

  function el(tag, props = {}, ...filhos) {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(props)) {
      if (v === undefined || v === null || v === false) continue;
      if (k === 'class') n.className = v;
      else if (k === 'dataset') Object.assign(n.dataset, v);
      else if (k in n && typeof v !== 'string') n[k] = v;
      else n.setAttribute(k, v);
    }
    for (const f of filhos.flat()) {
      if (f === null || f === undefined || f === false) continue;
      n.append(f instanceof Node ? f : document.createTextNode(String(f)));
    }
    return n;
  }

  function mostrarErro(elemento, mensagem) {
    elemento.textContent = mensagem;
    elemento.hidden = !mensagem;
  }

  let toastTimer;
  function toast(msg, erro = false) {
    const t = $('#toast');
    t.textContent = msg;
    t.classList.toggle('erro', erro);
    t.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { t.hidden = true; }, 3500);
  }

  const DIAS = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
  function dataCurta(iso) {
    const [a, m, d] = iso.split('-').map(Number);
    const dt = new Date(a, m - 1, d);
    return `${DIAS[dt.getDay()]}, ${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${a}`;
  }
  function dataLonga(iso) {
    const [a, m, d] = iso.split('-').map(Number);
    return new Date(a, m - 1, d).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
  }
  function dataHoraBanco(valor) {
    const d = new Date(String(valor).replace(' ', 'T') + (String(valor).endsWith('Z') ? '' : 'Z'));
    return isNaN(d) ? valor : d.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
  }
  function somarDias(base, n) {
    const d = new Date(base);
    d.setDate(d.getDate() + n);
    return d;
  }

  function telefoneWhats(tel) {
    const dig = String(tel || '').replace(/\D/g, '');
    if (dig.length === 10 || dig.length === 11) return `55${dig}`;
    if (dig.length === 12 || dig.length === 13) return dig;
    return null;
  }

  function linkAvisoPaciente(a) {
    const numero = telefoneWhats(a.telefone);
    if (!numero) return null;
    const primeiroNome = a.nomeCliente.split(' ')[0];
    let texto;
    if (a.status === 'cancelado') {
      texto =
        `Olá, ${primeiroNome}! Sua consulta de ${dataLonga(a.data)} às ${a.horario} no Consultório Ramos foi cancelada. ` +
        `Quando quiser remarcar, é só acessar ${API_BASE}/agendar.html 🌿`;
    } else {
      const linkCancelar = `${API_BASE}/cancelar.html?token=${a.token}`;
      texto =
        `Olá, ${primeiroNome}! Sua consulta (${a.servico}) está confirmada para ${dataLonga(a.data)} às ${a.horario} no Consultório Ramos.\n` +
        `Se precisar cancelar, acesse ${linkCancelar} ou responda esta mensagem com o código ${a.codigo}.`;
    }
    return `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`;
  }

  function botaoWhats(a, rotulo = 'WhatsApp') {
    const link = linkAvisoPaciente(a);
    if (!link) {
      return el('button', { class: 'btn btn-fantasma btn-pequeno', disabled: true, title: 'Paciente sem telefone válido' }, rotulo);
    }
    return el('a', {
      class: 'btn btn-whats btn-pequeno',
      href: link,
      target: '_blank',
      rel: 'noopener',
      title: a.status === 'cancelado' ? 'Avisar o paciente do cancelamento' : 'Enviar confirmação com link de cancelamento',
    }, rotulo);
  }

  const estado = {
    config: { horarios: [], servicos: [], whatsapp: '' },
    admin: null,
    preAvaliacoes: [],
  };

  let modoSetup = false;

  function mostrarAcesso(setup, aviso) {
    modoSetup = setup;
    $('#telaPainel').hidden = true;
    $('#telaAcesso').hidden = false;
    $('#campoNome').hidden = !setup;
    $('#acNome').required = setup;
    $('#acSenha').autocomplete = setup ? 'new-password' : 'current-password';
    $('#acessoTitulo').textContent = setup ? 'Primeiro acesso' : 'Área restrita';
    $('#acessoSub').textContent = setup
      ? 'Nenhum administrador cadastrado ainda. Crie a conta principal do consultório (senha com pelo menos 8 caracteres).'
      : 'Entre com sua conta de administrador.';
    $('#acessoBtn').textContent = setup ? 'Criar conta e entrar' : 'Entrar';
    mostrarErro($('#acessoErro'), aviso || '');
    (setup ? $('#acNome') : $('#acEmail')).focus();
  }

  $('#formAcesso').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = $('#acessoBtn');
    const corpo = { email: $('#acEmail').value.trim(), senha: $('#acSenha').value };
    if (modoSetup) corpo.nome = $('#acNome').value.trim();

    if (!corpo.email || !corpo.senha || (modoSetup && !corpo.nome)) {
      return mostrarErro($('#acessoErro'), 'Preencha todos os campos.');
    }

    btn.disabled = true;
    try {
      const r = await api(modoSetup ? '/setup' : '/login', { method: 'POST', body: corpo });
      sessao.set(r.token);
      $('#acSenha').value = '';
      await abrirPainel(r.admin);
    } catch (err) {
      mostrarErro($('#acessoErro'), err.message);
    } finally {
      btn.disabled = false;
    }
  });

  $('#btnSair').addEventListener('click', async () => {
    try { await api('/logout', { method: 'POST', body: {} }); } catch {}
    sessao.limpar();
    mostrarAcesso(false);
  });

  async function abrirPainel(admin) {
    estado.admin = admin;
    $('#nomeAdmin').textContent = admin.nome;
    $('#telaAcesso').hidden = true;
    $('#telaPainel').hidden = false;
    trocarAba('agendamentos');
    await Promise.all([carregarResumo(), carregarAgendamentos()]);
  }

  function trocarAba(nome) {
    document.querySelectorAll('.aba').forEach((b) => {
      const ativa = b.dataset.aba === nome;
      b.classList.toggle('ativa', ativa);
      b.setAttribute('aria-selected', String(ativa));
    });
    document.querySelectorAll('.painel').forEach((p) => { p.hidden = p.dataset.painel !== nome; });
    if (nome === 'pre') carregarPre();
    if (nome === 'usuarios') carregarUsuarios();
    if (nome === 'whatsapp') $('#inCodigo').focus();
  }

  document.querySelectorAll('.aba').forEach((b) => b.addEventListener('click', () => trocarAba(b.dataset.aba)));

  async function carregarResumo() {
    try {
      const r = await api('/resumo');
      $('#stHoje').textContent = r.hoje;
      $('#stProximos').textContent = r.proximos;
      $('#stCancelados').textContent = r.cancelados;
      $('#stPre').textContent = r.preAvaliacoes;
    } catch (err) {}
  }

  function filtrosAtuais() {
    const hoje = new Date();
    const p = new URLSearchParams();
    switch ($('#fPeriodo').value) {
      case 'hoje': p.set('de', toISODate(hoje)); p.set('ate', toISODate(hoje)); break;
      case 'semana': p.set('de', toISODate(hoje)); p.set('ate', toISODate(somarDias(hoje, 6))); break;
      case 'passados': p.set('ate', toISODate(somarDias(hoje, -1))); break;
      case 'proximos': p.set('de', toISODate(hoje)); break;
      default: break;
    }
    if ($('#fStatus').value) p.set('status', $('#fStatus').value);
    if ($('#fBusca').value.trim()) p.set('busca', $('#fBusca').value.trim());
    return p.toString();
  }

  async function carregarAgendamentos() {
    const tbody = $('#tbAgendamentos');
    try {
      const lista = await api(`/agendamentos?${filtrosAtuais()}`);
      if ($('#fPeriodo').value === 'passados') lista.reverse();
      tbody.replaceChildren(...lista.map(linhaAgendamento));
      $('#vazioAgend').hidden = lista.length > 0;
    } catch (err) {
      tbody.replaceChildren();
      $('#vazioAgend').hidden = false;
      $('#vazioAgend').textContent = err.message;
    }
  }

  function linhaAgendamento(a) {
    const cancelado = a.status === 'cancelado';
    const acoes = el('div', { class: 'acoes' }, botaoWhats(a));
    if (!cancelado) {
      acoes.append(el('button', {
        class: 'btn btn-fantasma btn-pequeno',
        onclick: () => confirmarCancelamento(a),
      }, 'Cancelar'));
    }

    const statusTitulo = cancelado
      ? `Cancelado${a.canceladoPor ? ' por ' + a.canceladoPor : ''}${a.canceladoEm ? ' em ' + dataHoraBanco(a.canceladoEm) : ''}`
      : '';

    return el('tr', { class: cancelado ? 'cancelado' : '' },
      el('td', { class: 'num', 'data-rot': 'Data' }, dataCurta(a.data)),
      el('td', { class: 'num', 'data-rot': 'Hora' }, a.horario),
      el('td', { 'data-rot': 'Paciente' },
        el('span', { class: 'pac-nome' }, a.nomeCliente),
        a.observacoes ? el('span', { class: 'pac-obs', title: a.observacoes }, a.observacoes) : null),
      el('td', { class: 'contato', 'data-rot': 'Contato' },
        a.telefone || '—', el('br'), a.email || ''),
      el('td', { 'data-rot': 'Tipo' }, a.servico),
      el('td', { class: 'codigo', 'data-rot': 'Código' }, a.codigo || '—'),
      el('td', { 'data-rot': 'Status' },
        el('span', { class: `selo selo-${a.status}`, title: statusTitulo }, cancelado ? 'Cancelado' : 'Ativo'),
        a.origem === 'admin' ? el('span', { class: 'selo selo-origem', title: 'Cadastrado pela recepção' }, 'Recepção') : null),
      el('td', { class: 'td-acoes' }, acoes));
  }

  let buscaTimer;
  $('#formFiltros').addEventListener('input', () => {
    clearTimeout(buscaTimer);
    buscaTimer = setTimeout(carregarAgendamentos, 250);
  });
  $('#formFiltros').addEventListener('submit', (e) => e.preventDefault());

  let acaoConfirmar = null;

  function confirmarCancelamento(a, depois) {
    $('#confTexto').textContent =
      `${a.nomeCliente} — ${dataLonga(a.data)} às ${a.horario} (${a.servico}). O horário será liberado imediatamente.`;
    acaoConfirmar = async () => {
      const r = await api(`/agendamentos/${a.id}/cancelar`, { method: 'POST', body: {} });
      toast('Consulta cancelada. Horário liberado.');
      await Promise.all([carregarAgendamentos(), carregarResumo()]);
      if (depois) depois(r.agendamento);
    };
    abrirModal('#modalConfirma');
    $('#confOk').focus();
  }

  $('#confOk').addEventListener('click', async () => {
    const btn = $('#confOk');
    btn.disabled = true;
    try {
      await acaoConfirmar();
      fecharModal('#modalConfirma');
    } catch (err) {
      toast(err.message, true);
    } finally {
      btn.disabled = false;
    }
  });

  let focoAnterior = null;
  function abrirModal(sel) {
    focoAnterior = document.activeElement;
    $(sel).hidden = false;
  }
  function fecharModal(sel) {
    $(sel).hidden = true;
    if (focoAnterior) focoAnterior.focus();
  }
  document.querySelectorAll('.modal-fundo').forEach((m) => {
    m.addEventListener('click', (e) => {
      if (e.target === m || e.target.closest('[data-fechar]')) fecharModal(`#${m.id}`);
    });
  });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    document.querySelectorAll('.modal-fundo:not([hidden])').forEach((m) => fecharModal(`#${m.id}`));
  });

  $('#btnNovo').addEventListener('click', () => {
    $('#formNovo').reset();
    mostrarErro($('#novoErro'), '');
    $('#nData').min = toISODate(new Date());
    $('#nHorario').replaceChildren(el('option', { value: '' }, 'Escolha a data'));
    abrirModal('#modalNovo');
    $('#nNome').focus();
  });

  $('#nData').addEventListener('change', async () => {
    const data = $('#nData').value;
    const sel = $('#nHorario');
    if (!data) return;
    const [a, m, d] = data.split('-').map(Number);
    const dia = new Date(a, m - 1, d).getDay();
    if (dia === 0 || dia === 6) {
      sel.replaceChildren(el('option', { value: '' }, 'Sem atendimento no fim de semana'));
      return;
    }
    sel.replaceChildren(el('option', { value: '' }, 'Carregando...'));
    try {
      const { ocupados } = await getJSON(`/api/horarios-ocupados?data=${data}`);
      const agora = new Date();
      const ehHoje = data === toISODate(agora);
      const passou = (h) => {
        const [hh, mm] = h.split(':').map(Number);
        return ehHoje && hh * 60 + mm <= agora.getHours() * 60 + agora.getMinutes();
      };
      const situacao = (h) => (ocupados.includes(h) ? 'ocupado' : passou(h) ? 'já passou' : '');
      const livres = estado.config.horarios.filter((h) => !situacao(h));
      sel.replaceChildren(
        el('option', { value: '' }, livres.length ? 'Selecione...' : 'Nenhum horário livre'),
        ...estado.config.horarios.map((h) =>
          el('option', { value: h, disabled: !!situacao(h) }, situacao(h) ? `${h} (${situacao(h)})` : h))
      );
    } catch (err) {
      sel.replaceChildren(el('option', { value: '' }, 'Erro ao carregar horários'));
    }
  });

  $('#nTelefone').addEventListener('input', (e) => {
    let v = e.target.value.replace(/\D/g, '').slice(0, 11);
    if (v.length > 6) v = `(${v.slice(0, 2)}) ${v.slice(2, 7)}-${v.slice(7)}`;
    else if (v.length > 2) v = `(${v.slice(0, 2)}) ${v.slice(2)}`;
    else if (v.length > 0) v = `(${v}`;
    e.target.value = v;
  });

  $('#formNovo').addEventListener('submit', async (e) => {
    e.preventDefault();
    const corpo = {
      nomeCliente: $('#nNome').value.trim(),
      telefone: $('#nTelefone').value.trim(),
      email: $('#nEmail').value.trim(),
      data: $('#nData').value,
      horario: $('#nHorario').value,
      servico: $('#nServico').value,
      observacoes: $('#nObs').value.trim(),
    };
    if (!corpo.nomeCliente || !corpo.data || !corpo.horario || !corpo.servico) {
      return mostrarErro($('#novoErro'), 'Preencha paciente, data, horário e tipo de consulta.');
    }
    const btn = e.submitter;
    if (btn) btn.disabled = true;
    try {
      const criado = await api('/agendamentos', { method: 'POST', body: corpo });
      fecharModal('#modalNovo');
      toast(`Consulta salva. Código do paciente: ${criado.codigo}`);
      await Promise.all([carregarAgendamentos(), carregarResumo()]);
    } catch (err) {
      mostrarErro($('#novoErro'), err.message);
      if (err.status === 409) $('#nData').dispatchEvent(new Event('change'));
    } finally {
      if (btn) btn.disabled = false;
    }
  });

  $('#inCodigo').addEventListener('input', (e) => {
    e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
  });

  $('#formCodigo').addEventListener('submit', async (e) => {
    e.preventDefault();
    const codigo = $('#inCodigo').value;
    const res = $('#codigoResultado');
    res.replaceChildren();
    mostrarErro($('#codigoErro'), '');
    if (codigo.length !== 6) return mostrarErro($('#codigoErro'), 'O código tem 6 caracteres.');

    try {
      const a = await api(`/codigo/${encodeURIComponent(codigo)}`);
      mostrarResultadoCodigo(a);
    } catch (err) {
      mostrarErro($('#codigoErro'), err.message);
    }
  });

  function mostrarResultadoCodigo(a) {
    const res = $('#codigoResultado');
    const cancelado = a.status === 'cancelado';
    const acoes = el('div', { class: 'acoes' });

    if (!cancelado) {
      acoes.append(el('button', {
        class: 'btn btn-perigo btn-pequeno',
        onclick: async (ev) => {
          const btn = ev.currentTarget;
          btn.disabled = true;
          try {
            const r = await api('/cancelar-codigo', { method: 'POST', body: { codigo: a.codigo } });
            toast('Cancelado via WhatsApp. Horário liberado.');
            mostrarResultadoCodigo(r.agendamento);
            carregarAgendamentos();
            carregarResumo();
          } catch (err) {
            toast(err.message, true);
            btn.disabled = false;
          }
        },
      }, 'Confirmar cancelamento'));
    }
    acoes.append(botaoWhats(a, cancelado ? 'Avisar paciente no WhatsApp' : 'Abrir conversa'));

    res.replaceChildren(el('div', { class: 'resultado-codigo' },
      el('strong', {}, a.nomeCliente), ' ',
      el('span', { class: `selo selo-${a.status}` }, cancelado ? 'Cancelado' : 'Ativo'), el('br'),
      `📅 ${dataLonga(a.data)} às ${a.horario}`, el('br'),
      `📋 ${a.servico}`, el('br'),
      `📞 ${a.telefone || 'sem telefone'}`,
      acoes));
  }

  const ROTULOS = {
    nome: 'Nome', nomeCompleto: 'Nome', email: 'E-mail', telefone: 'Telefone', nascimento: 'Nascimento',
    dataNascimento: 'Nascimento', dataNasc: 'Nascimento', cpf: 'CPF', sexo: 'Sexo', peso: 'Peso', altura: 'Altura', convenio: 'Convênio',
    motivo: 'Motivo da consulta', doencas: 'Doenças', alergias: 'Alergias', medicamentos: 'Medicamentos',
    historico: 'Histórico familiar', historicoFamiliar: 'Histórico familiar', atividade: 'Atividade física',
    atividadeFisica: 'Atividade física', alimentacao: 'Alimentação', estresse: 'Estresse',
    nivelEstresse: 'Nível de estresse', sono: 'Sono', tabagismo: 'Tabagismo', obs: 'Observações',
    observacoes: 'Observações',
  };
  const rotulo = (k) => ROTULOS[k] || k.replace(/[_-]/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^./, (c) => c.toUpperCase());

  function nomeDaPre(r) {
    return r.nomeCompleto || r.nome || r.name || 'Paciente sem nome';
  }

  async function carregarPre() {
    try {
      estado.preAvaliacoes = await api('/pre-avaliacoes');
      renderPre();
    } catch (err) {
      toast(err.message, true);
    }
  }

  function renderPre() {
    const termo = $('#fBuscaPre').value.trim().toLowerCase();
    const lista = estado.preAvaliacoes.filter((p) => {
      if (!termo) return true;
      const r = typeof p.respostas === 'object' ? p.respostas : {};
      return `${nomeDaPre(r)} ${r.email || ''}`.toLowerCase().includes(termo);
    });

    $('#listaPre').replaceChildren(...lista.map((p) => {
      const r = typeof p.respostas === 'object' && p.respostas ? p.respostas : { respostas: String(p.respostas) };
      const itens = Object.entries(r).filter(([, v]) => v !== '' && v !== null && v !== undefined);
      return el('details', { class: 'pre-item' },
        el('summary', {},
          el('span', { class: 'pre-titulo' }, nomeDaPre(r)),
          r.motivo ? el('span', { class: 'pac-obs' }, r.motivo) : null,
          el('span', { class: 'pre-meta' }, dataHoraBanco(p.criadoEm))),
        el('dl', { class: 'pre-dados' },
          itens.map(([k, v]) => el('div', {},
            el('dt', {}, rotulo(k)),
            el('dd', {}, Array.isArray(v) ? v.join(', ') : typeof v === 'object' ? JSON.stringify(v) : String(v))))));
    }));
    $('#vazioPre').hidden = lista.length > 0;
    $('#vazioPre').textContent = estado.preAvaliacoes.length
      ? 'Nenhuma pré-avaliação corresponde ao filtro.'
      : 'Nenhuma pré-avaliação recebida ainda.';
  }
  $('#fBuscaPre').addEventListener('input', renderPre);

  async function carregarUsuarios() {
    try {
      const lista = await api('/usuarios');
      $('#listaUsuarios').replaceChildren(...lista.map((u) => {
        const eu = u.id === estado.admin.id;
        return el('li', {},
          el('div', {}, el('strong', {}, u.nome), eu ? ' (você)' : '', el('small', {}, u.email)),
          eu ? null : el('button', {
            class: 'btn btn-fantasma btn-pequeno',
            onclick: async () => {
              if (!window.confirm(`Remover o acesso de ${u.nome}?`)) return;
              try {
                await api(`/usuarios/${u.id}`, { method: 'DELETE' });
                toast('Administrador removido.');
                carregarUsuarios();
              } catch (err) { toast(err.message, true); }
            },
          }, 'Remover'));
      }));
    } catch (err) {
      toast(err.message, true);
    }
  }

  $('#formUsuario').addEventListener('submit', async (e) => {
    e.preventDefault();
    const corpo = { nome: $('#uNome').value.trim(), email: $('#uEmail').value.trim(), senha: $('#uSenha').value };
    try {
      await api('/usuarios', { method: 'POST', body: corpo });
      $('#formUsuario').reset();
      mostrarErro($('#usuarioErro'), '');
      toast('Administrador cadastrado.');
      carregarUsuarios();
    } catch (err) {
      mostrarErro($('#usuarioErro'), err.message);
    }
  });

  async function iniciar() {
    try {
      estado.config = await getJSON('/api/config');
      $('#nServico').replaceChildren(
        el('option', { value: '' }, 'Selecione...'),
        ...estado.config.servicos.map((s) => el('option', { value: s }, s)));
      const n = estado.config.whatsapp;
      $('#numWhats').textContent = /^550+$/.test(n)
        ? 'não configurado (defina WHATSAPP_CONSULTORIO no servidor)'
        : `+${n}`;
    } catch (err) {
      mostrarAcesso(false, 'Não foi possível conectar ao servidor. Inicie o backend (cd backend && npm start) e abra http://localhost:3000/admin.html');
      return;
    }

    if (sessao.get()) {
      try {
        const { admin } = await api('/me');
        return abrirPainel(admin);
      } catch {}
    }

    try {
      const { configurado } = await api('/status');
      mostrarAcesso(!configurado);
    } catch (err) {
      mostrarAcesso(false, err.message);
    }
  }

  iniciar();
})();
