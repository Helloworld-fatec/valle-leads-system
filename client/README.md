# 🎨 Valle Leads System — Frontend

Frontend do **Valle Leads System**, sistema de gestão de leads e dashboards analíticos desenvolvido para a **1000 Valle Multimarcas**.

O frontend é responsável pela interface de autenticação, navegação protegida por perfil, visualização de leads, funil de negociações, dashboards, usuários, lojas, equipes e perfil do usuário.

> Projeto acadêmico desenvolvido na **FATEC Jacareí** — ABP 2026-1 | 3º DSM
> Parceiro: 1000 Valle Multimarcas | Focal Point: Prof. Arley Ferreira de Souza

---

## 📌 Sobre o Frontend

A aplicação frontend foi construída com **React**, **TypeScript**, **Vite**, **Tailwind CSS** e **React Router**.

Ela consome a API do backend por meio de services centralizados e utiliza autenticação baseada em tokens JWT, armazenando os dados de sessão no `localStorage`.

O sistema contempla diferentes perfis de usuário:

* `ATTENDANT` — Atendente
* `MANAGER` — Gerente
* `GENERAL_MANAGER` — Gerente Geral
* `ADMIN` — Administrador

Cada perfil possui acesso a rotas e visualizações específicas.

---

## 🛠 Tecnologias Utilizadas

