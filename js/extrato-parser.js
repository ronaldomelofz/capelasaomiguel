/**
 * Parser de extrato bancário em PDF - Banco do Brasil
 * Colunas: Dia | Lote | Documento | Histórico | Valor
 * - Lote: desconsiderado (ignorado)
 * - Documento: → Nº do Documento / Recibo
 * - Histórico: → Descrição *
 * Valor: "1.234,56 (+)" = receita, "1.234,56 (-)" = despesa
 * Ignora linhas com "saldo"
 *
 * LÓGICA: Para cada valor encontrado, busca a data/doc/descrição NO TEXTO
 * ANTERIOR ao valor (não posterior), pois no extrato a data vem antes do valor.
 */

// Formato principal: 1.234,56 (+) ou 1.234,56 (-)
const VALOR_PAREN = /(\d{1,3}(?:\.\d{3})*,\d{2})\s*\(\s*([+\-])\s*\)/g;
// Formato alternativo: 1.234,56 + ou 1.234,56 - (sem parênteses)
const VALOR_SIGN  = /(\d{1,3}(?:\.\d{3})*,\d{2})\s+([+\-])(?=[\s,]|$)/g;
// Formato C/D: 1.234,56 C ou 1.234,56 D
const VALOR_CD    = /(\d{1,3}(?:\.\d{3})*,\d{2})\s+([CD])(?=[\s,]|$)/g;

const EXCLUIR_RE  = /saldo/i;
const DATA_RE     = /\b(\d{2})\/(\d{2})\/(\d{4})\b/;

function parseValor(str) {
  return parseFloat(str.replace(/\./g, "").replace(",", ".")) || 0;
}

/**
 * Processa uma lista de matches de valor usando "look before":
 * O bloco relevante para cada valor é o texto ANTES do valor (desde o final
 * do valor anterior até o início do valor atual). Isso captura a linha do
 * extrato que precede o valor (data, lote, documento, histórico).
 */
function processar(normalizado, matches, sinalParaTipo) {
  const resultado = [];

  for (let i = 0; i < matches.length; i++) {
    const valor     = parseValor(matches[i][1]);
    const tipo      = sinalParaTipo(matches[i][2]);
    const matchStart = matches[i].index;

    // Texto entre o fim do valor anterior e o início do valor atual
    const prevEnd = i > 0 ? (matches[i - 1].index + matches[i - 1][0].length) : 0;
    const bloco   = normalizado.slice(prevEnd, matchStart).trim();

    if (!bloco) continue;

    // Ignora linhas de saldo (Saldo Anterior, Saldo do Dia, etc.)
    if (EXCLUIR_RE.test(bloco)) continue;

    // Encontra a data no bloco (DD/MM/YYYY)
    const dataM = bloco.match(DATA_RE);
    if (!dataM) continue;
    const data = `${dataM[3]}-${dataM[2]}-${dataM[1]}`;

    // Remove a data do bloco para processar o restante
    let resto = bloco
      .replace(/\b\d{2}\/\d{2}\/\d{4}\b/g, "")
      .replace(/\s+/g, " ")
      .trim();

    // Extrai número do documento (10–20 dígitos consecutivos)
    const docM = resto.match(/\b(\d{10,20})\b/);
    const numeroDocumento = docM ? docM[1] : null;
    if (docM) resto = resto.replace(docM[0], "").replace(/\s+/g, " ").trim();

    // Remove lote: número curto (1–6 dígitos) no início
    resto = resto.replace(/^\d{1,6}\s+/, "").replace(/\s+/g, " ").trim();

    const descricao = resto || (tipo === "receita" ? "Importado - Receita" : "Importado - Despesa");

    resultado.push({
      data,
      tipo,
      valor,
      numeroDocumento: numeroDocumento || null,
      observacoes: null,
      descricao,
    });
  }

  return resultado;
}

/**
 * Extrai lançamentos do texto bruto do PDF.
 * Tenta três formatos de valor em ordem de preferência.
 * @param {string} text - Texto completo extraído do PDF pelo pdf.js
 * @returns {Array} Array de objetos {data, tipo, valor, numeroDocumento, observacoes, descricao}
 */
export function extrairLancamentosDoTexto(text) {
  if (!text || typeof text !== "string") return [];

  // Normaliza espaços e quebras de linha
  const normalizado = text.replace(/[\r\n\t]+/g, " ").replace(/\s{2,}/g, " ").trim();

  // --- Tentativa 1: 1.234,56 (+) ou 1.234,56 (-) ---
  const m1 = [...normalizado.matchAll(VALOR_PAREN)];
  if (m1.length > 0) {
    const r = processar(normalizado, m1, s => s === "+" ? "receita" : "despesa");
    if (r.length > 0) return r;
  }

  // --- Tentativa 2: 1.234,56 + ou 1.234,56 - (sem parênteses) ---
  const m2 = [...normalizado.matchAll(VALOR_SIGN)];
  if (m2.length > 0) {
    const r = processar(normalizado, m2, s => s === "+" ? "receita" : "despesa");
    if (r.length > 0) return r;
  }

  // --- Tentativa 3: notação C/D ---
  const m3 = [...normalizado.matchAll(VALOR_CD)];
  if (m3.length > 0) {
    const r = processar(normalizado, m3, s => s === "C" ? "receita" : "despesa");
    if (r.length > 0) return r;
  }

  return [];
}

/**
 * Retorna uma amostra do texto extraído para fins de diagnóstico.
 * Útil para depurar quando o parser não encontra lançamentos.
 * @param {string} text
 * @returns {string}
 */
export function diagnosticarTexto(text) {
  if (!text) return "(texto vazio)";
  const normalizado = text.replace(/\s+/g, " ").trim();
  return normalizado.slice(0, 400);
}
