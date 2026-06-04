/* ============================================
   ENFOCA2S STUDIOS — CASILLERO VIRTUAL
   Script JS
   ============================================ */

// ─── STATE ────────────────────────────────────
let clientes = JSON.parse(localStorage.getItem("e2s_clientes") || "[]");
let informes = JSON.parse(localStorage.getItem("e2s_informes") || "[]");
let clienteActualId = null;

// ─── INIT ─────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  initColorSlots();
  renderAll();
});

function renderAll() {
  renderClientGrid();
  renderRecentGrid();
  updateStats();
  renderInformeSelect();
  renderHistorial();
}

// ─── SIDEBAR / NAVIGATION ─────────────────────
function toggleSidebar() {
  const sidebar = document.getElementById("sidebar");
  const main = document.querySelector(".main-content");
  sidebar.classList.toggle("collapsed");
  sidebar.classList.toggle("open");
  main.classList.toggle("full");
}

function showSection(name) {
  document
    .querySelectorAll(".section")
    .forEach((s) => s.classList.remove("active"));
  document
    .querySelectorAll(".nav-btn")
    .forEach((b) => b.classList.remove("active"));

  document.getElementById("section-" + name).classList.add("active");
  document.querySelector(`[data-section="${name}"]`).classList.add("active");

  const titles = {
    dashboard: "Dashboard",
    clientes: "Clientes",
    informes: "Informes",
  };
  document.getElementById("topBarTitle").textContent = titles[name] || name;
}

// ─── MODALS ────────────────────────────────────
function openModal(id) {
  document.getElementById(id).classList.add("open");
}

function closeModal(id) {
  document.getElementById(id).classList.remove("open");
}

// Click outside to close
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("modal-overlay")) {
    e.target.classList.remove("open");
  }
});

// ─── TABS ─────────────────────────────────────
function showTab(id) {
  document
    .querySelectorAll(".tab-content")
    .forEach((t) => t.classList.remove("active"));
  document
    .querySelectorAll(".tab")
    .forEach((t) => t.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  // Activate corresponding tab button
  const tabs = ["tabGeneral", "tabVisual", "tabTipografia", "tabNotas"];
  const idx = tabs.indexOf(id);
  document.querySelectorAll(".tabs .tab")[idx]?.classList.add("active");
}

// ─── TAGS ──────────────────────────────────────
function toggleTag(el) {
  el.classList.toggle("selected");
}

function getSelectedTags(containerId) {
  return [...document.querySelectorAll(`#${containerId} .tag.selected`)].map(
    (t) => t.textContent,
  );
}

// ─── COLOR SLOTS ───────────────────────────────
let colorCount = 0;

function initColorSlots() {
  addColorSlot("#111111");
  addColorSlot("#ffffff");
}

function addColorSlot(defaultColor = "#000000") {
  colorCount++;
  const container = document.getElementById("colorSlots");
  const slot = document.createElement("div");
  slot.className = "color-slot";
  slot.dataset.id = colorCount;
  slot.innerHTML = `
    <input type="color" value="${defaultColor}" onchange="syncHex(this)" />
    <input type="text" value="${defaultColor}" maxlength="7" placeholder="#000000" oninput="syncColor(this)" />
    <button class="color-slot-remove" onclick="removeColorSlot(this)"><i class="fa-solid fa-xmark"></i></button>
  `;
  container.appendChild(slot);
}

function syncHex(colorInput) {
  colorInput.nextElementSibling.value = colorInput.value;
}

function syncColor(textInput) {
  const val = textInput.value;
  if (/^#[0-9a-fA-F]{6}$/.test(val)) {
    textInput.previousElementSibling.value = val;
  }
}

function removeColorSlot(btn) {
  btn.closest(".color-slot").remove();
}

function getPalette() {
  return [...document.querySelectorAll(".color-slot")].map((slot) => ({
    hex: slot.querySelector('input[type="text"]').value,
    color: slot.querySelector('input[type="color"]').value,
  }));
}

function resetColorSlots() {
  document.getElementById("colorSlots").innerHTML = "";
  colorCount = 0;
  initColorSlots();
}

// ─── GUARDAR CLIENTE ───────────────────────────
function guardarCliente() {
  const nombre = document.getElementById("cNombre").value.trim();
  if (!nombre) {
    alert("El nombre del cliente es obligatorio.");
    return;
  }

  const cliente = {
    id: Date.now().toString(),
    nombre,
    sector: document.getElementById("cSector").value.trim(),
    contacto: document.getElementById("cContacto").value.trim(),
    whatsapp: document.getElementById("cWhatsApp").value.trim(),
    email: document.getElementById("cEmail").value.trim(),
    descripcion: document.getElementById("cDescripcion").value.trim(),
    publico: document.getElementById("cPublico").value.trim(),
    // visual
    paleta: getPalette(),
    estilos: getSelectedTags("estiloVisual"),
    logo: document.getElementById("cLogo").value.trim(),
    visualNotes: document.getElementById("cVisualNotes").value.trim(),
    // tipografía
    font1: document.getElementById("cFont1").value.trim(),
    font2: document.getElementById("cFont2").value.trim(),
    font3: document.getElementById("cFont3").value.trim(),
    fontScale: document.getElementById("cFontScale").value.trim(),
    tono: getSelectedTags("tonoCom"),
    fontNotes: document.getElementById("cFontNotes").value.trim(),
    // notas
    estado: document.getElementById("cEstado").value,
    links: document.getElementById("cLinks").value.trim(),
    notas: document.getElementById("cNotas").value.trim(),
    creadoEn: new Date().toLocaleDateString("es-CO", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
  };

  clientes.unshift(cliente);
  saveClientes();
  renderAll();
  closeModal("modalNuevoCliente");
  resetForm();
  resetColorSlots();
}

function resetForm() {
  [
    "cNombre",
    "cSector",
    "cContacto",
    "cWhatsApp",
    "cEmail",
    "cDescripcion",
    "cPublico",
    "cLogo",
    "cVisualNotes",
    "cFont1",
    "cFont2",
    "cFont3",
    "cFontScale",
    "cFontNotes",
    "cLinks",
    "cNotas",
  ].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });
  document
    .querySelectorAll(".tag.selected")
    .forEach((t) => t.classList.remove("selected"));
  document.getElementById("cEstado").value = "activo";
  showTab("tabGeneral");
}

