# 🚀 Deploy — Livro Razão

## Status

- **Site:** https://capelasaomiguel.netlify.app
- **Repositório:** https://github.com/ronaldomelofz/capelasaomiguel

## Tecnologia

- **Supabase** — PostgreSQL (banco de dados open-source)
- **Netlify** — hospedagem estática
- **GitHub** — repositório

## Configuração obrigatória

Antes do deploy, configure o Supabase:

1. Crie um projeto em [supabase.com](https://supabase.com)
2. Execute o SQL em `supabase/schema.sql` no SQL Editor
3. Edite `js/supabase-config.js` com sua URL e chave anon (Settings > API)

## Deploy

1. `git push` para o GitHub
2. Netlify faz deploy automático (se conectado)

Ou manualmente:
```bash
netlify deploy --prod --dir=.
```

## Primeiro acesso

- Usuário: **admin**
- Senha: **admin**
