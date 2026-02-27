# ContAI — Plataforma de Contabilidade Inteligente

Dashboard profissional para contadores gerenciarem múltiplos clientes, acompanharem dados financeiros e controlarem o andamento contábil em tempo real.

---

## 🗂️ Estrutura do Projeto

```
contai/
├── frontend/          # Next.js 14 (App Router)
├── backend/           # Fastify + Prisma + PostgreSQL
├── docker-compose.yml # PostgreSQL + Redis locais
└── package.json       # Monorepo root
```

---

## 🚀 Setup Rápido (Desenvolvimento)

### Pré-requisitos
- Node.js 20+
- Docker + Docker Compose
- npm 9+

### 1. Clonar e instalar dependências

```bash
git clone <repo>
cd contai
npm install          # Instala dependências do monorepo
cd frontend && npm install
cd ../backend && npm install
```

### 2. Subir banco de dados e Redis

```bash
docker-compose up -d
# PostgreSQL em localhost:5432
# Redis em localhost:6379
```

### 3. Configurar variáveis de ambiente

```bash
# Backend
cp backend/.env.example backend/.env
# Edite backend/.env com suas credenciais

# Frontend
cp frontend/.env.local.example frontend/.env.local
```

### 4. Migrar banco e gerar seed

```bash
cd backend
npm run db:generate   # Gera Prisma Client
npm run db:migrate    # Aplica migrations
npm run db:seed       # Popula dados de exemplo
```

### 5. Rodar os servidores

```bash
# Terminal 1 — Backend (porta 3001)
cd backend
npm run dev

# Terminal 2 — Frontend (porta 3000)
cd frontend
npm run dev
```

### 6. Acessar

- **Frontend:** http://localhost:3000
- **API:**       http://localhost:3001/api
- **Health:**    http://localhost:3001/health
- **Prisma Studio:** `cd backend && npm run db:studio`

### Credenciais de teste (seed)

```
E-mail: contador@contai.com.br
Senha:  senha123456
```

---

## 🏗️ Arquitetura

### Frontend (Next.js 14)

```
src/
├── app/
│   ├── (auth)/login/          # Página de login
│   └── (dashboard)/
│       ├── dashboard/         # Lista de clientes
│       └── cliente/[id]/      # Página do cliente
│           ├── page.tsx       # Visão geral
│           ├── financeiro/    # Faturamento e lucro
│           ├── relatorios/    # Relatórios PDF
│           ├── calendario/    # Obrigações fiscais
│           └── andamento/     # Kanban de tarefas
├── components/
│   ├── dashboard/             # Grid, filtros, stats
│   ├── cliente/               # Header, tabs, KPIs, charts
│   ├── shared/                # Sidebar, Topbar
│   └── providers/             # React Query, Auth
├── lib/
│   ├── api-client.ts          # Axios + interceptores JWT
│   └── formatters.ts          # Moeda, data, %
└── store/
    └── auth-store.ts          # Zustand auth state
```

### Backend (Fastify)

```
src/
├── modules/
│   ├── auth/          # Login, logout, refresh token
│   ├── cliente/       # CRUD + resumo financeiro
│   ├── financeiro/    # Lançamentos, despesas
│   ├── tarefa/        # Kanban de tarefas
│   ├── obrigacao/     # Calendário fiscal
│   └── contador/      # Stats consolidados
├── plugins/
│   └── prisma.ts      # Prisma plugin para Fastify
└── middleware/
    └── authenticate.ts # JWT + autorização de cliente
```

---

## 📡 Principais Endpoints

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Perfil do contador |
| GET | `/api/clientes` | Listar clientes com KPIs |
| GET | `/api/clientes/:id/resumo` | KPIs do cliente |
| GET | `/api/clientes/:id/financeiro` | Histórico financeiro |
| GET | `/api/clientes/:id/lancamentos` | Lançamentos paginados |
| GET | `/api/clientes/:id/tarefas` | Tarefas Kanban |
| PATCH | `/api/tarefas/:id` | Mover tarefa |
| GET | `/api/clientes/:id/obrigacoes` | Calendário fiscal |
| PATCH | `/api/obrigacoes/:id` | Marcar como pago |
| GET | `/api/contador/stats` | Stats do dashboard |

---

## 🛠️ Stack Técnica

| Camada | Tecnologia |
|--------|------------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| Estado | Zustand + TanStack Query |
| Gráficos | Recharts |
| Backend | Fastify, Node.js, TypeScript |
| ORM | Prisma |
| Banco | PostgreSQL 16 |
| Cache/Queue | Redis + BullMQ |
| Auth | JWT (access 15min + refresh 7d HttpOnly) |
| Validação | Zod |

---

## 🔐 Segurança

- Senhas hasheadas com **bcrypt** (12 rounds)
- **JWT assimétrico** com access token (15min) + refresh token (7d, HttpOnly cookie)
- **Multi-tenant**: contadores só acessam seus próprios clientes
- **Rate limiting**: 100 req/min por IP
- **CORS** restrito ao domínio do frontend
- Soft delete para preservar histórico

---

## 📈 Próximos Passos

- [ ] Geração de relatórios PDF (BullMQ + Puppeteer)
- [ ] Notificações push (Web Push API)
- [ ] Upload de documentos (Cloudflare R2)
- [ ] Autenticação 2FA (TOTP)
- [ ] Exportação Excel
- [ ] API pública com OAuth para integrações
- [ ] Dashboard de BI consolidado
