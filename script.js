// Estado global de la aplicación
const appState = {
  automationType: null,
  flows: [],
  relations: [],
  flowCounter: 0,
  relationCounter: 0,
  zoomLevel: 1,
  wizardStep: 0,
  wizardData: {},
};

const templates = [
  {
    id: "post-purchase",
    name: "Automatización post-compra",
    description: "Secuencia completa de seguimiento después de una compra",
    flows: [
      {
        name: "Flujo 1: Confirmación de compra",
        objective: "Notificar al cliente de su compra",
        page: "/checkout",
        description:
          "Enviar correo de confirmación con detalles de la compra y número de orden",
        trigger: "form-submit",
        action: "send-email",
        conditions: "Pago exitoso",
        dependencies: "Servicio de email (SendGrid, Mailgun)",
        activatedBy: "Al completar el pago",
      },
      {
        name: "Flujo 2: Notificación interna",
        objective: "Avisar al equipo de ventas",
        page: "/checkout",
        description:
          "Alertar al equipo de ventas sobre nueva compra con datos del cliente",
        trigger: "form-submit",
        action: "send-notification",
        conditions: "",
        dependencies: "Slack, Email interno",
        activatedBy: "Después del Flujo 1",
      },
      {
        name: "Flujo 3: Registro en CRM",
        objective: "Actualizar base de datos de clientes",
        page: "/checkout",
        description:
          "Crear o actualizar contacto en CRM con tag 'Cliente' y datos de compra",
        trigger: "form-submit",
        action: "create-contact",
        conditions: "",
        dependencies: "CRM (ActiveCampaign, HubSpot)",
        activatedBy: "Al mismo tiempo que Flujo 1",
      },
    ],
  },
  {
    id: "masterclass-sequence",
    name: "Secuencia de Masterclass",
    description: "Automatización completa para eventos educativos online",
    flows: [
      {
        name: "Flujo 1: Bienvenida",
        objective: "Entregar enlace de acceso al evento",
        page: "/registro-masterclass",
        description:
          "Enviar correo de bienvenida con enlace de Zoom/Meet y materiales preparatorios",
        trigger: "form-submit",
        action: "send-email",
        conditions: "Email válido",
        dependencies: "Servicio de email, Zoom API",
        activatedBy: "Al registrarse en el formulario",
      },
      {
        name: "Flujo 2: Recordatorio",
        objective: "Recordar asistencia al evento",
        page: "/registro-masterclass",
        description:
          "Enviar recordatorio 24 horas antes con enlace y agenda del evento",
        trigger: "time-based",
        action: "send-email",
        conditions: "Usuario registrado y no canceló",
        dependencies: "Servicio de email, Calendario",
        activatedBy: "Un día antes del evento",
      },
      {
        name: "Flujo 3: Seguimiento",
        objective: "Recopilar feedback y ofrecer recursos",
        page: "/registro-masterclass",
        description:
          "Enviar encuesta de satisfacción y materiales adicionales después del evento",
        trigger: "time-based",
        action: "send-email",
        conditions: "Evento finalizado",
        dependencies: "Servicio de email, Google Forms",
        activatedBy: "Después del evento (2-4 horas)",
      },
    ],
  },
  {
    id: "lead-nurturing",
    name: "Nutrición de Leads",
    description: "Secuencia de emails para convertir leads en clientes",
    flows: [
      {
        name: "Flujo 1: Captura inicial",
        objective: "Registrar nuevo lead en el sistema",
        page: "/lead-magnet",
        description:
          "Capturar email y crear contacto en CRM con tag 'Lead-Nuevo'",
        trigger: "form-submit",
        action: "create-contact",
        conditions: "Email no existe en base de datos",
        dependencies: "CRM, Base de datos",
        activatedBy: "Al descargar lead magnet",
      },
      {
        name: "Flujo 2: Email de bienvenida",
        objective: "Entregar recurso prometido y presentar marca",
        page: "/lead-magnet",
        description:
          "Enviar email con link de descarga y presentación de la empresa",
        trigger: "form-submit",
        action: "send-email",
        conditions: "",
        dependencies: "Servicio de email",
        activatedBy: "Inmediatamente después de Flujo 1",
      },
      {
        name: "Flujo 3: Contenido educativo (Día 3)",
        objective: "Educar sobre el problema que resolvemos",
        page: "/lead-magnet",
        description: "Enviar caso de estudio o artículo relevante",
        trigger: "time-based",
        action: "send-email",
        conditions: "Lead no se dio de baja",
        dependencies: "Servicio de email marketing",
        activatedBy: "3 días después del registro",
      },
      {
        name: "Flujo 4: Oferta comercial (Día 7)",
        objective: "Presentar solución y llamado a la acción",
        page: "/lead-magnet",
        description:
          "Enviar email con oferta especial y link a página de ventas",
        trigger: "time-based",
        action: "send-email",
        conditions: "Lead no compró aún",
        dependencies: "Servicio de email, CRM",
        activatedBy: "7 días después del registro",
      },
    ],
  },
  {
    id: "abandoned-cart",
    name: "Recuperación de Carrito Abandonado",
    description: "Secuencia para recuperar ventas perdidas",
    flows: [
      {
        name: "Flujo 1: Detección de abandono",
        objective: "Identificar carritos abandonados",
        page: "/checkout",
        description:
          "Registrar cuando usuario abandona checkout sin completar compra",
        trigger: "page-load",
        action: "update-database",
        conditions: "Usuario salió sin comprar",
        dependencies: "Base de datos, Tracking",
        activatedBy: "Al salir de la página de checkout",
      },
      {
        name: "Flujo 2: Primer recordatorio (1 hora)",
        objective: "Recordar productos en carrito",
        page: "/checkout",
        description: "Enviar email recordando productos y ofreciendo ayuda",
        trigger: "time-based",
        action: "send-email",
        conditions: "Carrito no completado",
        dependencies: "Servicio de email, Base de datos",
        activatedBy: "1 hora después del abandono",
      },
      {
        name: "Flujo 3: Incentivo (24 horas)",
        objective: "Ofrecer descuento para cerrar venta",
        page: "/checkout",
        description:
          "Enviar cupón de descuento del 10% con urgencia (válido 48h)",
        trigger: "time-based",
        action: "send-email",
        conditions: "Carrito aún no completado",
        dependencies: "Servicio de email, Sistema de cupones",
        activatedBy: "24 horas después del abandono",
      },
    ],
  },
  {
    id: "onboarding-saas",
    name: "Onboarding de Usuario SaaS",
    description: "Guiar nuevos usuarios en sus primeros pasos",
    flows: [
      {
        name: "Flujo 1: Bienvenida y activación",
        objective: "Dar bienvenida y guiar primer uso",
        page: "/registro",
        description:
          "Enviar email de bienvenida con guía de inicio rápido y video tutorial",
        trigger: "form-submit",
        action: "send-email",
        conditions: "Cuenta creada exitosamente",
        dependencies: "Servicio de email, CRM",
        activatedBy: "Al crear cuenta",
      },
      {
        name: "Flujo 2: Recordatorio de configuración",
        objective: "Incentivar completar perfil",
        page: "/dashboard",
        description: "Recordar completar configuración si no lo hizo en 24h",
        trigger: "time-based",
        action: "send-email",
        conditions: "Perfil incompleto",
        dependencies: "Servicio de email, Base de datos",
        activatedBy: "24 horas después del registro",
      },
      {
        name: "Flujo 3: Tips de uso (Día 3)",
        objective: "Educar sobre funcionalidades clave",
        page: "/dashboard",
        description:
          "Enviar tips y mejores prácticas para aprovechar la plataforma",
        trigger: "time-based",
        action: "send-email",
        conditions: "Usuario activo",
        dependencies: "Servicio de email",
        activatedBy: "3 días después del registro",
      },
      {
        name: "Flujo 4: Solicitud de feedback",
        objective: "Recopilar opiniones para mejorar",
        page: "/dashboard",
        description:
          "Enviar encuesta de satisfacción y ofrecer soporte personalizado",
        trigger: "time-based",
        action: "send-email",
        conditions: "Usuario completó al menos una acción",
        dependencies: "Servicio de email, Herramienta de encuestas",
        activatedBy: "7 días después del registro",
      },
    ],
  },
];