// ─── PERSISTENCIA ──────────────────────────────
function saveClientes() {
  localStorage.setItem("e2s_clientes", JSON.stringify(clientes));
}
function saveInformes() {
  localStorage.setItem("e2s_informes", JSON.stringify(informes));
}

// ─── RENDER CLIENT CARDS ───────────────────────
function renderClientGrid(lista) {
  const grid = document.getElementById("clientGrid");
  const empty = document.getElementById("emptyClientes");
  const arr = lista || clientes;

  grid.innerHTML = "";

  if (!arr.length) {
    empty.classList.add("visible");
    return;
  }
  empty.classList.remove("visible");

  arr.forEach((c) => {
    grid.appendChild(buildCard(c));
  });
}

function renderRecentGrid() {
  const grid = document.getElementById("recentGrid");
  grid.innerHTML = "";
  clientes.slice(0, 4).forEach((c) => grid.appendChild(buildCard(c)));
}

function buildCard(c) {
  const card = document.createElement("div");
  card.className = "client-card";
  card.onclick = () => verCliente(c.id);

  const initials = c.nombre
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  const paletteHTML = (c.paleta || [])
    .filter((p) => p.hex)
    .map(
      (p) =>
        `<div class="color-dot" style="background:${p.hex}" title="${p.hex}"></div>`,
    )
    .join("");

  const statusLabels = {
    activo: "Activo",
    pausa: "En pausa",
    cerrado: "Cerrado",
    prospecto: "Prospecto",
  };
  const statusEmojis = {
    activo: "🟢",
    pausa: "🟡",
    cerrado: "🔴",
    prospecto: "🔵",
  };

  card.innerHTML = `
    <div class="card-header-row">
      <div class="card-avatar">${initials}</div>
      <span class="card-status status-${c.estado}">${statusEmojis[c.estado] || ""} ${statusLabels[c.estado] || c.estado}</span>
    </div>
    <div class="card-name">${c.nombre}</div>
    <div class="card-sector">${c.sector || "Sin sector"}</div>
    ${paletteHTML ? `<div class="card-palette">${paletteHTML}</div>` : ""}
    <div class="card-fonts">
      ${c.font1 ? `🅰 ${c.font1}` : ""}${c.font2 ? ` · ${c.font2}` : ""}
    </div>
  `;
  return card;
}

