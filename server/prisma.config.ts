/// <reference types="node" />
import 'dotenv/config'
import { defineConfig } from 'prisma/config'

// prisma.config.ts
export default defineConfig({
  schema: 'prisma/schema.prisma',

  migrations: {
    // Usar npx tsx é mais seguro para o teu setup atual
    seed: 'npx tsx ./prisma/seed.ts',
  },

  datasource: {
    url: process.env.DATABASE_URL,
  },
})  
