# 🚗 Valle Leads System

Sistema de Gestão de Leads com Dashboard Analítico desenvolvido para a **1000 Valle Multimarcas**, uma revendedora de veículos com múltiplas unidades.

O sistema permite o registro e acompanhamento de leads captados por diferentes canais (visita presencial, telefone, WhatsApp, Instagram, formulários digitais), gerenciamento de negociações e visualização de indicadores de desempenho por meio de dashboards operacionais e analíticos.

> Projeto acadêmico desenvolvido na **FATEC Jacareí** — ABP 2026-1 | 3º DSM  
> Parceiro: 1000 Valle Multimarcas | Focal Point: Prof. Arley Ferreira de Souza

---

## 📑 Índice

- [Sobre o Projeto](#-sobre-o-projeto)
- [Tecnologias](#-tecnologias)
- [Equipe](#-equipe)
- [Metodologia Ágil (Scrum)](#-metodologia-ágil-scrum)
- [Requisitos Funcionais](#-requisitos-funcionais)
- [Requisitos Não Funcionais](#-requisitos-não-funcionais)
- [Como Rodar](#-como-rodar)
- [Documentação](#-documentação)

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

### 📋 Product Backlog

> Em construção — será preenchido ao longo do projeto.

---

### 🏃 Sprint 1 — 24/03 a 14/04/2026

> Em construção — será preenchido ao início da sprint.

---

### 🏃 Sprint 2 — 15/04 a 21/05/2026

> A definir.

---

### 🏃 Sprint 3 — 22/05 a 11/06/2026

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
