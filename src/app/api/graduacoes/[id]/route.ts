import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    // Busca a graduação antes de deletar para obter o alunoId
    const graduacao = await prisma.graduacao.findUnique({
      where: { id },
      select: { alunoId: true },
    });

    if (!graduacao) {
      return NextResponse.json(
        { error: "Graduação não encontrada" },
        { status: 404 }
      );
    }

    // Deleta a graduação
    await prisma.graduacao.delete({
      where: { id },
    });

    // Atualiza a graduação atual do aluno para a mais recente restante
    const graduacaoMaisRecente = await prisma.graduacao.findFirst({
      where: { alunoId: graduacao.alunoId },
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
