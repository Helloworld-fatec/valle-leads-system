# 🏃 Sprint 1 — 24/03 a 14/04/2026

**Foco:** Documentação, elicitação de requisitos, scaffolding do backend, implementação dos módulos iniciais e prototipação das telas.

---

## 📌 Objetivo da Sprint

Estruturar a base do projeto: configurar o repositório, definir o backlog, elaborar os artefatos de análise e implementar todos os módulos do backend necessários para a Sprint 2 (autenticação, leads, negociações, usuários, equipes e lojas).

---

## ✅ Definition of Done

Uma task é considerada **Concluída** quando:

- Entregável commitado no repositório (pasta correta) ou documento entregue ao PO
- Arquivo exportado em PDF para apresentação ao grupo (quando aplicável)
- Apresentação realizada na reunião de Sprint Review
- Nenhum erro crítico de formatação, nomenclatura ou estrutura
- README atualizado se a task impactar a documentação

---

## 📋 Sprint Backlog

| ID    | Tarefa                                                               | História(s) Relacionada(s)                                                                                     | Responsável | Horas | Status      |
| ----- | -------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- | ----------- | ----- | ----------- |
| S1-01 | Scaffolding do backend (estrutura de pastas, dependências, tsconfig) | PB-007                                                                                                         | Ryan        | 6h    | ✅ Concluído |
| S1-02 | Schema Prisma completo (todas as tabelas, relações, índices)         | PB-001, PB-002, PB-003, PB-004, PB-005, PB-006, PB-010, PB-011, PB-012, PB-013, PB-014, PB-015, PB-016, PB-031 | Ryan        | 8h    | ✅ Concluído |
| S1-03 | DTO de Negotiations com Zod                                          | PB-014, PB-015, PB-016, PB-027                                                                                 | Ryan        | 2h    | ✅ Concluído |
| S1-04 | NegotiationsRepository                                               | PB-014, PB-015, PB-016, PB-027                                                                                 | Ryan        | 3h    | ✅ Concluído |
| S1-05 | NegotiationsService                                                  | PB-014, PB-015, PB-016, PB-027                                                                                 | Ryan        | 4h    | ✅ Concluído |
| S1-06 | NegotiationsController                                               | PB-014, PB-015, PB-016, PB-027                                                                                 | Ryan        | 2h    | ✅ Concluído |
| S1-07 | Rotas de Negotiations                                                | PB-014, PB-015, PB-016, PB-027                                                                                 | Ryan        | 2h    | ✅ Concluído |
| S1-08 | Repositório GitHub (branches, colaboradores)                         | PB-009, RNF09                                                                                                  | Nicolas     | 2h    | ✅ Concluído |
| S1-09 | README principal na raiz                                             | PB-009, RNF06                                                                                                  | Nicolas     | 3h    | ✅ Concluído |
| S1-10 | Board de gerenciamento de tasks                                      | PB-009, RNF08                                                                                                  | Nicolas     | 2h    | ✅ Concluído |
| S1-11 | Diagrama de Casos de Uso UML                                         | PB-009, RNF06                                                                                                  | Nicolas     | 5h    | ✅ Concluído |
| S1-12 | Tabela de Regras de Negócio (mín. 20 RNs)                            | PB-009, RNF06                                                                                                  | Nicolas     | 6h    | ✅ Concluído |
| S1-13 | DTO de NegotiationStageHistory e Importance com Zod                  | PB-015, PB-016, PB-027                                                                                         | Nicolas     | 2h    | ✅ Concluído |
| S1-14 | NegotiationStageHistoryRepository                                    | PB-015, PB-027                                                                                                 | Nicolas     | 2h    | ✅ Concluído |
| S1-15 | NegotiationStageHistoryService                                       | PB-015, PB-027                                                                                                 | Nicolas     | 3h    | ✅ Concluído |
| S1-16 | NegotiationStageHistoryController                                    | PB-015, PB-027                                                                                                 | Nicolas     | 2h    | ✅ Concluído |
| S1-17 | Rotas de StageHistory aninhadas em Negotiations                      | PB-015, PB-027                                                                                                 | Nicolas     | 1h    | ✅ Concluído |
| S1-18 | README `/server` completo                                            | PB-007, RNF06                                                                                                  | Bruna       | 8h    | ✅ Concluído |
| S1-19 | Arquivo `.env.example`                                               | PB-007, RNF07                                                                                                  | Bruna       | 1h    | ✅ Concluído |
| S1-20 | DTO de Leads e Customers com Zod                                     | PB-010, PB-011, PB-012, PB-013, PB-023, PB-024, PB-025, PB-026                                                 | Bruna       | 2h    | ✅ Concluído |
| S1-21 | LeadsRepository e CustomersRepository                                | PB-010, PB-011, PB-012, PB-013, PB-023, PB-024, PB-025, PB-026                                                 | Bruna       | 3h    | ✅ Concluído |
| S1-22 | LeadsService e CustomersService                                      | PB-010, PB-011, PB-012, PB-013, PB-023, PB-024, PB-025, PB-026                                                 | Bruna       | 4h    | ✅ Concluído |
| S1-23 | LeadsController e CustomersController                                | PB-010, PB-011, PB-012, PB-013, PB-023, PB-024, PB-025, PB-026                                                 | Bruna       | 2h    | ✅ Concluído |
| S1-24 | Rotas de Leads e Customers                                           | PB-010, PB-011, PB-012, PB-013, PB-023, PB-024, PB-025, PB-026                                                 | Bruna       | 2h    | ✅ Concluído |
| S1-25 | README `/client` completo (telas T01–T21)                            | PB-008, PB-020, PB-021, PB-022, PB-023, PB-024, PB-025, PB-026, PB-027, PB-028, PB-029, PB-030, PB-032, RNF06  | Suelen      | 8h    | ✅ Concluído |
| S1-26 | DTO de Users com Zod                                                 | PB-001, PB-002, PB-003, PB-004, PB-005, PB-006, PB-021                                                         | Suelen      | 2h    | ✅ Concluído |
| S1-27 | UsersRepository                                                      | PB-001, PB-002, PB-003, PB-004, PB-005, PB-006, PB-021                                                         | Suelen      | 3h    | ✅ Concluído |
| S1-28 | UsersService                                                         | PB-001, PB-002, PB-003, PB-004, PB-005, PB-006, PB-021                                                         | Suelen      | 4h    | ✅ Concluído |
| S1-29 | UsersController                                                      | PB-001, PB-002, PB-003, PB-004, PB-005, PB-006, PB-021                                                         | Suelen      | 2h    | ✅ Concluído |
| S1-30 | Rotas de Users                                                       | PB-001, PB-002, PB-003, PB-004, PB-005, PB-006, PB-021                                                         | Suelen      | 2h    | ✅ Concluído |
| S1-31 | Product Backlog (histórias MoSCoW)                                   | PB-009, RNF08                                                                                                  | Bruno       | 6h    | ✅ Concluído |
| S1-32 | Sprint 1 Backlog no board                                            | PB-009, RNF08                                                                                                  | Bruno       | 2h    | ✅ Concluído |
| S1-33 | Material de apoio para reunião de arquitetura                        | PB-007, PB-009, RNF01, RNF11, RNF12                                                                            | Bruno       | 3h    | ✅ Concluído |
| S1-34 | DTO de Auth com Zod                                                  | PB-017, PB-018, PB-019                                                                                         | Bruno       | 2h    | ✅ Concluído |
| S1-35 | AuthRepository                                                       | PB-017, PB-018, PB-019                                                                                         | Bruno       | 2h    | ✅ Concluído |
| S1-36 | AuthService                                                          | PB-017, PB-018, PB-019                                                                                         | Bruno       | 4h    | ✅ Concluído |
| S1-37 | AuthController                                                       | PB-017, PB-018, PB-019                                                                                         | Bruno       | 2h    | ✅ Concluído |
| S1-38 | Rotas de Auth                                                        | PB-017, PB-018, PB-019                                                                                         | Bruno       | 2h    | ✅ Concluído |
| S1-39 | Especificação do Dashboard do Atendente                              | PB-028                                                                                                         | Pedro       | 4h    | ✅ Concluído |
| S1-40 | Especificação do Dashboard do Gerente                                | PB-029                                                                                                         | Pedro       | 4h    | ✅ Concluído |
| S1-41 | Especificação do Dashboard do Gerente Geral/Admin                    | PB-030                                                                                                         | Pedro       | 4h    | ✅ Concluído |
| S1-42 | DTO de Teams e Stores com Zod                                        | PB-005, PB-006, PB-022                                                                                         | Pedro       | 2h    | ✅ Concluído |
| S1-43 | TeamsRepository e StoresRepository                                   | PB-005, PB-006, PB-022                                                                                         | Pedro       | 3h    | ✅ Concluído |
| S1-44 | TeamsService e StoresService                                         | PB-005, PB-006, PB-022                                                                                         | Pedro       | 3h    | ✅ Concluído |
| S1-45 | TeamsController e StoresController                                   | PB-005, PB-006, PB-022                                                                                         | Pedro       | 2h    | ✅ Concluído |
| S1-46 | Rotas de Teams e Stores                                              | PB-005, PB-006, PB-022                                                                                         | Pedro       | 2h    | ✅ Concluído |

