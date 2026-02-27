-- AlterTable
ALTER TABLE "modalidade" ADD COLUMN "ownerId" TEXT;
ALTER TABLE "graduacao_tipo" ADD COLUMN "ownerId" TEXT;
ALTER TABLE "professor" ADD COLUMN "ownerId" TEXT;
ALTER TABLE "aluno" ADD COLUMN "ownerId" TEXT;
ALTER TABLE "mensalidade" ADD COLUMN "ownerId" TEXT;
ALTER TABLE "graduacao" ADD COLUMN "ownerId" TEXT;

-- Backfill ownerId for existing data (best effort)
WITH first_owner AS (
  SELECT id FROM "user" ORDER BY "createdAt" ASC LIMIT 1
)
UPDATE "modalidade"
SET "ownerId" = (SELECT id FROM first_owner)
WHERE "ownerId" IS NULL;

WITH first_owner AS (
  SELECT id FROM "user" ORDER BY "createdAt" ASC LIMIT 1
)
UPDATE "professor"
SET "ownerId" = COALESCE("userId", (SELECT id FROM first_owner))
WHERE "ownerId" IS NULL;

UPDATE "graduacao_tipo" gt
SET "ownerId" = m."ownerId"
FROM "modalidade" m
WHERE gt."modalidadeId" = m."id"
  AND gt."ownerId" IS NULL;

UPDATE "aluno" a
SET "ownerId" = m."ownerId"
FROM "modalidade" m
WHERE a."modalidadeId" = m."id"
  AND a."ownerId" IS NULL;

UPDATE "mensalidade" me
SET "ownerId" = a."ownerId"
FROM "aluno" a
WHERE me."alunoId" = a."id"
  AND me."ownerId" IS NULL;

UPDATE "graduacao" g
SET "ownerId" = a."ownerId"
FROM "aluno" a
WHERE g."alunoId" = a."id"
  AND g."ownerId" IS NULL;

-- Drop old global unique constraints
ALTER TABLE "modalidade" DROP CONSTRAINT IF EXISTS "modalidade_nome_key";
ALTER TABLE "professor" DROP CONSTRAINT IF EXISTS "professor_email_key";
ALTER TABLE "graduacao_tipo" DROP CONSTRAINT IF EXISTS "graduacao_tipo_modalidadeId_nome_key";

-- Add tenant indexes
CREATE INDEX "modalidade_ownerId_idx" ON "modalidade"("ownerId");
CREATE INDEX "graduacao_tipo_ownerId_idx" ON "graduacao_tipo"("ownerId");
CREATE INDEX "professor_ownerId_idx" ON "professor"("ownerId");
CREATE INDEX "aluno_ownerId_idx" ON "aluno"("ownerId");
CREATE INDEX "mensalidade_ownerId_idx" ON "mensalidade"("ownerId");
CREATE INDEX "graduacao_ownerId_idx" ON "graduacao"("ownerId");

-- Add tenant unique constraints
CREATE UNIQUE INDEX "modalidade_ownerId_nome_key" ON "modalidade"("ownerId", "nome");
CREATE UNIQUE INDEX "professor_ownerId_email_key" ON "professor"("ownerId", "email");
CREATE UNIQUE INDEX "graduacao_tipo_ownerId_modalidadeId_nome_key" ON "graduacao_tipo"("ownerId", "modalidadeId", "nome");

-- Add foreign keys
ALTER TABLE "modalidade"
  ADD CONSTRAINT "modalidade_ownerId_fkey"
  FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "graduacao_tipo"
  ADD CONSTRAINT "graduacao_tipo_ownerId_fkey"
  FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "professor"
  ADD CONSTRAINT "professor_ownerId_fkey"
  FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "aluno"
  ADD CONSTRAINT "aluno_ownerId_fkey"
  FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "mensalidade"
  ADD CONSTRAINT "mensalidade_ownerId_fkey"
  FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "graduacao"
  ADD CONSTRAINT "graduacao_ownerId_fkey"
  FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