// Elementos del DOM
const form = document.getElementById("automationForm");
const dynamicContent = document.getElementById("dynamicContent");
const flowsSection = document.getElementById("flowsSection");
const flowsList = document.getElementById("flowsList");
const relationsSection = document.getElementById("relationsSection");
const relationsList = document.getElementById("relationsList");
const previewModal = document.getElementById("previewModal");
const nodeMapModal = document.getElementById("nodeMapModal");
const simulationModal = document.getElementById("simulationModal");
const templatesModal = document.getElementById("templatesModal");
const wizardModal = document.getElementById("wizardModal");
const dbModal = document.getElementById("dbModal");

// Event Listeners
document.addEventListener("DOMContentLoaded", () => {
  const radios = document.querySelectorAll('input[name="automationType"]');
  radios.forEach((r) => (r.checked = false));
});

document.addEventListener("DOMContentLoaded", init);

function init() {
  // Radio buttons para tipo de automatización
  document.querySelectorAll('input[name="automationType"]').forEach((radio) => {
    radio.addEventListener("change", handleAutomationTypeChange);
  });

  // Botones principales
  document.getElementById("addFlowBtn").addEventListener("click", addFlow);
  document
    .getElementById("addRelationBtn")
    .addEventListener("click", addRelation);
  document.getElementById("previewBtn").addEventListener("click", showPreview);
  document.getElementById("viewMapBtn").addEventListener("click", showNodeMap);
  document.getElementById("exportCsvBtn").addEventListener("click", exportCsv);

  document
    .getElementById("openTemplatesBtn")
    .addEventListener("click", showTemplates);
  document
    .getElementById("openWizardBtn")
    .addEventListener("click", showWizard);
  document.getElementById("sendToDbBtn").addEventListener("click", showDbModal);

  // Modales
  document
    .getElementById("closePreview")
    .addEventListener("click", () => closeModal(previewModal));
  document
    .getElementById("closeNodeMap")
    .addEventListener("click", () => closeModal(nodeMapModal));
  document
    .getElementById("closeSimulation")
    .addEventListener("click", () => closeModal(simulationModal));
  document
    .getElementById("closeTemplates")
    .addEventListener("click", () => closeModal(templatesModal));
  document
    .getElementById("closeWizard")
    .addEventListener("click", () => closeModal(wizardModal));
  document
    .getElementById("closeDb")
    .addEventListener("click", () => closeModal(dbModal));

  // Tabs de preview
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", handleTabChange);
  });

  // Botones de preview
  document.getElementById("copyJsonBtn").addEventListener("click", copyJson);
  document
    .getElementById("downloadJsonBtn")
    .addEventListener("click", downloadJson);
  document
    .getElementById("exportCsvModalBtn")
    .addEventListener("click", exportCsv);

  document
    .getElementById("cancelDbSend")
    .addEventListener("click", () => closeModal(dbModal));
  document
    .getElementById("confirmDbSend")
    .addEventListener("click", sendToDatabase);

  document
    .getElementById("wizardNextBtn")
    .addEventListener("click", wizardNext);
  document
    .getElementById("wizardPrevBtn")
    .addEventListener("click", wizardPrev);

  // Submit del formulario
  form.addEventListener("submit", handleFormSubmit);

  // Canvas
  initCanvas();
}

// Manejo del cambio de tipo de automatización
function handleAutomationTypeChange(e) {
  appState.automationType = e.target.value;
  renderDynamicContent();
  flowsSection.style.display = "block";
  relationsSection.style.display = "block";
}

function renderDynamicContent() {
  // Add fade out animation
  dynamicContent.classList.add("fade-exit");

  setTimeout(() => {
    dynamicContent.innerHTML = "";

    switch (appState.automationType) {
      case "existing":
        renderExistingWebContent();
        break;
      case "development":
        renderDevelopmentContent();
        break;
      case "custom":
        renderCustomContent();
        break;
    }

    // Add fade in animation
    dynamicContent.classList.remove("fade-exit");
    dynamicContent.classList.add("fade-enter");
  }, 150);
}

function renderExistingWebContent() {
  dynamicContent.innerHTML = `
        <div class="form-group">
            <label class="form-label" for="websiteUrl">URL del sitio web</label>
            <input type="url" id="websiteUrl" class="form-input" placeholder="https://ejemplo.com" required>
            <span class="helper-text">Ingresa la dirección completa de tu sitio web en producción</span>
        </div>
        <div class="form-group">
            <label class="form-label" for="pages">Páginas a automatizar (separadas por coma)</label>
            <input type="text" id="pages" class="form-input" placeholder="Inicio, Contacto, Productos..." required>
            <span class="helper-text">Ejemplo: Inicio, Contacto, Checkout, Gracias</span>
        </div>
    `;
}

function renderDevelopmentContent() {
  dynamicContent.innerHTML = `
        <div class="form-group">
            <label class="form-label" for="projectName">Nombre del proyecto o dominio</label>
            <input type="text" id="projectName" class="form-input" placeholder="Mi Proyecto Web" required>
            <span class="helper-text">El nombre de tu proyecto o el dominio que planeas usar</span>
        </div>
        <div class="form-group">
            <label class="form-label" for="projectDescription">Descripción del proyecto</label>
            <textarea id="projectDescription" class="form-textarea" placeholder="Describe brevemente el proyecto..." required></textarea>
            <span class="helper-text">Explica de qué trata tu proyecto y qué objetivos tiene</span>
        </div>
    `;
}

function renderCustomContent() {
  dynamicContent.innerHTML = `
        <div class="form-group">
            <label class="form-label" for="customDescription">Descripción del flujo personalizado</label>
            <textarea id="customDescription" class="form-textarea" placeholder="Describe el flujo de automatización..." required></textarea>
            <span class="helper-text">Ejemplo: Cuando un usuario se registra, enviar correo de bienvenida y crear contacto en CRM</span>
        </div>
        <div class="form-group">
            <label class="form-label" for="tools">Herramientas o sistemas involucrados</label>
            <input type="text" id="tools" class="form-input" placeholder="ActiveCampaign, Google Sheets, WhatsApp API..." required>
            <span class="helper-text">Lista las plataformas o servicios que se conectarán en este flujo</span>
        </div>
        <div class="form-group">
            <label class="form-label" for="dataSource">Origen de datos</label>
            <select id="dataSource" class="form-select" required>
                <option value="">Seleccionar...</option>
                <option value="api">API (conexión automática)</option>
                <option value="form">Formulario web</option>
                <option value="database">Base de datos interna</option>
                <option value="webhook">Webhook (notificación externa)</option>
                <option value="manual">Entrada manual</option>
            </select>
            <span class="helper-text">¿De dónde provienen los datos que activarán esta automatización?</span>
        </div>
        <div class="form-group">
            <label class="form-label" for="frequency">Frecuencia o evento de ejecución</label>
            <select id="frequency" class="form-select" required>
                <option value="">Seleccionar...</option>
                <option value="daily">Diaria</option>
                <option value="weekly">Semanal</option>
                <option value="event">Por evento (cuando algo sucede)</option>
                <option value="manual">Manual (activación por usuario)</option>
                <option value="realtime">Tiempo real (inmediato)</option>
            </select>
            <span class="helper-text">¿Con qué frecuencia o bajo qué condición se ejecutará?</span>
        </div>
        <div class="form-group">
            <label class="form-label" for="expectedResult">Resultado esperado o acción final</label>
            <textarea id="expectedResult" class="form-textarea" placeholder="¿Qué debe suceder al final del flujo?" required></textarea>
            <span class="helper-text">Ejemplo: El usuario recibe un correo y se agrega a la lista de clientes potenciales</span>
        </div>
    `;
}

