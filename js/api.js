// js/api.js — API local com localStorage (sem Firebase, sem backend)

const STORAGE_KEY = "livro_razao";
const KEYS = { LANCAMENTOS: "lancamentos", USUARIOS: "usuarios", CATEGORIAS: "categorias", FORMAS_PAGAMENTO: "formasPagamento", SESSION: "session" };

function getKey(k) { return `${STORAGE_KEY}_${k}`; }

function load(k) {
  try {
    const data = localStorage.getItem(getKey(k));
    return data ? JSON.parse(data) : (k === KEYS.USUARIOS ? [] : k === KEYS.LANCAMENTOS ? [] : k === KEYS.CATEGORIAS ? [] : k === KEYS.FORMAS_PAGAMENTO ? [] : null);
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

/** Importa usuários (merge por uid). Útil quando admin e usuário usam dispositivos diferentes. */
export function importUsuarios(usuarios) {
  if (!Array.isArray(usuarios) || !usuarios.length) return 0;
  const list = load(KEYS.USUARIOS);
  const byUid = new Map(list.map(u => [u.uid, u]));
  let added = 0;
  for (const u of usuarios) {
    if (!u || !u.uid || !u.senhaHash) continue;
    if (!byUid.has(u.uid)) {
      byUid.set(u.uid, u);
      added++;
    }
  }
  save(KEYS.USUARIOS, Array.from(byUid.values()));
  return added;
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

// ========== FORMAS DE PAGAMENTO ==========
export function getFormasPagamentoCustom() {
  return load(KEYS.FORMAS_PAGAMENTO);
}

export function addFormaPagamento(nome) {
  const list = load(KEYS.FORMAS_PAGAMENTO);
  const id = "fp" + Date.now();
  list.push({ id, nome });
  save(KEYS.FORMAS_PAGAMENTO, list);
}

export function deleteFormaPagamento(id) {
  save(KEYS.FORMAS_PAGAMENTO, load(KEYS.FORMAS_PAGAMENTO).filter(x => x.id !== id));
}
