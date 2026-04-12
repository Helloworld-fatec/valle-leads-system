# CRM — Leads System

Sistema CRM full-stack com backend Node/Express/Prisma e frontend React/Vite/Tailwind.

---

## Pré-requisitos

- [Node.js 22+](https://nodejs.org/)
- [npm](https://www.npmjs.com/)

---

## 🐳 Rodando COM Docker

> O Docker é usado **apenas para o banco de dados** em desenvolvimento.  
> O backend e o frontend rodam direto na sua máquina com `npm run dev`.

### Pré-requisitos adicionais

- [Docker](https://www.docker.com/get-started) + [Docker Compose](https://docs.docker.com/compose/)

### Passo a passo

```bash
# 1. Clone o repositório
git clone <url-do-repo>
cd <nome-do-repo>

# 2. Configure o .env do backend
cp .env.example server/.env
# Edite server/.env e troque as senhas padrão
```

```bash
# 3. Suba o banco
docker compose up -d
```

```bash
# 4. Instale dependências e rode as migrations do backend
cd server
npm install
npx prisma generate
npx prisma migrate dev
npm run dev          # Terminal 1 — http://localhost:3000
```

```bash
# 5. Em outro terminal, suba o frontend
cd client
npm install
npm run dev          # Terminal 2 — http://localhost:5173
```

### Comandos úteis do banco

```bash
# Ver logs do banco
docker compose logs -f db

# Parar o banco
docker compose down

# Parar e apagar os dados (reset total)
docker compose down -v
```

---

## 💻 Rodando SEM Docker

Você precisará de um banco PostgreSQL. Opções:

- **Local:** instale o [PostgreSQL](https://www.postgresql.org/download/) na sua máquina e crie o banco manualmente
- **Cloud gratuito:** [Neon](https://neon.tech) ou [Supabase](https://supabase.com) — zero instalação

### Ajuste necessário no `.env`

```bash
cp .env.example server/.env
```

Edite o `server/.env` com a connection string do seu banco:

```env
# Banco local instalado na máquina:
DATABASE_URL=postgresql://seu_usuario:sua_senha@localhost:5432/crm_db

# Banco na nuvem (Neon, Supabase, etc.):
# DATABASE_URL=postgresql://user:senha@host/dbname?sslmode=require
```

> As variáveis `POSTGRES_USER`, `POSTGRES_PASSWORD` e `POSTGRES_DB` são usadas  
> apenas pelo Docker para criar o banco automaticamente. Sem Docker, você pode ignorá-las.

### Rodando o backend

```bash
cd server
npm install
npx prisma generate
npx prisma migrate dev   # cria as tabelas no banco
npm run dev              # Terminal 1 — http://localhost:3000
```

### Rodando o frontend

```bash
cd client
npm install
npm run dev              # Terminal 2 — http://localhost:5173
```

---

## 🗂️ Estrutura do projeto

```
/
├── docker-compose.yml       # Sobe apenas o PostgreSQL (dev)
├── .env.example             # Modelo de variáveis — copie para server/.env
├── README.md
├── server/                  # Backend Node/Express/Prisma
│   ├── Dockerfile           # Usado em produção
│   ├── prisma/
│   │   └── schema.prisma
│   └── src/
│       └── server.ts
└── client/                  # Frontend React/Vite/Tailwind
    ├── Dockerfile           # Usado em produção
    ├── nginx.conf           # Config do Nginx para produção
    ├── vite.config.ts
    └── src/
        └── index.css
```

---

## 🔑 Variáveis de ambiente (`server/.env`)

| Variável            | Descrição                                    | Exemplo                          |
|---------------------|----------------------------------------------|----------------------------------|
| `POSTGRES_USER`     | Usuário do banco — usado pelo Docker         | `crm_user`                       |
| `POSTGRES_PASSWORD` | Senha do banco — usado pelo Docker           | `senha_segura`                   |
| `POSTGRES_DB`       | Nome do banco — usado pelo Docker            | `crm_db`                         |
| `DATABASE_URL`      | Connection string completa usada pelo Prisma | `postgresql://...`               |
| `JWT_SECRET`        | Segredo para assinar tokens JWT              | string longa e aleatória         |
| `PORT`              | Porta do servidor backend                    | `3000`                           |

---

## 🚀 Produção

Os `Dockerfile`s de `server/` e `client/` são voltados para deploy em produção (VPS, CI/CD, etc.).  
Em produção, o `docker-compose.yml` deve ser estendido para incluir os três serviços: `db`, `server` e `client`.
