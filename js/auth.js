// js/auth.js — Autenticação local (localStorage, sem Firebase)

import { PERFIS } from "./config.js";
import { getUsuarios, saveUsuario } from "./api.js";

const SESSION_KEY = "livro_razao_session";
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 dias

export async function hashPassword(pw) {
  const enc = new TextEncoder();
  const buf = await crypto.subtle.digest("SHA-256", enc.encode(pw));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}

function getSession() {
  try {
    const s = localStorage.getItem(SESSION_KEY);
    if (!s) return null;
    const data = JSON.parse(s);
    if (data.expires && Date.now() > data.expires) { localStorage.removeItem(SESSION_KEY); return null; }
    return data;
  } catch { return null; }
}

function setSession(user, profile) {
  const data = { user: { uid: user.uid, email: user.email }, profile, expires: Date.now() + SESSION_DURATION };
  localStorage.setItem(SESSION_KEY, JSON.stringify(data));
}

export function logout() {
  localStorage.removeItem(SESSION_KEY);
  window.location.href = "../index.html";
}

export async function requireAuth() {
  const session = getSession();
  if (!session) { window.location.href = "../index.html"; return; }
  const user = session.user;
  const profile = session.profile || { perfil: PERFIS.VISUALIZADOR, nome: user.email };
  populateNavUser(profile, user);
  return { user, profile };
}

export function isAdmin(profile) {
  return profile && profile.perfil === PERFIS.ADMIN;
}

export async function login(emailOrUser, password) {
  const users = await getUsuarios();
  const pwHash = await hashPassword(password);
  const input = String(emailOrUser || "").trim().toLowerCase();

  const matchUser = (u) => {
    const emailMatch = u.email && u.email.trim().toLowerCase() === input;
    const usuarioMatch = u.usuario && String(u.usuario).trim().toLowerCase() === input;
    return (emailMatch || usuarioMatch) && u.senhaHash === pwHash;
  };
  let user = users.find(matchUser);

  if (!user && (input === "admin" || input === "administrador") && password === "admin") {
    let adminUser = users.find(u => u.perfil === PERFIS.ADMIN);
    if (!adminUser) {
      const uid = "admin_" + Date.now();
      const defaultAdmin = { uid, email: "admin@capelasaomiguel.com", nome: "Administrador", perfil: PERFIS.ADMIN, senhaHash: await hashPassword("admin") };
      await saveUsuario(uid, defaultAdmin);
      adminUser = defaultAdmin;
    }
    if (adminUser && adminUser.senhaHash === pwHash) user = adminUser;
  }

  if (!user) return false;
  setSession({ uid: user.uid, email: user.email }, user);
  return true;
}

export async function criarUsuarioLocal(nome, email, senha, perfil, cpf, endereco, usuario, observacoes) {
  const users = await getUsuarios();
  const emailNorm = (email || "").trim().toLowerCase();
  if (users.some(u => (u.email || "").trim().toLowerCase() === emailNorm)) throw new Error("E-mail já em uso");
  const usuarioNorm = (usuario || "").trim() || null;
  if (usuarioNorm && users.some(u => u.usuario && String(u.usuario).trim().toLowerCase() === usuarioNorm.toLowerCase())) throw new Error("Usuário de acesso já em uso");
  const uid = "u" + Date.now() + "_" + Math.random().toString(36).slice(2, 8);
  const senhaHash = await hashPassword(senha);
  await saveUsuario(uid, { nome, email: (email || "").trim(), perfil, senhaHash, cpf: cpf || null, endereco: endereco || null, usuario: usuarioNorm, observacoes: (observacoes || "").trim() || null });
  return uid;
}

function populateNavUser(profile, user) {
  const el = document.getElementById("nav-username");
  if (el) el.textContent = profile.nome || user.email;
  const badge = document.getElementById("nav-role-badge");
  if (badge) {
    badge.textContent = profile.perfil === PERFIS.ADMIN ? "Admin" : "Visualizador";
    badge.className = "role-badge " + (profile.perfil === PERFIS.ADMIN ? "badge-admin" : "badge-viewer");
  }
  if (profile.perfil !== PERFIS.ADMIN) {
    document.querySelectorAll(".admin-only").forEach(el => el.style.display = "none");
  }
}

// Utilities
export function formatBRL(value) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value || 0);
}

export function formatDate(dateStr) {
  if (!dateStr) return "";
  const [y, m, d] = String(dateStr).split("-");
  return d && m && y ? `${d}/${m}/${y}` : dateStr;
}

export function formatDatetime(ts) {
  if (!ts) return "";
  const d = typeof ts === "string" ? new Date(ts) : (ts.toDate ? ts.toDate() : new Date(ts));
  return d.toLocaleString("pt-BR");
}

export function getMonthName(num) {
  const months = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
  return months[Number(num) - 1] || "";
}

export function currentMonthYear() {
  const now = new Date();
  return { month: now.getMonth() + 1, year: now.getFullYear() };
}
