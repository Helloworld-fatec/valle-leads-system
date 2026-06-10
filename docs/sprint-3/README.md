# 🏃 Sprint 3 — 22/05 a 11/06/2026

**Foco:** Refatoração, substituição de dados mockados por dados reais, refinamento de UI/UX, revisão da documentação, ajustes de infraestrutura e consolidação da entrega final.

---

## 📌 Objetivo da Sprint

Consolidar a entrega final do **Valle Leads System**, removendo dados mockados das principais páginas, integrando as telas com dados reais do banco, refinando a interface visual do sistema e revisando a documentação técnica e os artefatos Scrum.

A Sprint 3 também contempla melhorias levantadas na Sprint Review da Sprint 2, especialmente em relação à organização visual das telas, clareza dos filtros, uso de cores para diferenciação de informações, melhoria dos dashboards e padronização da experiência do usuário.

---

## ✅ Definition of Done

Uma task é considerada **Concluída** quando:

* Entregável commitado no repositório na branch `feat/nome-da-task` ou `docs/nome-da-task`
* Pull Request aberto para revisão do time
* Dados mockados removidos das páginas previstas na sprint
* Integração com dados reais do banco validada
* Componentes implementados ou ajustados com **Tailwind CSS**
* Interface seguindo o padrão visual definido pelo projeto
* Funcionalidade testada localmente
* Nenhum erro crítico de tipagem, nomenclatura ou estrutura
* README ou documentação técnica atualizada quando a task impactar a documentação
* Ajustes revisados antes da entrega final

---

## 📋 Sprint Backlog

| ID    | Tarefa                                                                         | História(s) Relacionada(s)     | Responsável | Horas | Status     |
| ----- | ------------------------------------------------------------------------------ | ------------------------------ | ----------- | ----- | ---------- |
| S3-01 | Remover dados mockados da listagem de usuários                                 | PB-021                         | Ryan        | -     | 🔲 A fazer |
| S3-02 | Integrar tabela/lista de usuários com dados reais do banco                     | PB-021                         | Ryan        | -     | 🔲 A fazer |
| S3-03 | Refatorar e melhorar a estilização da página de usuários                       | PB-021                         | Ryan        | -     | 🔲 A fazer |
| S3-04 | Ajustar lógica e layout dos indicadores/KPIs da página de usuários             | PB-021, PB-030                 | Ryan        | -     | 🔲 A fazer |
| S3-05 | Remover informações mockadas do perfil do usuário                              | PB-032                         | Pedro       | -     | 🔲 A fazer |
| S3-06 | Validar e renderizar dados reais vinculados à sessão/banco                     | PB-032, PB-017, PB-020         | Pedro       | -     | 🔲 A fazer |
| S3-07 | Melhorar interface e estilo geral da página de perfil                          | PB-032                         | Pedro       | -     | 🔲 A fazer |
| S3-08 | Refatorar listagem e exibição das informações dos leads                        | PB-024, PB-025                 | Bruna       | -     | 🔲 A fazer |
| S3-09 | Melhorar interface e experiência de usuário da página de leads                 | PB-024, PB-025                 | Bruna       | -     | 🔲 A fazer |
| S3-10 | Desenvolver e integrar o modal de “Criar Lead”                                 | PB-026                         | Bruna       | -     | 🔲 A fazer |
| S3-11 | Atualizar documentação dos ritos e artefatos Scrum                             | PB-009                         | Nicolas     | -     | 🔲 A fazer |
| S3-12 | Revisar e ajustar scripts Docker                                               | RNF07                          | Nicolas     | -     | 🔲 A fazer |
| S3-13 | Atualizar documentação técnica do Frontend                                     | PB-008                         | Nicolas     | -     | 🔲 A fazer |
| S3-14 | Atualizar documentação técnica do Backend                                      | PB-007                         | Nicolas     | -     | 🔲 A fazer |
| S3-15 | Ajustar estilo e layout das páginas do módulo de Gerência                      | PB-029, PB-030                 | Suelen      | -     | 🔲 A fazer |
| S3-16 | Verificar e validar a exibição correta das informações nas páginas de Gerência | PB-029, PB-030                 | Suelen      | -     | 🔲 A fazer |
| S3-17 | Realizar ajustes finos de estilo nas páginas entregues pelo time               | PB-021, PB-024, PB-025, PB-032 | Suelen      | -     | 🔲 A fazer |
| S3-18 | Refatorar Dashboard para gráficos refletirem dados reais                       | PB-028, PB-029, PB-030         | Bruno       | -     | 🔲 A fazer |
| S3-19 | Criar arquitetura e fluxo de Logs do sistema                                   | PB-031                         | Bruno       | -     | 🔲 A fazer |
| S3-20 | Refatorar página de Negociação, ajustando funil e listagem                     | PB-027                         | Bruno       | -     | 🔲 A fazer |

---

## 📝 Detalhamento das Tasks

### 👤 Ryan — Página de Usuários