| Tecnologia       | Uso                                 |
| ---------------- | ----------------------------------- |
| React            | Construção da interface             |
| TypeScript       | Tipagem estática                    |
| Vite             | Ambiente de desenvolvimento e build |
| Tailwind CSS     | Estilização                         |
| React Router DOM | Controle de rotas                   |
| Framer Motion    | Animações e transições              |
| DnD Kit          | Suporte a drag-and-drop no funil    |
| Lucide React     | Ícones da interface                 |
| React Icons      | Ícones adicionais                   |
| Fetch API        | Comunicação com o backend           |
| Docker           | Conteinerização                     |
| Nginx            | Servir o frontend em produção       |

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
│   │   │   ├── attendant/
│   │   │   ├── general-manager/
│   │   │   ├── manager/
│   │   │   ├── FunnelChart.tsx
│   │   │   ├── MetricCard.tsx
│   │   │   ├── PipelineSummary.tsx
│   │   │   └── RecentLeads.tsx
│   │   ├── leads/
│   │   ├── profile/
│   │   ├── sales-funnel/
│   │   ├── stores/
│   │   ├── teams/
│   │   ├── users/
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── ErrorBoundary.tsx
│   │   ├── Header.tsx
│   │   ├── Input.tsx
│   │   ├── Sidebar.tsx
│   │   └── Table.tsx
│   ├── contexts/
│   │   └── AuthContext.tsx
│   ├── data/
│   │   └── mockUsers.ts
│   ├── hook/
│   │   └── useAuth.tsx
│   ├── layouts/
│   │   └── MainLayout.tsx
│   ├── pages/
│   │   ├── ClientDetails.tsx
│   │   ├── Clients.tsx
│   │   ├── Config.tsx
│   │   ├── CreateLead.tsx
│   │   ├── Dashboard.tsx
│   │   ├── DashboardAttendant.tsx
│   │   ├── DashboardGeneralManager.tsx
│   │   ├── DashboardManager.tsx
│   │   ├── Forbidden.tsx
│   │   ├── GMLeads.tsx
│   │   ├── LeadDetails.tsx
│   │   ├── Leads.tsx
│   │   ├── Login.tsx
│   │   ├── Logs.tsx
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
│   │   ├── logService.ts
│   │   ├── loginService.ts
│   │   ├── negotiationsService.ts
│   │   ├── profileService.ts
│   │   ├── storesService.ts
│   │   ├── teamService.ts
│   │   ├── userService.ts
│   │   └── userTeamsService.ts
│   ├── types/
│   │   ├── Client.ts
│   │   ├── Lead.ts
│   │   ├── Team.ts
│   │   ├── User.ts
│   │   ├── index.ts
│   │   └── negotiations.ts
│   ├── utils/
│   │   └── helpers.ts
│   ├── App.tsx
│   ├── index.css
│   ├── main.tsx
│   └── vite-env.d.ts
├── .dockerignore
├── .env.example
├── .gitignore
├── Dockerfile
├── index.html
├── nginx.conf
├── package-lock.json
├── package.json
├── tsconfig.json
└── vite.config.ts
```
> Observação: a pasta `dist/` pode ser gerada após o build do frontend, mas não é considerada parte da estrutura-fonte da aplicação.

---

## 🧱 Organização Geral

| Pasta/Arquivo                      | Responsabilidade                                    |
| ---------------------------------- | --------------------------------------------------- |
| `src/pages/`                       | Páginas principais da aplicação                     |
| `src/components/`                  | Componentes reutilizáveis e componentes por domínio |
| `src/services/`                    | Comunicação com a API                               |
| `src/routes/`                      | Rotas públicas, protegidas e protegidas por role    |
| `src/contexts/AuthContext.tsx`     | Estado global de autenticação                       |
| `src/hook/useAuth.tsx`             | Hook para acessar o contexto de autenticação        |
| `src/layouts/MainLayout.tsx`       | Layout principal das rotas autenticadas             |
| `src/types/`                       | Tipagens compartilhadas                             |
| `client/docs/croquis/`             | Croquis e referências visuais                       |
| `client/docs/style/STYLE_GUIDE.md` | Guia de estilo do frontend                          |

---

## 🚀 Como Rodar Localmente sem Docker

### 1. Acessar a pasta do frontend

```bash
cd client
```

### 2. Instalar dependências

```bash
npm install
```

### 3. Configurar variáveis de ambiente

Crie o arquivo `.env` dentro da pasta `client`:

```bash
cp .env.example .env
```

Exemplo para execução local sem Docker:

```env
VITE_BACKEND_URL=http://localhost:3000
```

### 4. Rodar em modo desenvolvimento

```bash
npm run dev
```

A aplicação estará disponível em:

```txt
http://localhost:5173
```

---

## 📜 Scripts Disponíveis

| Script            | Descrição                                          |
| ----------------- | -------------------------------------------------- |
| `npm run dev`     | Inicia o frontend com Vite em modo desenvolvimento |
| `npm run build`   | Executa TypeScript e gera build de produção        |
| `npm run preview` | Executa uma prévia local da build de produção      |

Antes de abrir Pull Request, recomenda-se executar:

```bash
npm run build
```

Esse comando valida:

* erros de TypeScript;
* imports quebrados;
* tipagem dos componentes;
* compatibilidade da build Vite.

---

## 🔑 Variáveis de Ambiente

### `client/.env`

| Variável           | Uso                                             |
| ------------------ | ----------------------------------------------- |
| `VITE_BACKEND_URL` | Define a URL base usada nas chamadas para a API |

### Execução local sem Docker

```env
VITE_BACKEND_URL=http://localhost:3000
```

### Docker produção/local

No Docker de produção/local, o frontend é servido pelo Nginx e deve chamar a API por rota relativa:

```env
VITE_BACKEND_URL=
```

Nesse caso, chamadas como:

```txt
/api/auth/login
```

são encaminhadas pelo Nginx para o backend.

### Docker dev

No Docker dev, o frontend deve usar proxy do Vite. Portanto, também deve manter:

```env
VITE_BACKEND_URL=
```

O proxy deve estar configurado no `vite.config.ts`, redirecionando `/api` para o serviço `server`.

---

## 🔐 Autenticação

A autenticação é gerenciada por:

| Arquivo                          | Responsabilidade                                             |
| -------------------------------- | ------------------------------------------------------------ |
| `src/contexts/AuthContext.tsx`   | Armazena usuário autenticado, access token e estado de login |
| `src/hook/useAuth.tsx`           | Disponibiliza o contexto de autenticação                     |
| `src/services/loginService.ts`   | Realiza login e logout                                       |
| `src/services/api.ts`            | Centraliza chamadas autenticadas e refresh token             |
| `src/routes/ProtectedRoute.tsx`  | Protege rotas autenticadas e rotas por role                  |
| `src/routes/PublicOnlyRoute.tsx` | Impede usuário autenticado de acessar `/login`               |

### Dados armazenados no `localStorage`

| Chave          | Descrição                    |
| -------------- | ---------------------------- |
| `authUser`     | Dados do usuário autenticado |
| `accessToken`  | Token de acesso              |
| `refreshToken` | Token de renovação           |

### Fluxo de login

```txt
Usuário envia e-mail e senha
        ↓
