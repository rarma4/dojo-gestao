import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/tenant";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const authResult = await getAuthenticatedUser(request);
    if ("response" in authResult) return authResult.response;

    const professor = await prisma.professor.findFirst({
      where: { id, ownerId: authResult.userId },
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
    const authResult = await getAuthenticatedUser(request);
    if ("response" in authResult) return authResult.response;

    const body = await request.json();
    const { nome, telefone, email, modalidadeId, isAdmin, ativo } = body;

    const professorExistente = await prisma.professor.findFirst({
      where: { id, ownerId: authResult.userId },
      select: { id: true },
    });

    if (!professorExistente) {
      return NextResponse.json(
        { error: "Professor não encontrado" },
        { status: 404 }
      );
    }

    if (modalidadeId) {
      const modalidade = await prisma.modalidade.findFirst({
        where: { id: modalidadeId, ownerId: authResult.userId },
        select: { id: true },
      });

      if (!modalidade) {
        return NextResponse.json(
          { error: "Modalidade não encontrada" },
          { status: 404 }
        );
      }
    }

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
    const authResult = await getAuthenticatedUser(request);
    if ("response" in authResult) return authResult.response;

    const deleted = await prisma.professor.deleteMany({
      where: { id, ownerId: authResult.userId },
    });

    if (deleted.count === 0) {
      return NextResponse.json(
        { error: "Professor não encontrado" },
        { status: 404 }
      );
    }

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
