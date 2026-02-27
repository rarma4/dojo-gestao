import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/tenant";

export async function GET(request: NextRequest) {
  try {
    const authResult = await getAuthenticatedUser(request);
    if ("response" in authResult) return authResult.response;

    const modalidades = await prisma.modalidade.findMany({
      where: {
        ownerId: authResult.userId,
      },
      include: {
        graduacoes: {
          where: {
            ownerId: authResult.userId,
          },
          orderBy: {
            ordem: "asc",
          },
        },
        _count: {
          select: {
            alunos: true,
            professores: true,
            graduacoes: true,
          },
        },
      },
      orderBy: {
        nome: "asc",
      },
    });

    return NextResponse.json(modalidades);
  } catch (error) {
    console.error("Erro ao buscar modalidades:", error);
    return NextResponse.json(
      { error: "Erro ao buscar modalidades" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await getAuthenticatedUser(request);
    if ("response" in authResult) return authResult.response;

    const body = await request.json();
    const { nome, descricao, corTema, graduacoes } = body;

    if (!nome) {
      return NextResponse.json(
        { error: "Nome da modalidade é obrigatório" },
        { status: 400 }
      );
    }

    const modalidade = await prisma.modalidade.create({
      data: {
        nome,
        descricao: descricao || null,
        corTema: corTema || "#1e40af",
        ownerId: authResult.userId,
      },
    });

    // Criar graduações se fornecidas
    if (graduacoes && Array.isArray(graduacoes) && graduacoes.length > 0) {
      await prisma.graduacaoTipo.createMany({
        data: graduacoes.map((nomeGrad: string, index: number) => ({
          nome: nomeGrad,
          ordem: index + 1,
          modalidadeId: modalidade.id,
          ownerId: authResult.userId,
        })),
      });
    }

    return NextResponse.json(modalidade, { status: 201 });
  } catch (error: any) {
    console.error("Erro ao criar modalidade:", error);
    
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Já existe uma modalidade com este nome" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Erro ao criar modalidade" },
      { status: 500 }
    );
  }
}