POST /api/auth/login
        ↓
Backend retorna user, access_token e refresh_token
        ↓
AuthContext salva dados no localStorage
        ↓
Usuário é redirecionado para a área autenticada
```

### Fluxo de refresh token

O hook `useApi`, em `src/services/api.ts`, trata requisições autenticadas.

Quando uma requisição retorna `401`, o frontend tenta renovar o token por meio de:

```txt
POST /api/auth/refresh
```

Se o refresh funcionar:

```txt
novo token é salvo → requisição original é repetida
```

Se o refresh falhar:

```txt
sessão é encerrada → usuário volta para /login
```

---

## 🧭 Rotas do React Router

As rotas reais registradas estão em:

```txt
src/routes/index.tsx
```

### Rotas públicas

| Rota     | Página      | Descrição                                                    |
| -------- | ----------- | ------------------------------------------------------------ |
| `/login` | `Login.tsx` | Tela de login, acessível apenas para usuário não autenticado |

---

### Rotas de erro

| Rota   | Página          | Descrição                     |
| ------ | --------------- | ----------------------------- |
| `/403` | `Forbidden.tsx` | Tela de acesso negado         |
| `/404` | `NotFound.tsx`  | Tela de página não encontrada |

---

### Rotas protegidas para qualquer usuário autenticado

| Rota         | Página            | Descrição                                             |
| ------------ | ----------------- | ----------------------------------------------------- |
| `/`          | `Navigate`        | Redireciona para `/funil`                             |
| `/funil`     | `SalesFunnel.tsx` | Funil de negociações                                  |
| `/dashboard` | `Dashboard.tsx`   | Dashboard renderizado de acordo com a role do usuário |
| `/leads`     | `Leads.tsx`       | Listagem e visualização de leads                      |
| `/perfil`    | `Profile.tsx`     | Perfil do usuário autenticado                         |

---

### Rotas protegidas para `MANAGER`, `GENERAL_MANAGER` e `ADMIN`

| Rota             | Página             | Descrição                    |
| ---------------- | ------------------ | ---------------------------- |
| `/manager/leads` | `ManagerLeads.tsx` | Gestão de leads pelo gerente |
| `/usuarios`      | `Users.tsx`        | Gestão/listagem de usuários  |
| `/teams`         | `Teams.tsx`        | Gestão de equipes            |
| `/config`        | `Config.tsx`       | Configurações                |

---

### Rotas protegidas para `GENERAL_MANAGER` e `ADMIN`

| Rota        | Página        | Descrição                          |
| ----------- | ------------- | ---------------------------------- |
| `/stores`   | `Stores.tsx`  | Gestão de lojas                    |
| `/gm/leads` | `GMLeads.tsx` | Gestão de leads pelo gerente geral |

---

### Rotas não registradas atualmente

Os arquivos abaixo existem na pasta `src/pages`, mas **não estão registrados no React Router atual**:

| Arquivo             | Situação                                      |
| ------------------- | --------------------------------------------- |
| `Clients.tsx`       | Página existe, mas não possui rota registrada |
| `ClientDetails.tsx` | Página existe, mas não possui rota registrada |
| `CreateLead.tsx`    | Página existe, mas não possui rota registrada |
| `LeadDetails.tsx`   | Página existe, mas não possui rota registrada |
| `Logs.tsx`          | Página existe, mas não possui rota registrada |

Essas páginas não devem ser documentadas como telas acessíveis até que sejam vinculadas ao roteamento.

---

## 👤 Controle de Acesso por Perfil

O controle de acesso no frontend é feito por `ProtectedRoute`.

### Comportamento

| Situação                                      | Resultado                 |
| --------------------------------------------- | ------------------------- |
| Usuário não autenticado acessa rota protegida | Redireciona para `/login` |
| Usuário autenticado acessa rota sem permissão | Redireciona para `/403`   |
| Usuário autenticado com permissão correta     | Renderiza a rota          |

### Perfis utilizados

| Role              | Descrição     |
| ----------------- | ------------- |
| `ATTENDANT`       | Atendente     |
| `MANAGER`         | Gerente       |
| `GENERAL_MANAGER` | Gerente Geral |
| `ADMIN`           | Administrador |

> O controle de acesso no frontend melhora a navegação e a experiência do usuário, mas as regras de segurança também precisam ser validadas no backend.

---

## 🖥️ Telas Implementadas e Acessíveis

### Login

| Campo   | Valor                                          |
| ------- | ---------------------------------------------- |
| Rota    | `/login`                                       |
| Arquivo | `src/pages/Login.tsx`                          |
| Acesso  | Público, apenas para usuários não autenticados |

Funcionalidades:

* formulário de e-mail e senha;
* integração com `/api/auth/login`;
* armazenamento de tokens;
* redirecionamento após autenticação.

---

### Funil de Negociações

| Campo   | Valor                       |
| ------- | --------------------------- |
| Rota    | `/funil`                    |
| Arquivo | `src/pages/SalesFunnel.tsx` |
| Acesso  | Usuários autenticados       |

Funcionalidades:

* visualização de negociações em formato de funil;
* cards por negociação;
* modal de detalhes;
* histórico de etapa, status e importância;
* integração com services de negociações.

---

### Dashboard

| Campo               | Valor                                                                           |
| ------------------- | ------------------------------------------------------------------------------- |
| Rota                | `/dashboard`                                                                    |
| Arquivo principal   | `src/pages/Dashboard.tsx`                                                       |
| Arquivos auxiliares | `DashboardAttendant.tsx`, `DashboardManager.tsx`, `DashboardGeneralManager.tsx` |
| Acesso              | Usuários autenticados                                                           |

Funcionalidades:

* renderiza dashboard conforme a role do usuário;
* `ATTENDANT` visualiza dados próprios;
* `MANAGER` visualiza dados da equipe e atendentes da equipe;
* `GENERAL_MANAGER` e `ADMIN` acessam visão global e recortes por equipe/atendente;
* integração com endpoints de dashboard.

---

### Leads

| Campo   | Valor                 |
| ------- | --------------------- |
| Rota    | `/leads`              |
| Arquivo | `src/pages/Leads.tsx` |
| Acesso  | Usuários autenticados |

Funcionalidades:

* listagem de leads;
* filtros e busca;
* visualização de detalhes;
* integração com service de leads;
* abertura de negociação a partir de lead, quando aplicável.

---

### Leads do Gerente

| Campo   | Valor                                 |
| ------- | ------------------------------------- |
| Rota    | `/manager/leads`                      |
| Arquivo | `src/pages/ManagerLeads.tsx`          |
| Acesso  | `MANAGER`, `GENERAL_MANAGER`, `ADMIN` |

Funcionalidades:

* visualização de leads em contexto gerencial;
* atribuição de leads;
* suporte a ações em lote.

---

### Leads do Gerente Geral

| Campo   | Valor                      |
| ------- | -------------------------- |
| Rota    | `/gm/leads`                |
| Arquivo | `src/pages/GMLeads.tsx`    |
| Acesso  | `GENERAL_MANAGER`, `ADMIN` |

Funcionalidades:

* visualização de leads em nível gerencial geral;
* atribuição por equipe;
* visão ampliada dos leads.

---

### Perfil

| Campo   | Valor                   |
| ------- | ----------------------- |
| Rota    | `/perfil`               |
| Arquivo | `src/pages/Profile.tsx` |
| Acesso  | Usuários autenticados   |

Funcionalidades:

* exibição dos dados do usuário autenticado;
* edição de dados do perfil;
* alteração de senha via atualização do próprio usuário por ID;
* integração com `profileService`.

---

### Usuários

| Campo   | Valor                                 |
| ------- | ------------------------------------- |
| Rota    | `/usuarios`                           |
| Arquivo | `src/pages/Users.tsx`                 |
| Acesso  | `MANAGER`, `GENERAL_MANAGER`, `ADMIN` |

Funcionalidades:

* listagem de usuários;
* filtros por perfil/status;
* cards e/ou linhas de usuário;
* indicadores/KPIs;
* cadastro e edição via modal.

---

### Equipes

| Campo   | Valor                                 |
| ------- | ------------------------------------- |
| Rota    | `/teams`                              |
| Arquivo | `src/pages/Teams.tsx`                 |
| Acesso  | `MANAGER`, `GENERAL_MANAGER`, `ADMIN` |

Funcionalidades:

* listagem de equipes;
* criação/edição via modal;
* integração com service de equipes.

---

### Lojas

| Campo   | Valor                      |
| ------- | -------------------------- |
| Rota    | `/stores`                  |
| Arquivo | `src/pages/Stores.tsx`     |
| Acesso  | `GENERAL_MANAGER`, `ADMIN` |

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

## 📦 Services

Os services centralizam a comunicação com a API.

| Service            | Arquivo                  | Responsabilidade                                              |
| ------------------ | ------------------------ | ------------------------------------------------------------- |
| API base           | `api.ts`                 | `apiFetch`, autenticação, refresh token e tratamento de erros |
| Login              | `loginService.ts`        | Login e logout                                                |
| Clientes           | `clientService.ts`       | Integração com `/api/customers`                               |
| Dashboards         | `dashboardService.ts`    | Integração com dashboards por perfil                          |
| Itens de interesse | `itemService.ts`         | Integração com `/api/interest-items`                          |
| Leads              | `leadService.ts`         | Integração com `/api/leads` e abertura de negociação          |
| Logs               | `logService.ts`          | Arquivo previsto, sem implementação funcional atual           |
| Negociações        | `negotiationsService.ts` | Integração com negociações, estágio, status e importância     |
| Perfil             | `profileService.ts`      | Busca e atualização do usuário autenticado por ID             |
| Lojas              | `storesService.ts`       | Integração com `/api/stores`                                  |
| Equipes            | `teamService.ts`         | Integração com `/api/teams`                                   |
| Usuários           | `userService.ts`         | Integração com `/api/users`                                   |
| Usuários/Equipes   | `userTeamsService.ts`    | Integração com `/api/users-teams`                             |

---

## 🔌 Principais Endpoints Consumidos

### Auth

| Método | Endpoint            | Service           |
| ------ | ------------------- | ----------------- |
| POST   | `/api/auth/login`   | `loginService.ts` |
| POST   | `/api/auth/refresh` | `api.ts`          |
| POST   | `/api/auth/logout`  | `loginService.ts` |

### Users

| Método | Endpoint              | Service                                 |
| ------ | --------------------- | --------------------------------------- |
| GET    | `/api/users`          | `userService.ts`, `dashboardService.ts` |
| GET    | `/api/users/:id`      | `userService.ts`, `profileService.ts`   |
| POST   | `/api/users`          | `userService.ts`                        |
| PUT    | `/api/users/:id`      | `userService.ts`, `profileService.ts`   |
| DELETE | `/api/users/:id`      | `userService.ts`                        |
| DELETE | `/api/users/:id/hard` | `userService.ts`                        |

### Customers

| Método | Endpoint                  | Service            |
| ------ | ------------------------- | ------------------ |
| GET    | `/api/customers`          | `clientService.ts` |
| GET    | `/api/customers/:id`      | `clientService.ts` |
| POST   | `/api/customers`          | `clientService.ts` |
| PATCH  | `/api/customers/:id`      | `clientService.ts` |
| DELETE | `/api/customers/:id`      | `clientService.ts` |
| DELETE | `/api/customers/:id/hard` | `clientService.ts` |

### Leads

| Método | Endpoint                      | Service          |
| ------ | ----------------------------- | ---------------- |
| GET    | `/api/leads`                  | `leadService.ts` |
| GET    | `/api/leads/:id`              | `leadService.ts` |
| PATCH  | `/api/leads/:id`              | `leadService.ts` |
| POST   | `/api/leads/bulk/assign-team` | `leadService.ts` |

### Negotiations

| Método | Endpoint                | Service                                    |
| ------ | ----------------------- | ------------------------------------------ |
| GET    | `/api/negotiations`     | `negotiationsService.ts`                   |
| GET    | `/api/negotiations/:id` | `negotiationsService.ts`                   |
| POST   | `/api/negotiations`     | `negotiationsService.ts`, `leadService.ts` |

### Negotiation History

| Método | Endpoint                                         | Service                  |
| ------ | ------------------------------------------------ | ------------------------ |
| GET    | `/api/negotiation-stage-history?negotiation_id=` | `negotiationsService.ts` |
| POST   | `/api/negotiation-stage-history`                 | `negotiationsService.ts` |
| GET    | `/api/negotiation-importance?negotiation_id=`    | `negotiationsService.ts` |
| POST   | `/api/negotiation-importance`                    | `negotiationsService.ts` |
| GET    | `/api/negotiation-status?negotiation_id=`        | `negotiationsService.ts` |
| POST   | `/api/negotiation-status`                        | `negotiationsService.ts` |

### Stores

| Método | Endpoint               | Service            |
| ------ | ---------------------- | ------------------ |
| GET    | `/api/stores`          | `storesService.ts` |
| GET    | `/api/stores/:id`      | `storesService.ts` |
| POST   | `/api/stores`          | `storesService.ts` |
| PATCH  | `/api/stores/:id`      | `storesService.ts` |
| DELETE | `/api/stores/:id`      | `storesService.ts` |
| DELETE | `/api/stores/:id/hard` | `storesService.ts` |

### Teams

| Método | Endpoint         | Service                                 |
| ------ | ---------------- | --------------------------------------- |
| GET    | `/api/teams`     | `teamService.ts`, `dashboardService.ts` |
| GET    | `/api/teams/:id` | `teamService.ts`                        |
| POST   | `/api/teams`     | `teamService.ts`                        |
| PATCH  | `/api/teams/:id` | `teamService.ts`                        |
| DELETE | `/api/teams/:id` | `teamService.ts`                        |

### Users Teams

| Método | Endpoint                    | Service               |
| ------ | --------------------------- | --------------------- |
| GET    | `/api/users-teams`          | `userTeamsService.ts` |
| GET    | `/api/users-teams/:id`      | `userTeamsService.ts` |
| POST   | `/api/users-teams`          | `userTeamsService.ts` |
| PATCH  | `/api/users-teams/:id`      | `userTeamsService.ts` |
| DELETE | `/api/users-teams/:id`      | `userTeamsService.ts` |
| DELETE | `/api/users-teams/:id/hard` | `userTeamsService.ts` |

### Interest Items

| Método | Endpoint                       | Service          |
| ------ | ------------------------------ | ---------------- |
| GET    | `/api/interest-items`          | `itemService.ts` |
| GET    | `/api/interest-items/:id`      | `itemService.ts` |
| POST   | `/api/interest-items`          | `itemService.ts` |
| PATCH  | `/api/interest-items/:id`      | `itemService.ts` |
| DELETE | `/api/interest-items/:id`      | `itemService.ts` |
| DELETE | `/api/interest-items/:id/hard` | `itemService.ts` |

---

## 📊 Dashboards

O dashboard principal fica em:

```txt
/dashboard
```

A página `Dashboard.tsx` decide qual dashboard renderizar conforme a role do usuário:

| Role              | Dashboard renderizado                                   |
| ----------------- | ------------------------------------------------------- |
| `ATTENDANT`       | `DashboardAttendant.tsx`                                |
| `MANAGER`         | `DashboardManager.tsx` com visão da equipe e atendentes |
| `GENERAL_MANAGER` | `DashboardGeneralManager.tsx` com visão global          |
| `ADMIN`           | `DashboardGeneralManager.tsx` com visão global          |

Services relacionados:

```txt
src/services/dashboardService.ts
```

Principais grupos de endpoints consumidos:

* `/api/dashboards/attendant/...`
* `/api/dashboards/manager/...`
* `/api/dashboards/general-manager/...`

---

## 🎨 Guia de Estilo

O projeto possui documentação visual em:

```txt
client/docs/style/STYLE_GUIDE.md
```

E croquis em:

```txt
client/docs/croquis/
```

Arquivos de croqui disponíveis:

| Arquivo          | Referência                             |
| ---------------- | -------------------------------------- |
| `dashboards.png` | Estrutura visual dos dashboards        |
| `funil.png`      | Estrutura visual do funil              |
| `lead.png`       | Estrutura visual das telas de leads    |
| `logins.png`     | Estrutura visual do login              |
| `Perfil.png`     | Estrutura visual do perfil             |
| `Usuario.png`    | Estrutura visual da página de usuários |

Diretrizes gerais:

* usar Tailwind CSS;
* manter consistência visual entre páginas;
* priorizar legibilidade e contraste;
* evitar CSS isolado fora do padrão;
* manter filtros e ações visíveis;
* usar cores para diferenciar status, prioridade ou loja quando fizer sentido.

---

## 🐳 Docker e Nginx

O frontend possui Dockerfile com três stages principais:

| Stage   | Uso                                  |
| ------- | ------------------------------------ |
| `deps`  | Instala dependências                 |
| `build` | Gera build de produção               |
| `dev`   | Executa Vite em modo desenvolvimento |
| `prod`  | Serve a build com Nginx              |

### Produção/local com Docker

No modo produção/local, o frontend é servido via Nginx na porta 80:

```txt
http://localhost
```

O Nginx também atua como proxy para a API:

```txt
/api/* → server:3000
```

Arquivo relacionado:

```txt
client/nginx.conf
```

### Desenvolvimento com Docker

No modo dev, o frontend roda pelo Vite:

```txt
http://localhost:5173
```

Para evitar CORS e manter o mesmo padrão da produção, o frontend deve chamar a API por caminho relativo:

```txt
/api/...
```

O `vite.config.ts` deve configurar proxy para o backend:

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: "0.0.0.0",
    port: 5173,
    strictPort: true,
    proxy: {
      "/api": {
        target: "http://server:3000",
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq) => {
            proxyReq.removeHeader("origin");
          });
        },
      },
    },
  },
});
```

---

## 🧪 Validação Antes do PR

Antes de abrir Pull Request, recomenda-se validar:

### Build local do frontend

```bash
cd client
npm install
npm run build
```

### Docker produção/local

```bash
docker compose config
docker compose up -d --build
```

### Docker dev

```bash
docker compose -f docker-compose.dev.yml config
docker compose -f docker-compose.dev.yml up -d --build
```

### Testes básicos

* abrir `http://localhost` no modo produção/local;
* abrir `http://localhost:5173` no modo dev;
* realizar login;
* acessar `/funil`;
* acessar `/dashboard`;
* acessar `/leads`;
* validar navegação por perfil.

---

## ⚠️ Pendências Conhecidas

| Item                 | Situação                                                                               |
| -------------------- | -------------------------------------------------------------------------------------- |
| `Logs.tsx`           | Página existe, mas não está registrada no React Router                                 |
| `logService.ts`      | Arquivo existe, mas não possui implementação funcional atual                           |
| `Clients.tsx`        | Página existe, mas não está registrada no React Router                                 |
| `ClientDetails.tsx`  | Página existe, mas não está registrada no React Router                                 |
| `CreateLead.tsx`     | Página existe, mas não está registrada no React Router                                 |
| `LeadDetails.tsx`    | Página existe, mas não está registrada no React Router                                 |
| `mockUsers.ts`       | Arquivo ainda existe em `src/data`; verificar se há dependência ativa antes de remover |
| Recuperação de senha | Não há rota ativa documentada no React Router                                          |
| Redefinição de senha | Não há rota ativa documentada no React Router                                          |

Essas funcionalidades não devem ser apresentadas como rotas/telas acessíveis até que sejam integradas ao roteamento e ao backend.

---

## 📌 Regras de Manutenção

Atualize este README sempre que houver alteração em:

* rotas do React Router;
* páginas acessíveis;
* services;
* endpoints consumidos;
* autenticação;
* permissões por role;
* variáveis de ambiente;
* Docker/Nginx;
* proxy do Vite;
* pendências conhecidas.

Alterações de frontend que modifiquem navegação, autenticação, consumo da API ou permissões devem atualizar esta documentação no mesmo Pull Request.

---

## 📚 Documentação Relacionada

| Recurso                 | Caminho                       |
| ----------------------- | ----------------------------- |
| README principal        | `../README.md`                |
| Guia de execução Docker | `../HOWTORUN.md`              |
| Documentação do backend | `../server/README.md`         |
| Sprint 1                | `../docs/sprint-1/README.md`  |
| Sprint 2                | `../docs/sprint-2/README.md`  |
| Sprint 3                | `../docs/sprint-3/README.md`  |
| Guia de estilo          | `./docs/style/STYLE_GUIDE.md` |
| Croquis                 | `./docs/croquis/`             |

---

<div align="center">

ABP 2026-1 · 3DSM · FATEC Jacareí
Parceiro: 1000 Valle Multimarcas
Focal Point: Prof. Arley Ferreira de Souza

</div>
