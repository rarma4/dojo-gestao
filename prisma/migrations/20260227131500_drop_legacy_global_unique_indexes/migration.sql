-- Remove legacy global unique indexes that break multi-tenant behavior
DROP INDEX IF EXISTS "public"."modalidade_nome_key";
DROP INDEX IF EXISTS "public"."professor_email_key";
DROP INDEX IF EXISTS "public"."graduacao_tipo_modalidadeId_nome_key";
