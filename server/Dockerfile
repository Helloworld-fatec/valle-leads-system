# ─── Stage 1: build ───────────────────────────────────────────────────────────
FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Gera o Prisma Client e compila TypeScript (inclui prisma/seed.ts -> dist/prisma/seed.js)
RUN npx prisma generate
RUN npm run build

# ─── Stage 2: production ──────────────────────────────────────────────────────
FROM node:22-alpine AS prod

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev

# Build compilado (inclui dist/prisma/seed.js)
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma

# Schema e CSV de seed
COPY prisma ./prisma

EXPOSE 3000

# migrate deploy (idempotente) + seed (idempotente via findFirst/upsert) + servidor
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/prisma/seed.js && node dist/server.js"]