| ID    | Task                                                               | História(s) Relacionada(s) | Descrição                                                                                              |
| ----- | ------------------------------------------------------------------ | -------------------------- | ------------------------------------------------------------------------------------------------------ |
| S3-01 | Remover dados mockados da listagem de usuários                     | PB-021                     | Substituir dados estáticos da página de usuários por dados provenientes da integração real do sistema. |
| S3-02 | Integrar tabela/lista de usuários com dados reais do banco         | PB-021                     | Conectar a listagem de usuários aos dados reais persistidos no banco, por meio do backend e Prisma.    |
| S3-03 | Refatorar e melhorar a estilização da página de usuários           | PB-021                     | Ajustar layout, hierarquia visual, responsividade e componentes da página de usuários.                 |
| S3-04 | Ajustar lógica e layout dos indicadores/KPIs da página de usuários | PB-021, PB-030             | Revisar os indicadores exibidos na página, garantindo consistência visual e dados coerentes.           |

---

### 👤 Pedro — Página de Perfil

| ID    | Task                                                       | História(s) Relacionada(s) | Descrição                                                                                     |
| ----- | ---------------------------------------------------------- | -------------------------- | --------------------------------------------------------------------------------------------- |
| S3-05 | Remover informações mockadas do perfil do usuário          | PB-032                     | Substituir informações estáticas do perfil por dados reais do usuário autenticado.            |
| S3-06 | Validar e renderizar dados reais vinculados à sessão/banco | PB-032, PB-017, PB-020     | Garantir que a página de perfil utilize os dados corretos da sessão e do banco.               |
| S3-07 | Melhorar interface e estilo geral da página de perfil      | PB-032                     | Refinar a experiência visual da página, com foco em clareza, organização e identidade visual. |

---

### 👤 Bruna — Página de Leads

| ID    | Task                                                           | História(s) Relacionada(s) | Descrição                                                                                                                 |
| ----- | -------------------------------------------------------------- | -------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| S3-08 | Refatorar listagem e exibição das informações dos leads        | PB-024, PB-025             | Melhorar a organização dos leads, a apresentação das informações e a clareza da listagem.                                 |
| S3-09 | Melhorar interface e experiência de usuário da página de leads | PB-024, PB-025             | Aplicar melhorias de UI/UX com foco em filtros, visualização, legibilidade e acesso aos detalhes do lead.                 |
| S3-10 | Desenvolver e integrar o modal de “Criar Lead”                 | PB-026                     | Criar modal para cadastro de novos leads, vinculando cliente, canal de captação, observações e demais campos necessários. |

---

### 👤 Nicolas — Documentação e Infraestrutura

| ID    | Task                                               | História(s) Relacionada(s) | Descrição                                                                                                        |
| ----- | -------------------------------------------------- | -------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| S3-11 | Atualizar documentação dos ritos e artefatos Scrum | PB-009                     | Atualizar documentação das sprints, revisão, retrospectiva, backlog, DoD e artefatos Scrum do projeto.           |
| S3-12 | Revisar e ajustar scripts Docker                   | RNF07                      | Revisar `docker-compose.yml`, Dockerfiles e instruções de execução por containers.                               |
| S3-13 | Atualizar documentação técnica do Frontend         | PB-008                     | Atualizar README e documentação técnica do frontend, refletindo telas, rotas, componentes e fluxos atuais.       |
| S3-14 | Atualizar documentação técnica do Backend          | PB-007                     | Atualizar README e documentação técnica do backend, refletindo módulos, rotas, variáveis de ambiente e execução. |

---

### 👤 Suelen — Gerência e Qualidade de UI

| ID    | Task                                                                           | História(s) Relacionada(s)     | Descrição                                                                                                                 |
| ----- | ------------------------------------------------------------------------------ | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| S3-15 | Ajustar estilo e layout das páginas do módulo de Gerência                      | PB-029, PB-030                 | Melhorar a aparência e organização das páginas utilizadas por gerente e gerente geral.                                    |
| S3-16 | Verificar e validar a exibição correta das informações nas páginas de Gerência | PB-029, PB-030                 | Conferir se as informações exibidas nas telas de gerência estão corretas e coerentes com o perfil do usuário.             |
| S3-17 | Realizar ajustes finos de estilo nas páginas entregues pelo time               | PB-021, PB-024, PB-025, PB-032 | Acompanhar entregas de usuários, perfil, leads e demais páginas, aplicando ajustes de UI para manter consistência visual. |

---

### 👤 Bruno — Dashboard, Logs e Negociação

| ID    | Task                                                       | História(s) Relacionada(s) | Descrição                                                                                                 |
| ----- | ---------------------------------------------------------- | -------------------------- | --------------------------------------------------------------------------------------------------------- |
| S3-18 | Refatorar Dashboard para gráficos refletirem dados reais   | PB-028, PB-029, PB-030     | Ajustar dashboards para apresentar indicadores e gráficos calculados a partir dos dados reais do sistema. |
| S3-19 | Criar arquitetura e fluxo de Logs do sistema               | PB-031                     | Estruturar fluxo de logs para registro e rastreamento de operações críticas do sistema.                   |
| S3-20 | Refatorar página de Negociação, ajustando funil e listagem | PB-027                     | Revisar a página de negociação, melhorando funil, listagem, organização das etapas e clareza visual.      |

