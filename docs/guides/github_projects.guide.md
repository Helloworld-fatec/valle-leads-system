# 📋 GitHub Projects — Guia do Time

Documento de referência sobre o uso do quadro Kanban no GitHub Projects para organização das sprints do projeto **Valle Leads System**.

---

## Visão Geral

O GitHub Projects é o quadro visual integrado ao repositório onde organizamos e acompanhamos todas as tarefas de cada sprint. Ele está diretamente conectado às Issues e Pull Requests do projeto, mantendo tudo centralizado em um único lugar.

---

## Nomenclatura dos Quadros

Um quadro é criado para cada sprint, seguindo o padrão:

| Sprint | Nome do Quadro |
|---|---|
| Sprint 1 | `valle-leads-system_sprint-1` |
| Sprint 2 | `valle-leads-system_sprint-2` |
| Sprint 3 | `valle-leads-system_sprint-3` |

Isso garante que o histórico de cada sprint fique preservado de forma isolada e organizada.

---

## Colunas do Quadro

O quadro é composto por **5 colunas**, seguindo o fluxo natural de desenvolvimento:

| Coluna | Descrição |
|---|---|
| `Product Backlog` | Todos os requisitos funcionais e não funcionais que precisam ser implementados no projeto |
| `Sprint Backlog` | Subconjunto do Product Backlog selecionado para ser entregue na sprint atual |
| `In Progress` | Tarefas que estão sendo desenvolvidas no momento |
| `In Review` | Tarefas com PR aberto, aguardando revisão e aprovação do time |
| `Done` | Tarefas concluídas, com PR aprovado e mergeado na `develop` |

---

## Fluxo das Tarefas

```
Product Backlog → Sprint Backlog → In Progress → In Review → Done
```

1. O **Product Backlog** reúne todos os requisitos do projeto
2. Ao iniciar uma sprint, as tarefas priorizadas são movidas para o **Sprint Backlog**
3. Quando um membro inicia o desenvolvimento, move a tarefa para **In Progress**
4. Ao abrir o Pull Request, a tarefa vai para **In Review**
5. Após aprovação e merge, a tarefa vai para **Done**

---

## Permissões e Responsabilidades

> ⚠️ **Atenção — leia com cuidado**

O quadro possui um controle claro de permissões para manter a organização e integridade das tarefas ao longo da sprint.

| Ação | Scrum Master | Dev Team |
|---|---|---|
| Criar tasks | ✅ | ❌ |
| Editar tasks | ✅ | ❌ |
| Excluir tasks | ✅ | ❌ |
| Mover tasks entre colunas | ✅ | ✅ |

**Somente o Scrum Master (Nicolas Kauê) pode criar, editar ou excluir tarefas no quadro.**

O Dev Team (Bruna, Pedro, Ryan e Suelen) deve **apenas mover os cards** conforme o andamento do desenvolvimento, sem alterar o conteúdo das tarefas.

Caso alguma tarefa precise ser criada, alterada ou removida, o membro do time deve **comunicar o Scrum Master**, que avaliará e realizará a ação.

---

## Como Mover uma Tarefa (Dev Team)

1. Acesse a aba **Projects** no repositório
2. Abra o quadro da sprint atual
3. Localize o card da sua tarefa
4. Arraste o card para a coluna correspondente ao andamento

**Exemplo prático:**
- Você iniciou o desenvolvimento da funcionalidade de login → mova o card para `In Progress`
- Você abriu o Pull Request → mova o card para `In Review`
- O PR foi aprovado e mergeado → mova o card para `Done`

---

## Vinculando Tasks às Issues e Branches

> 💡 **Nota:** Nem toda task precisa ter uma Issue vinculada.
> A Issue é criada apenas quando há algo a ser comunicado ou rastreado — como um bug, impedimento ou ponto de atenção.
> Tasks de desenvolvimento padrão não exigem vínculo obrigatório com uma Issue.

### Fluxo completo — task com Issue vinculada

Para tasks que originaram de um relato, bug ou ponto de atenção registrado no Issues:

```
Card no Kanban
     │
     ▼
  Issue criada (pelo SM)
     │
     ▼
  Branch feature/ criada a partir da develop
     │
     ▼
  Desenvolvimento e commits
     │
     ▼
  Pull Request aberto → card vai para In Review
     │
     ▼
  PR aprovado e mergeado → card vai para Done
                        → Issue fechada automaticamente
```

### Fluxo completo — task sem Issue vinculada

Para tasks de desenvolvimento padrão do backlog:

```
Card no Kanban
     │
     ▼
  Branch feature/ criada a partir da develop
     │
     ▼
  Desenvolvimento e commits
     │
     ▼
  Pull Request aberto → card vai para In Review
     │
     ▼
  PR aprovado e mergeado → card vai para Done
```

### Fechando a Issue automaticamente pelo PR

Quando a task tiver uma Issue vinculada, mencione o número dela na descrição do Pull Request:

```
Closes #12
```

Quando o PR for mergeado, a Issue será fechada automaticamente pelo GitHub.

---

## Convenção de Nomenclatura das Tasks

Para manter o quadro organizado e de fácil leitura, siga o padrão abaixo ao nomear as tarefas:

| Tipo | Padrão | Exemplo |
|---|---|---|
| Funcionalidade | `[FEAT] descrição` | `[FEAT] Autenticação com JWT` |
| Correção | `[FIX] descrição` | `[FIX] Erro na validação de e-mail` |
| Documentação | `[DOCS] descrição` | `[DOCS] Diagrama de Classes` |
| Configuração | `[CHORE] descrição` | `[CHORE] Configurar Docker Compose` |

---

## Resumo de Responsabilidades

**Scrum Master — Nicolas Kauê**
- Criar e manter o quadro de cada sprint
- Adicionar, editar e excluir tasks
- Garantir que o quadro reflita o estado real do projeto

**Dev Team — Bruna, Pedro, Ryan, Suelen**
- Mover os cards conforme o andamento do desenvolvimento
- Comunicar o SM caso alguma tarefa precise ser criada ou alterada
- Manter o quadro atualizado durante toda a sprint

**Product Owner — Bruno Berval**
- Acompanhar o quadro para validar o andamento das entregas
- Priorizar os itens do Product Backlog junto ao SM