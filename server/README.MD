# 🚗 Valle Leads System — Backend

Backend do **Valle Leads System**, sistema de gestão de leads e dashboards analíticos desenvolvido para a **1000 Valle Multimarcas**.

O backend é responsável pela autenticação, controle de acesso, regras de negócio, persistência de dados, dashboards e fornecimento dos endpoints REST consumidos pelo frontend.

> Projeto acadêmico desenvolvido na **FATEC Jacareí** — ABP 2026-1 | 3º DSM
> Parceiro: 1000 Valle Multimarcas | Focal Point: Prof. Arley Ferreira de Souza

---

## 📌 Sobre o Backend

A API do Valle Leads System foi desenvolvida com **Node.js**, **Express**, **TypeScript**, **Prisma** e **PostgreSQL**.

Ela permite:

* autenticação de usuários com JWT;
* renovação de sessão com refresh token;
* controle de acesso baseado em papéis;
* gerenciamento de usuários, clientes, lojas, equipes e vínculos usuário/equipe;
* gerenciamento de leads e itens de interesse;
* criação e acompanhamento de negociações;
* registro de histórico de etapa, status e importância de negociações;
* consulta de dashboards para atendente, gerente e gerente geral;
* execução via Docker com banco local ou banco em nuvem.

---

## 🛠 Tecnologias Utilizadas

| Tecnologia        | Uso                                   |
| ----------------- | ------------------------------------- |
| Node.js           | Runtime do backend                    |
| TypeScript        | Tipagem estática                      |
| Express           | Framework HTTP                        |
| Prisma            | ORM, migrations, Prisma Client e seed |
| PostgreSQL        | Banco de dados relacional             |
| Zod               | Validação de body, params e query     |
| JWT               | Access token e refresh token          |
| bcrypt / bcryptjs | Hash de senhas                        |
| cookie-parser     | Manipulação de cookies                |
| cors              | Configuração de CORS                  |
| dotenv            | Variáveis de ambiente                 |
| csv-parse         | Leitura de arquivos CSV para seed     |
| Docker            | Conteinerização                       |
| Docker Compose    | Orquestração de containers            |

---

## 🏗️ Arquitetura

O backend segue organização modular baseada no padrão:

```txt
Controller → Service → Repository
```

### Fluxo de uma requisição

```txt
Requisição HTTP
     ↓
app.ts
     ↓
/api
     ↓
Router principal
     ↓
Router do módulo
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

### Responsabilidades por camada

| Camada        | Responsabilidade                                           |
| ------------- | ---------------------------------------------------------- |
| `routes`      | Define endpoints e aplica middlewares                      |
| `middlewares` | Autenticação, autorização, validação e tratamento de erros |
| `controller`  | Recebe requisições e envia respostas                       |
| `service`     | Aplica regras de negócio e escopo por perfil               |
| `repository`  | Acessa o banco via Prisma                                  |
| `Prisma`      | ORM, migrations e client de banco                          |

---

## 📁 Estrutura de Pastas

```txt
server/
├── prisma/
│   ├── csv/
│   │   ├── negotiations_seed_long.csv
│   │   ├── seed_customers.csv
│   │   ├── seed_data.csv
│   │   ├── seed_interest_items.csv
│   │   ├── seed_leads.csv
│   │   ├── seed_negotiations.csv
│   │   ├── seed_negotiation_importance.csv
│   │   ├── seed_negotiation_stage.csv
│   │   ├── seed_negotiation_status.csv
│   │   ├── seed_stores.csv
│   │   └── ...
│   ├── migrations/
│   │   └── ...
│   ├── schema.prisma
│   ├── seed.ts
│   └── seed_negotiations.ts
├── src/
│   ├── @types/
│   │   └── express/
│   │       └── index.d.ts
│   ├── config/
│   │   └── prisma.ts
│   ├── generated/
│   │   └── prisma/
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
│   │   │   ├── general-manager/
│   │   │   └── manager/
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
├── .dockerignore
├── .env.example
├── .gitignore
├── Dockerfile
├── package.json
├── package-lock.json
├── prisma.config.ts
├── README.md
└── tsconfig.json
```

> Observação: `src/generated/prisma/` é o caminho configurado no Prisma para geração do Prisma Client. Ele é necessário para execução da aplicação e do seed.

---

## 🔑 Variáveis de Ambiente

O backend depende das seguintes variáveis:

| Variável                   | Descrição                                  |
| -------------------------- | ------------------------------------------ |
| `DATABASE_URL`             | URL de conexão com PostgreSQL              |
| `ACCESS_TOKEN_SECRET`      | Chave secreta do access token              |
| `REFRESH_TOKEN_SECRET`     | Chave secreta do refresh token             |
| `ACCESS_TOKEN_EXPIRES_IN`  | Tempo de expiração do access token         |
| `REFRESH_TOKEN_EXPIRES_IN` | Tempo de expiração do refresh token        |
| `PORT`                     | Porta do servidor. Opcional; padrão `3000` |

### Exemplo para execução local sem Docker

Arquivo `server/.env`:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/valle_leads?schema=public

ACCESS_TOKEN_SECRET=troque_por_uma_chave_segura_de_access_token
REFRESH_TOKEN_SECRET=troque_por_uma_chave_segura_de_refresh_token
ACCESS_TOKEN_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d

PORT=3000
```