---

## 📝 Detalhamento das Tasks

### 👤 Ryan — Fundação Técnica do Backend e Negociações

| ID    | Task                        | História(s) Relacionada(s)                                                                                     | Descrição                                                                                                                                                       |
| ----- | --------------------------- | -------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| S1-01 | Scaffolding do backend      | PB-007                                                                                                         | Criar a estrutura inicial do backend com TypeScript, Express, Prisma, Zod, JWT, bcrypt, dotenv e organização modular em `/server`.                              |
| S1-02 | Schema Prisma completo      | PB-001, PB-002, PB-003, PB-004, PB-005, PB-006, PB-010, PB-011, PB-012, PB-013, PB-014, PB-015, PB-016, PB-031 | Criar o schema do banco com tabelas, relações, índices, UUIDs, campos de auditoria, soft delete e regras de integridade necessárias para os módulos do sistema. |
| S1-03 | DTO de Negotiations com Zod | PB-014, PB-015, PB-016, PB-027                                                                                 | Criar schemas de validação para criação e atualização de negociações.                                                                                           |
| S1-04 | NegotiationsRepository      | PB-014, PB-015, PB-016, PB-027                                                                                 | Criar a camada de acesso a dados das negociações usando Prisma.                                                                                                 |
| S1-05 | NegotiationsService         | PB-014, PB-015, PB-016, PB-027                                                                                 | Implementar a camada de regras de negócio para negociações, conectando controller e repository.                                                                 |
| S1-06 | NegotiationsController      | PB-014, PB-015, PB-016, PB-027                                                                                 | Criar o controller responsável por receber requisições HTTP relacionadas às negociações.                                                                        |
| S1-07 | Rotas de Negotiations       | PB-014, PB-015, PB-016, PB-027                                                                                 | Criar e registrar as rotas do módulo de negociações no backend.                                                                                                 |

