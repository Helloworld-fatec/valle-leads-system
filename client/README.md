# 🎨 Valle Leads System — Frontend

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

---

## 📌 Objetivo

Este diretório contém a documentação técnica do frontend do sistema **Valle Leads System**.

O objetivo deste README é servir como referência para o desenvolvimento da interface, descrevendo as tecnologias utilizadas, organização das pastas, telas previstas, fluxos de navegação e integrações com a API backend.

A documentação deverá ser mantida atualizada ao longo do desenvolvimento do frontend.

---

## 🛠️ Tecnologias Utilizadas

### ⚛️ React + TypeScript
Biblioteca e linguagem utilizadas para construção da interface com tipagem estática, garantindo maior segurança e organização no desenvolvimento.

### ⚡ Vite
Ferramenta de build e ambiente de desenvolvimento rápido para aplicações frontend modernas.

### 🎨 Tailwind CSS
Framework CSS baseado em classes utilitárias, utilizado para estilização da interface de forma ágil e responsiva.

### 🧭 React Router DOM
Responsável pelo gerenciamento de rotas e navegação entre as telas da aplicação.

### 🌐 Axios / Fetch
Utilizado para comunicação com a API backend, enviando e recebendo dados do sistema.

### 📊 Recharts / Chart.js
Bibliotecas para construção de gráficos e indicadores nos dashboards do sistema.

---

## ▶️ Como Rodar o Projeto

### Pré-requisitos
- Node.js instalado
- npm instalado

### Instalação

```bash
git clone https://github.com/Helloworld-fatec/valle-leads-system.git
cd valle-leads-system/client
npm install
```

### Variáveis de ambiente

Crie um arquivo `.env` na raiz da pasta `client` com a variável:

```env
VITE_API_URL=http://localhost:3000
```

### Executar o projeto

```bash
npm run dev
```

---

## 📁 Estrutura de Pastas

```bash
client/
├── src/
│   ├── components/   # Componentes reutilizáveis
│   ├── pages/        # Telas principais do sistema
│   ├── layouts/      # Estruturas como Sidebar, Header e Shell
│   ├── hooks/        # Hooks customizados
│   ├── services/     # Comunicação com a API
│   ├── contexts/     # Contextos globais
│   ├── types/        # Tipagens TypeScript
│   ├── utils/        # Funções auxiliares
│   └── routes/       # Definição de rotas
```

---

## 🧾 Documentação das Telas

Abaixo estão descritas as principais telas previstas para o sistema, com suas rotas, objetivos, componentes e integrações com a API.

---

## 🖥️ T01 — Login

- **Rota:** `/login`
- **Objetivo:** Autenticar o usuário no sistema.
- **Tipo de usuário:** Público
- **Componentes utilizados:** `FormLogin`, `InputEmail`, `InputPassword`, `ButtonPrimary`
- **API chamada:** `POST /api/auth/login`

### Funcionalidades
- Inserção de e-mail e senha
- Validação dos campos
- Envio das credenciais
- Redirecionamento após autenticação

---

## 🖥️ T02 — Solicitação de Recuperação de Senha

- **Rota:** `/forgot-password`
- **Objetivo:** Permitir que o usuário solicite redefinição de senha.
- **Tipo de usuário:** Público
- **Componentes utilizados:** `InputEmail`, `ButtonPrimary`, `FormRecovery`
- **API chamada:** `POST /api/auth/forgot-password`

### Funcionalidades
- Inserção do e-mail
- Envio da solicitação de recuperação
- Exibição de mensagem de confirmação

---

## 🖥️ T03 — Redefinição de Senha

- **Rota:** `/reset-password`
- **Objetivo:** Permitir a criação de uma nova senha.
- **Tipo de usuário:** Público
- **Componentes utilizados:** `InputPassword`, `InputConfirmPassword`, `ButtonPrimary`
- **API chamada:** `POST /api/auth/reset-password`

### Funcionalidades
- Inserção da nova senha
- Confirmação da nova senha
- Atualização da credencial de acesso

---

## 🖥️ T04 — Shell / Layout Principal

- **Rota:** `/`
- **Objetivo:** Estruturar a navegação principal do sistema.
- **Tipo de usuário:** Autenticado
- **Componentes utilizados:** `Sidebar`, `Header`, `MainContent`, `ProtectedRoute`
- **API chamada:** Não se aplica diretamente

### Funcionalidades
- Navegação lateral
- Cabeçalho do sistema
- Área principal de conteúdo
- Controle de acesso autenticado

---

## 🖥️ T05 — Dashboard do Atendente

