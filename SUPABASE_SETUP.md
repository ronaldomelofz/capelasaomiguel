# Configuração do Supabase (Banco de Dados)

O sistema usa **Supabase** como banco de dados — PostgreSQL open-source, gratuito e hospedado.

## 1. Criar projeto no Supabase

1. Acesse [supabase.com](https://supabase.com) e faça login
2. Clique em **New Project**
3. Preencha nome e senha do banco
4. Aguarde a criação (1–2 min)

## 2. Criar as tabelas

1. No dashboard do projeto, vá em **SQL Editor**
2. Clique em **New query**
3. Copie todo o conteúdo de `supabase/schema.sql`
4. Cole e execute (Run)

### Migração: coluna `origem` (PDF vs manual)

Se você criou o banco **antes** desta coluna existir, ou vê erro *"Could not find the 'origem' column"*, execute **uma vez** no **SQL Editor**:

1. Abra o arquivo `supabase/EXECUTAR_NO_SQL_EDITOR.sql` (ou `supabase/migrations/add_origem_lancamentos.sql`)
2. Copie o `ALTER TABLE ...` e rode no Supabase (**Run**)

Sem isso, o app ainda grava lançamentos (fallback sem `origem`), mas **importação PDF** e filtros por origem no servidor só ficam corretos após a migração.

## 3. Configurar credenciais

### Netlify (recomendado — credenciais protegidas)
Em **Site settings** → **Environment variables**, adicione:
- `SUPABASE_URL` = sua Project URL (ex: `https://ybgawrsfqgcgsawshihp.supabase.co`)
- `SUPABASE_ANON_KEY` = chave anon (JWT) — copie de **Settings** → **API** no dashboard Supabase

**Importante:** A URL deve ser exatamente a mostrada no dashboard do projeto (Settings → API).

### Desenvolvimento local
```bash
cp js/supabase-config.example.js js/supabase-config.js
```
Edite `js/supabase-config.js` com a URL e chave anon. Este arquivo está no `.gitignore` e não será commitado.

## 4. Primeiro acesso

- Use **admin** / **admin** no login
- O sistema cria automaticamente o usuário administrador no banco na primeira vez
- **Recomendado:** Altere a senha padrão em Usuários após o primeiro acesso (evita avisos de segurança do navegador)

## Benefícios

- Dados centralizados no banco (não só no navegador)
- Todos os usuários veem os mesmos dados
- Backup e histórico no PostgreSQL
- Sem necessidade de export/import entre dispositivos

## Backend resiliente (24/7)

O sistema foi projetado para funcionar mesmo com falhas temporárias:

- **Retry automático**: até 3 tentativas com backoff em erros de rede ou 5xx
- **Timeout**: 8 segundos por requisição
- **Fila local (backup)**: se o POST falhar, o lançamento entra na fila para nova tentativa, mas a interface mostra **erro** (não simula sucesso)
- **Sincronização**: ao reconectar, `getLancamentos()` tenta enviar a fila pendente
- **Indicador na sidebar**: "Conectado ao servidor", "Sem conexão" ou "Sincronizando"; ao abrir o site é feito um ping ao Supabase

O Supabase é um serviço cloud com alta disponibilidade. Em caso de "Failed to fetch", verifique:
- Variáveis de ambiente no Netlify (SUPABASE_URL e SUPABASE_ANON_KEY)
- CORS no projeto Supabase (Settings → API → deve permitir seu domínio)
- Plano do Supabase (free tier pode ter cold start após inatividade)
