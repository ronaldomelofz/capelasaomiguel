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
- `SUPABASE_URL` = sua Project URL
- `SUPABASE_ANON_KEY` = chave anon (JWT)

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