### Exemplo para Docker com banco local

Arquivo `.env` na raiz do projeto:

```env
NODE_ENV=production

POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=valle_leads

DATABASE_URL=postgresql://postgres:postgres@db:5432/valle_leads?schema=public

ACCESS_TOKEN_SECRET=troque_por_uma_chave_segura_de_access_token
REFRESH_TOKEN_SECRET=troque_por_uma_chave_segura_de_refresh_token
ACCESS_TOKEN_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d

VITE_BACKEND_URL=
```

### Exemplo para Docker com banco em nuvem

Arquivo `.env.cloud` na raiz do projeto:

```env
NODE_ENV=production

DATABASE_URL=postgresql://USUARIO:SENHA@HOST/NOME_DO_BANCO?sslmode=require

ACCESS_TOKEN_SECRET=troque_por_uma_chave_segura_de_access_token
REFRESH_TOKEN_SECRET=troque_por_uma_chave_segura_de_refresh_token
ACCESS_TOKEN_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d

VITE_BACKEND_URL=
```

> Nunca commite arquivos `.env` reais. O `.env.example` deve conter apenas placeholders.

---

## 🚀 Como Rodar Localmente sem Docker

### 1. Acessar a pasta do backend

```bash
cd server
```

### 2. Instalar dependências

```bash
npm install
```

### 3. Criar `.env`

```bash
cp .env.example .env
```

Configure a variável `DATABASE_URL` para apontar para um banco PostgreSQL válido.

### 4. Gerar Prisma Client

```bash
npm run prisma:generate
```

### 5. Rodar migrations em desenvolvimento

```bash
npm run prisma:migrate
```

### 6. Rodar seed, se necessário

```bash
npx prisma db seed
```

### 7. Iniciar servidor

```bash
npm run dev
```

A API ficará disponível em:

```txt
http://localhost:3000
```

Base das rotas:

```txt
http://localhost:3000/api
```

---

## 📜 Scripts Disponíveis

| Script                    | Descrição                                                               |
| ------------------------- | ----------------------------------------------------------------------- |
| `npm run dev`             | Inicia o servidor em modo desenvolvimento com `tsx watch src/server.ts` |
| `npm run build`           | Compila o projeto TypeScript                                            |
| `npm run start`           | Executa o build                                                         |
| `npm run prisma:generate` | Gera o Prisma Client                                                    |
| `npm run prisma:migrate`  | Executa migrations em modo desenvolvimento                              |

### Scripts Prisma

| Script                      | Descrição                                        |
| --------------------------- | ------------------------------------------------ |
| `npx prisma generate`       | Gera Prisma Client                               |
| `npx prisma migrate deploy` | Aplica migrations em ambiente de deploy/produção |
| `npx prisma migrate dev`    | Cria/aplica migrations em desenvolvimento        |
| `npx prisma db seed`        | Executa seed configurado em `package.json`       |

