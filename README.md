# 🚗 Valle Leads System

Sistema de Gestão de Leads com Dashboard Analítico desenvolvido para a **1000 Valle Multimarcas**, uma revendedora de veículos com múltiplas unidades.

O sistema permite o registro e acompanhamento de leads captados por diferentes canais (visita presencial, telefone, WhatsApp, Instagram, formulários digitais), gerenciamento de negociações e visualização de indicadores de desempenho por meio de dashboards operacionais e analíticos.

> Projeto acadêmico desenvolvido na **FATEC Jacareí** — ABP 2026-1 | 3º DSM  
> Parceiro: 1000 Valle Multimarcas | Focal Point: Prof. Arley Ferreira de Souza

---

## 📌 Sobre o Projeto

A 1000 Valle Multimarcas necessita de um sistema que centralize a gestão de leads, permita o acompanhamento do funil de vendas e forneça indicadores gerenciais consolidados. O sistema contempla:

- Controle de acesso hierárquico por perfil (Atendente, Gerente, Gerente Geral, Administrador)
- Gestão completa de leads e negociações
- Dashboards operacionais e analíticos com filtros temporais
- Registro de logs de acesso e operações
- Modelagem relacional com aplicação explícita de regras de negócio

---

## 🛠 Tecnologias

| Camada | Tecnologia |
|---|---|
| Frontend | React + TypeScript |
| Backend | Node.js + TypeScript |
| Banco de Dados | PostgreSQL |
| ORM | Prisma |
| Containerização | Docker + Docker Compose |

---

## 👥 Equipe

| Nome | Papel |
|---|---|
| Bruno Berval | Product Owner (PO) |
| Nicolas Kauê | Scrum Master (SM) |
| Bruna Rodrigues | Dev Team (DT) |
| Pedro Enrique | Dev Team (DT) |
| Ryan Tinel | Dev Team (DT) |
| Suelen Castro | Dev Team (DT) |

---

## 🔄 Metodologia Ágil (Scrum)

O projeto é desenvolvido em **3 sprints**, seguindo os princípios do Scrum com papéis definidos, backlog priorizado, entregas incrementais e registro de retrospectivas.

### Cronograma

| Sprint | Período |
|---|---|
| Sprint 1 | 24/03/2026 → 14/04/2026 |
| Sprint 2 | 15/04/2026 → 21/05/2026 |
| Sprint 3 | 22/05/2026 → 11/06/2026 |
| Apresentação Final | Semana de 22/07/2026 |

---

# 🚗 Valle Leads System — Product Backlog 

**Parceiro:** 1000 Valle Multimarcas | **PO:** Bruno | **SM:** Nicolas
**Turma:** 3DSM · ABP 2026-1 · FATEC Jacareí

---

## 🗓️ Visão Geral das Sprints

| Sprint | Período | Foco Principal |
|--------|---------|---------------|
| Sprint 1 | 24/03 – 14/04/2026 | Documentação, elicitação, scaffolding do backend e módulos iniciais |
| Sprint 2 | 15/04 – 05/05/2026 | Autenticação, RBAC, fechamento das rotas e primeiras telas |
| Sprint 3 | 06/05 – 26/05/2026 | Telas completas, funil de negociações e dashboards analíticos |

**Prioridade MoSCoW:**
- `Must` — Obrigatório, sem isso o sistema não funciona
- `Should` — Importante, mas pode ser adiado se necessário
- `Could` — Desejável se houver tempo disponível
- `Won't` — Fora do escopo desta versão

---

## 📋 Product Backlog


