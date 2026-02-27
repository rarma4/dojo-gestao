import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/tenant";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await getAuthenticatedUser(request);
    if ("response" in authResult) return authResult.response;

    const { id } = await params;
    const modalidade = await prisma.modalidade.findFirst({
      where: { id, ownerId: authResult.userId },
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
          },
        },
      },
    });

    if (!modalidade) {
      return NextResponse.json(
        { error: "Modalidade não encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(modalidade);
  } catch (error) {
    console.error("Erro ao buscar modalidade:", error);
    return NextResponse.json(
      { error: "Erro ao buscar modalidade" },
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

    const modalidadeExistente = await prisma.modalidade.findFirst({
      where: { id, ownerId: authResult.userId },
      select: { id: true },
    });

    if (!modalidadeExistente) {
      return NextResponse.json(
        { error: "Modalidade não encontrada" },
        { status: 404 }
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

    const modalidade = await prisma.modalidade.update({
      where: { id },
      data: {
        nome,
        descricao: descricao || null,
        corTema: corTema || "#1e40af",
      },
    });

    // Atualizar graduações se fornecidas
    if (graduacoes && Array.isArray(graduacoes)) {
      // Buscar graduações existentes
      const graduacoesExistentes = await prisma.graduacaoTipo.findMany({
        where: { modalidadeId: id, ownerId: authResult.userId },
        orderBy: { ordem: "asc" },
      });

      // Criar Set com nomes atuais normalizados
      const nomesNovos = new Set(graduacoes.map((g: string) => g.trim().toLowerCase()));
      
      // Identificar graduações para deletar (que não estão na nova lista)
      const idsParaDeletar = graduacoesExistentes
        .filter(g => !nomesNovos.has(g.nome.toLowerCase()))
        .filter(g => {
          // Verificar se a graduação está sendo usada
          return true; // Vamos permitir deletar, mas com cuidado
        })
        .map(g => g.id);

      // Deletar graduações que não estão mais na lista
      if (idsParaDeletar.length > 0) {
        // Verificar se alguma dessas graduações está em uso
        const graduacoesEmUso = await prisma.graduacao.findMany({
          where: {
            ownerId: authResult.userId,
            graduacaoTipoId: {
              in: idsParaDeletar
            }
          },
          select: {
            graduacaoTipoId: true
          }
        });

        const idsEmUso = new Set(graduacoesEmUso.map(g => g.graduacaoTipoId));
        const idsParaDeletarSeguro = idsParaDeletar.filter(id => !idsEmUso.has(id));

        if (idsParaDeletarSeguro.length > 0) {
          await prisma.graduacaoTipo.deleteMany({
            where: {
              ownerId: authResult.userId,
              id: {
                in: idsParaDeletarSeguro
              }
            }
          });
        }
      }

      // Identificar graduações para criar (novas)
      const nomesExistentes = new Set(
        graduacoesExistentes.map(g => g.nome.toLowerCase())
      );
      
      const graduacoesNovas = graduacoes.filter(
        (nomeGrad: string) => !nomesExistentes.has(nomeGrad.trim().toLowerCase())
      );

      // Criar as graduações novas
      if (graduacoesNovas.length > 0) {
        const maiorOrdem = graduacoesExistentes.length > 0
          ? Math.max(...graduacoesExistentes.map(g => g.ordem))
          : 0;

        await prisma.graduacaoTipo.createMany({
          data: graduacoesNovas.map((nomeGrad: string, index: number) => ({
            nome: nomeGrad.trim(),
            ordem: maiorOrdem + index + 1,
            modalidadeId: id,
            ownerId: authResult.userId,
          })),
        });
      }
    }

    // Buscar e retornar a modalidade atualizada com as graduações
    const modalidadeAtualizada = await prisma.modalidade.findFirst({
      where: { id, ownerId: authResult.userId },
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
          },
        },
      },
    });

    return NextResponse.json(modalidadeAtualizada);
  } catch (error: any) {
    console.error("Erro ao atualizar modalidade:", error);
    
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Já existe uma modalidade com este nome" },
        { status: 400 }
      );
    }

    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Modalidade não encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Erro ao atualizar modalidade" },
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

    const deleted = await prisma.modalidade.deleteMany({
      where: { id, ownerId: authResult.userId },
    });

    if (deleted.count === 0) {
      return NextResponse.json(
        { error: "Modalidade não encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Erro ao deletar modalidade:", error);
    
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Modalidade não encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Erro ao deletar modalidade" },
      { status: 500 }
    );
  }
}