---

### 👤 Nicolas — Scrum, GitHub, Documentação e Regras de Negócio

| ID    | Task                                                | História(s) Relacionada(s) | Descrição                                                                                                                  |
| ----- | --------------------------------------------------- | -------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| S1-08 | Repositório GitHub                                  | PB-009, RNF09              | Criar e configurar o repositório público do projeto, branches principais, convenção de branches e colaboradores.           |
| S1-09 | README principal na raiz                            | PB-009, RNF06              | Criar o README principal com descrição do projeto, parceiro, equipe, Scrum, tecnologias e links para documentação técnica. |
| S1-10 | Board de gerenciamento de tasks                     | PB-009, RNF08              | Criar o board do projeto com colunas de fluxo para acompanhamento das tasks durante a sprint.                              |
| S1-11 | Diagrama de Casos de Uso UML                        | PB-009, RNF06              | Criar o diagrama de casos de uso com atores, casos de uso principais e relações do sistema.                                |
| S1-12 | Tabela de Regras de Negócio                         | PB-009, RNF06              | Criar documento privado com regras de negócio do sistema, organizadas por ID, módulo, descrição, origem e prioridade.      |
| S1-13 | DTO de NegotiationStageHistory e Importance com Zod | PB-015, PB-016, PB-027     | Criar validações para histórico de etapas e importância de negociações.                                                    |
| S1-14 | NegotiationStageHistoryRepository                   | PB-015, PB-027             | Criar a camada de acesso a dados do histórico de etapas da negociação.                                                     |
| S1-15 | NegotiationStageHistoryService                      | PB-015, PB-027             | Implementar regras e fluxo de serviço para o histórico de etapas da negociação.                                            |
| S1-16 | NegotiationStageHistoryController                   | PB-015, PB-027             | Criar controller para expor operações relacionadas ao histórico de etapas.                                                 |
| S1-17 | Rotas de StageHistory aninhadas em Negotiations     | PB-015, PB-027             | Criar rotas relacionadas ao histórico de etapas dentro do contexto de negociações.                                         |

