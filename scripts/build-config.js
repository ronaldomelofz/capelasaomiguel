/**
 * Script de build para injetar credenciais Firebase via variáveis de ambiente.
 * Use no Netlify: Build command = node scripts/build-config.js
 * Variáveis: FIREBASE_API_KEY, FIREBASE_AUTH_DOMAIN, FIREBASE_PROJECT_ID,
 *            FIREBASE_STORAGE_BUCKET, FIREBASE_MESSAGING_SENDER_ID, FIREBASE_APP_ID
 */
const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '..', 'js', 'config.js');
let content = fs.readFileSync(configPath, 'utf8');

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "SUA_API_KEY_AQUI",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "SEU_PROJECT_ID.firebaseapp.com",
  projectId: process.env.FIREBASE_PROJECT_ID || "SEU_PROJECT_ID",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "SEU_PROJECT_ID.appspot.com",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "SEU_MESSAGING_SENDER_ID",
  appId: process.env.FIREBASE_APP_ID || "SEU_APP_ID"
};

const adminDefault = {
  email: process.env.ADMIN_EMAIL || "admin@capelasaomiguel.com",
  usernames: (process.env.ADMIN_USERNAMES || "admin,administrador").split(",").map(s => s.trim())
};

const configStr = JSON.stringify(firebaseConfig, null, 2);
const adminStr = JSON.stringify(adminDefault, null, 2);
content = content.replace(/export const FIREBASE_CONFIG = \{[\s\S]*?\};/, `export const FIREBASE_CONFIG = ${configStr};`);
content = content.replace(/export const ADMIN_DEFAULT = \{[\s\S]*?\};/, `export const ADMIN_DEFAULT = ${adminStr};`);

fs.writeFileSync(configPath, content);
console.log('✅ config.js atualizado com credenciais Firebase');
