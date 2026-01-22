import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const modalidades = await prisma.modalidade.findMany({
      include: {
        graduacoes: {
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
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    // Verifica se é admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (user?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Apenas administradores podem criar modalidades" },
        { status: 403 }
      );
    }

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
      },
    });

    // Criar graduações se fornecidas
    if (graduacoes && Array.isArray(graduacoes) && graduacoes.length > 0) {
      await prisma.graduacaoTipo.createMany({
        data: graduacoes.map((nomeGrad: string, index: number) => ({
          nome: nomeGrad,
          ordem: index + 1,
          modalidadeId: modalidade.id,
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
