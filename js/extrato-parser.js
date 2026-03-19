/**
 * Parser de extrato bancário - Banco do Brasil
 *
 * Mapeamento de colunas:
 *   data       → data
 *   documento  → Nº do Documento / Recibo
 *   histórico  → Descrição *
 *   valor      → valor
 *   lote       → IGNORADO
 *
 * Suporta dois modos:
 *  1. Texto com quebras de linha (saída OCR do Tesseract.js) → parser linha-a-linha
 *  2. Texto contínuo (saída do pdf.js sem newlines)          → parser "look before"
 *
 * Formatos de valor suportados:
 *   1.234,56 (+) / 1.234,56 (-)       → parênteses
 *   1.234,56 + / 1.234,56 -           → sinal com espaço
 *   1.234,56+ / 1.234,56-             → sinal sem espaço
 *   1.234,56 C / 1.234,56 D           → crédito/débito
 *
 * Formatos de data suportados:
 *   DD/MM/YYYY, DD/MM/YY, DD/MM
 */

// === REGEXES DE VALOR ===
const VALOR_PAREN = /(\d{1,3}(?:\.\d{3})*,\d{2})\s*\(\s*([+\-])\s*\)/g;
const VALOR_SIGN  = /(\d{1,3}(?:\.\d{3})*,\d{2})\s+([+\-])(?=[\s,\n]|$)/gm;
const VALOR_NOSPC = /(\d{1,3}(?:\.\d{3})*,\d{2})([+\-])(?=[\s,\n]|$)/gm;
const VALOR_CD    = /(\d{1,3}(?:\.\d{3})*,\d{2})\s+([CD])(?=[\s,\n]|$)/gm;

const EXCLUIR_RE  = /saldo/i;
const HEADER_RE   = /data\s+hist|per[ií]odo|extrato|banco\s+do\s+brasil|conta\s+corr|ag[eê]ncia|titular|cpf\s*\/|saldo\s+ant|^data\s*$/i;

function parseValor(str) {
  return parseFloat(str.replace(/\./g, "").replace(",", ".")) || 0;
}

function inferirAno(text) {
  const m = text.match(/\b(20\d{2})\b/);
  return m ? parseInt(m[1]) : new Date().getFullYear();
}

function parseData(dateStr, anoRef) {
  const parts = dateStr.split("/");
  const dd = parts[0].padStart(2, "0");
  const mm = parts[1].padStart(2, "0");
  if (parts.length === 3) {
    let yyyy = parts[2];
    if (yyyy.length === 2) yyyy = "20" + yyyy;
    return `${yyyy}-${mm}-${dd}`;
  }
  // DD/MM sem ano — usa ano de referência
  return `${anoRef}-${mm}-${dd}`;
}

/**
 * Limpa a descrição removendo documento e lote, retornando {descricao, numeroDocumento}.
 * documento = sequência de 6–20 dígitos isolada
 * lote      = número curto (1–5 dígitos) isolado no final ou início
 */
function extrairDescDoc(raw) {
  let s = raw.trim();

  // Extrai número do documento (6-20 dígitos consecutivos)
  const docM = s.match(/\b(\d{6,20})\b/);
  const numeroDocumento = docM ? docM[1] : null;
  if (docM) s = s.replace(docM[0], "").replace(/\s+/g, " ").trim();

  // Remove lote: dígitos curtos (1-5) no início ou no final
  s = s.replace(/^\d{1,5}\s+/, "").replace(/\s+\d{1,5}$/, "").replace(/\s+/g, " ").trim();

  return { descricao: s || null, numeroDocumento };
}

// ==========================================================================
// MODO 1: Parser linha-a-linha (texto OCR com newlines preservadas)
// ==========================================================================
function extrairPorLinhas(text) {
  const anoRef = inferirAno(text);
  const lines = text.split(/\r?\n/);
  const resultado = [];

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.length < 8) continue;
    if (HEADER_RE.test(line)) continue;
    if (EXCLUIR_RE.test(line)) continue;

    // A linha deve começar com data: DD/MM ou DD/MM/YYYY ou DD/MM/YY
    const dateMatch = line.match(/^(\d{2}\/\d{2}(?:\/\d{2,4})?)\s+/);
    if (!dateMatch) continue;

    const dateStr  = dateMatch[1];
    const afterDate = line.slice(dateMatch[0].length);

    // Valor no final: 1.234,56[sinal] ou 1.234,56 [sinal]
    // Aceita sinal: +, -, C, D
    const valueAtEnd = afterDate.match(/([\d]{1,3}(?:\.[\d]{3})*,\d{2})\s*([+\-CDcd])\s*$/);
    if (!valueAtEnd) continue;

    const valorStr = valueAtEnd[1];
    const sinal    = valueAtEnd[2].toUpperCase();
    const tipo     = (sinal === "+" || sinal === "C") ? "receita" : "despesa";
    const valor    = parseValor(valorStr);
    if (!valor || valor <= 0) continue;

    // Tudo entre a data e o valor
    const rawDesc = afterDate.slice(0, afterDate.length - valueAtEnd[0].length).trim();
    const { descricao, numeroDocumento } = extrairDescDoc(rawDesc);

    const data = parseData(dateStr, anoRef);
    if (!data) continue;

    resultado.push({
      data,
      tipo,
      valor,
      numeroDocumento: numeroDocumento || null,
      descricao: descricao || (tipo === "receita" ? "Importado - Receita" : "Importado - Despesa"),
      observacoes: null,
    });
  }

  return resultado;
}

