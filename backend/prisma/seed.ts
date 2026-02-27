import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  await prisma.lancamento.deleteMany();
  await prisma.obrigacaoFiscal.deleteMany();
  await prisma.tarefa.deleteMany();
  await prisma.contadorCliente.deleteMany();
  await prisma.sessao.deleteMany();
  await prisma.cliente.deleteMany();
  await prisma.contador.deleteMany();

  const senhaHash = await bcrypt.hash("senha123456", 12);
  const contador = await prisma.contador.create({
    data: {
      nome: "Joao Silva CRC",
      email: "contador@contai.com.br",
      senhaHash,
      crc: "CRC/SP-123456",
      telefone: "(11) 99999-9999",
    },
  });

  const clientes = [
    { nomeEmpresa: "Tech Solucoes Ltda", cnpj: "12.345.678/0001-99", email: "financeiro@techsolucoes.com", nomeResponsavel: "Maria Oliveira", statusContabil: "EM_DIA" as const, fat: 85000, desp: 32000 },
    { nomeEmpresa: "Padaria Dona Ana ME", cnpj: "23.456.789/0001-11", email: "donaana@padaria.com", nomeResponsavel: "Ana Santos", statusContabil: "PENDENTE" as const, fat: 28000, desp: 19000 },
    { nomeEmpresa: "Construtora Rio Branco", cnpj: "34.567.890/0001-22", email: "admin@riobranco.com.br", nomeResponsavel: "Carlos Branco", statusContabil: "ATRASADO" as const, fat: 320000, desp: 290000 },
    { nomeEmpresa: "Clinica Saude Total", cnpj: "45.678.901/0001-33", email: "clinica@saudetotal.com", nomeResponsavel: "Dra. Patricia Faria", statusContabil: "EM_DIA" as const, fat: 95000, desp: 41000 },
    { nomeEmpresa: "Comercio Geral Alpha", cnpj: "56.789.012/0001-44", email: "alpha@comercio.com", nomeResponsavel: "Roberto Lima", statusContabil: "PENDENTE" as const, fat: 67000, desp: 58000 },
  ];

  for (const c of clientes) {
    const cliente = await prisma.cliente.create({
      data: {
        nomeEmpresa: c.nomeEmpresa,
        cnpj: c.cnpj,
        email: c.email,
        nomeResponsavel: c.nomeResponsavel,
        statusContabil: c.statusContabil,
        regimeTributario: "SIMPLES_NACIONAL",
        telefone: "(11) 3333-4444",
        contadores: {
          create: { contadorId: contador.id, permissao: "EDITAR" },
        },
      },
    });

    const now = new Date();

    for (let m = 0; m < 6; m++) {
      const data = new Date(now.getFullYear(), now.getMonth() - m, 1);
      const variacao = 0.85 + Math.random() * 0.3;

      await prisma.lancamento.create({
        data: {
          clienteId: cliente.id,
          tipo: "RECEITA",
          categoria: "Vendas",
          descricao: `Faturamento ${data.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}`,
          valor: Math.round(c.fat * variacao),
          dataCompetencia: data,
          status: m === 0 ? "PENDENTE" : "PAGO",
        },
      });

      await prisma.lancamento.create({
        data: {
          clienteId: cliente.id,
          tipo: "DESPESA",
          categoria: "Operacional",
          descricao: `Despesas ${data.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}`,
          valor: Math.round(c.desp * variacao),
          dataCompetencia: data,
          status: m === 0 ? "PENDENTE" : "PAGO",
        },
      });

      await prisma.lancamento.create({
        data: {
          clienteId: cliente.id,
          tipo: "DESPESA",
          categoria: "Folha de Pagamento",
          descricao: `Salarios ${data.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}`,
          valor: Math.round(c.desp * 0.4 * variacao),
          dataCompetencia: data,
          status: m === 0 ? "PENDENTE" : "PAGO",
        },
      });
    }

    const now2 = new Date();
    const venc = [
      { tipo: "DARF IRPJ", descricao: "Imposto de Renda PJ", dias: 5 },
      { tipo: "GUIA INSS", descricao: "INSS Competencia", dias: 10 },
      { tipo: "SPED Fiscal", descricao: "EFD ICMS/IPI", dias: 20 },
    ];

    for (const ob of venc) {
      await prisma.obrigacaoFiscal.create({
        data: {
          clienteId: cliente.id,
          tipo: ob.tipo,
          descricao: ob.descricao,
          dataVencimento: new Date(now2.getFullYear(), now2.getMonth(), ob.dias),
          status: Math.random() > 0.5 ? "PENDENTE" : "PAGO",
        },
      });
    }

    const tarefas = [
      { titulo: "Fechar balancete mensal", prioridade: "ALTA" as const, status: "EM_ANDAMENTO" as const },
      { titulo: "Enviar DCTF", prioridade: "URGENTE" as const, status: "BACKLOG" as const },
      { titulo: "Conciliar extrato bancario", prioridade: "MEDIA" as const, status: "REVISAO" as const },
      { titulo: "Emitir guias de impostos", prioridade: "ALTA" as const, status: "BACKLOG" as const },
      { titulo: "Revisar notas fiscais", prioridade: "MEDIA" as const, status: "CONCLUIDA" as const },
    ];

    for (const t of tarefas) {
      await prisma.tarefa.create({
        data: {
          clienteId: cliente.id,
          contadorId: contador.id,
          titulo: t.titulo,
          prioridade: t.prioridade,
          status: t.status,
        },
      });
    }
  }

  console.log("✅ Seed completo!");
  console.log("📧 Login: contador@contai.com.br");
  console.log("🔑 Senha: senha123456");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());