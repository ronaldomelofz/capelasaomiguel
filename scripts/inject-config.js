#!/usr/bin/env node
/**
 * Gera js/supabase-config.js a partir de variáveis de ambiente.
 * Netlify: credenciais nas env vars (Site settings > Environment variables).
 * Local: crie js/supabase-config.js a partir de supabase-config.example.js
 */

const fs = require("fs");
const path = require("path");

const url = process.env.SUPABASE_URL || "";
const key = process.env.SUPABASE_ANON_KEY || "";

const outPath = path.join(__dirname, "..", "js", "supabase-config.js");
const examplePath = path.join(__dirname, "..", "js", "supabase-config.example.js");

if (url && key) {
  const content = `// Gerado automaticamente — não editar.
export const SUPABASE_URL = "${String(url).replace(/"/g, '\\"')}";
export const SUPABASE_ANON_KEY = "${String(key).replace(/"/g, '\\"')}";
`;
  fs.writeFileSync(outPath, content, "utf8");
  console.log("✓ supabase-config.js gerado");
} else if (fs.existsSync(outPath)) {
  console.log("✓ supabase-config.js já existe");
} else if (fs.existsSync(examplePath)) {
  fs.copyFileSync(examplePath, outPath);
  console.warn("⚠ Copiado example. Edite js/supabase-config.js com suas credenciais.");
} else {
  console.error("ERRO: Defina SUPABASE_URL e SUPABASE_ANON_KEY no Netlify (Environment variables).");
  process.exit(1);
}
