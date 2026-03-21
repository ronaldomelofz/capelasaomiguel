-- ============================================================
-- OBRIGATÓRIO se o projeto foi criado antes da coluna "origem"
-- Dashboard Supabase → SQL Editor → New query → Cole e RUN
-- ============================================================

ALTER TABLE lancamentos ADD COLUMN IF NOT EXISTS origem TEXT DEFAULT 'manual';

COMMENT ON COLUMN lancamentos.origem IS 'manual | pdf — importação de extrato vs lançamento manual';

-- Opcional: atualizar linhas antigas sem valor
UPDATE lancamentos SET origem = 'manual' WHERE origem IS NULL;