function addFlow() {
  appState.flowCounter++;
  const flowId = `flow-${appState.flowCounter}`;

  const flowCard = document.createElement("div");
  flowCard.className = "flow-card";
  flowCard.dataset.flowId = flowId;

  // Determine if we should show page field based on automation type
  const showPageField = appState.automationType !== "custom";

  flowCard.innerHTML = `
        <details open>
            <summary>
                <div class="summary-header">
                    <span class="flow-number">${appState.flowCounter}</span>
                    <span>Flujo de Automatización #${
                      appState.flowCounter
                    }</span>
                </div>
                <button type="button" class="btn-remove" onclick="event.preventDefault(); event.stopPropagation(); removeFlow('${flowId}')" title="Eliminar flujo">&times;</button>
            </summary>
            <div class="flow-content">
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Nombre del flujo</label>
                        <input type="text" class="form-input" data-field="name" placeholder="Ej: Registro de usuario" required>
                        <span class="helper-text">Un nombre descriptivo para identificar este flujo</span>
                    </div>
                    ${
                      showPageField
                        ? `
                    <div class="form-group">
                        <label class="form-label">Página/Sección</label>
                        <input type="text" class="form-input" data-field="page" placeholder="Ej: /registro" required>
                        <span class="helper-text">¿En qué página ocurre este flujo?</span>
                    </div>
                    `
                        : ""
                    }
                </div>
                <div class="form-group">
                    <label class="form-label">Descripción del flujo</label>
                    <textarea class="form-textarea" data-field="description" placeholder="Describe qué hace este flujo..." required></textarea>
                    <span class="helper-text">Explica paso a paso qué sucede en este flujo</span>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Evento que inicia la automatización</label>
                        <select class="form-select" data-field="trigger" required>
                            <option value="">Seleccionar...</option>
                            <option value="form-submit">Envío de formulario</option>
                            <option value="click">Clic en elemento</option>
                            <option value="scroll">Scroll en la página</option>
                            <option value="page-load">Carga de página</option>
                            <option value="webhook">Webhook (notificación externa)</option>
                            <option value="time-based">Basado en tiempo</option>
                        </select>
                        <span class="helper-text">¿Qué acción del usuario o evento inicia este flujo?</span>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Qué debe ocurrir después</label>
                        <select class="form-select" data-field="action" required>
                            <option value="">Seleccionar...</option>
                            <option value="send-email">Enviar correo electrónico</option>
                            <option value="add-tag">Añadir etiqueta al contacto</option>
                            <option value="create-contact">Crear contacto en CRM</option>
                            <option value="update-database">Actualizar base de datos</option>
                            <option value="send-notification">Enviar notificación</option>
                            <option value="api-call">Llamada a API externa</option>
                        </select>
                        <span class="helper-text">La acción principal que se ejecutará</span>
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label">Condición especial o regla</label>
                    <input type="text" class="form-input" data-field="conditions" placeholder="Ej: Solo si el usuario no tiene tag X">
                    <span class="helper-text">Opcional: ¿Hay alguna condición que deba cumplirse?</span>
                </div>
                <div class="form-group">
                    <label class="form-label">Conexiones con otras herramientas</label>
                    <input type="text" class="form-input" data-field="dependencies" placeholder="Campos o integraciones requeridas">
                    <span class="helper-text">Ejemplo: ActiveCampaign, Google Sheets, API de WhatsApp</span>
                </div>
                <div class="form-group">
                    <label class="form-label">¿Se conecta con otra automatización?</label>
                    <select class="form-select" data-field="connectedFlow">
                        <option value="">No</option>
                    </select>
                    <span class="helper-text">Si este flujo activa o depende de otro flujo</span>
                </div>
            </div>
        </details>
    `;

  flowsList.appendChild(flowCard);
  updateFlowSelectors();
}

// Remover flujo
function removeFlow(flowId) {
  const flowCard = document.querySelector(`[data-flow-id="${flowId}"]`);
  if (flowCard) {
    flowCard.remove();
    updateFlowSelectors();
  }
}

// Actualizar selectores de flujos conectados
function updateFlowSelectors() {
  const flows = document.querySelectorAll(".flow-card");
  if (flows.length === 0) return;

  flows.forEach((flow) => {
    const selector = flow.querySelector('[data-field="connectedFlow"]');
    if (!selector) return;

    const currentFlowId = flow.dataset.flowId;
    selector.innerHTML = '<option value="">No</option>';

    flows.forEach((otherFlow) => {
      if (!otherFlow || otherFlow.dataset.flowId === currentFlowId) return;

      const nameField = otherFlow.querySelector('[data-field="name"]');
      const flowNumber = otherFlow.querySelector(".flow-number");

      const name =
        nameField?.value?.trim() ||
        (flowNumber ? `Flujo #${flowNumber.textContent}` : "Flujo sin nombre");

      // Solo agregar si name no está vacío
      if (name && selector) {
        const opt = document.createElement("option");
        opt.value = otherFlow.dataset.flowId;
        opt.textContent = name;
        selector.appendChild(opt);
      }
    });
  });
}

// Agregar relación
function addRelation() {
  appState.relationCounter++;
  const relationId = `relation-${appState.relationCounter}`;

  const relationCard = document.createElement("div");
  relationCard.className = "relation-card";
  relationCard.dataset.relationId = relationId;
  relationCard.innerHTML = `
        <details open>
            <summary>
                <span>Relación #${appState.relationCounter}</span>
                <button type="button" class="btn-remove" onclick="event.preventDefault(); event.stopPropagation(); removeRelation('${relationId}')" title="Eliminar relación">&times;</button>
            </summary>
            <div class="relation-content">
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Flujo origen</label>
                        <select class="form-select" data-field="sourceFlow" required>
                            <option value="">Seleccionar flujo...</option>
                        </select>
                        <span class="helper-text">El flujo que inicia la relación</span>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Tipo de relación</label>
                        <select class="form-select" data-field="relationType" required>
                            <option value="">Seleccionar...</option>
                            <option value="after">Se ejecuta después</option>
                            <option value="simultaneous">Al mismo tiempo</option>
                            <option value="triggered-by">Se activa por evento de</option>
                            <option value="conditional">Condicional</option>
                        </select>
                        <span class="helper-text">¿Cómo se relacionan estos flujos?</span>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Flujo destino</label>
                        <select class="form-select" data-field="targetFlow" required>
                            <option value="">Seleccionar flujo...</option>
                        </select>
                        <span class="helper-text">El flujo que recibe la acción</span>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Condición de enlace (opcional)</label>
                        <input type="text" class="form-input" data-field="linkCondition" placeholder="Ej: Solo si usuario clickeó correo X">
                        <span class="helper-text">¿Hay alguna condición para que se active?</span>
                    </div>
                </div>
            </div>
        </details>
    `;

  relationsList.appendChild(relationCard);
  updateRelationFlowSelectors();
}

// Remover relación
function removeRelation(relationId) {
  const relationCard = document.querySelector(
    `[data-relation-id="${relationId}"]`
  );
  if (relationCard) {
    relationCard.remove();
  }
}

// Actualizar selectores de flujos en relaciones
function updateRelationFlowSelectors() {
  const flows = document.querySelectorAll(".flow-card");
  const relations = document.querySelectorAll(".relation-card");
  if (relations.length === 0 || flows.length === 0) return;

  relations.forEach((relation) => {
    const sourceSelector = relation.querySelector('[data-field="sourceFlow"]');
    const targetSelector = relation.querySelector('[data-field="targetFlow"]');
    if (!sourceSelector || !targetSelector) return;

    sourceSelector.innerHTML = '<option value="">Seleccionar flujo...</option>';
    targetSelector.innerHTML = '<option value="">Seleccionar flujo...</option>';

    flows.forEach((flow) => {
      if (!flow) return;

      const nameField = flow.querySelector('[data-field="name"]');
      const flowNumber = flow.querySelector(".flow-number");
      const name =
        nameField?.value?.trim() ||
        (flowNumber ? `Flujo #${flowNumber.textContent}` : "Flujo sin nombre");

      const flowId = flow.dataset.flowId || "";
      if (!flowId) return;

      const optionHTML = `<option value="${flowId}">${name}</option>`;
      sourceSelector.insertAdjacentHTML("beforeend", optionHTML);
      targetSelector.insertAdjacentHTML("beforeend", optionHTML);
    });
  });
}

