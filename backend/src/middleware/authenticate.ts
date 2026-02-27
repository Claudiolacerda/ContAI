import type { FastifyRequest, FastifyReply } from "fastify";

export async function authenticate(req: FastifyRequest, reply: FastifyReply) {
  try {
    await req.jwtVerify();
  } catch {
    reply.status(401).send({ error: "Não autorizado", message: "Token inválido ou expirado" });
  }
}

export async function authorizeCliente(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
  const contadorId = (req.user as { id: string }).id;
  const clienteId = req.params.id;

  const vinculo = await (req.server as any).prisma.contadorCliente.findFirst({
    where: { contadorId, clienteId, ativo: true },
  });

  if (!vinculo) {
    reply.status(403).send({ error: "Acesso negado", message: "Você não tem acesso a este cliente" });
  }
}
