FROM node:22-alpine AS deps
WORKDIR /app

COPY package*.json ./
RUN npm ci

FROM deps AS build
WORKDIR /app

COPY . .
RUN npx prisma generate
RUN npm run build

FROM deps AS dev
WORKDIR /app

COPY . .
RUN npx prisma generate

EXPOSE 3000
CMD ["npm", "run", "dev"]

FROM node:22-alpine AS prod
WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --include=dev

COPY --from=build /app/dist ./dist
COPY --from=build /app/src/generated ./dist/src/generated
COPY prisma ./prisma
COPY prisma.config.ts ./prisma.config.ts

EXPOSE 3000

CMD ["sh", "-c", "npx prisma generate && npx prisma migrate deploy && node dist/src/server.js"]