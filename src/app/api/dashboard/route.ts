import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { StatusMensalidade } from "@/generated/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    // Total de alunos
    const totalAlunos = await prisma.aluno.count({
      where: { ativo: true },
    });

    // Alunos ativos
    const alunosAtivos = await prisma.aluno.count({
      where: {
        ativo: true,
        statusMensalidade: StatusMensalidade.EM_DIA,
      },
    });

    // Mensalidades em atraso
    const mensalidadesEmAtraso = await prisma.aluno.count({
      where: {
        ativo: true,
        statusMensalidade: StatusMensalidade.ATRASADA,
      },
    });

    // Receita mensal - soma das mensalidades pagas dos alunos que estão em dia
    // Buscar a última mensalidade de cada aluno que está em dia
    const alunosEmDia = await prisma.aluno.findMany({
      where: {
        ativo: true,
        statusMensalidade: StatusMensalidade.EM_DIA,
      },
      select: {
        id: true,
      },
    });

    // Buscar a mensalidade mais recente de cada aluno em dia
    const mensalidadesRecentes = await Promise.all(
      alunosEmDia.map(async (aluno) => {
        return await prisma.mensalidade.findFirst({
          where: { alunoId: aluno.id },
          orderBy: { dataPagamento: 'desc' },
          select: { valorPago: true },
        });
      })
    );

    const receitaMensal = mensalidadesRecentes.reduce(
      (total, mensalidade) => total + (mensalidade?.valorPago || 0),
      0
    );

    // Alunos por modalidade
    const alunosPorModalidade = await prisma.modalidade.findMany({
      select: {
        id: true,
        nome: true,
        _count: {
          select: {
            alunos: {
              where: { ativo: true },
            },
          },
        },
      },
      orderBy: {
        nome: "asc",
      },
    });

    // Graduações recentes (últimos 30 dias)
    const trintaDiasAtras = new Date();
    trintaDiasAtras.setDate(trintaDiasAtras.getDate() - 30);

    const graduacoesRecentes = await prisma.graduacao.findMany({
      where: {
        dataGraduacao: {
          gte: trintaDiasAtras,
        },
      },
      include: {
        aluno: true,
        graduacaoTipo: true,
        professor: true,
      },
      orderBy: {
        dataGraduacao: "desc",
      },
      take: 10,
    });

    // Próximos vencimentos (próximos 7 dias)
    const seteDiasFuturo = new Date();
    seteDiasFuturo.setDate(seteDiasFuturo.getDate() + 7);

    const proximosVencimentos = await prisma.aluno.findMany({
      where: {
        ativo: true,
        proximoVencimento: {
          lte: seteDiasFuturo,
          gte: new Date(),
        },
      },
      include: {
        modalidade: true,
      },
      orderBy: {
        proximoVencimento: "asc",
      },
      take: 10,
    });

    return NextResponse.json({
      totalAlunos,
      alunosAtivos,
      mensalidadesEmAtraso,
      receitaMensal: receitaMensal || 0,
      alunosPorModalidade: alunosPorModalidade.map((m) => ({
        modalidade: m.nome,
        quantidade: m._count.alunos,
      })),
      graduacoesRecentes,
      proximosVencimentos,
    });
  } catch (error) {
    console.error("Erro ao buscar estatísticas:", error);
    return NextResponse.json(
      { error: "Erro ao buscar estatísticas" },
      { status: 500 }
    );
  }
}
