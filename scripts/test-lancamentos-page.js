#!/usr/bin/env node
/**
 * Abre a página de lançamentos em headless Chrome e captura erros do console e rede.
 * Uso: node scripts/test-lancamentos-page.js
 * Requer: npm install puppeteer
 */

const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 3755;
const ROOT = path.join(__dirname, "..");

function serveFile(url) {
  let file = url === "/" ? "index.html" : url.replace(/^\//, "").split("?")[0];
  const full = path.join(ROOT, file);
  if (!full.startsWith(ROOT)) return null;
  try {
    if (fs.statSync(full).isFile()) return fs.readFileSync(full);
  } catch {}
  return null;
}

async function main() {
  let puppeteer;
  try {
    puppeteer = require("puppeteer");
  } catch {
    console.log("Instalando puppeteer...");
    require("child_process").execSync("npm install puppeteer --no-save", {
      cwd: ROOT,
      stdio: "inherit",
    });
    puppeteer = require("puppeteer");
  }

  const server = http.createServer((req, res) => {
    const body = serveFile(req.url.split("?")[0]);
    if (!body) {
      res.writeHead(404);
      res.end();
      return;
    }
    const ext = path.extname(req.url);
    const types = { ".html": "text/html", ".js": "application/javascript", ".css": "text/css", ".json": "application/json" };
    res.setHeader("Content-Type", types[ext] || "application/octet-stream");
    res.end(body);
  });

  server.listen(PORT, "127.0.0.1", async () => {
    console.log("Servidor em http://127.0.0.1:" + PORT);
    console.log("Abrindo /pages/lancamentos.html...\n");

    const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox"] });
    const page = await browser.newPage();

    await page.evaluateOnNewDocument(() => {
      const session = {
        user: { uid: "test", email: "test@test.com" },
        profile: { perfil: "admin", nome: "Teste" },
        expires: Date.now() + 86400000,
      };
      localStorage.setItem("livro_razao_session", JSON.stringify(session));
    });

    const logs = [];
    const errors = [];

    page.on("console", (msg) => {
      const text = msg.text();
      const type = msg.type();
      logs.push({ type, text });
      if (type === "error") errors.push("[CONSOLE] " + text);
    });

    page.on("pageerror", (err) => {
      errors.push("[PAGE ERROR] " + err.message);
    });

    const navPromise = page.goto("http://127.0.0.1:" + PORT + "/pages/lancamentos.html", {
      waitUntil: "networkidle0",
      timeout: 25000,
    }).catch((e) => e);

    await navPromise;

    await new Promise((r) => setTimeout(r, 4000));

    const stillLoading = await page.evaluate(() => {
      const tbody = document.getElementById("tbody-lanc");
      return tbody && tbody.innerHTML.includes("Carregando");
    });

    console.log("=== Erros capturados ===");
    if (errors.length) errors.forEach((e) => console.error(e));
    else console.log("(nenhum erro de página)");

    console.log("\n=== Console (últimas 20) ===");
    logs.slice(-20).forEach(({ type, text }) => console.log(`[${type}] ${text}`));

    console.log("\n=== Estado da tabela ===");
    console.log("Ainda mostra 'Carregando...'?", stillLoading);

    const tableText = await page.evaluate(() => {
      const tbody = document.getElementById("tbody-lanc");
      return tbody ? tbody.innerText.slice(0, 300) : "(sem tbody)";
    });
    console.log("Conteúdo do tbody:", tableText);

    await browser.close();
    server.close();
    process.exit(errors.length > 0 || stillLoading ? 1 : 0);
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