O seed principal executa:

```txt
tsx prisma/seed.ts
```

---

## 🐳 Docker

A infraestrutura Docker do projeto possui três modos principais:

| Arquivo                    | Banco usado                      | Finalidade                     |
| -------------------------- | -------------------------------- | ------------------------------ |
| `docker-compose.yml`       | PostgreSQL local em container    | Produção/local e demonstração  |
| `docker-compose.dev.yml`   | PostgreSQL local em container    | Desenvolvimento com hot reload |
| `docker-compose.cloud.yml` | PostgreSQL em nuvem, como Render | Teste com banco remoto         |

### Backend no Docker

O `server/Dockerfile` possui stages para:

| Stage   | Uso                                     |
| ------- | --------------------------------------- |
| `deps`  | Instala dependências                    |
| `build` | Gera Prisma Client e compila TypeScript |
| `dev`   | Executa backend em modo desenvolvimento |
| `prod`  | Executa backend compilado               |

No modo produção/local, o backend deve executar no start:

```bash
npx prisma generate
npx prisma migrate deploy
node dist/src/server.js
```

Isso garante que:

* o Prisma Client seja gerado;
* as migrations sejam aplicadas;
* o servidor seja iniciado.

### Seed no Docker

O seed **não é executado automaticamente** no start do container para evitar duplicação de dados.

Após subir os containers, rode manualmente quando o banco estiver vazio:

```bash
docker compose exec server npx prisma db seed
```

No modo dev:

```bash
docker compose -f docker-compose.dev.yml exec server npx prisma db seed
```

No modo cloud, use com cuidado, pois o comando altera o banco remoto:

```bash
docker compose -f docker-compose.cloud.yml exec server npx prisma db seed
```

### Execução Docker produção/local

Na raiz do projeto:

```bash
cp .env.example .env
docker compose config
docker compose up -d --build
docker compose exec server npx prisma db seed
```

A API estará em:

```txt
http://localhost:3000/api
```

### Execução Docker dev

```bash
docker compose -f docker-compose.dev.yml config
docker compose -f docker-compose.dev.yml up -d --build
docker compose -f docker-compose.dev.yml exec server npx prisma db seed
```

### Execução Docker cloud

```bash
cp .env.example .env.cloud
docker compose -f docker-compose.cloud.yml config
docker compose -f docker-compose.cloud.yml up -d --build
```

---

## 🔐 Autenticação

A autenticação usa JWT com dois tokens:

| Token         | Uso                                    |
| ------------- | -------------------------------------- |
| Access Token  | Autorização das requisições protegidas |
| Refresh Token | Renovação da sessão                    |

### Variáveis obrigatórias

```env
ACCESS_TOKEN_SECRET=...
REFRESH_TOKEN_SECRET=...
ACCESS_TOKEN_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d
```

As chaves `ACCESS_TOKEN_SECRET` e `REFRESH_TOKEN_SECRET` devem ser diferentes.

### Rotas de autenticação

Base:

```txt
/api/auth
```

| Método | Rota                | Descrição                          | Autenticação |
| ------ | ------------------- | ---------------------------------- | ------------ |
| POST   | `/api/auth/login`   | Autentica usuário e retorna tokens | Pública      |
| POST   | `/api/auth/refresh` | Renova o par de tokens             | Pública      |
| POST   | `/api/auth/logout`  | Encerra a sessão/logout            | Pública      |

### Exemplo de login

```json
{
  "email": "usuario@email.com",
  "password": "senha123"
}
```

### Autorização em rotas protegidas

Rotas protegidas exigem header:

```txt
Authorization: Bearer <access_token>
```

---

## 👤 Controle de Acesso e Permissões

O backend usa controle de acesso baseado em papéis.

### Roles

| Role              | Descrição     | Nível |
| ----------------- | ------------- | ----- |
| `ATTENDANT`       | Atendente     | 1     |
| `MANAGER`         | Gerente       | 2     |
| `GENERAL_MANAGER` | Gerente Geral | 3     |
| `ADMIN`           | Administrador | 4     |

