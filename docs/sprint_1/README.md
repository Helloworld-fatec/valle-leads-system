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

| ID | Tarefa | Responsável | Horas | Status |
|----|--------|-------------|-------|--------|
| S1-01 | Scaffolding do backend (estrutura de pastas, dependências, tsconfig) | Ryan | 6h | ✅ Concluído |
| S1-02 | Schema Prisma completo (todas as tabelas, relações, índices) | Ryan | 8h | ✅ Concluído |
| S1-03 | DTO de Negotiations com Zod | Ryan | 2h | ✅ Concluído |
| S1-04 | NegotiationsRepository | Ryan | 3h | ✅ Concluído |
| S1-05 | NegotiationsService | Ryan | 4h | ✅ Concluído |
| S1-06 | NegotiationsController | Ryan | 2h | ✅ Concluído |
| S1-07 | Rotas de Negotiations | Ryan | 2h | ✅ Concluído |
| S1-08 | Repositório GitHub (branches, colaboradores) | Nicolas | 2h | ✅ Concluído |
| S1-09 | README principal na raiz | Nicolas | 3h | ✅ Concluído |
| S1-10 | Board de gerenciamento de tasks | Nicolas | 2h | ✅ Concluído |
| S1-11 | Diagrama de Casos de Uso UML | Nicolas | 5h | ✅ Concluído |
| S1-12 | Tabela de Regras de Negócio (mín. 20 RNs) | Nicolas | 6h | ✅ Concluído |
| S1-13 | DTO de NegotiationStageHistory e Importance com Zod | Nicolas | 2h | ✅ Concluído |
| S1-14 | NegotiationStageHistoryRepository | Nicolas | 2h | ✅ Concluído |
| S1-15 | NegotiationStageHistoryService | Nicolas | 3h | ✅ Concluído |
| S1-16 | NegotiationStageHistoryController | Nicolas | 2h | ✅ Concluído |
| S1-17 | Rotas de StageHistory aninhadas em Negotiations | Nicolas | 1h | ✅ Concluído |
| S1-18 | README `/server` completo | Bruna | 8h | ✅ Concluído |
| S1-19 | Arquivo `.env.example` | Bruna | 1h | ✅ Concluído |
| S1-20 | DTO de Leads e Customers com Zod | Bruna | 2h | ✅ Concluído |
| S1-21 | LeadsRepository e CustomersRepository | Bruna | 3h | ✅ Concluído |
| S1-22 | LeadsService e CustomersService | Bruna | 4h | ✅ Concluído |
| S1-23 | LeadsController e CustomersController | Bruna | 2h | ✅ Concluído |
| S1-24 | Rotas de Leads e Customers | Bruna | 2h | ✅ Concluído |
| S1-25 | README `/client` completo (telas T01–T21) | Suelen | 8h | ✅ Concluído |
| S1-26 | DTO de Users com Zod | Suelen | 2h | ✅ Concluído |
| S1-27 | UsersRepository | Suelen | 3h | ✅ Concluído |
| S1-28 | UsersService | Suelen | 4h | ✅ Concluído |
| S1-29 | UsersController | Suelen | 2h | ✅ Concluído |
| S1-30 | Rotas de Users | Suelen | 2h | ✅ Concluído |
| S1-31 | Product Backlog (histórias MoSCoW) | Bruno | 6h | ✅ Concluído |
| S1-32 | Sprint 1 Backlog no board | Bruno | 2h | ✅ Concluído |
| S1-33 | Material de apoio para reunião de arquitetura | Bruno | 3h | ✅ Concluído |
| S1-34 | DTO de Auth com Zod | Bruno | 2h | ✅ Concluído |
| S1-35 | AuthRepository | Bruno | 2h | ✅ Concluído |
| S1-36 | AuthService | Bruno | 4h | ✅ Concluído |
| S1-37 | AuthController | Bruno | 2h | ✅ Concluído |
| S1-38 | Rotas de Auth | Bruno | 2h | ✅ Concluído |
| S1-39 | Especificação do Dashboard do Atendente | Pedro | 4h | ✅ Concluído |
| S1-40 | Especificação do Dashboard do Gerente | Pedro | 4h | ✅ Concluído |
| S1-41 | Especificação do Dashboard do Gerente Geral/Admin | Pedro | 4h | ✅ Concluído |
| S1-42 | DTO de Teams e Stores com Zod | Pedro | 2h | ✅ Concluído |
| S1-43 | TeamsRepository e StoresRepository | Pedro | 3h | ✅ Concluído |
| S1-44 | TeamsService e StoresService | Pedro | 3h | ✅ Concluído |
| S1-45 | TeamsController e StoresController | Pedro | 2h | ✅ Concluído |
| S1-46 | Rotas de Teams e Stores | Pedro | 2h | ✅ Concluído |

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

> _Resumo da Sprint Review: o que foi demonstrado, feedbacks recebidos do PO e stakeholders._

---

## 🔁 Retrospectiva

### O que funcionou bem?

-

### O que pode melhorar?

-

### Ações para a próxima sprint

-