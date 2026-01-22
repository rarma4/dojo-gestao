import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

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

    // Buscar mensalidade para obter o alunoId
    const mensalidade = await prisma.mensalidade.findUnique({
      where: { id },
      include: { aluno: true },
    });

    if (!mensalidade) {
      return NextResponse.json(
        { error: "Mensalidade não encontrada" },
        { status: 404 }
      );
    }

    // Deletar mensalidade
    await prisma.mensalidade.delete({
      where: { id },
    });

    // Atualizar status do aluno para ATRASADA
    await prisma.aluno.update({
      where: { id: mensalidade.alunoId },
      data: { statusMensalidade: "ATRASADA" },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Erro ao deletar mensalidade:", error);
    
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Mensalidade não encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Erro ao deletar mensalidade" },
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
    const { dataPagamento, valorPago } = body;

    if (!dataPagamento || !valorPago) {
      return NextResponse.json(
        { error: "Data de pagamento e valor são obrigatórios" },
        { status: 400 }
      );
    }

    // Buscar mensalidade para obter informações do aluno
    const mensalidadeAtual = await prisma.mensalidade.findUnique({
      where: { id },
      include: { aluno: true },
    });

    if (!mensalidadeAtual) {
      return NextResponse.json(
        { error: "Mensalidade não encontrada" },
        { status: 404 }
      );
    }

    // Calcular próximo vencimento baseado no plano do aluno
    const dataPagamentoDate = new Date(dataPagamento);
    const proximoVencimento = new Date(dataPagamentoDate);
    
    // Usar planoPagamento ao invés de diasPlano
    switch (mensalidadeAtual.aluno.planoPagamento) {
      case "MENSAL":
        proximoVencimento.setMonth(proximoVencimento.getMonth() + 1);
        break;
      case "BIMESTRAL":
        proximoVencimento.setMonth(proximoVencimento.getMonth() + 2);
        break;
      case "TRIMESTRAL":
        proximoVencimento.setMonth(proximoVencimento.getMonth() + 3);
        break;
      case "SEMESTRAL":
        proximoVencimento.setMonth(proximoVencimento.getMonth() + 6);
        break;
      case "ANUAL":
        proximoVencimento.setFullYear(proximoVencimento.getFullYear() + 1);
        break;
    }

    // Atualizar mensalidade
    const mensalidade = await prisma.mensalidade.update({
      where: { id },
      data: {
        dataPagamento: new Date(dataPagamento),
        valorPago: parseFloat(valorPago),
        proximoVencimento,
      },
      include: {
        aluno: {
          include: {
            modalidade: true,
          },
        },
      },
    });

    // Atualizar status do aluno
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    let statusMensalidade = mensalidade.aluno.statusMensalidade;
    
    // Só atualiza se não for ISENTO
    if (statusMensalidade !== "ISENTO") {
      statusMensalidade = proximoVencimento >= hoje ? "EM_DIA" : "ATRASADA";
    }

    await prisma.aluno.update({
      where: { id: mensalidade.alunoId },
      data: {
        statusMensalidade,
        proximoVencimento,
      },
    });

    return NextResponse.json(mensalidade);
  } catch (error: any) {
    console.error("Erro ao atualizar mensalidade:", error);
    
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Mensalidade não encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Erro ao atualizar mensalidade" },
      { status: 500 }
    );
  }
}
