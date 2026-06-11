# Como Rodar com Docker — Valle Leads System

Este documento explica como executar o **Valle Leads System** com Docker e Docker Compose.

A infraestrutura Docker foi organizada para atender três cenários:

| Modo            | Arquivo                    | Banco usado                                | Quando usar                                       |
| --------------- | -------------------------- | ------------------------------------------ | ------------------------------------------------- |
| Produção/local  | `docker-compose.yml`       | PostgreSQL local em container Docker       | Demonstração, entrega local e validação integrada |
| Desenvolvimento | `docker-compose.dev.yml`   | PostgreSQL local em container Docker       | Desenvolvimento com hot reload                    |
| Cloud           | `docker-compose.cloud.yml` | PostgreSQL hospedado em nuvem, como Render | Testes com banco remoto/compartilhado             |

---

## 1. Pré-requisitos

Antes de executar o projeto, instale:

* Docker
* Docker Compose
* Git

Para validar a instalação:

```bash
docker --version
docker compose version
git --version
```

---

## 2. Clonar o repositório

```bash
git clone https://github.com/Helloworld-fatec/valle-leads-system.git
cd valle-leads-system
```

---

## 3. Variáveis de ambiente

O Docker Compose lê as variáveis de ambiente a partir de arquivos `.env` localizados na **raiz do projeto**.

Para execução local padrão, crie:

```bash
cp .env.example .env
```

O arquivo `.env` é usado por:

* `docker-compose.yml`
* `docker-compose.dev.yml`

Para execução com banco em nuvem, crie:

```bash
cp .env.example .env.cloud
```

O arquivo `.env.cloud` é usado por:

* `docker-compose.cloud.yml`

> Arquivos `.env`, `.env.cloud`, `.env.render` e `.env.local-db` não devem ser commitados.

---

## 4. Modelo de `.env` para produção/local com banco local

O modo padrão usa PostgreSQL local em container Docker.

Use este modelo no `.env` da raiz:

```env
NODE_ENV=production

POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=valle_leads

DATABASE_URL=postgresql://postgres:postgres@db:5432/valle_leads?schema=public

ACCESS_TOKEN_SECRET=troque_por_uma_chave_segura_de_access_token
REFRESH_TOKEN_SECRET=troque_por_uma_chave_segura_de_refresh_token
ACCESS_TOKEN_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d

VITE_BACKEND_URL=
```

Atenção: dentro do Docker, o backend acessa o banco pelo nome do serviço:

```txt
db
```

Por isso a URL usa:

```txt
@db:5432
```

e não:

```txt
@localhost:5432
```

No modo produção/local, mantenha:

```env
VITE_BACKEND_URL=
```

Assim, o frontend chama a API usando caminhos relativos como:

```txt
/api/auth/login
```

e o Nginx redireciona internamente para o backend.

---

## 5. Execução principal com banco local

O `docker-compose.yml` sobe:

* `db` — PostgreSQL local;
* `server` — backend Node/Express;
* `client` — frontend React servido por Nginx.

### 5.1 Validar Compose

```bash
docker compose config
```

Esse comando deve finalizar sem erro.

### 5.2 Subir aplicação

```bash
docker compose up -d --build
```

### 5.3 Verificar containers

```bash
docker compose ps
```

O esperado é que os serviços abaixo estejam em execução:

* `db`
* `server`
* `client`

Exemplo esperado:

```txt
valle_db       Up (healthy)
valle_server   Up (healthy)
valle_client   Up
```

### 5.4 Acessar no navegador

| Serviço  | URL                       |
| -------- | ------------------------- |
| Frontend | http://localhost          |
| Backend  | http://localhost:3000     |
| API      | http://localhost:3000/api |

### 5.5 Logs úteis

```bash
docker compose logs db
docker compose logs server
docker compose logs client
```

Para acompanhar em tempo real:

```bash
docker compose logs -f db
docker compose logs -f server
docker compose logs -f client
```

### 5.6 Parar aplicação

```bash
docker compose down
```

### 5.7 Resetar banco local

Para apagar completamente os dados do PostgreSQL local:

```bash
docker compose down -v
docker compose up -d --build
```

O `-v` remove o volume do banco.

> Esse comando apaga apenas o banco local do Docker. Ele não afeta banco em nuvem.

---

## 6. Execução em modo desenvolvimento com banco local

O `docker-compose.dev.yml` sobe:

* `db` — PostgreSQL local;
* `server` — backend em modo desenvolvimento;
* `client` — frontend Vite em modo desenvolvimento.

