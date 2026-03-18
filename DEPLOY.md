# 🚀 Guia de Deploy - Livro Razão

## Configuração Rápida (Netlify + GitHub)

### 1. Variáveis de Ambiente no Netlify

Após conectar o repositório ao Netlify, configure em **Site settings → Environment variables**:

| Variável | Descrição |
|----------|-----------|
| `FIREBASE_API_KEY` | API Key do Firebase |
| `FIREBASE_AUTH_DOMAIN` | `seu-projeto.firebaseapp.com` |
| `FIREBASE_PROJECT_ID` | ID do projeto Firebase |
| `FIREBASE_STORAGE_BUCKET` | `seu-projeto.appspot.com` |
| `FIREBASE_MESSAGING_SENDER_ID` | Sender ID |
| `FIREBASE_APP_ID` | App ID |

Obtenha esses valores em: [Firebase Console](https://console.firebase.google.com) → Seu projeto → Configurações ⚙️ → Seus apps → Web.

### 2. Conectar GitHub ao Netlify

1. Acesse [app.netlify.com](https://app.netlify.com)
2. **Add new site** → **Import an existing project**
3. Conecte ao **GitHub** e selecione o repositório `capelasaomiguel`
4. Configurações de build (já definidas no `netlify.toml`):
   - **Build command:** `node scripts/build-config.js`
   - **Publish directory:** `.`
5. Adicione as variáveis de ambiente (passo 1)
6. Clique em **Deploy site**

### 3. Deploy via Linha de Comando

```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Login (abre o navegador)
netlify login

# Deploy
netlify deploy --prod
```

---

## Desenvolvimento Local

Para rodar localmente sem build, edite `js/config.js` diretamente com suas credenciais Firebase.
