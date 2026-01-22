-- CreateEnum
CREATE TYPE "StatusMensalidade" AS ENUM ('EM_DIA', 'ATRASADA', 'ISENTO');

-- CreateEnum
CREATE TYPE "PlanoPagamento" AS ENUM ('MENSAL', 'BIMESTRAL', 'TRIMESTRAL', 'SEMESTRAL', 'ANUAL');

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'PROFESSOR';

-- CreateTable
CREATE TABLE "modalidade" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "modalidade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "graduacao_tipo" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "ordem" INTEGER NOT NULL,
    "modalidadeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "graduacao_tipo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "professor" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "modalidadeId" TEXT NOT NULL,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "professor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aluno" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "email" TEXT,
    "dataNascimento" TIMESTAMP(3) NOT NULL,
    "dataMatricula" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modalidadeId" TEXT NOT NULL,
    "graduacaoAtualId" TEXT,
    "statusMensalidade" "StatusMensalidade" NOT NULL DEFAULT 'EM_DIA',
    "planoPagamento" "PlanoPagamento" NOT NULL DEFAULT 'MENSAL',
    "valorPlano" DOUBLE PRECISION NOT NULL,
    "proximoVencimento" TIMESTAMP(3),
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "aluno_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mensalidade" (
    "id" TEXT NOT NULL,
    "alunoId" TEXT NOT NULL,
    "dataPagamento" TIMESTAMP(3) NOT NULL,
    "valorPago" DOUBLE PRECISION NOT NULL,
    "proximoVencimento" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mensalidade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "graduacao" (
    "id" TEXT NOT NULL,
    "alunoId" TEXT NOT NULL,
    "graduacaoTipoId" TEXT NOT NULL,
    "professorId" TEXT NOT NULL,
    "dataGraduacao" TIMESTAMP(3) NOT NULL,
    "valorPago" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "graduacao_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "modalidade_nome_key" ON "modalidade"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "graduacao_tipo_modalidadeId_nome_key" ON "graduacao_tipo"("modalidadeId", "nome");

-- CreateIndex
CREATE UNIQUE INDEX "professor_email_key" ON "professor"("email");

-- CreateIndex
CREATE UNIQUE INDEX "professor_userId_key" ON "professor"("userId");

-- AddForeignKey
ALTER TABLE "graduacao_tipo" ADD CONSTRAINT "graduacao_tipo_modalidadeId_fkey" FOREIGN KEY ("modalidadeId") REFERENCES "modalidade"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "professor" ADD CONSTRAINT "professor_modalidadeId_fkey" FOREIGN KEY ("modalidadeId") REFERENCES "modalidade"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "professor" ADD CONSTRAINT "professor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aluno" ADD CONSTRAINT "aluno_modalidadeId_fkey" FOREIGN KEY ("modalidadeId") REFERENCES "modalidade"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aluno" ADD CONSTRAINT "aluno_graduacaoAtualId_fkey" FOREIGN KEY ("graduacaoAtualId") REFERENCES "graduacao_tipo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mensalidade" ADD CONSTRAINT "mensalidade_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "aluno"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "graduacao" ADD CONSTRAINT "graduacao_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "aluno"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "graduacao" ADD CONSTRAINT "graduacao_graduacaoTipoId_fkey" FOREIGN KEY ("graduacaoTipoId") REFERENCES "graduacao_tipo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "graduacao" ADD CONSTRAINT "graduacao_professorId_fkey" FOREIGN KEY ("professorId") REFERENCES "professor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
