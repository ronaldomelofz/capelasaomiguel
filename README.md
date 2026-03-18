# ✝ Livro Razão — Portal Financeiro da Paróquia

Sistema web de gestão financeira paroquial com **localStorage** — sem Firebase, sem backend.  
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

**Sem configuração** — não precisa de Firebase, variáveis de ambiente ou domínios autorizados.

---

## 🔐 Primeiro acesso

- **Usuário:** `admin`
- **Senha:** `admin`

No primeiro login, o sistema cria automaticamente o usuário administrador.

---

## 📁 Dados

Os dados ficam no **localStorage** do navegador:
- Por dispositivo/navegador
- Use **Exportar** para backup em Excel/PDF
- Limpar dados do site apaga os registros

---

## 📁 Estrutura

```
├── index.html          ← Login
├── netlify.toml        ← Config Netlify
├── css/main.css
├── js/
│   ├── config.js       ← Categorias padrão
│   ├── auth.js         ← Autenticação local
│   ├── api.js          ← API localStorage
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
