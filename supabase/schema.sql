-- ============================================================
-- Capela São Miguel Arcanjo — Schema Supabase (PostgreSQL)
-- Execute no SQL Editor do Supabase: https://supabase.com/dashboard
-- ============================================================

-- Usuários do sistema (auth customizado)
CREATE TABLE IF NOT EXISTS usuarios (
  uid TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  usuario TEXT,
  senha_hash TEXT NOT NULL,
  perfil TEXT NOT NULL DEFAULT 'visualizador',
  cpf TEXT,
  endereco TEXT,
  observacoes TEXT,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Lançamentos financeiros
CREATE TABLE IF NOT EXISTS lancamentos (
  id TEXT PRIMARY KEY,
  tipo TEXT NOT NULL CHECK (tipo IN ('receita', 'despesa')),
  data DATE NOT NULL,
  valor NUMERIC(12,2) NOT NULL,
  categoria TEXT NOT NULL,
  descricao TEXT NOT NULL,
  responsavel TEXT,
  observacoes TEXT,
  numero_documento TEXT,
  forma_pagamento TEXT,
  criado_por TEXT,
  criado_por_email TEXT,
  mes INT,
  ano INT,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lancamentos_data ON lancamentos(data DESC);
CREATE INDEX IF NOT EXISTS idx_lancamentos_tipo ON lancamentos(tipo);
CREATE INDEX IF NOT EXISTS idx_lancamentos_mes_ano ON lancamentos(mes, ano);

-- Categorias customizadas
CREATE TABLE IF NOT EXISTS categorias (
  id TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('receita', 'despesa'))
);

-- Formas de pagamento customizadas
CREATE TABLE IF NOT EXISTS formas_pagamento (
  id TEXT PRIMARY KEY,
  nome TEXT NOT NULL
);

-- Políticas RLS: permitir acesso com chave anon (app controla auth via login)
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE lancamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE formas_pagamento ENABLE ROW LEVEL SECURITY;

-- Políticas permissivas (idempotente: pode executar várias vezes)
DROP POLICY IF EXISTS "Allow all usuarios" ON usuarios;
DROP POLICY IF EXISTS "Permitir todos os usuários" ON usuarios;
DROP POLICY IF EXISTS "Allow all lancamentos" ON lancamentos;
DROP POLICY IF EXISTS "Allow all categorias" ON categorias;
DROP POLICY IF EXISTS "Allow all formas_pagamento" ON formas_pagamento;

CREATE POLICY "Allow all usuarios" ON usuarios
  FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all lancamentos" ON lancamentos
  FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all categorias" ON categorias
  FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all formas_pagamento" ON formas_pagamento
  FOR ALL USING (true) WITH CHECK (true);
