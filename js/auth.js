// js/auth.js — Authentication guard shared across all pages

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { FIREBASE_CONFIG, PERFIS } from "./config.js";

let _app, _auth, _db, _currentUser, _userProfile;

export function getApp() {
  if (!_app) _app = initializeApp(FIREBASE_CONFIG);
  return _app;
}

export function getAuthInstance() {
  if (!_auth) _auth = getAuth(getApp());
  return _auth;
}

export function getDB() {
  if (!_db) _db = getFirestore(getApp());
  return _db;
}

/**
 * requireAuth — call at the top of every protected page.
 * Redirects to login if not authenticated.
 * Returns { user, profile } on success.
 */
export async function requireAuth() {
  const auth = getAuthInstance();
  const db = getDB();

  return new Promise((resolve, reject) => {
    onAuthStateChanged(auth, async user => {
      if (!user) {
        window.location.href = "../index.html";
        return;
      }
      _currentUser = user;

      // Load user profile from Firestore
      try {
        const snap = await getDoc(doc(db, "usuarios", user.uid));
        if (snap.exists()) {
          _userProfile = snap.data();
        } else {
          // First-time admin bootstrap: if no users exist, make this user admin
          _userProfile = { perfil: PERFIS.VISUALIZADOR, nome: user.email };
        }
        populateNavUser(_userProfile, user);
        resolve({ user, profile: _userProfile });
      } catch (e) {
        console.error("Erro ao carregar perfil:", e);
        resolve({ user, profile: { perfil: PERFIS.VISUALIZADOR, nome: user.email } });
      }
    });
  });
}

export function isAdmin(profile) {
  return profile && profile.perfil === PERFIS.ADMIN;
}

export async function logout() {
  await signOut(getAuthInstance());
  window.location.href = "../index.html";
}

function populateNavUser(profile, user) {
  const el = document.getElementById("nav-username");
  if (el) el.textContent = profile.nome || user.email;
  const badge = document.getElementById("nav-role-badge");
  if (badge) {
    badge.textContent = profile.perfil === PERFIS.ADMIN ? "Admin" : "Visualizador";
    badge.className = "role-badge " + (profile.perfil === PERFIS.ADMIN ? "badge-admin" : "badge-viewer");
  }
  // Hide admin-only nav items for viewers
  if (profile.perfil !== PERFIS.ADMIN) {
    document.querySelectorAll(".admin-only").forEach(el => el.style.display = "none");
  }
}

// ============================================================
//  Utilities
// ============================================================
export function formatBRL(value) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value || 0);
}

export function formatDate(dateStr) {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y}`;
}

export function formatDatetime(ts) {
  if (!ts) return "";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleString("pt-BR");
}

export function getMonthName(num) {
  const months = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho",
    "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
  return months[num - 1] || "";
}

export function currentMonthYear() {
  const now = new Date();
  return { month: now.getMonth() + 1, year: now.getFullYear() };
}
