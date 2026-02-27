import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { authenticate, authorizeCliente } from "../../middleware/authenticate";

export async function tarefaRoutes(app: FastifyInstance) {
  // GET /api/clientes/:id/tarefas
  app.get<{ Params: { id: string } }>("/clientes/:id/tarefas", {
    preHandler: [authenticate, authorizeCliente],
  }, async (req) => {
    const clienteId = req.params.id;
    const { status, limit = "50" } = req.query as { status?: string; limit?: string };

    const where: any = { clienteId };
    if (status) {
      const statuses = status.split(",").map(s => s.trim().toUpperCase());
      where.status = { in: statuses };
    }

    return app.prisma.tarefa.findMany({
      where,
      orderBy: [{ prioridade: "desc" }, { criadoEm: "desc" }],
      take: Number(limit),
    });
  });

  // POST /api/clientes/:id/tarefas
  const tarefaSchema = z.object({
    titulo: z.string().min(2),
    descricao: z.string().optional(),
    status: z.enum(["BACKLOG", "EM_ANDAMENTO", "REVISAO", "CONCLUIDA"]).default("BACKLOG"),
    prioridade: z.enum(["BAIXA", "MEDIA", "ALTA", "URGENTE"]).default("MEDIA"),
    prazo: z.string().optional(),
    tags: z.array(z.string()).default([]),
  });

  app.post<{ Params: { id: string } }>("/clientes/:id/tarefas", {
    preHandler: [authenticate, authorizeCliente],
  }, async (req, reply) => {
    const contadorId = (req.user as { id: string }).id;
    const clienteId = req.params.id;
    const body = tarefaSchema.parse(req.body);

    const tarefa = await app.prisma.tarefa.create({
      data: {
        ...body,
        clienteId,
        contadorId,
        prazo: body.prazo ? new Date(body.prazo) : undefined,
      },
    });

    return reply.status(201).send(tarefa);
  });

  // PATCH /api/tarefas/:id
  app.patch<{ Params: { id: string } }>("/tarefas/:id", {
    preHandler: [authenticate],
  }, async (req, reply) => {
    const contadorId = (req.user as { id: string }).id;
    const tarefa = await app.prisma.tarefa.findFirst({
      where: { id: req.params.id, contadorId },
    });

    if (!tarefa) {
      return reply.status(404).send({ error: "Tarefa não encontrada" });
    }

    const body = req.body as { status?: string; prioridade?: string; titulo?: string };
    const concluidoEm = body.status === "CONCLUIDA" && tarefa.status !== "CONCLUIDA"
      ? new Date()
      : undefined;

    return app.prisma.tarefa.update({
      where: { id: req.params.id },
      data: { ...body, ...(concluidoEm ? { concluidoEm } : {}) },
    });
  });

  // DELETE /api/tarefas/:id
  app.delete<{ Params: { id: string } }>("/tarefas/:id", {
    preHandler: [authenticate],
  }, async (req, reply) => {
    const contadorId = (req.user as { id: string }).id;
    await app.prisma.tarefa.deleteMany({
      where: { id: req.params.id, contadorId },
    });
    return reply.status(204).send();
  });
}
