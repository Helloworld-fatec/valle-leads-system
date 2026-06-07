# 🏃 Sprint 2 — 15/04 a 21/05/2026

**Foco:** Autenticação, controle de acesso por role (RBAC), fechamento das rotas do backend, primeiras telas do frontend e integração inicial entre as camadas do sistema.

---

## 📌 Objetivo da Sprint

Implementar as primeiras telas funcionais do frontend com autenticação, controle de acesso por perfil, funil de vendas em Kanban, gestão de leads com atribuição, administração de usuários, clientes, lojas e equipes, além de consolidar a navegação principal do sistema.

A Sprint 2 contempla funcionalidades relacionadas às visões de **Atendente**, **Gerente** e **Gerente Geral**, conectando as telas desenvolvidas às histórias de usuário priorizadas no Product Backlog.

---

## ✅ Definition of Done

Uma task é considerada **Concluída** quando:

* Entregável commitado no repositório na branch `feat/nome-da-task`
* Pull Request aberto para revisão do time
* Componentes implementados com **Tailwind CSS** sem CSS puro ou styled-components
* Integração com os serviços do backend via `apiFetch` funcionando corretamente
* Nenhum erro crítico de tipagem, nomenclatura ou estrutura
* Funcionalidade testada localmente
* README atualizado se a task impactar a documentação

---

## 📋 Sprint Backlog

