import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/tenant";
import { StatusMensalidade, PlanoPagamento } from "@/generated/prisma";

export async function GET(request: NextRequest) {
  try {
    const authResult = await getAuthenticatedUser(request);
    if ("response" in authResult) return authResult.response;

    const { searchParams } = new URL(request.url);
    const modalidadeId = searchParams.get("modalidadeId");
    const statusMensalidade = searchParams.get("statusMensalidade");
    const ativo = searchParams.get("ativo");

    const where: any = { ownerId: authResult.userId };
    if (modalidadeId) where.modalidadeId = modalidadeId;
    if (statusMensalidade) where.statusMensalidade = statusMensalidade;
    if (ativo !== null) where.ativo = ativo === "true";

    const alunos = await prisma.aluno.findMany({
      where,
      include: {
        modalidade: true,
        graduacaoAtual: true,
        mensalidades: {
          orderBy: {
            dataPagamento: "desc",
          },
          take: 1,
        },
      },
      orderBy: {
        nome: "asc",
      },
    });

    // Verificar e atualizar status dos alunos baseado na data de vencimento
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const alunosAtualizados = await Promise.all(
      alunos.map(async (aluno) => {
        // Só atualiza se o aluno não for ISENTO e tiver próximo vencimento
        if (aluno.statusMensalidade !== "ISENTO" && aluno.proximoVencimento) {
          const proximoVencimento = new Date(aluno.proximoVencimento);
          proximoVencimento.setHours(0, 0, 0, 0);
          
          const novoStatus = proximoVencimento >= hoje ? "EM_DIA" : "ATRASADA";
          
          // Se o status mudou, atualiza no banco
          if (aluno.statusMensalidade !== novoStatus) {
            await prisma.aluno.update({
              where: { id: aluno.id, ownerId: authResult.userId },
              data: { statusMensalidade: novoStatus },
            });
            aluno.statusMensalidade = novoStatus;
          }
        }
        return aluno;
      })
    );

    return NextResponse.json(alunosAtualizados);
  } catch (error) {
    console.error("Erro ao buscar alunos:", error);
    return NextResponse.json(
      { error: "Erro ao buscar alunos" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    if (!nome || !telefone || !dataNascimento || !modalidadeId || !planoPagamento || valorPlano === undefined) {
      return NextResponse.json(
        { error: "Campos obrigatórios faltando" },
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

    if (graduacaoAtualId) {
      const graduacaoTipo = await prisma.graduacaoTipo.findFirst({
        where: {
          id: graduacaoAtualId,
          ownerId: authResult.userId,
          modalidadeId,
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

    const aluno = await prisma.aluno.create({
      data: {
        ownerId: authResult.userId,
        nome,
        telefone,
        email,
        dataNascimento: new Date(dataNascimento),
        dataMatricula: dataMatricula ? new Date(dataMatricula) : new Date(),
        modalidadeId,
        graduacaoAtualId,
        statusMensalidade: statusMensalidade || StatusMensalidade.EM_DIA,
        planoPagamento: planoPagamento as PlanoPagamento,
        valorPlano: parseFloat(valorPlano),
        proximoVencimento: proximoVencimento ? new Date(proximoVencimento) : null,
        ativo: ativo !== undefined ? ativo : true,
      },
      include: {
        modalidade: true,
        graduacaoAtual: true,
      },
    });

    return NextResponse.json(aluno, { status: 201 });
  } catch (error: any) {
    console.error("Erro ao criar aluno:", error);
    return NextResponse.json(
      { error: "Erro ao criar aluno" },
      { status: 500 }
    );
  }
}
