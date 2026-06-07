# 🚗 Valle Leads System — Backend

<div align="center">

![Node.js](https://img.shields.io/badge/Node.js-22-339933?style=for-the-badge\&logo=nodedotjs\&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?style=for-the-badge\&logo=typescript\&logoColor=white)
![Express](https://img.shields.io/badge/Express-5-000000?style=for-the-badge\&logo=express\&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?style=for-the-badge\&logo=prisma\&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge\&logo=postgresql\&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge\&logo=docker\&logoColor=white)

**Sistema de Gestão de Leads com Dashboard Analítico — 1000 Valle Multimarcas**
ABP 2026-1 · 3DSM · FATEC Jacareí

</div>

---

## 📖 Sobre o Backend

O backend do **Valle Leads System** é responsável pela lógica de negócio, autenticação, controle de acesso, persistência de dados e fornecimento dos endpoints REST utilizados pelo frontend.

O sistema foi desenvolvido para apoiar a **1000 Valle Multimarcas** no gerenciamento de leads, clientes, usuários, equipes, lojas, negociações e dashboards analíticos.

A API permite:

* autenticação de usuários via JWT;
* controle de acesso baseado em papéis;
* gerenciamento de usuários, clientes, leads, lojas e equipes;
* criação e acompanhamento de negociações;
* registro de histórico de estágio, status e importância das negociações;
* consulta de dashboards para atendente, gerente e gerente geral;
* integração com banco de dados PostgreSQL via Prisma.

---

## 🏗️ Padrão Arquitetural

O backend segue uma organização modular baseada no padrão:

```txt
Controller → Service → Repository
```

### Fluxo de uma requisição

```txt
Requisição HTTP
     ↓
Router
     ↓
Middlewares
     ↓
Controller
     ↓
Service
     ↓
Repository
     ↓
Prisma
     ↓
PostgreSQL
```

### Responsabilidades

| Camada      | Responsabilidade                                           |
| ----------- | ---------------------------------------------------------- |
| Routes      | Define os endpoints e aplica middlewares                   |
| Middlewares | Autenticação, autorização, validação e tratamento de erros |
| Controller  | Recebe a requisição e encaminha para o service             |
| Service     | Aplica regras de negócio                                   |
| Repository  | Acessa o banco de dados via Prisma                         |
| Prisma      | ORM responsável pela comunicação com PostgreSQL            |

---

## 🛠️ Tecnologias Utilizadas

| Tecnologia        | Uso                                           |
| ----------------- | --------------------------------------------- |
| Node.js           | Runtime do backend                            |
| TypeScript        | Tipagem estática                              |
| Express           | Framework HTTP                                |
| Prisma            | ORM e migrations                              |
| PostgreSQL        | Banco de dados relacional                     |
| Zod               | Validação de dados                            |
| JWT               | Autenticação via access token e refresh token |
| bcrypt / bcryptjs | Hash de senhas                                |
| cookie-parser     | Manipulação de cookies                        |
| cors              | Configuração de CORS                          |
| Docker            | Execução conteinerizada                       |
| Docker Compose    | Orquestração de containers                    |

---

## 👥 Equipe

| Nome            | Papel              |
| --------------- | ------------------ |
| Bruno Berval    | Product Owner (PO) |
| Nicolas Kauê    | Scrum Master (SM)  |
| Bruna Rodrigues | Dev Team           |
| Pedro Enrique   | Dev Team           |
| Ryan Tinel      | Dev Team           |
| Suelen Castro   | Dev Team           |

---

## 🚀 Como Rodar o Projeto

A aplicação pode ser executada via **Docker Compose** a partir da raiz do projeto ou localmente a partir da pasta `/server`.

---

## 🐳 Execução com Docker

> Recomendado para execução integrada do projeto.

### Pré-requisitos

* Docker
* Docker Compose
* Git

### 1. Clone o repositório

```bash
git clone https://github.com/Helloworld-fatec/valle-leads-system.git
cd valle-leads-system
```

### 2. Crie o arquivo `.env` na raiz do projeto

O arquivo `docker-compose.yml` utiliza `env_file: .env`, portanto o `.env` deve existir na **raiz do projeto**, no mesmo nível do `docker-compose.yml`.

Exemplo:

```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=valle_leads

ACCESS_TOKEN_SECRET=coloque_uma_chave_segura_para_access_token
REFRESH_TOKEN_SECRET=coloque_uma_chave_segura_para_refresh_token
```

### 3. Suba os containers

```bash
docker compose up -d --build
```

Esse comando sobe os containers principais:

* `valle_db` — PostgreSQL
* `valle_server` — Backend
* `valle_client` — Frontend

### 4. Executar seed, se necessário

O `docker-compose.yml` possui um serviço separado para seed, executado por profile:

```bash
docker compose --profile seed up seed
```

### 5. Acessar o backend

```txt
http://localhost:3000
```

A API principal fica em:

```txt
http://localhost:3000/api
```

---

## 💻 Execução Local do Backend

> Alternativa para desenvolvimento direto na pasta `/server`.

### 1. Acesse a pasta do backend

```bash
cd server
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure o `.env` do backend

Crie um arquivo `.env` dentro da pasta `/server`:

```bash
cp .env.example .env
```

Exemplo:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/valle_leads

ACCESS_TOKEN_SECRET=coloque_uma_chave_segura_para_access_token
REFRESH_TOKEN_SECRET=coloque_uma_chave_segura_para_refresh_token
```

### 4. Gere o Prisma Client

```bash
npm run prisma:generate
```

### 5. Rode as migrations

```bash
npm run prisma:migrate
```

### 6. Inicie o servidor em modo desenvolvimento

```bash
npm run dev
```

O servidor estará disponível em:

```txt
http://localhost:3000
```

---

## 📜 Scripts Disponíveis

| Script                    | Descrição                                                 |
| ------------------------- | --------------------------------------------------------- |
| `npm run dev`             | Inicia o servidor em modo desenvolvimento com `tsx watch` |
| `npm run build`           | Compila o projeto TypeScript                              |
| `npm run start`           | Executa o build em `dist/server.js`                       |
| `npm run prisma:generate` | Gera o Prisma Client                                      |
| `npm run prisma:migrate`  | Executa migrations em desenvolvimento                     |

---

## 🔑 Variáveis de Ambiente

### `.env` da raiz do projeto

Usado pelo Docker Compose.

| Variável               | Descrição                      |
| ---------------------- | ------------------------------ |
| `POSTGRES_USER`        | Usuário do banco PostgreSQL    |
| `POSTGRES_PASSWORD`    | Senha do banco PostgreSQL      |
| `POSTGRES_DB`          | Nome do banco de dados         |
| `ACCESS_TOKEN_SECRET`  | Chave secreta do access token  |
| `REFRESH_TOKEN_SECRET` | Chave secreta do refresh token |

### `server/.env`

Usado na execução local do backend.

| Variável               | Descrição                      |
| ---------------------- | ------------------------------ |
| `DATABASE_URL`         | URL de conexão com PostgreSQL  |
| `ACCESS_TOKEN_SECRET`  | Chave secreta do access token  |
| `REFRESH_TOKEN_SECRET` | Chave secreta do refresh token |

> Nunca commite arquivos `.env` reais no repositório.

---

## 📁 Estrutura de Pastas

```txt
server/
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   ├── seed_data.csv
│   └── seed_negotiations.ts
├── src/
│   ├── @types/
│   │   └── express/
│   ├── config/
│   │   └── prisma.ts
│   ├── middlewares/
│   │   ├── auth/
│   │   │   ├── auth.middleware.ts
│   │   │   └── permission.middleware.ts
│   │   ├── errors/
│   │   │   ├── domainErrors.middleware.ts
│   │   │   └── globalError.middleware.ts
│   │   └── validation/
│   │       └── validate.middleware.ts
│   ├── modules/
│   │   ├── auth/
│   │   │   └── login/
│   │   ├── customers/
│   │   ├── dashboards/
│   │   │   ├── attendant/
│   │   │   ├── manager/
│   │   │   └── general-manager/
│   │   ├── interest-items/
│   │   ├── leads/
│   │   ├── negotiation/
│   │   ├── negotiation-importance/
│   │   ├── negotiation-stage-history/
│   │   ├── negotiation-status/
│   │   ├── stores/
│   │   ├── teams/
│   │   ├── users/
│   │   └── users-teams/
│   ├── routes/
│   │   └── index.ts
│   ├── app.ts
│   └── server.ts
├── Dockerfile
├── package.json
├── prisma.config.ts
└── tsconfig.json
```

---

## 🧩 Módulos do Sistema

### 🔐 Auth/Login

Responsável pela autenticação dos usuários.

Rotas implementadas:

* `POST /auth/login`
* `POST /auth/refresh`
* `POST /auth/logout`

Funcionalidades:

* validação de e-mail e senha;
* geração de access token;
* geração de refresh token;
* renovação de token;
* logout.

---

### 👤 Users

Responsável pelo gerenciamento de usuários do sistema.

Rotas implementadas:

* `GET /users`
* `GET /users/:id`
* `POST /users`
* `PUT /users/:id`
* `PATCH /users/:id`
* `DELETE /users/:id`
* `DELETE /users/:id/hard`

Funcionalidades:

* listagem de usuários;
* busca por ID;
* criação de usuário;
* edição de usuário;
* atualização do próprio usuário por ID;
* soft delete;
* hard delete restrito a `ADMIN`.

---

### 🙍 Customers

Responsável pelo gerenciamento de clientes/prospects.

Rotas implementadas:

* `GET /customers`
* `GET /customers/:id`
* `POST /customers`
* `PUT /customers/:id`
* `PATCH /customers/:id`
* `DELETE /customers/:id`
* `DELETE /customers/:id/hard`

Funcionalidades:

* listagem e busca de clientes;
* cadastro de cliente;
* edição de cliente;
* soft delete;
* hard delete restrito a `ADMIN`.

---

### 📋 Leads

Responsável pelo gerenciamento de leads.

Rotas implementadas:

* `GET /leads`
* `GET /leads/:id`
* `POST /leads`
* `PUT /leads/:id`
* `PATCH /leads/:id`
* `DELETE /leads/:id`
* `DELETE /leads/:id/permanent`
* `POST /leads/bulk/assign-attendant`
* `POST /leads/bulk/assign-team`

Funcionalidades:

* listagem com filtros;
* visualização por ID;
* criação de lead;
* edição de lead;
* soft delete;
* hard delete restrito a `ADMIN`;
* atribuição em lote para atendente;
* atribuição em lote para equipe.

---

### 🚘 Interest Items

Responsável pelos itens de interesse vinculados aos leads, como veículos ou produtos de interesse.

Rotas implementadas:

* `GET /interest-items`
* `GET /interest-items/:id`
* `POST /interest-items`
* `PUT /interest-items/:id`
* `PATCH /interest-items/:id`
* `DELETE /interest-items/:id`
* `DELETE /interest-items/:id/hard`

Funcionalidades:

* listagem de itens de interesse;
* busca por ID;
* cadastro;
* edição;
* soft delete;
* hard delete restrito a `ADMIN`.

---

### 🤝 Negotiation

Responsável pelo gerenciamento das negociações vinculadas aos leads.

Rotas implementadas:

* `GET /negotiations`
* `GET /negotiations/:id`
* `POST /negotiations`
* `PUT /negotiations/:id`
* `PATCH /negotiations/:id`
* `DELETE /negotiations/:id`
* `POST /negotiations/bulk/assign-attendant`
* `POST /negotiations/bulk/assign-team`

Funcionalidades:

* listagem de negociações;
* visualização por ID;
* criação de negociação;
* edição de negociação;
* exclusão permanente restrita a `ADMIN`;
* atribuição em lote para atendente;
* atribuição em lote para equipe.

---

### 📌 Negotiation Status

Responsável pelo histórico de status das negociações.

Rotas implementadas:

* `GET /negotiation-status`
* `GET /negotiation-status/:id`
* `POST /negotiation-status`
* `PUT /negotiation-status/:id`
* `PATCH /negotiation-status/:id`
* `DELETE /negotiation-status/:id`

Funcionalidades:

* listagem de registros de status;
* visualização por ID;
* criação de novo registro de status;
* atualização de observações;
* exclusão restrita a `ADMIN`.

---

### 🌡️ Negotiation Importance

Responsável pelo histórico de importância das negociações.

Rotas implementadas:

* `GET /negotiation-importance`
* `GET /negotiation-importance/:id`
* `POST /negotiation-importance`
* `PUT /negotiation-importance/:id`
* `PATCH /negotiation-importance/:id`
* `DELETE /negotiation-importance/:id`

Funcionalidades:

* listagem de registros de importância;
* visualização por ID;
* criação de novo registro;
* atualização de observações;
* exclusão restrita a `ADMIN`.

---

### 🧭 Negotiation Stage History

Responsável pelo histórico de etapas do funil de negociação.

Rotas implementadas:

* `GET /negotiation-stage-history`
* `GET /negotiation-stage-history/:id`
* `POST /negotiation-stage-history`
* `PUT /negotiation-stage-history/:id`
* `PATCH /negotiation-stage-history/:id`
* `DELETE /negotiation-stage-history/:id`

Funcionalidades:

* listagem do histórico de etapas;
* visualização por ID;
* criação de novo registro de etapa;
* atualização de observações;
* exclusão restrita a `ADMIN`.

---

### 🏪 Stores

Responsável pelo gerenciamento das lojas.

Rotas implementadas:

* `GET /stores`
* `GET /stores/:id`
* `POST /stores`
* `PUT /stores/:id`
* `PATCH /stores/:id`
* `DELETE /stores/:id`
* `DELETE /stores/:id/hard`

Funcionalidades:

* listagem de lojas;
* visualização por ID;
* criação de loja;
* edição de loja;
* soft delete;
* hard delete restrito a `ADMIN`.

---

### 👥 Teams

Responsável pelo gerenciamento de equipes.

Rotas implementadas:

* `GET /teams`
* `GET /teams/:id`
* `POST /teams`
* `PUT /teams/:id`
* `PATCH /teams/:id`
* `DELETE /teams/:id`
* `DELETE /teams/:id/hard`

Funcionalidades:

* listagem de equipes;
* visualização por ID;
* criação de equipe;
* edição de equipe;
* soft delete;
* hard delete restrito a `ADMIN`.

---

### 🔗 Users Teams

Responsável pelo vínculo entre usuários e equipes.

Rotas implementadas:

* `GET /users-teams`
* `GET /users-teams/:id`
* `POST /users-teams`
* `PUT /users-teams/:id`
* `PATCH /users-teams/:id`
* `DELETE /users-teams/:id`
* `DELETE /users-teams/:id/hard`

Funcionalidades:

* listagem de vínculos;
* busca por ID;
* criação de vínculo usuário-equipe;
* edição de vínculo;
* soft delete;
* hard delete restrito a `ADMIN`.

---

### 📊 Dashboards

O backend possui três módulos separados de dashboard:

* Dashboard do Atendente;
* Dashboard do Gerente;
* Dashboard do Gerente Geral.

---

## 🌐 Rotas da API

Base URL:

```txt
http://localhost:3000/api
```

Rotas protegidas exigem:

```txt
Authorization: Bearer <access_token>
```

---

## 🔐 Auth

| Método | Rota            | Descrição                      | Autenticação |
| ------ | --------------- | ------------------------------ | ------------ |
| POST   | `/auth/login`   | Realiza login e retorna tokens | Pública      |
| POST   | `/auth/refresh` | Renova o access token          | Pública      |
| POST   | `/auth/logout`  | Encerra sessão/logout          | Pública      |

### `POST /auth/login`

Exemplo de body:

```json
{
  "email": "usuario@email.com",
  "password": "senha123"
}
```

---

## 👤 Users

| Método | Rota              | Descrição                     | Permissão                                  |
| ------ | ----------------- | ----------------------------- | ------------------------------------------ |
| GET    | `/users`          | Lista usuários                | `MANAGER` ou superior                      |
| GET    | `/users/:id`      | Busca usuário por ID          | Usuário autenticado                        |
| POST   | `/users`          | Cria usuário                  | `ADMIN`                                    |
| PUT    | `/users/:id`      | Atualiza usuário              | Usuário autenticado, com regras no service |
| PATCH  | `/users/:id`      | Atualiza usuário parcialmente | Usuário autenticado, com regras no service |
| DELETE | `/users/:id`      | Soft delete de usuário        | `ADMIN`                                    |
| DELETE | `/users/:id/hard` | Hard delete de usuário        | `ADMIN`                                    |

---

## 🙍 Customers

| Método | Rota                  | Descrição                     | Permissão           |
| ------ | --------------------- | ----------------------------- | ------------------- |
| GET    | `/customers`          | Lista clientes                | Usuário autenticado |
| GET    | `/customers/:id`      | Busca cliente por ID          | Usuário autenticado |
| POST   | `/customers`          | Cria cliente                  | Usuário autenticado |
| PUT    | `/customers/:id`      | Atualiza cliente              | Usuário autenticado |
| PATCH  | `/customers/:id`      | Atualiza cliente parcialmente | Usuário autenticado |
| DELETE | `/customers/:id`      | Soft delete de cliente        | Usuário autenticado |
| DELETE | `/customers/:id/hard` | Hard delete de cliente        | `ADMIN`             |

---

## 📋 Leads

| Método | Rota                           | Descrição                         | Permissão                                  |
| ------ | ------------------------------ | --------------------------------- | ------------------------------------------ |
| GET    | `/leads`                       | Lista leads com filtros           | Usuário autenticado                        |
| GET    | `/leads/:id`                   | Busca lead por ID                 | Usuário autenticado                        |
| POST   | `/leads`                       | Cria lead                         | Usuário autenticado                        |
| PUT    | `/leads/:id`                   | Atualiza lead                     | Usuário autenticado, com regras no service |
| PATCH  | `/leads/:id`                   | Atualiza lead parcialmente        | Usuário autenticado, com regras no service |
| DELETE | `/leads/:id`                   | Soft delete de lead               | Usuário autenticado, com regras no service |
| DELETE | `/leads/:id/permanent`         | Hard delete de lead               | `ADMIN`                                    |
| POST   | `/leads/bulk/assign-attendant` | Atribuição em lote para atendente | `MANAGER` ou `ADMIN`                       |
| POST   | `/leads/bulk/assign-team`      | Atribuição em lote para equipe    | `GENERAL_MANAGER` ou `ADMIN`               |

---

## 🚘 Interest Items

| Método | Rota                       | Descrição                  | Permissão                     |
| ------ | -------------------------- | -------------------------- | ----------------------------- |
| GET    | `/interest-items`          | Lista itens de interesse   | Usuário autenticado           |
| GET    | `/interest-items/:id`      | Busca item por ID          | Usuário autenticado           |
| POST   | `/interest-items`          | Cria item de interesse     | `GENERAL_MANAGER` ou superior |
| PUT    | `/interest-items/:id`      | Atualiza item              | `GENERAL_MANAGER` ou superior |
| PATCH  | `/interest-items/:id`      | Atualiza item parcialmente | `GENERAL_MANAGER` ou superior |
| DELETE | `/interest-items/:id`      | Soft delete de item        | `GENERAL_MANAGER` ou superior |
| DELETE | `/interest-items/:id/hard` | Hard delete de item        | `ADMIN`                       |

---

## 🤝 Negotiations

| Método | Rota                                  | Descrição                         | Permissão                                  |
| ------ | ------------------------------------- | --------------------------------- | ------------------------------------------ |
| GET    | `/negotiations`                       | Lista negociações                 | Usuário autenticado                        |
| GET    | `/negotiations/:id`                   | Busca negociação por ID           | Usuário autenticado                        |
| POST   | `/negotiations`                       | Cria negociação                   | Usuário autenticado                        |
| PUT    | `/negotiations/:id`                   | Atualiza negociação               | Usuário autenticado, com regras no service |
| PATCH  | `/negotiations/:id`                   | Atualiza negociação parcialmente  | Usuário autenticado, com regras no service |
| DELETE | `/negotiations/:id`                   | Exclui negociação permanentemente | `ADMIN`                                    |
| POST   | `/negotiations/bulk/assign-attendant` | Atribuição em lote para atendente | `MANAGER` ou `ADMIN`                       |
| POST   | `/negotiations/bulk/assign-team`      | Atribuição em lote para equipe    | `GENERAL_MANAGER` ou `ADMIN`               |

---

## 📌 Negotiation Status

| Método | Rota                      | Descrição                         | Permissão           |
| ------ | ------------------------- | --------------------------------- | ------------------- |
| GET    | `/negotiation-status`     | Lista histórico de status         | Usuário autenticado |
| GET    | `/negotiation-status/:id` | Busca registro de status          | Usuário autenticado |
| POST   | `/negotiation-status`     | Cria registro de status           | Usuário autenticado |
| PUT    | `/negotiation-status/:id` | Atualiza observações do registro  | Usuário autenticado |
| PATCH  | `/negotiation-status/:id` | Atualiza observações parcialmente | Usuário autenticado |
| DELETE | `/negotiation-status/:id` | Exclui registro                   | `ADMIN`             |

---

## 🌡️ Negotiation Importance

| Método | Rota                          | Descrição                         | Permissão           |
| ------ | ----------------------------- | --------------------------------- | ------------------- |
| GET    | `/negotiation-importance`     | Lista histórico de importância    | Usuário autenticado |
| GET    | `/negotiation-importance/:id` | Busca registro de importância     | Usuário autenticado |
| POST   | `/negotiation-importance`     | Cria registro de importância      | Usuário autenticado |
| PUT    | `/negotiation-importance/:id` | Atualiza observações do registro  | Usuário autenticado |
| PATCH  | `/negotiation-importance/:id` | Atualiza observações parcialmente | Usuário autenticado |
| DELETE | `/negotiation-importance/:id` | Exclui registro                   | `ADMIN`             |

---

## 🧭 Negotiation Stage History

| Método | Rota                             | Descrição                         | Permissão           |
| ------ | -------------------------------- | --------------------------------- | ------------------- |
| GET    | `/negotiation-stage-history`     | Lista histórico de etapas         | Usuário autenticado |
| GET    | `/negotiation-stage-history/:id` | Busca registro de etapa           | Usuário autenticado |
| POST   | `/negotiation-stage-history`     | Cria registro de etapa            | Usuário autenticado |
| PUT    | `/negotiation-stage-history/:id` | Atualiza observações do registro  | Usuário autenticado |
| PATCH  | `/negotiation-stage-history/:id` | Atualiza observações parcialmente | Usuário autenticado |
| DELETE | `/negotiation-stage-history/:id` | Exclui registro                   | `ADMIN`             |

---

## 🏪 Stores

| Método | Rota               | Descrição                  | Permissão           |
| ------ | ------------------ | -------------------------- | ------------------- |
| GET    | `/stores`          | Lista lojas                | Usuário autenticado |
| GET    | `/stores/:id`      | Busca loja por ID          | Usuário autenticado |
| POST   | `/stores`          | Cria loja                  | `ADMIN`             |
| PUT    | `/stores/:id`      | Atualiza loja              | `ADMIN`             |
| PATCH  | `/stores/:id`      | Atualiza loja parcialmente | `ADMIN`             |
| DELETE | `/stores/:id`      | Soft delete de loja        | `ADMIN`             |
| DELETE | `/stores/:id/hard` | Hard delete de loja        | `ADMIN`             |

---

## 👥 Teams

| Método | Rota              | Descrição                    | Permissão                    |
| ------ | ----------------- | ---------------------------- | ---------------------------- |
| GET    | `/teams`          | Lista equipes                | `GENERAL_MANAGER` ou `ADMIN` |
| GET    | `/teams/:id`      | Busca equipe por ID          | Usuário autenticado          |
| POST   | `/teams`          | Cria equipe                  | `GENERAL_MANAGER` ou `ADMIN` |
| PUT    | `/teams/:id`      | Atualiza equipe              | `GENERAL_MANAGER` ou `ADMIN` |
| PATCH  | `/teams/:id`      | Atualiza equipe parcialmente | `GENERAL_MANAGER` ou `ADMIN` |
| DELETE | `/teams/:id`      | Soft delete de equipe        | `GENERAL_MANAGER` ou `ADMIN` |
| DELETE | `/teams/:id/hard` | Hard delete de equipe        | `ADMIN`                      |

---

## 🔗 Users Teams

| Método | Rota                    | Descrição                     | Permissão                    |
| ------ | ----------------------- | ----------------------------- | ---------------------------- |
| GET    | `/users-teams`          | Lista vínculos usuário-equipe | Usuário autenticado          |
| GET    | `/users-teams/:id`      | Busca vínculo por ID          | Usuário autenticado          |
| POST   | `/users-teams`          | Cria vínculo usuário-equipe   | `GENERAL_MANAGER` ou `ADMIN` |
| PUT    | `/users-teams/:id`      | Atualiza vínculo              | `GENERAL_MANAGER` ou `ADMIN` |
| PATCH  | `/users-teams/:id`      | Atualiza vínculo parcialmente | `GENERAL_MANAGER` ou `ADMIN` |
| DELETE | `/users-teams/:id`      | Soft delete de vínculo        | `GENERAL_MANAGER` ou `ADMIN` |
| DELETE | `/users-teams/:id/hard` | Hard delete de vínculo        | `ADMIN`                      |

---

## 📊 Dashboards

### Dashboard do Atendente

Base:

```txt
/dashboards/attendant
```

Permissão mínima:

```txt
ATTENDANT
```

| Método | Rota                                                 | Descrição                  |
| ------ | ---------------------------------------------------- | -------------------------- |
| GET    | `/dashboards/attendant/kpi/active-leads`             | Total de leads ativos      |
| GET    | `/dashboards/attendant/kpi/converted-leads`          | Total de leads convertidos |
| GET    | `/dashboards/attendant/kpi/conversion-rate`          | Taxa de conversão          |
| GET    | `/dashboards/attendant/kpi/avg-service-time`         | Tempo médio de atendimento |
| GET    | `/dashboards/attendant/charts/leads-evolution`       | Evolução de leads          |
| GET    | `/dashboards/attendant/charts/sales-funnel`          | Funil de vendas            |
| GET    | `/dashboards/attendant/charts/leads-by-source`       | Leads por origem           |
| GET    | `/dashboards/attendant/charts/conversions-by-period` | Conversões por período     |

---

### Dashboard do Gerente

Base:

```txt
/dashboards/manager
```

Permissão mínima:

```txt
MANAGER
```

| Método | Rota                                                  | Descrição                |
| ------ | ----------------------------------------------------- | ------------------------ |
| GET    | `/dashboards/manager/kpi/team`                        | KPIs da equipe           |
| GET    | `/dashboards/manager/kpi/top-attendant`               | Melhor atendente         |
| GET    | `/dashboards/manager/charts/leads-by-attendant`       | Leads por atendente      |
| GET    | `/dashboards/manager/charts/conversions-by-attendant` | Conversões por atendente |
| GET    | `/dashboards/manager/charts/team-evolution`           | Evolução da equipe       |
| GET    | `/dashboards/manager/charts/team-funnel`              | Funil da equipe          |

---

### Dashboard do Gerente Geral

Base:

```txt
/dashboards/general-manager
```

Permissão mínima:

```txt
GENERAL_MANAGER
```

| Método | Rota                                                  | Descrição          |
| ------ | ----------------------------------------------------- | ------------------ |
| GET    | `/dashboards/general-manager/kpi/global`              | KPIs globais       |
| GET    | `/dashboards/general-manager/kpi/top-team`            | Melhor equipe      |
| GET    | `/dashboards/general-manager/charts/leads-by-team`    | Leads por equipe   |
| GET    | `/dashboards/general-manager/charts/team-ranking`     | Ranking de equipes |
| GET    | `/dashboards/general-manager/charts/global-evolution` | Evolução global    |
| GET    | `/dashboards/general-manager/charts/global-funnel`    | Funil global       |

---

## 🔐 Controle de Acesso

O sistema utiliza autenticação por JWT e autorização baseada em papéis.

### Papéis utilizados

| Role              | Descrição     |
| ----------------- | ------------- |
| `ATTENDANT`       | Atendente     |
| `MANAGER`         | Gerente       |
| `GENERAL_MANAGER` | Gerente Geral |
| `ADMIN`           | Administrador |

### Middlewares principais

| Middleware           | Responsabilidade                               |
| -------------------- | ---------------------------------------------- |
| `authMiddleware`     | Valida o access token e injeta `req.user`      |
| `checkRole`          | Permite apenas roles explicitamente informadas |
| `checkPermission`    | Valida permissão mínima por hierarquia         |
| `validateBody`       | Valida corpo da requisição com Zod             |
| `validateQuery`      | Valida query params com Zod                    |
| `validateParams`     | Valida parâmetros de rota com Zod              |
| `globalErrorHandler` | Trata erros globais da aplicação               |

---

## 🗄️ Banco de Dados

O projeto utiliza PostgreSQL com Prisma ORM.

### Principais tabelas

| Tabela                      | Descrição                                        |
| --------------------------- | ------------------------------------------------ |
| `users`                     | Usuários do sistema                              |
| `stores`                    | Lojas/unidades                                   |
| `teams`                     | Equipes                                          |
| `user_teams`                | Vínculo entre usuários e equipes                 |
| `customers`                 | Clientes/prospects                               |
| `interest_items`            | Itens de interesse                               |
| `leads`                     | Leads                                            |
| `negotiations`              | Negociações                                      |
| `negotiation_status`        | Histórico de status                              |
| `negotiation_stage_history` | Histórico de etapas                              |
| `negotiation_importance`    | Histórico de importância                         |
| `system_logs`               | Estrutura prevista no schema para logs/auditoria |

---

## ⚠️ Funcionalidades Planejadas ou Pendentes

As funcionalidades abaixo aparecem como requisitos ou estruturas previstas, mas **não devem ser consideradas endpoints implementados nesta versão do backend**.

| Funcionalidade                  | Status                                            |
| ------------------------------- | ------------------------------------------------- |
| Recuperação de senha por e-mail | Não implementada como rota                        |
| Redefinição de senha por token  | Não implementada como rota                        |
| `GET /users/me`                 | Não implementada                                  |
| `PATCH /users/me`               | Não implementada                                  |
| `POST /leads/:id/transfer`      | Não implementada                                  |
| `GET /leads/:id/history`        | Não implementada                                  |
| `GET /logs`                     | Não implementada como rota                        |
| Módulo de logs/auditoria        | Estrutura prevista no banco, fluxo ainda pendente |

---

## 🧪 Validação e Tratamento de Erros

O backend utiliza Zod para validação de:

* body;
* query params;
* route params.

Erros são encaminhados para o middleware global:

```txt
globalErrorHandler
```

A estrutura geral permite padronizar respostas de erro e evitar validações diretamente nos controllers.

---

## 🌿 Versionamento e Git

O projeto segue um fluxo baseado em branches.

| Branch       | Uso                                  |
| ------------ | ------------------------------------ |
| `main`       | Código estável e pronto para entrega |
| `develop`    | Integração das entregas da sprint    |
| `feat/*`     | Desenvolvimento de funcionalidades   |
| `docs/*`     | Ajustes de documentação              |
| `fix/*`      | Correções                            |
| `refactor/*` | Refatorações                         |

### Prefixos de commit

| Prefixo    | Uso                     |
| ---------- | ----------------------- |
| `feat`     | Nova funcionalidade     |
| `fix`      | Correção                |
| `docs`     | Documentação            |
| `refactor` | Refatoração             |
| `style`    | Estilização             |
| `chore`    | Configuração/manutenção |

---

## 📚 Documentação Relacionada

| Recurso                  | Caminho                      |
| ------------------------ | ---------------------------- |
| README principal         | `../README.md`               |
| Documentação do frontend | `../client/README.md`        |
| Documentação da Sprint 1 | `../docs/sprint_1/README.md` |
| Documentação da Sprint 2 | `../docs/sprint_2/README.md` |
| Documentação da Sprint 3 | `../docs/sprint_3/README.md` |
| Product Backlog          | `../docs/PRODUCT_BACKLOG.md` |

---

## 📝 Manutenção da Documentação

Esta documentação deve ser atualizada sempre que houver alteração em:

* rotas;
* módulos;
* regras de autenticação;
* permissões;
* variáveis de ambiente;
* Docker;
* migrations;
* scripts;
* estrutura de pastas.

Atualizações de backend que alterem contrato de API devem ser acompanhadas de atualização deste README no mesmo Pull Request.

---

<div align="center">

ABP 2026-1 · 3DSM · FATEC Jacareí
Parceiro: 1000 Valle Multimarcas
Focal Point: Prof. Arley Ferreira de Souza

</div>
