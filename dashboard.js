// Dashboard state
const dashboardState = {
  automations: [],
  filteredAutomations: [],
  currentView: "table",
  zoomLevel: 1,
  nodes: [],
  panOffset: { x: 0, y: 0 },
}

// Initialize dashboard
document.addEventListener("DOMContentLoaded", init)

function init() {
  loadAutomations()
  renderAutomations()
  setupEventListeners()
  initCanvas()
}

function setupEventListeners() {
  // Search
  document.getElementById("searchInput").addEventListener("input", handleSearch)

  // View toggle
  document.querySelectorAll(".view-toggle-btn").forEach((btn) => {
    btn.addEventListener("click", handleViewToggle)
  })

  // Export buttons
  document.getElementById("exportCsvBtn").addEventListener("click", exportToCsv)
  document.getElementById("exportJsonBtn").addEventListener("click", exportToJson)
  document.getElementById("viewNodesBtn").addEventListener("click", showNodeMap)

  // Sidebar navigation
  document.querySelectorAll(".sidebar-item").forEach((item) => {
    item.addEventListener("click", handleSidebarNav)
  })

  // Logout
  document.getElementById("logoutBtn").addEventListener("click", () => {
    alert("Sesión cerrada")
    window.location.href = "index.html"
  })

  // Modals
  document
    .getElementById("closeNodeMap")
    .addEventListener("click", () => closeModal(document.getElementById("nodeMapModal")))
  document
    .getElementById("closeDetails")
    .addEventListener("click", () => closeModal(document.getElementById("detailsModal")))
  document
    .getElementById("closeDetailsBtn")
    .addEventListener("click", () => closeModal(document.getElementById("detailsModal")))

  // Canvas controls
  document.getElementById("zoomInBtn").addEventListener("click", () => adjustZoom(0.1))
  document.getElementById("zoomOutBtn").addEventListener("click", () => adjustZoom(-0.1))
  document.getElementById("resetZoomBtn").addEventListener("click", resetCanvasView)
}

function loadAutomations() {
  const stored = localStorage.getItem("automations")
  if (stored) {
    dashboardState.automations = JSON.parse(stored)
  } else {
    // Sample data for demonstration
    dashboardState.automations = [
      {
        id: 1,
        empresa: "Digital Riders",
        tipo: "Web existente",
        fecha: "2025-01-14",
        estado: "pending",
        data: {
          objective: "Lead generation",
          priority: "high",
          flows: [{ name: "Flujo de contacto", description: "Captura de leads desde formulario" }],
        },
      },
      {
        id: 2,
        empresa: "Agencia XYZ",
        tipo: "Personalizado",
        fecha: "2025-01-13",
        estado: "approved",
        data: {
          objective: "Automatización de ventas",
          priority: "critical",
          flows: [{ name: "Flujo de compra", description: "Proceso completo de checkout" }],
        },
      },
    ]
  }
  dashboardState.filteredAutomations = [...dashboardState.automations]
}

function saveAutomations() {
  localStorage.setItem("automations", JSON.stringify(dashboardState.automations))
}

function handleSearch(e) {
  const query = e.target.value.toLowerCase()
  dashboardState.filteredAutomations = dashboardState.automations.filter(
    (auto) => auto.empresa.toLowerCase().includes(query) || auto.tipo.toLowerCase().includes(query),
  )
  renderAutomations()
}

function handleViewToggle(e) {
  const viewType = e.target.dataset.viewType
  dashboardState.currentView = viewType

  document.querySelectorAll(".view-toggle-btn").forEach((btn) => btn.classList.remove("active"))
  e.target.classList.add("active")

  if (viewType === "table") {
    document.getElementById("tableView").style.display = "block"
    document.getElementById("cardsView").style.display = "none"
  } else {
    document.getElementById("tableView").style.display = "none"
    document.getElementById("cardsView").style.display = "grid"
  }

  renderAutomations()
}

function renderAutomations() {
  if (dashboardState.filteredAutomations.length === 0) {
    document.getElementById("emptyState").style.display = "block"
    document.getElementById("tableView").style.display = "none"
    document.getElementById("cardsView").style.display = "none"
    return
  }

  document.getElementById("emptyState").style.display = "none"

  if (dashboardState.currentView === "table") {
    renderTable()
  } else {
    renderCards()
  }
}

function renderTable() {
  const tbody = document.getElementById("tableBody")
  tbody.innerHTML = dashboardState.filteredAutomations
    .map(
      (auto) => `
    <tr>
      <td><strong>#${auto.id}</strong></td>
      <td>${auto.empresa}</td>
      <td>${auto.tipo}</td>
      <td>${formatDate(auto.fecha)}</td>
      <td><span class="status-badge status-${auto.estado}">${getStatusLabel(auto.estado)}</span></td>
      <td>
        <div class="action-buttons">
          <button class="action-btn" onclick="viewAutomation(${auto.id})" title="Ver detalles">
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
          <button class="action-btn" onclick="changeStatus(${auto.id})" title="Cambiar estado">
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button class="action-btn" onclick="deleteAutomation(${auto.id})" title="Eliminar">
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </td>
    </tr>
  `,
    )
    .join("")
}

