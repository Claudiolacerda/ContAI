import type { FastifyInstance } from "fastify";
import { authenticate } from "../../middleware/authenticate";

export async function contadorRoutes(app: FastifyInstance) {
  // GET /api/contador/stats
  app.get("/stats", { preHandler: [authenticate] }, async (req) => {
    const contadorId = (req.user as { id: string }).id;

    const clientes = await app.prisma.cliente.findMany({
      where: {
        contadores: { some: { contadorId, ativo: true } },
        ativo: true,
      },
      select: {
        statusContabil: true,
        lancamentos: {
          where: {
            dataCompetencia: {
              gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            },
            tipo: "RECEITA",
          },
          select: { valor: true },
        },
      },
    });

    const totalFaturamento = clientes.reduce((sum, c) =>
      sum + c.lancamentos.reduce((s, l) => s + Number(l.valor), 0), 0);

    return {
      totalClientes: clientes.length,
      faturamentoTotal: totalFaturamento,
      clientesPendentes: clientes.filter(c => c.statusContabil === "PENDENTE").length,
      clientesAtrasados: clientes.filter(c => c.statusContabil === "ATRASADO").length,
      clientesEmDia: clientes.filter(c => c.statusContabil === "EM_DIA").length,
    };
  });

  // GET /api/contador/calendario — consolidated calendar across all clients
  app.get("/calendario", { preHandler: [authenticate] }, async (req) => {
    const contadorId = (req.user as { id: string }).id;
    const { mes } = req.query as { mes?: string };

    const clienteIds = await app.prisma.contadorCliente.findMany({
      where: { contadorId, ativo: true },
      select: { clienteId: true },
    });

    const ids = clienteIds.map(c => c.clienteId);
    const now = mes ? new Date(mes) : new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const obrigacoes = await app.prisma.obrigacaoFiscal.findMany({
      where: {
        clienteId: { in: ids },
        dataVencimento: { gte: start, lte: end },
      },
      include: {
        cliente: { select: { id: true, nomeEmpresa: true } },
      },
      orderBy: { dataVencimento: "asc" },
    });

    return obrigacoes;
  });
}
