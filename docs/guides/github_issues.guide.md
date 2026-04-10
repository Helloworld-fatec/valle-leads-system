# 🗂️ GitHub Issues — Guia de Comunicação do Time

Documento de referência sobre o uso do GitHub Issues como canal oficial de comunicação técnica do projeto **Valle Leads System**.

---

## O que é o GitHub Issues?

O GitHub Issues é o canal oficial de comunicação técnica do repositório. Qualquer situação que precise de atenção, discussão ou registro formal deve ser aberta como uma Issue — mantendo tudo centralizado, rastreável e documentado diretamente no repositório.

> 💡 Issues não são apenas tarefas. São o meio pelo qual o time se comunica sobre o que está acontecendo no código.

---

## Quando Abrir uma Issue?

Abra uma Issue sempre que identificar qualquer uma das situações abaixo:

| Situação | Exemplo |
|---|---|
| **Bug encontrado** | Login não está validando o e-mail corretamente |
| **Feature incompleta** | O filtro por data foi entregue, mas o filtro por loja ainda não funciona |
| **Ponto de atenção** | A query do dashboard está lenta, precisa de otimização |
| **Necessidade de manutenção** | Dependência desatualizada que pode causar problemas |
| **Dúvida técnica** | Qual a melhor abordagem para implementar o histórico de negociações? |
| **Sugestão de melhoria** | Podemos melhorar a organização da camada de serviços |
| **Impedimento** | Não consigo rodar o Docker no meu ambiente, precisa de ajuda |

---

## Por que usar Issues e não o WhatsApp ou outro canal?

| WhatsApp / Mensagens | GitHub Issues |
|---|---|
| Mensagem se perde com o tempo | Registro permanente no repositório |
| Difícil de rastrear o que foi resolvido | Pode ser aberta, acompanhada e fechada |
| Sem vínculo com o código | Pode ser vinculada a commits, PRs e branches |
| Não fica documentado | Faz parte do histórico oficial do projeto |

---

## Como Abrir uma Issue

1. Acesse a aba **Issues** no repositório
2. Clique em **New Issue**
3. Preencha os campos conforme orientado abaixo
4. Clique em **Submit new issue**

---

## Como Preencher uma Issue

### Título
Seja direto e descritivo. O título deve deixar claro o assunto sem precisar abrir a Issue.

✅ Bom: `Dashboard não carrega leads dos últimos 7 dias`

❌ Ruim: `Problema no dashboard`

---

### Descrição
Use o corpo da Issue para detalhar o contexto. Quanto mais informação, mais fácil para o time entender e agir. Sugestão de estrutura:

```
## Descrição
Explique claramente o que está acontecendo ou o que precisa de atenção.

## Como reproduzir (se for um bug)
Passo a passo para reproduzir o problema.

## Comportamento esperado
O que deveria acontecer.

## Comportamento atual
O que está acontecendo de fato.

## Observações
Qualquer informação adicional relevante (prints, logs, sugestões).
```

Para situações que não são bugs (dúvida, sugestão, ponto de atenção), basta descrever o contexto com clareza, sem precisar seguir esse template à risca.

---

### Labels (Etiquetas)
As labels categorizam a Issue e facilitam a identificação rápida. Use sempre ao menos uma:

| Label | Uso |
|---|---|
| `bug` | Algo não está funcionando como esperado |
| `enhancement` | Melhoria em algo que já existe |
| `incomplete` | Feature entregue de forma incompleta |
| `attention` | Ponto que precisa de atenção do time |
| `question` | Dúvida técnica ou discussão |
| `maintenance` | Necessidade de manutenção no código |
| `help wanted` | Membro está com impedimento e precisa de ajuda |
| `documentation` | Relacionado à documentação do projeto |

> O Scrum Master é responsável por criar e manter as labels no repositório.

---

### Assignees (Responsáveis)

A responsabilidade é de todo o time - seja quem relatou o problema ou tem um contexto para resolvê-lo.

---

### Milestone
Vincule a Issue à sprint correspondente para facilitar o acompanhamento:
- `Sprint 1`
- `Sprint 2`
- `Sprint 3`

---

## Respondendo e Acompanhando uma Issue

- Qualquer membro do time pode e deve **comentar** na Issue com informações relevantes
- Se você identificou a causa do problema, registre nos comentários
- Se a Issue gerou uma tarefa de desenvolvimento, o SM criará o card correspondente no quadro Kanban
- Quando o problema for resolvido, o responsável **fecha a Issue** com um comentário explicando o que foi feito

---

## Fechando uma Issue

Uma Issue pode ser fechada de duas formas:

**Manualmente** — clique em **Close issue** após registrar nos comentários o que foi resolvido.

**Automaticamente via PR** — se a Issue gerou uma correção no código, mencione o número dela na descrição do Pull Request:

```
Closes #8
```

Quando o PR for mergeado, a Issue é fechada automaticamente pelo GitHub.

---

## Boas Práticas

- ✅ Abra a Issue assim que identificar o problema — não espere a próxima reunião
- ✅ Sempre adicione uma label
- ✅ Seja específico no título e na descrição
- ✅ Acompanhe as Issues que você abriu
- ✅ Comente quando tiver informações novas sobre o problema
- ❌ Não feche uma Issue sem registrar o que foi feito
- ❌ Não use o WhatsApp para relatar problemas técnicos — use sempre o Issues
- 💬 O WhatsApp pode ser usado apenas para notificar o time sobre uma Issue já aberta
- ❌ Não abra Issues duplicadas — verifique se o problema já foi relatado antes

---

## Responsabilidades

**Qualquer membro do time** pode abrir, comentar e fechar Issues.

**Scrum Master — Nicolas Kauê**
- Manter as labels organizadas
- Garantir que as Issues estejam vinculadas às milestones corretas
- Criar cards no Kanban quando uma Issue gerar uma tarefa de desenvolvimento

**Dev Team — Bruna, Pedro, Ryan, Suelen**
- Abrir Issues ao identificar qualquer situação que precise de atenção
- Comentar e acompanhar as Issues relacionadas ao seu trabalho

**Product Owner — Bruno Berval**
- Acompanhar as Issues para ter visibilidade do estado real do projeto