// Recopilar datos del formulario
function collectFormData() {
  const userInput = document.getElementById("userName");
  const companyInput = document.getElementById("companyName");
  const typeInput = document.querySelector(
    'input[name="automationType"]:checked'
  );

  const userName = userInput ? userInput.value.trim() : "";
  const companyName = companyInput ? companyInput.value.trim() : "";
  const automationType = typeInput ? typeInput.value : "sin definir";

  const flows = collectFlowsSafely();
  const relations = collectRelationsSafely();

  return {
    userName,
    companyName,
    automationType,
    flows,
    relations,
  };
}

function collectFlowsSafely() {
  const flows = [];
  document.querySelectorAll(".flow-card").forEach((flow) => {
    const nameInput = flow.querySelector('[data-field="name"]');
    const actionInput = flow.querySelector('[data-field="action"]');
    const triggerInput = flow.querySelector('[data-field="trigger"]');

    flows.push({
      name: nameInput ? nameInput.value : "",
      trigger: triggerInput ? triggerInput.value : "",
      action: actionInput ? actionInput.value : "",
    });
  });
  return flows;
}

function collectRelationsSafely() {
  const relations = [];
  document.querySelectorAll(".relation-card").forEach((rel) => {
    const condition = rel.querySelector('[data-field="condition"]');
    const type = rel.querySelector('[data-field="type"]');
    relations.push({
      type: type ? type.value : "",
      condition: condition ? condition.value : "",
    });
  });
  return relations;
}

// Mostrar vista previa
function showPreview() {
  if (!validateForm()) {
    alert(
      "Por favor completa todos los campos requeridos antes de ver la vista previa."
    );
    return;
  }

  const data = collectFormData();
  const jsonPreview = document.getElementById("jsonPreview");
  jsonPreview.textContent = JSON.stringify(data, null, 2);

  renderVisualPreview(data);
  openModal(previewModal);
}

function validateForm() {
  let isValid = true;

  const requiredFields = ["responsible", "implementationDate"];
  requiredFields.forEach((fieldId) => {
    const field = document.getElementById(fieldId);
    if (field && !field.value.trim()) {
      field.classList.add("error");
      isValid = false;
    } else if (field) {
      field.classList.remove("error");
    }
  });

  const dynamicInputs = dynamicContent.querySelectorAll(
    "input[required], select[required], textarea[required]"
  );
  dynamicInputs.forEach((input) => {
    if (!input.value.trim()) {
      input.classList.add("error");
      isValid = false;
    } else {
      input.classList.remove("error");
    }
  });

  document.querySelectorAll(".flow-card").forEach((flowCard) => {
    flowCard
      .querySelectorAll("input[required], select[required], textarea[required]")
      .forEach((input) => {
        if (!input.value.trim()) {
          input.classList.add("error");
          isValid = false;
        } else {
          input.classList.remove("error");
        }
      });
  });

  document.querySelectorAll(".relation-card").forEach((relationCard) => {
    relationCard.querySelectorAll("select[required]").forEach((select) => {
      if (!select.value.trim()) {
        select.classList.add("error");
        isValid = false;
      } else {
        select.classList.remove("error");
      }
    });
  });

  return isValid;
}

// Renderizar vista visual
function renderVisualPreview(data) {
  const visualPreview = document.getElementById("visualPreview");
  visualPreview.innerHTML = `
        <div class="preview-section">
            <h4>Información General</h4>
            <div class="preview-item">
                <span class="preview-label">Tipo de automatización:</span>
                <span class="preview-value">${getAutomationTypeLabel(
                  data.automationType
                )}</span>
            </div>
            <div class="preview-item">
              <span class="preview-label">Nombre:</span>
              <span class="preview-value">${data.userName || "Sin especificar"}</span>
            </div>
            <div class="preview-item">
              <span class="preview-label">Empresa:</span>
              <span class="preview-value">${data.companyName || "Sin especificar"}</span>
            </div>

            <div class="preview-item">
                <span class="preview-label">Responsable:</span>
                <span class="preview-value">${data.responsible}</span>
            </div>
            <div class="preview-item">
                <span class="preview-label">Fecha de implementación:</span>
                <span class="preview-value">${data.implementationDate}</span>
            </div>
        </div>
        
        ${
          data.flows.length > 0
            ? `
            <div class="preview-section">
                <h4>Flujos de Automatización (${data.flows.length})</h4>
                ${data.flows
                  .map(
                    (flow) => `
                    <div style="margin-bottom: 1rem; padding: 1rem; background: var(--color-background); border-radius: var(--radius-md);">
                        <strong>${flow.name}</strong>
                        <div style="margin-top: 0.5rem; color: var(--color-text-secondary); font-size: 0.875rem;">
                            ${flow.description}
                        </div>
                    </div>
                `
                  )
                  .join("")}
            </div>
        `
            : ""
        }
        
        ${
          data.relations.length > 0
            ? `
            <div class="preview-section">
                <h4>Relaciones (${data.relations.length})</h4>
                ${data.relations
                  .map(
                    (relation) => `
                    <div style="margin-bottom: 0.5rem; padding: 0.75rem; background: var(--color-background); border-radius: var(--radius-md); font-size: 0.875rem;">
                        ${getFlowName(
                          relation.sourceFlow,
                          data.flows
                        )} → ${getRelationTypeLabel(
                      relation.relationType
                    )} → ${getFlowName(relation.targetFlow, data.flows)}
                    </div>
                `
                  )
                  .join("")}
            </div>
        `
            : ""
        }
    `;
}

// Funciones auxiliares para labels
function getAutomationTypeLabel(type) {
  const labels = {
    existing: "Para una web existente",
    development: "Para una web en desarrollo",
    custom: "Flujo personalizado",
  };
  return labels[type] || type;
}

function getPriorityLabel(priority) {
  const labels = {
    low: "Baja",
    medium: "Media",
    high: "Alta",
    critical: "Crítica",
  };
  return labels[priority] || priority;
}

function getRelationTypeLabel(type) {
  const labels = {
    after: "Se ejecuta después",
    simultaneous: "Al mismo tiempo",
    "triggered-by": "Se activa por evento de",
    conditional: "Condicional",
  };
  return labels[type] || type;
}

function getFlowName(flowId, flows) {
  const flow = flows.find((f) => f.id === flowId);
  return flow ? flow.name : "Desconocido";
}

// Manejo de tabs
function handleTabChange(e) {
  const tabName = e.target.dataset.tab;

  document
    .querySelectorAll(".tab-btn")
    .forEach((btn) => btn.classList.remove("active"));
  document
    .querySelectorAll(".tab-content")
    .forEach((content) => content.classList.remove("active"));

  e.target.classList.add("active");
  document.getElementById(`${tabName}Tab`).classList.add("active");
}

// Copiar JSON
function copyJson() {
  const jsonText = document.getElementById("jsonPreview").textContent;
  navigator.clipboard.writeText(jsonText).then(() => {
    alert("JSON copiado al portapapeles");
  });
}

