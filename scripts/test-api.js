#!/usr/bin/env node
/**
 * Teste da API Supabase - verifica conexão
 * Execute: node scripts/test-api.js
 * Ou: SUPABASE_URL=... SUPABASE_ANON_KEY=... node scripts/test-api.js
 */

const fs = require("fs");
const path = require("path");

let url = process.env.SUPABASE_URL || "";
let key = process.env.SUPABASE_ANON_KEY || "";

if (!url && fs.existsSync(path.join(__dirname, "../.env"))) {
  const env = fs.readFileSync(path.join(__dirname, "../.env"), "utf8");
  env.split("\n").forEach(line => {
    const m = line.match(/^SUPABASE_URL=(.+)/);
    if (m) url = m[1].trim().replace(/^["']|["']$/g, "");
    const m2 = line.match(/^SUPABASE_ANON_KEY=(.+)/);
    if (m2) key = m2[1].trim().replace(/^["']|["']$/g, "");
  });
}

if (!url || !key) {
  try {
    const config = fs.readFileSync(path.join(__dirname, "../js/supabase-config.js"), "utf8");
    const urlM = config.match(/SUPABASE_URL\s*=\s*["']([^"']+)["']/);
    const keyM = config.match(/SUPABASE_ANON_KEY\s*=\s*["']([^"']+)["']/);
    if (urlM) url = urlM[1];
    if (keyM) key = keyM[1];
  } catch {}
}

if (!url || !key) {
  console.error("ERRO: Defina SUPABASE_URL e SUPABASE_ANON_KEY no .env ou ambiente");
  process.exit(1);
}

const BASE = url.replace(/\/$/, "") + "/rest/v1";

async function test() {
  console.log("🔍 Testando conexão com Supabase...");
  console.log("   URL:", url);

  try {
    const r = await fetch(BASE + "/lancamentos?select=id&limit=1", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        apikey: key,
        Authorization: "Bearer " + key,
      },
      mode: "cors",
    });

    if (r.ok) {
      const data = await r.json();
      console.log("✅ Conexão OK! Resposta:", Array.isArray(data) ? `${data.length} registros` : "OK");
    } else {
      console.error("❌ Erro HTTP:", r.status, r.statusText);
      const text = await r.text();
      let data;
      try { data = JSON.parse(text); } catch {}
      console.error("   Detalhes:", (data && data.message) || text);
    }
  } catch (e) {
    console.error("❌ Falha na requisição:", e.message);
    if (e.message.includes("fetch")) {
      console.error("   Possíveis causas: CORS, projeto pausado, rede indisponível");
    }
  }
}

test();