| ID    | Tarefa                                                                                                   | História(s) Relacionada(s)                                                     | Responsável | Horas | Status      |
| ----- | -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ | ----------- | ----- | ----------- |
| S2-01 | Criar `negotiationsService.ts`                                                                           | PB-027                                                                         | Nicolas     | 2h     | ✅ Concluído |
| S2-02 | Criar página `Funil.tsx`                                                                                 | PB-027                                                                         | Nicolas     | 3h    | ✅ Concluído |
| S2-03 | Criar componentes `KanbanBoard` e `KanbanColumn`                                                         | PB-027                                                                         | Nicolas     | 2h     | ✅ Concluído |
| S2-04 | Criar componente `NegotiationCard`                                                                       | PB-027                                                                         | Nicolas     | 2h    | ✅ Concluído |
| S2-05 | Criar componente `NegotiationDetailModal`                                                                | PB-025, PB-027                                                                 | Nicolas     | 2h     | ✅ Concluído |
| S2-06 | Refatorar visual da página `Login.tsx`                                                                   | PB-017                                                                         | Suelen      | 3h     | ✅ Concluído |
| S2-07 | Criar componente `LoginForm.tsx`                                                                         | PB-017                                                                         | Suelen      | 2h     | ✅ Concluído |
| S2-08 | Criar `authService.ts`                                                                                   | PB-017                                                                         | Suelen      | 2h     | ✅ Concluído |
| S2-09 | Criar página `Profile.tsx` e `profileService.ts`                                                         | PB-032                                                                         | Suelen      | 4h     | ✅ Concluído |
| S2-10 | Criar componente `EditProfileModal.tsx`                                                                  | PB-032                                                                         | Suelen      | 2h     | ✅ Concluído |
| S2-11 | Criar `leadsService.ts` e refatorar `Leads.tsx`                                                          | PB-024                                                                         | Bruna       | 3h     | ✅ Concluído |
| S2-12 | Criar `LeadCard.tsx` e `LeadDetailModal.tsx`                                                             | PB-024, PB-025                                                                 | Bruna       | 3h     | ✅ Concluído |
| S2-13 | Criar `OpenNegotiationButton.tsx`                                                                        | PB-025, PB-027                                                                 | Bruna       | 2h     | ✅ Concluído |
| S2-14 | Criar página `ManagerLeads.tsx` e `AssignLeadModal.tsx`                                                  | PB-024, PB-025, PB-029                                                         | Bruna       | 4h     | ✅ Concluído |
| S2-15 | Criar `BulkAssignToolbar.tsx`                                                                            | PB-024, PB-029                                                                 | Bruna       | 3h     | ✅ Concluído |
| S2-16 | Criar `storesService.ts` e página `Stores.tsx`                                                           | PB-022                                                                         | Pedro       | 3h     | ✅ Concluído |
| S2-17 | Criar componentes `StoreCard.tsx` e `StoreFormModal.tsx`                                                 | PB-022                                                                         | Pedro       | 2h     | ✅ Concluído |
| S2-18 | Criar `teamsService.ts` e página `Teams.tsx`                                                             | PB-022                                                                         | Pedro       | 3h     | ✅ Concluído |
| S2-19 | Criar componentes `TeamCard.tsx` e `TeamFormModal.tsx`                                                   | PB-022                                                                         | Pedro       | 2h     | ✅ Concluído |
| S2-20 | Criar página `GeneralManagerLeads.tsx` e `BulkAssignTeamToolbar.tsx`                                     | PB-024, PB-030                                                                 | Pedro       | 4h     | ✅ Concluído |
| S2-21 | Criar `usersService.ts` e refatorar `Users.tsx`                                                          | PB-021                                                                         | Ryan        | 3h     | ✅ Concluído |
| S2-22 | Criar `UserTable.tsx` e `UserFilterBar.tsx`                                                              | PB-021                                                                         | Ryan        | 3h     | ✅ Concluído |
| S2-23 | Criar `UserFormModal.tsx`                                                                                | PB-021                                                                         | Ryan        | 2h     | ✅ Concluído |
| S2-24 | Criar `customersService.ts` e página `Customers.tsx`                                                     | PB-023                                                                         | Ryan        | 4h     | ✅ Concluído |
| S2-25 | Criar `CustomerDetailModal.tsx`                                                                          | PB-023, PB-025                                                                 | Ryan        | 2h     | ✅ Concluído |
| S2-26 | Criar rotas de dashboards por role (`DashboardAttendant`, `DashboardManager`, `DashboardGeneralManager`) | PB-028, PB-029, PB-030                                                         | Bruno       | 4h     | ✅ Concluído |
| S2-27 | Desenvolver middleware de permissão de acesso (RBAC) no backend e frontend                               | PB-019, PB-020                                                                 | Bruno       | 3h     | ✅ Concluído |
| S2-28 | Ajustar rotas de autenticação: login                                                                     | PB-017                                                                         | Bruno       | 2h     | ✅ Concluído |
| S2-29 | Criar/atualizar `AuthContext.tsx`, aplicar nas rotas protegidas e ajustar `apiFetch`                     | PB-017, PB-019, PB-020                                                         | Bruno       | 4h     | ✅ Concluído |
| S2-30 | Indexar links na sidebar e garantir navegação correta entre todas as páginas                             | PB-020, PB-021, PB-022, PB-023, PB-024, PB-027, PB-028, PB-029, PB-030, PB-032 | Bruno       | 3h     | ✅ Concluído |

---

## 📝 Detalhamento das Tasks

### 👤 Nicolas — Funil de Vendas (Kanban)

| ID    | Task                                             | História(s) Relacionada(s) | Descrição                                                                                                                                    |
| ----- | ------------------------------------------------ | -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| S2-01 | Criar `negotiationsService.ts`                   | PB-027                     | Implementar funções para listar negociações, buscar detalhes, mover etapa e consultar históricos de status e importância, usando `apiFetch`. |
| S2-02 | Criar página `Funil.tsx`                         | PB-027                     | Criar a página principal do funil, responsável por buscar as negociações e organizar os dados por etapa para alimentar o Kanban.             |
| S2-03 | Criar componentes `KanbanBoard` e `KanbanColumn` | PB-027                     | Criar o board geral do Kanban com colunas dinâmicas representando cada etapa da negociação.                                                  |
| S2-04 | Criar componente `NegotiationCard`               | PB-027                     | Criar o card individual exibido em cada coluna, apresentando informações resumidas da negociação.                                            |
| S2-05 | Criar componente `NegotiationDetailModal`        | PB-025, PB-027             | Criar o modal de detalhes da negociação, exibindo informações complementares e histórico relacionado ao funil.                               |