| ID | História de Usuário | Critérios de Aceitação | Prior. | Esf. |
|----|--------------------|-----------------------|--------|------|
| PB-001 | Como dev, quero o scaffolding do backend com TypeScript, Express e estrutura de pastas configurados, para que o time possa começar o desenvolvimento. | Estrutura de pastas criada (`src/modules`, `middlewares`, `utils`); dependências instaladas; `tsconfig.json` e `package.json` configurados; servidor rodando localmente. | Must | M |
| PB-002 | Como dev, quero o schema Prisma completo com todas as tabelas do sistema, para que o banco de dados possa ser gerado corretamente. | Tabelas: `users`, `teams`, `stores`, `customers`, `leads`, `negotiations`, `negotiation_stage_history`, `system_logs`. UUIDs em todas as PKs, soft delete, campos de auditoria e índices presentes. | Must | G |
| PB-003 | Como SM, quero um repositório GitHub configurado com branches e convenções definidas, para que o time colabore de forma organizada. | Repo criado e público; branches `main`, `develop` e `feature/*` configuradas; todos os membros adicionados; README na raiz. | Must | P |
| PB-004 | Como SM, quero um board de gerenciamento de tasks com colunas Backlog → Concluído, para que o progresso do time seja visível. | Board criado (Trello / GitHub Projects / Notion); mínimo 5 colunas; apresentado ao grupo na reunião. | Must | P |
| PB-005 | Como SM, quero um diagrama de casos de uso UML completo, para que as funcionalidades do sistema sejam rastreáveis. | Atores definidos (Atendente, Gerente, Gerente Geral, Admin); CUs em notação UML correta com `include` e `extend`; exportado em PDF e PNG. | Must | M |
| PB-006 | Como SM, quero uma tabela de regras de negócio com ID, módulo, descrição, origem e prioridade, para nortear o desenvolvimento. | Mínimo 20 RNs documentadas; campos: ID, Módulo, Descrição, Origem, Prioridade; entregue em documento privado (não no repo público). | Must | G |
| PB-007 | Como dev, quero o README do backend (`/server`) com rotas, módulos e variáveis de ambiente documentados, para acelerar o desenvolvimento. | Seções: cabeçalho com badges, sobre o backend, tecnologias, como rodar, módulos, rotas da API, variáveis de ambiente. Arquivo `.env.example` criado. | Must | M |
| PB-008 | Como dev, quero o README do frontend (`/client`) com telas, rotas e fluxos de navegação documentados, para guiar o desenvolvimento de interface. | Telas T01–T21 documentadas com rota, objetivo, tipo de usuário, componentes e API chamada. Fluxos de navegação descritos. | Must | M |
| PB-009 | Como PO, quero o Product Backlog e Sprint Backlog documentados no board do time, para manter a rastreabilidade do projeto. | Product Backlog com histórias no formato MoSCoW; Sprint 1 Backlog publicado no board; Definition of Done definido. | Must | M |
| PB-010 | Como analista, quero a especificação dos 3 dashboards com KPIs, gráficos e filtros documentados, para que os devs possam implementar corretamente. | 3 dashboards especificados (Atendente, Gerente, Gerente Geral/Admin); mínimo 4 KPIs e 4 gráficos cada; filtros de período; croquis à mão incluídos. | Must | M |
| PB-011 | Como dev, quero os módulos de Users (DTO, Repository, Service, Controller, Routes) implementados no backend, para que o gerenciamento de usuários funcione. | CRUD de users via Prisma singleton; soft delete; e-mail único; hash de senha com bcrypt; nunca retornar `password_hash`; validação Zod nas routes. | Must | M |
| PB-012 | Como dev, quero os módulos de Leads e Customers (DTO, Repository, Service, Controller, Routes) implementados no backend, para que os registros de interesse de compra funcionem. | CRUD de leads e customers; CPF único com validação de 11 dígitos; lead exige customer ativo; filtros por `team_id` e `status`; AppError para todos os erros. | Must | G |
| PB-013 | Como dev, quero os módulos de Negotiations e NegotiationStatus (DTO, Repository, Service, Controller, Routes) implementados, para que o funil de vendas funcione. | CRUD de negotiations; validação de `amount`, `status`, `is_open`; integração com StageHistory na mudança de status; `finalization_reason` obrigatório ao fechar. | Must | G |
| PB-014 | Como dev, quero os módulos de StageHistory e Importance (DTO, Repository, Service, Controller, Routes) implementados, para que o histórico de negociações seja rastreável. | Registro automático de `old_status` e `new_status`; rotas aninhadas em `/negotiations/:id/history`; service exportado para uso pelo NegotiationsService. | Must | M |
| PB-015 | Como dev, quero os módulos de Teams e Stores (DTO, Repository, Service, Controller, Routes) implementados, para que a estrutura organizacional funcione. | CRUD de teams e stores; `findByTeamId` para stores; não deletar team/store com leads ou usuários ativos; validação Zod nas routes. | Must | M |
| PB-016 | Como dev, quero os módulos de Auth (DTO, Repository, Service, Controller, Routes) implementados, para que o fluxo de login e recuperação de senha funcione. | Login valida e-mail + bcrypt, retorna JWT; recuperar senha gera token via `crypto`; redefinir senha valida token não expirado; AppError com status 401/403/404/410. | Must | M |

