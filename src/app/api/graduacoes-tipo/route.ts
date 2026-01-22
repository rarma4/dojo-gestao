import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const modalidadeId = searchParams.get("modalidadeId");

    const where = modalidadeId ? { modalidadeId } : {};

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
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const body = await request.json();
    const { nome, ordem, modalidadeId } = body;

    if (!nome || !modalidadeId || ordem === undefined) {
      return NextResponse.json(
        { error: "Nome, modalidade e ordem são obrigatórios" },
        { status: 400 }
      );
    }

    const graduacao = await prisma.graduacaoTipo.create({
      data: {
        nome,
        ordem,
        modalidadeId,
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
