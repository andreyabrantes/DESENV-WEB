<div align="center">

# 🌿 Consultório Ramos

**Site institucional** moderno e responsivo para a **Dra. Fernanda Ramos** — especialista em **Endocrinologia, Metabologia e Menopausa**.

`HTML5` · `CSS3` · `JavaScript` · `Node.js` · `Express` · `SQLite` · `EmailJS`

![Status](https://img.shields.io/badge/status-conclu%C3%ADdo-brightgreen)
![Testes](https://img.shields.io/badge/testes-46%20passando-brightgreen)
![Projeto](https://img.shields.io/badge/projeto-acad%C3%AAmico-blue)
![Licen%C3%A7a](https://img.shields.io/badge/licen%C3%A7a-MIT-lightgrey)

</div>

---

## 📑 Sumário

- [🌟 Sobre o Projeto](#-sobre-o-projeto)
- [🎓 Contexto Educacional](#-contexto-educacional)
- [✨ Funcionalidades](#-funcionalidades)
- [🛠️ Tecnologias](#️-tecnologias)
- [🗂️ Estrutura de Arquivos](#️-estrutura-de-arquivos)
- [📄 Páginas](#-páginas)
- [🔐 Painel Administrativo](#-painel-administrativo-adminhtml)
- [💬 Cancelamento via WhatsApp](#-cancelamento-via-whatsapp)
- [🎨 Identidade Visual](#-identidade-visual)
- [📧 Integração EmailJS](#-integração-emailjs)
- [⚙️ Backend (API REST)](#️-backend-api-rest)
- [🔌 Referência da API](#-referência-da-api)
- [🔒 Segurança](#-segurança)
- [🚀 Como Usar](#-como-usar)
- [🧪 Testes Automatizados](#-testes-automatizados)
- [📝 Histórico de Mudanças (v2.0)](#-histórico-de-mudanças-v20)
- [👥 Equipe](#-equipe)

---

## 🌟 Sobre o Projeto

Plataforma institucional com foco em **saúde hormonal**, **controle de peso** e **bem-estar**. Une um front-end leve e elegante (HTML, CSS e JavaScript puros, sem frameworks) a um backend opcional em **Node.js + Express + SQLite**, responsável por persistir agendamentos e pré-avaliações.

O design usa uma **paleta pastel** (roxo, verde e azul) e efeitos visuais sofisticados — blobs animados, partículas flutuantes e animações de *scroll reveal* — para transmitir acolhimento e modernidade.

> 💡 **Diferencial:** o front-end funciona de forma **100% independente** (basta abrir o `index.html`). O backend só é necessário para gravar os dados no banco; o envio de e-mails via **EmailJS** acontece direto do navegador.

---

## 🎓 Contexto Educacional

> ⚠️ **Este é um projeto acadêmico, sem fins comerciais.**

Este repositório foi desenvolvido como trabalho da disciplina de **Engenharia de Software** do **6º período**. Seus objetivos são estritamente didáticos:

- 🎯 **Praticar** desenvolvimento front-end com HTML, CSS e JavaScript puros (sem frameworks).
- 🧩 **Integrar** um front-end estático a uma API REST própria.
- 🗄️ **Exercitar** persistência de dados com SQLite e boas práticas de modelagem.
- 🔐 **Aplicar** conceitos de segurança em APIs (Helmet, rate limiting, CORS, validação).
- 📚 **Documentar** o projeto de forma clara e reproduzível.

**Avisos importantes:**

- 🏥 **Não é um sistema médico real.** Não deve ser usado para atendimento, diagnóstico ou agendamento de pacientes reais.
- 📝 **Dados são fictícios.** Telefone, endereço, CRM, depoimentos e estatísticas são *placeholders*.
- 🔑 **Credenciais expostas.** As chaves do EmailJS estão no código por simplicidade didática — em produção, use um proxy no backend.
- 🗃️ **Sem autenticação.** As rotas de listagem (`GET`) são abertas, o que é aceitável apenas em ambiente de estudo.

---

## ✨ Funcionalidades

### 🖥️ Front-end

- 🏠 **Landing page** com hero, cards informativos em *accordion*, depoimentos e CTA.
- 👩‍⚕️ **Página "Sobre"** com bio, especialidades e chamada para agendamento.
- 📅 **Agendamento** com calendário interativo (bloqueia fins de semana e datas passadas), grade de horários em tempo real e formulário.
- ❌ **Cancelamento** pelo link do e-mail (com resumo da consulta antes de confirmar) **ou pelo WhatsApp**, usando um código de 6 caracteres.
- 📋 **Pré-avaliação** em formulário multi-etapas com barra de progresso animada.
- 🔐 **Painel administrativo** com login, cadastro de administradores, agenda filtrável, cadastro manual de consultas, cancelamento e leitura das pré-avaliações.
- 📧 **Envio de e-mails** de confirmação e pré-avaliação via EmailJS. Se o CDN do EmailJS falhar, a página continua funcionando e os dados são salvos normalmente.
- 📱 **Layout responsivo** com menu hamburger e tipografia fluida.

### ⚙️ Back-end (API)

- 🔌 **REST API** em Express organizada em módulos (`routes/`, `services/`, `auth.js`, `utils.js`).
- 🗄️ **Persistência** em SQLite com criação automática de tabelas e **migração idempotente** de bancos antigos.
- 🚫 **Sem horário duplicado**: verificação na rota + índice único parcial `(data, horario) WHERE status='ativo'`, que cobre até requisições simultâneas.
- 🔐 **Autenticação** do painel com senha em *scrypt* + salt e sessões por token Bearer (o banco guarda apenas o hash do token).
- 💬 **Cancelamento via WhatsApp** com links `wa.me` (gratuito, sem API paga).
- 🛡️ **Segurança**: Helmet, rate limiting (geral + login), CORS configurável, validação de entrada e bloqueio de acesso à pasta `/backend`.
- 🧪 **Testes automatizados** com `node:test`, sem dependências extras (`npm test`).

## 🛠️ Tecnologias

| Camada | Tecnologias |
|---|---|
| **Front-end** | HTML5, CSS3, JavaScript (vanilla), Google Fonts |
| **Back-end** | Node.js, Express, SQLite (`sqlite3`) |
| **Integração** | [EmailJS](https://emailjs.com) (envio de e-mails no cliente) |
| **Segurança** | Helmet, express-rate-limit, CORS |
| **Dev** | Nodemon (auto-reload) |

---

## 🗂️ Estrutura de Arquivos

```
.
├── index.html               # 🏠 Página inicial (landing page)
├── script.js                # ⚡ Scripts compartilhados (hamburger, accordion, scroll reveal)
├── style.css                # 🎨 Estilos globais e componentes compartilhados
│
├── sobre.html / sobre.css   # 👩‍⚕️ Página "Sobre"
├── agendar.html / .css      # 📅 Agendamento (calendário + formulário + código WhatsApp)
├── cancelar.html            # ❌ Cancelamento (link do e-mail ou código via WhatsApp)
├── pre-avaliacao.html / .css# 📋 Pré-avaliação multi-etapas
│
├── admin.html               # 🔐 Painel administrativo
├── admin.css                # 🎨 Estilos do painel
├── admin.js                 # ⚡ Lógica do painel (login, agenda, WhatsApp, pré-avaliações)
│
├── api.js                   # 🔌 Helpers de integração com a API (fetch + erros HTTP)
│
├── backend/                 # ⚙️ API Node.js + Express + SQLite
│   ├── server.js            #   Ponto de entrada (espera o banco e abre a porta)
│   ├── app.js               #   Monta o Express: segurança, estáticos, rotas e erros
│   ├── config.js            #   Configurações e variáveis de ambiente
│   ├── database.js          #   Conexão, schema, migração e helpers com Promise
│   ├── auth.js              #   Hash de senha (scrypt) e sessões do painel
│   ├── utils.js             #   Validações, tokens, códigos e links do WhatsApp
│   ├── services/
│   │   └── agendamentos.js  #   Regras de negócio: criar, cancelar e ver disponibilidade
│   ├── routes/
│   │   ├── publicas.js      #   /api/* usadas pelo site
│   │   └── admin.js         #   /api/admin/* (protegidas por login)
│   ├── test/
│   │   ├── api.test.js      #   Testes de integração da API
│   │   └── migracao.test.js #   Teste de migração de banco antigo
│   ├── email-template.html  #   Template de referência para o EmailJS
│   ├── package.json
│   └── database.db          #   Banco local (ignorado pelo Git e bloqueado pelo servidor)
│
├── DEV-FRONT-END/           # 📦 Versão isolada da landing page (entrega parcial)
└── README.md
```

## 📄 Páginas

### 🏠 `index.html` — Início

| Seção | Descrição |
|---|---|
| **Navbar** | Navegação fixa com blur, links e botão de agendamento |
| **Hero** | Título, tagline, botões de CTA, trust badges e bloco de estatísticas |
| **Banner Marquee** | Faixa animada com palavras-chave do consultório |
| **Cards Informativos** | 3 cards *accordion* expansíveis com conteúdo educativo |
| **Depoimentos** | 3 cards com avaliações de pacientes |
| **CTA** | Chamada para agendamento com botões de contato |
| **Footer** | Endereço, telefone e direitos autorais |

### 👩‍⚕️ `sobre.html` — Sobre

| Seção | Descrição |
|---|---|
| **Hero** | Badge, título e tagline da especialista |
| **Bio** | Apresentação da Dra. Fernanda Ramos com botão de agendamento |
| **Especialidades** | 3 cards com as áreas de atuação |
| **CTA + Footer** | Chamada para agendamento e rodapé |

### 📅 `agendar.html` — Agendar Consulta

| Seção | Descrição |
|---|---|
| **Hero** | Título e tagline da página |
| **Calendário** | Navegação por mês e seleção de datas disponíveis (bloqueia fins de semana e datas passadas) |
| **Horários** | Grade de slots disponíveis/ocupados para a data selecionada |
| **Formulário** | Nome, telefone, e-mail, tipo de consulta e observações |
| **Resumo** | Exibe data e horário selecionados em tempo real |
| **Modal Sucesso/Erro** | Feedback após o envio via EmailJS |

**Horários disponíveis (slots fixos):**

```
08:00 · 09:00 · 10:00 · 11:00 · 13:00 · 14:00 · 14:30 · 15:30 · 16:00 · 17:00
```

Os slots já ocupados são obtidos em tempo real via `GET /api/horarios-ocupados?data=YYYY-MM-DD`.

### ❌ `cancelar.html` — Cancelar Consulta

A página tem dois modos:

| Acesso | O que aparece |
|---|---|
| `cancelar.html?token=...` (link do e-mail) | Resumo da consulta (data, horário, tipo) carregado por `GET /api/cancelar/:token` e o botão **Confirmar cancelamento**, que chama `POST /api/cancelar/:token`. |
| `cancelar.html` (sem token) | Formulário **Cancelar pelo WhatsApp**: o paciente digita o código de 6 caracteres e o WhatsApp do consultório abre com a mensagem pronta. |

**Fluxo pelo e-mail:**

1. O paciente clica em **"✕ Cancelar consulta"** no e-mail.
2. A página mostra o resumo da consulta. Abrir o link **não cancela nada**: o GET só consulta. Assim, leitores de e-mail que "pré-visitam" links não cancelam consultas por acidente.
3. Ao confirmar, o backend marca o agendamento como `cancelado` e o horário volta a ficar disponível.

### 📋 `pre-avaliacao.html` — Pré-Avaliação

Formulário multi-etapas com barra de progresso animada.

| Etapa | Campos |
|---|---|
| **1 — Dados Pessoais** | Nome, data de nascimento, CPF, sexo, telefone, e-mail, peso, altura, convênio |
| **2 — Saúde Geral** | Motivo da consulta, doenças diagnosticadas, alergias, medicamentos, histórico familiar |
| **3 — Estilo de Vida** | Atividade física, alimentação, nível de estresse (slider), sono, tabagismo, observações |

Ao enviar, os dados são persistidos no banco (via API) e um e-mail formatado é disparado para o consultório via **EmailJS**.

---

## 🔐 Painel Administrativo (`admin.html`)

Acesse `http://localhost:3000/admin.html` com o backend rodando. Há também o link **"Área restrita"** no rodapé do site.

**Primeiro acesso:** enquanto não houver nenhum administrador, a tela pede **nome, e-mail e senha** (mínimo de 8 caracteres) para criar a conta principal. Depois disso, o cadastro inicial é bloqueado (`403`) e novos administradores só podem ser cadastrados por quem já está logado.

| Aba | O que faz |
|---|---|
| **Indicadores** | Consultas de hoje, próximas ativas, canceladas e total de pré-avaliações. |
| **Agendamentos** | Tabela com filtros (período, status e busca por nome, e-mail, telefone ou código). Em cada linha há o botão **WhatsApp**, que envia ao paciente a confirmação com o link de cancelamento, e o botão **Cancelar**, que pede confirmação. O botão **+ Nova consulta** permite à recepção marcar consultas recebidas por telefone ou WhatsApp, mostrando apenas os horários livres. |
| **WhatsApp** | Busca a consulta pelo código que o paciente mandou e confirma o cancelamento. Depois, o botão **Avisar paciente no WhatsApp** envia a confirmação ao paciente. |
| **Pré-avaliações** | Lista as fichas recebidas, que se expandem para mostrar todas as respostas, com filtro por nome ou e-mail. |
| **Administradores** | Lista, cadastra e remove contas. Ninguém consegue remover a própria conta, então sempre sobra pelo menos um administrador. |

A sessão dura 8 horas (`SESSAO_HORAS`) e o token fica no `sessionStorage`, então some quando a aba é fechada. **Sair** invalida o token no servidor.

---

## 💬 Cancelamento via WhatsApp

A implementação usa links **`wa.me`**, que são gratuitos e não exigem conta na API oficial (Meta/Twilio):

1. Ao agendar, o paciente recebe um **código de 6 caracteres** (ex.: `5YJ89K`, sem letras ambíguas como O/0 e I/1) e o botão **"Cancelar pelo WhatsApp"**. O código também vai para o EmailJS nas variáveis `{{codigo}}` e `{{whatsapp_link}}`.
2. O botão abre o WhatsApp do consultório com a mensagem pronta, contendo o código e a data. Quem não tem mais o botão pode usar `cancelar.html` e digitar o código.
3. A recepção abre a aba **WhatsApp** do painel, busca o código e confirma o cancelamento. O horário é liberado na hora e o sistema registra `canceladoPor = "whatsapp"`.
4. Com um clique, a recepção responde ao paciente confirmando o cancelamento.

> ⚙️ Configure o número do consultório (DDI + DDD + número, só dígitos):
>
> ```bash
> WHATSAPP_CONSULTORIO=5511999998888 npm start
> ```
>
> Sem essa variável, o servidor usa um número fictício e avisa no console.

> 🔮 **Evolução possível:** para cancelar sem intervenção humana, basta ligar um webhook da WhatsApp Cloud API ao serviço `cancelar()` já existente em `services/agendamentos.js`, usando o mesmo código.

---

## 🎨 Identidade Visual

### Paleta de Cores

| Variável | Hex | Uso |
|---|---|---|
| `--purple` | `#795ea0` | Cor primária, botões, destaques |
| `--purple2` | `#c4b3df` | Bordas, elementos secundários |
| `--purple3` | `#ede6f7` | Fundos suaves, badges |
| `--green` | `#9fc392` | Blobs e cards verdes |
| `--blue` | `#74a3b2` | Blobs, cards azuis, gradientes |
| `--dark` | `#1e1b2e` | Textos principais |
| `--gray` | `#6b7280` | Textos secundários |
| `--bg` | `#f4f0fa` | Fundo geral |

### Tipografia

| Fonte | Uso |
|---|---|
| [Playfair Display](https://fonts.google.com/specimen/Playfair+Display) | Títulos, números de destaque, citações |
| [Inter](https://fonts.google.com/specimen/Inter) | Corpo de texto, labels, botões |

Ambas carregadas via **Google Fonts**.

---

## ✨ Animações e Efeitos

- 🫧 **Blobs animados** — formas circulares com `filter: blur` flutuando nos heroes.
- ✨ **Partículas flutuantes** — 8 partículas coloridas subindo em loop.
- 🌈 **Gradiente animado** — texto em destaque com `gradientShift` contínuo.
- 🔵 **Badge dot pulsante** — indicador animado nos badges.
- 👁️ **Scroll Reveal** — seções entram com fade + `translateY` via `IntersectionObserver`.
- 🎞️ **Marquee** — banner com palavras-chave deslizando em loop.
- 🃏 **Hover nos cards** — elevação suave com `translateY` e `box-shadow`.
- 🪜 **Stepper animado** — barra de progresso e dots com transição de estado na pré-avaliação.

---

## 📱 Responsividade

- Hero empilha verticalmente em telas `≤ 768px`.
- Menu de navegação vira **hamburger** no mobile.
- Grid de agendamento passa para **coluna única** no mobile.
- Formulário de pré-avaliação adapta colunas para `1fr` no mobile.
- Tipografia fluida com `clamp()` nos títulos principais.

---

## 📧 Integração EmailJS

As páginas de agendamento e pré-avaliação utilizam o [EmailJS](https://emailjs.com) para envio de e-mails **sem backend**.

| Chave | Valor |
|---|---|
| **Public Key** | `tDOOgh3i3HfAYauD6` |
| **Service ID** | `service_j3r3arh` |
| **Template — Agendar** | `template_bdtsohd` |
| **Template — Pré-Avaliação** | `template_ka5uizn` |

Os templates são configurados no painel do EmailJS; as variáveis `{{variavel}}` estão mapeadas no código de `agendar.html` e `pre-avaliacao.html`.

**Variáveis do template de agendamento (cancelamento):**

| Variável | Descrição |
|---|---|
| `{{to_name}}` | Nome do paciente |
| `{{to_email}}` | E-mail do paciente |
| `{{data}}` / `{{data_curta}}` / `{{dia_semana}}` | Data formatada da consulta |
| `{{horario}}` | Horário reservado |
| `{{tipo}}` | Tipo de consulta |
| `{{obs}}` | Observações |
| `{{cancel_link}}` | URL absoluta (`http://.../cancelar.html?token=...`) do botão de cancelamento |
| `{{cancel_token}}` | Token bruto de cancelamento (48 hex) |

> 🔗 O `{{cancel_link}}` é montado com `new URL('/cancelar.html', API_BASE)` para gerar uma URL **absoluta http://** — links `file://` são bloqueados pela maioria dos clientes de e-mail. Um modelo de referência está em [`backend/email-template.html`](backend/email-template.html).

> ⚠️ A `Public Key` é exposta no front-end por design da plataforma (é uma chave pública). Os IDs de service/template também trafegam no cliente — isso é inerente ao modelo client-side do EmailJS. Para ocultá-los por completo, seria necessário um proxy no backend.

---

## ⚙️ Backend (API REST)

API em **Node.js + Express + SQLite** que persiste agendamentos, pré-avaliações e administradores.

### ▶️ Como rodar

```bash
cd backend
npm install
npm start        # http://localhost:3000  (painel: /admin.html)
npm run dev      # reinicia automaticamente a cada alteração
npm test         # roda os testes automatizados
```

### 🗄️ Modelo de Dados

**Tabela `agendamentos`**

| Coluna | Tipo | Restrições |
|---|---|---|
| `id` | INTEGER | PK, AUTOINCREMENT |
| `nomeCliente` | TEXT | NOT NULL |
| `servico` | TEXT | NOT NULL |
| `data` | TEXT | NOT NULL (`YYYY-MM-DD`) |
| `horario` | TEXT | NOT NULL (`HH:MM`, dentro da grade) |
| `email` / `telefone` / `observacoes` | TEXT | opcionais |
| `token` | TEXT | UNIQUE: token do link de cancelamento (48 hex) |
| `codigo` | TEXT | UNIQUE: código curto para o WhatsApp (6 caracteres) |
| `origem` | TEXT | `site` \| `admin` |
| `status` | TEXT | `ativo` \| `cancelado` |
| `canceladoEm` | DATETIME | quando foi cancelado |
| `canceladoPor` | TEXT | `paciente-email` \| `whatsapp` \| `admin:<email>` |
| `criadoEm` | DATETIME | DEFAULT `CURRENT_TIMESTAMP` |

Índice único parcial `(data, horario) WHERE status = 'ativo'`: impede dois agendamentos ativos no mesmo horário.

**Tabela `pre_avaliacoes`**: `id`, `respostas` (JSON serializado) e `criadoEm`.

**Tabela `admins`**: `id`, `nome`, `email` (UNIQUE, sem diferenciar maiúsculas de minúsculas), `senhaHash` (`scrypt$salt$hash`) e `criadoEm`.

**Tabela `sessoes`**: `tokenHash` (SHA-256 do token), `adminId` e `expiraEm`.

> 🔁 O `database.js` faz uma **migração idempotente**: em um `database.db` da versão anterior, ele adiciona as colunas novas e gera códigos de WhatsApp para os agendamentos antigos, sem perder dados. Isso é coberto pelo teste `migracao.test.js`.

---

## 🔌 Referência da API

**Base URL:** `http://localhost:3000`. Todas as rotas `/api/*` têm **rate limit** de 100 requisições por IP a cada 15 minutos. O login e o cadastro inicial têm um limite próprio de 10 tentativas.

### 📋 Rotas públicas (usadas pelo site)

| Método | Rota | Descrição | Sucesso |
|---|---|---|---|
| `GET` | `/api/config` | Horários da grade, tipos de consulta e WhatsApp do consultório | `200` |
| `POST` | `/api/agendamentos` | Cria um agendamento | `201` |
| `GET` | `/api/horarios-ocupados?data=YYYY-MM-DD` | Horários ocupados (só os ativos) | `200` |
| `GET` | `/api/cancelar/:token` | **Consulta** o resumo da consulta (sem efeito colateral) | `200` |
| `POST` | `/api/cancelar/:token` | **Cancela** e libera o horário | `200` |
| `POST` | `/api/pre-avaliacao` | Salva uma pré-avaliação | `201` |

### 🔐 Rotas do painel (`Authorization: Bearer <token>`)

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/api/admin/status` | `{ configurado: bool }` (pública) |
| `POST` | `/api/admin/setup` | Cadastra o **primeiro** admin (pública; `403` depois disso) |
| `POST` | `/api/admin/login` | `{ email, senha }` → `{ token, expiraEm, admin }` (pública) |
| `POST` | `/api/admin/logout` | Invalida o token |
| `GET` | `/api/admin/me` | Admin logado |
| `GET` | `/api/admin/resumo` | Contadores do painel |
| `GET` | `/api/admin/agendamentos?de=&ate=&status=&busca=` | Lista com filtros |
| `POST` | `/api/admin/agendamentos` | Cadastro manual de consulta (`origem: "admin"`) |
| `POST` | `/api/admin/agendamentos/:id/cancelar` | Cancela pelo id |
| `GET` | `/api/admin/codigo/:codigo` | Busca uma consulta pelo código do WhatsApp |
| `POST` | `/api/admin/cancelar-codigo` | `{ codigo }`: cancela via WhatsApp |
| `GET` | `/api/admin/pre-avaliacoes` | Lista as pré-avaliações (respostas já em objeto) |
| `GET` | `/api/admin/usuarios` | Lista os administradores |
| `POST` | `/api/admin/usuarios` | Cadastra um administrador |
| `DELETE` | `/api/admin/usuarios/:id` | Remove um administrador (não a própria conta) |

> ⚠️ **Mudança em relação à v1:** `GET /api/agendamentos` e `GET /api/pre-avaliacao` eram públicas e expunham dados de saúde e os tokens de cancelamento de todos os pacientes. Elas foram substituídas pelas rotas protegidas `/api/admin/agendamentos` e `/api/admin/pre-avaliacoes`.

---

### `POST /api/agendamentos`

| Campo | Tipo | Obrigatório | Regra |
|---|---|---|---|
| `nomeCliente` | string | ✅ | até 120 caracteres |
| `servico` | string | ✅ | até 60 caracteres |
| `data` | string | ✅ | `YYYY-MM-DD`, data existente, não passada, de segunda a sexta |
| `horario` | string | ✅ | um dos horários de `GET /api/config`. Se a data for hoje, o horário ainda não pode ter passado |
| `email` | string | ❌ | e-mail válido |
| `telefone` | string | ❌ | DDD + número (10 a 13 dígitos). No site é obrigatório, porque é usado no WhatsApp |
| `observacoes` | string | ❌ | até 500 caracteres |

```bash
curl -X POST http://localhost:3000/api/agendamentos \
  -H "Content-Type: application/json" \
  -d '{"nomeCliente":"Maria Silva","servico":"Retorno","data":"2026-12-15","horario":"10:00","telefone":"(11) 99999-9999"}'
```

**`201 Created`:**

```json
{
  "id": 1,
  "nomeCliente": "Maria Silva",
  "servico": "Retorno",
  "data": "2026-12-15",
  "horario": "10:00",
  "telefone": "(11) 99999-9999",
  "token": "a1b2c3...48 hex",
  "codigo": "5YJ89K",
  "origem": "site",
  "status": "ativo",
  "whatsappCancelamento": "https://wa.me/5511999998888?text=Ol%C3%A1!..."
}
```

**Erros:** `400` (validação, com a lista em `detalhes`) e `409` (horário já reservado).

### `GET` / `POST /api/cancelar/:token`

| Status | Quando |
|---|---|
| `200` | GET: `{ agendamento, podeCancelar }` com o resumo, sem e-mail nem telefone · POST: `{ mensagem, agendamento }` |
| `400` | Token com formato inválido |
| `404` | Token inexistente |
| `409` | POST em agendamento já cancelado ou em consulta que já aconteceu |

### `POST /api/pre-avaliacao`

Recebe um objeto JSON livre e não vazio, com no máximo 200 campos. A resposta é `201 { id, criadoEm }`: as respostas **não** são devolvidas, por serem dados de saúde.

### ❌ Respostas de Erro Gerais

| Status | Quando ocorre |
|---|---|
| `400` | Validação ou JSON malformado |
| `401` | Rota do painel sem token ou com sessão expirada |
| `403` | Cadastro inicial (`setup`) depois que o painel já foi configurado |
| `404` | Rota ou recurso inexistente |
| `409` | Conflito (horário ocupado, cancelamento repetido, e-mail de admin duplicado) |
| `413` | Corpo maior que 100 KB |
| `429` | Rate limit excedido |
| `500` | Falha interna (o detalhe fica só no log do servidor) |

### 🌍 Variáveis de ambiente

| Variável | Padrão | Descrição |
|---|---|---|
| `PORT` | `3000` | Porta do servidor |
| `DB_PATH` | `backend/database.db` | Arquivo SQLite (`:memory:` nos testes) |
| `ALLOWED_ORIGINS` | *(vazio)* | Origens CORS permitidas, separadas por vírgula |
| `WHATSAPP_CONSULTORIO` | `5500000000000` | WhatsApp do consultório (só dígitos, com 55) |
| `SESSAO_HORAS` | `8` | Duração da sessão do painel |
| `RATE_LIMIT_MAX` | `100` | Requisições por IP a cada 15 min em `/api` |
| `LOGIN_LIMIT_MAX` | `10` | Tentativas de login por IP a cada 15 min |

---

## 🔒 Segurança

| Medida | Onde | Descrição |
|---|---|---|
| **Pasta `/backend` bloqueada** | `app.js` | O servidor estático não entrega `database.db`, código, `node_modules`, arquivos `.md` nem *dotfiles* (na v1, o banco podia ser baixado pelo navegador) |
| **Rotas sensíveis protegidas** | `routes/admin.js` | Listagens de pacientes e pré-avaliações só com login |
| **Senhas com scrypt + salt** | `auth.js` | Comparação em tempo constante (`timingSafeEqual`) |
| **Login sem vazar e-mails** | `routes/admin.js` | Mesma mensagem e mesmo custo de hash para e-mail inexistente e senha errada |
| **Sessão por token** | `auth.js` | 256 bits aleatórios. O banco guarda só o SHA-256 do token. O token expira e é invalidado no logout ou quando o admin é removido |
| **Rate limit de login** | `routes/admin.js` | 10 tentativas a cada 15 min por IP |
| **Sem horário duplicado** | `services/agendamentos.js` + índice parcial | Também cobre reservas simultâneas (testado com 5 requisições paralelas) |
| **GET sem efeito colateral** | `routes/publicas.js` | Abrir o link do e-mail não cancela. Só o `POST` cancela |
| **Helmet + CSP** | `app.js` | Headers de segurança, sem `x-powered-by` |
| **CORS configurável** | `app.js` | Allowlist via `ALLOWED_ORIGINS` |
| **`Cache-Control: no-store`** | `app.js` | Respostas da API (dados pessoais) não ficam em cache |
| **Queries parametrizadas** | todo o backend | Previne SQL injection (há teste para isso) |
| **Escape de saída** | todas as páginas e `admin.js` | Dados renderizados via `textContent`/DOM (evita XSS) |

> ⚠️ **Limitações conhecidas (contexto educacional):** as chaves do EmailJS ficam no cliente, não há HTTPS em ambiente local e o cancelamento via WhatsApp depende de uma pessoa confirmar no painel.

---

## 🚀 Como Usar

```bash
cd backend
npm install
WHATSAPP_CONSULTORIO=5511999998888 npm start
```

No Windows (PowerShell): `$env:WHATSAPP_CONSULTORIO="5511999998888"; npm start`

1. Abra `http://localhost:3000/index.html` para ver o site.
2. Abra `http://localhost:3000/admin.html` e crie a conta de administrador no primeiro acesso.

> 💡 O front-end ainda abre direto pelo arquivo (`file://`), mas o agendamento, o cancelamento e a pré-avaliação precisam do backend rodando.

---

## 🧪 Testes Automatizados

```bash
cd backend
npm test
```

Os testes usam o runner nativo do Node (`node:test`), sobem o app numa porta aleatória e usam um banco **em memória**, sem tocar no `database.db`. O que é coberto:

| Grupo | O que é verificado |
|---|---|
| **Arquivos estáticos** | Páginas servidas; `database.db`, código e *dotfiles* bloqueados (inclusive com URL codificada); headers do Helmet |
| **Agendamentos** | Criação com token, código e link do WhatsApp; horário ocupado (`409`); **5 reservas simultâneas → só 1 vence**; validações (campos, data passada ou inexistente, fim de semana, horário fora da grade, horário de hoje que já passou, e-mail, telefone sem DDD); JSON malformado |
| **Cancelamento por e-mail** | GET não cancela e informa `podeCancelar`; POST cancela e libera o horário; consulta que já aconteceu não pode ser cancelada pelo paciente; cancelamento repetido (`409`); token inválido ou inexistente |
| **Pré-avaliação** | Salva sem devolver os dados de saúde; rejeita corpo vazio, array e mais de 200 campos |
| **Painel** | `401` sem login; cadastro inicial (uma única vez); hash scrypt; login sem diferenciar maiúsculas e erro genérico; filtros; SQL injection; cadastro manual; cancelamento por id com auditoria; resumo; cadastro e remoção de admins (a sessão do removido cai); logout |
| **WhatsApp** | Busca por código (aceita minúsculas e espaços); cancelamento por código libera o horário; exige login |
| **Migração** | Banco no schema antigo é atualizado sem perder dados |

Para testar manualmente, os exemplos `curl` acima continuam válidos. O fluxo completo pelo navegador (agendar → código → cancelar pelo WhatsApp no painel) também foi verificado.

---

## 📝 Histórico de Mudanças (v2.0)

- **Novo:** painel administrativo com login, cadastro de administradores, agenda filtrável, cadastro manual de consultas e leitura de pré-avaliações.
- **Novo:** cancelamento de consultas via WhatsApp (código + links `wa.me`).
- **Novo:** testes automatizados (`npm test`).
- **Correção de segurança:** o `database.db` podia ser baixado em `/backend/database.db`.
- **Correção de segurança:** as listagens públicas de pacientes e pré-avaliações foram removidas e agora exigem login.
- **Correção:** dois pacientes podiam reservar o mesmo horário.
- **Correção:** o backend aceitava fins de semana, horários fora da grade e horários de hoje que já tinham passado.
- **Correção:** o paciente conseguia "cancelar" uma consulta que já tinha acontecido. Agora só o administrador pode.
- **Correção:** a confirmação dizia que o e-mail tinha sido enviado mesmo quando o envio falhava.
- **Melhoria:** no celular, a tabela do painel vira uma lista de cartões, sem rolagem lateral.
- **Correção:** se o CDN do EmailJS não carregasse, as páginas de agendamento e pré-avaliação paravam de funcionar.
- **Correção:** abrir o link de cancelamento com `GET` já cancelava; agora o cancelamento só acontece com `POST`, depois da confirmação.
- **Refatoração:** `server.js` dividido em `app.js`, `config.js`, `auth.js`, `utils.js`, `services/` e `routes/`, com `async/await`.
- **Refatoração:** `api.js` usa a mesma origem quando o site é servido pelo backend, o que facilita o deploy.

---

## 👥 Equipe

Projeto acadêmico — Disciplina de **DESENVOLVIMENTO WEB** (6º período).

| Membro | Matrícula |
|---|---|
| Andrey Campos | 06009553 |
| Gustavo Ramos | 06009333 |
| Cristiano Cordeiro | 06010709 |
| Nathan Salles Ramos | 06009233 |
| Julia Scarpi | 06006846 |

---

<div align="center">

**Consultório Ramos** · *Endocrinologia, Metabologia e Menopausa*

**Projeto educacional — sem fins comerciais.**

</div>
