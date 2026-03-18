// js/api.js — API Supabase + fallback localStorage (funciona offline)

import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./supabase-config.js";

const BASE = (SUPABASE_URL || "").replace(/\/$/, "") + "/rest/v1";
const KEY_USUARIOS = "livro_razao_usuarios";
const KEY_LANCAMENTOS = "livro_razao_lancamentos";
const KEY_CATEGORIAS = "livro_razao_categorias";
const KEY_FORMAS = "livro_razao_formasPagamento";

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
  const opt = { method, headers: headers(), mode: "cors" };
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

function loadLocal(k) {
  try {
    const d = localStorage.getItem(k);
    return d ? JSON.parse(d) : [];
  } catch { return []; }
}

function saveLocal(k, arr) {
  localStorage.setItem(k, JSON.stringify(arr));
}

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
  const r = row;
  const val = typeof r.valor === "number" ? r.valor : parseFloat(r.valor) || 0;
  return {
    id: r.id,
    tipo: r.tipo,
    data: r.data,
    valor: val,
    categoria: r.categoria,
    descricao: r.descricao,
    responsavel: r.responsavel ?? null,
    observacoes: r.observacoes ?? null,
    numeroDocumento: r.numero_documento ?? r.numeroDocumento ?? null,
    formaPagamento: r.forma_pagamento ?? r.formaPagamento ?? null,
    criadoPor: r.criado_por ?? r.criadoPor ?? null,
    criadoPorEmail: r.criado_por_email ?? r.criadoPorEmail ?? null,
    mes: r.mes ?? null,
    ano: r.ano ?? null,
    criadoEm: r.criado_em ?? r.criadoEm ?? null,
  };
}

// ========== LANÇAMENTOS ==========
export async function getLancamentos() {
  try {
    const data = await req("GET", "/lancamentos?select=*&order=data.desc");
    const list = (Array.isArray(data) ? data : []).map(toLancamento);
    if (list.length) saveLocal(KEY_LANCAMENTOS, list);
    return list;
  } catch (e) {
    const local = loadLocal(KEY_LANCAMENTOS);
    return local.map(toLancamento).sort((a, b) => (b.data || "").localeCompare(a.data || ""));
  }
}

export async function addLancamento(obj) {
  const id = "l" + Date.now() + "_" + Math.random().toString(36).slice(2, 9);
  const item = {
    id,
    tipo: obj.tipo,
    data: obj.data,
    valor: obj.valor,
    categoria: obj.categoria,
    descricao: obj.descricao,
    responsavel: obj.responsavel ?? null,
    observacoes: obj.observacoes ?? null,
    numeroDocumento: obj.numeroDocumento ?? null,
    formaPagamento: obj.formaPagamento ?? null,
    criadoPor: obj.criadoPor ?? null,
    criadoPorEmail: obj.criadoPorEmail ?? null,
    mes: obj.mes ?? null,
    ano: obj.ano ?? null,
    criadoEm: new Date().toISOString(),
  };

  try {
    const row = {
      id, tipo: obj.tipo, data: obj.data, valor: obj.valor, categoria: obj.categoria, descricao: obj.descricao,
      responsavel: obj.responsavel ?? null, observacoes: obj.observacoes ?? null,
      numero_documento: obj.numeroDocumento ?? null, forma_pagamento: obj.formaPagamento ?? null,
      criado_por: obj.criadoPor ?? null, criado_por_email: obj.criadoPorEmail ?? null,
      mes: obj.mes ?? null, ano: obj.ano ?? null,
    };
    const data = await req("POST", "/lancamentos", row);
    const inserted = Array.isArray(data) ? data[0] : data;
    return inserted ? toLancamento(inserted) : item;
  } catch (e) {
    const list = loadLocal(KEY_LANCAMENTOS);
    list.unshift(item);
    saveLocal(KEY_LANCAMENTOS, list);
    return item;
  }
}

export async function deleteLancamento(id) {
  try {
    await req("DELETE", "/lancamentos?id=eq." + encodeURIComponent(id));
  } catch (e) {}
  const list = loadLocal(KEY_LANCAMENTOS).filter(x => x.id !== id);
  saveLocal(KEY_LANCAMENTOS, list);
}

export async function getLancamentoById(id) {
  try {
    const data = await req("GET", "/lancamentos?id=eq." + encodeURIComponent(id) + "&select=*&limit=1");
    const row = Array.isArray(data) && data.length ? data[0] : null;
    return row ? toLancamento(row) : null;
  } catch (e) {
    const list = loadLocal(KEY_LANCAMENTOS);
    const row = list.find(x => x.id === id);
    return row ? toLancamento(row) : null;
  }
}