---

### 👤 Suelen — Login e Perfil do Usuário

| ID    | Task                                             | História(s) Relacionada(s) | Descrição                                                                                                      |
| ----- | ------------------------------------------------ | -------------------------- | -------------------------------------------------------------------------------------------------------------- |
| S2-06 | Refatorar visual da página `Login.tsx`           | PB-017                     | Redesenhar a tela de login com Tailwind CSS, identidade visual do sistema e layout responsivo.                 |
| S2-07 | Criar componente `LoginForm.tsx`                 | PB-017                     | Criar formulário de e-mail e senha com validação básica, feedback visual e chamada ao serviço de autenticação. |
| S2-08 | Criar `authService.ts`                           | PB-017                     | Criar service responsável pela comunicação com a rota de autenticação e login.                                 |
| S2-09 | Criar página `Profile.tsx` e `profileService.ts` | PB-032                     | Criar página e service para exibição dos dados do usuário autenticado.                                         |
| S2-10 | Criar componente `EditProfileModal.tsx`          | PB-032                     | Criar modal para edição de informações do perfil e alteração de senha.                                         |

---

### 👤 Bruna — Leads e Atribuição pelo Gerente de Equipe

| ID    | Task                                                    | História(s) Relacionada(s) | Descrição                                                                                                  |
| ----- | ------------------------------------------------------- | -------------------------- | ---------------------------------------------------------------------------------------------------------- |
| S2-11 | Criar `leadsService.ts` e refatorar `Leads.tsx`         | PB-024                     | Criar service para listagem e filtragem de leads e refatorar a página de leads.                            |
| S2-12 | Criar `LeadCard.tsx` e `LeadDetailModal.tsx`            | PB-024, PB-025             | Criar card clicável e modal de detalhes com dados do lead, cliente, origem, status e veículo de interesse. |
| S2-13 | Criar `OpenNegotiationButton.tsx`                       | PB-025, PB-027             | Criar botão para abertura de negociação a partir de um lead.                                               |
| S2-14 | Criar página `ManagerLeads.tsx` e `AssignLeadModal.tsx` | PB-024, PB-025, PB-029     | Criar tela do gerente para visualização de leads da equipe e atribuição a atendentes.                      |
| S2-15 | Criar `BulkAssignToolbar.tsx`                           | PB-024, PB-029             | Criar barra de ações para atribuição em lote de leads selecionados.                                        |

---

### 👤 Pedro — Lojas, Equipes e Atribuição pelo Gerente Geral

| ID    | Task                                                                 | História(s) Relacionada(s) | Descrição                                                                                             |
| ----- | -------------------------------------------------------------------- | -------------------------- | ----------------------------------------------------------------------------------------------------- |
| S2-16 | Criar `storesService.ts` e página `Stores.tsx`                       | PB-022                     | Criar service e página para gerenciamento de lojas.                                                   |
| S2-17 | Criar componentes `StoreCard.tsx` e `StoreFormModal.tsx`             | PB-022                     | Criar componentes para exibição, criação e edição de lojas.                                           |
| S2-18 | Criar `teamsService.ts` e página `Teams.tsx`                         | PB-022                     | Criar service e página para gerenciamento de equipes.                                                 |
| S2-19 | Criar componentes `TeamCard.tsx` e `TeamFormModal.tsx`               | PB-022                     | Criar componentes para exibição, criação e edição de equipes.                                         |
| S2-20 | Criar página `GeneralManagerLeads.tsx` e `BulkAssignTeamToolbar.tsx` | PB-024, PB-030             | Criar tela do gerente geral para visualização de leads e atribuição individual ou em lote por equipe. |

---

### 👤 Ryan — Usuários e Clientes

