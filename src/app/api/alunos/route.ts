import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { StatusMensalidade, PlanoPagamento } from "@/generated/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const modalidadeId = searchParams.get("modalidadeId");
    const statusMensalidade = searchParams.get("statusMensalidade");
    const ativo = searchParams.get("ativo");

    const where: any = {};
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

    return NextResponse.json(alunos);
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

    if (!nome || !telefone || !dataNascimento || !modalidadeId || !planoPagamento || valorPlano === undefined) {
      return NextResponse.json(
        { error: "Campos obrigatórios faltando" },
        { status: 400 }
      );
    }

    const aluno = await prisma.aluno.create({
      data: {
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