function renderCards() {
  const cardsView = document.getElementById("cardsView")
  cardsView.innerHTML = dashboardState.filteredAutomations
    .map(
      (auto) => `
    <div class="automation-card">
      <div class="card-header">
        <div>
          <div class="card-title">${auto.empresa}</div>
          <div style="font-size: 0.75rem; color: var(--color-text-secondary); margin-top: 0.25rem;">#${auto.id}</div>
        </div>
        <span class="status-badge status-${auto.estado}">${getStatusLabel(auto.estado)}</span>
      </div>
      <div class="card-meta">
        <div><strong>Tipo:</strong> ${auto.tipo}</div>
        <div><strong>Fecha:</strong> ${formatDate(auto.fecha)}</div>
        <div><strong>Objetivo:</strong> ${auto.data?.objective || "N/A"}</div>
        <div><strong>Flujos:</strong> ${auto.data?.flows?.length || 0}</div>
      </div>
      <div class="card-actions">
        <button class="btn-secondary" style="flex: 1;" onclick="viewAutomation(${auto.id})">Ver detalles</button>
        <button class="btn-secondary" onclick="changeStatus(${auto.id})">Cambiar estado</button>
        <button class="action-btn" onclick="deleteAutomation(${auto.id})" title="Eliminar">
          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  `,
    )
    .join("")
}

function viewAutomation(id) {
  const auto = dashboardState.automations.find((a) => a.id === id)
  if (!auto) return

  const detailsContent = document.getElementById("detailsContent")
  detailsContent.innerHTML = `
    <div class="preview-section">
      <h4>Información General</h4>
      <div class="preview-item">
        <span class="preview-label">ID:</span>
        <span class="preview-value">#${auto.id}</span>
      </div>
      <div class="preview-item">
        <span class="preview-label">Empresa / Usuario:</span>
        <span class="preview-value">${auto.empresa}</span>
      </div>
      <div class="preview-item">
        <span class="preview-label">Tipo:</span>
        <span class="preview-value">${auto.tipo}</span>
      </div>
      <div class="preview-item">
        <span class="preview-label">Fecha:</span>
        <span class="preview-value">${formatDate(auto.fecha)}</span>
      </div>
      <div class="preview-item">
        <span class="preview-label">Estado:</span>
        <span class="preview-value"><span class="status-badge status-${auto.estado}">${getStatusLabel(auto.estado)}</span></span>
      </div>
    </div>

    ${
      auto.data
        ? `
      <div class="preview-section">
        <h4>Datos de la Automatización</h4>
        <div class="preview-item">
          <span class="preview-label">Objetivo:</span>
          <span class="preview-value">${auto.data.objective || "N/A"}</span>
        </div>
        <div class="preview-item">
          <span class="preview-label">Prioridad:</span>
          <span class="preview-value">${auto.data.priority || "N/A"}</span>
        </div>
        <div class="preview-item">
          <span class="preview-label">Responsable:</span>
          <span class="preview-value">${auto.data.responsible || "N/A"}</span>
        </div>
      </div>

      ${
        auto.data.flows && auto.data.flows.length > 0
          ? `
        <div class="preview-section">
          <h4>Flujos (${auto.data.flows.length})</h4>
          ${auto.data.flows
            .map(
              (flow) => `
            <div style="margin-bottom: 1rem; padding: 1rem; background: var(--color-background); border-radius: var(--radius-md);">
              <strong>${flow.name}</strong>
              <div style="margin-top: 0.5rem; color: var(--color-text-secondary); font-size: 0.875rem;">
                ${flow.description || "Sin descripción"}
              </div>
            </div>
          `,
            )
            .join("")}
        </div>
      `
          : ""
      }

      <div class="preview-section">
        <h4>JSON Completo</h4>
        <pre style="background: var(--color-background); padding: 1rem; border-radius: var(--radius-md); overflow-x: auto; font-size: 0.8125rem;">${JSON.stringify(auto.data, null, 2)}</pre>
      </div>
    `
        : ""
    }
  `

  openModal(document.getElementById("detailsModal"))
}

function changeStatus(id) {
  const auto = dashboardState.automations.find((a) => a.id === id)
  if (!auto) return

  const statuses = ["pending", "reviewed", "approved"]
  const currentIndex = statuses.indexOf(auto.estado)
  const nextIndex = (currentIndex + 1) % statuses.length
  auto.estado = statuses[nextIndex]

  saveAutomations()
  renderAutomations()
}

function deleteAutomation(id) {
  if (!confirm("¿Estás seguro de que quieres eliminar esta automatización?")) return

  dashboardState.automations = dashboardState.automations.filter((a) => a.id !== id)
  dashboardState.filteredAutomations = dashboardState.filteredAutomations.filter((a) => a.id !== id)

  saveAutomations()
  renderAutomations()
}

