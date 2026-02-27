import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/tenant";

export async function GET(request: NextRequest) {
  try {
    const authResult = await getAuthenticatedUser(request);
    if ("response" in authResult) return authResult.response;

    const { searchParams } = new URL(request.url);
    const modalidadeId = searchParams.get("modalidadeId");
    const ativo = searchParams.get("ativo");

    const where: any = { ownerId: authResult.userId };
    if (modalidadeId) where.modalidadeId = modalidadeId;
    if (ativo !== null) where.ativo = ativo === "true";

    const professores = await prisma.professor.findMany({
      where,
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
      orderBy: {
        nome: "asc",
      },
    });

    return NextResponse.json(professores);
  } catch (error) {
    console.error("Erro ao buscar professores:", error);
    return NextResponse.json(
      { error: "Erro ao buscar professores" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await getAuthenticatedUser(request);
    if ("response" in authResult) return authResult.response;

    const body = await request.json();
    const { nome, telefone, email, modalidadeId, isAdmin, ativo } = body;

    if (!nome || !telefone || !email || !modalidadeId) {
      return NextResponse.json(
        { error: "Nome, telefone, email e modalidade são obrigatórios" },
        { status: 400 }
      );
    }

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

    const professor = await prisma.professor.create({
      data: {
        nome,
        telefone,
        email,
        ownerId: authResult.userId,
        modalidadeId,
        isAdmin: isAdmin || false,
        ativo: ativo !== undefined ? ativo : true,
      },
      include: {
        modalidade: true,
      },
    });

    return NextResponse.json(professor, { status: 201 });
  } catch (error: any) {
    console.error("Erro ao criar professor:", error);
    
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Já existe um professor com este email" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Erro ao criar professor" },
      { status: 500 }
    );
  }
}
