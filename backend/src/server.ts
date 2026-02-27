import Fastify from "fastify";
import cors from "@fastify/cors";
import cookie from "@fastify/cookie";
import jwt from "@fastify/jwt";
import rateLimit from "@fastify/rate-limit";
import dotenv from "dotenv";
import { authRoutes } from "./modules/auth/auth.routes";
import { clienteRoutes } from "./modules/cliente/cliente.routes";
import { financeiroRoutes } from "./modules/financeiro/financeiro.routes";
import { tarefaRoutes } from "./modules/tarefa/tarefa.routes";
import { obrigacaoRoutes } from "./modules/obrigacao/obrigacao.routes";
import { contadorRoutes } from "./modules/contador/contador.routes";
import { prismaPlugin } from "./plugins/prisma";

dotenv.config();

const app = Fastify({
  logger: {
    transport:
      process.env.NODE_ENV === "development"
        ? { target: "pino-pretty", options: { colorize: true } }
        : undefined,
  },
});

async function bootstrap() {
  // ─── Plugins ─────────────────────────────────────────────────────────────
  await app.register(cors, {
    origin: process.env.FRONTEND_URL ?? "http://localhost:3000",
    credentials: true,
  });

  await app.register(cookie, {
    secret: process.env.COOKIE_SECRET ?? "cookie-secret-change-me",
  });

  await app.register(jwt, {
    secret: process.env.JWT_SECRET ?? "jwt-secret-change-me",
    sign: { expiresIn: "15m" },
  });

  await app.register(rateLimit, {
    max: 100,
    timeWindow: "1 minute",
    errorResponseBuilder: () => ({
      statusCode: 429,
      error: "Too Many Requests",
      message: "Muitas requisições. Tente novamente em breve.",
    }),
  });

  await app.register(prismaPlugin);

  // ─── Routes ──────────────────────────────────────────────────────────────
  await app.register(authRoutes, { prefix: "/api/auth" });
  await app.register(contadorRoutes, { prefix: "/api/contador" });
  await app.register(clienteRoutes, { prefix: "/api/clientes" });
  await app.register(financeiroRoutes, { prefix: "/api" });
  await app.register(tarefaRoutes, { prefix: "/api" });
  await app.register(obrigacaoRoutes, { prefix: "/api" });

  // ─── Health check ─────────────────────────────────────────────────────────
  app.get("/health", async () => ({ status: "ok", timestamp: new Date().toISOString() }));

  // ─── Error handler ────────────────────────────────────────────────────────
  app.setErrorHandler((error, _req, reply) => {
    app.log.error(error);
    const statusCode = error.statusCode ?? 500;
    reply.status(statusCode).send({
      error: error.name ?? "Error",
      message: error.message ?? "Erro interno do servidor",
      statusCode,
    });
  });

  const port = Number(process.env.PORT ?? 3001);
  await app.listen({ port, host: "0.0.0.0" });
  console.log(`🚀 ContAI API rodando em http://localhost:${port}`);
}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
