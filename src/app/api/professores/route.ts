import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const modalidadeId = searchParams.get("modalidadeId");
    const ativo = searchParams.get("ativo");

    const where: any = {};
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
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (user?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Apenas administradores podem criar professores" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { nome, telefone, email, modalidadeId, isAdmin, ativo } = body;

    if (!nome || !telefone || !email || !modalidadeId) {
      return NextResponse.json(
        { error: "Nome, telefone, email e modalidade são obrigatórios" },
        { status: 400 }
      );
    }

    const professor = await prisma.professor.create({
      data: {
        nome,
        telefone,
        email,
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