| ID    | Task                                                 | História(s) Relacionada(s) | Descrição                                                                        |
| ----- | ---------------------------------------------------- | -------------------------- | -------------------------------------------------------------------------------- |
| S2-21 | Criar `usersService.ts` e refatorar `Users.tsx`      | PB-021                     | Criar service de usuários e refatorar a página de listagem, filtros e paginação. |
| S2-22 | Criar `UserTable.tsx` e `UserFilterBar.tsx`          | PB-021                     | Criar tabela de usuários e barra de filtros por perfil, equipe, loja e status.   |
| S2-23 | Criar `UserFormModal.tsx`                            | PB-021                     | Criar modal para cadastro e edição de usuários.                                  |
| S2-24 | Criar `customersService.ts` e página `Customers.tsx` | PB-023                     | Criar service e página de clientes com listagem e busca por nome, CPF ou e-mail. |
| S2-25 | Criar `CustomerDetailModal.tsx`                      | PB-023, PB-025             | Criar modal de detalhes do cliente com dados cadastrais e leads associados.      |

---

### 👤 Bruno — Autenticação, RBAC, Dashboards e Navegação

| ID    | Task                                                                                 | História(s) Relacionada(s)                                                     | Descrição                                                                                                 |
| ----- | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------- |
| S2-26 | Criar rotas de dashboards por role                                                   | PB-028, PB-029, PB-030                                                         | Criar dashboards específicos para Atendente, Gerente e Gerente Geral.                                     |
| S2-27 | Desenvolver middleware de permissão de acesso (RBAC) no backend e frontend           | PB-019, PB-020                                                                 | Implementar controle de acesso no backend e lógica de proteção de rotas no frontend.                      |
| S2-28 | Ajustar rotas de autenticação                                                        | PB-017                                                                         | Integrar o fluxo de login com o backend.                                                                  |
| S2-29 | Criar/atualizar `AuthContext.tsx`, aplicar nas rotas protegidas e ajustar `apiFetch` | PB-017, PB-019, PB-020                                                         | Atualizar o contexto de autenticação, proteger rotas e padronizar chamadas à API.                         |
| S2-30 | Indexar links na sidebar e garantir navegação correta entre todas as páginas         | PB-020, PB-021, PB-022, PB-023, PB-024, PB-027, PB-028, PB-029, PB-030, PB-032 | Registrar os links das páginas criadas na sidebar e garantir navegação correta entre as áreas do sistema. |

---

## 🔗 Relação com Product Backlog

| História | Descrição resumida                                      | Tasks relacionadas                              |
| -------- | ------------------------------------------------------- | ----------------------------------------------- |
| PB-017   | Autenticação com e-mail e senha via frontend            | S2-06, S2-07, S2-08, S2-28, S2-29               |
| PB-019   | Proteção de rotas por role (RBAC)                       | S2-27, S2-29                                    |
| PB-020   | Layout principal com sidebar, header e rotas protegidas | S2-27, S2-29, S2-30                             |
| PB-021   | Gerenciamento de usuários no frontend                   | S2-21, S2-22, S2-23, S2-30                      |
| PB-022   | Gerenciamento de equipes e lojas no frontend            | S2-16, S2-17, S2-18, S2-19, S2-30               |
| PB-023   | Cadastro, busca e visualização de clientes              | S2-24, S2-25, S2-30                             |
| PB-024   | Lista de leads com filtros e busca                      | S2-11, S2-12, S2-14, S2-15, S2-20, S2-30        |
| PB-025   | Detalhe de lead com histórico e ações                   | S2-05, S2-12, S2-13, S2-14, S2-25               |
| PB-027   | Funil/Kanban de negociações                             | S2-01, S2-02, S2-03, S2-04, S2-05, S2-13, S2-30 |
| PB-028   | Dashboard do Atendente                                  | S2-26, S2-30                                    |
| PB-029   | Dashboard do Gerente                                    | S2-14, S2-15, S2-26, S2-30                      |
| PB-030   | Dashboard do Gerente Geral/Admin                        | S2-20, S2-26, S2-30                             |
| PB-032   | Perfil do usuário                                       | S2-09, S2-10, S2-30                             |


