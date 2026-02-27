import type { FastifyInstance } from "fastify";
import { z } from "zod";
import bcrypt from "bcrypt";

const loginSchema = z.object({
  email: z.string().email(),
  senha: z.string().min(8),
});

export async function authRoutes(app: FastifyInstance) {
  // POST /api/auth/login
  app.post("/login", async (req, reply) => {
    const body = loginSchema.parse(req.body);

    const contador = await app.prisma.contador.findUnique({
      where: { email: body.email },
    });

    if (!contador || !contador.ativo) {
      return reply.status(401).send({ error: "Credenciais inválidas" });
    }

    const senhaValida = await bcrypt.compare(body.senha, contador.senhaHash);
    if (!senhaValida) {
      return reply.status(401).send({ error: "Credenciais inválidas" });
    }

    const accessToken = app.jwt.sign(
      { id: contador.id, email: contador.email },
      { expiresIn: "15m" }
    );

    const refreshToken = app.jwt.sign(
      { id: contador.id, type: "refresh" },
      { expiresIn: "7d" }
    );

    // Store refresh token in DB
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await app.prisma.sessao.create({
      data: { contadorId: contador.id, refreshToken, expiresAt },
    });

    // Set refresh token as HttpOnly cookie
    reply.setCookie("refresh_token", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/api/auth",
      maxAge: 7 * 24 * 60 * 60,
    });

    return reply.send({
      accessToken,
      user: {
        id: contador.id,
        nome: contador.nome,
        email: contador.email,
        crc: contador.crc,
      },
    });
  });

  // POST /api/auth/refresh
  app.post("/refresh", async (req, reply) => {
    const refreshToken = req.cookies.refresh_token;
    if (!refreshToken) {
      return reply.status(401).send({ error: "Refresh token não encontrado" });
    }

    try {
      const payload = app.jwt.verify(refreshToken) as { id: string; type: string };
      if (payload.type !== "refresh") throw new Error("Invalid token type");

      const sessao = await app.prisma.sessao.findUnique({ where: { refreshToken } });
      if (!sessao || sessao.expiresAt < new Date()) {
        return reply.status(401).send({ error: "Sessão expirada" });
      }

      const newAccessToken = app.jwt.sign(
        { id: payload.id },
        { expiresIn: "15m" }
      );

      return reply.send({ accessToken: newAccessToken });
    } catch {
      return reply.status(401).send({ error: "Token inválido" });
    }
  });

  // POST /api/auth/logout
  app.post("/logout", async (req, reply) => {
    const refreshToken = req.cookies.refresh_token;
    if (refreshToken) {
      await app.prisma.sessao.deleteMany({ where: { refreshToken } });
    }
    reply.clearCookie("refresh_token", { path: "/api/auth" });
    return reply.send({ message: "Logout realizado" });
  });

  // GET /api/auth/me
  app.get("/me", {
    preHandler: async (req, reply) => {
      try { await req.jwtVerify(); }
      catch { reply.status(401).send({ error: "Não autorizado" }); }
    },
  }, async (req) => {
    const { id } = req.user as { id: string };
    const contador = await app.prisma.contador.findUnique({
      where: { id },
      select: { id: true, nome: true, email: true, crc: true, telefone: true },
    });
    return contador;
  });
}
