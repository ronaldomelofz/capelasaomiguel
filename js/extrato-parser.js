/**
 * Parser de extrato bancário em PDF
 * Colunas: Dia, Lote, Documento, Histórico, Valor
 * Valor: "1.234,56 (+)" = crédito/receita, "1.234,56 (-)" = débito/despesa
 * Ignora: Saldo Anterior, Saldo do dia, Saldo
 */

const VALOR_REGEX = /(\d{1,3}(?:\.\d{3})*,\d{2})\s*\(\s*([+-])\s*\)/g;
const DATA_REGEX = /(\d{2})\/(\d{2})\/(\d{4})/g;
const EXCLUIR_PALAVRAS = ["saldo anterior", "saldo do dia", "saldo"];
const EXCLUIR_REGEX = /s\s*a\s*l\s*d\s*o/i;

function parseValor(str) {
  const n = parseFloat(str.replace(/\./g, "").replace(",", "."));
  return isNaN(n) ? 0 : n;
}

function dataParaISO(dd, mm, yy) {
  if (!dd || !mm || !yy || dd === "00" || mm === "00") return null;
  return `${yy}-${mm}-${dd}`;
}

/**
 * Extrai lançamentos do texto extraído do PDF
 * @param {string} text - Texto bruto do PDF
 * @returns {Array<{data:string,tipo:string,valor:number,numeroDocumento:string,observacoes:string,descricao:string}>}
 */
export function extrairLancamentosDoTexto(text) {
  if (!text || typeof text !== "string") return [];
  const resultado = [];
  const valorMatches = [...text.matchAll(VALOR_REGEX)];

  for (let i = 0; i < valorMatches.length; i++) {
    const valorStr = valorMatches[i][1];
    const sinal = valorMatches[i][2];
    const pos = valorMatches[i].index;
    const nextPos = valorMatches[i + 1] ? valorMatches[i + 1].index : text.length;
    const bloco = text.slice(pos, nextPos);

    const valor = parseValor(valorStr);
    const tipo = sinal === "+" ? "receita" : "despesa";

    const dataMatch = bloco.match(DATA_REGEX);
    const dataStr = dataMatch ? dataMatch[0] : null;
    if (!dataStr) continue;
    const [dd, mm, yy] = dataStr.split("/");
    if (dd === "00" && mm === "00") continue;
    const data = dataParaISO(dd, mm, yy);
    if (!data) continue;

    const historicoLower = bloco.toLowerCase();
    if (EXCLUIR_PALAVRAS.some((p) => historicoLower.includes(p))) continue;
    if (EXCLUIR_REGEX.test(bloco)) continue;

    // Preservar TODO o texto do histórico (incluindo documentos, IDs, descrições completas)
    let historico = bloco
      .replace(VALOR_REGEX, "")
      .replace(/^\s*\d{2}\/\d{2}\/\d{4}\s*/, "")
      .replace(/\s+/g, " ")
      .trim();

    const docMatch = bloco.match(/\b(\d{10,20})\b/);
    const numeroDocumento = docMatch ? docMatch[1] : null;

    const descricao = historico.slice(0, 200) || (tipo === "receita" ? "Importado - Receita" : "Importado - Despesa");

    resultado.push({
      data,
      tipo,
      valor,
      numeroDocumento: numeroDocumento || null,
      observacoes: historico || null,
      descricao,
    });
  }

  return resultado;
}
