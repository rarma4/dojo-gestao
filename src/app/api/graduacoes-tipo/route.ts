import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/tenant";

export async function GET(request: NextRequest) {
  try {
    const authResult = await getAuthenticatedUser(request);
    if ("response" in authResult) return authResult.response;

    const { searchParams } = new URL(request.url);
    const modalidadeId = searchParams.get("modalidadeId");

    const where: any = {
      ownerId: authResult.userId,
    };

    if (modalidadeId) where.modalidadeId = modalidadeId;

    const graduacoes = await prisma.graduacaoTipo.findMany({
      where,
      include: {
        modalidade: true,
      },
      orderBy: [
        {
          modalidade: {
            nome: "asc",
          },
        },
        {
          ordem: "asc",
        },
      ],
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
    const { nome, ordem, modalidadeId } = body;

    if (!nome || !modalidadeId || ordem === undefined) {
      return NextResponse.json(
        { error: "Nome, modalidade e ordem são obrigatórios" },
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

    const graduacao = await prisma.graduacaoTipo.create({
      data: {
        nome,
        ordem,
        modalidadeId,
        ownerId: authResult.userId,
      },
      include: {
        modalidade: true,
      },
    });

    return NextResponse.json(graduacao, { status: 201 });
  } catch (error: any) {
    console.error("Erro ao criar graduação:", error);
    
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Já existe uma graduação com este nome nesta modalidade" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Erro ao criar graduação" },
      { status: 500 }
    );
  }
}
