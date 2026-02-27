import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { authenticate, authorizeCliente } from "../../middleware/authenticate";

const createClienteSchema = z.object({
  nomeEmpresa: z.string().min(2),
  cnpj: z.string().min(14),
  regimeTributario: z.enum(["SIMPLES_NACIONAL", "LUCRO_PRESUMIDO", "LUCRO_REAL", "MEI"]).default("SIMPLES_NACIONAL"),
  nomeResponsavel: z.string(),
  email: z.string().email(),
  telefone: z.string().optional(),
  endereco: z.string().optional(),
});

export async function clienteRoutes(app: FastifyInstance) {
  const preHandler = [authenticate];

  // GET /api/clientes
  app.get("/", { preHandler }, async (req) => {
    const contadorId = (req.user as { id: string }).id;
    const query = req.query as {
      search?: string;
      status?: string;
      sort?: string;
      page?: string;
      limit?: string;
    };

    const page = Number(query.page ?? 1);
    const limit = Math.min(Number(query.limit ?? 20), 100);
    const skip = (page - 1) * limit;

    const where: any = {
      contadores: { some: { contadorId, ativo: true } },
      ativo: true,
    };

    if (query.search) {
      where.OR = [
        { nomeEmpresa: { contains: query.search, mode: "insensitive" } },
        { cnpj: { contains: query.search } },
      ];
    }

    if (query.status && query.status !== "") {
      where.statusContabil = query.status.toUpperCase();
    }

    const orderMap: Record<string, any> = {
      nome_asc:         { nomeEmpresa: "asc" },
      nome_desc:        { nomeEmpresa: "desc" },
      status:           { statusContabil: "asc" },
      faturamento_desc: { nomeEmpresa: "asc" },
      faturamento_asc:  { nomeEmpresa: "asc" },
    };
    const orderBy = orderMap[query.sort ?? "nome_asc"] ?? { nomeEmpresa: "asc" };

    const now = new Date();
    const inicioMesAtual = new Date(now.getFullYear(), now.getMonth(), 1);
    const inicioMesAnterior = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const [clientes, total] = await Promise.all([
      app.prisma.cliente.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          lancamentos: {
            where: {
              dataCompetencia: {
                gte: inicioMesAnterior,
                lte: inicioMesAtual,
              },
            },
            select: { tipo: true, valor: true },
          },
          tarefas: {
            where: { status: { in: ["BACKLOG", "EM_ANDAMENTO", "REVISAO"] } },
            select: { id: true },
          },
        },
      }),
      app.prisma.cliente.count({ where }),
    ]);

    const data = clientes.map((c) => {
      const receitas = c.lancamentos
        .filter((l) => l.tipo === "RECEITA")
        .reduce((s, l) => s + Number(l.valor), 0);
      const despesas = c.lancamentos
        .filter((l) => l.tipo === "DESPESA")
        .reduce((s, l) => s + Number(l.valor), 0);
      const lucro = receitas - despesas;
      const margem = receitas > 0 ? (lucro / receitas) * 100 : 0;
      const saude = Math.min(5, Math.max(0, Math.round(margem / 10)));

      return {
        id: c.id,
        nomeEmpresa: c.nomeEmpresa,
        cnpj: c.cnpj,
        statusContabil: c.statusContabil.toLowerCase(),
        faturamentoMensal: receitas,
        lucroMensal: lucro,
        margemLucro: margem,
        indicadorSaude: saude,
        pendencias: c.tarefas.length,
      };
    });

    return {
      data,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      meta: {
        totalPendentes: clientes.filter(c => c.statusContabil === "PENDENTE").length,
        totalAtrasados: clientes.filter(c => c.statusContabil === "ATRASADO").length,
      },
    };
  });

  // POST /api/clientes
  app.post("/", { preHandler }, async (req, reply) => {
    const contadorId = (req.user as { id: string }).id;
    const body = createClienteSchema.parse(req.body);

    const cliente = await app.prisma.cliente.create({
      data: {
        ...body,
        contadores: {
          create: { contadorId, permissao: "ADMIN" },
        },
      },
    });

    return reply.status(201).send(cliente);
  });

  // GET /api/clientes/:id
  app.get<{ Params: { id: string } }>("/:id", {
    preHandler: [authenticate, authorizeCliente],
  }, async (req) => {
    return app.prisma.cliente.findUniqueOrThrow({
      where: { id: req.params.id },
      select: {
        id: true, nomeEmpresa: true, cnpj: true, email: true,
        telefone: true, nomeResponsavel: true, regimeTributario: true,
        statusContabil: true, observacoes: true, criadoEm: true,
      },
    });
  });

  // GET /api/clientes/:id/resumo
  app.get<{ Params: { id: string } }>("/:id/resumo", {
    preHandler: [authenticate, authorizeCliente],
  }, async (req) => {
    const clienteId = req.params.id;
    const now = new Date();
    const mesAtual = new Date(now.getFullYear(), now.getMonth(), 1);
    const mesAnterior = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const fimMesAnterior = new Date(now.getFullYear(), now.getMonth(), 0);

    const [atual, anterior] = await Promise.all([
      app.prisma.lancamento.groupBy({
        by: ["tipo"],
        where: { clienteId, dataCompetencia: { gte: mesAtual } },
        _sum: { valor: true },
      }),
      app.prisma.lancamento.groupBy({
        by: ["tipo"],
        where: { clienteId, dataCompetencia: { gte: mesAnterior, lte: fimMesAnterior } },
        _sum: { valor: true },
      }),
    ]);

    function calc(data: typeof atual) {
      const fat = data.find(d => d.tipo === "RECEITA")?._sum.valor ?? 0;
      const desp = data.find(d => d.tipo === "DESPESA")?._sum.valor ?? 0;
      return { faturamento: Number(fat), despesas: Number(desp), lucro: Number(fat) - Number(desp) };
    }

    const a = calc(atual);
    const ant = calc(anterior);

    return {
      faturamentoMensal: a.faturamento,
      despesasMensais: a.despesas,
      lucroMensal: a.lucro,
      margemLucro: a.faturamento > 0 ? (a.lucro / a.faturamento) * 100 : 0,
      faturamentoMesAnterior: ant.faturamento,
      despesasMesAnterior: ant.despesas,
      lucroMesAnterior: ant.lucro,
    };
  });

  // PATCH /api/clientes/:id
  app.patch<{ Params: { id: string } }>("/:id", {
    preHandler: [authenticate, authorizeCliente],
  }, async (req) => {
    const data = req.body as Record<string, unknown>;
    return app.prisma.cliente.update({
      where: { id: req.params.id },
      data,
    });
  });

  // DELETE /api/clientes/:id
  app.delete<{ Params: { id: string } }>("/:id", {
    preHandler: [authenticate, authorizeCliente],
  }, async (req, reply) => {
    await app.prisma.cliente.update({
      where: { id: req.params.id },
      data: { ativo: false },
    });
    return reply.status(204).send();
  });
}