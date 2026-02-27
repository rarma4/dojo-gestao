import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/tenant";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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

    const graduacaoExistente = await prisma.graduacao.findFirst({
      where: { id, ownerId: authResult.userId },
      select: { id: true },
    });

    if (!graduacaoExistente) {
      return NextResponse.json(
        { error: "Graduação não encontrada" },
        { status: 404 }
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

    // Atualiza a graduação
    const graduacao = await prisma.graduacao.update({
      where: { id },
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

    // Verifica se essa é a graduação mais recente do aluno e atualiza
    const graduacaoMaisRecente = await prisma.graduacao.findFirst({
      where: { alunoId },
      orderBy: { dataGraduacao: "desc" },
      select: { graduacaoTipoId: true },
    });

    if (graduacaoMaisRecente) {
      await prisma.aluno.update({
        where: { id: alunoId },
        data: {
          graduacaoAtualId: graduacaoMaisRecente.graduacaoTipoId,
        },
      });
    }

    return NextResponse.json(graduacao);
  } catch (error) {
    console.error("Erro ao atualizar graduação:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar graduação" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const authResult = await getAuthenticatedUser(request);
    if ("response" in authResult) return authResult.response;

    // Busca a graduação antes de deletar para obter o alunoId
    const graduacao = await prisma.graduacao.findFirst({
      where: { id, ownerId: authResult.userId },
      select: { alunoId: true },
    });

    if (!graduacao) {
      return NextResponse.json(
        { error: "Graduação não encontrada" },
        { status: 404 }
      );
    }

    // Deleta a graduação
    await prisma.graduacao.deleteMany({
      where: { id, ownerId: authResult.userId },
    });

    // Atualiza a graduação atual do aluno para a mais recente restante
    const graduacaoMaisRecente = await prisma.graduacao.findFirst({
      where: { alunoId: graduacao.alunoId, ownerId: authResult.userId },
      orderBy: { dataGraduacao: "desc" },
      select: { graduacaoTipoId: true },
    });

    await prisma.aluno.update({
      where: { id: graduacao.alunoId },
      data: {
        graduacaoAtualId: graduacaoMaisRecente?.graduacaoTipoId || null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Erro ao deletar graduação:", error);
    
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Graduação não encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Erro ao deletar graduação" },
      { status: 500 }
    );
  }
}