---

### 👤 Bruna — Documentação do Backend, Leads e Clientes

| ID    | Task                                  | História(s) Relacionada(s)                                     | Descrição                                                                                                                                     |
| ----- | ------------------------------------- | -------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| S1-18 | README `/server` completo             | PB-007, RNF06                                                  | Criar documentação técnica do backend com tecnologias, arquitetura, módulos, rotas previstas, variáveis de ambiente e instruções de execução. |
| S1-19 | Arquivo `.env.example`                | PB-007, RNF07                                                  | Criar arquivo de exemplo das variáveis de ambiente necessárias para o backend, sem expor dados reais.                                         |
| S1-20 | DTO de Leads e Customers com Zod      | PB-010, PB-011, PB-012, PB-013, PB-023, PB-024, PB-025, PB-026 | Criar schemas de validação para os módulos de leads e clientes.                                                                               |
| S1-21 | LeadsRepository e CustomersRepository | PB-010, PB-011, PB-012, PB-013, PB-023, PB-024, PB-025, PB-026 | Criar camada de acesso a dados para leads e clientes usando Prisma.                                                                           |
| S1-22 | LeadsService e CustomersService       | PB-010, PB-011, PB-012, PB-013, PB-023, PB-024, PB-025, PB-026 | Implementar regras de negócio e fluxo de serviço para leads e clientes.                                                                       |
| S1-23 | LeadsController e CustomersController | PB-010, PB-011, PB-012, PB-013, PB-023, PB-024, PB-025, PB-026 | Criar controllers responsáveis por expor operações HTTP de leads e clientes.                                                                  |
| S1-24 | Rotas de Leads e Customers            | PB-010, PB-011, PB-012, PB-013, PB-023, PB-024, PB-025, PB-026 | Criar e registrar as rotas dos módulos de leads e clientes no backend.                                                                        |

---

### 👤 Suelen — Documentação do Frontend e Usuários

| ID    | Task                      | História(s) Relacionada(s)                                                                                    | Descrição                                                                                                                                         |
| ----- | ------------------------- | ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| S1-25 | README `/client` completo | PB-008, PB-020, PB-021, PB-022, PB-023, PB-024, PB-025, PB-026, PB-027, PB-028, PB-029, PB-030, PB-032, RNF06 | Criar documentação técnica do frontend com tecnologias, estrutura de pastas, telas previstas, rotas, fluxos de navegação e variáveis de ambiente. |
| S1-26 | DTO de Users com Zod      | PB-001, PB-002, PB-003, PB-004, PB-005, PB-006, PB-021                                                        | Criar schemas de validação para criação e atualização de usuários.                                                                                |
| S1-27 | UsersRepository           | PB-001, PB-002, PB-003, PB-004, PB-005, PB-006, PB-021                                                        | Criar a camada de acesso a dados dos usuários usando Prisma.                                                                                      |
| S1-28 | UsersService              | PB-001, PB-002, PB-003, PB-004, PB-005, PB-006, PB-021                                                        | Implementar regras de negócio de usuários, incluindo fluxo de criação, listagem e atualização.                                                    |
| S1-29 | UsersController           | PB-001, PB-002, PB-003, PB-004, PB-005, PB-006, PB-021                                                        | Criar controller responsável por receber requisições HTTP relacionadas a usuários.                                                                |
| S1-30 | Rotas de Users            | PB-001, PB-002, PB-003, PB-004, PB-005, PB-006, PB-021                                                        | Criar e registrar as rotas do módulo de usuários no backend.                                                                                      |