---

## 👤 Distribuição por Membro

| Membro    | Papel    | Tasks        | Horas |
| --------- | -------- | ------------ | ----- |
| Nicolas   | SM / Dev | 5            | 11h   |
| Suelen    | Dev      | 5            | 13h   |
| Bruna     | Dev      | 5            | 15h   |
| Pedro     | Dev      | 5            | 14h   |
| Ryan      | Dev      | 5            | 14h   |
| Bruno     | PO / Dev | 5            | 16h   |
| **Total** |          | **30 tasks** | **83h** |

---

## ✅ Entregáveis

* Funil de vendas em Kanban
* Service de negociações integrado ao frontend
* Modal de detalhes de negociação
* Tela de login refatorada
* Formulário de login e service de autenticação
* Autenticação integrada ao frontend
* Página de perfil do usuário
* Modal de edição de perfil
* Módulo de leads com listagem, detalhes e atribuição
* Módulo de lojas
* Módulo de equipes
* Módulo de usuários
* Módulo de clientes
* Dashboards por role: Atendente, Gerente e Gerente Geral
* Middleware RBAC no backend e frontend
* `AuthContext.tsx` atualizado
* `apiFetch` ajustado
* Sidebar com navegação entre as páginas da sprint

---

## 📎 Observações gerais

* Cada task deve ser desenvolvida em uma branch própria no padrão `feat/nome-da-task`
* Abrir Pull Request ao concluir para revisão do time
* Todos devem usar **Tailwind CSS**
* As telas devem consumir dados por meio dos services e do `apiFetch`
* A navegação deve respeitar o perfil do usuário autenticado
* Dúvidas sobre endpoints devem ser verificadas no backend e alinhadas com o Product Owner

---

## 📊 Revisão da Sprint

Durante a Sprint Review, foram apresentadas as funcionalidades desenvolvidas ao longo da Sprint 2, com foco nas primeiras telas funcionais do frontend, autenticação, controle de acesso por perfil, funil de vendas, módulos de gestão e integração inicial entre frontend e backend.

As funcionalidades principais foram consideradas bem encaminhadas, com uma estrutura geral organizada e uma proposta de sistema com bom potencial de crescimento. O feedback recebido destacou que o projeto possui uma base sólida, mas que a experiência visual, a organização das informações e a clareza dos fluxos devem receber atenção especial na próxima sprint.

### Pontos positivos observados

* Estrutura do sistema considerada organizada.
* Projeto com boa proposta e potencial de evolução.
* Funcionalidades principais bem encaminhadas.
* Entrega funcional realizada dentro do período da sprint.
* Divisão de responsabilidades permitindo avanço paralelo entre os membros da equipe.

### Melhorias sugeridas pelo cliente/stakeholders

#### Tela do Atendente

* Organizar os leads em colunas bem definidas para facilitar a visualização.
* Destacar os detalhes do lead de forma mais clara e acessível.
* Aplicar cores diferentes para identificar status, prioridade ou loja.
* Adicionar uma barra de pesquisa no dashboard do atendente para localizar leads rapidamente.
* Melhorar os filtros, tornando-os visíveis e intuitivos.
* Aplicar filtros apenas quando o usuário clicar em “Buscar” ou “Aplicar”.
* Manter os filtros refletidos na URL para facilitar compartilhamento, navegação e retorno ao estado anterior da tela.

#### Funil de Leads

* Ajustar o funil para deixar mais claro que o foco principal é em leads.
* Aplicar uma cor específica para cada loja, facilitando a identificação visual.
* Melhorar a organização visual das etapas do funil.

#### Tela do Gerente

* Criar um dashboard mais visual e estratégico.
* Adicionar campos de preenchimento e validação para garantir dados corretos.
* Exibir métricas importantes, como média de sucesso, quantidade de leads e status dos atendimentos.
* Avaliar como melhoria futura o tempo médio de atendimento por consultor e o desempenho individual dos consultores.