---

## 🔗 Relação com Product Backlog

| História | Descrição resumida                                           | Tasks relacionadas                |
| -------- | ------------------------------------------------------------ | --------------------------------- |
| PB-007   | README do backend com rotas, módulos e variáveis de ambiente | S3-14                             |
| PB-008   | README do frontend com telas, rotas e fluxos de navegação    | S3-13                             |
| PB-009   | Product Backlog e Sprint Backlog documentados                | S3-11                             |
| PB-017   | Autenticação com e-mail e senha via frontend                 | S3-06                             |
| PB-020   | Layout principal com sidebar, header e rotas protegidas      | S3-06                             |
| PB-021   | Gerenciamento de usuários no frontend                        | S3-01, S3-02, S3-03, S3-04, S3-17 |
| PB-024   | Lista de leads com filtros e busca                           | S3-08, S3-09, S3-17               |
| PB-025   | Detalhe de lead com histórico e ações                        | S3-08, S3-09, S3-17               |
| PB-026   | Criação de novo lead vinculado a cliente                     | S3-10                             |
| PB-027   | Funil/Kanban de negociações                                  | S3-20                             |
| PB-028   | Dashboard do Atendente                                       | S3-18                             |
| PB-029   | Dashboard do Gerente                                         | S3-15, S3-16, S3-18               |
| PB-030   | Dashboard do Gerente Geral/Admin                             | S3-04, S3-15, S3-16, S3-18        |
| PB-031   | Logs de auditoria                                            | S3-19                             |
| PB-032   | Perfil do usuário                                            | S3-05, S3-06, S3-07, S3-17        |
| RNF07    | Conteinerização com Docker e Docker Compose                  | S3-12                             |

---

## 👤 Distribuição por Membro

| Membro    | Papel    | Tasks        | Horas |
| --------- | -------- | ------------ | ----- |
| Ryan      | Dev      | 4            | -     |
| Pedro     | Dev      | 3            | -     |
| Bruna     | Dev      | 3            | -     |
| Nicolas   | SM / Dev | 4            | -     |
| Suelen    | Dev      | 3            | -     |
| Bruno     | PO / Dev | 3            | -     |
| **Total** |          | **20 tasks** | -     |

---

## ✅ Entregáveis

* Página de usuários sem dados mockados
* Listagem de usuários integrada com dados reais do banco
* Indicadores/KPIs da página de usuários revisados
* Página de perfil com dados reais vinculados à sessão
* Interface da página de perfil refinada
* Página de leads com listagem e exibição de informações melhoradas
* Modal de criação de lead desenvolvido e integrado
* Documentação Scrum e artefatos atualizados
* Scripts Docker revisados e ajustados
* Documentação técnica do frontend atualizada
* Documentação técnica do backend atualizada
* Páginas de gerência com estilo, layout e informações validadas
* Ajustes finos de UI nas páginas entregues pelo time
* Dashboard refatorado com gráficos baseados em dados reais
* Arquitetura e fluxo de logs do sistema
* Página de negociação refatorada, com melhorias no funil e na listagem

---

## 📌 Regras da Sprint

1. **Zero Mocks:** nenhuma entrega deve permanecer com dados estáticos nas páginas previstas para refatoração.
2. **Consistência Visual:** todos os ajustes de estilo devem seguir o padrão visual do projeto.
3. **Revisão de UI:** as páginas devem passar por revisão visual para garantir organização, clareza e padronização.
4. **Dados Reais:** dashboards, listagens e indicadores devem refletir informações reais do banco sempre que aplicável.
5. **Documentação Atualizada:** alterações em funcionalidades, execução, frontend, backend ou Scrum devem ser refletidas na documentação correspondente.

---

## 📎 Observações gerais

* Cada task deve ser desenvolvida em uma branch própria.
* Abrir Pull Request ao concluir para revisão do time.
* Todos devem manter o padrão visual do projeto com **Tailwind CSS**.
* Nenhuma PR deve ser aprovada com dados mockados nas páginas previstas nesta sprint.
* Os ajustes visuais devem considerar o feedback recebido na Sprint Review da Sprint 2.
* As telas devem priorizar clareza, contraste, organização das colunas e boa leitura das informações.
* Sempre que houver filtros, eles devem ser visíveis, intuitivos e consistentes com o restante do sistema.
* A documentação deve refletir o estado real da implementação.

---

## 📊 Revisão da Sprint

> *Resumo da Sprint Review: o que foi demonstrado, feedbacks recebidos do PO e stakeholders.*

---

## 🔁 Retrospectiva

### O que funcionou bem?

*

### O que pode melhorar?

*

### Ações futuras

*
