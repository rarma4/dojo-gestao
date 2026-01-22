import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const alunoId = searchParams.get("alunoId");

    const where = alunoId ? { alunoId } : {};

    const graduacoes = await prisma.graduacao.findMany({
      where,
      include: {
        aluno: {
          include: {
            modalidade: true,
          },
        },
        graduacaoTipo: {
          include: {
            modalidade: true,
          },
        },
        professor: true,
      },
      orderBy: {
        dataGraduacao: "desc",
      },
    });

    return NextResponse.json(graduacoes);
  } catch (error) {
    console.error("Erro ao buscar graduações:", error);
    return NextResponse.json(
      { error: "Erro ao buscar graduações" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const body = await request.json();
    const { alunoId, graduacaoTipoId, professorId, dataGraduacao, valorPago } = body;

    if (!alunoId || !graduacaoTipoId || !professorId || !dataGraduacao) {
      return NextResponse.json(
        { error: "Campos obrigatórios faltando" },
        { status: 400 }
      );
    }

    // Cria o registro de graduação
    const graduacao = await prisma.graduacao.create({
      data: {
        alunoId,
        graduacaoTipoId,
        professorId,
        dataGraduacao: new Date(dataGraduacao),
        valorPago: valorPago ? parseFloat(valorPago) : null,
      },
      include: {
        aluno: true,
        graduacaoTipo: true,
        professor: true,
      },
    });

    // Atualiza a graduação atual do aluno
    await prisma.aluno.update({
      where: { id: alunoId },
      data: {
        graduacaoAtualId: graduacaoTipoId,
      },
    });

    return NextResponse.json(graduacao, { status: 201 });
  } catch (error: any) {
    console.error("Erro ao criar graduação:", error);
    return NextResponse.json(
      { error: "Erro ao criar graduação" },
      { status: 500 }
    );
  }
}