### Middlewares principais

| Middleware           | Responsabilidade                  |
| -------------------- | --------------------------------- |
| `authMiddleware`     | Valida JWT e injeta `req.user`    |
| `checkPermission`    | Verifica permissão por hierarquia |
| `checkRole`          | Verifica roles explícitas         |
| `validateBody`       | Valida body com Zod               |
| `validateQuery`      | Valida query params com Zod       |
| `validateParams`     | Valida route params com Zod       |
| `globalErrorHandler` | Trata erros da aplicação          |

### Diferença entre `checkPermission` e `checkRole`

`checkPermission("MANAGER")` aprova:

```txt
MANAGER, GENERAL_MANAGER, ADMIN
```

`checkRole("MANAGER", "ADMIN")` aprova apenas:

```txt
MANAGER, ADMIN
```

Além dos middlewares, regras granulares de escopo são aplicadas nos services, como:

* atendente visualizar apenas seus próprios dados;
* gerente visualizar dados da equipe;
* gerente geral visualizar escopo global;
* restrições de edição por recurso e perfil.

---

## 🌐 Base da API

O arquivo `app.ts` registra o router principal em:

```txt
/api
```

Portanto, todas as rotas dos módulos abaixo usam o prefixo:

```txt
http://localhost:3000/api
```

Rota de teste:

| Método | Rota | Descrição                              |
| ------ | ---- | -------------------------------------- |
| GET    | `/`  | Retorna mensagem de boas-vindas da API |

---

## 🧩 Módulos Implementados

### Auth/Login

Diretório:

```txt
src/modules/auth/login/
```

Responsável por login, refresh token e logout.

Rotas:

* `POST /api/auth/login`
* `POST /api/auth/refresh`
* `POST /api/auth/logout`

---

### Users

Diretório:

```txt
src/modules/users/
```

Responsável pelo gerenciamento de usuários.

Rotas:

| Método | Rota                  | Permissão                          |
| ------ | --------------------- | ---------------------------------- |
| GET    | `/api/users`          | `MANAGER` ou superior              |
| GET    | `/api/users/:id`      | Qualquer usuário autenticado       |
| POST   | `/api/users`          | `ADMIN`                            |
| PUT    | `/api/users/:id`      | Autenticado, com regras no service |
| PATCH  | `/api/users/:id`      | Autenticado, com regras no service |
| DELETE | `/api/users/:id`      | `ADMIN`                            |
| DELETE | `/api/users/:id/hard` | `ADMIN`                            |

---

### Customers

Diretório:

```txt
src/modules/customers/
```

Responsável pelo gerenciamento de clientes/prospects.

Rotas:

| Método | Rota                      | Permissão   |
| ------ | ------------------------- | ----------- |
| GET    | `/api/customers`          | Autenticado |
| GET    | `/api/customers/:id`      | Autenticado |
| POST   | `/api/customers`          | Autenticado |
| PUT    | `/api/customers/:id`      | Autenticado |
| PATCH  | `/api/customers/:id`      | Autenticado |
| DELETE | `/api/customers/:id`      | Autenticado |
| DELETE | `/api/customers/:id/hard` | `ADMIN`     |

---

### Stores

Diretório:

```txt
src/modules/stores/
```

Responsável pelo gerenciamento de lojas.

Rotas:

| Método | Rota                   | Permissão   |
| ------ | ---------------------- | ----------- |
| GET    | `/api/stores`          | Autenticado |
| GET    | `/api/stores/:id`      | Autenticado |
| POST   | `/api/stores`          | `ADMIN`     |
| PUT    | `/api/stores/:id`      | `ADMIN`     |
| PATCH  | `/api/stores/:id`      | `ADMIN`     |
| DELETE | `/api/stores/:id`      | `ADMIN`     |
| DELETE | `/api/stores/:id/hard` | `ADMIN`     |

---

### Teams

Diretório:

```txt
src/modules/teams/
```

Responsável pelo gerenciamento de equipes.

Rotas:

| Método | Rota                  | Permissão                    |
| ------ | --------------------- | ---------------------------- |
| GET    | `/api/teams`          | `GENERAL_MANAGER` ou `ADMIN` |
| GET    | `/api/teams/:id`      | Autenticado                  |
| POST   | `/api/teams`          | `GENERAL_MANAGER` ou `ADMIN` |
| PUT    | `/api/teams/:id`      | `GENERAL_MANAGER` ou `ADMIN` |
| PATCH  | `/api/teams/:id`      | `GENERAL_MANAGER` ou `ADMIN` |
| DELETE | `/api/teams/:id`      | `GENERAL_MANAGER` ou `ADMIN` |
| DELETE | `/api/teams/:id/hard` | `ADMIN`                      |

---

### Users Teams

Diretório:

```txt
src/modules/users-teams/
```

Responsável pelo vínculo entre usuários e equipes.

Rotas:

| Método | Rota                        | Permissão                    |
| ------ | --------------------------- | ---------------------------- |
| GET    | `/api/users-teams`          | Autenticado                  |
| GET    | `/api/users-teams/:id`      | Autenticado                  |
| POST   | `/api/users-teams`          | `GENERAL_MANAGER` ou `ADMIN` |
| PUT    | `/api/users-teams/:id`      | `GENERAL_MANAGER` ou `ADMIN` |
| PATCH  | `/api/users-teams/:id`      | `GENERAL_MANAGER` ou `ADMIN` |
| DELETE | `/api/users-teams/:id`      | `GENERAL_MANAGER` ou `ADMIN` |
| DELETE | `/api/users-teams/:id/hard` | `ADMIN`                      |

---

### Interest Items

Diretório:

```txt
src/modules/interest-items/
```

Responsável pelos itens de interesse vinculados a leads, como veículos ou produtos de interesse.

Rotas:

| Método | Rota                           | Permissão                     |
| ------ | ------------------------------ | ----------------------------- |
| GET    | `/api/interest-items`          | Autenticado                   |
| GET    | `/api/interest-items/:id`      | Autenticado                   |
| POST   | `/api/interest-items`          | `GENERAL_MANAGER` ou superior |
| PUT    | `/api/interest-items/:id`      | `GENERAL_MANAGER` ou superior |
| PATCH  | `/api/interest-items/:id`      | `GENERAL_MANAGER` ou superior |
| DELETE | `/api/interest-items/:id`      | `GENERAL_MANAGER` ou superior |
| DELETE | `/api/interest-items/:id/hard` | `ADMIN`                       |

---

### Leads

Diretório:

```txt
src/modules/leads/
```

Responsável pelo gerenciamento de leads.

Rotas:

| Método | Rota                               | Permissão                          |
| ------ | ---------------------------------- | ---------------------------------- |
| GET    | `/api/leads`                       | Autenticado                        |
| GET    | `/api/leads/:id`                   | Autenticado                        |
| POST   | `/api/leads`                       | Autenticado                        |
| PUT    | `/api/leads/:id`                   | Autenticado, com regras no service |
| PATCH  | `/api/leads/:id`                   | Autenticado, com regras no service |
| DELETE | `/api/leads/:id`                   | Autenticado, com regras no service |
| DELETE | `/api/leads/:id/permanent`         | `ADMIN`                            |
| POST   | `/api/leads/bulk/assign-attendant` | `MANAGER` ou `ADMIN`               |
| POST   | `/api/leads/bulk/assign-team`      | `GENERAL_MANAGER` ou `ADMIN`       |

---

### Negotiations

Diretório:

```txt
src/modules/negotiation/
```

Responsável pelo gerenciamento de negociações.

Rotas:

| Método | Rota                                      | Permissão                          |
| ------ | ----------------------------------------- | ---------------------------------- |
| GET    | `/api/negotiations`                       | Autenticado                        |
| GET    | `/api/negotiations/:id`                   | Autenticado                        |
| POST   | `/api/negotiations`                       | Autenticado                        |
| PUT    | `/api/negotiations/:id`                   | Autenticado, com regras no service |
| PATCH  | `/api/negotiations/:id`                   | Autenticado, com regras no service |
| DELETE | `/api/negotiations/:id`                   | `ADMIN`                            |
| POST   | `/api/negotiations/bulk/assign-attendant` | `MANAGER` ou `ADMIN`               |
| POST   | `/api/negotiations/bulk/assign-team`      | `GENERAL_MANAGER` ou `ADMIN`       |