// ─── VER CLIENTE ───────────────────────────────
function verCliente(id) {
  const c = clientes.find((x) => x.id === id);
  if (!c) return;
  clienteActualId = id;

  document.getElementById("modalClienteNombre").textContent =
    c.nombre.toUpperCase();

  const swatches = (c.paleta || [])
    .filter((p) => p.hex)
    .map(
      (p) => `
    <div class="detail-color-swatch">
      <div class="swatch-circle" style="background:${p.hex}"></div>
      <span class="swatch-hex">${p.hex}</span>
    </div>`,
    )
    .join("");

  const estiloTags = (c.estilos || [])
    .map((t) => `<span class="detail-tag">${t}</span>`)
    .join("");
  const tonoTags = (c.tono || [])
    .map((t) => `<span class="detail-tag">${t}</span>`)
    .join("");

  const linksHTML = c.links
    ? c.links
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean)
        .map((l) => `<a href="${l}" target="_blank">${l}</a>`)
        .join("")
    : '<span style="color:var(--text-muted)">—</span>';

  document.getElementById("modalClienteBody").innerHTML = `
    <div class="detail-grid">

      <div class="detail-block">
        <div class="detail-block-title"><i class="fa-solid fa-user"></i> Información general</div>
        <div class="detail-row"><strong>Sector:</strong> ${c.sector || "—"}</div>
        <div class="detail-row"><strong>Contacto:</strong> ${c.contacto || "—"}</div>
        <div class="detail-row"><strong>WhatsApp:</strong> ${c.whatsapp || "—"}</div>
        <div class="detail-row"><strong>Email:</strong> ${c.email || "—"}</div>
        <div class="detail-row"><strong>Registro:</strong> ${c.creadoEn || "—"}</div>
      </div>

      <div class="detail-block">
        <div class="detail-block-title"><i class="fa-solid fa-align-left"></i> Descripción</div>
        <div class="detail-notes">${c.descripcion || "—"}</div>
        ${c.publico ? `<div class="detail-row" style="margin-top:12px"><strong>Público:</strong> ${c.publico}</div>` : ""}
      </div>

      <div class="detail-block">
        <div class="detail-block-title"><i class="fa-solid fa-palette"></i> Paleta de colores</div>
        <div class="detail-palette">${swatches || '<span style="color:var(--text-muted)">Sin colores</span>'}</div>
        ${estiloTags ? `<div style="margin-top:14px"><div class="detail-block-title" style="margin-bottom:8px">Estilo visual</div><div class="detail-tags">${estiloTags}</div></div>` : ""}
        ${c.visualNotes ? `<div class="detail-row" style="margin-top:12px">${c.visualNotes}</div>` : ""}
      </div>

      <div class="detail-block">
        <div class="detail-block-title"><i class="fa-solid fa-font"></i> Tipografía</div>
        ${c.font1 ? `<div class="detail-row"><strong>Display:</strong> ${c.font1}</div>` : ""}
        ${c.font2 ? `<div class="detail-row"><strong>Cuerpo:</strong> ${c.font2}</div>` : ""}
        ${c.font3 ? `<div class="detail-row"><strong>Acento:</strong> ${c.font3}</div>` : ""}
        ${c.fontScale ? `<div class="detail-row"><strong>Escala:</strong> ${c.fontScale}</div>` : ""}
        ${tonoTags ? `<div class="detail-tags" style="margin-top:10px">${tonoTags}</div>` : ""}
        ${c.fontNotes ? `<div class="detail-row" style="margin-top:10px">${c.fontNotes}</div>` : ""}
      </div>

      <div class="detail-block">
        <div class="detail-block-title"><i class="fa-solid fa-link"></i> Links del proyecto</div>
        <div class="detail-links">${linksHTML}</div>
      </div>

      <div class="detail-block">
        <div class="detail-block-title"><i class="fa-solid fa-note-sticky"></i> Notas internas</div>
        <div class="detail-notes">${c.notas || "—"}</div>
      </div>

    </div>
  `;

  openModal("modalVerCliente");
}

// ─── ELIMINAR CLIENTE ──────────────────────────
function eliminarClienteActual() {
  if (!clienteActualId) return;
  if (!confirm("¿Eliminar este cliente? Esta acción no se puede deshacer."))
    return;
  clientes = clientes.filter((c) => c.id !== clienteActualId);
  saveClientes();
  renderAll();
  closeModal("modalVerCliente");
  clienteActualId = null;
}

// ─── EDITAR CLIENTE ────────────────────────────
function editarClienteActual() {}

// ─── FILTRAR CLIENTES ──────────────────────────
function filtrarClientes(q) {
  const lower = q.toLowerCase();
  const filtrados = clientes.filter(
    (c) =>
      c.nombre.toLowerCase().includes(lower) ||
      (c.sector || "").toLowerCase().includes(lower) ||
      (c.contacto || "").toLowerCase().includes(lower),
  );
  renderClientGrid(filtrados);
}

// ─── STATS ─────────────────────────────────────
function updateStats() {
  document.getElementById("statTotal").textContent = clientes.length;
  document.getElementById("statInformes").textContent = informes.length;
  const completos = clientes.filter((c) => c.font1 && c.paleta?.length).length;
  document.getElementById("statPerfiles").textContent = completos;
}

