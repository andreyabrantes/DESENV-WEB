<div align="center">

# 🌿 Consultório Ramos

**Site institucional** moderno e responsivo para a **Dra. Fernanda Ramos** — especialista em **Endocrinologia, Metabologia e Menopausa**.

`HTML5` · `CSS3` · `JavaScript` · `Node.js` · `Express` · `SQLite` · `EmailJS`

![Status](https://img.shields.io/badge/status-conclu%C3%ADdo-brightgreen)
![Projeto](https://img.shields.io/badge/projeto-acad%C3%AAmico-blue)
![Licen%C3%A7a](https://img.shields.io/badge/licen%C3%A7a-MIT-lightgrey)

</div>

---

## 📑 Sumário

- [🌿 Consultório Ramos](#-consultório-ramos)
  - [📑 Sumário](#-sumário)
  - [🌟 Sobre o Projeto](#-sobre-o-projeto)
  - [🎓 Contexto Educacional](#-contexto-educacional)
  - [✨ Funcionalidades](#-funcionalidades)
    - [🖥️ Front-end](#️-front-end)
    - [⚙️ Back-end (API)](#️-back-end-api)
  - [🛠️ Tecnologias](#️-tecnologias)
  - [🗂️ Estrutura de Arquivos](#️-estrutura-de-arquivos)
  - [📄 Páginas](#-páginas)
    - [🏠 `index.html` — Início](#-indexhtml--início)
    - [👩‍⚕️ `sobre.html` — Sobre](#️-sobrehtml--sobre)
    - [📅 `agendar.html` — Agendar Consulta](#-agendarhtml--agendar-consulta)
    - [❌ `cancelar.html` — Cancelar Consulta](#-cancelarhtml--cancelar-consulta)
    - [📋 `pre-avaliacao.html` — Pré-Avaliação](#-pre-avaliacaohtml--pré-avaliação)
  - [🎨 Identidade Visual](#-identidade-visual)
    - [Paleta de Cores](#paleta-de-cores)
    - [Tipografia](#tipografia)
  - [✨ Animações e Efeitos](#-animações-e-efeitos)
  - [📱 Responsividade](#-responsividade)
  - [📧 Integração EmailJS](#-integração-emailjs)
  - [⚙️ Backend (API REST)](#️-backend-api-rest)
    - [▶️ Como rodar](#️-como-rodar)
    - [🗄️ Modelo de Dados](#️-modelo-de-dados)
  - [🔌 Referência da API](#-referência-da-api)
    - [📋 Resumo dos Endpoints](#-resumo-dos-endpoints)
    - [1️⃣ `POST /api/agendamentos`](#1️⃣-post-apiagendamentos)
    - [2️⃣ `GET /api/agendamentos`](#2️⃣-get-apiagendamentos)
    - [3️⃣ `POST /api/pre-avaliacao`](#3️⃣-post-apipre-avaliacao)
    - [4️⃣ `GET /api/pre-avaliacao`](#4️⃣-get-apipre-avaliacao)
    - [5️⃣ `GET /api/horarios-ocupados`](#5️⃣-get-apihorarios-ocupados)
    - [6️⃣ `GET /api/cancelar/:token`](#6️⃣-get-apicancelartoken)
    - [❌ Respostas de Erro Gerais](#-respostas-de-erro-gerais)
    - [🌍 Variáveis de ambiente](#-variáveis-de-ambiente)
  - [🔒 Segurança](#-segurança)
  - [🚀 Como Usar](#-como-usar)
  - [🧪 Testes Manuais da API](#-testes-manuais-da-api)
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
- 📅 **Agendamento** com calendário interativo (bloqueia fins de semana e datas passadas), grade de horários e formulário.
- ❌ **Cancelamento** de consulta via link enviado por e-mail, com página de confirmação dedicada.
- 📋 **Pré-avaliação** em formulário multi-etapas com barra de progresso animada.
- 📧 **Envio de e-mails** de confirmação, cancelamento e de pré-avaliação via EmailJS.
- 📱 **Layout responsivo** com menu hamburger e tipografia fluida.

### ⚙️ Back-end (API)

- 🔌 **REST API** em Express com rotas para agendamentos, pré-avaliações, disponibilidade de horários e **cancelamento**.
- 🗄️ **Persistência** em SQLite com criação automática de tabelas e migração de colunas.
- 🛡️ **Segurança**: Helmet (CSP ajustada), rate limiting, CORS configurável e validação de entrada.
- 🌐 **Serve o front-end** (`express.static`) para que os links de cancelamento enviados por e-mail usem URLs `http://` clicáveis.
- 📦 **Zero build**: nenhuma etapa de compilação necessária.

---

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
├── style.css                # 🎨 Estilos globais, navbar, hero e componentes compartilhados
│
├── sobre.html               # 👩‍⚕️ Página "Sobre" — bio da Dra. Fernanda Ramos
├── sobre.css                # 🎨 Estilos específicos da página Sobre
│
├── agendar.html             # 📅 Página de agendamento de consultas
├── agendar.css              # 🎨 Estilos específicos da página Agendar
│
├── cancelar.html            # ❌ Página de cancelamento (acessada pelo link do e-mail)
│
├── pre-avaliacao.html       # 📋 Página de pré-avaliação (formulário multi-etapas)
├── pre-avaliacao.css        # 🎨 Estilos específicos da página Pré-Avaliação
│
├── api.js                   # 🔌 Helpers de integração com o backend (fetch)
│
├── backend/                 # ⚙️ API Node.js + Express + SQLite
│   ├── server.js            #   Rotas REST + middlewares de segurança + static do front
│   ├── database.js          #   Conexão, schema e migração do SQLite
│   ├── email-template.html  #   Template HTML de referência para o EmailJS
│   ├── package.json         #   Dependências e scripts
│   └── database.db          #   Banco local (ignorado pelo Git)
│
├── DEV-FRONT-END/           # 📦 Versão isolada da landing page (entrega parcial)
│   ├── index.html
│   ├── style.css
│   ├── script.js
│   └── README.md
│
└── README.md                # 📖 Documentação do projeto
```

---

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

Página acessada pelo **link de cancelamento** enviado no e-mail de confirmação. Recebe o token via query string (`cancelar.html?token=...`) e permite ao paciente liberar o horário reservado.

| Seção | Descrição |
|---|---|
| **Hero** | Título e instrução de confirmação |
| **Detalhes** | Resumo do agendamento carregado a partir do token |
| **Confirmação** | Botão "Confirmar cancelamento" que chama `GET /api/cancelar/:token` |
| **Feedback** | Mensagem de sucesso (horário liberado) ou de erro (token inválido/já cancelado) |

**Fluxo:**

1. O paciente clica em **"✕ Cancelar consulta"** no e-mail.
2. A página abre com o token na URL e exibe o botão de confirmação.
3. Ao confirmar, o backend marca o agendamento como `cancelado` e o horário volta a ficar disponível.

> ℹ️ A seção usa a classe `visible` diretamente no HTML (sem depender de *scroll reveal*), garantindo que o card de confirmação apareça imediatamente.

### 📋 `pre-avaliacao.html` — Pré-Avaliação

Formulário multi-etapas com barra de progresso animada.

| Etapa | Campos |
|---|---|
| **1 — Dados Pessoais** | Nome, data de nascimento, CPF, sexo, telefone, e-mail, peso, altura, convênio |
| **2 — Saúde Geral** | Motivo da consulta, doenças diagnosticadas, alergias, medicamentos, histórico familiar |
| **3 — Estilo de Vida** | Atividade física, alimentação, nível de estresse (slider), sono, tabagismo, observações |

Ao enviar, os dados são persistidos no banco (via API) e um e-mail formatado é disparado para o consultório via **EmailJS**.

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

API local em **Node.js + Express + SQLite** que persiste agendamentos e pré-avaliações.

### ▶️ Como rodar

```bash
cd backend
npm install
npm start        # inicia em http://localhost:3000
# ou npm run dev  # reinicia automaticamente a cada alteração
```

### 🗄️ Modelo de Dados

**Tabela `agendamentos`**

| Coluna | Tipo | Restrições |
|---|---|---|
| `id` | INTEGER | PK, AUTOINCREMENT |
| `nomeCliente` | TEXT | NOT NULL |
| `servico` | TEXT | NOT NULL |
| `data` | TEXT | NOT NULL (`YYYY-MM-DD`) |
| `horario` | TEXT | NOT NULL (`HH:MM`) |
| `email` | TEXT | opcional |
| `telefone` | TEXT | opcional |
| `observacoes` | TEXT | opcional |
| `token` | TEXT | UNIQUE — token de cancelamento (48 hex) |
| `status` | TEXT | NOT NULL, DEFAULT `'ativo'` (`ativo` \| `cancelado`) |
| `criadoEm` | DATETIME | DEFAULT `CURRENT_TIMESTAMP` |

**Tabela `pre_avaliacoes`**

| Coluna | Tipo | Restrições |
|---|---|---|
| `id` | INTEGER | PK, AUTOINCREMENT |
| `respostas` | TEXT | NOT NULL (JSON serializado) |
| `criadoEm` | DATETIME | DEFAULT `CURRENT_TIMESTAMP` |

> 🔁 O `database.js` executa uma **migração idempotente** que adiciona as colunas `email`, `telefone`, `observacoes`, `token` e `status` caso o banco tenha sido criado com um schema anterior.

---

## 🔌 Referência da API

**Base URL:** `http://localhost:3000`

Todas as rotas estão sob o prefixo `/api/` e sujeitas ao **rate limit** de 100 requisições por IP a cada 15 minutos.

### 📋 Resumo dos Endpoints

| Método | Rota | Descrição | Status de sucesso |
|---|---|---|---|
| `POST` | `/api/agendamentos` | Cria um agendamento | `201 Created` |
| `GET` | `/api/agendamentos` | Lista agendamentos (ordenados por data/hora) | `200 OK` |
| `POST` | `/api/pre-avaliacao` | Salva uma pré-avaliação | `201 Created` |
| `GET` | `/api/pre-avaliacao` | Lista pré-avaliações (mais recentes primeiro) | `200 OK` |
| `GET` | `/api/horarios-ocupados?data=YYYY-MM-DD` | Lista horários já ocupados em uma data | `200 OK` |
| `GET` | `/api/cancelar/:token` | Cancela um agendamento e libera o horário | `200 OK` |

---

### 1️⃣ `POST /api/agendamentos`

Cria um novo agendamento. Valida campos obrigatórios, formato de data/horário, e-mail e rejeita datas no passado.

**Corpo da requisição:**

| Campo | Tipo | Obrigatório | Limite | Descrição |
|---|---|---|---|---|
| `nomeCliente` | string | ✅ | 120 | Nome do paciente |
| `servico` | string | ✅ | 60 | Tipo de consulta |
| `data` | string | ✅ | — | Formato `YYYY-MM-DD`, não pode ser passada |
| `horario` | string | ✅ | — | Formato `HH:MM` |
| `email` | string | ❌ | 254 | Deve ser um e-mail válido se informado |
| `telefone` | string | ❌ | 20 | Telefone de contato |
| `observacoes` | string | ❌ | 500 | Observações livres |

**Exemplo:**

```bash
curl -X POST http://localhost:3000/api/agendamentos \
  -H "Content-Type: application/json" \
  -d '{
    "nomeCliente": "Maria Silva",
    "servico": "Primeira consulta",
    "data": "2026-12-15",
    "horario": "10:00",
    "email": "maria@email.com",
    "telefone": "(11) 99999-9999",
    "observacoes": "Preferência pelo período da manhã."
  }'
```

**Resposta `201 Created`:**

```json
{
  "id": 1,
  "nomeCliente": "Maria Silva",
  "servico": "Primeira consulta",
  "data": "2026-12-15",
  "horario": "10:00",
  "email": "maria@email.com",
  "telefone": "(11) 99999-9999",
  "observacoes": "Preferência pelo período da manhã.",
  "token": "a1b2c3d4e5f6...48 caracteres hexadecimais",
  "status": "ativo",
  "criadoEm": "2026-09-17T22:31:34.502Z"
}
```

> 🔑 O campo `token` é gerado no servidor (`crypto.randomBytes(24)`) e usado no **link de cancelamento** enviado por e-mail. Ele é único e imprevisível, funcionando como uma credencial de cancelamento.

**Resposta `400 Bad Request` (validação):**

```json
{
  "error": "Validação falhou",
  "detalhes": [
    "nomeCliente é obrigatório",
    "servico é obrigatório",
    "data não pode estar no passado",
    "email inválido"
  ]
}
```

---

### 2️⃣ `GET /api/agendamentos`

Lista todos os agendamentos, ordenados por `data` e `horario` (crescente).

**Exemplo:**

```bash
curl http://localhost:3000/api/agendamentos
```

**Resposta `200 OK`:**

```json
[
  {
    "id": 1,
    "nomeCliente": "Maria Silva",
    "servico": "Primeira consulta",
    "data": "2026-12-15",
    "horario": "10:00",
    "email": "maria@email.com",
    "telefone": "(11) 99999-9999",
    "observacoes": "Preferência pelo período da manhã.",
    "criadoEm": "2026-09-17 22:31:34"
  }
]
```

---

### 3️⃣ `POST /api/pre-avaliacao`

Salva o formulário completo de pré-avaliação. O corpo é um **objeto JSON livre** (as respostas são serializadas e armazenadas na coluna `respostas`).

**Regras:**

- O corpo deve ser um objeto JSON **não vazio** (arrays são rejeitados).
- Máximo de **200 campos** por payload.

**Exemplo:**

```bash
curl -X POST http://localhost:3000/api/pre-avaliacao \
  -H "Content-Type: application/json" \
  -d '{
    "nomeCompleto": "Maria Silva",
    "email": "maria@email.com",
    "motivo": "Consulta de rotina",
    "nivelEstresse": "5"
  }'
```

**Resposta `201 Created`:**

```json
{
  "id": 1,
  "respostas": {
    "nomeCompleto": "Maria Silva",
    "email": "maria@email.com",
    "motivo": "Consulta de rotina",
    "nivelEstresse": "5"
  },
  "criadoEm": "2026-09-17T22:31:43.977Z"
}
```

**Resposta `400 Bad Request`:**

```json
{ "error": "É necessário enviar um objeto JSON com as respostas" }
```

---

### 4️⃣ `GET /api/pre-avaliacao`

Lista as pré-avaliações salvas, ordenadas por `criadoEm` e `id` (decrescente). O campo `respostas` é **convertido de volta para objeto** automaticamente.

**Exemplo:**

```bash
curl http://localhost:3000/api/pre-avaliacao
```

**Resposta `200 OK`:**

```json
[
  {
    "id": 1,
    "respostas": {
      "nomeCompleto": "Maria Silva",
      "email": "maria@email.com",
      "motivo": "Consulta de rotina",
      "nivelEstresse": "5"
    },
    "criadoEm": "2026-09-17 22:31:43"
  }
]
```

---

### 5️⃣ `GET /api/horarios-ocupados`

Retorna os horários já ocupados em uma data específica — usado pelo calendário de agendamento para desabilitar slots indisponíveis.

**Query params:**

| Parâmetro | Obrigatório | Descrição |
|---|---|---|
| `data` | ✅ | Data no formato `YYYY-MM-DD` |

**Exemplo:**

```bash
curl "http://localhost:3000/api/horarios-ocupados?data=2026-12-15"
```

**Resposta `200 OK`:**

```json
{
  "data": "2026-12-15",
  "ocupados": ["10:00"]
}
```

**Resposta `400 Bad Request` (parâmetro ausente/inválido):**

```json
{ "error": "Parâmetro data é obrigatório (formato YYYY-MM-DD)" }
```

> ℹ️ Apenas agendamentos com `status = "ativo"` ocupam o horário. Agendamentos cancelados **não** aparecem nesta lista, ou seja, o horário volta a ficar disponível automaticamente após o cancelamento.

---

### 6️⃣ `GET /api/cancelar/:token`

Cancela um agendamento a partir do **token único** enviado no link do e-mail de confirmação. Ao cancelar, o `status` passa de `ativo` para `cancelado` e o horário é **liberado imediatamente** para novos agendamentos.

**Path params:**

| Parâmetro | Obrigatório | Descrição |
|---|---|---|
| `token` | ✅ | Token de 48 caracteres hexadecimais gerado no momento do agendamento |

**Exemplo:**

```bash
curl "http://localhost:3000/api/cancelar/a1b2c3d4e5f6..."
```

**Resposta `200 OK`:**

```json
{
  "mensagem": "Agendamento cancelado com sucesso. O horário foi liberado.",
  "agendamento": {
    "id": 1,
    "nomeCliente": "Maria Silva",
    "servico": "Primeira consulta",
    "data": "2026-12-15",
    "horario": "10:00",
    "status": "cancelado"
  }
}
```

**Respostas de erro:**

| Status | Corpo | Quando ocorre |
|---|---|---|
| `400` | `{ "error": "Token de cancelamento inválido" }` | Token com formato inválido |
| `404` | `{ "error": "Agendamento não encontrado" }` | Token inexistente |
| `409` | `{ "error": "Este agendamento já foi cancelado", ... }` | Cancelamento repetido |

> 🔗 **Fluxo completo:** o front-end (`agendar.html`) recebe o `token` na resposta do `POST /api/agendamentos` e o injeta na variável `{{cancel_link}}` do template do EmailJS. O e-mail leva o paciente à página `cancelar.html?token=...`, que chama esta rota após a confirmação.

---

### ❌ Respostas de Erro Gerais

| Status | Corpo | Quando ocorre |
|---|---|---|
| `400` | `{ "error": "...", "detalhes": [...] }` | Falha de validação de entrada |
| `404` | `{ "error": "Rota não encontrada" }` | Rota inexistente |
| `429` | `{ "error": "Muitas requisições. Tente novamente mais tarde." }` | Rate limit excedido |
| `500` | `{ "error": "Erro ao ..." }` | Falha interna (ex.: erro no banco) |

---

### 🌍 Variáveis de ambiente

| Variável | Padrão | Descrição |
|---|---|---|
| `PORT` | `3000` | Porta em que o servidor escuta |
| `ALLOWED_ORIGINS` | *(vazio)* | Lista de origens CORS permitidas, separadas por vírgula |

---

## 🔒 Segurança

| Medida | Onde | Descrição |
|---|---|---|
| **Helmet** | `server.js` | Headers HTTP de segurança (`X-Content-Type-Options`, `X-Frame-Options`, CSP, etc.) |
| **CSP ajustada** | `server.js` | `script-src-attr 'unsafe-inline'` (handlers inline) e `upgrade-insecure-requests` desativado para funcionar em `http://localhost` |
| **`x-powered-by` desativado** | `server.js` | Remove o header que expõe o uso do Express |
| **Rate limiting** | `server.js` | Limite de 100 requisições por IP a cada 15 min nas rotas `/api/*` |
| **CORS configurável** | `server.js` | Allowlist via `ALLOWED_ORIGINS`; sem a variável, permite apenas `localhost`/`127.0.0.1` e `file://` |
| **Limite de corpo** | `server.js` | Corpo JSON limitado a 100 KB |
| **Validação de entrada** | `server.js` | Tamanho máximo e formato de data/horário/e-mail validados no servidor |
| **Token de cancelamento** | `server.js` | Token de 48 hex (`crypto.randomBytes(24)`) validado por regex antes da consulta |
| **Limite de campos** | `server.js` | Pré-avaliação aceita no máximo 200 campos |
| **Queries parametrizadas** | `server.js` | Previne injeção de SQL |
| **Escape de saída** | `agendar.html`, `pre-avaliacao.html`, `cancelar.html` | Dados do usuário renderizados via `textContent`/DOM (evita XSS) |
| **No-cache (dev)** | `server.js` | HTML/CSS/JS servidos com `Cache-Control: no-store` para evitar versões antigas em cache |

> 🌐 **CORS em produção:** defina a variável de ambiente `ALLOWED_ORIGINS` com os domínios permitidos:
>
> ```bash
> ALLOWED_ORIGINS="https://meudominio.com,https://www.meudominio.com" npm start
> ```

> ⚠️ **Limitações conhecidas (contexto educacional):** não há autenticação/autorização, as rotas `GET` são públicas e as credenciais do EmailJS ficam expostas no cliente. Em um cenário real, seria necessário adicionar autenticação, um proxy para o EmailJS e um painel administrativo protegido.

---

## 🚀 Como Usar

O front-end **não requer instalação nem build**. Há duas formas de executá-lo:

**Opção A — Abrir direto no navegador (sem backend):**

```bash
# 1. Clone o repositório
git clone https://github.com/andreyabrantes/front-6periodo.git
cd front-6periodo

# 2. Abra o site no navegador
open index.html
# ou arraste o arquivo para o navegador
```

**Opção B — Servir tudo pelo backend (recomendado):**

```bash
cd backend
npm install
npm start        # http://localhost:3000
```

Com o backend rodando, acesse `http://localhost:3000/index.html`. O Express serve o front-end via `express.static`, o que garante que os **links de cancelamento enviados por e-mail** usem URLs `http://` clicáveis (links `file://` são bloqueados por clientes de e-mail).

> 💡 **Dica:** para que o agendamento, o cancelamento e a pré-avaliação persistam dados, o backend precisa estar rodando em `http://localhost:3000`. Sem ele, o front-end ainda funciona, mas o envio falhará na etapa de persistência.

---

## 🧪 Testes Manuais da API

Com o backend rodando, valide as rotas rapidamente:

```bash
# 1. Criar agendamento (espera 201)
curl -X POST http://localhost:3000/api/agendamentos \
  -H "Content-Type: application/json" \
  -d '{"nomeCliente":"Teste","servico":"Retorno","data":"2026-12-20","horario":"09:00"}'

# 2. Listar agendamentos (espera 200)
curl http://localhost:3000/api/agendamentos

# 3. Consultar horários ocupados (espera 200)
curl "http://localhost:3000/api/horarios-ocupados?data=2026-12-20"

# 4. Salvar pré-avaliação (espera 201)
curl -X POST http://localhost:3000/api/pre-avaliacao \
  -H "Content-Type: application/json" \
  -d '{"nomeCompleto":"Teste","motivo":"Rotina"}'

# 5. Listar pré-avaliações (espera 200)
curl http://localhost:3000/api/pre-avaliacao

# 6. Testar validação (espera 400)
curl -X POST http://localhost:3000/api/agendamentos \
  -H "Content-Type: application/json" \
  -d '{"nomeCliente":"","servico":"","data":"2020-01-01","horario":"99:99"}'

# 7. Testar rota inexistente (espera 404)
curl http://localhost:3000/api/rota-inexistente
```

**Testando o fluxo de cancelamento:**

```bash
# 1. Crie um agendamento e copie o "token" da resposta
curl -X POST http://localhost:3000/api/agendamentos \
  -H "Content-Type: application/json" \
  -d '{"nomeCliente":"Teste Cancel","servico":"Retorno","data":"2026-12-22","horario":"14:00"}'

# 2. Confirme que o horário está ocupado (espera conter "14:00")
curl "http://localhost:3000/api/horarios-ocupados?data=2026-12-22"

# 3. Cancele usando o token (espera 200 + "horário foi liberado")
curl "http://localhost:3000/api/cancelar/SEU_TOKEN_AQUI"

# 4. Confirme que o horário foi liberado (espera lista vazia)
curl "http://localhost:3000/api/horarios-ocupados?data=2026-12-22"

# 5. Repita o cancelamento (espera 409 — já cancelado)
curl "http://localhost:3000/api/cancelar/SEU_TOKEN_AQUI"
```

> ✅ Todas as rotas acima foram **validadas manualmente** durante o desenvolvimento deste README.

---

## 👥 Equipe

Projeto acadêmico — Disciplina de **Engenharia de Software** (6º período).

| Membro | Matrícula |
|---|---|
| Andrey Campos | 06009553 |
| Gustavo Ramos | 06009333 |
| Cristiano Cordeiro | 06010709 |
| Nathan Salles Ramos | 06009233 |
| Julia Scarpi | 06006846 |

---

<div align="center">

Feito com 💜 para o **Consultório Ramos** · *Endocrinologia, Metabologia e Menopausa*

**Projeto educacional — sem fins comerciais.**

</div>