Esse modo é útil porque permite hot reload.

### 6.1 Ajustar `.env` para desenvolvimento

No `.env` da raiz, use:

```env
NODE_ENV=development

POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=valle_leads

DATABASE_URL=postgresql://postgres:postgres@db:5432/valle_leads?schema=public

ACCESS_TOKEN_SECRET=troque_por_uma_chave_segura_de_access_token
REFRESH_TOKEN_SECRET=troque_por_uma_chave_segura_de_refresh_token
ACCESS_TOKEN_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d

VITE_BACKEND_URL=
```

No modo dev, mantenha:

```env
VITE_BACKEND_URL=
```

O frontend deve chamar a API usando `/api/...`.

O redirecionamento para o backend é feito pelo proxy do Vite em `client/vite.config.ts`.

O arquivo `vite.config.ts` deve preservar o plugin do Tailwind e incluir proxy para `/api`:

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: "0.0.0.0",
    port: 5173,
    strictPort: true,
    proxy: {
      "/api": {
        target: "http://server:3000",
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq) => {
            proxyReq.removeHeader("origin");
          });
        },
      },
    },
  },
});
```

### 6.2 Validar Compose dev

```bash
docker compose -f docker-compose.dev.yml config
```

### 6.3 Subir ambiente dev

```bash
docker compose -f docker-compose.dev.yml up -d --build
```

### 6.4 Verificar containers

```bash
docker compose -f docker-compose.dev.yml ps
```

O esperado é que os serviços abaixo estejam em execução:

* `db`
* `server`
* `client`

### 6.5 Acessar no navegador

| Serviço      | URL                       |
| ------------ | ------------------------- |
| Frontend Dev | http://localhost:5173     |
| Backend Dev  | http://localhost:3000     |
| API          | http://localhost:3000/api |

### 6.6 Logs do ambiente dev

```bash
docker compose -f docker-compose.dev.yml logs db
docker compose -f docker-compose.dev.yml logs server
docker compose -f docker-compose.dev.yml logs client
```

Para acompanhar em tempo real:

```bash
docker compose -f docker-compose.dev.yml logs -f db
docker compose -f docker-compose.dev.yml logs -f server
docker compose -f docker-compose.dev.yml logs -f client
```

### 6.7 Parar ambiente dev

```bash
docker compose -f docker-compose.dev.yml down
```

### 6.8 Resetar banco local do dev

```bash
docker compose -f docker-compose.dev.yml down -v
docker compose -f docker-compose.dev.yml up -d --build
```

O banco do modo dev usa volume próprio. Portanto, popular o banco do modo produção/local não popula automaticamente o banco do modo dev.

---

## 7. Execução com banco em nuvem

O `docker-compose.cloud.yml` sobe apenas:

* `server` — backend Node/Express;
* `client` — frontend React servido por Nginx.

Ele **não sobe container de banco local**.

Use esse modo quando quiser conectar o projeto a um PostgreSQL hospedado em nuvem, como Render.

### 7.1 Configurar `.env.cloud`

Crie o arquivo:

```bash
cp .env.example .env.cloud
```

Edite o `.env.cloud`:

```env
NODE_ENV=production

DATABASE_URL=postgresql://USUARIO:SENHA@HOST/NOME_DO_BANCO?sslmode=require

ACCESS_TOKEN_SECRET=troque_por_uma_chave_segura_de_access_token
REFRESH_TOKEN_SECRET=troque_por_uma_chave_segura_de_refresh_token
ACCESS_TOKEN_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d

