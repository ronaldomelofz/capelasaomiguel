// js/api.js — API local com localStorage (sem Firebase, sem backend)

const STORAGE_KEY = "livro_razao";
const KEYS = { LANCAMENTOS: "lancamentos", USUARIOS: "usuarios", CATEGORIAS: "categorias", SESSION: "session" };

function getKey(k) { return `${STORAGE_KEY}_${k}`; }

function load(k) {
  try {
    const data = localStorage.getItem(getKey(k));
    return data ? JSON.parse(data) : (k === KEYS.USUARIOS ? [] : k === KEYS.LANCAMENTOS ? [] : k === KEYS.CATEGORIAS ? [] : null);
  } catch { return []; }
}

function save(k, data) {
  localStorage.setItem(getKey(k), JSON.stringify(data));
}

// ========== LANÇAMENTOS ==========
export function getLancamentos() {
  return load(KEYS.LANCAMENTOS).sort((a, b) => (b.data || "").localeCompare(a.data || ""));
}

export function addLancamento(obj) {
  const list = load(KEYS.LANCAMENTOS);
  const id = "l" + Date.now() + "_" + Math.random().toString(36).slice(2, 9);
  const item = { id, ...obj, criadoEm: new Date().toISOString() };
  list.push(item);
  save(KEYS.LANCAMENTOS, list);
  return item;
}

export function deleteLancamento(id) {
  const list = load(KEYS.LANCAMENTOS).filter(x => x.id !== id);
  save(KEYS.LANCAMENTOS, list);
}

export function getLancamentoById(id) {
  return load(KEYS.LANCAMENTOS).find(x => x.id === id);
}

// ========== USUÁRIOS ==========
export function getUsuarios() {
  return load(KEYS.USUARIOS);
}

export function getUsuarioById(uid) {
  return load(KEYS.USUARIOS).find(x => x.uid === uid);
}

export function saveUsuario(uid, data) {
  const list = load(KEYS.USUARIOS);
  const idx = list.findIndex(x => x.uid === uid);
  const item = { uid, ...(idx >= 0 ? list[idx] : {}), ...data };
  if (idx >= 0) list[idx] = item;
  else list.push(item);
  save(KEYS.USUARIOS, list);
}

export function deleteUsuario(uid) {
  save(KEYS.USUARIOS, load(KEYS.USUARIOS).filter(x => x.uid !== uid));
}

// ========== CATEGORIAS CUSTOM ==========
export function getCategoriasCustom() {
  return load(KEYS.CATEGORIAS);
}

export function addCategoria(obj) {
  const list = load(KEYS.CATEGORIAS);
  const id = "c" + Date.now();
  list.push({ id, ...obj });
  save(KEYS.CATEGORIAS, list);
}

export function deleteCategoria(id) {
  save(KEYS.CATEGORIAS, load(KEYS.CATEGORIAS).filter(x => x.id !== id));
}