// ========== USUÁRIOS ==========
export async function getUsuarios() {
  try {
    const data = await req("GET", "/usuarios?select=*");
    const users = (Array.isArray(data) ? data : []).map(toUsuario);
    if (users.length) saveLocal(KEY_USUARIOS, users);
    return users;
  } catch (e) {
    const local = loadLocal(KEY_USUARIOS);
    if (local.length) return local;
    return [];
  }
}

export async function getUsuarioById(uid) {
  try {
    const data = await req("GET", "/usuarios?uid=eq." + encodeURIComponent(uid) + "&select=*&limit=1");
    const row = Array.isArray(data) && data.length ? data[0] : null;
    return row ? toUsuario(row) : null;
  } catch (e) {
    const list = loadLocal(KEY_USUARIOS);
    return list.find(x => x.uid === uid) || null;
  }
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

  try {
    const existing = await req("GET", "/usuarios?uid=eq." + encodeURIComponent(uid) + "&select=uid&limit=1");
    const hasExisting = Array.isArray(existing) && existing.length > 0;
    if (hasExisting) {
      await req("PATCH", "/usuarios?uid=eq." + encodeURIComponent(uid), row);
    } else {
      if (!row.senha_hash) throw new Error("Senha é obrigatória para novo usuário");
      row.criado_em = new Date().toISOString();
      await req("POST", "/usuarios", row);
    }
  } catch (e) {
    const local = loadLocal(KEY_USUARIOS);
    const u = {
      uid, nome: row.nome, email: row.email, usuario: row.usuario,
      senhaHash: row.senha_hash, perfil: row.perfil, cpf: row.cpf,
      endereco: row.endereco, observacoes: row.observacoes,
      criadoEm: row.criado_em || new Date().toISOString()
    };
    const idx = local.findIndex(x => x.uid === uid);
    if (idx >= 0) local[idx] = { ...local[idx], ...u };
    else local.push(u);
    saveLocal(KEY_USUARIOS, local);
  }
}

export async function deleteUsuario(uid) {
  try {
    await req("DELETE", "/usuarios?uid=eq." + encodeURIComponent(uid));
  } catch (e) {}
  const list = loadLocal(KEY_USUARIOS).filter(x => x.uid !== uid);
  saveLocal(KEY_USUARIOS, list);
}


// ========== CATEGORIAS ==========
export async function getCategoriasCustom() {
  try {
    const data = await req("GET", "/categorias?select=*");
    const list = (Array.isArray(data) ? data : []).map((r) => ({ id: r.id, nome: r.nome, tipo: r.tipo }));
    if (list.length) saveLocal(KEY_CATEGORIAS, list);
    return list;
  } catch (e) {
    return loadLocal(KEY_CATEGORIAS);
  }
}

export async function addCategoria(obj) {
  const id = "c" + Date.now();
  const item = { id, nome: obj.nome, tipo: obj.tipo };
  try {
    await req("POST", "/categorias", item);
    return item;
  } catch (e) {
    const list = loadLocal(KEY_CATEGORIAS);
    list.push(item);
    saveLocal(KEY_CATEGORIAS, list);
    return item;
  }
}

export async function deleteCategoria(id) {
  try {
    await req("DELETE", "/categorias?id=eq." + encodeURIComponent(id));
  } catch (e) {}
  const list = loadLocal(KEY_CATEGORIAS).filter(x => x.id !== id);
  saveLocal(KEY_CATEGORIAS, list);
}

// ========== FORMAS DE PAGAMENTO ==========
export async function getFormasPagamentoCustom() {
  try {
    const data = await req("GET", "/formas_pagamento?select=*");
    const list = (Array.isArray(data) ? data : []).map((r) => ({ id: r.id, nome: r.nome }));
    if (list.length) saveLocal(KEY_FORMAS, list);
    return list;
  } catch (e) {
    return loadLocal(KEY_FORMAS);
  }
}

export async function addFormaPagamento(nome) {
  const id = "fp" + Date.now();
  const item = { id, nome };
  try {
    await req("POST", "/formas_pagamento", item);
    return item;
  } catch (e) {
    const list = loadLocal(KEY_FORMAS);
    list.push(item);
    saveLocal(KEY_FORMAS, list);
    return item;
  }
}

export async function deleteFormaPagamento(id) {
  try {
    await req("DELETE", "/formas_pagamento?id=eq." + encodeURIComponent(id));
  } catch (e) {}
  const list = loadLocal(KEY_FORMAS).filter(x => x.id !== id);
  saveLocal(KEY_FORMAS, list);
}
