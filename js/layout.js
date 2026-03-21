// js/layout.js — injects the shared sidebar into every page

export function renderLayout(activeItem) {
  const nav = [
    { id: "dashboard",    icon: "📊", label: "Dashboard",       href: "dashboard.html",   section: null },
    { id: "lancamentos",  icon: "📒", label: "Lançamentos",     href: "lancamentos.html", section: "Financeiro" },
    { id: "novo",         icon: "➕", label: "Novo Lançamento",  href: "novo.html",        section: null, adminOnly: true },
    { id: "relatorios",   icon: "📈", label: "Relatórios",      href: "relatorios.html",  section: null },
    { id: "exportar",     icon: "📤", label: "Exportar",        href: "exportar.html",    section: null },
    { id: "usuarios",     icon: "👥", label: "Usuários",        href: "usuarios.html",    section: "Administração", adminOnly: true },
    { id: "categorias",   icon: "🏷️", label: "Categorias",     href: "categorias.html",  section: null, adminOnly: true },
    { id: "formas-pagamento", icon: "💳", label: "Formas de Pagamento", href: "formas-pagamento.html", section: null, adminOnly: true },
    { id: "auditoria",    icon: "🔍", label: "Auditoria",       href: "auditoria.html",   section: null, adminOnly: true },
  ];

  let currentSection = null;
  let navHTML = "";
  for (const item of nav) {
    if (item.section && item.section !== currentSection) {
      currentSection = item.section;
      navHTML += `<div class="nav-section-label">${item.section}</div>`;
    }
    navHTML += `
      <a href="${item.href}"
         class="nav-item ${item.id === activeItem ? "active" : ""} ${item.adminOnly ? "admin-only" : ""}"
         title="${item.label}">
        <span class="icon">${item.icon}</span>
        ${item.label}
      </a>`;
  }

  const sidebar = `
  <aside class="sidebar" id="sidebar">
    <div class="sidebar-brand">
      <div><span class="cross">✝</span><span class="brand-name">Financeiro</span></div>
      <div class="brand-sub">Gestão Financeira da Capela São Miguel Arcanjo</div>
    </div>
    <div class="sidebar-user">
      <div class="user-name" id="nav-username">—</div>
      <span id="nav-role-badge" class="role-badge badge-viewer">Visualizador</span>
      <div id="connection-status" class="connection-status" title="Status da conexão com o banco de dados"></div>
    </div>
    <nav class="sidebar-nav">${navHTML}</nav>
    <div class="sidebar-footer">
      <button class="btn-logout" onclick="doLogout()">↩ Sair</button>
    </div>
  </aside>`;

  const hamburgerBtn = `
  <button class="hamburger" id="hamburger" onclick="toggleSidebar()">☰</button>`;

  // Insert sidebar before first child of body
  document.body.insertAdjacentHTML("afterbegin", sidebar);
  initConnectionStatus();

  // Wrap remaining body content
  const mainEl = document.getElementById("app-main");
  if (!mainEl) {
    const wrapper = document.createElement("div");
    wrapper.className = "main-content";
    wrapper.id = "app-main";
    while (document.body.children.length > 1) {
      wrapper.appendChild(document.body.children[1]);
    }
    document.body.appendChild(wrapper);

    // Inject hamburger into topbar
    const topbar = wrapper.querySelector(".topbar");
    if (topbar) topbar.insertAdjacentHTML("afterbegin", hamburgerBtn);
  }
}

window.doLogout = async function() {
  const { logout } = await import("./auth.js");
  logout();
};

window.toggleSidebar = function() {
  document.getElementById("sidebar").classList.toggle("open");
};

function initConnectionStatus() {
  const el = document.getElementById("connection-status");
  if (!el) return;
  const labels = { online: "● Conectado ao servidor", offline: "○ Sem conexão — clique para tentar", syncing: "⟳ Sincronizando com o servidor" };
  const classes = { online: "status-online", offline: "status-offline status-clickable", syncing: "status-syncing" };
  function update(s) {
    el.textContent = labels[s] || labels.online;
    el.className = "connection-status " + (classes[s] || classes.online);
  }
  import("./api.js").then(({ onConnectionStatusChange, getConnectionStatus, getLancamentos, pingSupabase }) => {
    onConnectionStatusChange(update);
    // Ao carregar qualquer página, testa o Supabase e atualiza o indicador
    pingSupabase().then(() => update(getConnectionStatus())).catch(() => update(getConnectionStatus()));
    el.onclick = () => {
      if (getConnectionStatus() === "offline") {
        el.textContent = "⟳ Tentando reconectar...";
        pingSupabase().then(() => update(getConnectionStatus())).catch(() => update("offline"));
        getLancamentos().then(() => update(getConnectionStatus())).catch(() => update("offline"));
      }
    };
  });
  window.addEventListener("online", () => import("./api.js").then(m => m.getLancamentos?.()).catch(() => {}));
}

// Close sidebar on outside click
document.addEventListener("click", e => {
  const sidebar = document.getElementById("sidebar");
  const hamburger = document.getElementById("hamburger");
  if (sidebar && sidebar.classList.contains("open") &&
      !sidebar.contains(e.target) && e.target !== hamburger) {
    sidebar.classList.remove("open");
  }
});
