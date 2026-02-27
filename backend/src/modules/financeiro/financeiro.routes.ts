import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { authenticate, authorizeCliente } from "../../middleware/authenticate";
import { subMonths, startOfMonth, endOfMonth, format } from "date-fns";

function getPeriodoRange(periodo: string) {
  const months = periodo === "3m" ? 3 : periodo === "12m" ? 12 : 6;
  const now = new Date();
  const start = startOfMonth(subMonths(now, months - 1));
  const end = endOfMonth(now);
  return { start, end, months };
}

export async function financeiroRoutes(app: FastifyInstance) {
  // GET /api/clientes/:id/financeiro
  app.get<{ Params: { id: string } }>("/clientes/:id/financeiro", {
    preHandler: [authenticate, authorizeCliente],
  }, async (req) => {
    const clienteId = req.params.id;
    const { periodo = "6m" } = req.query as { periodo?: string };
    const { start, end, months } = getPeriodoRange(periodo);

    const lancamentos = await app.prisma.lancamento.findMany({
      where: { clienteId, dataCompetencia: { gte: start, lte: end } },
      orderBy: { dataCompetencia: "asc" },
    });

    // Group by month
    const byMonth: Record<string, { faturamento: number; despesas: number; lucro: number }> = {};

    for (let i = 0; i < months; i++) {
      const monthDate = subMonths(new Date(), months - 1 - i);
      const key = format(monthDate, "MMM/yy");
      byMonth[key] = { faturamento: 0, despesas: 0, lucro: 0 };
    }

    for (const l of lancamentos) {
      const key = format(l.dataCompetencia, "MMM/yy");
      if (!byMonth[key]) byMonth[key] = { faturamento: 0, despesas: 0, lucro: 0 };
      const val = Number(l.valor);
      if (l.tipo === "RECEITA") {
        byMonth[key].faturamento += val;
        byMonth[key].lucro += val;
      } else {
        byMonth[key].despesas += val;
        byMonth[key].lucro -= val;
      }
    }

    const historico = Object.entries(byMonth).map(([mes, vals]) => ({ mes, ...vals }));

    const totais = {
      faturamento: historico.reduce((s, m) => s + m.faturamento, 0),
      despesas:    historico.reduce((s, m) => s + m.despesas, 0),
      lucro:       historico.reduce((s, m) => s + m.lucro, 0),
    };

    return { historico, totais };
  });

  // GET /api/clientes/:id/lancamentos
  app.get<{ Params: { id: string } }>("/clientes/:id/lancamentos", {
    preHandler: [authenticate, authorizeCliente],
  }, async (req) => {
    const clienteId = req.params.id;
    const { periodo = "6m", page = "1", limit = "20" } = req.query as Record<string, string>;
    const { start, end } = getPeriodoRange(periodo);
    const skip = (Number(page) - 1) * Number(limit);

    const [data, total] = await Promise.all([
      app.prisma.lancamento.findMany({
        where: { clienteId, dataCompetencia: { gte: start, lte: end } },
        orderBy: { dataCompetencia: "desc" },
        skip,
        take: Number(limit),
      }),
      app.prisma.lancamento.count({
        where: { clienteId, dataCompetencia: { gte: start, lte: end } },
      }),
    ]);

    return { data, pagination: { page: Number(page), total } };
  });

  // GET /api/clientes/:id/despesas (by category)
  app.get<{ Params: { id: string } }>("/clientes/:id/despesas", {
    preHandler: [authenticate, authorizeCliente],
  }, async (req) => {
    const clienteId = req.params.id;
    const { periodo = "6m" } = req.query as { periodo?: string };
    const { start, end } = getPeriodoRange(periodo);

    const result = await app.prisma.lancamento.groupBy({
      by: ["categoria"],
      where: { clienteId, tipo: "DESPESA", dataCompetencia: { gte: start, lte: end } },
      _sum: { valor: true },
      orderBy: { _sum: { valor: "desc" } },
    });

    return {
      categorias: result.map(r => ({
        categoria: r.categoria,
        valor: Number(r._sum.valor ?? 0),
      })),
    };
  });

  // POST /api/clientes/:id/lancamentos
  const lancamentoSchema = z.object({
    tipo: z.enum(["RECEITA", "DESPESA"]),
    categoria: z.string(),
    descricao: z.string(),
    valor: z.number().positive(),
    dataCompetencia: z.string(),
    dataVencimento: z.string().optional(),
    status: z.enum(["PAGO", "PENDENTE", "VENCIDO"]).default("PENDENTE"),
    notaFiscal: z.string().optional(),
    observacoes: z.string().optional(),
  });

  app.post<{ Params: { id: string } }>("/clientes/:id/lancamentos", {
    preHandler: [authenticate, authorizeCliente],
  }, async (req, reply) => {
    const clienteId = req.params.id;
    const body = lancamentoSchema.parse(req.body);

    const lancamento = await app.prisma.lancamento.create({
      data: {
        ...body,
        clienteId,
        dataCompetencia: new Date(body.dataCompetencia),
        dataVencimento: body.dataVencimento ? new Date(body.dataVencimento) : undefined,
      },
    });

    return reply.status(201).send(lancamento);
  });
}