#### Regras e Visualização

* Garantir que cada consultor visualize somente suas próprias informações.
* Melhorar a identidade visual do sistema, com atenção especial à paleta de cores, contraste, organização das colunas e clareza das informações.

---

## 🔁 Retrospectiva

### O que funcionou bem?

* As tasks planejadas foram desenvolvidas e entregues dentro do período da sprint.
* A divisão de responsabilidades permitiu avanço paralelo em diferentes módulos.
* A equipe conseguiu evoluir tanto frontend quanto backend.
* A base funcional criada na Sprint 2 permitiu direcionar com mais clareza os ajustes da Sprint 3.
* O feedback da Sprint Review ajudou a evidenciar que o sistema possui uma boa base funcional e potencial de crescimento.
* A equipe conseguiu entregar as funcionalidades principais, mesmo com pontos de melhoria visual e organizacional a serem refinados.
* O time identificou que estrutura visual e organização são pontos fundamentais para elevar a qualidade percebida do projeto.
* A comparação com outros projetos apresentados reforçou a importância de fazer o básico bem feito, com identidade visual, filtros claros, cores bem aplicadas e boa estilização.

### O que pode melhorar?

* Atualizar os artefatos Scrum durante a execução da sprint.
* Registrar com mais clareza o andamento das tasks e evidências de entrega.
* Manter os READMEs sincronizados com o estado real do projeto.
* Revisar links internos e instruções de execução antes da entrega.
* Garantir que a documentação técnica acompanhe as alterações realizadas no código.
* Dar maior atenção à organização visual das telas, principalmente na disposição de colunas, filtros, cores e informações.
* Melhorar a clareza dos dashboards para que as métricas fiquem mais visíveis e estratégicas.
* Padronizar melhor a identidade visual do sistema, com paleta de cores, contraste e hierarquia de informações.
* Validar melhor a experiência do usuário nas telas de leads, funil e gerência.
* Alinhar melhor pequenas decisões de interface e usabilidade entre os membros da equipe.
* Reforçar o uso de filtros e diferenciação visual por cores, principalmente em telas com grande volume de dados.

### Ações para a próxima sprint

* Atualizar a documentação local da Sprint 2 e Sprint 3.
* Revisar o README principal e corrigir links internos.
* Atualizar a documentação técnica do frontend e backend.
* Revisar a documentação da API conforme as rotas reais do projeto.
* Revisar os scripts Docker e padronizar instruções de execução.
* Melhorar a rastreabilidade entre backlog, tasks implementadas e documentação.
* Reorganizar a tela do atendente com colunas mais claras para os leads.
* Destacar melhor os detalhes dos leads.
* Adicionar diferenciação visual por status, prioridade ou loja.
* Implementar ou melhorar a barra de pesquisa no dashboard do atendente.
* Tornar os filtros mais visíveis, intuitivos e acionados por botão de busca/aplicação.
* Refletir filtros na URL para facilitar navegação e compartilhamento.
* Ajustar o funil para comunicar melhor o foco em leads.
* Aplicar cores por loja no funil e nas listagens quando fizer sentido.
* Melhorar a organização visual das etapas do funil.
* Tornar o dashboard do gerente mais visual, estratégico e orientado por métricas.
* Exibir métricas como média de sucesso, quantidade de leads e status dos atendimentos.
* Avaliar métricas futuras como tempo médio de atendimento por consultor e desempenho individual.
* Garantir que cada consultor visualize apenas suas próprias informações.
* Reforçar a identidade visual do sistema com melhor paleta de cores, contraste, organização e clareza.
* Alinhar os ajustes visuais da Sprint 3 com o feedback recebido na Sprint Review.
* Priorizar uma experiência simples, clara e bem acabada, mantendo o foco em organização, filtros úteis e boa legibilidade.
