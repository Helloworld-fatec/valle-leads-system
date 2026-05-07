# ─── Stage 1: Build ───────────────────────────────────────────────────────────
# O FROM deve ser sempre a primeira linha de instrução válida
FROM node:22-alpine AS build 

WORKDIR /app 

# Instalação limpa de dependências
COPY package*.json ./ 
RUN npm ci 

# Copia o código e gera o Prisma Client
COPY . . 

# IMPORTANTE: No Prisma 7, NÃO remova o prisma.config.ts 
# Ele é necessário para que o migrate deploy funcione corretamente 
RUN npx prisma generate 
RUN npm run build 

# ─── Stage 2: production ──────────────────────────────────────────────────────
FROM node:22-alpine AS prod

WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev

# Copia o build compilado
COPY --from=build /app/dist ./dist

# CORREÇÃO: Copia o Prisma Client para DENTRO da estrutura do dist
# para que o caminho relativo '../generated/prisma' funcione
COPY --from=build /app/src/generated ./dist/src/generated

# Schema e config necessários para o deploy
COPY prisma ./prisma
COPY --from=build /app/prisma.config.ts ./ 

EXPOSE 3000

# Comando ajustado (sem a flag --url que causava erro no Prisma 7)
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/src/server.js"]