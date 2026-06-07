# 🎨 Valle Leads System — Frontend

<div align="center">

![React](https://img.shields.io/badge/React-18-20232A?style=for-the-badge\&logo=react\&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge\&logo=typescript\&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge\&logo=vite\&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-4-38B2AC?style=for-the-badge\&logo=tailwind-css\&logoColor=white)
![React Router](https://img.shields.io/badge/React_Router-7-CA4245?style=for-the-badge\&logo=reactrouter\&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Nginx-2496ED?style=for-the-badge\&logo=docker\&logoColor=white)

**Sistema de Gestão de Leads com Dashboard Analítico — 1000 Valle Multimarcas**
ABP 2026-1 · 3DSM · FATEC Jacareí

</div>

---

## 📖 Sobre o Frontend

O frontend do **Valle Leads System** é responsável pela interface utilizada pelos usuários da 1000 Valle Multimarcas para acessar leads, negociações, dashboards, usuários, equipes, lojas e perfil.

A aplicação foi construída com **React**, **TypeScript**, **Vite**, **Tailwind CSS** e **React Router**, consumindo a API do backend por meio de services centralizados.

O sistema contempla diferentes visões de acesso:

* **Atendente**
* **Gerente**
* **Gerente Geral**
* **Administrador**

Cada perfil visualiza apenas as páginas permitidas pelas regras de navegação e autorização do frontend, em conjunto com as regras de segurança aplicadas no backend.

---

## 🧭 Objetivo da Interface

A interface tem como objetivo oferecer uma experiência clara e organizada para:

* autenticação do usuário;
* navegação protegida por perfil;
* visualização e gestão de leads;
* acompanhamento do funil de negociações;
* consulta de dashboards;
* gestão de usuários;
* gestão de equipes;
* gestão de lojas;
* edição de perfil;
* visualização de páginas de erro e acesso negado.

---

## 🛠️ Tecnologias Utilizadas

| Tecnologia       | Uso                                 |
| ---------------- | ----------------------------------- |
| React            | Construção da interface             |
| TypeScript       | Tipagem estática                    |
| Vite             | Ambiente de desenvolvimento e build |
| Tailwind CSS     | Estilização da aplicação            |
| React Router DOM | Gerenciamento de rotas              |
| Framer Motion    | Animações e transições              |
| DnD Kit          | Suporte a drag-and-drop no funil    |
| Lucide React     | Ícones da interface                 |
| React Icons      | Ícones adicionais                   |
| Fetch API        | Comunicação com o backend           |
| Docker           | Execução conteinerizada             |
| Nginx            | Servidor da build de produção       |

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

A aplicação pode ser executada de duas formas:

1. via **Docker Compose**, a partir da raiz do projeto;
2. localmente, a partir da pasta `/client`.

---

## 🐳 Execução com Docker

> Recomendado para execução integrada com backend e banco de dados.

### Pré-requisitos

* Docker
* Docker Compose
* Git

### 1. Clone o repositório

```bash
git clone https://github.com/Helloworld-fatec/valle-leads-system.git
cd valle-leads-system
```

### 2. Configure o `.env` da raiz

O `docker-compose.yml` do projeto utiliza variáveis de ambiente a partir de um arquivo `.env` na raiz do repositório.

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

Esse comando sobe os serviços principais do projeto:

* banco PostgreSQL;
* backend;
* frontend.

### 4. Acesse o frontend

```txt
http://localhost:5173
```

> Em ambiente de produção/container Nginx, a aplicação pode ser servida pela porta definida no `docker-compose.yml`.

---

## 💻 Execução Local do Frontend

### 1. Acesse a pasta do frontend

```bash
cd client
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure o arquivo `.env`

Crie um arquivo `.env` dentro da pasta `/client` com base no `.env.example`.

```bash
cp .env.example .env
```

Exemplo:

```env
VITE_BACKEND_URL=http://localhost:3000
```

> O frontend usa `VITE_BACKEND_URL` como URL base para chamadas à API.
> As rotas chamadas pelos services incluem o prefixo `/api`.

### 4. Inicie o servidor de desenvolvimento

```bash
npm run dev
```

A aplicação estará disponível em:

```txt
http://localhost:5173
```

---

## 📜 Scripts Disponíveis

| Script            | Descrição                                              |
| ----------------- | ------------------------------------------------------ |
| `npm run dev`     | Inicia o frontend em modo desenvolvimento              |
| `npm run build`   | Executa TypeScript e gera a build de produção com Vite |
| `npm run preview` | Executa uma prévia local da build de produção          |

---

## 🔑 Variáveis de Ambiente

### `client/.env`

| Variável           | Descrição           | Exemplo                 |
| ------------------ | ------------------- | ----------------------- |
| `VITE_BACKEND_URL` | URL base do backend | `http://localhost:3000` |

### Exemplo

```env
VITE_BACKEND_URL=http://localhost:3000
```

> Nunca commite arquivos `.env` reais no repositório.

---

## 📁 Estrutura de Pastas

```txt
client/
├── docs/
│   ├── croquis/
│   │   ├── dashboards.png
│   │   ├── funil.png
│   │   ├── lead.png
│   │   ├── logins.png
│   │   ├── Perfil.png
│   │   └── Usuario.png
│   └── style/
│       └── STYLE_GUIDE.md
├── public/
│   └── logo.jpeg
├── src/
│   ├── assets/
│   │   ├── logo.jpeg
│   │   └── logo.svg
│   ├── components/
│   │   ├── dashboards/
│   │   ├── leads/
│   │   ├── profile/
│   │   ├── sales-funnel/
│   │   ├── stores/
│   │   ├── teams/
│   │   ├── users/
│   │   ├── ErrorBoundary.tsx
│   │   ├── Header.tsx
│   │   └── Sidebar.tsx
│   ├── contexts/
│   │   └── AuthContext.tsx
│   ├── data/
│   │   └── mockUsers.ts
│   ├── hook/
│   │   └── useAuth.tsx
│   ├── layouts/
│   │   └── MainLayout.tsx
│   ├── pages/
│   │   ├── Config.tsx
│   │   ├── Dashboard.tsx
│   │   ├── DashboardAttendant.tsx
│   │   ├── DashboardGeneralManager.tsx
│   │   ├── DashboardManager.tsx
│   │   ├── Forbidden.tsx
│   │   ├── GMLeads.tsx
│   │   ├── Leads.tsx
│   │   ├── Login.tsx
│   │   ├── ManagerLeads.tsx
│   │   ├── NotFound.tsx
│   │   ├── Profile.tsx
│   │   ├── SalesFunnel.tsx
│   │   ├── Stores.tsx
│   │   ├── Teams.tsx
│   │   └── Users.tsx
│   ├── routes/
│   │   ├── index.tsx
│   │   ├── ProtectedRoute.tsx
│   │   └── PublicOnlyRoute.tsx
│   ├── services/
│   │   ├── api.ts
│   │   ├── clientService.ts
│   │   ├── dashboardService.ts
│   │   ├── itemService.ts
│   │   ├── leadService.ts
│   │   ├── loginService.ts
│   │   ├── negotiationsService.ts
│   │   ├── profileService.ts
│   │   ├── storesService.ts
│   │   ├── teamService.ts
│   │   ├── userService.ts
│   │   └── userTeamsService.ts
│   ├── types/
│   ├── utils/
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
├── Dockerfile
├── nginx.conf
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 🧱 Organização Geral

### `src/pages`

Contém as páginas principais da aplicação.

### `src/components`

Contém componentes reutilizáveis e componentes específicos por módulo.

### `src/services`

Contém os services responsáveis pela comunicação com a API.

### `src/routes`

Contém as rotas públicas, protegidas e protegidas por perfil.

### `src/contexts`

Contém o contexto global de autenticação.

### `src/layouts`

Contém o layout principal da aplicação autenticada.

### `src/types`

Contém tipagens TypeScript compartilhadas.

### `src/docs`

Contém croquis, referências visuais e guia de estilo.

---

## 🔐 Autenticação e Sessão

A autenticação do frontend é gerenciada pelo `AuthContext`.

### Arquivos principais

| Arquivo                          | Responsabilidade                                                  |
| -------------------------------- | ----------------------------------------------------------------- |
| `src/contexts/AuthContext.tsx`   | Mantém usuário autenticado, access token e estado de autenticação |
| `src/hook/useAuth.tsx`           | Hook de acesso ao contexto de autenticação                        |
| `src/services/loginService.ts`   | Realiza login e logout                                            |
| `src/services/api.ts`            | Centraliza chamadas autenticadas à API                            |
| `src/routes/ProtectedRoute.tsx`  | Protege rotas autenticadas e rotas por role                       |
| `src/routes/PublicOnlyRoute.tsx` | Impede usuário autenticado de acessar `/login`                    |

### Dados persistidos no `localStorage`

| Chave          | Descrição                    |
| -------------- | ---------------------------- |
| `authUser`     | Dados do usuário autenticado |
| `accessToken`  | Token de acesso              |
| `refreshToken` | Token de renovação           |

### Fluxo de autenticação

```txt
Login
  ↓
POST /api/auth/login
  ↓
Armazena user, accessToken e refreshToken
  ↓
Redireciona para /funil
  ↓
useApi injeta Authorization: Bearer <token>
  ↓
Em caso de 401, tenta POST /api/auth/refresh
  ↓
Se refresh falhar, realiza logout e redireciona para /login
```

---

## 🧭 Rotas da Aplicação

### Rotas públicas

| Rota     | Página      | Descrição            |
| -------- | ----------- | -------------------- |
| `/login` | `Login.tsx` | Tela de autenticação |

### Rotas de erro

| Rota   | Página          | Descrição             |
| ------ | --------------- | --------------------- |
| `/403` | `Forbidden.tsx` | Acesso negado         |
| `/404` | `NotFound.tsx`  | Página não encontrada |

### Rotas protegidas para qualquer usuário autenticado

| Rota         | Página            | Descrição                                      |
| ------------ | ----------------- | ---------------------------------------------- |
| `/`          | Redirect          | Redireciona para `/funil`                      |
| `/funil`     | `SalesFunnel.tsx` | Funil de negociações                           |
| `/dashboard` | `Dashboard.tsx`   | Dashboard redirecionado/consolidado por perfil |
| `/leads`     | `Leads.tsx`       | Listagem de leads                              |
| `/perfil`    | `Profile.tsx`     | Perfil do usuário autenticado                  |

### Rotas protegidas para `MANAGER`, `GENERAL_MANAGER` e `ADMIN`

| Rota             | Página             | Descrição                    |
| ---------------- | ------------------ | ---------------------------- |
| `/manager/leads` | `ManagerLeads.tsx` | Gestão de leads pelo gerente |
| `/usuarios`      | `Users.tsx`        | Gestão/listagem de usuários  |
| `/teams`         | `Teams.tsx`        | Gestão de equipes            |
| `/config`        | `Config.tsx`       | Configurações                |

### Rotas protegidas para `GENERAL_MANAGER` e `ADMIN`

| Rota        | Página        | Descrição                          |
| ----------- | ------------- | ---------------------------------- |
| `/stores`   | `Stores.tsx`  | Gestão de lojas                    |
| `/gm/leads` | `GMLeads.tsx` | Gestão de leads pelo gerente geral |

---

## 👤 Perfis de Usuário

| Role              | Descrição     |
| ----------------- | ------------- |
| `ATTENDANT`       | Atendente     |
| `MANAGER`         | Gerente       |
| `GENERAL_MANAGER` | Gerente Geral |
| `ADMIN`           | Administrador |

### Observação

O controle de acesso no frontend melhora a navegação e a experiência do usuário, mas as regras de permissão também devem existir no backend. O frontend não deve ser considerado a única camada de segurança.

---

## 🌐 Comunicação com a API

A comunicação com o backend é feita por meio de services centralizados.

### `useApi`

O hook `useApi`, definido em `src/services/api.ts`, fornece o método `apiFetch`.

Ele é responsável por:

* aplicar a URL base definida em `VITE_BACKEND_URL`;
* inserir automaticamente o header `Authorization`;
* tratar respostas `401`;
* renovar o access token via refresh token;
* repetir a requisição original após refresh bem-sucedido;
* converter erros HTTP em `ApiError`.

### Exemplo de uso

```ts
const { apiFetch } = useApi();

const response = await apiFetch("/api/leads");
const data = await response.json();
```

---

## 📦 Services Implementados

| Service            | Arquivo                  | Responsabilidade                                            |
| ------------------ | ------------------------ | ----------------------------------------------------------- |
| API base           | `api.ts`                 | Fetch autenticado, refresh token e tratamento de erros      |
| Login              | `loginService.ts`        | Login e logout                                              |
| Clientes           | `clientService.ts`       | Integração com `/api/customers`                             |
| Dashboards         | `dashboardService.ts`    | Integração com dashboards por perfil                        |
| Itens de Interesse | `itemService.ts`         | Integração com `/api/interest-items`                        |
| Leads              | `leadService.ts`         | Integração com `/api/leads` e criação de negociação         |
| Negociações        | `negotiationsService.ts` | Integração com negociações, status, importância e histórico |
| Perfil             | `profileService.ts`      | Busca e atualização do usuário autenticado por ID           |
| Lojas              | `storesService.ts`       | Integração com `/api/stores`                                |
| Equipes            | `teamService.ts`         | Integração com `/api/teams`                                 |
| Usuários           | `userService.ts`         | Integração com `/api/users`                                 |
| Usuários/Equipes   | `userTeamsService.ts`    | Integração com `/api/users-teams`                           |

> O arquivo `logService.ts` existe na estrutura, mas ainda não possui implementação funcional.

---

## 🔌 Endpoints Consumidos pelo Frontend

### Auth

| Método | Endpoint            | Usado por         |
| ------ | ------------------- | ----------------- |
| POST   | `/api/auth/login`   | `loginService.ts` |
| POST   | `/api/auth/refresh` | `api.ts`          |
| POST   | `/api/auth/logout`  | `loginService.ts` |

### Users

| Método | Endpoint              | Usado por                               |
| ------ | --------------------- | --------------------------------------- |
| GET    | `/api/users`          | `userService.ts`, `dashboardService.ts` |
| GET    | `/api/users/:id`      | `userService.ts`, `profileService.ts`   |
| POST   | `/api/users`          | `userService.ts`                        |
| PUT    | `/api/users/:id`      | `userService.ts`, `profileService.ts`   |
| DELETE | `/api/users/:id`      | `userService.ts`                        |
| DELETE | `/api/users/:id/hard` | `userService.ts`                        |

### Customers

| Método | Endpoint                  | Usado por          |
| ------ | ------------------------- | ------------------ |
| GET    | `/api/customers`          | `clientService.ts` |
| GET    | `/api/customers/:id`      | `clientService.ts` |
| POST   | `/api/customers`          | `clientService.ts` |
| PATCH  | `/api/customers/:id`      | `clientService.ts` |
| DELETE | `/api/customers/:id`      | `clientService.ts` |
| DELETE | `/api/customers/:id/hard` | `clientService.ts` |

### Leads

| Método | Endpoint                      | Usado por        |
| ------ | ----------------------------- | ---------------- |
| GET    | `/api/leads`                  | `leadService.ts` |
| GET    | `/api/leads/:id`              | `leadService.ts` |
| PATCH  | `/api/leads/:id`              | `leadService.ts` |
| POST   | `/api/leads/bulk/assign-team` | `leadService.ts` |
| POST   | `/api/negotiations`           | `leadService.ts` |

> O service de leads também apoia fluxos de criação de negociação a partir de um lead.

### Interest Items

| Método | Endpoint                       | Usado por        |
| ------ | ------------------------------ | ---------------- |
| GET    | `/api/interest-items`          | `itemService.ts` |
| GET    | `/api/interest-items/:id`      | `itemService.ts` |
| POST   | `/api/interest-items`          | `itemService.ts` |
| PATCH  | `/api/interest-items/:id`      | `itemService.ts` |
| DELETE | `/api/interest-items/:id`      | `itemService.ts` |
| DELETE | `/api/interest-items/:id/hard` | `itemService.ts` |

### Negotiations

| Método | Endpoint                | Usado por                                  |
| ------ | ----------------------- | ------------------------------------------ |
| GET    | `/api/negotiations`     | `negotiationsService.ts`                   |
| GET    | `/api/negotiations/:id` | `negotiationsService.ts`                   |
| POST   | `/api/negotiations`     | `negotiationsService.ts`, `leadService.ts` |

### Negotiation Stage History

| Método | Endpoint                                         | Usado por                |
| ------ | ------------------------------------------------ | ------------------------ |
| GET    | `/api/negotiation-stage-history?negotiation_id=` | `negotiationsService.ts` |
| POST   | `/api/negotiation-stage-history`                 | `negotiationsService.ts` |

### Negotiation Importance

| Método | Endpoint                                      | Usado por                |
| ------ | --------------------------------------------- | ------------------------ |
| GET    | `/api/negotiation-importance?negotiation_id=` | `negotiationsService.ts` |
| POST   | `/api/negotiation-importance`                 | `negotiationsService.ts` |

### Negotiation Status

| Método | Endpoint                                  | Usado por                |
| ------ | ----------------------------------------- | ------------------------ |
| GET    | `/api/negotiation-status?negotiation_id=` | `negotiationsService.ts` |
| POST   | `/api/negotiation-status`                 | `negotiationsService.ts` |

### Stores

| Método | Endpoint               | Usado por          |
| ------ | ---------------------- | ------------------ |
| GET    | `/api/stores`          | `storesService.ts` |
| GET    | `/api/stores/:id`      | `storesService.ts` |
| POST   | `/api/stores`          | `storesService.ts` |
| PATCH  | `/api/stores/:id`      | `storesService.ts` |
| DELETE | `/api/stores/:id`      | `storesService.ts` |
| DELETE | `/api/stores/:id/hard` | `storesService.ts` |

### Teams

| Método | Endpoint         | Usado por                               |
| ------ | ---------------- | --------------------------------------- |
| GET    | `/api/teams`     | `teamService.ts`, `dashboardService.ts` |
| GET    | `/api/teams/:id` | `teamService.ts`                        |
| POST   | `/api/teams`     | `teamService.ts`                        |
| PATCH  | `/api/teams/:id` | `teamService.ts`                        |
| DELETE | `/api/teams/:id` | `teamService.ts`                        |

### Users Teams

| Método | Endpoint                    | Usado por             |
| ------ | --------------------------- | --------------------- |
| GET    | `/api/users-teams`          | `userTeamsService.ts` |
| GET    | `/api/users-teams/:id`      | `userTeamsService.ts` |
| POST   | `/api/users-teams`          | `userTeamsService.ts` |
| PATCH  | `/api/users-teams/:id`      | `userTeamsService.ts` |
| DELETE | `/api/users-teams/:id`      | `userTeamsService.ts` |
| DELETE | `/api/users-teams/:id/hard` | `userTeamsService.ts` |

### Dashboards

#### Dashboard do Atendente

| Método | Endpoint                                                 |
| ------ | -------------------------------------------------------- |
| GET    | `/api/dashboards/attendant/kpi/active-leads`             |
| GET    | `/api/dashboards/attendant/kpi/converted-leads`          |
| GET    | `/api/dashboards/attendant/kpi/conversion-rate`          |
| GET    | `/api/dashboards/attendant/kpi/avg-service-time`         |
| GET    | `/api/dashboards/attendant/charts/leads-evolution`       |
| GET    | `/api/dashboards/attendant/charts/sales-funnel`          |
| GET    | `/api/dashboards/attendant/charts/leads-by-source`       |
| GET    | `/api/dashboards/attendant/charts/conversions-by-period` |

#### Dashboard do Gerente

| Método | Endpoint                                                  |
| ------ | --------------------------------------------------------- |
| GET    | `/api/dashboards/manager/kpi/team`                        |
| GET    | `/api/dashboards/manager/kpi/top-attendant`               |
| GET    | `/api/dashboards/manager/charts/leads-by-attendant`       |
| GET    | `/api/dashboards/manager/charts/conversions-by-attendant` |
| GET    | `/api/dashboards/manager/charts/team-evolution`           |
| GET    | `/api/dashboards/manager/charts/team-funnel`              |

#### Dashboard do Gerente Geral

| Método | Endpoint                                                  |
| ------ | --------------------------------------------------------- |
| GET    | `/api/dashboards/general-manager/kpi/global`              |
| GET    | `/api/dashboards/general-manager/kpi/top-team`            |
| GET    | `/api/dashboards/general-manager/charts/leads-by-team`    |
| GET    | `/api/dashboards/general-manager/charts/team-ranking`     |
| GET    | `/api/dashboards/general-manager/charts/global-evolution` |
| GET    | `/api/dashboards/general-manager/charts/global-funnel`    |

---

## 🖥️ Telas Implementadas

### Login

| Campo   | Valor                                          |
| ------- | ---------------------------------------------- |
| Rota    | `/login`                                       |
| Arquivo | `src/pages/Login.tsx`                          |
| Acesso  | Público, apenas para usuários não autenticados |

Funcionalidades:

* login com e-mail e senha;
* integração com `POST /api/auth/login`;
* armazenamento de tokens;
* redirecionamento para `/funil`.

---

### Layout Principal

| Campo       | Valor                        |
| ----------- | ---------------------------- |
| Arquivo     | `src/layouts/MainLayout.tsx` |
| Componentes | `Sidebar`, `Header`          |
| Acesso      | Usuários autenticados        |

Funcionalidades:

* navegação lateral;
* header;
* layout responsivo;
* controle visual de navegação por perfil.

---

### Funil de Negociações

| Campo       | Valor                                                                          |
| ----------- | ------------------------------------------------------------------------------ |
| Rota        | `/funil`                                                                       |
| Arquivo     | `src/pages/SalesFunnel.tsx`                                                    |
| Componentes | `kanbanBoard`, `NegotiationCard`, `NegotiationModal`, `ClosedNegotiationsList` |
| Acesso      | Usuários autenticados                                                          |

Funcionalidades:

* visualização de negociações em formato de funil;
* cards de negociação;
* modal de detalhes;
* listagem de negociações encerradas;
* integração com endpoints de negociações, histórico de etapa, status e importância.

---

### Dashboard

| Campo    | Valor                                                                                            |
| -------- | ------------------------------------------------------------------------------------------------ |
| Rota     | `/dashboard`                                                                                     |
| Arquivos | `Dashboard.tsx`, `DashboardAttendant.tsx`, `DashboardManager.tsx`, `DashboardGeneralManager.tsx` |
| Acesso   | Usuários autenticados                                                                            |

Funcionalidades:

* redirecionamento/seleção de dashboard conforme perfil;
* dashboard do atendente;
* dashboard do gerente;
* dashboard do gerente geral;
* KPIs e gráficos baseados em services de dashboard.

---

### Leads

| Campo       | Valor                                                                            |
| ----------- | -------------------------------------------------------------------------------- |
| Rota        | `/leads`                                                                         |
| Arquivo     | `src/pages/Leads.tsx`                                                            |
| Componentes | `LeadCard`, `LeadDetailModal`, `LeadsFilterBar`, `LeadsPagination`, `LeadsTable` |
| Acesso      | Usuários autenticados                                                            |

Funcionalidades:

* listagem de leads;
* filtros;
* paginação;
* cards/tabela;
* modal de detalhes;
* ações relacionadas a lead e negociação.

---

### Leads do Gerente

| Campo   | Valor                                 |
| ------- | ------------------------------------- |
| Rota    | `/manager/leads`                      |
| Arquivo | `src/pages/ManagerLeads.tsx`          |
| Acesso  | `MANAGER`, `GENERAL_MANAGER`, `ADMIN` |

Funcionalidades:

* visão de leads para gerente;
* atribuição de leads;
* modais e toolbar de atribuição.

---

### Leads do Gerente Geral

| Campo   | Valor                      |
| ------- | -------------------------- |
| Rota    | `/gm/leads`                |
| Arquivo | `src/pages/GMLeads.tsx`    |
| Acesso  | `GENERAL_MANAGER`, `ADMIN` |

Funcionalidades:

* visão de leads em nível gerencial geral;
* atribuição por equipe;
* visualização ampliada para gerente geral.

---

### Perfil

| Campo       | Valor                                                                                                                     |
| ----------- | ------------------------------------------------------------------------------------------------------------------------- |
| Rota        | `/perfil`                                                                                                                 |
| Arquivo     | `src/pages/Profile.tsx`                                                                                                   |
| Componentes | `ProfileHeader`, `AccountInfo`, `EditContactModal`, `EditPasswordForm`, `AccessLevelCards`, `ActivityStats`, `DangerZone` |
| Acesso      | Usuários autenticados                                                                                                     |

Funcionalidades:

* exibição de informações do usuário;
* edição de dados de contato;
* alteração de senha via atualização do próprio usuário por ID;
* informações de acesso e atividade.

---

### Usuários

| Campo       | Valor                                                                                                    |
| ----------- | -------------------------------------------------------------------------------------------------------- |
| Rota        | `/usuarios`                                                                                              |
| Arquivo     | `src/pages/Users.tsx`                                                                                    |
| Componentes | `UserCard`, `UserFilters`, `UserListRow`, `UserStatsCards`, `InviteUserModal`, `RoleBadge`, `UserAvatar` |
| Acesso      | `MANAGER`, `GENERAL_MANAGER`, `ADMIN`                                                                    |

Funcionalidades:

* listagem de usuários;
* filtros por perfil/status;
* cards e linhas de usuário;
* modal de convite/cadastro;
* indicadores.

> Observação: a página de usuários ainda possui dependência de `src/data/mockUsers.ts` em alguns componentes/fluxos. A remoção desses dados mockados faz parte das correções previstas na Sprint 3.

---

### Equipes

| Campo       | Valor                                 |
| ----------- | ------------------------------------- |
| Rota        | `/teams`                              |
| Arquivo     | `src/pages/Teams.tsx`                 |
| Componentes | `TeamCard`, `TeamFormModal`           |
| Acesso      | `MANAGER`, `GENERAL_MANAGER`, `ADMIN` |

Funcionalidades:

* listagem de equipes;
* criação/edição via modal;
* integração com service de equipes.

---

### Lojas

| Campo       | Valor                         |
| ----------- | ----------------------------- |
| Rota        | `/stores`                     |
| Arquivo     | `src/pages/Stores.tsx`        |
| Componentes | `StoreCard`, `StoreFormModal` |
| Acesso      | `GENERAL_MANAGER`, `ADMIN`    |

Funcionalidades:

* listagem de lojas;
* criação/edição via modal;
* integração com service de lojas.

---

### Configurações

| Campo   | Valor                                 |
| ------- | ------------------------------------- |
| Rota    | `/config`                             |
| Arquivo | `src/pages/Config.tsx`                |
| Acesso  | `MANAGER`, `GENERAL_MANAGER`, `ADMIN` |

Funcionalidades:

* área de configurações do sistema.

---

### Erro 403

| Campo   | Valor                     |
| ------- | ------------------------- |
| Rota    | `/403`                    |
| Arquivo | `src/pages/Forbidden.tsx` |

Funcionalidades:

* informa que o usuário não possui permissão;
* permite navegação de retorno.

---

### Erro 404

| Campo   | Valor                    |
| ------- | ------------------------ |
| Rota    | `/404`                   |
| Arquivo | `src/pages/NotFound.tsx` |

Funcionalidades:

* informa página inexistente;
* trata rotas não encontradas.

---

## 🎨 Guia de Estilo

O projeto possui um guia de estilo em:

```txt
client/docs/style/STYLE_GUIDE.md
```

### Paleta base

| Uso              | Cor       |
| ---------------- | --------- |
| Primária         | `#1E3A8A` |
| Secundária       | `#2563EB` |
| Fundo principal  | `#F9FAFB` |
| Fundo secundário | `#FFFFFF` |
| Texto principal  | `#111827` |
| Texto secundário | `#6B7280` |
| Sucesso          | `#16A34A` |
| Erro             | `#DC2626` |
| Alerta           | `#F59E0B` |

### Diretrizes visuais

* Manter interface limpa e organizada.
* Usar Tailwind CSS como padrão de estilização.
* Evitar CSS solto fora do padrão do projeto.
* Priorizar contraste e legibilidade.
* Diferenciar status, prioridade ou loja com cores quando necessário.
* Manter consistência visual entre páginas de leads, usuários, perfil, dashboards e gerência.

---

## 🖼️ Croquis e Referências Visuais

O projeto possui croquis dentro de:

```txt
client/docs/croquis/
```

Arquivos disponíveis:

| Arquivo          | Referência                             |
| ---------------- | -------------------------------------- |
| `dashboards.png` | Estrutura visual dos dashboards        |
| `funil.png`      | Estrutura visual do funil              |
| `lead.png`       | Estrutura visual das telas de leads    |
| `logins.png`     | Estrutura visual da tela de login      |
| `Perfil.png`     | Estrutura visual do perfil             |
| `Usuario.png`    | Estrutura visual da página de usuários |

---

## 🧪 Build e Validação

Antes de abrir Pull Request, recomenda-se executar:

```bash
npm run build
```

Esse comando executa:

```bash
tsc && vite build
```

A build valida:

* erros de TypeScript;
* compatibilidade dos imports;
* tipagem dos componentes;
* geração da build de produção.

---

## 🐳 Docker e Nginx

O frontend possui um `Dockerfile` com build baseado em Node e imagem final com Nginx.

### Arquivos relacionados

| Arquivo      | Responsabilidade                 |
| ------------ | -------------------------------- |
| `Dockerfile` | Build do frontend e imagem final |
| `nginx.conf` | Configuração do servidor Nginx   |
| `index.html` | Entrada da aplicação Vite        |

### Nginx

O `nginx.conf`:

* serve os arquivos estáticos da build;
* ativa gzip;
* aplica cache para assets estáticos;
* redireciona rotas SPA para `index.html`;
* possui proxy para `/api/`.

---

## ⚠️ Funcionalidades Planejadas ou Pendentes

As funcionalidades abaixo aparecem no escopo geral do projeto ou em arquivos da estrutura, mas não devem ser consideradas completamente implementadas nesta versão atual do frontend.

| Funcionalidade                                  | Status                                                                        |
| ----------------------------------------------- | ----------------------------------------------------------------------------- |
| Recuperação de senha                            | Não há rota/tela ativa no React Router                                        |
| Redefinição de senha                            | Não há rota/tela ativa no React Router                                        |
| Tela de logs                                    | Existe `Logs.tsx`, mas não está registrada nas rotas atuais                   |
| `logService.ts`                                 | Arquivo existe, mas está sem implementação                                    |
| Criação de lead por rota dedicada `/leads/novo` | Existe `CreateLead.tsx`, mas a rota não está registrada no React Router       |
| Detalhe de cliente por rota dedicada            | Existem arquivos relacionados, mas a rota não está registrada no React Router |
| Detalhe de lead por rota dedicada               | Existem arquivos relacionados, mas a rota não está registrada no React Router |
| Remoção total de mocks na página de usuários    | Ainda há dependência de `src/data/mockUsers.ts`                               |

---

## 📌 Regras de Desenvolvimento

* Usar TypeScript em todos os componentes e services.
* Usar Tailwind CSS como padrão de estilização.
* Centralizar chamadas HTTP nos services.
* Evitar chamadas diretas ao `fetch` fora dos services, exceto casos estruturais como autenticação/refresh.
* Não commitar `.env`.
* Não deixar dados mockados em páginas previstas para integração real.
* Validar build antes do Pull Request.
* Atualizar este README quando houver alteração em rotas, páginas, services, variáveis de ambiente ou execução.

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
| `style/*`    | Ajustes visuais                      |

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

| Recurso                  | Caminho                       |
| ------------------------ | ----------------------------- |
| README principal         | `../README.md`                |
| Documentação do backend  | `../server/README.md`         |
| Documentação da Sprint 1 | `../docs/sprint_1/README.md`  |
| Documentação da Sprint 2 | `../docs/sprint_2/README.md`  |
| Documentação da Sprint 3 | `../docs/sprint_3/README.md`  |
| Product Backlog          | `../docs/PRODUCT_BACKLOG.md`  |
| Guia de estilo           | `./docs/style/STYLE_GUIDE.md` |
| Croquis                  | `./docs/croquis/`             |

---

## 📝 Manutenção da Documentação

Esta documentação deve ser atualizada sempre que houver alteração em:

* rotas do React Router;
* páginas;
* componentes principais;
* services;
* fluxos de autenticação;
* permissões por perfil;
* variáveis de ambiente;
* Docker/Nginx;
* padrões visuais;
* remoção ou inclusão de funcionalidades.

Alterações de frontend que modifiquem fluxos de navegação, consumo da API ou permissões devem atualizar este README no mesmo Pull Request.

---

<div align="center">

ABP 2026-1 · 3DSM · FATEC Jacareí
Parceiro: 1000 Valle Multimarcas
Focal Point: Prof. Arley Ferreira de Souza

</div>