VITE_BACKEND_URL=
```

Para execução local usando banco do Render, normalmente utilize a **External Database URL** fornecida pelo Render.

### 7.2 Validar Compose cloud

```bash
docker compose -f docker-compose.cloud.yml config
```

Esse comando deve finalizar sem erro.

### 7.3 Subir aplicação cloud

```bash
docker compose -f docker-compose.cloud.yml up -d --build
```

### 7.4 Verificar containers

```bash
docker compose -f docker-compose.cloud.yml ps
```

O esperado é que os serviços abaixo estejam em execução:

* `server`
* `client`

### 7.5 Acessar no navegador

| Serviço  | URL                       |
| -------- | ------------------------- |
| Frontend | http://localhost          |
| Backend  | http://localhost:3000     |
| API      | http://localhost:3000/api |

### 7.6 Logs do ambiente cloud

```bash
docker compose -f docker-compose.cloud.yml logs server
docker compose -f docker-compose.cloud.yml logs client
```

### 7.7 Parar ambiente cloud

```bash
docker compose -f docker-compose.cloud.yml down
```

---

## 8. Prisma, migrations e seed

O projeto utiliza Prisma para gerar o client, aplicar migrations e popular o banco com dados iniciais.

### 8.1 O que o Docker faz automaticamente

Durante o build do backend, o Dockerfile deve executar:

```bash
npx prisma generate
npm run build
```

Durante a inicialização do backend em produção/local, o container deve executar:

```bash
npx prisma generate
npx prisma migrate deploy
node dist/src/server.js
```

Isso garante que:

* o Prisma Client seja gerado;
* as migrations sejam aplicadas;
* o servidor seja iniciado.

Nos logs do backend, é esperado ver algo parecido com:

```txt
Loaded Prisma config from prisma.config.ts.
Prisma schema loaded from prisma/schema.prisma.
Datasource "db": PostgreSQL database "valle_leads", schema "public" at "db:5432"
migrations found in prisma/migrations
No pending migrations to apply.
Servidor rodando em http://localhost:3000
```

### 8.2 O que o Docker não faz automaticamente

O Docker **não executa seed automaticamente**.

O seed deve ser executado manualmente quando o banco estiver vazio, para evitar duplicação de registros ou conflito de constraints.

### 8.3 Rodar seed no modo produção/local

Após subir o projeto:

```bash
docker compose up -d --build
```

rode:

```bash
docker compose exec server npx prisma db seed
```

Depois tente logar novamente no sistema.

### 8.4 Rodar seed no modo desenvolvimento

O banco do modo dev é separado do banco do modo produção/local.

Após subir o dev:

```bash
docker compose -f docker-compose.dev.yml up -d --build
```

rode:

```bash
docker compose -f docker-compose.dev.yml exec server npx prisma db seed
```

### 8.5 Rodar seed no modo cloud

Use com cuidado, pois esse comando afeta o banco em nuvem configurado em `.env.cloud`.

```bash
docker compose -f docker-compose.cloud.yml exec server npx prisma db seed
```

Antes de rodar seed em banco remoto, confirme com o time se esse banco pode receber dados iniciais ou se já possui dados oficiais.

### 8.6 Reset completo com seed no modo produção/local

```bash
docker compose down -v
docker compose up -d --build
docker compose exec server npx prisma db seed
```

### 8.7 Reset completo com seed no modo dev

```bash
docker compose -f docker-compose.dev.yml down -v
docker compose -f docker-compose.dev.yml up -d --build
docker compose -f docker-compose.dev.yml exec server npx prisma db seed
```

---

## 9. Alternância entre modos

Antes de trocar de modo, pare o ambiente atual:

```bash
docker compose down
docker compose -f docker-compose.dev.yml down
docker compose -f docker-compose.cloud.yml down
```

Para banco local padrão:

```bash
cp .env.example .env
docker compose up -d --build
docker compose exec server npx prisma db seed
```

Para dev com banco local:

```bash
cp .env.example .env
# edite NODE_ENV=development, se necessário
# mantenha VITE_BACKEND_URL vazio para usar proxy do Vite

docker compose -f docker-compose.dev.yml up -d --build
docker compose -f docker-compose.dev.yml exec server npx prisma db seed
```

Para banco em nuvem:

```bash
cp .env.example .env.cloud
# edite DATABASE_URL com a URL externa do Render

