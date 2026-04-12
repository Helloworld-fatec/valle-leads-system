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
docker compose up -d db
```

```bash
# 4. Popule o banco com migrations + seed (apenas na primeira vez)
#    Certifique-se de que server/prisma/seed_data.csv existe antes de rodar
docker compose run --rm seed
```

```bash
# 5. Instale dependências e rode o backend
cd server
npm install
npm run dev          # Terminal 1 — http://localhost:3000
```

```bash
# 6. Em outro terminal, suba o frontend
cd client
npm install
npm run dev          # Terminal 2 — http://localhost:5173
```

> Nas próximas vezes, basta `docker compose up -d db` + `npm run dev` nos dois terminais.
> O serviço `seed` só precisa rodar **uma vez** por ambiente.

### Comandos úteis

```bash
# Ver logs do banco
docker compose logs -f db

# Parar o banco
docker compose down

# Parar e apagar os dados (reset total — seed precisará rodar novamente)
docker compose down -v

# Rodar o seed novamente (ex: após reset)
docker compose run --rm seed
```

---

## 💻 Rodando SEM Docker

Você precisará de um banco PostgreSQL. Opções:

- **Local:** instale o [PostgreSQL](https://www.postgresql.org/download/) na sua máquina
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

### Rodando o backend + seed

```bash
cd server
npm install
npx prisma generate
npx prisma migrate dev        # cria as tabelas no banco

# Popule o banco (apenas na primeira vez)
# Certifique-se de que prisma/seed_data.csv existe
npx ts-node prisma/seed.ts

npm run dev                   # Terminal 1 — http://localhost:3000
```

### Rodando o frontend

```bash
cd client
npm install
npm run dev                   # Terminal 2 — http://localhost:5173
```

---

## 🚀 Produção

Os `Dockerfile`s de `server/` e `client/` são voltados para deploy em produção.

O `server/Dockerfile` no stage `prod` executa automaticamente na inicialização:
1. `prisma migrate deploy` — aplica migrations pendentes
2. `node dist/prisma/seed.js` — roda o seed (idempotente: usa `findFirst`/`upsert`, não duplica dados)
3. `node dist/server.js` — inicia o servidor

> **Atenção:** coloque o `seed_data.csv` em `server/prisma/` antes de fazer o build da imagem de produção,
> pois ele será copiado para dentro do container via `COPY prisma ./prisma`.

Para produção com todos os serviços no Docker, estenda o `docker-compose.yml` adicionando os serviços `server` e `client`.

---

## 🗂️ Estrutura do projeto

```
/
├── docker-compose.yml       # Banco (dev) + serviço seed
├── .env.example             # Modelo de variáveis — copie para server/.env
├── README.md
├── server/
│   ├── Dockerfile           # Multi-stage: build + prod (com seed automático)
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── seed.ts          # Script de seed
│   │   └── seed_data.csv    # CSV com dados fictícios (não commitar dados reais!)
│   └── src/
│       └── server.ts
└── client/
    ├── Dockerfile           # Multi-stage: build + Nginx
    ├── nginx.conf
    ├── vite.config.ts
    └── src/
        └── index.css
```

---

## 🔑 Variáveis de ambiente (`server/.env`)

| Variável            | Descrição                                    | Exemplo                  |
|---------------------|----------------------------------------------|--------------------------|
| `POSTGRES_USER`     | Usuário do banco — usado pelo Docker         | `crm_user`               |
| `POSTGRES_PASSWORD` | Senha do banco — usado pelo Docker           | `senha_segura`           |
| `POSTGRES_DB`       | Nome do banco — usado pelo Docker            | `crm_db`                 |
| `DATABASE_URL`      | Connection string completa usada pelo Prisma | `postgresql://...`       |
| `JWT_SECRET`        | Segredo para assinar tokens JWT              | string longa e aleatória |
| `PORT`              | Porta do servidor backend                    | `3000`                   |