| PB-017 | Como usuário, quero me autenticar com e-mail e senha e receber um token JWT, para acessar o sistema de forma segura via frontend. | Tela T01 implementada; POST `/auth/login` retorna JWT; token contém id, role e expiração; bcrypt no hash; JWT expira em 8h; redirecionamento pós-login. | Must | M |
| PB-018 | Como usuário, quero recuperar minha senha por e-mail no frontend, para acessar o sistema caso esqueça a senha. | Telas T02 e T03 implementadas; POST `/auth/forgot-password` e `/auth/reset-password` integrados; token com expiração; feedback visual ao usuário. | Must | M |
| PB-019 | Como admin, quero que todas as rotas sejam protegidas por role (RBAC), para que cada perfil acesse apenas o que lhe é permitido. | `auth.middleware.ts` valida JWT; `rbac.middleware.ts` valida role; roles: ADMIN, MANAGER, ATTENDANT; retorna 401/403 quando indevido; validação exclusiva no backend. | Must | G |
| PB-020 | Como usuário autenticado, quero visualizar o layout principal com sidebar e header, para navegar entre as seções do sistema. | Tela T04 (Shell) implementada; sidebar com links por role; rota protegida com `ProtectedRoute`; AuthContext funcionando. | Must | M |
| PB-021 | Como admin, quero gerenciar usuários no frontend (listar, criar, editar, desativar), para controlar quem acessa o sistema. | Telas T14 e T15 implementadas; integração com `/api/users`; soft delete visual; formulário com validação de role. | Must | M |
| PB-022 | Como admin, quero gerenciar equipes e lojas no frontend, para organizar os atendentes por unidade. | Telas T16 e T17 implementadas; integração com `/api/teams` e `/api/stores`; vinculação de membros à equipe. | Must | M |
| PB-023 | Como atendente, quero cadastrar e buscar clientes no frontend por CPF, nome ou telefone, para evitar duplicatas durante o atendimento. | Telas T12 e T13 implementadas; busca com debounce; validação de CPF; histórico de leads do cliente visível. | Must | M |

| PB-024 | Como atendente, quero visualizar a lista de leads com filtros e busca no frontend, para encontrar rapidamente qualquer registro. | Tela T08 implementada; filtros por status, store, atendente e período; busca por nome do cliente. | Must | M |
| PB-025 | Como atendente, quero visualizar o detalhe de um lead com histórico de mudanças, para acompanhar o relacionamento com o cliente. | Tela T09 implementada; dados completos do lead; histórico de interações; botões de ação (editar, transferir, criar negociação). | Must | M |
| PB-026 | Como atendente, quero criar um novo lead vinculado a um cliente, para registrar um interesse de compra. | Tela T10 implementada; seleção/busca de customer; campos de canal de captação e observações; validações de formulário. | Must | M |
| PB-027 | Como atendente, quero gerenciar negociações e avançar estágios no funil, para acompanhar cada lead até o fechamento. | Tela T11 com funil/Kanban; avançar estágio registra histórico; fechar negociação exige motivo; importância frio/morno/quente. | Must | G |
| PB-028 | Como atendente, quero visualizar meu dashboard com KPIs e gráficos de performance individual, para acompanhar meus próprios resultados. | Tela T05 com mínimo 4 KPIs e 4 gráficos; filtros de período (este mês, mês passado, semestre, ano, customizado); dados do usuário logado apenas. | Must | G |
| PB-029 | Como gerente, quero visualizar o dashboard da minha equipe com comparativo entre atendentes, para acompanhar a performance do grupo. | Tela T06 com KPIs e gráficos da equipe; ranking de atendentes; leads sem movimento; mesmos filtros de período. | Must | G |
| PB-030 | Como gerente geral/admin, quero visualizar o dashboard global com visão de todas as equipes e lojas, para tomar decisões estratégicas. | Tela T07 com KPIs globais; filtro por loja e equipe; taxa de conversão consolidada; melhor equipe/atendente do período. | Must | G |
| PB-031 | Como admin, quero visualizar os logs de auditoria no frontend, para rastrear todas as operações críticas do sistema. | Tela T18 com listagem de logs; filtros por usuário, entidade e data; acesso exclusivo Admin. | Should | M |
| PB-032 | Como usuário, quero visualizar e editar meu perfil no sistema, para manter meus dados atualizados. | Tela T19 com dados pessoais; edição de e-mail e senha; validações; integração com PATCH `/users/me`. | Should | P |
| PB-033 | Como dev, quero páginas de erro 404 e acesso negado implementadas, para melhorar a experiência do usuário em fluxos inválidos. | Telas T20 e T21 implementadas; redirecionamento correto; mensagem clara ao usuário; botão de retorno. | Could | P |