- **Rota:** `/dashboard/atendente`
- **Objetivo:** Exibir métricas e indicadores do atendente.
- **Tipo de usuário:** Atendente
- **Componentes utilizados:** `CardMetric`, `ChartBar`, `ChartPie`, `LeadSummary`
- **API chamada:** `GET /api/dashboard/atendente`

### Funcionalidades
- Visualização de indicadores
- Acompanhamento de leads
- Exibição de gráficos

---

## 🖥️ T06 — Dashboard do Gerente

- **Rota:** `/dashboard/gerente`
- **Objetivo:** Exibir métricas gerenciais da operação.
- **Tipo de usuário:** Gerente
- **Componentes utilizados:** `CardMetric`, `ChartBar`, `ChartLine`, `TeamPerformance`
- **API chamada:** `GET /api/dashboard/gerente`

### Funcionalidades
- Indicadores de produtividade
- Desempenho da equipe
- Comparação de resultados

---

## 🖥️ T07 — Dashboard do Administrador / Gerente Geral

- **Rota:** `/dashboard/admin`
- **Objetivo:** Exibir visão geral do sistema e da operação.
- **Tipo de usuário:** Administrador / Gerente Geral
- **Componentes utilizados:** `CardMetric`, `ChartBar`, `ChartLine`, `ChartPie`, `SystemSummary`
- **API chamada:** `GET /api/dashboard/admin`

### Funcionalidades
- Visão consolidada do sistema
- Indicadores globais
- Monitoramento operacional

---

## 🖥️ T08 — Lista de Leads

- **Rota:** `/leads`
- **Objetivo:** Exibir todos os leads cadastrados.
- **Tipo de usuário:** Autenticado
- **Componentes utilizados:** `LeadTable`, `SearchInput`, `FilterBar`, `ButtonPrimary`
- **API chamada:** `GET /api/leads`

### Funcionalidades
- Listagem de leads
- Busca por nome ou status
- Aplicação de filtros
- Acesso ao detalhe do lead

---

## 🖥️ T09 — Detalhe do Lead

- **Rota:** `/leads/:id`
- **Objetivo:** Exibir informações completas de um lead.
- **Tipo de usuário:** Autenticado
- **Componentes utilizados:** `LeadDetailCard`, `LeadHistory`, `StatusBadge`, `ActionButtons`
- **API chamada:** `GET /api/leads/:id`

### Funcionalidades
- Visualização de dados do lead
- Histórico de interações
- Ações de edição e negociação

---

## 🖥️ T10 — Criar Lead

- **Rota:** `/leads/novo`
- **Objetivo:** Permitir o cadastro de um novo lead.
- **Tipo de usuário:** Autenticado
- **Componentes utilizados:** `LeadForm`, `InputText`, `SelectField`, `ButtonPrimary`
- **API chamada:** `POST /api/leads`

### Funcionalidades
- Cadastro de novo lead
- Validação dos campos
- Envio de dados para API

---

## 🖥️ T11 — Negociação / Funil

- **Rota:** `/negociacoes`
- **Objetivo:** Gerenciar o avanço dos leads no funil de vendas.
- **Tipo de usuário:** Autenticado
- **Componentes utilizados:** `KanbanBoard`, `StageColumn`, `LeadCard`, `StatusBadge`
- **API chamada:** `GET /api/negociacoes`

### Funcionalidades
- Visualização do funil
- Movimentação entre etapas
- Acompanhamento de negociação

---

## 🖥️ T12 — Lista de Clientes

- **Rota:** `/clientes`
- **Objetivo:** Exibir os clientes cadastrados.
- **Tipo de usuário:** Autenticado
- **Componentes utilizados:** `ClientTable`, `SearchInput`, `FilterBar`
- **API chamada:** `GET /api/clientes`

### Funcionalidades
- Listagem de clientes
- Busca e filtros
- Acesso ao detalhe do cliente

---

## 🖥️ T13 — Detalhe do Cliente

- **Rota:** `/clientes/:id`
- **Objetivo:** Exibir os dados completos de um cliente.
- **Tipo de usuário:** Autenticado
- **Componentes utilizados:** `ClientDetailCard`, `ContactInfo`, `HistoryPanel`
- **API chamada:** `GET /api/clientes/:id`

### Funcionalidades
- Visualização cadastral
- Histórico de relacionamento
- Informações de contato

---

## 🖥️ T14 — Lista de Usuários

- **Rota:** `/usuarios`
- **Objetivo:** Exibir os usuários cadastrados no sistema.
- **Tipo de usuário:** Administrador / Gerente
- **Componentes utilizados:** `UserTable`, `SearchInput`, `FilterBar`, `ButtonPrimary`
- **API chamada:** `GET /api/usuarios`

