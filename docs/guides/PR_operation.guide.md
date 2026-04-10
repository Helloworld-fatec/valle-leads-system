# 🔀 Pull Requests — Guia de Operação do Time

Documento de referência sobre como abrir, preencher, revisar e mergear Pull Requests no projeto **Valle Leads System**.

---

## O que é um Pull Request?

Um Pull Request (PR) é a forma oficial de integrar código ao projeto. Em vez de subir alterações diretamente em uma branch protegida, o membro abre um PR para que o time revise o código antes de aprová-lo e mergeá-lo.

> 💡 Nenhum código entra na `develop` ou na `main` sem passar por um Pull Request. Sem exceções.

---

## Quando Abrir um PR?

| Situação | De | Para |
|---|---|---|
| Funcionalidade concluída | `feature/*` | `develop` |
| Correção de bug concluída | `fix/*` | `develop` |
| Refatoração concluída | `refactor/*` | `develop` |
| Apenas documentação | `docs/*` | `develop` |
| Entrega de sprint | `develop` | `main` |

> ⚠️ PRs diretos para a `main` só devem ser abertos pelo **PO ou SM** ao final de cada sprint.

---

## Como Abrir um PR

1. Acesse o repositório no GitHub
2. Clique na aba **Pull Requests**
3. Clique em **New Pull Request**
4. Selecione a branch de **origem** (ex: `feature/jwt-authentication`) e a branch de **destino** (ex: `develop`)
5. Preencha o título e a descrição conforme orientado abaixo
6. Solicite a revisão de ao menos um membro do time
7. Clique em **Create Pull Request**

---

## Como Preencher um PR

### Título
Siga o mesmo padrão de commits — prefixo e descrição clara em inglês.

✅ Bom: `feat: add jwt authentication`

❌ Ruim: `autenticação pronta`

---

### Descrição
Use a descrição para contextualizar o que foi feito. Sugestão de estrutura:

```
## O que foi feito
Descreva resumidamente as alterações realizadas.

## Como testar
Passo a passo para o revisor testar a funcionalidade.

## Observações
Qualquer ponto de atenção, decisão técnica tomada ou pendência conhecida.

## Issue relacionada (se houver)
Closes #número
```

---

### Reviewers (Revisores)
Solicite a revisão de ao menos **1 membro do time**:

- PO — Bruno Berval
- SM — Nicolas Kauê

Para solicitar: no menu lateral direito do PR, clique em **Reviewers** e selecione o membro.

---

### Assignees (Responsável)
Marque você mesmo como responsável pelo PR — é você quem desenvolveu e está solicitando o merge.

---

### Labels
Use a mesma convenção de labels das Issues para categorizar o PR:

| Label | Uso |
|---|---|
| `feat` | Nova funcionalidade |
| `fix` | Correção de bug |
| `refactor` | Refatoração de código |
| `docs` | Apenas documentação |
| `chore` | Configuração, dependências, build |

---

### Milestone
Vincule o PR à sprint correspondente, assim como nas Issues:
- `Sprint 1`
- `Sprint 2`
- `Sprint 3`

---

## Regras por Tipo de PR

### PR: `feature/` → `develop`
- ✅ Ao menos **1 aprovação** obrigatória antes do merge
- ✅ Todas as conversas devem estar resolvidas antes do merge
- ✅ Se novos commits forem adicionados após a aprovação, a aprovação é cancelada e uma nova revisão é necessária
- ❌ Não fazer merge sem aprovação

### PR: `develop` → `main`
- ✅ Aberto exclusivamente pelo **PO ou SM**
- ✅ Ao menos **1 aprovação** obrigatória antes do merge
- ✅ Todas as conversas devem estar resolvidas antes do merge
- ✅ Após o merge, uma **tag de sprint** é criada pelo PO ou SM
- ❌ Não fazer merge fora do encerramento de sprint

---

## Como Revisar um PR

Revisar o código de um colega é uma responsabilidade importante. O objetivo não é apenas aprovar, mas garantir a qualidade e consistência do projeto.

### Passo a passo

1. Acesse a aba **Pull Requests** no repositório
2. Abra o PR solicitado para revisão
3. Vá na aba **Files changed** para ver as alterações
4. Leia o código com atenção
5. Para comentar em uma linha específica, clique no **+** ao lado da linha
6. Ao finalizar a revisão, clique em **Review changes** e escolha uma das opções:

| Opção | Quando usar |
|---|---|
| **Comment** | Para deixar um comentário geral sem aprovar ou reprovar |
| **Approve** | Quando o código está correto e pode ser mergeado |
| **Request changes** | Quando há algo que precisa ser corrigido antes do merge |

> ⚠️ A opção **Approve** é exclusiva do **PO (Bruno) e SM (Nicolas)**.
> O Dev Team deve utilizar apenas **Comment** ou **Request changes** durante a revisão.

---

## Boas Práticas ao Revisar

- ✅ Seja construtivo — o objetivo é melhorar o código, não criticar o colega
- ✅ Explique o motivo do comentário, não apenas aponte o problema
- ✅ Se encontrar algo positivo, comente também — reconhecimento importa
- ✅ Resolva suas próprias conversas após a correção ser feita
- ❌ Não aprove um PR sem realmente revisar o código
- ❌ Não deixe conversas abertas sem resposta

---

## Boas Práticas ao Abrir um PR

- ✅ Abra o PR assim que a funcionalidade estiver concluída — não acumule
- ✅ Mantenha os PRs pequenos e focados em uma única funcionalidade
- ✅ Responda os comentários da revisão com agilidade
- ✅ Após corrigir o que foi solicitado, notifique o revisor para uma nova avaliação
- ❌ Não faça merge do seu próprio PR sem aprovação de outro membro
- ❌ Não suba código com conflitos não resolvidos

---

## Resolvendo Conflitos

Conflitos acontecem quando duas branches modificaram o mesmo trecho de código. Para resolver:

**1. Atualize a branch local:**
```bash
git checkout feature/sua-branch
git pull origin develop
```

**2. O Git indicará os arquivos com conflito. Abra-os e resolva manualmente:**
```
<<<<<<< HEAD
seu código
=======
código da develop
>>>>>>> develop
```

**3. Após resolver, finalize:**
```bash
git add .
git commit -m "fix: resolve merge conflicts"
git push origin feature/sua-branch
```

O PR será atualizado automaticamente e poderá seguir para revisão.

---

## Resumo do Fluxo

```
1. Desenvolvimento concluído na branch feature/
       │
       ▼
2. PR aberto: feature/ → develop
       │
       ▼
3. PO ou SM analisa o código
       │
       ├── Solicita mudanças → autor corrige → nova revisão
       │
       └── Aprova → merge na develop
                         │
                    fim da sprint
                         │
                         ▼
              4. PR aberto: develop → main (pelo PO ou SM)
                         │
                         ▼
              5. Aprovação e merge na main
                         │
                         ▼
              6. Tag de sprint criada (pelo PO ou SM)
```