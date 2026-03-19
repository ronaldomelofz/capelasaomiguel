-- Adiciona coluna origem em lancamentos (manual | pdf) para filtrar apagar vários
ALTER TABLE lancamentos ADD COLUMN IF NOT EXISTS origem TEXT DEFAULT 'manual';
