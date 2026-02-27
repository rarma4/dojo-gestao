import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/tenant";

export async function GET(request: NextRequest) {
  try {
    const authResult = await getAuthenticatedUser(request);
    if ("response" in authResult) return authResult.response;

    const { searchParams } = new URL(request.url);
    const tipo = searchParams.get("tipo") || "todos";
    const mes = parseInt(searchParams.get("mes") || String(new Date().getMonth() + 1));
    const ano = parseInt(searchParams.get("ano") || String(new Date().getFullYear()));
    const modalidadeId = searchParams.get("modalidadeId") || "todos";

    // Definir o primeiro e último dia do mês
    const startDate = new Date(ano, mes - 1, 1);
    const endDate = new Date(ano, mes, 0, 23, 59, 59, 999);

    let data: any[] = [];
    let summary = {
      totalMensalidades: 0,
      mensalidadesPagas: 0,
      mensalidadesPendentes: 0,
      totalGraduacoes: 0,
      valorTotal: 0,
    };

    // Buscar mensalidades
    if (tipo === "todos" || tipo === "mensalidade") {
      const whereClause: any = {
        ownerId: authResult.userId,
        dataPagamento: {
          gte: startDate,
          lte: endDate,
        },
      };

      if (modalidadeId !== "todos") {
        whereClause.aluno = {
          modalidadeId: modalidadeId,
        };
      }

      const mensalidades = await prisma.mensalidade.findMany({
        where: whereClause,
        include: {
          aluno: {
            include: {
              modalidade: true,
            },
          },
        },
        orderBy: {
          dataPagamento: "desc",
        },
      });

      const mensalidadesData = mensalidades.map((m) => ({
        id: m.id,
        tipo: "mensalidade" as const,
        aluno: m.aluno.nome,
        modalidade: m.aluno.modalidade.nome,
        data: m.dataPagamento.toISOString(),
        valor: m.valorPago,
        status: new Date(m.proximoVencimento) < new Date() && m.aluno.statusMensalidade === "ATRASADA" ? "PENDENTE" : "PAGO",
      }));

      data.push(...mensalidadesData);

      summary.totalMensalidades = mensalidades.length;
      summary.mensalidadesPagas = mensalidadesData.filter(m => m.status === "PAGO").length;
      summary.mensalidadesPendentes = mensalidadesData.filter(m => m.status === "PENDENTE").length;
      summary.valorTotal = mensalidades.reduce((sum, m) => sum + m.valorPago, 0);
    }

    // Buscar graduações
    if (tipo === "todos" || tipo === "graduacao") {
      const whereClause: any = {
        ownerId: authResult.userId,
        dataGraduacao: {
          gte: startDate,
          lte: endDate,
        },
      };

      if (modalidadeId !== "todos") {
        whereClause.aluno = {
          modalidadeId: modalidadeId,
        };
      }

      const graduacoes = await prisma.graduacao.findMany({
        where: whereClause,
        include: {
          aluno: {
            include: {
              modalidade: true,
            },
          },
          graduacaoTipo: true,
          professor: true,
        },
        orderBy: {
          dataGraduacao: "desc",
        },
      });

      // Para cada graduação, buscar a graduação anterior
      const graduacoesData = await Promise.all(
        graduacoes.map(async (g) => {
          // Buscar graduação anterior do aluno
          const graduacaoAnterior = await prisma.graduacao.findFirst({
            where: {
              ownerId: authResult.userId,
              alunoId: g.alunoId,
              dataGraduacao: {
                lt: g.dataGraduacao,
              },
            },
            include: {
              graduacaoTipo: true,
            },
            orderBy: {
              dataGraduacao: "desc",
            },
          });

          return {
            id: g.id,
            tipo: "graduacao" as const,
            aluno: g.aluno.nome,
            modalidade: g.aluno.modalidade.nome,
            data: g.dataGraduacao.toISOString(),
            valor: g.valorPago,
            graduacaoNome: g.graduacaoTipo.nome,
            graduacaoAnterior: graduacaoAnterior?.graduacaoTipo.nome || "Inicial",
            status: "CONCLUÍDO",
          };
        })
      );

      data.push(...graduacoesData);

      summary.totalGraduacoes = graduacoes.length;
      if (tipo === "graduacao") {
        summary.valorTotal = graduacoes.reduce(
          (sum, g) => sum + (g.valorPago || 0),
          0
        );
      }
    }

    // Ordenar data por data decrescente
    data.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());

    return NextResponse.json({
      data,
      summary,
    });
  } catch (error) {
    console.error("Erro ao buscar relatórios:", error);
    return NextResponse.json(
      { error: "Erro ao buscar relatórios" },
      { status: 500 }
    );
  }
}