// Descargar JSON
function downloadJson() {
  const jsonText = document.getElementById("jsonPreview").textContent;
  const blob = new Blob([jsonText], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `automatizacion-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function exportCsv() {
  const data = collectFormData();

  // Create CSV content
  let csv =
    "Tipo de Automatización,Objetivo,Prioridad,Responsable,Fecha de Implementación\n";
  csv += `"${getAutomationTypeLabel(data.automationType)}","${
    data.objective
  }","${getPriorityLabel(data.priority)}","${data.responsible}","${
    data.implementationDate
  }"\n\n`;

  // Add flows
  if (data.flows.length > 0) {
    csv += "\nFlujos de Automatización\n";
    csv +=
      "ID,Nombre,Página,Descripción,Evento Inicial,Acción,Condiciones,Dependencias\n";
    data.flows.forEach((flow) => {
      csv += `"${flow.id}","${flow.name}","${flow.page || "N/A"}","${
        flow.description
      }","${flow.trigger}","${flow.action}","${flow.conditions || "N/A"}","${
        flow.dependencies || "N/A"
      }"\n`;
    });
  }

  // Add relations
  if (data.relations.length > 0) {
    csv += "\nRelaciones\n";
    csv += "ID,Flujo Origen,Tipo de Relación,Flujo Destino,Condición\n";
    data.relations.forEach((relation) => {
      csv += `"${relation.id}","${getFlowName(
        relation.sourceFlow,
        data.flows
      )}","${getRelationTypeLabel(relation.relationType)}","${getFlowName(
        relation.targetFlow,
        data.flows
      )}","${relation.linkCondition || "N/A"}"\n`;
    });
  }

  // Download CSV
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `automatizacion-${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// Canvas para mapa de nodos
let canvas,
  ctx,
  nodes = [],
  connections = [],
  selectedNode = null,
  isDragging = false,
  dragOffset = { x: 0, y: 0 },
  panOffset = { x: 0, y: 0 },
  isPanning = false,
  panStart = { x: 0, y: 0 };

function initCanvas() {
  canvas = document.getElementById("nodeCanvas");
  ctx = canvas.getContext("2d");

  canvas.addEventListener("mousedown", handleCanvasMouseDown);
  canvas.addEventListener("mousemove", handleCanvasMouseMove);
  canvas.addEventListener("mouseup", handleCanvasMouseUp);
  canvas.addEventListener("click", handleCanvasClick);
  canvas.addEventListener("wheel", handleCanvasWheel);

  document
    .getElementById("resetZoomBtn")
    .addEventListener("click", resetCanvasView);
  document
    .getElementById("zoomInBtn")
    .addEventListener("click", () => adjustZoom(0.1));
  document
    .getElementById("zoomOutBtn")
    .addEventListener("click", () => adjustZoom(-0.1));
}

function adjustZoom(delta) {
  appState.zoomLevel = Math.max(0.5, Math.min(2, appState.zoomLevel + delta));
  drawCanvas();
}

function handleCanvasWheel(e) {
  e.preventDefault();
  const delta = e.deltaY > 0 ? -0.05 : 0.05;
  adjustZoom(delta);
}

function showNodeMap() {
  const data = collectFormData();
  generateNodesFromData(data);
  openModal(nodeMapModal);
  resizeCanvas();
  drawCanvas();
}

function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width;
  canvas.height = rect.height;
}

function generateNodesFromData(data) {
  nodes = [];
  connections = [];

  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = Math.min(canvas.width, canvas.height) / 3;

  data.flows.forEach((flow, index) => {
    const angle = (index / data.flows.length) * Math.PI * 2;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;

    nodes.push({
      id: flow.id,
      name: flow.name,
      x: x,
      y: y,
      radius: 50,
      color: "#8b5cf6",
      data: flow,
    });
  });

  data.relations.forEach((relation) => {
    const sourceNode = nodes.find((n) => n.id === relation.sourceFlow);
    const targetNode = nodes.find((n) => n.id === relation.targetFlow);

    if (sourceNode && targetNode) {
      let color = "#8b5cf6";
      if (
        relation.relationType === "after" ||
        relation.relationType === "triggered-by"
      ) {
        color = "#10b981";
      } else if (relation.relationType === "conditional") {
        color = "#f59e0b";
      }

      connections.push({
        source: sourceNode,
        target: targetNode,
        type: relation.relationType,
        color: color,
      });
    }
  });
}

function drawCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  ctx.translate(panOffset.x, panOffset.y);
  ctx.scale(appState.zoomLevel, appState.zoomLevel);

  // Dibujar conexiones
  connections.forEach((conn) => {
    drawConnection(conn);
  });

  // Dibujar nodos
  nodes.forEach((node) => {
    drawNode(node);
  });

  ctx.restore();
}

function drawNode(node) {
  ctx.beginPath();
  ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
  ctx.fillStyle = node.color;
  ctx.fill();
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 14px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const maxWidth = node.radius * 1.6;
  wrapText(ctx, node.name, node.x, node.y, maxWidth, 16);
}

function drawConnection(conn) {
  const dx = conn.target.x - conn.source.x;
  const dy = conn.target.y - conn.source.y;
  const angle = Math.atan2(dy, dx);

  const startX = conn.source.x + Math.cos(angle) * conn.source.radius;
  const startY = conn.source.y + Math.sin(angle) * conn.source.radius;
  const endX = conn.target.x - Math.cos(angle) * conn.target.radius;
  const endY = conn.target.y - Math.sin(angle) * conn.target.y;

  ctx.beginPath();
  ctx.moveTo(startX, startY);
  ctx.lineTo(endX, endY);
  ctx.strokeStyle = conn.color;
  ctx.lineWidth = 3;
  ctx.stroke();

  const arrowSize = 15;
  ctx.beginPath();
  ctx.moveTo(endX, endY);
  ctx.lineTo(
    endX - arrowSize * Math.cos(angle - Math.PI / 6),
    endY - arrowSize * Math.sin(angle - Math.PI / 6)
  );
  ctx.lineTo(
    endX - arrowSize * Math.cos(angle + Math.PI / 6),
    endY - arrowSize * Math.sin(angle + Math.PI / 6)
  );
  ctx.closePath();
  ctx.fillStyle = conn.color;
  ctx.fill();
  ctx.strokeStyle = conn.color;
  ctx.lineWidth = 2;
  ctx.stroke();
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(" ");
  let line = "";
  const lines = [];

  words.forEach((word) => {
    const testLine = line + word + " ";
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && line !== "") {
      lines.push(line);
      line = word + " ";
    } else {
      line = testLine;
    }
  });
  lines.push(line);

  const startY = y - ((lines.length - 1) * lineHeight) / 2;
  lines.forEach((line, index) => {
    ctx.fillText(line.trim(), x, startY + index * lineHeight);
  });
}

function handleCanvasMouseDown(e) {
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left - panOffset.x;
  const mouseY = e.clientY - rect.top - panOffset.y;

  selectedNode = nodes.find((node) => {
    const dx = mouseX - node.x;
    const dy = mouseY - node.y;
    return Math.sqrt(dx * dx + dy * dy) < node.radius;
  });

  if (selectedNode) {
    isDragging = true;
    dragOffset.x = mouseX - selectedNode.x;
    dragOffset.y = mouseY - selectedNode.y;
  } else {
    isPanning = true;
    panStart.x = e.clientX - panOffset.x;
    panStart.y = e.clientY - panOffset.y;
  }
}

function handleCanvasMouseMove(e) {
  if (isDragging && selectedNode) {
    const rect = canvas.getBoundingClientRect();
    selectedNode.x = e.clientX - rect.left - panOffset.x - dragOffset.x;
    selectedNode.y = e.clientY - rect.top - panOffset.y - dragOffset.y;
    drawCanvas();
  } else if (isPanning) {
    panOffset.x = e.clientX - panStart.x;
    panOffset.y = e.clientY - panStart.y;
    drawCanvas();
  }
}

function handleCanvasMouseUp() {
  isDragging = false;
  isPanning = false;
  selectedNode = null;
}

function handleCanvasClick(e) {
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left - panOffset.x;
  const mouseY = e.clientY - rect.top - panOffset.y;

  const clickedNode = nodes.find((node) => {
    const dx = mouseX - node.x;
    const dy = mouseY - node.y;
    return Math.sqrt(dx * dx + dy * dy) < node.radius;
  });

  if (clickedNode) {
    showNodeDetails(clickedNode);
  }
}

function showNodeDetails(node) {
  const detailsPanel = document.getElementById("nodeDetails");
  const detailsContent = document.getElementById("nodeDetailsContent");

  detailsContent.innerHTML = `
        <div class="preview-item">
            <span class="preview-label">Nombre:</span>
            <span class="preview-value">${node.data.name || "Sin nombre"}</span>
        </div>
        ${
          node.data.page
            ? `
        <div class="preview-item">
            <span class="preview-label">Página:</span>
            <span class="preview-value">${node.data.page}</span>
        </div>
        `
            : ""
        }
        <div class="preview-item">
            <span class="preview-label">Descripción:</span>
            <span class="preview-value">${
              node.data.description || "Sin descripción"
            }</span>
        </div>
        <div class="preview-item">
            <span class="preview-label">Evento inicial:</span>
            <span class="preview-value">${
              node.data.trigger || "No especificado"
            }</span>
        </div>
        <div class="preview-item">
            <span class="preview-label">Acción:</span>
            <span class="preview-value">${
              node.data.action || "No especificada"
            }</span>
        </div>
        ${
          node.data.conditions
            ? `
        <div class="preview-item">
            <span class="preview-label">Condiciones:</span>
            <span class="preview-value">${node.data.conditions}</span>
        </div>
        `
            : ""
        }
        ${
          node.data.dependencies
            ? `
        <div class="preview-item">
            <span class="preview-label">Dependencias:</span>
            <span class="preview-value">${node.data.dependencies}</span>
        </div>
        `
            : ""
        }
    `;

  detailsPanel.style.display = "block";

  document.getElementById("closeNodeDetails").onclick = () => {
    detailsPanel.style.display = "none";
  };
}

function resetCanvasView() {
  panOffset = { x: 0, y: 0 };
  appState.zoomLevel = 1;
  drawCanvas();
}

function handleFormSubmit(e) {
  e.preventDefault();

  if (!validateForm()) {
    alert("Por favor completa todos los campos requeridos.");
    return;
  }

  const data = collectFormData();

  // ✅ Aseguramos que specificData exista aunque esté vacío
  const specificData = data.specificData || {};

  // Guardar en localStorage para el dashboard
  const automations = JSON.parse(localStorage.getItem("automations") || "[]");

  const newAutomation = {
    id: automations.length + 1,
    empresa:
      specificData.projectName ||
      specificData.websiteUrl ||
      data.companyName ||
      "Cliente",
    tipo: getAutomationTypeLabel(data.automationType),
    fecha: new Date().toISOString().split("T")[0],
    estado: "pending",
    data: data,
  };

  automations.push(newAutomation);
  localStorage.setItem("automations", JSON.stringify(automations));

  console.log("✅ Datos del formulario guardados:", data);

  // Mostrar confirmación con opción de ir al dashboard
  const goToDashboard = confirm(
    "✅ Automatización guardada exitosamente.\n\n¿Quieres ir al dashboard para ver todas las automatizaciones?"
  );

  if (goToDashboard) {
    window.location.href = "dashboard.html";
  }
}

// Funciones de modal
function openModal(modal) {
  modal.classList.add("active");
}

function closeModal(modal) {
  modal.classList.remove("active");
}

// Cerrar modal al hacer clic fuera
window.addEventListener("click", (e) => {
  if (e.target.classList.contains("modal")) {
    closeModal(e.target);
  }
});

function showTemplates() {
  const templatesList = document.getElementById("templatesList");
  templatesList.innerHTML = templates
    .map(
      (template) => `
        <div class="flow-card">
            <details>
                <summary style="cursor: pointer; padding: 1.5rem;">
                    <div style="display: flex; justify-content: space-between; align-items: start;">
                        <div style="flex: 1;">
                            <h4 style="font-size: 1.125rem; font-weight: 700; margin-bottom: 0.5rem;">${
                              template.name
                            }</h4>
                            <p style="color: var(--color-text-secondary); margin-bottom: 0.75rem;">${
                              template.description
                            }</p>
                            <div style="display: flex; align-items: center; gap: 0.5rem; color: var(--color-primary); font-size: 0.875rem;">
                                <span>📊 ${
                                  template.flows.length
                                } flujos incluidos</span>
                            </div>
                        </div>
                    </div>
                </summary>
                <div style="padding: 0 1.5rem 1.5rem 1.5rem; border-top: 1px solid var(--color-border); margin-top: 1rem; padding-top: 1rem;">
                    ${template.flows
                      .map(
                        (flow, index) => `
                        <div style="margin-bottom: 1rem; padding: 1rem; background: var(--color-background); border-radius: var(--radius-md); border-left: 3px solid var(--color-primary);">
                            <div style="font-weight: 600; margin-bottom: 0.5rem; color: var(--color-text);">${flow.name}</div>
                            <div style="display: grid; gap: 0.5rem; font-size: 0.875rem;">
                                <div style="display: flex; gap: 0.5rem;">
                                    <span style="color: var(--color-text-secondary);">🎯 Objetivo:</span>
                                    <span style="color: var(--color-text);">${flow.objective}</span>
                                </div>
                                <div style="display: flex; gap: 0.5rem;">
                                    <span style="color: var(--color-text-secondary);">⚡ Se activa:</span>
                                    <span style="color: var(--color-text);">${flow.activatedBy}</span>
                                </div>
                                <div style="display: flex; gap: 0.5rem;">
                                    <span style="color: var(--color-text-secondary);">🧭 Acción:</span>
                                    <span style="color: var(--color-text);">${flow.description}</span>
                                </div>
                            </div>
                        </div>
                    `
                      )
                      .join("")}
                    <button class="btn-primary" onclick="applyTemplate('${
                      template.id
                    }')" style="width: 100%; margin-top: 1rem;">
                        Usar esta plantilla
                    </button>
                </div>
            </details>
        </div>
    `
    )
    .join("");
  openModal(templatesModal);
}

function applyTemplate(templateId) {
  const template = templates.find((t) => t.id === templateId);
  if (!template) return;

  // Apply each flow from template
  template.flows.forEach((flowData) => {
    appState.flowCounter++;
    const flowId = `flow-${appState.flowCounter}`;

    const flowCard = document.createElement("div");
    flowCard.className = "flow-card";
    flowCard.dataset.flowId = flowId;

    const showPageField = appState.automationType !== "custom";

    flowCard.innerHTML = `
            <details open>
                <summary>
                    <div class="summary-header">
                        <span class="flow-number">${appState.flowCounter}</span>
                        <span>Flujo de Automatización #${
                          appState.flowCounter
                        }</span>
                    </div>
                    <button type="button" class="btn-remove" onclick="event.preventDefault(); event.stopPropagation(); removeFlow('${flowId}')" title="Eliminar flujo">&times;</button>
                </summary>
                <div class="flow-content">
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Nombre del flujo</label>
                            <input type="text" class="form-input" data-field="name" placeholder="Ej: Registro de usuario" value="${
                              flowData.name
                            }" required>
                            <span class="helper-text">Un nombre descriptivo para identificar este flujo</span>
                        </div>
                        ${
                          showPageField
                            ? `
                        <div class="form-group">
                            <label class="form-label">Página/Sección</label>
                            <input type="text" class="form-input" data-field="page" placeholder="Ej: /registro" value="${
                              flowData.page || ""
                            }" required>
                            <span class="helper-text">¿En qué página ocurre este flujo?</span>
                        </div>
                        `
                            : ""
                        }
                    </div>
                    <div class="form-group">
                        <label class="form-label">Descripción del flujo</label>
                        <textarea class="form-textarea" data-field="description" placeholder="Describe qué hace este flujo..." required>${
                          flowData.description
                        }</textarea>
                        <span class="helper-text">Explica paso a paso qué sucede en este flujo</span>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Evento que inicia la automatización</label>
                            <select class="form-select" data-field="trigger" required>
                                <option value="">Seleccionar...</option>
                                <option value="form-submit" ${
                                  flowData.trigger === "form-submit"
                                    ? "selected"
                                    : ""
                                }>Envío de formulario</option>
                                <option value="click" ${
                                  flowData.trigger === "click" ? "selected" : ""
                                }>Clic en elemento</option>
                                <option value="scroll" ${
                                  flowData.trigger === "scroll"
                                    ? "selected"
                                    : ""
                                }>Scroll en la página</option>
                                <option value="page-load" ${
                                  flowData.trigger === "page-load"
                                    ? "selected"
                                    : ""
                                }>Carga de página</option>
                                <option value="webhook" ${
                                  flowData.trigger === "webhook"
                                    ? "selected"
                                    : ""
                                }>Webhook (notificación externa)</option>
                                <option value="time-based" ${
                                  flowData.trigger === "time-based"
                                    ? "selected"
                                    : ""
                                }>Basado en tiempo</option>
                            </select>
                            <span class="helper-text">¿Qué acción del usuario o evento inicia este flujo?</span>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Qué debe ocurrir después</label>
                            <select class="form-select" data-field="action" required>
                                <option value="">Seleccionar...</option>
                                <option value="send-email" ${
                                  flowData.action === "send-email"
                                    ? "selected"
                                    : ""
                                }>Enviar correo electrónico</option>
                                <option value="add-tag" ${
                                  flowData.action === "add-tag"
                                    ? "selected"
                                    : ""
                                }>Añadir etiqueta al contacto</option>
                                <option value="create-contact" ${
                                  flowData.action === "create-contact"
                                    ? "selected"
                                    : ""
                                }>Crear contacto en CRM</option>
                                <option value="update-database" ${
                                  flowData.action === "update-database"
                                    ? "selected"
                                    : ""
                                }>Actualizar base de datos</option>
                                <option value="send-notification" ${
                                  flowData.action === "send-notification"
                                    ? "selected"
                                    : ""
                                }>Enviar notificación</option>
                                <option value="api-call" ${
                                  flowData.action === "api-call"
                                    ? "selected"
                                    : ""
                                }>Llamada a API externa</option>
                            </select>
                            <span class="helper-text">La acción principal que se ejecutará</span>
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Condición especial o regla</label>
                        <input type="text" class="form-input" data-field="conditions" placeholder="Ej: Solo si el usuario no tiene tag X" value="${
                          flowData.conditions || ""
                        }">
                        <span class="helper-text">Opcional: ¿Hay alguna condición que deba cumplirse?</span>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Conexiones con otras herramientas</label>
                        <input type="text" class="form-input" data-field="dependencies" placeholder="Campos o integraciones requeridas" value="${
                          flowData.dependencies || ""
                        }">
                        <span class="helper-text">Ejemplo: ActiveCampaign, Google Sheets, API de WhatsApp</span>
                    </div>
                    <div class="form-group">
                        <label class="form-label">¿Se conecta con otra automatización?</label>
                        <select class="form-select" data-field="connectedFlow">
                            <option value="">No</option>
                        </select>
                        <span class="helper-text">Si este flujo activa o depende de otro flujo</span>
                    </div>
                </div>
            </details>
        `;

    flowsList.appendChild(flowCard);
  });

  updateFlowSelectors();
  closeModal(templatesModal);
  alert(
    `Plantilla "${template.name}" aplicada con éxito. Puedes editar los flujos según tus necesidades.`
  );
}

function showWizard() {
  appState.wizardStep = 0;
  appState.wizardData = {};
  renderWizardStep();
  openModal(wizardModal);
}

function renderWizardStep() {
  const wizardContent = document.getElementById("wizardContent");
  const wizardSteps = document.getElementById("wizardSteps");
  const prevBtn = document.getElementById("wizardPrevBtn");
  const nextBtn = document.getElementById("wizardNextBtn");

  // Progress indicator
  const totalSteps = 4;
  wizardSteps.innerHTML = `
        <div style="display: flex; gap: 0.5rem; margin-bottom: 2rem;">
            ${Array.from({ length: totalSteps })
              .map(
                (_, i) => `
                <div style="flex: 1; height: 4px; background: ${
                  i <= appState.wizardStep
                    ? "var(--color-primary)"
                    : "var(--color-border)"
                }; border-radius: 2px;"></div>
            `
              )
              .join("")}
        </div>
        <p style="text-align: center; color: var(--color-text-secondary); margin-bottom: 1.5rem;">
            Paso ${appState.wizardStep + 1} de ${totalSteps}
        </p>
    `;

  switch (appState.wizardStep) {
    case 0:
      wizardContent.innerHTML = `
                <h4 style="font-size: 1.25rem; margin-bottom: 1rem;">¿Qué quieres automatizar?</h4>
                <div class="radio-group">
                    <label class="radio-card">
                        <input type="radio" name="wizardType" value="lead-capture">
                        <span class="radio-content">
                            <span class="radio-title">Captura de Leads</span>
                            <span class="radio-description">Formularios, landing pages, pop-ups</span>
                        </span>
                    </label>
                    <label class="radio-card">
                        <input type="radio" name="wizardType" value="ecommerce">
                        <span class="radio-content">
                            <span class="radio-title">E-commerce</span>
                            <span class="radio-description">Compras, carritos abandonados, confirmaciones</span>
                        </span>
                    </label>
                    <label class="radio-card">
                        <input type="radio" name="wizardType" value="email-marketing">
                        <span class="radio-content">
                            <span class="radio-title">Email Marketing</span>
                            <span class="radio-description">Newsletters, secuencias, segmentación</span>
                        </span>
                    </label>
                    <label class="radio-card">
                        <input type="radio" name="wizardType" value="notifications">
                        <span class="radio-content">
                            <span class="radio-title">Notificaciones</span>
                            <span class="radio-description">Alertas internas, Slack, SMS</span>
                        </span>
                    </label>
                </div>
            `;
      prevBtn.style.display = "none";
      break;

    case 1:
      wizardContent.innerHTML = `
                <h4 style="font-size: 1.25rem; margin-bottom: 1rem;">¿Qué evento inicia la automatización?</h4>
                <div class="form-group">
                    <label class="form-label">Selecciona el trigger</label>
                    <select id="wizardTrigger" class="form-select">
                        <option value="form-submit">Usuario envía un formulario</option>
                        <option value="click">Usuario hace clic en un botón</option>
                        <option value="page-load">Usuario carga una página</option>
                        <option value="webhook">Evento externo (webhook)</option>
                        <option value="time-based">Programado (diario, semanal)</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">¿Dónde ocurre?</label>
                    <input type="text" id="wizardLocation" class="form-input" placeholder="Ej: /contacto, /checkout">
                </div>
            `;
      prevBtn.style.display = "inline-flex";
      break;

    case 2:
      wizardContent.innerHTML = `
                <h4 style="font-size: 1.25rem; margin-bottom: 1rem;">¿Qué debe suceder después?</h4>
                <div class="form-group">
                    <label class="form-label">Acción principal</label>
                    <select id="wizardAction" class="form-select">
                        <option value="send-email">Enviar correo electrónico</option>
                        <option value="create-contact">Crear contacto en CRM</option>
                        <option value="add-tag">Añadir etiqueta</option>
                        <option value="update-database">Actualizar base de datos</option>
                        <option value="send-notification">Enviar notificación al equipo</option>
                        <option value="api-call">Llamar a API externa</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Descripción de la acción</label>
                    <textarea id="wizardActionDesc" class="form-textarea" placeholder="Describe qué debe hacer exactamente..."></textarea>
                </div>
            `;
      break;

    case 3:
      wizardContent.innerHTML = `
                <h4 style="font-size: 1.25rem; margin-bottom: 1rem;">Herramientas y condiciones</h4>
                <div class="form-group">
                    <label class="form-label">¿Qué herramientas necesitas?</label>
                    <input type="text" id="wizardTools" class="form-input" placeholder="Ej: ActiveCampaign, Slack, Google Sheets">
                </div>
                <div class="form-group">
                    <label class="form-label">¿Hay alguna condición especial?</label>
                    <input type="text" id="wizardCondition" class="form-input" placeholder="Ej: Solo si el usuario no está registrado">
                </div>
                <div class="form-group">
                    <label class="form-label">Nombre del flujo</label>
                    <input type="text" id="wizardFlowName" class="form-input" placeholder="Ej: Captura de lead desde contacto">
                </div>
            `;
      nextBtn.textContent = "Crear Flujo";
      break;
  }
}

function wizardNext() {
  const totalSteps = 4;

  // Save current step data
  switch (appState.wizardStep) {
    case 0:
      const selectedType = document.querySelector(
        'input[name="wizardType"]:checked'
      );
      if (!selectedType) {
        alert("Por favor selecciona una opción");
        return;
      }
      appState.wizardData.type = selectedType.value;
      break;
    case 1:
      appState.wizardData.trigger =
        document.getElementById("wizardTrigger").value;
      appState.wizardData.location =
        document.getElementById("wizardLocation").value;
      break;
    case 2:
      appState.wizardData.action =
        document.getElementById("wizardAction").value;
      appState.wizardData.actionDesc =
        document.getElementById("wizardActionDesc").value;
      break;
    case 3:
      appState.wizardData.tools = document.getElementById("wizardTools").value;
      appState.wizardData.condition =
        document.getElementById("wizardCondition").value;
      appState.wizardData.flowName =
        document.getElementById("wizardFlowName").value;

      // Create the flow
      createFlowFromWizard();
      closeModal(wizardModal);
      return;
  }

  appState.wizardStep++;
  if (appState.wizardStep < totalSteps) {
    renderWizardStep();
  }
}

function wizardPrev() {
  if (appState.wizardStep > 0) {
    appState.wizardStep--;
    renderWizardStep();
    document.getElementById("wizardNextBtn").textContent = "Siguiente →";
  }
}

function createFlowFromWizard() {
  appState.flowCounter++;
  const flowId = `flow-${appState.flowCounter}`;

  const flowCard = document.createElement("div");
  flowCard.className = "flow-card";
  flowCard.dataset.flowId = flowId;

  const showPageField = appState.automationType !== "custom";

  flowCard.innerHTML = `
        <details open>
            <summary>
                <div class="summary-header">
                    <span class="flow-number">${appState.flowCounter}</span>
                    <span>Flujo de Automatización #${
                      appState.flowCounter
                    }</span>
                </div>
                <button type="button" class="btn-remove" onclick="event.preventDefault(); event.stopPropagation(); removeFlow('${flowId}')" title="Eliminar flujo">&times;</button>
            </summary>
            <div class="flow-content">
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Nombre del flujo</label>
                        <input type="text" class="form-input" data-field="name" value="${
                          appState.wizardData.flowName || "Nuevo flujo"
                        }" required>
                        <span class="helper-text">Un nombre descriptivo para identificar este flujo</span>
                    </div>
                    ${
                      showPageField
                        ? `
                    <div class="form-group">
                        <label class="form-label">Página/Sección</label>
                        <input type="text" class="form-input" data-field="page" value="${
                          appState.wizardData.location || ""
                        }" required>
                        <span class="helper-text">¿En qué página ocurre este flujo?</span>
                    </div>
                    `
                        : ""
                    }
                </div>
                <div class="form-group">
                    <label class="form-label">Descripción del flujo</label>
                    <textarea class="form-textarea" data-field="description" required>${
                      appState.wizardData.actionDesc || ""
                    }</textarea>
                    <span class="helper-text">Explica paso a paso qué sucede en este flujo</span>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Evento que inicia la automatización</label>
                        <select class="form-select" data-field="trigger" required>
                            <option value="">Seleccionar...</option>
                            <option value="form-submit" ${
                              appState.wizardData.trigger === "form-submit"
                                ? "selected"
                                : ""
                            }>Envío de formulario</option>
                            <option value="click" ${
                              appState.wizardData.trigger === "click"
                                ? "selected"
                                : ""
                            }>Clic en elemento</option>
                            <option value="scroll" ${
                              appState.wizardData.trigger === "scroll"
                                ? "selected"
                                : ""
                            }>Scroll en la página</option>
                            <option value="page-load" ${
                              appState.wizardData.trigger === "page-load"
                                ? "selected"
                                : ""
                            }>Carga de página</option>
                            <option value="webhook" ${
                              appState.wizardData.trigger === "webhook"
                                ? "selected"
                                : ""
                            }>Webhook (notificación externa)</option>
                            <option value="time-based" ${
                              appState.wizardData.trigger === "time-based"
                                ? "selected"
                                : ""
                            }>Basado en tiempo</option>
                        </select>
                        <span class="helper-text">¿Qué acción del usuario o evento inicia este flujo?</span>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Qué debe ocurrir después</label>
                        <select class="form-select" data-field="action" required>
                            <option value="">Seleccionar...</option>
                            <option value="send-email" ${
                              appState.wizardData.action === "send-email"
                                ? "selected"
                                : ""
                            }>Enviar correo electrónico</option>
                            <option value="add-tag" ${
                              appState.wizardData.action === "add-tag"
                                ? "selected"
                                : ""
                            }>Añadir etiqueta al contacto</option>
                            <option value="create-contact" ${
                              appState.wizardData.action === "create-contact"
                                ? "selected"
                                : ""
                            }>Crear contacto en CRM</option>
                            <option value="update-database" ${
                              appState.wizardData.action === "update-database"
                                ? "selected"
                                : ""
                            }>Actualizar base de datos</option>
                            <option value="send-notification" ${
                              appState.wizardData.action === "send-notification"
                                ? "selected"
                                : ""
                            }>Enviar notificación</option>
                            <option value="api-call" ${
                              appState.wizardData.action === "api-call"
                                ? "selected"
                                : ""
                            }>Llamada a API externa</option>
                        </select>
                        <span class="helper-text">La acción principal que se ejecutará</span>
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label">Condición especial o regla</label>
                    <input type="text" class="form-input" data-field="conditions" value="${
                      appState.wizardData.condition || ""
                    }">
                    <span class="helper-text">Opcional: ¿Hay alguna condición que deba cumplirse?</span>
                </div>
                <div class="form-group">
                    <label class="form-label">Conexiones con otras herramientas</label>
                    <input type="text" class="form-input" data-field="dependencies" value="${
                      appState.wizardData.tools || ""
                    }">
                    <span class="helper-text">Ejemplo: ActiveCampaign, Google Sheets, API de WhatsApp</span>
                </div>
                <div class="form-group">
                    <label class="form-label">¿Se conecta con otra automatización?</label>
                    <select class="form-select" data-field="connectedFlow">
                        <option value="">No</option>
                    </select>
                    <span class="helper-text">Si este flujo activa o depende de otro flujo</span>
                </div>
            </div>
        </details>
    `;

  flowsList.appendChild(flowCard);
  updateFlowSelectors();
  alert("Flujo creado con éxito desde el asistente");
}

function showDbModal() {
  if (!validateForm()) {
    alert(
      "Por favor completa todos los campos requeridos antes de enviar a la base de datos."
    );
    return;
  }
  openModal(dbModal);
}

async function sendToDatabase() {
  const endpoint = document.getElementById("dbEndpoint").value;
  const apiKey = document.getElementById("dbApiKey").value;
  const method = document.getElementById("dbMethod").value;
  const responseDiv = document.getElementById("dbResponse");

  if (!endpoint) {
    alert("Por favor ingresa un endpoint válido");
    return;
  }

  const data = collectFormData();

  try {
    responseDiv.style.display = "block";
    responseDiv.innerHTML =
      '<p style="color: var(--color-text-secondary);">Enviando datos...</p>';

    const headers = {
      "Content-Type": "application/json",
    };

    if (apiKey) {
      headers["Authorization"] = `Bearer ${apiKey}`;
    }

    const response = await fetch(endpoint, {
      method: method,
      headers: headers,
      body: JSON.stringify(data),
    });

    if (response.ok) {
      const result = await response.json();
      responseDiv.innerHTML = `
                <p style="color: var(--color-secondary); font-weight: 600;">✓ Datos enviados exitosamente</p>
                <pre style="margin-top: 0.5rem; font-size: 0.8125rem; color: var(--color-text-secondary);">${JSON.stringify(
                  result,
                  null,
                  2
                )}</pre>
            `;
    } else {
      responseDiv.innerHTML = `
                <p style="color: #ef4444; font-weight: 600;">✗ Error al enviar datos</p>
                <p style="margin-top: 0.5rem; font-size: 0.875rem; color: var(--color-text-secondary);">Status: ${response.status} - ${response.statusText}</p>
            `;
    }
  } catch (error) {
    responseDiv.innerHTML = `
            <p style="color: #ef4444; font-weight: 600;">✗ Error de conexión</p>
            <p style="margin-top: 0.5rem; font-size: 0.875rem; color: var(--color-text-secondary);">${error.message}</p>
        `;
  }
}
