import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { StatusMensalidade, PlanoPagamento } from "@/generated/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const aluno = await prisma.aluno.findUnique({
      where: { id },
      include: {
        modalidade: true,
        graduacaoAtual: true,
        mensalidades: {
          orderBy: {
            dataPagamento: "desc",
          },
        },
        graduacoes: {
          include: {
            graduacaoTipo: true,
            professor: true,
          },
          orderBy: {
            dataGraduacao: "desc",
          },
        },
      },
    });

    if (!aluno) {
      return NextResponse.json(
        { error: "Aluno não encontrado" },
        { status: 404 }
      );
    }

    // Verificar e atualizar status baseado na data de vencimento
    if (aluno.statusMensalidade !== "ISENTO" && aluno.proximoVencimento) {
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      
      const proximoVencimento = new Date(aluno.proximoVencimento);
      proximoVencimento.setHours(0, 0, 0, 0);
      
      const novoStatus = proximoVencimento >= hoje ? "EM_DIA" : "ATRASADA";
      
      // Se o status mudou, atualiza no banco
      if (aluno.statusMensalidade !== novoStatus) {
        await prisma.aluno.update({
          where: { id: aluno.id },
          data: { statusMensalidade: novoStatus },
        });
        aluno.statusMensalidade = novoStatus as StatusMensalidade;
      }
    }

    return NextResponse.json(aluno);
  } catch (error) {
    console.error("Erro ao buscar aluno:", error);
    return NextResponse.json(
      { error: "Erro ao buscar aluno" },
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

    const body = await request.json();
    const {
      nome,
      telefone,
      email,
      dataNascimento,
      dataMatricula,
      modalidadeId,
      graduacaoAtualId,
      statusMensalidade,
      planoPagamento,
      valorPlano,
      proximoVencimento,
      ativo,
    } = body;

    const updateData: any = {};
    if (nome) updateData.nome = nome;
    if (telefone) updateData.telefone = telefone;
    if (email !== undefined) updateData.email = email;
    if (dataNascimento) updateData.dataNascimento = new Date(dataNascimento);
    if (dataMatricula) updateData.dataMatricula = new Date(dataMatricula);
    if (modalidadeId) updateData.modalidadeId = modalidadeId;
    if (graduacaoAtualId !== undefined) updateData.graduacaoAtualId = graduacaoAtualId;
    if (statusMensalidade) updateData.statusMensalidade = statusMensalidade;
    if (planoPagamento) updateData.planoPagamento = planoPagamento as PlanoPagamento;
    if (valorPlano !== undefined) updateData.valorPlano = parseFloat(valorPlano);
    if (proximoVencimento !== undefined) {
      updateData.proximoVencimento = proximoVencimento ? new Date(proximoVencimento) : null;
    }
    if (ativo !== undefined) updateData.ativo = ativo;

    const aluno = await prisma.aluno.update({
      where: { id },
      data: updateData,
      include: {
        modalidade: true,
        graduacaoAtual: true,
      },
    });

    return NextResponse.json(aluno);
  } catch (error: any) {
    console.error("Erro ao atualizar aluno:", error);
    
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Aluno não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Erro ao atualizar aluno" },
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

    await prisma.aluno.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Erro ao deletar aluno:", error);
    
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Aluno não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Erro ao deletar aluno" },
      { status: 500 }
    );
  }
}
