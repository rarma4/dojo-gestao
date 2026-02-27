import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/tenant";

export async function GET(request: NextRequest) {
  try {
    const authResult = await getAuthenticatedUser(request);
    if ("response" in authResult) return authResult.response;

    const { searchParams } = new URL(request.url);
    const alunoId = searchParams.get("alunoId");

    const where: any = {
      ownerId: authResult.userId,
    };
    if (alunoId) where.alunoId = alunoId;

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
    const authResult = await getAuthenticatedUser(request);
    if ("response" in authResult) return authResult.response;

    const body = await request.json();
    const { alunoId, graduacaoTipoId, professorId, dataGraduacao, valorPago } = body;

    if (!alunoId || !graduacaoTipoId || !professorId || !dataGraduacao) {
      return NextResponse.json(
        { error: "Campos obrigatórios faltando" },
        { status: 400 }
      );
    }

    const [aluno, graduacaoTipo, professor] = await Promise.all([
      prisma.aluno.findFirst({
        where: { id: alunoId, ownerId: authResult.userId },
        select: { id: true },
      }),
      prisma.graduacaoTipo.findFirst({
        where: { id: graduacaoTipoId, ownerId: authResult.userId },
        select: { id: true },
      }),
      prisma.professor.findFirst({
        where: { id: professorId, ownerId: authResult.userId },
        select: { id: true },
      }),
    ]);

    if (!aluno || !graduacaoTipo || !professor) {
      return NextResponse.json(
        { error: "Aluno, graduação ou professor inválido" },
        { status: 400 }
      );
    }

    // Cria o registro de graduação
    const graduacao = await prisma.graduacao.create({
      data: {
        ownerId: authResult.userId,
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
