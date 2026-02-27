import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/tenant";
import { StatusMensalidade, PlanoPagamento } from "@/generated/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await getAuthenticatedUser(request);
    if ("response" in authResult) return authResult.response;

    const { id } = await params;
    const aluno = await prisma.aluno.findFirst({
      where: { id, ownerId: authResult.userId },
      include: {
        modalidade: true,
        graduacaoAtual: true,
        mensalidades: {
          orderBy: {
            dataPagamento: "desc",
          },
        },
        graduacoes: {
          where: {
            ownerId: authResult.userId,
          },
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
    const authResult = await getAuthenticatedUser(request);
    if ("response" in authResult) return authResult.response;

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

    const alunoExistente = await prisma.aluno.findFirst({
      where: { id, ownerId: authResult.userId },
      select: { id: true },
    });

    if (!alunoExistente) {
      return NextResponse.json(
        { error: "Aluno não encontrado" },
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

    if (graduacaoAtualId !== undefined && graduacaoAtualId !== null) {
      const modalidadeParaGraduacao = modalidadeId
        ? modalidadeId
        : (
            await prisma.aluno.findFirst({
              where: { id, ownerId: authResult.userId },
              select: { modalidadeId: true },
            })
          )?.modalidadeId;

      if (!modalidadeParaGraduacao) {
        return NextResponse.json(
          { error: "Modalidade do aluno não encontrada" },
          { status: 400 }
        );
      }

      const graduacaoTipo = await prisma.graduacaoTipo.findFirst({
        where: {
          id: graduacaoAtualId,
          ownerId: authResult.userId,
          modalidadeId: modalidadeParaGraduacao,
        },
        select: { id: true },
      });

      if (!graduacaoTipo) {
        return NextResponse.json(
          { error: "Graduação atual inválida para esta modalidade" },
          { status: 400 }
        );
      }
    }

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
    const authResult = await getAuthenticatedUser(request);
    if ("response" in authResult) return authResult.response;

    const deleted = await prisma.aluno.deleteMany({
      where: { id, ownerId: authResult.userId },
    });

    if (deleted.count === 0) {
      return NextResponse.json(
        { error: "Aluno não encontrado" },
        { status: 404 }
      );
    }

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