function exportToCsv() {
  let csv = "ID,Empresa,Tipo,Fecha,Estado,Objetivo,Prioridad,Flujos\n"

  dashboardState.automations.forEach((auto) => {
    csv += `"${auto.id}","${auto.empresa}","${auto.tipo}","${auto.fecha}","${getStatusLabel(auto.estado)}","${auto.data?.objective || "N/A"}","${auto.data?.priority || "N/A"}","${auto.data?.flows?.length || 0}"\n`
  })

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `automatizaciones-${Date.now()}.csv`
  a.click()
  URL.revokeObjectURL(url)

  showToast("Archivo CSV generado con éxito ✅")
}

function exportToJson() {
  const json = JSON.stringify(dashboardState.automations, null, 2)
  const blob = new Blob([json], { type: "application/json" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `automatizaciones-${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)

  showToast("Archivo JSON generado con éxito ✅")
}

function showToast(message) {
  const toast = document.createElement("div")
  toast.style.cssText = `
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    background: var(--color-primary);
    color: white;
    padding: 1rem 1.5rem;
    border-radius: var(--radius-md);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    z-index: 10000;
    animation: slideIn 0.3s ease;
  `
  toast.textContent = message
  document.body.appendChild(toast)

  setTimeout(() => {
    toast.style.animation = "slideOut 0.3s ease"
    setTimeout(() => toast.remove(), 300)
  }, 3000)
}

// Canvas for node visualization
let canvas, ctx

function initCanvas() {
  canvas = document.getElementById("nodeCanvas")
  ctx = canvas.getContext("2d")

  canvas.addEventListener("wheel", handleCanvasWheel)
}

function showNodeMap() {
  generateNodesFromAutomations()
  openModal(document.getElementById("nodeMapModal"))
  resizeCanvas()
  drawCanvas()
}

function resizeCanvas() {
  const rect = canvas.getBoundingClientRect()
  canvas.width = rect.width
  canvas.height = rect.height
}

function generateNodesFromAutomations() {
  dashboardState.nodes = []

  const centerX = canvas.width / 2
  const centerY = canvas.height / 2
  const radius = Math.min(canvas.width, canvas.height) / 3

  dashboardState.automations.forEach((auto, index) => {
    const angle = (index / dashboardState.automations.length) * Math.PI * 2
    const x = centerX + Math.cos(angle) * radius
    const y = centerY + Math.sin(angle) * radius

    let color = "#fbbf24" // pending
    if (auto.estado === "reviewed") color = "#3b82f6"
    if (auto.estado === "approved") color = "#10b981"

    dashboardState.nodes.push({
      id: auto.id,
      name: auto.empresa,
      x: x,
      y: y,
      radius: 60,
      color: color,
      data: auto,
    })
  })
}

function drawCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  ctx.save()
  ctx.translate(dashboardState.panOffset.x, dashboardState.panOffset.y)
  ctx.scale(dashboardState.zoomLevel, dashboardState.zoomLevel)

  dashboardState.nodes.forEach((node) => {
    drawNode(node)
  })

  ctx.restore()
}

function drawNode(node) {
  ctx.beginPath()
  ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2)
  ctx.fillStyle = node.color
  ctx.fill()
  ctx.strokeStyle = "#ffffff"
  ctx.lineWidth = 3
  ctx.stroke()

  ctx.fillStyle = "#ffffff"
  ctx.font = "bold 14px sans-serif"
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"

  const maxWidth = node.radius * 1.6
  wrapText(ctx, node.name, node.x, node.y, maxWidth, 16)
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(" ")
  let line = ""
  const lines = []

  words.forEach((word) => {
    const testLine = line + word + " "
    const metrics = ctx.measureText(testLine)
    if (metrics.width > maxWidth && line !== "") {
      lines.push(line)
      line = word + " "
    } else {
      line = testLine
    }
  })
  lines.push(line)

  const startY = y - ((lines.length - 1) * lineHeight) / 2
  lines.forEach((line, index) => {
    ctx.fillText(line.trim(), x, startY + index * lineHeight)
  })
}

function adjustZoom(delta) {
  dashboardState.zoomLevel = Math.max(0.5, Math.min(2, dashboardState.zoomLevel + delta))
  drawCanvas()
}

function handleCanvasWheel(e) {
  e.preventDefault()
  const delta = e.deltaY > 0 ? -0.05 : 0.05
  adjustZoom(delta)
}

function resetCanvasView() {
  dashboardState.panOffset = { x: 0, y: 0 }
  dashboardState.zoomLevel = 1
  drawCanvas()
}

// Utility functions
function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString("es-ES", { year: "numeric", month: "short", day: "numeric" })
}

function getStatusLabel(status) {
  const labels = {
    pending: "Pendiente",
    reviewed: "Revisada",
    approved: "Aprobada",
  }
  return labels[status] || status
}

function handleSidebarNav(e) {
  e.preventDefault()
  document.querySelectorAll(".sidebar-item").forEach((item) => item.classList.remove("active"))
  e.currentTarget.classList.add("active")
}

function openModal(modal) {
  modal.classList.add("active")
}

function closeModal(modal) {
  modal.classList.remove("active")
}

window.addEventListener("click", (e) => {
  if (e.target.classList.contains("modal")) {
    closeModal(e.target)
  }
})
