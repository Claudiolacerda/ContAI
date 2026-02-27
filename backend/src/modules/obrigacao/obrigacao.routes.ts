import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { authenticate, authorizeCliente } from "../../middleware/authenticate";

export async function obrigacaoRoutes(app: FastifyInstance) {
  // GET /api/clientes/:id/obrigacoes
  app.get<{ Params: { id: string } }>("/clientes/:id/obrigacoes", {
    preHandler: [authenticate, authorizeCliente],
  }, async (req) => {
    const clienteId = req.params.id;
    const { status, limit = "50" } = req.query as { status?: string; limit?: string };

    const where: any = { clienteId };
    if (status) where.status = status.toUpperCase();

    return app.prisma.obrigacaoFiscal.findMany({
      where,
      orderBy: { dataVencimento: "asc" },
      take: Number(limit),
    });
  });

  // POST /api/clientes/:id/obrigacoes
  const obrigacaoSchema = z.object({
    tipo: z.string(),
    descricao: z.string(),
    dataVencimento: z.string(),
    valor: z.number().optional(),
    status: z.enum(["PENDENTE", "PAGO", "ATRASADO", "DISPENSADO"]).default("PENDENTE"),
    observacoes: z.string().optional(),
  });

  app.post<{ Params: { id: string } }>("/clientes/:id/obrigacoes", {
    preHandler: [authenticate, authorizeCliente],
  }, async (req, reply) => {
    const clienteId = req.params.id;
    const body = obrigacaoSchema.parse(req.body);

    const ob = await app.prisma.obrigacaoFiscal.create({
      data: {
        ...body,
        clienteId,
        dataVencimento: new Date(body.dataVencimento),
      },
    });

    return reply.status(201).send(ob);
  });

  // PATCH /api/obrigacoes/:id
  app.patch<{ Params: { id: string } }>("/obrigacoes/:id", {
    preHandler: [authenticate],
  }, async (req) => {
    const body = req.body as { status?: string; guiaGerada?: boolean; valor?: number };
    return app.prisma.obrigacaoFiscal.update({
      where: { id: req.params.id },
      data: body,
    });
  });
  app.get("/obrigacoes", {
    preHandler: [authenticate],
  }, async (req) => {
    const { mes } = req.query as { mes?: string };
    const { id: contadorId } = req.user as { id: string };
    const where: any = {};
    if (mes) {
      const [ano, m] = mes.split("-").map(Number);
      where.dataVencimento = {
        gte: new Date(ano, m - 1, 1),
        lt: new Date(ano, m, 1),
      };
    }
    const clientesDoContador = await app.prisma.contadorCliente.findMany({
      where: { contadorId, ativo: true },
      select: { clienteId: true },
    });
    const clienteIds = clientesDoContador.map((c: { clienteId: string }) => c.clienteId);
    where.clienteId = { in: clienteIds };
    return app.prisma.obrigacaoFiscal.findMany({
      where,
      orderBy: { dataVencimento: "asc" },
      include: { cliente: { select: { nomeEmpresa: true } } },
    });
  });
}