---

## ⚡ Sprint 1 Backlog

**Período:** 24/03 – 14/04/2026 | **Apresentação:** próxima reunião do grupo

### ✅ Definition of Done — Sprint 1

Uma task é considerada **Concluída** quando:

- Entregável commitado no repositório (pasta correta) ou documento entregue ao PO
- Arquivo exportado em PDF para apresentação ao grupo (quando aplicável)
- Apresentação realizada na reunião de Sprint Review
- Nenhum erro crítico de formatação, nomenclatura ou estrutura
- README atualizado se a task impactar a documentação

---

### 👤 Ryan — Scaffolding, Schema Prisma e Módulo Negotiations

| ID | Tarefa | Camada | Horas | Status |
|----|--------|--------|-------|--------|
| S1-01 | Scaffolding do backend: estrutura de pastas (`src/modules`, `middlewares`, `utils`, `app.ts`), dependências (Express, TypeScript, Prisma, Zod, JWT, bcrypt, dotenv, nodemon) e configuração de `tsconfig.json` e `package.json` | Infraestrutura | 6h | ✅ Concluído |
| S1-02 | Schema Prisma completo: tabelas `users`, `teams`, `stores`, `customers`, `leads`, `negotiations`, `negotiation_stage_history`, `system_logs` com UUIDs, campos de auditoria, soft delete (`is_active`), relações, regras de delete (Cascade/Set Null/Restrict) e índices | Banco de Dados | 8h | ✅ Concluído |
| S1-03 | DTO de Negotiations com Zod: schemas de criação e atualização, validação de `amount` (decimal positivo), `status` (enum), `is_open`, `first_interaction_at` e `finalization_reason` | DTO | 2h | ✅ Concluído |
| S1-04 | NegotiationsRepository: CRUD via Prisma singleton com `findAll` (filtros por `team_id`, `status`, `is_open`), `findById` (com lead e stage history), `create`, `update`, `updateStatus` | Repository | 3h | ✅ Concluído |
| S1-05 | NegotiationsService: regras de negócio — não criar em lead inexistente/inativo, exigir `finalization_reason` ao fechar, registrar no StageHistory ao mudar status. AppError para todos os erros | Service | 4h | ✅ Concluído |
| S1-06 | NegotiationsController: endpoints de listagem, detalhe, criação, atualização e fechamento. Respostas padronizadas, erros via `next()` | Controller | 2h | ✅ Concluído |
| S1-07 | Rotas de Negotiations: REST com validação Zod nos endpoints de entrada, rota PATCH para mudança de status, middleware de autenticação aplicado | Routes | 2h | ✅ Concluído |

**Total Ryan: 27h**

---

### 📋 Nicolas — GitHub, Documentação de Processo e Módulo StageHistory

