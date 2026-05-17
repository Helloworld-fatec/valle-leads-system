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
| Bruna Rodrigues | Dev Team |
| Pedro Enrique | Dev Team |
| Ryan Tinel | Dev Team |
| Suelen Castro | Dev Team |

---

## 🔄 Metodologia Ágil (Scrum)

O projeto é desenvolvido em **3 sprints**, seguindo os princípios do Scrum com papéis definidos, backlog priorizado, entregas incrementais e registro de retrospectivas.

### Cronograma

| Sprint | Período | Foco Principal |
|---|---|---|
| Sprint 1 | 24/03/2026 → 14/04/2026 | Documentação, elicitação, scaffolding do backend e módulos iniciais |
| Sprint 2 | 15/04/2026 → 21/05/2026 | Autenticação, RBAC, fechamento das rotas e primeiras telas |
| Sprint 3 | 22/05/2026 → 11/06/2026 | Telas completas, funil de negociações e dashboards analíticos |
| Apresentação Final | Semana de 22/07/2026 | — |

---

## 🏃 Sprints

### [Sprint 1 — 24/03 a 14/04/2026](docs/sprint_1/README.md)
Primeira entrega incremental do projeto. Foco em documentação, elicitação de requisitos, scaffolding do backend e implementação dos módulos iniciais: Negotiations, StageHistory, Leads, Customers, Users, Auth, Teams e Stores.

### [Sprint 2 — 15/04 a 21/05/2026](./docs/sprint-2/README.md)
Segunda entrega incremental. Foco em autenticação, controle de acesso por role (RBAC), fechamento das rotas do backend e primeiras telas do frontend.

### [Sprint 3 — 22/05 a 11/06/2026](./docs/sprint-3/README.md)
Entrega final do ciclo de desenvolvimento. Foco nas telas completas, funil de negociações, dashboards analíticos e preparação para a apresentação final.

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

```bash
# clone o repositório
git clone https://github.com/Helloworld-fatec/valle-leads-system.git

# navegue até a pasta do projeto
cd valle-leads-system

# configure as variáveis de ambiente
cp server/.env.example server/.env
# edite o server/.env com suas configurações locais

# suba os containers
docker compose up -d

# rode as migrations
docker compose exec backend npx prisma migrate dev
```

O servidor estará disponível em `http://localhost:3000`.

---

## 📚 Documentação

| Recurso | Link |
|---|---|
| Documentação do Backend | [server/README.MD](./server/README.MD) |
| Documentação do Frontend | [client/README.md](./client/README.md) |
| Documentação da Sprint 1 | [docs/sprint-1/README.md](./docs/sprint-1/README.md) |
| Documentação da Sprint 2 | [docs/sprint-2/README.md](./docs/sprint-2/README.md) |
| Documentação da Sprint 3 | [docs/sprint-3/README.md](./docs/sprint-3/README.md) |