// ─── INFORME SELECT ────────────────────────────
function renderInformeSelect() {
  const sel = document.getElementById("informeCliente");
  const current = sel.value;
  sel.innerHTML = '<option value="">— Elegir cliente —</option>';
  clientes.forEach((c) => {
    const opt = document.createElement("option");
    opt.value = c.id;
    opt.textContent = c.nombre;
    sel.appendChild(opt);
  });
  if (current) sel.value = current;
}

// ─── IR A INFORME DESDE CLIENTE ────────────────
function irAInformeCliente() {
  closeModal("modalVerCliente");
  showSection("informes");

  if (clienteActualId) {
    const sel = document.getElementById("informeCliente");
    sel.value = clienteActualId;

    // Autocompletar WhatsApp
    const c = clientes.find((x) => x.id === clienteActualId);
    if (c?.whatsapp) document.getElementById("informeWA").value = c.whatsapp;
  }
}

// ─── PREVIEW INFORME ───────────────────────────
function previewInforme() {
  const msg = buildMensaje();
  if (!msg) return;

  const box = document.getElementById("informePreview");
  document.getElementById("previewContent").textContent = msg;
  box.style.display = "block";
  box.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function buildMensaje() {
  const clienteId = document.getElementById("informeCliente").value;
  const titulo = document.getElementById("informeTitulo").value.trim();
  const contenido = document.getElementById("informeContenido").value.trim();

  if (!clienteId) {
    alert("Selecciona un cliente.");
    return null;
  }
  if (!titulo) {
    alert("Escribe el título del informe.");
    return null;
  }
  if (!contenido) {
    alert("Escribe el contenido del informe.");
    return null;
  }

  const cliente = clientes.find((c) => c.id === clienteId);
  const fecha = new Date().toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    `🎨 *ENFOCA2S STUDIOS*\n` +
    `━━━━━━━━━━━━━━━━━━━━━\n` +
    `📋 *${titulo}*\n` +
    `📅 ${fecha}\n` +
    `👤 Para: *${cliente.nombre}*\n` +
    `━━━━━━━━━━━━━━━━━━━━━\n\n` +
    `${contenido}\n\n` +
    `━━━━━━━━━━━━━━━━━━━━━\n` +
    `Con gusto, el equipo de *Enfoca2S Studios* ✨`
  );
}

// ─── ENVIAR POR WHATSAPP ───────────────────────
function enviarWhatsApp() {
  const msg = buildMensaje();
  if (!msg) return;

  let numero = document
    .getElementById("informeWA")
    .value.trim()
    .replace(/\D/g, "");
  if (!numero) {
    alert("Escribe el número de WhatsApp del cliente (con código de país).");
    return;
  }

  const texto = encodeURIComponent(msg);
  const url = `https://wa.me/${numero}?text=${texto}`;
  window.open(url, "_blank");

  // Guardar en historial
  const clienteId = document.getElementById("informeCliente").value;
  const cliente = clientes.find((c) => c.id === clienteId);
  const informe = {
    id: Date.now().toString(),
    clienteId,
    clienteNombre: cliente?.nombre || "—",
    titulo: document.getElementById("informeTitulo").value.trim(),
    mensaje: msg,
    numero,
    fecha: new Date().toLocaleDateString("es-CO", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
  };

  informes.unshift(informe);
  saveInformes();
  renderHistorial();
  updateStats();

  // Limpiar formulario
  document.getElementById("informeTitulo").value = "";
  document.getElementById("informeContenido").value = "";
  document.getElementById("informePreview").style.display = "none";
}

// ─── HISTORIAL ─────────────────────────────────
function renderHistorial() {
  const container = document.getElementById("historialInformes");
  container.innerHTML = "";

  if (!informes.length) {
    container.innerHTML = `<div style="color:var(--text-muted); font-size:13px; padding:16px 0;">No hay informes enviados aún.</div>`;
    return;
  }

  informes.slice(0, 20).forEach((inf) => {
    const item = document.createElement("div");
    item.className = "historial-item";
    item.innerHTML = `
      <div class="historial-info">
        <div class="historial-titulo">${inf.titulo}</div>
        <div class="historial-meta">📦 ${inf.clienteNombre} &nbsp;·&nbsp; 📅 ${inf.fecha} &nbsp;·&nbsp; 📱 +${inf.numero}</div>
      </div>
      <div class="historial-actions">
        <button class="btn-wa" onclick="reenviarInforme('${inf.id}')">
          <i class="fa-brands fa-whatsapp"></i> Reenviar
        </button>
      </div>
    `;
    container.appendChild(item);
  });
}

function reenviarInforme(id) {
  const inf = informes.find((i) => i.id === id);
  if (!inf) return;
  const url = `https://wa.me/${inf.numero}?text=${encodeURIComponent(inf.mensaje)}`;
  window.open(url, "_blank");
}
