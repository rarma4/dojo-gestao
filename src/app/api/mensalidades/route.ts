import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { StatusMensalidade, PlanoPagamento } from "@/generated/prisma";

// Função auxiliar para calcular próximo vencimento
function calcularProximoVencimento(
  dataPagamento: Date,
  plano: PlanoPagamento
): Date {
  const proximaData = new Date(dataPagamento);
  
  switch (plano) {
    case PlanoPagamento.MENSAL:
      proximaData.setMonth(proximaData.getMonth() + 1);
      break;
    case PlanoPagamento.BIMESTRAL:
      proximaData.setMonth(proximaData.getMonth() + 2);
      break;
    case PlanoPagamento.TRIMESTRAL:
      proximaData.setMonth(proximaData.getMonth() + 3);
      break;
    case PlanoPagamento.SEMESTRAL:
      proximaData.setMonth(proximaData.getMonth() + 6);
      break;
    case PlanoPagamento.ANUAL:
      proximaData.setFullYear(proximaData.getFullYear() + 1);
      break;
  }
  
  return proximaData;
}

// Função para determinar status da mensalidade
function determinarStatusMensalidade(
  proximoVencimento: Date | null,
  statusAtual: StatusMensalidade
): StatusMensalidade {
  if (statusAtual === StatusMensalidade.ISENTO) {
    return StatusMensalidade.ISENTO;
  }
  
  if (!proximoVencimento) {
    return StatusMensalidade.ATRASADA;
  }
  
  const hoje = new Date();
  return proximoVencimento >= hoje 
    ? StatusMensalidade.EM_DIA 
    : StatusMensalidade.ATRASADA;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const alunoId = searchParams.get("alunoId");

    const where = alunoId ? { alunoId } : {};

    const mensalidades = await prisma.mensalidade.findMany({
      where,
      include: {
        aluno: {
          include: {
            modalidade: true,
          },
        },
      },
      orderBy: {
        dataPagamento: "desc",
      },
    });

    return NextResponse.json(mensalidades);
  } catch (error) {
    console.error("Erro ao buscar mensalidades:", error);
    return NextResponse.json(
      { error: "Erro ao buscar mensalidades" },
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
    const { alunoId, dataPagamento, valorPago } = body;

    if (!alunoId || !dataPagamento || valorPago === undefined) {
      return NextResponse.json(
        { error: "Aluno, data de pagamento e valor são obrigatórios" },
        { status: 400 }
      );
    }

    // Busca o aluno para pegar o plano de pagamento
    const aluno = await prisma.aluno.findUnique({
      where: { id: alunoId },
    });

    if (!aluno) {
      return NextResponse.json(
        { error: "Aluno não encontrado" },
        { status: 404 }
      );
    }

    const dataPagamentoDate = new Date(dataPagamento);
    const proximoVencimento = calcularProximoVencimento(
      dataPagamentoDate,
      aluno.planoPagamento
    );

    // Cria a mensalidade
    const mensalidade = await prisma.mensalidade.create({
      data: {
        alunoId,
        dataPagamento: dataPagamentoDate,
        valorPago: parseFloat(valorPago),
        proximoVencimento,
      },
      include: {
        aluno: true,
      },
    });

    // Atualiza o status do aluno
    const novoStatus = determinarStatusMensalidade(
      proximoVencimento,
      aluno.statusMensalidade
    );

    await prisma.aluno.update({
      where: { id: alunoId },
      data: {
        proximoVencimento,
        statusMensalidade: novoStatus,
      },
    });

    return NextResponse.json(mensalidade, { status: 201 });
  } catch (error: any) {
    console.error("Erro ao criar mensalidade:", error);
    return NextResponse.json(
      { error: "Erro ao criar mensalidade" },
      { status: 500 }
    );
  }
}
