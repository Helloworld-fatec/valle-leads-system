# 🌿 Git Operation Guide — Valle Leads System

Documento de referência sobre a estratégia de branches e versionamento adotada no projeto.

---

## Visão Geral

O repositório utiliza **3 branches principais** com responsabilidades bem definidas, complementadas por branches temporárias de funcionalidade criadas e descartadas ao longo do desenvolvimento.

---

## As 3 Branches Principais

| Branch | Finalidade |
|---|---|
| `main` | Código estável e entregável. Recebe merge apenas ao final de cada sprint. |
| `develop` | Branch de integração do time. Todo desenvolvimento converge aqui durante a sprint. |
| `feature/*` | Branches temporárias, uma por funcionalidade. Criadas a partir da `develop` e descartadas após o merge. |

---

## Fluxo de Trabalho

```
main
 └── develop
       ├── feature/jwt-authentication
       ├── feature/leads-management
       ├── feature/dashboard
       └── feature/...
```

### Passo a passo durante uma sprint

**1. Criar a branch da funcionalidade a partir da develop**
```bash
git checkout develop
git pull origin develop
git checkout -b feature/nome-da-funcionalidade
```

**2. Desenvolver e commitar normalmente**
```bash
git add .
git commit -m "feat: descrição clara do que foi feito"
```

**3. Ao finalizar a funcionalidade, abrir um Pull Request: `feature/` → `develop`**
- Pelo menos 1 aprovação do time é necessária
- Todas as conversas do PR devem estar resolvidas antes do merge

> 📄 Para mais detalhes sobre como abrir e revisar PRs, consulte: [PR Operation Guide](./PR_operation.guide.md)

**4. Ao final da sprint, abrir um Pull Request: `develop` → `main`**
- O time revisa o estado geral da entrega
- Após aprovação, é feito o merge na `main`
- Uma **tag** é criada na `main` marcando o fim da sprint

---

## Tags de Sprint

Ao final de cada sprint, após o merge na `main`, uma tag é criada pelo **PO ou SM** (para manter padronização e segurança) para marcar aquele ponto do projeto. Isso permite que qualquer pessoa navegue pelo histórico e veja exatamente o estado do sistema em cada entrega.

| Sprint | Tag |
|---|---|
| Sprint 1 | `v1.0-sprint1` |
| Sprint 2 | `v2.0-sprint2` |
| Sprint 3 | `v3.0-sprint3` |

**Como criar a tag:**
```bash
git tag -a v1.0-sprint1 -m "Entrega Sprint 1"
git push origin v1.0-sprint1
```

---

## Documentação por Sprint

A documentação de cada sprint fica organizada em pastas dentro do repositório, na branch `main`:

```
docs/
├── guides/
│   ├── git_operation.guide.md
│   ├── github_issues.guide.md
│   ├── github_projects.guide.md
│   └── PR_operation.guide.md
├── sprint-1/
│   ├── backlog.md
│   ├── retrospective.md
│   └── diagrams/
├── sprint-2/
│   ├── backlog.md
│   ├── retrospective.md
│   └── diagrams/
└── sprint-3/
    ├── backlog.md
    ├── retrospective.md
    └── diagrams/
```

---

## Convenção de Prefixos

Os prefixos são unificados entre **branches temporárias e commits**, pois ambos identificam o mesmo tipo de trabalho. Use sempre o prefixo correspondente ao que está sendo feito.

| Prefixo | Uso | Branch | Commit |
|---|---|---|---|
| `feat` | Nova funcionalidade | `feat/jwt-authentication` | `feat: add jwt authentication` |
| `fix` | Correção de bug | `fix/login-validation-error` | `fix: fix email validation on register` |
| `docs` | Apenas documentação | `docs/er-diagram` | `docs: add class diagram sprint 1` |
| `refactor` | Refatoração de código | `refactor/leads-service` | `refactor: extract leads business logic to service layer` |
| `style` | Formatação, espaçamento (sem lógica) | `style/leads-controller` | `style: fix indentation on leads controller` |
| `test` | Adição ou correção de testes | `test/lead-service` | `test: add unit tests for lead service` |
| `chore` | Configuração, dependências, build | `chore/docker-setup` | `chore: configure docker compose` |

> 💡 O prefixo da branch e do commit devem sempre coincidir — se a branch é `feat/`, os commits dentro dela são `feat:`.

---

## Regras Gerais

- ❌ **Nunca** fazer push direto na `main` ou na `develop`
- ❌ **Nunca** usar `git push --force` nas branches principais
- ✅ Todo código entra via Pull Request
- ✅ Todo PR precisa de pelo menos **1 aprovação** antes do merge
- ✅ Commits devem ser frequentes e com mensagens descritivas
- ✅ Antes de criar uma branch temporária (ex: `feat/`), sempre atualizar a `develop` local com `git pull`
- ✅ Tags de sprint são criadas exclusivamente pelo PO ou SM

---

## Resumo Visual do Fluxo

```
Sprint 1
────────────────────────────────────────────────────
feat/jwt-authentication  ──●──●──●──► PR ──► develop
docs/project-guides      ──●──●──────► PR ──► develop
                                                    │
                                           fim da sprint
                                                    │
                                          PR ──► main ──► tag v1.0-sprint1

Sprint 2
────────────────────────────────────────────────────
feat/dashboard           ──●──●──► PR ──► develop
chore/docker-setup       ──●──────► PR ──► develop
                                                    │
                                           fim da sprint
                                                    │
                                          PR ──► main ──► tag v2.0-sprint2
```