---

### 👤 Bruno — Product Backlog, Autenticação, RBAC e Arquitetura

| ID    | Task                                          | História(s) Relacionada(s)          | Descrição                                                                                                               |
| ----- | --------------------------------------------- | ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| S1-31 | Product Backlog (histórias MoSCoW)            | PB-009, RNF08                       | Criar Product Backlog com histórias de usuário, critérios de aceitação, prioridade MoSCoW, esforço e sprint prevista.   |
| S1-32 | Sprint 1 Backlog no board                     | PB-009, RNF08                       | Detalhar as tasks da Sprint 1 no board com responsáveis, estimativas e Definition of Done.                              |
| S1-33 | Material de apoio para reunião de arquitetura | PB-007, PB-009, RNF01, RNF11, RNF12 | Preparar material para orientar a definição da arquitetura Controller → Service → Repository e o fluxo das requisições. |
| S1-34 | DTO de Auth com Zod                           | PB-017, PB-018, PB-019              | Criar validações de autenticação para login, refresh token e operações relacionadas.                                    |
| S1-35 | AuthRepository                                | PB-017, PB-018, PB-019              | Criar camada de acesso a dados necessária para autenticação, principalmente busca de usuário por e-mail.                |
| S1-36 | AuthService                                   | PB-017, PB-018, PB-019              | Implementar regras de autenticação, validação de credenciais, geração de tokens e refresh token.                        |
| S1-37 | AuthController                                | PB-017, PB-018, PB-019              | Criar controller responsável por login, refresh token e logout.                                                         |
| S1-38 | Rotas de Auth                                 | PB-017, PB-018, PB-019              | Criar e registrar rotas de autenticação no backend.                                                                     |

---

### 👤 Pedro — Dashboards, Equipes e Lojas

| ID    | Task                                              | História(s) Relacionada(s) | Descrição                                                                                    |
| ----- | ------------------------------------------------- | -------------------------- | -------------------------------------------------------------------------------------------- |
| S1-39 | Especificação do Dashboard do Atendente           | PB-028                     | Definir KPIs, gráficos, filtros de período e croqui do dashboard individual do atendente.    |
| S1-40 | Especificação do Dashboard do Gerente             | PB-029                     | Definir KPIs, gráficos, filtros de período e croqui do dashboard de performance da equipe.   |
| S1-41 | Especificação do Dashboard do Gerente Geral/Admin | PB-030                     | Definir KPIs, gráficos, filtros de período, filtro por loja/equipe e croqui da visão global. |
| S1-42 | DTO de Teams e Stores com Zod                     | PB-005, PB-006, PB-022     | Criar schemas de validação para equipes e lojas.                                             |
| S1-43 | TeamsRepository e StoresRepository                | PB-005, PB-006, PB-022     | Criar camada de acesso a dados para equipes e lojas usando Prisma.                           |
| S1-44 | TeamsService e StoresService                      | PB-005, PB-006, PB-022     | Implementar regras de negócio e fluxo de serviço para equipes e lojas.                       |
| S1-45 | TeamsController e StoresController                | PB-005, PB-006, PB-022     | Criar controllers responsáveis por receber requisições HTTP de equipes e lojas.              |
| S1-46 | Rotas de Teams e Stores                           | PB-005, PB-006, PB-022     | Criar e registrar as rotas dos módulos de equipes e lojas no backend.                        |

---

## 🔗 Relação com Product Backlog