---

### Negotiation Status

Diretório:

```txt
src/modules/negotiation-status/
```

Responsável pelo histórico de status de uma negociação.

Rotas:

| Método | Rota                          | Permissão   |
| ------ | ----------------------------- | ----------- |
| GET    | `/api/negotiation-status`     | Autenticado |
| GET    | `/api/negotiation-status/:id` | Autenticado |
| POST   | `/api/negotiation-status`     | Autenticado |
| PUT    | `/api/negotiation-status/:id` | Autenticado |
| PATCH  | `/api/negotiation-status/:id` | Autenticado |
| DELETE | `/api/negotiation-status/:id` | `ADMIN`     |

---

### Negotiation Importance

Diretório:

```txt
src/modules/negotiation-importance/
```

Responsável pelo histórico de importância de uma negociação.

Rotas:

| Método | Rota                              | Permissão   |
| ------ | --------------------------------- | ----------- |
| GET    | `/api/negotiation-importance`     | Autenticado |
| GET    | `/api/negotiation-importance/:id` | Autenticado |
| POST   | `/api/negotiation-importance`     | Autenticado |
| PUT    | `/api/negotiation-importance/:id` | Autenticado |
| PATCH  | `/api/negotiation-importance/:id` | Autenticado |
| DELETE | `/api/negotiation-importance/:id` | `ADMIN`     |

---

### Negotiation Stage History

Diretório:

```txt
src/modules/negotiation-stage-history/
```

Responsável pelo histórico de etapas do funil de negociação.

Rotas:

| Método | Rota                                 | Permissão   |
| ------ | ------------------------------------ | ----------- |
| GET    | `/api/negotiation-stage-history`     | Autenticado |
| GET    | `/api/negotiation-stage-history/:id` | Autenticado |
| POST   | `/api/negotiation-stage-history`     | Autenticado |
| PUT    | `/api/negotiation-stage-history/:id` | Autenticado |
| PATCH  | `/api/negotiation-stage-history/:id` | Autenticado |
| DELETE | `/api/negotiation-stage-history/:id` | `ADMIN`     |

---

## 📊 Dashboards

### Dashboard do Atendente

Base:

```txt
/api/dashboards/attendant
```

Permissão mínima:

```txt
ATTENDANT
```

Rotas:

| Método | Rota                                                     |
| ------ | -------------------------------------------------------- |
| GET    | `/api/dashboards/attendant/kpi/active-leads`             |
| GET    | `/api/dashboards/attendant/kpi/converted-leads`          |
| GET    | `/api/dashboards/attendant/kpi/conversion-rate`          |
| GET    | `/api/dashboards/attendant/kpi/avg-service-time`         |
| GET    | `/api/dashboards/attendant/charts/leads-evolution`       |
| GET    | `/api/dashboards/attendant/charts/sales-funnel`          |
| GET    | `/api/dashboards/attendant/charts/leads-by-source`       |
| GET    | `/api/dashboards/attendant/charts/conversions-by-period` |

---

### Dashboard do Gerente

Base:

```txt
/api/dashboards/manager
```

Permissão mínima:

```txt
MANAGER
```

Rotas:

| Método | Rota                                                      |
| ------ | --------------------------------------------------------- |
| GET    | `/api/dashboards/manager/kpi/team`                        |
| GET    | `/api/dashboards/manager/kpi/top-attendant`               |
| GET    | `/api/dashboards/manager/charts/leads-by-attendant`       |
| GET    | `/api/dashboards/manager/charts/conversions-by-attendant` |
| GET    | `/api/dashboards/manager/charts/team-evolution`           |
| GET    | `/api/dashboards/manager/charts/team-funnel`              |

---

### Dashboard do Gerente Geral

Base:

```txt
/api/dashboards/general-manager
```

Permissão mínima:

```txt
GENERAL_MANAGER
```

Rotas:

| Método | Rota                                                      |
| ------ | --------------------------------------------------------- |
| GET    | `/api/dashboards/general-manager/kpi/global`              |
| GET    | `/api/dashboards/general-manager/kpi/top-team`            |
| GET    | `/api/dashboards/general-manager/charts/leads-by-team`    |
| GET    | `/api/dashboards/general-manager/charts/team-ranking`     |
| GET    | `/api/dashboards/general-manager/charts/global-evolution` |
| GET    | `/api/dashboards/general-manager/charts/global-funnel`    |

---

## 🗄️ Banco de Dados

O projeto usa PostgreSQL com Prisma.

Modelos definidos no `schema.prisma`:

| Model                     | Tabela                      |
| ------------------------- | --------------------------- |
| `Stores`                  | `stores`                    |
| `Teams`                   | `teams`                     |
| `Users`                   | `users`                     |
| `UserTeams`               | `user_teams`                |
| `Customers`               | `customers`                 |
| `InterestItems`           | `interest_items`            |
| `Leads`                   | `leads`                     |
| `Negotiations`            | `negotiations`              |
| `NegotiationStatus`       | `negotiation_status`        |
| `NegotiationStageHistory` | `negotiation_stage_history` |
| `NegotiationImportance`   | `negotiation_importance`    |
| `SystemLogs`              | `system_logs`               |

---

## 🧪 Validação e Tratamento de Erros

O backend utiliza Zod para validação de:

* body;
* query params;
* route params.

Middlewares de validação:

```txt
validateBody
validateQuery
validateParams
```

Erros são tratados pelo middleware global:

```txt
globalErrorHandler
```

---

## 🌐 CORS

O backend permite requisições dos seguintes ambientes de desenvolvimento:

```txt
http://localhost:5173
http://localhost:5174
```

No Docker produção/local, o frontend é servido pelo Nginx e acessa a API pelo proxy `/api`, evitando problema de CORS.

---

## ⚠️ Funcionalidades Planejadas ou Pendentes

As funcionalidades abaixo aparecem como requisitos, modelos, comentários ou arquivos previstos, mas **não devem ser consideradas endpoints implementados nesta versão do backend**.

| Funcionalidade                     | Status                                                           |
| ---------------------------------- | ---------------------------------------------------------------- |
| Recuperação de senha por e-mail    | Não há endpoint implementado                                     |
| Redefinição de senha por token     | Não há endpoint implementado                                     |
| `GET /api/users/me`                | Não implementado                                                 |
| `PATCH /api/users/me`              | Não implementado                                                 |
| `GET /api/logs`                    | Não implementado                                                 |
| Módulo de logs/auditoria           | Existe model `SystemLogs`, mas não há módulo/rotas implementadas |
| `POST /api/leads/:id/transfer`     | Não implementado                                                 |
| `GET /api/leads/:id/history`       | Não implementado                                                 |
| Seed automático ao subir container | Não implementado por decisão técnica; seed é manual              |

---

## ✅ Checklist da Documentação Backend

Esta documentação cobre:

* estrutura real do `server`;
* tecnologias utilizadas;
* módulos reais do backend;
* rotas reais registradas em `/api`;
* autenticação e permissões;
* variáveis de ambiente;
* Docker, Prisma, migrations e seed;
* pendências conhecidas;
* endpoints que não devem ser considerados implementados.

---

## 📚 Documentação Relacionada

| Recurso                  | Caminho                      |
| ------------------------ | ---------------------------- |
| README principal         | `../README.md`               |
| Guia de execução Docker  | `../HOWTORUN.md`             |
| Documentação do frontend | `../client/README.md`        |
| Sprint 1                 | `../docs/sprint-1/README.md` |
| Sprint 2                 | `../docs/sprint-2/README.md` |
| Sprint 3                 | `../docs/sprint-3/README.md` |

---

<div align="center">

ABP 2026-1 · 3DSM · FATEC Jacareí
Parceiro: 1000 Valle Multimarcas
Focal Point: Prof. Arley Ferreira de Souza

</div>
