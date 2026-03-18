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

## 3. Configurar credenciais no projeto

1. No Supabase: **Settings** > **API**
2. Copie **Project URL** e a chave **anon public** (ou **publishable**)
3. No projeto, edite `js/supabase-config.js`:

```javascript
export const SUPABASE_URL = "https://xxx.supabase.co";  // sua URL exata
export const SUPABASE_ANON_KEY = "sua_chave_anon_ou_publishable";
```

Se o login falhar, use a chave **anon** (formato JWT, começa com `eyJ...`) em vez da publishable.

## 4. Primeiro acesso

- Use **admin** / **admin** no login
- O sistema cria automaticamente o usuário administrador no banco na primeira vez

## Benefícios

- Dados centralizados no banco (não só no navegador)
- Todos os usuários veem os mesmos dados
- Backup e histórico no PostgreSQL
- Sem necessidade de export/import entre dispositivos
