import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const professor = await prisma.professor.findUnique({
      where: { id },
      include: {
        modalidade: true,
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    if (!professor) {
      return NextResponse.json(
        { error: "Professor não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(professor);
  } catch (error) {
    console.error("Erro ao buscar professor:", error);
    return NextResponse.json(
      { error: "Erro ao buscar professor" },
      { status: 500 }
    );
  }
}

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

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (user?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Apenas administradores podem editar professores" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { nome, telefone, email, modalidadeId, isAdmin, ativo } = body;

    const professor = await prisma.professor.update({
      where: { id },
      data: {
        ...(nome && { nome }),
        ...(telefone && { telefone }),
        ...(email && { email }),
        ...(modalidadeId && { modalidadeId }),
        ...(isAdmin !== undefined && { isAdmin }),
        ...(ativo !== undefined && { ativo }),
      },
      include: {
        modalidade: true,
      },
    });

    return NextResponse.json(professor);
  } catch (error: any) {
    console.error("Erro ao atualizar professor:", error);
    
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Já existe um professor com este email" },
        { status: 400 }
      );
    }

    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Professor não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Erro ao atualizar professor" },
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

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (user?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Apenas administradores podem deletar professores" },
        { status: 403 }
      );
    }

    await prisma.professor.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Erro ao deletar professor:", error);
    
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Professor não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Erro ao deletar professor" },
      { status: 500 }
    );
  }
}
