# 🚀 Deploy — Capela São Miguel Arcanjo

## Status

- **Site:** https://capelasaomiguel.netlify.app
- **Repositório:** https://github.com/ronaldomelofz/capelasaomiguel

## Tecnologia

- **Supabase** — PostgreSQL (banco de dados open-source)
- **Netlify** — hospedagem estática
- **GitHub** — repositório

## Configuração obrigatória

### Supabase
1. Crie um projeto em [supabase.com](https://supabase.com)
2. Execute o SQL em `supabase/schema.sql` no SQL Editor

### Netlify (variáveis de ambiente)
No Netlify: **Site settings** → **Environment variables** → **Add variable**:

| Nome | Valor |
|------|-------|
| `SUPABASE_URL` | `https://ybgawrsfqgcgsawshihp.supabase.co` |
| `SUPABASE_ANON_KEY` | Chave anon do dashboard (Settings → API) |

As credenciais ficam protegidas — não vão para o repositório.

### Desenvolvimento local
```bash
cp js/supabase-config.example.js js/supabase-config.js
# Edite js/supabase-config.js com suas credenciais
```

## Deploy

1. `git push` para o GitHub
2. Netlify faz build e deploy automático (usa as env vars)

Deploy manual:
```bash
npm run build   # gera config a partir das env vars
netlify deploy --prod --dir=.
```

## Primeiro acesso

- Usuário: **admin**
- Senha: **admin**
