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

    const graduacaoExistente = await prisma.graduacaoTipo.findFirst({
      where: { id, ownerId: authResult.userId },
      select: { id: true },
    });

    if (!graduacaoExistente) {
      return NextResponse.json(
        { error: "Graduação não encontrada" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { nome, ordem } = body;

    const graduacao = await prisma.graduacaoTipo.update({
      where: { id },
      data: {
        ...(nome && { nome }),
        ...(ordem !== undefined && { ordem }),
      },
      include: {
        modalidade: true,
      },
    });

    return NextResponse.json(graduacao);
  } catch (error: any) {
    console.error("Erro ao atualizar graduação:", error);
    
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Graduação não encontrada" },
        { status: 404 }
      );
    }

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

    const deleted = await prisma.graduacaoTipo.deleteMany({
      where: { id, ownerId: authResult.userId },
    });

    if (deleted.count === 0) {
      return NextResponse.json(
        { error: "Graduação não encontrada" },
        { status: 404 }
      );
    }

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
