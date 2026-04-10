# 📌 Padrões de Desenvolvimento — Valle Leads System

Este guia define os padrões de nomenclatura, organização e boas práticas adotados no projeto **Valle Leads System** (Node.js + React + TypeScript + Prisma).

Seguir essas regras garante um código organizado, legível e consistente entre todos os membros do time.

> ⚠️ **Regra geral: tudo em inglês.** Nomes de arquivos, pastas, variáveis, funções, classes, tipos, interfaces, rotas, colunas de banco de dados — sem exceções.

---

## 📂 Estrutura de Pastas e Arquivos

### Nomes de pastas
Usar **kebab-case** (minúsculas, separadas por hífen).

```
src/
├── controllers/
├── services/
├── repositories/
├── middlewares/
├── routes/
├── models/
├── utils/
└── types/
```

### Nomes de arquivos
Seguir o padrão: `nomeDoArquivo.tipo.ts`

| Tipo de arquivo | Padrão | Exemplo |
|---|---|---|
| Controller | `camelCase.controller.ts` | `lead.controller.ts` |
| Service | `camelCase.service.ts` | `lead.service.ts` |
| Repository | `camelCase.repository.ts` | `lead.repository.ts` |
| Middleware | `camelCase.middleware.ts` | `auth.middleware.ts` |
| Rotas | `camelCase.routes.ts` | `lead.routes.ts` |
| Tipos/Interfaces | `camelCase.types.ts` | `lead.types.ts` |
| Utilitários | `camelCase.utils.ts` | `date.utils.ts` |
| Componente React | `PascalCase.tsx` | `LeadCard.tsx` |
| Hook React | `camelCase.ts` | `useLeads.ts` |

---

## 🟦 Componentes React

- Nome em **PascalCase**
- Um componente por arquivo

```tsx
// ✅ Correto
const LeadCard = () => { ... }
const DashboardPage = () => { ... }

// ❌ Errado
const leadCard = () => { ... }
const dashboard_page = () => { ... }
```

---

## 🟨 Variáveis e Funções

- Nome em **camelCase**, sempre em inglês
- Funções booleanas começam com `is`, `has` ou `can`
- Funções de ação começam com verbos no infinitivo

```ts
// Variáveis
const userName = "John"
const isLoading = true
const hasPermission = false

// Funções booleanas
isLoggedIn()
hasPermission()
canEdit()

// Funções de ação
getUser()
createLead()
updateProfile()
deleteNegotiation()
```

---

## 🟧 Constantes

Constantes globais e variáveis de ambiente em **SCREAMING_SNAKE_CASE**.

```ts
const API_BASE_URL = "https://..."
const JWT_EXPIRATION_TIME = "24h"
const MAX_QUERY_PERIOD_DAYS = 365
```

---

## 🟩 Tipos e Interfaces (TypeScript)

- Nome em **PascalCase**
- Interfaces que representam props de componentes terminam com `Props`

```ts
// Tipos e Interfaces
type User = { ... }
type Lead = { ... }
interface AuthResponse { ... }

// Props de componentes
interface LeadCardProps { ... }
interface DashboardFilterProps { ... }
```

---

## 🗄️ Banco de Dados (Prisma + PostgreSQL)

- Nomes de tabelas em **PascalCase** no schema do Prisma
- Nomes de colunas em **camelCase** no schema do Prisma
- O Prisma converte automaticamente para **snake_case** no PostgreSQL

```prisma
model Lead {
  id          Int      @id @default(autoincrement())
  createdAt   DateTime @default(now())
  originChannel String
  attendantId Int
}
```

---

## 🔀 Rotas da API (REST)

- Sempre em **kebab-case** e no plural
- Usar substantivos, não verbos

```
✅ GET    /leads
✅ GET    /leads/:id
✅ POST   /leads
✅ PUT    /leads/:id
✅ DELETE /leads/:id
✅ GET    /leads/:id/negotiations

❌ GET    /getLead
❌ POST   /createLead
```

---

## 💬 Comentários no Código

Comentários podem ser escritos em **português**. Eles são essenciais para que qualquer membro do time — incluindo o próprio autor no futuro — entenda a lógica implementada sem precisar deduzir pelo código.

### Quando comentar
- Lógicas de negócio complexas
- Decisões técnicas não óbvias
- Funções e métodos com comportamento específico
- Trechos que fogem do padrão por alguma razão

### Como comentar

```ts
// Busca somente os leads do atendente autenticado,
// impedindo acesso a leads de outros usuários (regra de negócio RF02)
const leads = await leadRepository.findByAttendantId(userId)

/**
 * Calcula a taxa de conversão da equipe no período informado.
 * Fórmula: leads convertidos / total de leads finalizados
 */
const conversionRate = getConversionRate(teamId, startDate, endDate)
```

### O que não comentar
Evite comentários que apenas repetem o que o código já diz:

```ts
// ❌ Desnecessário
// incrementa o contador
counter++

// ❌ Desnecessário
// retorna o usuário
return user
```

---

## 🟪 Importações

Ordem recomendada para manter consistência:

```ts
// 1. Bibliotecas externas
import express from "express"
import { PrismaClient } from "@prisma/client"

// 2. Imports absolutos do projeto
import { LeadService } from "@/services/lead.service"
import { authMiddleware } from "@/middlewares/auth.middleware"

// 3. Imports relativos
import { formatDate } from "../utils/date.utils"
```

---

## 🔧 Ferramentas de Padronização

- **Prettier** — formatação automática do código
- **ESLint** — análise estática e boas práticas
- Configurar ambos no projeto para que rodem automaticamente ao salvar

---

## ✅ Resumo Rápido

| O quê | Padrão | Exemplo |
|---|---|---|
| Pastas | kebab-case | `lead-management/` |
| Arquivos | camelCase.tipo.ts | `lead.controller.ts` |
| Componentes React | PascalCase | `LeadCard.tsx` |
| Variáveis e funções | camelCase | `getUserById()` |
| Constantes globais | SCREAMING_SNAKE_CASE | `JWT_SECRET` |
| Tipos e interfaces | PascalCase | `LeadResponse` |
| Rotas da API | kebab-case plural | `/leads/:id` |
| Comentários | Português | `// valida permissão do usuário` |
| Tudo mais | Inglês | sem exceções |
