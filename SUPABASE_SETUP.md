# Configuração do Supabase (Banco de Dados)

O Livro Razão usa **Supabase** como banco de dados — PostgreSQL open-source, gratuito e hospedado.

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

## Benefícios

- Dados centralizados no banco (não só no navegador)
- Todos os usuários veem os mesmos dados
- Backup e histórico no PostgreSQL
- Sem necessidade de export/import entre dispositivos

## Backend resiliente (24/7)

O sistema foi projetado para funcionar mesmo com falhas temporárias:

- **Retry automático**: até 3 tentativas com backoff exponencial (1s, 2s, 4s) em erros de rede
- **Timeout**: 15 segundos por requisição para evitar travamentos
- **Fallback localStorage**: se o Supabase não responder, os dados são salvos localmente
- **Fila de sincronização**: lançamentos feitos offline são enviados ao Supabase quando a conexão voltar
- **Indicador de status**: na barra lateral, mostra "Conectado", "Modo local" ou "Sincronizando"

O Supabase é um serviço cloud com alta disponibilidade. Em caso de "Failed to fetch", verifique:
- Variáveis de ambiente no Netlify (SUPABASE_URL e SUPABASE_ANON_KEY)
- CORS no projeto Supabase (Settings → API → deve permitir seu domínio)
- Plano do Supabase (free tier pode ter cold start após inatividade)