| ID | Tarefa | Camada | Horas | Status |
|----|--------|--------|-------|--------|
| S1-08 | Repositório GitHub: criado como público, branch `main` protegida, branches `develop` e `feature/*` configuradas, todos os membros adicionados como colaboradores | DevOps | 2h | ✅ Concluído |
| S1-09 | README principal na raiz: nome e descrição do projeto, parceiro, equipe com papéis, seções de Product Backlog e Sprint Backlog (placeholder), tecnologias, como rodar (placeholder), links de documentação | Documentação | 3h | ✅ Concluído |
| S1-10 | Board de gerenciamento de tasks: colunas Backlog / A Fazer / Em Progresso / Em Revisão / Concluído; apresentado ao grupo e fluxo de uso definido | Gestão | 2h | ✅ Concluído |
| S1-11 | Diagrama de Casos de Uso UML: atores (Atendente, Gerente, Gerente Geral, Admin), todos os CUs discutidos, notação UML correta (elipses, retângulos, `include`, `extend`), exportado em PDF e PNG | Documentação | 5h | ✅ Concluído |
| S1-12 | Tabela de Regras de Negócio: mínimo 20 RNs com ID, Módulo, Descrição, Origem e Prioridade; entregue em documento privado (não publicado no repo) | Análise | 6h | ✅ Concluído |
| S1-13 | DTO de NegotiationStageHistory e Importance com Zod: schema de criação de histórico (`old_status` opcional, `new_status` obrigatório, `notes` opcional) e schema de atualização de importance (enum: quente, morno, frio) | DTO | 2h | ✅ Concluído |
| S1-14 | NegotiationStageHistoryRepository: métodos `create` (registrar histórico) e `findByNegotiationId` (listar em ordem cronológica). Prisma singleton | Repository | 2h | ✅ Concluído |
| S1-15 | NegotiationStageHistoryService: validação de `new_status` diferente do atual, registro automático de `old_status`, service exportado para uso pelo NegotiationsService sem duplicar instância. AppError | Service | 3h | ✅ Concluído |
| S1-16 | NegotiationStageHistoryController: GET (listar histórico de negociação) e POST (adicionar entrada manual com notes). Respostas padronizadas | Controller | 2h | ✅ Concluído |
| S1-17 | Rotas de StageHistory aninhadas em Negotiations: padrão `/negotiations/:id/history`, validação Zod no POST, middleware de autenticação | Routes | 1h | ✅ Concluído |

**Total Nicolas: 28h**

---

### 📖 Bruna — Documentação do Backend e Módulo Leads/Customers

