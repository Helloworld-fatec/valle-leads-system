# ─── Stage 1: build ───────────────────────────────────────────────────────────
FROM node:22-alpine AS build

WORKDIR /app

# Instala dependências (incluindo devDeps para compilar TS)
COPY package*.json ./
RUN npm ci

# Copia o restante do código
COPY . .

# Gera o Prisma Client e compila o TypeScript
RUN npx prisma generate
RUN npm run build

# ─── Stage 2: production ──────────────────────────────────────────────────────
FROM node:22-alpine AS prod

WORKDIR /app

ENV NODE_ENV=production

# Copia apenas o necessário para rodar em produção
COPY package*.json ./
RUN npm ci --omit=dev

# Copia o build gerado e o schema do Prisma (necessário em runtime)
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY prisma ./prisma

EXPOSE 3000

# Roda as migrations e inicia o servidor
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