// ==========================================================================
// MODO 2: Parser "look before" (texto contínuo, sem newlines – saída pdf.js)
// ==========================================================================
function processar(normalizado, matches, sinalParaTipo) {
  const anoRef = inferirAno(normalizado);
  const resultado = [];

  for (let i = 0; i < matches.length; i++) {
    const valor      = parseValor(matches[i][1]);
    const tipo       = sinalParaTipo(matches[i][2]);
    const matchStart = matches[i].index;

    const prevEnd = i > 0 ? (matches[i - 1].index + matches[i - 1][0].length) : 0;
    const bloco   = normalizado.slice(prevEnd, matchStart).trim();

    if (!bloco || EXCLUIR_RE.test(bloco)) continue;

    // Tenta data completa (DD/MM/YYYY) depois data curta (DD/MM)
    let data = null;
    const dataFull = bloco.match(/\b(\d{2})\/(\d{2})\/(\d{2,4})\b/);
    if (dataFull) {
      let yyyy = dataFull[3];
      if (yyyy.length === 2) yyyy = "20" + yyyy;
      data = `${yyyy}-${dataFull[2]}-${dataFull[1]}`;
    } else {
      const dataShort = bloco.match(/\b(\d{2})\/(\d{2})\b/);
      if (dataShort) data = `${anoRef}-${dataShort[2]}-${dataShort[1]}`;
    }
    if (!data) continue;

    let resto = bloco
      .replace(/\b\d{2}\/\d{2}(?:\/\d{2,4})?\b/g, "")
      .replace(/\s+/g, " ")
      .trim();

    const { descricao, numeroDocumento } = extrairDescDoc(resto);

    resultado.push({
      data,
      tipo,
      valor,
      numeroDocumento: numeroDocumento || null,
      descricao: descricao || (tipo === "receita" ? "Importado - Receita" : "Importado - Despesa"),
      observacoes: null,
    });
  }

  return resultado;
}

// ==========================================================================
// FUNÇÃO PRINCIPAL
// ==========================================================================

/**
 * Extrai lançamentos do texto bruto (pdf.js ou OCR).
 * @param {string} text  Texto completo extraído do PDF
 * @returns {Array} [{data, tipo, valor, numeroDocumento, descricao, observacoes}]
 */
export function extrairLancamentosDoTexto(text) {
  if (!text || typeof text !== "string") return [];

  // --- Modo 1: OCR (texto com quebras de linha) ---
  if (text.includes("\n")) {
    const r = extrairPorLinhas(text);
    if (r.length > 0) return r;
  }

  // --- Modo 2: texto contínuo (pdf.js) ---
  const norm = text.replace(/[\r\n\t]+/g, " ").replace(/\s{2,}/g, " ").trim();

  const m1 = [...norm.matchAll(VALOR_PAREN)];
  if (m1.length) { const r = processar(norm, m1, s => s === "+" ? "receita" : "despesa"); if (r.length) return r; }

  const m2 = [...norm.matchAll(VALOR_SIGN)];
  if (m2.length) { const r = processar(norm, m2, s => s === "+" ? "receita" : "despesa"); if (r.length) return r; }

  const m3 = [...norm.matchAll(VALOR_NOSPC)];
  if (m3.length) { const r = processar(norm, m3, s => s === "+" ? "receita" : "despesa"); if (r.length) return r; }

  const m4 = [...norm.matchAll(VALOR_CD)];
  if (m4.length) { const r = processar(norm, m4, s => s === "C" ? "receita" : "despesa"); if (r.length) return r; }

  return [];
}

/**
 * Retorna amostra do texto para diagnóstico.
 * @param {string} text
 * @returns {string}
 */
export function diagnosticarTexto(text) {
  if (!text) return "(texto vazio)";
  return text.slice(0, 600);
}
