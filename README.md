# 🚗 Valle Leads System

Sistema de Gestão de Leads com Dashboard Analítico desenvolvido para a **1000 Valle Multimarcas**, uma revendedora de veículos com múltiplas unidades.

O sistema permite o registro e acompanhamento de leads captados por diferentes canais, gerenciamento de negociações, acompanhamento do funil de vendas e visualização de indicadores de desempenho por meio de dashboards operacionais e analíticos.

> Projeto acadêmico desenvolvido na **FATEC Jacareí** — ABP 2026-1 | 3º DSM
> Parceiro: 1000 Valle Multimarcas | Focal Point: Prof. Arley Ferreira de Souza

---

## 📌 Sobre o Projeto

A 1000 Valle Multimarcas necessita de um sistema que centralize a gestão de leads, permita o acompanhamento do funil de vendas e forneça indicadores gerenciais consolidados para diferentes perfis de usuário.

O sistema contempla:

* Controle de acesso hierárquico por perfil: Atendente, Gerente, Gerente Geral e Administrador
* Gestão de usuários, clientes, leads, lojas, equipes e negociações
* Funil de vendas com acompanhamento de negociações
* Dashboards operacionais e analíticos
* Estrutura prevista para registro de logs/auditoria
* Modelagem relacional com aplicação de regras de negócio
* Execução conteinerizada com Docker e Docker Compose

---

## 🛠 Tecnologias

| Camada                        | Tecnologia                     |
| ----------------------------- | ------------------------------ |
| Frontend                      | React + TypeScript + Vite      |
| Estilização                   | Tailwind CSS                   |
| Backend                       | Node.js + TypeScript + Express |
| Banco de Dados                | PostgreSQL                     |
| ORM                           | Prisma                         |
| Containerização               | Docker + Docker Compose        |
| Servidor Frontend em Produção | Nginx                          |

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

## 🔄 Metodologia Ágil (Scrum)

O projeto é desenvolvido em **3 sprints**, seguindo os princípios do Scrum com papéis definidos, backlog priorizado, entregas incrementais, registro de revisão e retrospectiva.

### Cronograma

| Sprint             | Período                 | Foco Principal                                                                                                                             |
| ------------------ | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Sprint 1           | 24/03/2026 → 14/04/2026 | Documentação, elicitação, scaffolding do backend e módulos iniciais                                                                        |
| Sprint 2           | 15/04/2026 → 21/05/2026 | Autenticação, RBAC, primeiras telas do frontend, funil, leads, usuários, clientes, lojas, equipes e dashboards iniciais                    |
| Sprint 3           | 22/05/2026 → 11/06/2026 | Remoção de mocks, integração com dados reais, refinamento visual, documentação técnica, Docker, logs e refatoração de dashboard/negociação |
| Apresentação Final | Semana de 22/07/2026    | Apresentação e consolidação da entrega                                                                                                     |

---

## 🏃 Sprints

### [Sprint 1 — 24/03 a 14/04/2026](./docs/sprint-1/README.md)

Primeira entrega incremental do projeto. Foco em documentação, elicitação de requisitos, scaffolding do backend, implementação dos módulos iniciais e prototipação das telas.

### [Sprint 2 — 15/04 a 21/05/2026](./docs/sprint-2/README.md)

Segunda entrega incremental. Foco em autenticação, controle de acesso por role (RBAC), primeiras telas funcionais do frontend, funil de vendas, leads, usuários, clientes, lojas, equipes e dashboards por perfil.

### [Sprint 3 — 22/05 a 11/06/2026](./docs/sprint-3/README.md)

Entrega final do ciclo de desenvolvimento. Foco em remover dados mockados, integrar dados reais do banco, refinar UI/UX, atualizar documentação técnica, revisar Docker e consolidar a entrega final.

---

## ✅ Requisitos Funcionais

| ID   | Descrição                                           |
| ---- | --------------------------------------------------- |
| RF01 | Autenticação de usuários via e-mail e senha com JWT |
| RF02 | Controle de acesso baseado em papéis (RBAC)         |
| RF03 | Gestão de negociações vinculadas a leads            |
| RF04 | Dashboard Operacional                               |
| RF05 | Dashboard Analítico                                 |
| RF06 | Filtros temporais                                   |
| RF07 | Logs de acesso e operações                          |

> Observação: o projeto possui estrutura prevista para logs/auditoria. A documentação técnica do backend indica o estado atual das rotas e funcionalidades implementadas.

---

## 🔧 Requisitos Não Funcionais

| ID    | Descrição                                                                        |
| ----- | -------------------------------------------------------------------------------- |
| RNF01 | Arquitetura em camadas com API REST                                              |
| RNF02 | Segurança com bcrypt, JWT e validação no backend                                 |
| RNF03 | Consultas analíticas otimizadas                                                  |
| RNF04 | Interface responsiva e navegação intuitiva                                       |
| RNF05 | Integridade referencial e consistência transacional                              |
| RNF06 | Documentação completa: README, endpoints, artefatos Scrum e documentação técnica |
| RNF07 | Conteinerização com Docker e Docker Compose                                      |
| RNF08 | Metodologia ágil com Scrum                                                       |
| RNF09 | Versionamento com Git e repositório público no GitHub                            |
| RNF10 | Uso explícito de padrões de projeto                                              |
| RNF11 | Adoção de padrão arquitetural reconhecido                                        |
| RNF12 | Organização em camadas                                                           |
| RNF13 | Separação de responsabilidades                                                   |

---

## 🚀 Como Rodar com Docker

O projeto possui três modos principais de execução:

| Modo            | Arquivo                    | Banco usado                                | Indicação                                         |
| --------------- | -------------------------- | ------------------------------------------ | ------------------------------------------------- |
| Produção/local  | `docker-compose.yml`       | PostgreSQL local em container Docker       | Demonstração, entrega local e validação integrada |
| Desenvolvimento | `docker-compose.dev.yml`   | PostgreSQL local em container Docker       | Desenvolvimento com hot reload                    |
| Cloud           | `docker-compose.cloud.yml` | PostgreSQL hospedado em nuvem, como Render | Teste com banco remoto/compartilhado              |

---

### Execução principal com banco local

```bash
git clone https://github.com/Helloworld-fatec/valle-leads-system.git
cd valle-leads-system

cp .env.example .env

docker compose config
docker compose up -d --build
```

Acesse:

| Serviço  | URL                       |
| -------- | ------------------------- |
| Frontend | http://localhost          |
| Backend  | http://localhost:3000     |
| API      | http://localhost:3000/api |

---

### Execução em modo desenvolvimento com banco local

```bash
docker compose -f docker-compose.dev.yml config
docker compose -f docker-compose.dev.yml up -d --build
```

Acesse:

| Serviço      | URL                       |
| ------------ | ------------------------- |
| Frontend Dev | http://localhost:5173     |
| Backend      | http://localhost:3000     |
| API          | http://localhost:3000/api |

---

### Execução com banco em nuvem

Para usar um banco hospedado no Render ou em outro provedor, crie um arquivo `.env.cloud` na raiz do projeto:

```bash
cp .env.example .env.cloud
```

Edite o `.env.cloud` e substitua a `DATABASE_URL` pela URL externa do banco em nuvem:

```env
DATABASE_URL=postgresql://USUARIO:SENHA@HOST/NOME_DO_BANCO?sslmode=require
```

Depois execute:

```bash
docker compose -f docker-compose.cloud.yml config
docker compose -f docker-compose.cloud.yml up -d --build
```

Acesse:

| Serviço  | URL                       |
| -------- | ------------------------- |
| Frontend | http://localhost          |
| Backend  | http://localhost:3000     |
| API      | http://localhost:3000/api |

Para mais detalhes, consulte:

[HOWTORUN.md](./HOWTORUN.md)

---

## 🐳 Docker e Infraestrutura

A infraestrutura Docker foi organizada para cobrir execução com banco local e banco remoto.

| Arquivo                    | Finalidade                                                                       |
| -------------------------- | -------------------------------------------------------------------------------- |
| `docker-compose.yml`       | Sobe frontend, backend e PostgreSQL local em modo produção/local                 |
| `docker-compose.dev.yml`   | Sobe frontend, backend e PostgreSQL local em modo desenvolvimento com hot reload |
| `docker-compose.cloud.yml` | Sobe frontend e backend usando banco PostgreSQL em nuvem, como Render            |
| `server/Dockerfile`        | Build e execução do backend                                                      |
| `client/Dockerfile`        | Build do frontend e execução via Nginx                                           |
| `client/nginx.conf`        | Configuração do Nginx e proxy para `/api`                                        |
| `.env.example`             | Modelo de variáveis de ambiente para execução local                              |
| `server/.dockerignore`     | Arquivos ignorados no build do backend                                           |
| `client/.dockerignore`     | Arquivos ignorados no build do frontend                                          |
| `HOWTORUN.md`              | Guia completo de execução                                                        |

### Validações recomendadas

```bash
docker compose config
docker compose up -d --build
docker compose ps
```

Para logs:

```bash
docker compose logs server
docker compose logs client
docker compose logs db
```

---

## 📚 Documentação

| Recurso                  | Link                                                 |
| ------------------------ | ---------------------------------------------------- |
| Guia de execução         | [HOWTORUN.md](./HOWTORUN.md)                         |
| Documentação do Backend  | [server/README.md](./server/README.md)               |
| Documentação do Frontend | [client/README.md](./client/README.md)               |
| Documentação da Sprint 1 | [docs/sprint-1/README.md](./docs/sprint-1/README.md) |
| Documentação da Sprint 2 | [docs/sprint-2/README.md](./docs/sprint-2/README.md) |
| Documentação da Sprint 3 | [docs/sprint-3/README.md](./docs/sprint-3/README.md) |
| Product Backlog          | [docs/PRODUCT_BACKLOG.md](./docs/PRODUCT_BACKLOG.md) |

---

## 🌿 Versionamento e Git

O projeto segue um fluxo baseado em branches e Pull Requests.

| Branch       | Uso                                         |
| ------------ | ------------------------------------------- |
| `main`       | Código estável e pronto para entrega        |
| `develop`    | Integração das entregas da sprint           |
| `feat/*`     | Desenvolvimento de funcionalidades          |
| `fix/*`      | Correções                                   |
| `refactor/*` | Refatorações                                |
| `docs/*`     | Documentação                                |
| `chore/*`    | Configuração, dependências e infraestrutura |

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

## 📝 Observações de Segurança

* Nunca commite arquivos `.env` reais.
* O arquivo `.env.example` deve conter apenas placeholders.
* Arquivos como `.env.cloud`, `.env.render` e `.env.local-db` devem permanecer locais.
* Se uma `DATABASE_URL` real ou segredo JWT for exposto em log, chat, commit ou PR, as credenciais devem ser rotacionadas.
* O frontend não deve ser considerado a única camada de segurança; permissões devem ser validadas no backend.

---

<div align="center">

ABP 2026-1 · 3DSM · FATEC Jacareí
Parceiro: 1000 Valle Multimarcas
Focal Point: Prof. Arley Ferreira de Souza

</div>
