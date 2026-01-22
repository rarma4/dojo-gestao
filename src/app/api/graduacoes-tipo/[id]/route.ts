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
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    await prisma.graduacaoTipo.delete({
      where: { id },
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