| História | Descrição resumida                                            | Tasks relacionadas                                                          |
| -------- | ------------------------------------------------------------- | --------------------------------------------------------------------------- |
| PB-001   | Usuários e perfis do sistema                                  | S1-02, S1-26, S1-27, S1-28, S1-29, S1-30                                    |
| PB-002   | Controle de usuários por perfil                               | S1-02, S1-26, S1-27, S1-28, S1-29, S1-30                                    |
| PB-003   | Gestão de permissões e papéis                                 | S1-02, S1-26, S1-27, S1-28, S1-29, S1-30                                    |
| PB-004   | Organização de usuários no sistema                            | S1-02, S1-26, S1-27, S1-28, S1-29, S1-30                                    |
| PB-005   | Equipes                                                       | S1-02, S1-42, S1-43, S1-44, S1-45, S1-46                                    |
| PB-006   | Lojas                                                         | S1-02, S1-42, S1-43, S1-44, S1-45, S1-46                                    |
| PB-007   | Estrutura técnica/documentação do backend                     | S1-01, S1-18, S1-19, S1-33                                                  |
| PB-008   | Estrutura técnica/documentação do frontend                    | S1-25                                                                       |
| PB-009   | Documentação, Scrum, rastreabilidade e organização do projeto | S1-08, S1-09, S1-10, S1-11, S1-12, S1-31, S1-32, S1-33                      |
| PB-010   | Clientes/prospects                                            | S1-02, S1-20, S1-21, S1-22, S1-23, S1-24                                    |
| PB-011   | Cadastro de clientes                                          | S1-02, S1-20, S1-21, S1-22, S1-23, S1-24                                    |
| PB-012   | Consulta e organização de clientes                            | S1-02, S1-20, S1-21, S1-22, S1-23, S1-24                                    |
| PB-013   | Dados complementares de clientes/leads                        | S1-02, S1-20, S1-21, S1-22, S1-23, S1-24                                    |
| PB-014   | Negociações vinculadas a leads                                | S1-02, S1-03, S1-04, S1-05, S1-06, S1-07                                    |
| PB-015   | Histórico de etapas da negociação                             | S1-02, S1-03, S1-04, S1-05, S1-06, S1-07, S1-13, S1-14, S1-15, S1-16, S1-17 |
| PB-016   | Status e importância da negociação                            | S1-02, S1-03, S1-04, S1-05, S1-06, S1-07, S1-13                             |
| PB-017   | Autenticação com e-mail e senha                               | S1-34, S1-35, S1-36, S1-37, S1-38                                           |
| PB-018   | Renovação/controle de sessão                                  | S1-34, S1-35, S1-36, S1-37, S1-38                                           |
| PB-019   | Controle de acesso por role                                   | S1-34, S1-35, S1-36, S1-37, S1-38                                           |
| PB-020   | Layout principal, navegação e rotas protegidas                | S1-25                                                                       |
| PB-021   | Gerenciamento de usuários no frontend                         | S1-25, S1-26, S1-27, S1-28, S1-29, S1-30                                    |
| PB-022   | Gerenciamento de equipes e lojas no frontend                  | S1-25, S1-42, S1-43, S1-44, S1-45, S1-46                                    |
| PB-023   | Cadastro, busca e visualização de clientes                    | S1-20, S1-21, S1-22, S1-23, S1-24, S1-25                                    |
| PB-024   | Lista de leads com filtros e busca                            | S1-20, S1-21, S1-22, S1-23, S1-24, S1-25                                    |
| PB-025   | Detalhe de lead com histórico e ações                         | S1-20, S1-21, S1-22, S1-23, S1-24, S1-25                                    |
| PB-026   | Criar novo lead vinculado a cliente                           | S1-20, S1-21, S1-22, S1-23, S1-24, S1-25                                    |
| PB-027   | Funil/Kanban de negociações                                   | S1-03, S1-04, S1-05, S1-06, S1-07, S1-13, S1-14, S1-15, S1-16, S1-17, S1-25 |
| PB-028   | Dashboard do Atendente                                        | S1-25, S1-39                                                                |
| PB-029   | Dashboard do Gerente                                          | S1-25, S1-40                                                                |
| PB-030   | Dashboard do Gerente Geral/Admin                              | S1-25, S1-41                                                                |
| PB-031   | Logs/auditoria                                                | S1-02                                                                       |
| PB-032   | Perfil do usuário                                             | S1-25                                                                       |
---

## 👤 Distribuição por Membro

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

## ✅ Entregáveis

- Repositório GitHub configurado com branches e convenções
- Schema Prisma completo com todas as tabelas do sistema
- Backend scaffolding com estrutura modular (Controller → Service → Repository)
- Módulos implementados: Auth, Users, Leads, Customers, Negotiations, StageHistory, Teams, Stores
- Diagrama de Casos de Uso UML exportado em PDF e PNG
- Tabela de Regras de Negócio (documento privado)
- Especificação dos 3 dashboards com KPIs e croquis
- README da raiz, `/server` e `/client` documentados
- Product Backlog e Sprint 1 Backlog publicados no board

