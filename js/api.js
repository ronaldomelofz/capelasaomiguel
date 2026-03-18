// js/api.js — API Supabase via REST (fetch nativo, sem cliente JS)

import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./supabase-config.js";

const BASE = (SUPABASE_URL || "").replace(/\/$/, "") + "/rest/v1";

function headers() {
  const key = SUPABASE_ANON_KEY;
  if (!key || !SUPABASE_URL || SUPABASE_URL.includes("SEU_PROJETO")) {
    throw new Error("Configure o Supabase em js/supabase-config.js. Veja SUPABASE_SETUP.md");
  }
  return {
    "Content-Type": "application/json",
    "apikey": key,
    "Authorization": "Bearer " + key,
    "Prefer": "return=representation"
  };
}

async function req(method, path, body) {
  const opt = { method, headers: headers() };
  if (body) opt.body = JSON.stringify(body);
  const r = await fetch(BASE + path, opt);
  const text = await r.text();
  let data = null;
  if (text) try { data = JSON.parse(text); } catch {}
  if (!r.ok) {
    const msg = (data && data.message) || data?.error_description || data?.msg || r.statusText || "Erro na requisição";
    throw new Error(msg);
  }
  return data;
}

// Mapeamento snake_case <-> camelCase
function toUsuario(row) {
  if (!row) return null;
  return {
    uid: row.uid,
    nome: row.nome,
    email: row.email,
    usuario: row.usuario,
    senhaHash: row.senha_hash,
    perfil: row.perfil,
    cpf: row.cpf,
    endereco: row.endereco,
    observacoes: row.observacoes,
    criadoEm: row.criado_em,
  };
}

function toLancamento(row) {
  if (!row) return null;
  return {
    id: row.id,
    tipo: row.tipo,
    data: row.data,
    valor: row.valor,
    categoria: row.categoria,
    descricao: row.descricao,
    responsavel: row.responsavel,
    observacoes: row.observacoes,
    numeroDocumento: row.numero_documento,
    formaPagamento: row.forma_pagamento,
    criadoPor: row.criado_por,
    criadoPorEmail: row.criado_por_email,
    mes: row.mes,
    ano: row.ano,
    criadoEm: row.criado_em,
  };
}

// ========== LANÇAMENTOS ==========
export async function getLancamentos() {
  const data = await req("GET", "/lancamentos?select=*&order=data.desc");
  return (Array.isArray(data) ? data : []).map(toLancamento);
}

export async function addLancamento(obj) {
  const id = "l" + Date.now() + "_" + Math.random().toString(36).slice(2, 9);
  const row = {
    id,
    tipo: obj.tipo,
    data: obj.data,
    valor: obj.valor,
    categoria: obj.categoria,
    descricao: obj.descricao,
    responsavel: obj.responsavel ?? null,
    observacoes: obj.observacoes ?? null,
    numero_documento: obj.numeroDocumento ?? null,
    forma_pagamento: obj.formaPagamento ?? null,
    criado_por: obj.criadoPor ?? null,
    criado_por_email: obj.criadoPorEmail ?? null,
    mes: obj.mes ?? null,
    ano: obj.ano ?? null,
  };
  const data = await req("POST", "/lancamentos", row);
  const inserted = Array.isArray(data) ? data[0] : data;
  return inserted ? toLancamento(inserted) : row;
}

export async function deleteLancamento(id) {
  await req("DELETE", "/lancamentos?id=eq." + encodeURIComponent(id));
}

export async function getLancamentoById(id) {
  const data = await req("GET", "/lancamentos?id=eq." + encodeURIComponent(id) + "&select=*&limit=1");
  const row = Array.isArray(data) && data.length ? data[0] : null;
  return row ? toLancamento(row) : null;
}

// ========== USUÁRIOS ==========
export async function getUsuarios() {
  const data = await req("GET", "/usuarios?select=*");
  return (Array.isArray(data) ? data : []).map(toUsuario);
}

export async function getUsuarioById(uid) {
  const data = await req("GET", "/usuarios?uid=eq." + encodeURIComponent(uid) + "&select=*&limit=1");
  const row = Array.isArray(data) && data.length ? data[0] : null;
  return row ? toUsuario(row) : null;
}

export async function saveUsuario(uid, data) {
  const row = {
    uid,
    nome: data.nome ?? null,
    email: data.email ?? null,
    usuario: data.usuario ?? null,
    perfil: data.perfil ?? "visualizador",
    cpf: data.cpf ?? null,
    endereco: data.endereco ?? null,
    observacoes: data.observacoes ?? null,
  };
  const senhaHash = data.senhaHash ?? data.senha_hash;
  if (senhaHash) row.senha_hash = senhaHash;

  const existing = await req("GET", "/usuarios?uid=eq." + encodeURIComponent(uid) + "&select=uid&limit=1");
  const hasExisting = Array.isArray(existing) && existing.length > 0;

  if (hasExisting) {
    await req("PATCH", "/usuarios?uid=eq." + encodeURIComponent(uid), row);
  } else {
    if (!row.senha_hash) throw new Error("Senha é obrigatória para novo usuário");
    row.criado_em = new Date().toISOString();
    await req("POST", "/usuarios", row);
  }
}

export async function deleteUsuario(uid) {
  await req("DELETE", "/usuarios?uid=eq." + encodeURIComponent(uid));
}

// ========== CATEGORIAS ==========
export async function getCategoriasCustom() {
  const data = await req("GET", "/categorias?select=*");
  return (Array.isArray(data) ? data : []).map((r) => ({ id: r.id, nome: r.nome, tipo: r.tipo }));
}

export async function addCategoria(obj) {
  const id = "c" + Date.now();
  await req("POST", "/categorias", { id, nome: obj.nome, tipo: obj.tipo });
  return { id, ...obj };
}

export async function deleteCategoria(id) {
  await req("DELETE", "/categorias?id=eq." + encodeURIComponent(id));
}

// ========== FORMAS DE PAGAMENTO ==========
export async function getFormasPagamentoCustom() {
  const data = await req("GET", "/formas_pagamento?select=*");
  return (Array.isArray(data) ? data : []).map((r) => ({ id: r.id, nome: r.nome }));
}

export async function addFormaPagamento(nome) {
  const id = "fp" + Date.now();
  await req("POST", "/formas_pagamento", { id, nome });
  return { id, nome };
}

export async function deleteFormaPagamento(id) {
  await req("DELETE", "/formas_pagamento?id=eq." + encodeURIComponent(id));
}