docker compose -f docker-compose.cloud.yml up -d --build
```

---

## 10. Validações da task Docker

Para considerar a infraestrutura Docker validada, execute:

### Compose principal com banco local

```bash
docker compose config
docker compose up -d --build
docker compose ps
docker compose exec server npx prisma db seed
```

### Compose dev com banco local

```bash
docker compose -f docker-compose.dev.yml config
docker compose -f docker-compose.dev.yml up -d --build
docker compose -f docker-compose.dev.yml ps
docker compose -f docker-compose.dev.yml exec server npx prisma db seed
```

### Compose cloud com banco remoto

```bash
docker compose -f docker-compose.cloud.yml config
docker compose -f docker-compose.cloud.yml up -d --build
docker compose -f docker-compose.cloud.yml ps
```

Checklist esperado:

* `docker compose config` sem erro;
* projeto sobe com `docker compose up -d --build`;
* frontend abre no navegador;
* backend sobe corretamente;
* migrations são aplicadas no start do backend;
* seed pode ser executado manualmente quando necessário;
* documentação de execução disponível;
* opção clara para banco local e banco remoto.

---

## 11. Troubleshooting

### Erro: backend não consegue conectar no banco local

Verifique se a `DATABASE_URL` usa `db` como host:

```env
DATABASE_URL=postgresql://postgres:postgres@db:5432/valle_leads?schema=public
```

Não use `localhost` dentro do container.

---

### Erro: frontend em produção/local mostra `Failed to fetch`

No modo produção/local, confira se o `.env` possui:

```env
VITE_BACKEND_URL=
```

Depois reconstrua o client:

```bash
docker compose down
docker compose up -d --build
```

O frontend deve chamar a API via:

```txt
/api/...
```

e o Nginx deve redirecionar para o backend.

---

### Erro: frontend dev mostra `Failed to fetch` ou erro de CORS

No modo dev, confira se o `.env` possui:

```env
VITE_BACKEND_URL=
```

O `client/vite.config.ts` deve possuir proxy para `/api`.

Depois rode:

```bash
docker compose -f docker-compose.dev.yml down
docker compose -f docker-compose.dev.yml up -d --build
```

---

### Erro: login retorna 403 no modo dev

O banco do modo dev é separado do banco do modo produção/local.

Rode a seed no ambiente dev:

```bash
docker compose -f docker-compose.dev.yml exec server npx prisma db seed
```

Se ainda falhar, confira os logs do backend:

```bash
docker compose -f docker-compose.dev.yml logs server --tail=80
```

---

### Erro: seed falha com `Cannot find module '../src/generated/prisma/client.js'`

Esse erro indica que o Prisma Client não foi gerado no caminho esperado pelo seed.

Rode:

```bash
docker compose exec server npx prisma generate
docker compose exec server npx prisma db seed
```

No modo dev:

```bash
docker compose -f docker-compose.dev.yml exec server npx prisma generate
docker compose -f docker-compose.dev.yml exec server npx prisma db seed
```

A correção definitiva é garantir que o `server/Dockerfile` execute `npx prisma generate` antes de iniciar o servidor.

---

### Erro: backend não consegue conectar no Render

Verifique:

* se a `DATABASE_URL` está correta;
* se contém `sslmode=require`;
* se está usando a URL externa do Render para execução local;
* se as credenciais do banco não foram rotacionadas;
* se há conexão com a internet.

---

### Erro: `tsx: not found` no Docker dev

O backend em modo dev depende do pacote `tsx`.

Verifique se o `server/package.json` contém `tsx` em `devDependencies`.

Depois rode:

```bash
docker compose -f docker-compose.dev.yml down
docker compose -f docker-compose.dev.yml up -d --build
```

---

### Erro: build do frontend falha no Docker

O Docker executa o build real do frontend:

```bash
npm run build
```

Antes de tentar Docker, valide localmente:

```bash
cd client
npm install
npm run build
```

Corrija erros de TypeScript antes de rodar o Compose novamente.

---

### Erro: porta já está em uso

Verifique containers ativos:

```bash
docker ps
```

Pare ambientes anteriores:

```bash
docker compose down
docker compose -f docker-compose.dev.yml down
docker compose -f docker-compose.cloud.yml down
```

---

### Quero apagar todos os dados do banco local

No compose principal:

```bash
docker compose down -v
```

No compose dev:

```bash
docker compose -f docker-compose.dev.yml down -v
```

O `-v` remove os volumes do PostgreSQL local.

---

## 12. Observação de segurança

Nunca commite arquivos `.env` reais.

O `.env.example` deve conter apenas placeholders.

Arquivos como `.env.cloud`, `.env.render` e `.env.local-db` devem permanecer locais.

Se uma `DATABASE_URL` real, senha de banco ou segredo JWT aparecer em log público, chat, commit ou PR, gere novas credenciais antes da entrega.

---

## 13. Resumo dos comandos

### Produção/local com banco local

```bash
cp .env.example .env
docker compose config
docker compose up -d --build
docker compose exec server npx prisma db seed
```

### Desenvolvimento com banco local

```bash
cp .env.example .env
docker compose -f docker-compose.dev.yml config
docker compose -f docker-compose.dev.yml up -d --build
docker compose -f docker-compose.dev.yml exec server npx prisma db seed
```

### Banco em nuvem

```bash
cp .env.example .env.cloud
docker compose -f docker-compose.cloud.yml config
docker compose -f docker-compose.cloud.yml up -d --build
```

### Parar tudo

```bash
docker compose down
docker compose -f docker-compose.dev.yml down
docker compose -f docker-compose.cloud.yml down
```

### Resetar banco local

```bash
docker compose down -v
```

### Resetar banco local do dev

```bash
docker compose -f docker-compose.dev.yml down -v
```