---

## 📊 Revisão da Sprint

Durante a Sprint Review da Sprint 1, foram apresentados os principais entregáveis planejados para a primeira etapa do projeto, com foco na estruturação inicial do sistema, organização do backlog, documentação base e validação da proposta com o cliente.

Foram demonstrados os módulos iniciais do backend, contemplando a base da arquitetura em camadas, a estrutura modular do projeto e a implementação dos primeiros domínios do sistema, como autenticação, usuários, leads, clientes, negociações, histórico de etapas, equipes e lojas.

Além da parte técnica do backend, também foram apresentados protótipos iniciais das telas do frontend utilizando dados mockados. Esses protótipos tinham como objetivo validar a organização visual, a disposição das informações, a navegação inicial e a proposta de experiência do usuário antes da integração com dados reais.

O layout apresentado foi validado pelo cliente, que considerou a estrutura visual adequada para a proposta do sistema. Como feedback principal, foi reforçada a importância do **funil de vendas**, por ser uma tela central para o acompanhamento das negociações e para a rotina dos usuários do sistema. Esse ponto foi destacado porque, até aquele momento, o funil ainda não havia sido prototipado, ficando como uma prioridade importante para as próximas sprints.

### Pontos positivos observados

* A base técnica do backend foi estruturada de forma modular.
* Os principais módulos necessários para evolução da Sprint 2 foram iniciados.
* A documentação inicial do projeto ajudou a organizar o escopo e os requisitos.
* Os protótipos com dados mockados permitiram validar a direção visual do sistema.
* O layout foi aprovado pelo cliente como uma base adequada para a continuidade do projeto.
* O feedback sobre o funil de vendas ajudou a priorizar melhor as próximas entregas.

### Feedbacks recebidos

* O cliente validou o layout apresentado.
* Foi reforçada a necessidade de dar atenção especial ao funil de vendas.
* A tela de funil foi identificada como uma funcionalidade essencial para o fluxo comercial.
* A equipe deveria priorizar, nas próximas sprints, telas que representassem melhor a rotina real dos atendentes e gestores.
* A evolução dos protótipos deveria caminhar para telas funcionais e integradas ao backend.

---

## 🔁 Retrospectiva

### O que funcionou bem?

* A equipe conseguiu estruturar a base inicial do projeto.
* O backend avançou de forma organizada, seguindo a divisão em controllers, services, repositories, DTOs e rotas.
* A divisão de responsabilidades permitiu avanço paralelo entre documentação, backend e prototipação.
* Os protótipos iniciais ajudaram a validar a direção visual do sistema com o cliente.
* A Sprint 1 ajudou a transformar os requisitos iniciais em uma base técnica mais concreta para as próximas entregas.
* A documentação inicial, o backlog e os artefatos de análise contribuíram para alinhar melhor o escopo do projeto.

### O que pode melhorar?

* Prototipar mais cedo as telas consideradas centrais para o negócio, como o funil de vendas.
* Registrar com mais detalhes os feedbacks recebidos durante a Sprint Review.
* Melhorar a rastreabilidade entre histórias de usuário, protótipos e futuras implementações.
* Manter a documentação da sprint mais atualizada ao longo da execução, evitando concentrar ajustes apenas no final.
* Alinhar melhor, antes da review, quais fluxos são mais importantes para validação do cliente.
* Definir com mais clareza a diferença entre protótipo, tela com dados mockados e funcionalidade integrada.

### Ações para a próxima sprint

* Priorizar a criação do funil de vendas no frontend.
* Evoluir os protótipos para telas funcionais.
* Iniciar a integração entre frontend e backend.
* Implementar autenticação e controle de acesso por perfil.
* Melhorar a navegação principal do sistema com sidebar, header e rotas protegidas.
* Avançar nas telas de leads, usuários, lojas, equipes, perfil e dashboards.
* Registrar melhor os feedbacks da Sprint Review e as decisões tomadas a partir deles.
* Manter os READMEs e artefatos Scrum atualizados conforme as entregas forem evoluindo.
