# 🚗 Valle Leads System — Backend

<div align="center">

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)

**Sistema de Gestão de Leads com Dashboard Analítico — 1000 Valle Multimarcas**
ABP 2026-1 · 3DSM · FATEC Jacareí

> Documentação do servidor (pasta `/server`) — [Ver repositório completo](https://github.com/Helloworld-fatec/valle-leads-system)

</div>

---

## 📖 Sobre o Backend

O servidor do Valle Leads System é responsável por toda a lógica de negócio do sistema de gestão de leads da **1000 Valle Multimarcas**, uma revendedora de veículos com múltiplas unidades.

Após o registro de um lead, o sistema:

1. Associa o cliente ao lead;
2. Vincula o lead a uma loja e a um atendente responsável;
3. Permite a evolução da negociação;
4. Registra mudanças de estágio e status da negociação;
5. Disponibiliza indicadores consolidados para fins gerenciais.

### Padrão Arquitetural

A API segue o padrão **Controller → Service → Repository** (RNF11 / RNF12), com baixo acoplamento e alta coesão entre as camadas:

```
Requisição HTTP
     ↓
  Controller     ← valida input (Zod) e chama o Service       [Camada de Apresentação]
     ↓
   Service       ← aplica regras de negócio                   [Camada de Aplicação]
     ↓
 Repository      ← acessa o banco via Prisma                  [Camada de Acesso a Dados]
     ↓
  PostgreSQL                                                   [Camada de Domínio]
```

Todas as regras de autorização são aplicadas **exclusivamente no backend** (RNF02 / RP01). Controle de acesso implementado apenas no frontend não é aceito pelo projeto.

### Linguagem e Runtime

- **Runtime:** Node.js com TypeScript (RP01)
- **Estilo de API:** REST com JSON (RNF01)

---

## 🛠️ Tecnologias Utilizadas

| Tecnologia | Uso | Docs |
|---|---|---|
| ![Node](https://img.shields.io/badge/Node.js-339933?style=flat&logo=nodedotjs&logoColor=white) | Runtime do servidor | [nodejs.org](https://nodejs.org) |
| ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white) | Tipagem estática | [typescriptlang.org](https://www.typescriptlang.org) |
| ![Express](https://img.shields.io/badge/Express-000000?style=flat&logo=express&logoColor=white) | Framework HTTP | [expressjs.com](https://expressjs.com) |
| ![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=flat&logo=prisma&logoColor=white) | ORM + migrations (DDL/DML) | [prisma.io](https://www.prisma.io) |
| ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat&logo=postgresql&logoColor=white) | Banco de dados relacional | [postgresql.org](https://www.postgresql.org) |
| ![Zod](https://img.shields.io/badge/Zod-3E67B1?style=flat&logo=zod&logoColor=white) | Validação de schemas e inputs | [zod.dev](https://zod.dev) |
| ![JWT](https://img.shields.io/badge/JWT-000000?style=flat&logo=jsonwebtokens&logoColor=white) | Autenticação stateless | [jwt.io](https://jwt.io) |
| ![bcrypt](https://img.shields.io/badge/bcryptjs-grey?style=flat) | Hash seguro de senhas (RNF02) | [npm](https://www.npmjs.com/package/bcryptjs) |
| ![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white) | Conteinerização (RNF07 / RP02) | [docker.com](https://www.docker.com) |

---

## 👥 Equipe

| Nome | Papel |
|---|---|
| Bruno Berval | Product Owner (PO) |
| Nicolas Kauê | Scrum Master (SM) |
| Bruna Rodrigues | Dev Team |
| Pedro Enrique | Dev Team |
| Ryan Tinel | Dev Team |
| Suelen Castro | Dev Team |

---

## 🚀 Como Rodar o Projeto

> A aplicação completa é executada exclusivamente via containers Docker (RP02).

### Pré-requisitos

- [Docker](https://www.docker.com) e Docker Compose
- [Git](https://git-scm.com)
- [Node.js](https://nodejs.org) — apenas para desenvolvimento local sem Docker

### Passo a passo

**1. Clone o repositório**
```bash
git clone https://github.com/Helloworld-fatec/valle-leads-system.git
cd valle-leads-system/server
```

**2. Instale as dependências**
```bash
npm install
```

**3. Configure as variáveis de ambiente**
```bash
cp .env.example .env
# Edite o arquivo .env com suas configurações locais
```

**4. Suba todos os containers**
```bash
docker compose up -d
```

Isso sobe os três containers obrigatórios (RNF07): **PostgreSQL**, **Backend** e **Frontend**.

**5. Rode as migrations**
```bash
npx prisma migrate dev
# ou dentro do container:
docker compose exec backend npx prisma migrate dev
```

**6. Inicie o servidor em modo desenvolvimento**
```bash
npm run dev
```

O servidor estará disponível em `http://localhost:3000`.

---

## 📁 Estrutura de Pastas

A estrutura segue o padrão **modular por entidade**, com pastas em **kebab-case** e arquivos em **camelCase.tipo.ts** (conforme guia de padrões do projeto).

```
server/
├── src/
│   ├── modules/                    # Um módulo por entidade do sistema (RNF01)
│   │   ├── auth/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.repository.ts
│   │   │   └── auth.routes.ts
│   │   ├── users/
│   │   │   ├── user.controller.ts
│   │   │   ├── user.service.ts
│   │   │   ├── user.repository.ts
│   │   │   └── user.routes.ts
│   │   ├── leads/
│   │   │   ├── lead.controller.ts
│   │   │   ├── lead.service.ts
│   │   │   ├── lead.repository.ts
│   │   │   └── lead.routes.ts
│   │   ├── negotiations/
│   │   │   ├── negotiation.controller.ts
│   │   │   ├── negotiation.service.ts
│   │   │   ├── negotiation.repository.ts
│   │   │   └── negotiation.routes.ts
│   │   ├── customers/
│   │   │   ├── customer.controller.ts
│   │   │   ├── customer.service.ts
│   │   │   ├── customer.repository.ts
│   │   │   └── customer.routes.ts
│   │   ├── teams/
│   │   │   ├── team.controller.ts
│   │   │   ├── team.service.ts
│   │   │   ├── team.repository.ts
│   │   │   └── team.routes.ts
│   │   ├── stores/
│   │   │   ├── store.controller.ts
│   │   │   ├── store.service.ts
│   │   │   ├── store.repository.ts
│   │   │   └── store.routes.ts
│   │   ├── dashboard/
│   │   │   ├── dashboard.controller.ts
│   │   │   ├── dashboard.service.ts
│   │   │   └── dashboard.routes.ts
│   │   └── logs/
│   │       ├── log.controller.ts
│   │       ├── log.service.ts
│   │       ├── log.repository.ts
│   │       └── log.routes.ts
│   ├── middlewares/
│   │   ├── auth.middleware.ts      # Verificação do JWT (RNF02)
│   │   └── rbac.middleware.ts      # Controle de acesso por role — RBAC (RF02)
│   ├── utils/
│   │   ├── appError.utils.ts       # Tratamento de exceções (RNF05)
│   │   └── logger.utils.ts         # Utilitário de log
│   ├── types/
│   │   └── express.types.ts        # Extensões de tipos globais
│   └── app.ts                      # Configuração do Express
├── prisma/
│   └── schema.prisma               # Schema com DDL e relações obrigatórias (RP03)
├── .env.example
├── tsconfig.json
├── docker-compose.yml
└── package.json
```

---

## 🧩 Módulos do Sistema

### 🔐 Auth
**Descrição:** Gerencia autenticação e sessão dos usuários.
**Responsabilidade:** Geração de token JWT contendo id do usuário, role e tempo de expiração. Login, logout e recuperação de senha por e-mail. (RF01)
**Entidades:** `users`
**Pasta:** `src/modules/auth/`

---

### 👤 Users
**Descrição:** CRUD completo de usuários do sistema.
**Responsabilidade:** Criação, edição, listagem e desativação (soft delete) de usuários com perfis: Atendente, Gerente, Gerente Geral e Administrador. Todos os usuários podem atualizar seu próprio e-mail e senha. (RF01 / RF02)
**Entidades:** `users`
**Pasta:** `src/modules/users/`

---

### 👥 Teams
**Descrição:** Gerenciamento de equipes de vendas.
**Responsabilidade:** Criação de equipes, vinculação de atendentes e gerentes. Suporte ao isolamento de dados por equipe (multi-tenant). (RF02)
**Entidades:** `teams`, `users`
**Pasta:** `src/modules/teams/`

---

### 🏪 Stores
**Descrição:** Gerenciamento das lojas/unidades da revenda.
**Responsabilidade:** Cadastro e listagem das unidades físicas da 1000 Valle Multimarcas. Leads são vinculados à loja no momento do registro. (RF04)
**Entidades:** `stores`
**Pasta:** `src/modules/stores/`

---

### 🙍 Customers
**Descrição:** Cadastro e gestão de clientes/prospects.
**Responsabilidade:** Criação, busca por CPF/nome/telefone e edição de dados de clientes captados pelos diferentes canais de entrada. (RF02)
**Entidades:** `customers`
**Pasta:** `src/modules/customers/`

---

### 📋 Leads
**Descrição:** Núcleo do sistema — registros de interesse de compra.
**Responsabilidade:** Criação, listagem com filtros, edição, transferência entre atendentes e histórico de mudanças. Cada lead é vinculado a uma loja, um atendente e um cliente. (RF02 / RF04 / RF06)
**Canais de captação:** visita presencial, telefone, WhatsApp, Instagram, formulários digitais e outros.
**Entidades:** `leads`, `customers`, `users`, `stores`
**Pasta:** `src/modules/leads/`

---

### 🤝 Negotiations
**Descrição:** Funil de negociações vinculado aos leads.
**Responsabilidade:** Cada lead pode ter no máximo uma negociação ativa. Controla importância (frio/morno/quente), estágio, status (aberta/encerrada) e motivo de finalização. Mantém histórico completo de mudanças. Alimenta os dashboards operacional e analítico. (RF03 / RF04 / RF05)
**Entidades:** `negotiations`, `negotiation_stage_history`
**Pasta:** `src/modules/negotiations/`

---

### 📊 Dashboard
**Descrição:** Indicadores operacionais e analíticos.
**Responsabilidade:** Consolida dados de leads e negociações para exibição em painéis gerenciais. Dashboard operacional acessível a atendentes; analítico restrito a gerentes e acima. (RF04 / RF05)
**Pasta:** `src/modules/dashboard/`

---

### 📜 Logs
**Descrição:** Auditoria e rastreabilidade de operações.
**Responsabilidade:** Registra login de usuários e todas as operações de criação, atualização e exclusão de clientes, usuários, times, leads e negociações — armazenando data, hora e usuário responsável. Acesso exclusivo do Administrador. (RF07)
**Entidades:** `system_logs`
**Pasta:** `src/modules/logs/`

---

## 🌐 Rotas da API

> Base URL: `http://localhost:3000/api`
> Rotas protegidas exigem o header: `Authorization: Bearer <token>`
> Todas as validações de permissão ocorrem no backend (RNF02 / RP01).

---

### 🔐 Auth

#### `POST /auth/login`
Autentica o usuário e retorna um token JWT. (RF01)

| Campo | Valor |
|---|---|
| Autenticação | Público |

**Body:**
```json
{
  "email": "joao@valle.com.br",
  "password": "senhaSegura123"
}
```
**Response `200 OK`:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "name": "João Silva",
    "email": "joao@valle.com.br",
    "role": "attendant"
  }
}
```

---

#### `POST /auth/logout`
Encerra a sessão do usuário autenticado.

| Campo | Valor |
|---|---|
| Autenticação | Todos |

**Body:** nenhum
**Response `204 No Content`**

---

#### `POST /auth/recover`
Solicita recuperação de senha por e-mail.

| Campo | Valor |
|---|---|
| Autenticação | Público |

**Body:**
```json
{
  "email": "joao@valle.com.br"
}
```
**Response `200 OK`:**
```json
{
  "message": "Recovery email sent successfully"
}
```

---

#### `PATCH /auth/password`
Redefine a senha usando o token de recuperação.

| Campo | Valor |
|---|---|
| Autenticação | Público |

**Body:**
```json
{
  "token": "recovery-token-uuid",
  "newPassword": "novaSenhaSegura456"
}
```
**Response `200 OK`:**
```json
{
  "message": "Password updated successfully"
}
```

---

### 👤 Users

#### `GET /users`
Lista todos os usuários do sistema.

| Campo | Valor |
|---|---|
| Autenticação | Admin |

**Body:** nenhum
**Response `200 OK`:**
```json
[
  {
    "id": "uuid",
    "name": "João Silva",
    "email": "joao@valle.com.br",
    "role": "attendant",
    "isActive": true,
    "createdAt": "2026-01-01T00:00:00.000Z"
  }
]
```

---

#### `POST /users`
Cria um novo usuário.

| Campo | Valor |
|---|---|
| Autenticação | Admin |

**Body:**
```json
{
  "name": "João Silva",
  "email": "joao@valle.com.br",
  "password": "senhaSegura123",
  "role": "attendant",
  "storeId": "uuid"
}
```
**Response `201 Created`:**
```json
{
  "id": "uuid",
  "name": "João Silva",
  "email": "joao@valle.com.br",
  "role": "attendant",
  "isActive": true,
  "createdAt": "2026-01-01T00:00:00.000Z"
}
```

---

#### `GET /users/:id`
Retorna os detalhes de um usuário específico.

| Campo | Valor |
|---|---|
| Autenticação | Admin |

**Body:** nenhum
**Response `200 OK`:**
```json
{
  "id": "uuid",
  "name": "João Silva",
  "email": "joao@valle.com.br",
  "role": "attendant",
  "isActive": true,
  "store": { "id": "uuid", "name": "Valle Jacareí" },
  "createdAt": "2026-01-01T00:00:00.000Z"
}
```

---

#### `PATCH /users/:id`
Edita dados de um usuário.

| Campo | Valor |
|---|---|
| Autenticação | Admin |

**Body** (todos os campos opcionais):
```json
{
  "name": "João Silva Atualizado",
  "email": "joao.novo@valle.com.br",
  "role": "manager",
  "storeId": "uuid"
}
```
**Response `200 OK`:** objeto `user` atualizado

---

#### `DELETE /users/:id`
Desativa um usuário (soft delete — não remove do banco).

| Campo | Valor |
|---|---|
| Autenticação | Admin |

**Body:** nenhum
**Response `200 OK`:**
```json
{
  "message": "User deactivated successfully"
}
```

---

#### `GET /users/me`
Retorna o perfil do usuário autenticado.

| Campo | Valor |
|---|---|
| Autenticação | Todos |

**Body:** nenhum
**Response `200 OK`:** objeto `user` do usuário autenticado

---

#### `PATCH /users/me`
Atualiza o próprio e-mail ou senha. (RF01)

| Campo | Valor |
|---|---|
| Autenticação | Todos |

**Body** (ao menos um campo obrigatório):
```json
{
  "email": "novo@valle.com.br",
  "password": "novaSenha123"
}
```
**Response `200 OK`:** objeto `user` atualizado

---

### 📋 Leads

#### `GET /leads`
Lista leads conforme a role do usuário: atendente vê apenas os seus; gerente vê os da equipe; admin vê todos. (RF02)

| Campo | Valor |
|---|---|
| Autenticação | Atendente+ |
| Query params | `?storeId=` `?status=` `?from=` `?to=` |

**Body:** nenhum
**Response `200 OK`:**
```json
[
  {
    "id": "uuid",
    "customer": { "id": "uuid", "name": "Maria Souza" },
    "store": { "id": "uuid", "name": "Valle Jacareí" },
    "attendant": { "id": "uuid", "name": "João Silva" },
    "originChannel": "whatsapp",
    "status": "open",
    "createdAt": "2026-01-01T00:00:00.000Z"
  }
]
```

---

#### `POST /leads`
Registra um novo lead.

| Campo | Valor |
|---|---|
| Autenticação | Atendente / Admin |

**Body:**
```json
{
  "customerId": "uuid",
  "storeId": "uuid",
  "attendantId": "uuid",
  "originChannel": "whatsapp",
  "notes": "Cliente interessado em SUV"
}
```
**Response `201 Created`:** objeto `lead` criado

---

#### `GET /leads/:id`
Retorna os detalhes de um lead específico.

| Campo | Valor |
|---|---|
| Autenticação | Atendente+ |

**Body:** nenhum
**Response `200 OK`:** objeto `lead` completo com relacionamentos

---

#### `PATCH /leads/:id`
Edita dados do lead.

| Campo | Valor |
|---|---|
| Autenticação | Atendente / Admin |

**Body** (campos opcionais):
```json
{
  "originChannel": "instagram",
  "notes": "Cliente atualizou preferência para sedã"
}
```
**Response `200 OK`:** objeto `lead` atualizado

---

#### `DELETE /leads/:id`
Exclui permanentemente um lead.

| Campo | Valor |
|---|---|
| Autenticação | Admin |

**Body:** nenhum
**Response `200 OK`:**
```json
{
  "message": "Lead deleted successfully"
}
```

---

#### `POST /leads/:id/transfer`
Transfere o lead para outro atendente.

| Campo | Valor |
|---|---|
| Autenticação | Gerente / Admin |

**Body:**
```json
{
  "newAttendantId": "uuid",
  "reason": "Atendente original saiu de férias"
}
```
**Response `200 OK`:** objeto `lead` com novo atendente

---

#### `GET /leads/:id/history`
Retorna o histórico de mudanças do lead.

| Campo | Valor |
|---|---|
| Autenticação | Atendente+ |

**Body:** nenhum
**Response `200 OK`:**
```json
[
  {
    "id": "uuid",
    "field": "attendantId",
    "oldValue": "uuid-antigo",
    "newValue": "uuid-novo",
    "changedBy": { "id": "uuid", "name": "Carlos Gerente" },
    "changedAt": "2026-01-05T10:00:00.000Z"
  }
]
```

---

### 🤝 Negotiations

#### `POST /negotiations`
Cria uma negociação vinculada a um lead. Máximo de 1 ativa por lead. (RF03)

| Campo | Valor |
|---|---|
| Autenticação | Atendente / Admin |

**Body:**
```json
{
  "leadId": "uuid",
  "importance": "warm",
  "stage": "contact",
  "notes": "Cliente tem interesse em financiamento"
}
```
**Response `201 Created`:** objeto `negotiation` criado

---

#### `PATCH /negotiations/:id/stage`
Avança o estágio da negociação no funil. (RF03)

| Campo | Valor |
|---|---|
| Autenticação | Atendente / Admin |

**Body:**
```json
{
  "stage": "proposal",
  "notes": "Proposta enviada por e-mail"
}
```
**Response `200 OK`:** objeto `negotiation` atualizado

---

#### `PATCH /negotiations/:id/importance`
Altera a importância da negociação: `cold`, `warm` ou `hot`. (RF03)

| Campo | Valor |
|---|---|
| Autenticação | Atendente / Admin |

**Body:**
```json
{
  "importance": "hot"
}
```
**Response `200 OK`:** objeto `negotiation` atualizado

---

#### `PATCH /negotiations/:id/close`
Encerra a negociação com motivo obrigatório. (RF03)

| Campo | Valor |
|---|---|
| Autenticação | Atendente / Admin |

**Body:**
```json
{
  "closingReason": "sold",
  "notes": "Venda concluída — Honda HR-V"
}
```
**Response `200 OK`:** objeto `negotiation` com `status: closed`

---

#### `PATCH /negotiations/:id/reopen`
Reabre uma negociação encerrada.

| Campo | Valor |
|---|---|
| Autenticação | Gerente / Admin |

**Body:**
```json
{
  "notes": "Cliente voltou após reconsiderar a proposta"
}
```
**Response `200 OK`:** objeto `negotiation` com `status: open`

---

#### `POST /negotiations/:id/notes`
Adiciona uma observação/comentário à negociação.

| Campo | Valor |
|---|---|
| Autenticação | Atendente / Admin |

**Body:**
```json
{
  "content": "Cliente solicitou test-drive para sexta-feira"
}
```
**Response `201 Created`:**
```json
{
  "id": "uuid",
  "content": "Cliente solicitou test-drive para sexta-feira",
  "createdBy": { "id": "uuid", "name": "João Silva" },
  "createdAt": "2026-01-05T14:00:00.000Z"
}
```

---

#### `GET /negotiations/:id/history`
Retorna o histórico completo de estágios e status da negociação. (RF03)

| Campo | Valor |
|---|---|
| Autenticação | Todos (por permissão) |

**Body:** nenhum
**Response `200 OK`:**
```json
[
  {
    "id": "uuid",
    "stage": "proposal",
    "status": "open",
    "changedBy": { "id": "uuid", "name": "João Silva" },
    "changedAt": "2026-01-03T09:00:00.000Z"
  }
]
```

---

### 🙍 Customers

#### `GET /customers`
Busca/lista clientes por CPF, nome ou telefone.

| Campo | Valor |
|---|---|
| Autenticação | Atendente / Admin |
| Query params | `?cpf=` `?name=` `?phone=` |

**Body:** nenhum
**Response `200 OK`:** lista de objetos `customer`

---

#### `POST /customers`
Cadastra um novo cliente.

| Campo | Valor |
|---|---|
| Autenticação | Atendente / Admin |

**Body:**
```json
{
  "name": "Maria Souza",
  "cpf": "123.456.789-00",
  "phone": "(12) 99999-8888",
  "email": "maria@email.com"
}
```
**Response `201 Created`:** objeto `customer` criado

---

#### `GET /customers/:id`
Retorna detalhes de um cliente.

| Campo | Valor |
|---|---|
| Autenticação | Atendente / Admin |

**Body:** nenhum
**Response `200 OK`:** objeto `customer` completo

---

#### `PATCH /customers/:id`
Edita dados de um cliente.

| Campo | Valor |
|---|---|
| Autenticação | Atendente / Admin |

**Body** (campos opcionais):
```json
{
  "phone": "(12) 98888-7777",
  "email": "maria.novo@email.com"
}
```
**Response `200 OK`:** objeto `customer` atualizado

---

#### `DELETE /customers/:id`
Exclui um cliente.

| Campo | Valor |
|---|---|
| Autenticação | Admin |

**Body:** nenhum
**Response `200 OK`:**
```json
{
  "message": "Customer deleted successfully"
}
```

---

### 👥 Teams

#### `GET /teams`
Lista todas as equipes.

| Campo | Valor |
|---|---|
| Autenticação | Admin |

**Body:** nenhum
**Response `200 OK`:** lista de objetos `team` com membros

---

#### `POST /teams`
Cria uma nova equipe.

| Campo | Valor |
|---|---|
| Autenticação | Admin |

**Body:**
```json
{
  "name": "Equipe Norte",
  "managerId": "uuid",
  "storeId": "uuid"
}
```
**Response `201 Created`:** objeto `team` criado

---

#### `PATCH /teams/:id`
Edita dados de uma equipe.

| Campo | Valor |
|---|---|
| Autenticação | Admin |

**Body** (campos opcionais):
```json
{
  "name": "Equipe Norte — Jacareí",
  "managerId": "uuid"
}
```
**Response `200 OK`:** objeto `team` atualizado

---

#### `POST /teams/:id/members`
Vincula um atendente à equipe. (RF02)

| Campo | Valor |
|---|---|
| Autenticação | Gerente / Admin |

**Body:**
```json
{
  "userId": "uuid"
}
```
**Response `200 OK`:** objeto `team` com membros atualizados

---

#### `DELETE /teams/:id/members/:userId`
Remove um atendente da equipe.

| Campo | Valor |
|---|---|
| Autenticação | Gerente / Admin |

**Body:** nenhum
**Response `200 OK`:**
```json
{
  "message": "Member removed successfully"
}
```

---

### 🏪 Stores

#### `GET /stores`
Lista todas as lojas/unidades.

| Campo | Valor |
|---|---|
| Autenticação | Admin |

**Body:** nenhum
**Response `200 OK`:** lista de objetos `store`

---

#### `POST /stores`
Cadastra uma nova loja.

| Campo | Valor |
|---|---|
| Autenticação | Admin |

**Body:**
```json
{
  "name": "Valle Jacareí",
  "address": "Av. Presidente Vargas, 1000 — Jacareí/SP"
}
```
**Response `201 Created`:** objeto `store` criado

---

#### `PATCH /stores/:id`
Edita dados de uma loja.

| Campo | Valor |
|---|---|
| Autenticação | Admin |

**Body** (campos opcionais):
```json
{
  "name": "Valle Jacareí — Matriz",
  "address": "Rua Nova, 200 — Jacareí/SP"
}
```
**Response `200 OK`:** objeto `store` atualizado

---

### 📊 Dashboard

#### `GET /dashboard/operational`
Retorna total de leads por status, origem, loja e importância. Padrão: últimos 30 dias. (RF04)

| Campo | Valor |
|---|---|
| Autenticação | Atendente+ |
| Query params | `?period=week\|month\|year` ou `?from=&to=` |

**Body:** nenhum
**Response `200 OK`:**
```json
{
  "totalLeads": 142,
  "byStatus": { "open": 98, "closed": 44 },
  "byOriginChannel": { "whatsapp": 60, "instagram": 30, "visit": 52 },
  "byImportance": { "hot": 20, "warm": 55, "cold": 67 },
  "byStore": [
    { "storeId": "uuid", "storeName": "Valle Jacareí", "total": 90 }
  ]
}
```

---

#### `GET /dashboard/analytical`
Retorna taxa de conversão, leads por atendente/equipe, motivos de finalização e tempo médio. (RF05)

| Campo | Valor |
|---|---|
| Autenticação | Gerente+ |
| Query params | `?period=week\|month\|year` ou `?from=&to=` |

> Não administradores têm limite máximo de 1 ano. Validação ocorre no backend.

**Body:** nenhum
**Response `200 OK`:**
```json
{
  "conversionRate": 0.31,
  "avgNegotiationDays": 12,
  "byAttendant": [
    { "attendantId": "uuid", "name": "João Silva", "leads": 28, "converted": 9 }
  ],
  "closingReasons": { "sold": 22, "lost": 15, "noContact": 7 }
}
```

---

### 📜 Logs

#### `GET /logs`
Lista e filtra o log completo de operações. (RF07)

| Campo | Valor |
|---|---|
| Autenticação | Admin |
| Query params | `?userId=` `?entity=` `?from=` `?to=` |

**Body:** nenhum
**Response `200 OK`:**
```json
[
  {
    "id": "uuid",
    "action": "CREATE",
    "entity": "lead",
    "entityId": "uuid",
    "performedBy": { "id": "uuid", "name": "João Silva" },
    "performedAt": "2026-01-05T09:30:00.000Z"
  }
]
```

---

## 🔑 Variáveis de Ambiente

Crie um arquivo `.env` na raiz de `/server` baseado no `.env.example`. Dados sensíveis devem estar sempre em variáveis de ambiente — nunca hardcoded (RNF02).

**`.env.example`:**
```env
# ─────────────────────────────────────────
# Banco de dados
# ─────────────────────────────────────────
DATABASE_URL=postgresql://USUARIO:SENHA@HOST:PORTA/NOME_DO_BANCO

# ─────────────────────────────────────────
# Autenticação JWT (RF01)
# ─────────────────────────────────────────
JWT_SECRET=COLOQUE_AQUI_UMA_CHAVE_SECRETA_COM_NO_MINIMO_32_CARACTERES
JWT_EXPIRES_IN=8h

# ─────────────────────────────────────────
# Servidor
# ─────────────────────────────────────────
PORT=3000
NODE_ENV=development

# ─────────────────────────────────────────
# E-mail (recuperação de senha)
# ─────────────────────────────────────────
MAIL_HOST=smtp.seuprovedor.com
MAIL_PORT=587
MAIL_USER=seu@email.com
MAIL_PASS=SENHA_DO_EMAIL
MAIL_FROM=noreply@vallemultimarcas.com.br
```

| Variável | Descrição | Exemplo |
|---|---|---|
| `DATABASE_URL` | String de conexão do PostgreSQL | `postgresql://user:pass@localhost:5432/valle_leads` |
| `JWT_SECRET` | Chave secreta para assinar tokens JWT | Mínimo 32 caracteres aleatórios |
| `JWT_EXPIRES_IN` | Tempo de expiração do token (RF01) | `8h` |
| `PORT` | Porta em que o servidor vai rodar | `3000` |
| `NODE_ENV` | Ambiente de execução | `development` / `production` |
| `MAIL_HOST` | Servidor SMTP para envio de e-mail | `smtp.gmail.com` |
| `MAIL_PORT` | Porta do servidor SMTP | `587` |
| `MAIL_USER` | Usuário de autenticação SMTP | `seu@email.com` |
| `MAIL_PASS` | Senha de autenticação SMTP | — |
| `MAIL_FROM` | Endereço de envio exibido ao destinatário | `noreply@vallemultimarcas.com.br` |

> ⚠️ **Nunca commite o arquivo `.env` no repositório.** Ele já está no `.gitignore`.

---

## 📚 Documentação

Conforme exigido pelo RNF06, o projeto contempla:

| Artefato | Status |
|---|---|
| Documento de visão geral | ✅ No repositório principal |
| Modelo de dados (DER) | 🔄 Em construção |
| Diagrama de Casos de Uso (UML) | 🔄 Em construção |
| Diagrama de Classes (UML) | 🔄 Em construção |
| Diagrama de Componentes (UML) | 🔄 Em construção |
| Diagrama de Sequência (UML) | 🔄 Em construção |
| Descrição das rotas/endpoints | ✅ Neste documento |
| Instruções de execução | ✅ Neste documento |
| README estruturado | ✅ Neste documento |

| Recurso | Link |
|---|---|
| Repositório principal | [github.com/Helloworld-fatec/valle-leads-system](https://github.com/Helloworld-fatec/valle-leads-system) |
| Documentação do Frontend | *em breve* |

---

## 🌿 Estratégia de Versionamento e Git

O projeto adota uma estratégia padronizada de versionamento baseada em múltiplas branches, garantindo organização, rastreabilidade e segurança durante o desenvolvimento em equipe.

### 🔀 Estrutura de Branches

| Branch | Responsabilidade |
|---|---|
| `main` | Código estável e pronto para entrega |
| `develop` | Integração contínua durante a sprint |
| `feature/*` | Desenvolvimento de funcionalidades isoladas |

### 🔁 Fluxo de Desenvolvimento

- Toda funcionalidade é desenvolvida em uma branch `feature/*`
- O merge ocorre via Pull Request para a `develop`
- Ao final da sprint, a `develop` é integrada na `main`
- Cada entrega é versionada com uma **tag de sprint**

### 🏷️ Versionamento por Sprint

| Sprint | Tag |
|---|---|
| Sprint 1 | `v1.0-sprint1` |
| Sprint 2 | `v2.0-sprint2` |
| Sprint 3 | `v3.0-sprint3` |

### 📌 Convenção de Commits

O projeto segue um padrão baseado em prefixos:

| Prefixo | Uso |
|---|---|
| `feat` | Nova funcionalidade |
| `fix` | Correção de bug |
| `docs` | Documentação |
| `refactor` | Refatoração |
| `style` | Ajustes visuais |
| `test` | Testes |
| `chore` | Configuração |

### 📖 Guia Completo

Para detalhes completos sobre o fluxo de branches, Pull Requests e versionamento:

➡️ [`Git Operation Guide`](../docs/guides/git_operation.guide.md)

---

## 📝 Manutenção da Documentação

Esta documentação acompanha o ciclo de desenvolvimento do projeto e deve refletir o estado atual do sistema a cada sprint.

**Responsável:** Bruna Rodrigues

**Protocolo de atualização:** toda funcionalidade mergeada na branch `main` que introduza, modifique ou remova rotas, módulos ou variáveis de ambiente deve ter o README atualizado no mesmo PR, antes do merge ser aprovado.

---

<div align="center">

ABP 2026-1 · 3DSM · FATEC Jacareí · Sprint 1: 24/03 – 14/04/2026
Parceiro: 1000 Valle Multimarcas | Contato: Leonardo Robles (contato@atitudeti.com.br)
Focal Point: Prof. Arley Ferreira de Souza

</div>