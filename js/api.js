// js/api.js — API com Supabase (PostgreSQL)

import { getSupabase } from "./supabase-client.js";

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
  const { data, error } = await getSupabase()
    .from("lancamentos")
    .select("*")
    .order("data", { ascending: false });
  if (error) throw new Error(error.message || "Erro ao carregar lançamentos");
  return (data || []).map(toLancamento);
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
  const { data, error } = await getSupabase().from("lancamentos").insert(row).select().single();
  if (error) throw new Error(error.message || "Erro ao salvar lançamento");
  return toLancamento(data);
}

export async function deleteLancamento(id) {
  const { error } = await getSupabase().from("lancamentos").delete().eq("id", id);
  if (error) throw new Error(error.message || "Erro ao excluir lançamento");
}

export async function getLancamentoById(id) {
  const { data, error } = await getSupabase().from("lancamentos").select("*").eq("id", id).single();
  if (error && error.code !== "PGRST116") throw new Error(error.message);
  return data ? toLancamento(data) : null;
}

// ========== USUÁRIOS ==========
export async function getUsuarios() {
  const { data, error } = await getSupabase().from("usuarios").select("*");
  if (error) throw new Error(error.message || "Erro ao carregar usuários");
  return (data || []).map(toUsuario);
}

export async function getUsuarioById(uid) {
  const { data, error } = await getSupabase().from("usuarios").select("*").eq("uid", uid).single();
  if (error && error.code !== "PGRST116") throw new Error(error.message);
  return data ? toUsuario(data) : null;
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

  const { data: existing } = await getSupabase().from("usuarios").select("uid").eq("uid", uid).single();
  if (existing) {
    const { error } = await getSupabase().from("usuarios").update(row).eq("uid", uid);
    if (error) throw new Error(error.message || "Erro ao atualizar usuário");
  } else {
    if (!row.senha_hash) throw new Error("Senha é obrigatória para novo usuário");
    row.criado_em = new Date().toISOString();
    const { error } = await getSupabase().from("usuarios").insert(row);
    if (error) throw new Error(error.message || "Erro ao criar usuário");
  }
}

export async function deleteUsuario(uid) {
  const { error } = await getSupabase().from("usuarios").delete().eq("uid", uid);
  if (error) throw new Error(error.message || "Erro ao excluir usuário");
}

// ========== CATEGORIAS ==========
export async function getCategoriasCustom() {
  const { data, error } = await getSupabase().from("categorias").select("*");
  if (error) throw new Error(error.message || "Erro ao carregar categorias");
  return (data || []).map((r) => ({ id: r.id, nome: r.nome, tipo: r.tipo }));
}

export async function addCategoria(obj) {
  const id = "c" + Date.now();
  const { error } = await getSupabase().from("categorias").insert({ id, nome: obj.nome, tipo: obj.tipo });
  if (error) throw new Error(error.message || "Erro ao salvar categoria");
  return { id, ...obj };
}

export async function deleteCategoria(id) {
  const { error } = await getSupabase().from("categorias").delete().eq("id", id);
  if (error) throw new Error(error.message || "Erro ao excluir categoria");
}

// ========== FORMAS DE PAGAMENTO ==========
export async function getFormasPagamentoCustom() {
  const { data, error } = await getSupabase().from("formas_pagamento").select("*");
  if (error) throw new Error(error.message || "Erro ao carregar formas de pagamento");
  return (data || []).map((r) => ({ id: r.id, nome: r.nome }));
}

export async function addFormaPagamento(nome) {
  const id = "fp" + Date.now();
  const { error } = await getSupabase().from("formas_pagamento").insert({ id, nome });
  if (error) throw new Error(error.message || "Erro ao salvar forma de pagamento");
  return { id, nome };
}

export async function deleteFormaPagamento(id) {
  const { error } = await getSupabase().from("formas_pagamento").delete().eq("id", id);
  if (error) throw new Error(error.message || "Erro ao excluir forma de pagamento");
}