| ID | Tarefa | Camada | Horas | Status |
|----|--------|--------|-------|--------|
| S1-18 | README `/server` completo: cabeçalho com badges (shields.io), sobre o backend, padrão Controller→Service→Repository, tecnologias com links oficiais, como rodar (passo a passo), módulos do sistema, rotas da API, variáveis de ambiente | Documentação | 8h | ✅ Concluído |
| S1-19 | Arquivo `.env.example` com todas as variáveis necessárias documentadas (sem valores reais): `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `PORT`, `NODE_ENV`, `MAIL_*` | Documentação | 1h | ✅ Concluído |
| S1-20 | DTO de Leads e Customers com Zod: schemas de criação, atualização e query params; validação de CPF (11 dígitos, só números), e-mail opcional, phone opcional | DTO | 2h | ✅ Concluído |
| S1-21 | LeadsRepository e CustomersRepository: CRUD completo via Prisma singleton; `findAll` (filtros por `team_id`, `status`), `findById`, `create`, `update`, `softDelete` (`is_active = false`) | Repository | 3h | ✅ Concluído |
| S1-22 | LeadsService e CustomersService: customer sem CPF duplicado (AppError); lead sem customer ativo bloqueado; ao criar lead, validar store e team existentes. AppError para todos os erros | Service | 4h | ✅ Concluído |
| S1-23 | LeadsController e CustomersController: req/res, chamada ao service, respostas padronizadas, try/catch repassando para `next()` | Controller | 2h | ✅ Concluído |
| S1-24 | Rotas de Leads e Customers: REST para ambos os módulos, middleware de validação Zod em cada rota de entrada (POST/PUT/PATCH), middleware de autenticação aplicado | Routes | 2h | ✅ Concluído |

**Total Bruna: 22h**

---

### 🎨 Suelen — Documentação do Frontend e Módulo Users

| ID | Tarefa | Camada | Horas | Status |
|----|--------|--------|-------|--------|
| S1-25 | README `/client` completo: cabeçalho com badges, tecnologias com links, como rodar, estrutura de pastas, documentação das telas T01–T21 (rota, objetivo, tipo de usuário, componentes, API chamada), croquis (opcional), fluxos de navegação | Documentação | 8h | ✅ Concluído |
| S1-26 | DTO de Users com Zod: schemas de criação (`name`, `email`, `password`, `role`, `team_id` opcional) e atualização (campos opcionais); `role` como enum (ADMIN, MANAGER, ATTENDANT); `password_hash` nunca exposto | DTO | 2h | ✅ Concluído |
| S1-27 | UsersRepository: `findAll` (filtrar por `role`, `team_id`, `is_active`), `findById`, `findByEmail`, `create`, `update`, `softDelete`. Nunca retornar `password_hash` nos selects. Prisma singleton | Repository | 3h | ✅ Concluído |
| S1-28 | UsersService: e-mail único (AppError 409); hash de senha com bcrypt no `create`; não alterar role sem ser ADMIN; ao desativar, verificar leads abertos atribuídos. Sem lógica de login (escopo do Auth) | Service | 4h | ✅ Concluído |
| S1-29 | UsersController: endpoints listar, detalhe, criar, atualizar e desativar usuário. Respostas sem `password_hash`. Erros via `next()` | Controller | 2h | ✅ Concluído |
| S1-30 | Rotas de Users: REST com validação Zod; middleware de autenticação; middleware de autorização por role (ADMIN only para criação e desativação) | Routes | 2h | ✅ Concluído |

**Total Suelen: 21h**

---

### 🧭 Bruno (PO) — Backlog, Reunião de Arquitetura e Módulo Auth

| ID | Tarefa | Camada | Horas | Status |
|----|--------|--------|-------|--------|
| S1-31 | Product Backlog: histórias de usuário no formato "Como [perfil], quero [ação], para [benefício]" com critérios de aceitação, prioridade MoSCoW, esforço (P/M/G) e sprint estimada | Gestão | 6h | ✅ Concluído |
| S1-32 | Sprint 1 Backlog no board do Nicolas: tasks dos membros em formato de backlog com estimativa de horas; Definition of Done definido para a Sprint 1 | Gestão | 2h | ✅ Concluído |
| S1-33 | Material de apoio para reunião de arquitetura backend: explicação das camadas (Controller, Service, Repository), organização de módulos em pastas, tratamento de erros padronizado, middleware de autenticação e RBAC, exemplos de fluxo de requisição | Gestão | 3h | ✅ Concluído |
| S1-34 | DTO de Auth com Zod: login (`email` + `password`), recuperar senha (`email`), redefinir senha (`token` + `newPassword` + `confirmPassword` com refinement de igualdade), atualizar senha autenticado (`currentPassword` + `newPassword`) | DTO | 2h | ✅ Concluído |
| S1-35 | AuthRepository: `findUserByEmail` (com `password_hash`), `savePasswordResetToken` (token + expiração), `findUserByResetToken`, `clearResetToken`. Prisma singleton | Repository | 2h | ✅ Concluído |
| S1-36 | AuthService: login com bcrypt compare + JWT; recuperar senha gera token via `crypto`, salva hash e envia e-mail; redefinir senha valida token não expirado e faz novo hash. AppError com 401/403/404/410 | Service | 4h | ✅ Concluído |
| S1-37 | AuthController: POST `/login`, POST `/forgot-password`, POST `/reset-password`, PATCH `/update-password` (autenticado). Respostas sem dados sensíveis. Erros via `next()` | Controller | 2h | ✅ Concluído |
| S1-38 | Rotas de Auth: rotas públicas (login, forgot, reset) sem autenticação; rota `update-password` com middleware de autenticação JWT; validação Zod em todos os endpoints | Routes | 2h | ✅ Concluído |

**Total Bruno: 23h**

---

### 📊 Pedro — Especificação dos Dashboards e Módulo Teams/Stores

| ID | Tarefa | Camada | Horas | Status |
|----|--------|--------|-------|--------|
| S1-39 | Especificação do Dashboard do Atendente: mínimo 4 KPIs (ex: leads ativos, convertidos no mês, taxa de conversão, tempo médio), mínimo 4 gráficos com tipo justificado, filtros de período (este mês / mês passado / semestre / ano / customizado), croqui à mão | Análise | 4h | ✅ Concluído |
| S1-40 | Especificação do Dashboard do Gerente: mínimo 4 KPIs (ex: total da equipe, taxa de conversão, melhor atendente, leads sem movimento), mínimo 4 gráficos, mesmos filtros de período, croqui à mão | Análise | 4h | ✅ Concluído |
| S1-41 | Especificação do Dashboard do Gerente Geral/Admin: mínimo 4 KPIs (ex: total geral, taxa global, melhor equipe, leads criados hoje), mínimo 4 gráficos, filtros de período + filtro por loja/equipe, croqui à mão | Análise | 4h | ✅ Concluído |
| S1-42 | DTO de Teams e Stores com Zod: Teams com `name` (obrigatório) e `is_active`; Stores com `name`, `address` (opcional) e `team_id` (UUID obrigatório); schemas de atualização com campos opcionais | DTO | 2h | ✅ Concluído |
| S1-43 | TeamsRepository e StoresRepository: `findAll` (filtro `is_active`), `findById` (Teams incluindo users e stores relacionadas), `create`, `update`, `softDelete`; Stores com `findByTeamId`. Prisma singleton | Repository | 3h | ✅ Concluído |
| S1-44 | TeamsService e StoresService: não deletar team com usuários ou leads ativos vinculados (AppError); não deletar store com leads ativos; ao criar store, validar que team existe e está ativo. AppError para erros de negócio | Service | 3h | ✅ Concluído |
| S1-45 | TeamsController e StoresController: endpoints CRUD para Teams e Stores. Respostas padronizadas. Erros via `next()` | Controller | 2h | ✅ Concluído |
| S1-46 | Rotas de Teams e Stores: REST com validação Zod; stores como sub-recurso (`/teams/:id/stores`) ou rota própria; middleware de autenticação e autorização ADMIN | Routes | 2h | ✅ Concluído |

**Total Pedro: 24h**

---

## 📊 Resumo da Sprint 1

| Membro | Papel | Tasks | Horas |
|--------|-------|-------|-------|
| Ryan | Dev | 7 | 27h |
| Nicolas | SM / Dev | 10 | 28h |
| Bruna | Dev | 7 | 22h |
| Suelen | Dev | 6 | 21h |
| Bruno | PO / Dev | 8 | 23h |
| Pedro | Dev | 8 | 24h |
| **Total** | | **46 tasks** | **145h** |

---

---

## 🏃 Sprint 2 — 15/04 a 21/05/2026

> A definir.

---

## 🏃 Sprint 3 — 22/05 a 11/06/2026

> A definir.

---

## ✅ Requisitos Funcionais

| ID | Descrição |
|---|---|
| RF01 | Autenticação de usuários via e-mail e senha com JWT |
| RF02 | Controle de acesso baseado em papéis (RBAC) |
| RF03 | Gestão de negociações vinculadas a leads |
| RF04 | Dashboard Operacional |
| RF05 | Dashboard Analítico |
| RF06 | Filtros temporais (semana, mês, ano, período customizado) |
| RF07 | Logs de acesso e operações |

---

## 🔧 Requisitos Não Funcionais

| ID | Descrição |
|---|---|
| RNF01 | Arquitetura em camadas com API REST |
| RNF02 | Segurança com bcrypt, JWT e validação exclusiva no backend |
| RNF03 | Consultas analíticas otimizadas |
| RNF04 | Interface responsiva e navegação intuitiva |
| RNF05 | Integridade referencial e consistência transacional |
| RNF06 | Documentação completa (DER, UML, endpoints, README) |
| RNF07 | Conteinerização com Docker e Docker Compose |
| RNF08 | Metodologia ágil com Scrum |
| RNF09 | Versionamento com Git e repositório público no GitHub |
| RNF10 | Uso explícito de padrões de projeto GoF |
| RNF11 | Adoção de padrão arquitetural reconhecido |
| RNF12 | Organização em camadas (apresentação, serviços, repositório, domínio) |
| RNF13 | Separação de responsabilidades (SRP) |

---

## 🚀 Como Rodar

> Em construção — as instruções de execução serão adicionadas em breve.

```bash
# clone o repositório
git clone https://github.com/seu-org/valle-leads-system.git

# navegue até a pasta do projeto
cd valle-leads-system

# suba os containers
docker compose up
```

---

## 📚 Documentação

| Recurso | Link |
|---|---|
| Documentação do Frontend | _em breve_ |
| Documentação do Backend | _em breve_ |