### Funcionalidades
- Listagem de usuários
- Filtro por perfil
- Acesso a cadastro ou edição

---

## 🖥️ T15 — Cadastro / Edição de Usuário

- **Rota:** `/usuarios/novo` ou `/usuarios/:id`
- **Objetivo:** Permitir cadastro e manutenção de usuários.
- **Tipo de usuário:** Administrador
- **Componentes utilizados:** `UserForm`, `InputText`, `SelectField`, `ButtonPrimary`
- **API chamada:** `POST /api/usuarios` / `PUT /api/usuarios/:id`

### Funcionalidades
- Cadastro de usuário
- Edição de dados
- Definição de perfil e permissões

---

## 🖥️ T16 — Lista de Equipes

- **Rota:** `/equipes`
- **Objetivo:** Exibir as equipes cadastradas.
- **Tipo de usuário:** Administrador / Gerente
- **Componentes utilizados:** `TeamTable`, `SearchInput`, `FilterBar`
- **API chamada:** `GET /api/equipes`

### Funcionalidades
- Listagem de equipes
- Busca e filtros
- Acesso ao detalhe da equipe

---

## 🖥️ T17 — Cadastro / Edição de Equipe

- **Rota:** `/equipes/nova` ou `/equipes/:id`
- **Objetivo:** Permitir cadastro e manutenção das equipes.
- **Tipo de usuário:** Administrador / Gerente
- **Componentes utilizados:** `TeamForm`, `InputText`, `SelectMembers`, `ButtonPrimary`
- **API chamada:** `POST /api/equipes` / `PUT /api/equipes/:id`

### Funcionalidades
- Cadastro de equipes
- Associação de membros
- Atualização de informações

---

## 🖥️ T18 — Logs do Sistema

- **Rota:** `/logs`
- **Objetivo:** Exibir registros de eventos e ações do sistema.
- **Tipo de usuário:** Administrador
- **Componentes utilizados:** `LogTable`, `SearchInput`, `FilterBar`, `DateFilter`
- **API chamada:** `GET /api/logs`

### Funcionalidades
- Visualização de logs
- Busca por eventos
- Filtros por data e tipo

---

## 🖥️ T19 — Meu Perfil

- **Rota:** `/perfil`
- **Objetivo:** Permitir que o usuário visualize e atualize seus próprios dados.
- **Tipo de usuário:** Autenticado
- **Componentes utilizados:** `ProfileCard`, `ProfileForm`, `AvatarUpload`, `ButtonPrimary`
- **API chamada:** `GET /api/perfil` / `PUT /api/perfil`

### Funcionalidades
- Visualização de dados pessoais
- Edição de perfil
- Atualização de senha e informações

---

## 🖥️ T20 — Página 404

- **Rota:** `*`
- **Objetivo:** Informar ao usuário que a página acessada não existe.
- **Tipo de usuário:** Todos
- **Componentes utilizados:** `ErrorMessage`, `BackButton`
- **API chamada:** Não se aplica

### Funcionalidades
- Exibição de erro de rota inexistente
- Retorno para página principal

---

## 🖥️ T21 — Página de Erro Geral / Acesso Negado

- **Rota:** `/erro` ou `/403`
- **Objetivo:** Informar falhas de acesso ou erro interno.
- **Tipo de usuário:** Todos
- **Componentes utilizados:** `ErrorCard`, `BackButton`, `RetryButton`
- **API chamada:** Não se aplica

### Funcionalidades
- Exibição de mensagem de erro
- Retorno ao fluxo principal

---

## ✏️ Croquis das Telas (Opcional)

Os croquis das telas podem ser elaborados manualmente para representar de forma visual a estrutura inicial de cada interface.

Esses rascunhos podem ser incluídos futuramente neste documento como imagens ou anexados em PDF complementar.

---

## 🔄 Fluxo de Navegação

### Fluxo de autenticação
`Login → Dashboard`

### Fluxo de leads
`Lista de Leads → Criar Lead → Detalhe do Lead → Negociação`

### Fluxo de negociação
`Detalhe do Lead → Funil de Negociação → Avançar estágio → Encerrar`

### Fluxo de clientes
`Lista de Clientes → Detalhe do Cliente`

### Fluxo administrativo
`Dashboard Administrativo → Usuários → Equipes → Logs`

### Fluxo de perfil
`Sistema → Meu Perfil → Atualização de dados`

---

## 📌 Considerações Finais

Esta documentação tem como objetivo servir como base técnica para o desenvolvimento e manutenção do frontend do sistema.

À medida que novas telas, componentes e funcionalidades forem sendo implementados, este documento deverá ser atualizado para refletir a evolução do projeto.

---