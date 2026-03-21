# ✝ Capela São Miguel Arcanjo — Portal Financeiro

Sistema web de gestão financeira com **Supabase** (PostgreSQL open-source).  
Deploy no **Netlify** + **GitHub**. Funciona como livro razão digital: controle de receitas e despesas com relatórios, gráficos e exportação.

---

## 📋 Funcionalidades

| Módulo | Descrição |
|--------|-----------|
| **Dashboard** | KPIs do mês, gráficos de barras (12 meses) e pizza por categoria |
| **Lançamentos** | Lista com filtros, paginação, detalhe e exclusão |
| **Novo Lançamento** | Formulário completo com tipo, categoria, valor, observações |
| **Relatórios** | Mensal, anual, por categoria e comparativo mensal |
| **Exportar** | Excel (.xlsx) e PDF com jsPDF/autoTable |
| **Usuários** | Criar, editar e remover usuários (Admin / Visualizador) |
| **Categorias** | Gerenciar categorias personalizadas |
| **Auditoria** | Log cronológico de lançamentos |

### Perfis
- **Admin** — acesso total
- **Visualizador** — leitura e exportação apenas

---

## 🚀 Deploy (Netlify + GitHub)

1. Envie o código para o GitHub
2. [Netlify](https://app.netlify.com) → **Add new site** → **Import from Git**
3. Selecione o repositório
4. **Publish directory:** `.`
5. Deploy

**Configuração:** crie um projeto no [Supabase](https://supabase.com), execute `supabase/schema.sql` e, se o projeto já existia sem a coluna, rode também `supabase/EXECUTAR_NO_SQL_EDITOR.sql`. Preencha `js/supabase-config.js`. Veja `SUPABASE_SETUP.md`.

---

## 🔐 Primeiro acesso

- **Usuário:** `admin`
- **Senha:** `admin`

No primeiro login, o sistema cria automaticamente o usuário administrador.

---

## 📁 Dados

Os dados ficam no **banco Supabase** (PostgreSQL):
- Centralizados — todos os usuários acessam as mesmas informações
- Backup automático pelo Supabase
- Use **Exportar** para Excel/PDF

---

## 📁 Estrutura

```
├── index.html          ← Login
├── netlify.toml        ← Config Netlify
├── css/main.css
├── js/
│   ├── config.js       ← Categorias padrão
│   ├── auth.js         ← Autenticação local
│   ├── api.js          ← API Supabase
│   ├── supabase-config.js
│   └── layout.js       ← Sidebar
└── pages/
    ├── dashboard.html
    ├── lancamentos.html
    ├── novo.html
    ├── relatorios.html
    ├── exportar.html
    ├── usuarios.html
    ├── categorias.html
    └── auditoria.html
```

---

*HTML/CSS/JS puro — deploy gratuito no Netlify.*
