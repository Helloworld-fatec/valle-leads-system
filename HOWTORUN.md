# Como rodar com Docker — Valle Leads System

Este projeto usa banco PostgreSQL hospedado no Render. Por isso, o `docker-compose.yml` principal **não sobe um container de banco local**. Ele sobe apenas:

- `server` — backend Node/Express;
- `client` — frontend React servido por Nginx.

## 1. Criar `.env` na raiz

Na raiz do projeto:

```bash
cp .env.example .env
```

Edite o `.env` e cole a URL do banco hospedado no Render:

```env
DATABASE_URL=postgresql://USUARIO:SENHA@HOST/NOME_DO_BANCO?sslmode=require
```

Para rodar localmente pelo Docker no seu computador, normalmente use a **External Database URL** do Render.

## 2. Validar Compose

```bash
docker compose config
```

Esse comando não deve mostrar warnings de `POSTGRES_USER`, `POSTGRES_PASSWORD` ou `POSTGRES_DB`, porque o Compose principal não usa banco local.

## 3. Subir aplicação

```bash
docker compose up -d --build
```

Acesse:

- Frontend: `http://localhost`
- Backend: `http://localhost:3000`
- API: `http://localhost:3000/api`

## 4. Logs úteis

```bash
docker compose ps
docker compose logs server
docker compose logs client
```

## 5. Desenvolvimento com hot reload

```bash
docker compose -f docker-compose.dev.yml up --build
```

Acesse:

- Frontend dev: `http://localhost:5173`
- Backend dev: `http://localhost:3000`

## 6. Banco local opcional

Se quiser testar com PostgreSQL local em container, use:

```bash
docker compose -f docker-compose.local-db.yml up -d --build
```

Nesse caso, o Compose usa `POSTGRES_USER`, `POSTGRES_PASSWORD` e `POSTGRES_DB` com defaults ou valores definidos no `.env`.

## 7. Observação de segurança

Nunca commite o `.env`. Se uma `DATABASE_URL` real ou segredo JWT apareceu em log público, gere novas credenciais/secrets antes da entrega.
