# ✝ Livro Razão — Portal Financeiro da Paróquia

Sistema web de gestão financeira paroquial com **Firebase** como backend e deploy no **Netlify**.  
Funciona como um livro razão digital: controle completo de receitas e despesas com relatórios, gráficos, exportação e auditoria.

---

## 📋 Funcionalidades

| Módulo | Descrição |
|--------|-----------|
| **Dashboard** | KPIs do mês, gráficos de barras (12 meses) e pizza por categoria |
| **Lançamentos** | Lista com filtros avançados, paginação, detalhe e exclusão |
| **Novo Lançamento** | Formulário completo com tipo, categoria, valor, observações, nº documento |
| **Relatórios** | Mensal, anual, por categoria e comparativo mensal |
| **Exportar** | Excel (.xlsx) e PDF com jsPDF/autoTable + pré-visualização |
| **Usuários** | Criar, editar e remover usuários (Admin / Visualizador) |
| **Categorias** | Gerenciar categorias personalizadas além das padrão |
| **Auditoria** | Log cronológico de todos os lançamentos com filtros |

### Perfis de acesso
- **Admin** — acesso total: lançamentos, relatórios, usuários, categorias, auditoria
- **Visualizador** — leitura e exportação apenas (sem criar/editar/excluir)

---

## 🚀 Configuração — Passo a Passo

### 1. Criar projeto no Firebase

1. Acesse [console.firebase.google.com](https://console.firebase.google.com)
2. Clique em **Adicionar projeto** → dê um nome (ex: `paroquia-financas`)
3. Desative Google Analytics (opcional) → Criar projeto

### 2. Ativar Authentication

1. No menu lateral: **Authentication** → **Começar**
2. Aba **Sign-in method** → Ative **E-mail/senha**

### 3. Criar Firestore Database

1. No menu lateral: **Firestore Database** → **Criar banco de dados**
2. Selecione **Modo de produção** → escolha uma região (ex: `southamerica-east1`)
3. Clique em **Ativar**

### 4. Configurar Regras de Segurança

1. No Firestore → aba **Regras**
2. **Substitua todo o conteúdo** pelo conteúdo do arquivo `firestore.rules`
3. Clique em **Publicar**

### 5. Criar índices compostos

1. No Firestore → aba **Índices** → **Índices compostos** → **Adicionar índice**
2. Ou use o arquivo `firestore.indexes.json` via Firebase CLI:
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase init firestore
   firebase deploy --only firestore:indexes
   ```
   > Obs: Os índices também são criados automaticamente na primeira consulta que os exige — o Firebase mostrará um link no console do navegador para criá-los.

### 6. Obter credenciais do Firebase

1. No Firebase Console → **Configurações do projeto** (ícone ⚙️)
2. Aba **Geral** → role até **Seus apps**
3. Clique em **</>** (Web) → registre o app com um nome
4. Copie o objeto `firebaseConfig`

### 7. Editar o arquivo de configuração

Abra `js/config.js` e substitua os valores:

```javascript
export const FIREBASE_CONFIG = {
  apiKey:            "AIzaSyXXXXXXXXXXXXXXXX",
  authDomain:        "paroquia-financas.firebaseapp.com",
  projectId:         "paroquia-financas",
  storageBucket:     "paroquia-financas.appspot.com",
  messagingSenderId: "123456789012",
  appId:             "1:123456789012:web:abcdef1234567890"
};
```

### 8. Criar o primeiro usuário Administrador

Como o sistema não tem tela de registro pública, siga estes passos:

1. No Firebase Console → **Authentication** → **Usuários** → **Adicionar usuário**
2. Informe e-mail e senha do administrador principal
3. Copie o **User UID** gerado
4. Vá em **Firestore** → **Dados** → Coleção `usuarios` → Adicionar documento
5. Use o **UID** como ID do documento
6. Adicione os campos:
   ```
   nome:   "Nome do Administrador"
   email:  "admin@paroquia.com"
   perfil: "admin"
   ```

---

## 🌐 Deploy no Netlify

### Opção A — Via GitHub (recomendado)

1. Faça upload desta pasta para um repositório GitHub
2. Acesse [app.netlify.com](https://app.netlify.com) → **Add new site** → **Import from Git**
3. Selecione o repositório
4. Configurações de build:
   - **Publish directory:** `.` (ponto)
   - Clique em **Deploy site**
5. Aguarde o deploy e acesse a URL gerada

### Opção B — Arrastar e soltar

1. Acesse [app.netlify.com](https://app.netlify.com)
2. Arraste a pasta do projeto para a área de drop
3. O site será publicado automaticamente

### Domínio personalizado (opcional)
- Em Netlify → **Site settings** → **Domain management** → **Add custom domain**

---

## 📁 Estrutura do Projeto

```
paroquia-financas/
├── index.html              ← Página de login
├── netlify.toml            ← Configuração Netlify
├── firestore.rules         ← Regras de segurança
├── firestore.indexes.json  ← Índices compostos
├── css/
│   └── main.css            ← Estilos globais
├── js/
│   ├── config.js           ← ⚠️ Configurar Firebase aqui
│   ├── auth.js             ← Guard de autenticação + utilidades
│   └── layout.js           ← Sidebar compartilhada
└── pages/
    ├── dashboard.html      ← Dashboard com KPIs e gráficos
    ├── lancamentos.html    ← Lista de lançamentos
    ├── novo.html           ← Novo lançamento (admin)
    ├── relatorios.html     ← Relatórios por período
    ├── exportar.html       ← Exportar Excel/PDF
    ├── usuarios.html       ← Gerenciar usuários (admin)
    ├── categorias.html     ← Gerenciar categorias (admin)
    └── auditoria.html      ← Log de auditoria (admin)
```

---

## 🏷️ Categorias Padrão

### Receitas
Dízimo, Oferta do Domingo, Oferta Especial, Doação, Venda de Artigos Religiosos, Aluguel de Espaços, Eventos e Quermesse, Cânon Diocesano, Outras Receitas

### Despesas
Manutenção Predial, Água e Esgoto, Energia Elétrica, Internet e Telefone, Material de Limpeza, Material de Escritório, Salários e Encargos, Liturgia e Sacramentos, Obras e Reformas, Pagamento ao Bispado, Alimentação, Transporte, Seguros, Impostos e Taxas, Doações a Terceiros, Outras Despesas

Novas categorias podem ser adicionadas em **Categorias** (menu admin).

---

## 🔒 Segurança

- Autenticação via Firebase Authentication (e-mail/senha)
- Regras de segurança no Firestore impedem acesso não autenticado
- Visualizadores não podem criar/editar/excluir lançamentos nem gerenciar usuários
- Toda ação é registrada com `criadoPor`, `criadoPorEmail` e `criadoEm`

---

## 🛠️ Suporte e Manutenção

- Para adicionar novos usuários: acesse **Usuários** no menu admin
- Para backup: use **Exportar** → Excel e guarde os arquivos mensalmente
- Os dados ficam armazenados no Firebase — gratuito até 1 GB e 50.000 leituras/dia no plano Spark

---

*Desenvolvido com Firebase + HTML/CSS/JS puro — sem dependência de framework frontend.*  
*Deploy via Netlify — gratuito para uso paroquial.*
