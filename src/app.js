const DEFAULT_MAP_WIDTH = 4210;
const DEFAULT_MAP_HEIGHT = 3205;
const REPORT_MAP_VISIBLE_HEIGHT = 2950;
const STORAGE_KEY = "apt-light-tracker.lights.v4";
const PLAN_IMAGE_URL = "public/maps/apartment-site-plan-clean-v2.webp";
const REPORT_QR_URL = "public/assets/app-qr.png";
const SUPABASE_URL = "https://laeixcqemytrjehoddxt.supabase.co";
const SUPABASE_KEY = "sb_publishable_qX54QYuAILq0FBkrsEXLtA_ZzGtYYhb";
const SUPABASE_TABLE = "lights";
const ALLOW_PIN_MANAGEMENT = false;
const ALLOW_LIGHT_IDENTITY_EDIT = false;

const text = {
  loading: "\ub3c4\uba74 \ubd88\ub7ec\uc624\ub294 \uc911",
  loadFailed: "\ub3c4\uba74\uc744 \ubd88\ub7ec\uc624\uc9c0 \ubabb\ud588\uc2b5\ub2c8\ub2e4",
  addHint: "\ub3c4\uba74\uc758 \uc870\uba85 \uc704\uce58\ub97c \ud130\uce58\ud558\uc138\uc694",
  progress: "\uc810\uac80",
  bad: "\ubd88\ub7c9",
  shown: "\ud45c\uc2dc",
  syncChecking: "\ub3d9\uae30\ud654 \ud655\uc778 \uc911",
  syncOnline: "\ub3d9\uae30\ud654\ub428",
  syncSaving: "\uc800\uc7a5 \uc911",
  syncOffline: "\ub85c\uceec \uc800\uc7a5 \uc911",
  deleteAsk: "\uc774 \uc870\uba85 \ud540\uc744 \uc0ad\uc81c\ud560\uae4c\uc694?"
};

const lightTypes = [
  { id: "street_1", label: "\uac00\ub85c\ub4f1 1\uc790\ud615", prefix: "S1" },
  { id: "street_t", label: "\uac00\ub85c\ub4f1 T\uc790\ud615", prefix: "ST" },
  { id: "landscape_r", label: "\uc870\uacbd\ub4f1 R\uc790\ud615", prefix: "LR" },
  { id: "recycle_sensor", label: "\ubd84\ub9ac\uc218\uac70\uc7a5 \uc13c\uc11c\ub4f1", prefix: "RS" },
  { id: "entrance_line", label: "\ud604\uad00 \ub3d9/\ub77c\uc778 \ud45c\uc2dc\ub4f1", prefix: "EL" }
];

const typeFilters = [
  { id: "all", label: "\uc804\uccb4" },
  { id: "security", label: "\ubcf4\uc548\ub4f1 (1\uc790\ud615, T\uc790\ud615)", typeIds: ["street_1", "street_t"] },
  { id: "recycle_sensor", label: "\ubd84\ub9ac\uc218\uac70\uc7a5 \uc13c\uc11c\ub4f1", typeIds: ["recycle_sensor"] },
  { id: "entrance_line", label: "\ub3d9/\ub77c\uc778 \ud45c\uc2dc\ub4f1", typeIds: ["entrance_line"] }
];

const statuses = {
  normal: { label: "\uc815\uc0c1" },
  flicker: { label: "\uae30\ud0c0" },
  out: { label: "\ubbf8\uc810\ub4f1" },
  damaged: { label: "\ud30c\uc190" },
  unchecked: { label: "\ubbf8\uc810\uac80" }
};

const issueStatuses = new Set(["flicker", "out", "damaged"]);

const statusFilters = [
  { id: "all", label: "\uc804\uccb4" },
  { id: "unchecked", label: "\ubbf8\uc810\uac80" },
  { id: "normal", label: "\uc815\uc0c1" },
  { id: "flicker", label: "\uae30\ud0c0" },
  { id: "out", label: "\ubbf8\uc810\ub4f1" },
  { id: "damaged", label: "\ud30c\uc190" },
  { id: "bad", label: "\ubd88\ub7c9\ub9cc" }
];

const customCodeTypes = {
  recycle_sensor: {
    label: "\ub3d9",
    placeholder: "\uc608: 401\ub3d9",
    empty: "\ub3d9"
  },
  entrance_line: {
    label: "\ub3d9/\ub77c\uc778",
    placeholder: "\uc608: 401\ub3d9 1\ub77c\uc778",
    empty: "\ub3d9/\ub77c\uc778"
  }
};

const state = {
  lights: [],
  selectedId: null,
  typeFilter: "all",
  statusFilter: "all",
  syncStatus: "checking",
  viewMode: "map",
  editMode: false,
  addMode: false,
  mapWidth: DEFAULT_MAP_WIDTH,
  mapHeight: DEFAULT_MAP_HEIGHT,
  scale: 1,
  minScale: 0.2,
  maxScale: 5,
  x: 0,
  y: 0,
  pointers: new Map(),
  dragStart: null,
  pinchStart: null,
  suppressClick: false
};

const els = {
  app: document.querySelector("#app"),
  viewport: document.querySelector("#mapViewport"),
  stage: document.querySelector("#mapStage"),
  planImage: document.querySelector("#planImage"),
  miniCanvas: document.querySelector("#miniCanvas"),
  miniViewport: document.querySelector("#miniViewport"),
  pinLayer: document.querySelector("#pinLayer"),
  progressText: document.querySelector("#progressText"),
  typeFilter: document.querySelector("#typeFilter"),
  statusFilter: document.querySelector("#statusFilter"),
  listModeBtn: document.querySelector("#listModeBtn"),
  editModeBtn: document.querySelector("#editModeBtn"),
  locateBtn: document.querySelector("#locateBtn"),
  addPinBtn: document.querySelector("#addPinBtn"),
  addHint: document.querySelector("#addHint"),
  listPanel: document.querySelector("#listPanel"),
  listRows: document.querySelector("#listRows"),
  listCountText: document.querySelector("#listCountText"),
  printReportBtn: document.querySelector("#printReportBtn"),
  printReport: document.querySelector("#printReport"),
  sheet: document.querySelector("#sheet"),
  lightIdText: document.querySelector("#lightIdText"),
  coordText: document.querySelector("#coordText"),
  typeSelect: document.querySelector("#lightType"),
  customCodeField: document.querySelector("#customCodeField"),
  customCodeLabel: document.querySelector("#customCodeLabel"),
  customCodeInput: document.querySelector("#customCodeInput"),
  memoInput: document.querySelector("#memoInput"),
  closeSheetBtn: document.querySelector("#closeSheetBtn"),
  deletePinBtn: document.querySelector("#deletePinBtn")
};

function today() {
  return new Date().toISOString().slice(0, 10);
}

function longKoreanDate() {
  const date = new Date();
  const weekdays = ["\uc77c", "\uc6d4", "\ud654", "\uc218", "\ubaa9", "\uae08", "\ud1a0"];
  return `${date.getFullYear()}\ub144 ${date.getMonth() + 1}\uc6d4 ${date.getDate()}\uc77c (${weekdays[date.getDay()]})`;
}

function typeById(typeId) {
  return lightTypes.find((type) => type.id === typeId) || lightTypes[0];
}

function customCodeConfig(typeId) {
  return customCodeTypes[typeId] || null;
}

function displayCode(light) {
  const config = customCodeConfig(light.typeId);
  if (!config) return light.number;
  return String(light.code || "").trim() || config.empty;
}

function naturalCompare(a, b) {
  return String(a || "").localeCompare(String(b || ""), "ko-KR", {
    numeric: true,
    sensitivity: "base"
  });
}

function typeOrder(typeId) {
  const index = lightTypes.findIndex((type) => type.id === typeId);
  return index === -1 ? lightTypes.length : index;
}

function compareLightsByName(a, b) {
  const typeDiff = typeOrder(a.typeId) - typeOrder(b.typeId);
  if (typeDiff) return typeDiff;
  const codeDiff = naturalCompare(displayCode(a), displayCode(b));
  if (codeDiff) return codeDiff;
  const yDiff = Number(a.y) - Number(b.y);
  if (yDiff) return yDiff;
  return Number(a.x) - Number(b.x);
}

function lightName(light) {
  return `${typeById(light.typeId).label} ${displayCode(light)}`;
}

function statusLabel(status) {
  return statuses[status]?.label || statuses.unchecked.label;
}

function syncLabel() {
  if (state.syncStatus === "online") return text.syncOnline;
  if (state.syncStatus === "saving") return text.syncSaving;
  if (state.syncStatus === "offline") return text.syncOffline;
  return text.syncChecking;
}

function setSyncStatus(status) {
  state.syncStatus = status;
  updateProgress();
}

function reportLightName(light) {
  return displayCode(light);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&#39;");
}

function parseNumber(id) {
  const match = String(id || "").match(/(\d{2})$/);
  return match ? match[1] : "";
}

function selectedLight() {
  return state.lights.find((light) => light.id === state.selectedId);
}

function normalizeStatus(status) {
  if (status === "normal" || status === "flicker" || status === "out" || status === "damaged") return status;
  return "unchecked";
}

function normalizeLight(light) {
  const matchedType = lightTypes.find((type) => type.id === light.typeId || type.id === light.type_id || type.label === light.type);
  const typeId = matchedType ? matchedType.id : lightTypes[0].id;
  const number = light.number || parseNumber(light.id) || "01";
  return {
    id: light.id || makeLightId(typeId, number),
    typeId,
    number,
    x: Number(light.x) || 0,
    y: Number(light.y) || 0,
    status: normalizeStatus(light.status),
    code: String(light.code || "").trim(),
    memo: String(light.memo || "").trim(),
    lastCheckedAt: light.lastCheckedAt || light.last_checked_at || ""
  };
}

function saveToStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.lights));
}

function lightToRow(light) {
  return {
    id: light.id,
    type_id: light.typeId,
    number: light.number,
    x: light.x,
    y: light.y,
    status: light.status,
    code: light.code || "",
    memo: light.memo || "",
    last_checked_at: light.lastCheckedAt || null
  };
}

async function supabaseRequest(path, options = {}) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      ...options.headers
    }
  });
  if (!response.ok) {
    throw new Error(`Supabase request failed: ${response.status}`);
  }
  if (response.status === 204) return null;
  const textBody = await response.text();
  return textBody ? JSON.parse(textBody) : null;
}

async function loadLightsFromSupabase() {
  const rows = await supabaseRequest(`${SUPABASE_TABLE}?select=*&order=created_at.asc`);
  return rows.map(normalizeLight);
}

async function upsertLightRemote(light) {
  try {
    setSyncStatus("saving");
    await supabaseRequest(`${SUPABASE_TABLE}?on_conflict=id`, {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates" },
      body: JSON.stringify(lightToRow(light))
    });
    setSyncStatus("online");
  } catch (error) {
    setSyncStatus("offline");
    console.warn(error);
  }
}

async function deleteLightRemote(id) {
  try {
    setSyncStatus("saving");
    await supabaseRequest(`${SUPABASE_TABLE}?id=eq.${encodeURIComponent(id)}`, {
      method: "DELETE"
    });
    setSyncStatus("online");
  } catch (error) {
    setSyncStatus("offline");
    console.warn(error);
  }
}

async function replaceRemoteLights(oldIds, lights) {
  await Promise.all(oldIds.map((id) => deleteLightRemote(id)));
  lights.forEach(upsertLightRemote);
}

function persistLight(light) {
  saveToStorage();
  upsertLightRemote(light);
}

function renumberLights(options = {}) {
  const previousSelectedId = state.selectedId;
  const selectedMap = new Map(state.lights.map((light) => [light.id, light]));
  const oldIds = [];
  const changedLights = [];

  lightTypes.forEach((type) => {
    const typedLights = state.lights
      .filter((light) => light.typeId === type.id)
      .sort(compareLightsByName);

    typedLights.forEach((light, index) => {
      const nextNumber = String(index + 1).padStart(2, "0");
      const nextId = makeLightId(light.typeId, nextNumber);
      if (light.number === nextNumber && light.id === nextId) return;
      oldIds.push(light.id);
      light.number = nextNumber;
      light.id = nextId;
      changedLights.push(light);
    });
  });

  if (previousSelectedId && selectedMap.get(previousSelectedId)) {
    state.selectedId = selectedMap.get(previousSelectedId).id;
  }

  if (changedLights.length === 0) return false;
  saveToStorage();
  if (options.syncRemote) replaceRemoteLights(oldIds, changedLights);
  return true;
}

function replaceLightsFromRemote(lights) {
  state.lights = lights;
  if (state.selectedId && !selectedLight()) state.selectedId = null;
  if (!renumberLights({ syncRemote: true })) saveToStorage();
  render();
}

async function refreshLightsFromRemote() {
  try {
    replaceLightsFromRemote(await loadLightsFromSupabase());
    setSyncStatus("online");
  } catch (error) {
    setSyncStatus("offline");
    console.warn(error);
  }
}

async function loadLights() {
  const stored = localStorage.getItem(STORAGE_KEY);
  try {
    setSyncStatus("checking");
    const remoteLights = await loadLightsFromSupabase();
    if (remoteLights.length === 0 && stored) {
      state.lights = JSON.parse(stored).map(normalizeLight);
      state.lights.forEach(upsertLightRemote);
    } else {
      state.lights = remoteLights;
    }
    if (!renumberLights({ syncRemote: true })) saveToStorage();
    setSyncStatus("online");
    return;
  } catch (error) {
    setSyncStatus("offline");
    console.warn(error);
  }
  if (stored) {
    state.lights = JSON.parse(stored).map(normalizeLight);
  } else {
    const response = await fetch("src/data/lights.json");
    state.lights = (await response.json()).map(normalizeLight);
  }
  if (!renumberLights({ syncRemote: true })) saveToStorage();
}

function setMapSize(width, height) {
  state.mapWidth = Math.round(width);
  state.mapHeight = Math.round(height);
  els.stage.style.width = `${state.mapWidth}px`;
  els.stage.style.height = `${state.mapHeight}px`;
  els.planImage.style.width = `${state.mapWidth}px`;
  els.planImage.style.height = `${state.mapHeight}px`;
  els.pinLayer.style.width = `${state.mapWidth}px`;
  els.pinLayer.style.height = `${state.mapHeight}px`;
}

async function loadPlanImage() {
  els.progressText.textContent = text.loading;
  await new Promise((resolve, reject) => {
    els.planImage.onload = resolve;
    els.planImage.onerror = reject;
    els.planImage.src = PLAN_IMAGE_URL;
  });
  setMapSize(els.planImage.naturalWidth, els.planImage.naturalHeight);
  resetView();
  drawMiniMap();
}

function filteredLights() {
  return state.lights.filter((light) => {
    const typeMatches = matchesTypeFilter(light);
    const statusMatches =
      state.statusFilter === "all" ||
      (state.statusFilter === "bad" ? issueStatuses.has(light.status) : light.status === state.statusFilter);
    return typeMatches && statusMatches;
  });
}

function matchesTypeFilter(light) {
  if (state.typeFilter === "all") return true;
  const filter = typeFilters.find((item) => item.id === state.typeFilter);
  return Boolean(filter?.typeIds.includes(light.typeId));
}

function updateProgress() {
  const total = state.lights.length;
  const checked = state.lights.filter((light) => light.status !== "unchecked").length;
  const bad = state.lights.filter((light) => issueStatuses.has(light.status)).length;
  els.progressText.textContent = `${text.progress} ${checked}/${total} \u00b7 ${text.bad} ${bad} \u00b7 ${text.shown} ${filteredLights().length} \u00b7 ${syncLabel()}`;
}

function renderFilterOptions() {
  els.typeFilter.innerHTML = "";
  typeFilters.forEach((filter) => {
    const option = document.createElement("option");
    option.value = filter.id;
    option.textContent = filter.label;
    els.typeFilter.append(option);
  });
  els.statusFilter.innerHTML = "";
  statusFilters.forEach((filter) => {
    const option = document.createElement("option");
    option.value = filter.id;
    option.textContent = filter.label;
    els.statusFilter.append(option);
  });
}

function syncFilterControls() {
  els.typeFilter.value = state.typeFilter;
  els.statusFilter.value = state.statusFilter;
}

function iconSvg(typeId) {
  if (typeId === "street_t") {
    return `<svg viewBox="0 0 48 48" aria-hidden="true"><path class="icon-shape" d="M9 12H39"/><path class="icon-shape" d="M24 12V40"/><path class="icon-foot" d="M18 40H30"/></svg>`;
  }
  if (typeId === "landscape_r") {
    return `<svg viewBox="0 0 48 48" aria-hidden="true"><path class="icon-shape" d="M15 40V13"/><path class="icon-shape" d="M15 18H28c7 0 10 4 10 9"/><path class="icon-shape" d="M28 27H15"/><path class="icon-foot" d="M10 40H21"/></svg>`;
  }
  if (typeId === "recycle_sensor") {
    return `<svg viewBox="0 0 48 48" aria-hidden="true"><rect x="12" y="20" width="24" height="18" rx="3"/><path d="M17 20v-5h14v5"/><path d="M18 27h12"/><path d="M18 33h8"/><path d="M34 12c4 2 6 5 6 9"/><path d="M38 9c6 3 9 8 9 14"/></svg>`;
  }
  if (typeId === "entrance_line") {
    return `<svg viewBox="0 0 48 48" aria-hidden="true"><rect x="11" y="10" width="26" height="30" rx="3"/><path d="M17 17h14"/><path d="M17 24h14"/><path d="M17 31h8"/><circle cx="33" cy="34" r="2"/></svg>`;
  }
  return `<svg viewBox="0 0 48 48" aria-hidden="true"><path class="icon-shape" d="M28 10V40"/><path class="icon-shape" d="M20 16L28 10"/><path class="icon-foot" d="M18 40H34"/></svg>`;
}

function renderPins() {
  els.pinLayer.innerHTML = "";
  filteredLights().forEach((light) => {
    const pin = document.createElement("button");
    const type = typeById(light.typeId);
    pin.type = "button";
    pin.className = `pin ${light.status}${light.id === state.selectedId ? " selected" : ""}`;
    pin.style.left = `${light.x}px`;
    pin.style.top = `${light.y}px`;
    pin.title = `${type.label} ${displayCode(light)}`;
    pin.innerHTML = `<span class="pin-icon">${iconSvg(light.typeId)}</span><span class="pin-number">${displayCode(light)}</span>`;
    pin.addEventListener("click", (event) => {
      event.stopPropagation();
      if (state.suppressClick) return;
      state.selectedId = light.id;
      state.addMode = false;
      render({ focusSelected: true });
    });
    els.pinLayer.append(pin);
  });
}

function createStatusSelect(light) {
  const select = document.createElement("select");
  select.className = "list-status-select";
  ["unchecked", "normal", "flicker", "out", "damaged"].forEach((status) => {
    const option = document.createElement("option");
    option.value = status;
    option.textContent = statusLabel(status);
    select.append(option);
  });
  select.value = light.status;
  select.addEventListener("change", () => {
    light.status = select.value;
    light.lastCheckedAt = select.value === "unchecked" ? "" : today();
    persistLight(light);
    render();
  });
  return select;
}

function renderList() {
  const lights = filteredLights().sort(compareLightsByName);
  els.listRows.innerHTML = "";
  els.listCountText.textContent = `${lights.length}`;

  if (lights.length === 0) {
    const empty = document.createElement("div");
    empty.className = "list-empty";
    empty.textContent = "\ud45c\uc2dc\ud560 \uc870\uba85\uc774 \uc5c6\uc2b5\ub2c8\ub2e4";
    els.listRows.append(empty);
    return;
  }

  lights.forEach((light) => {
    const row = document.createElement("div");
    row.className = `list-row ${light.status}`;

    const info = document.createElement("button");
    info.type = "button";
    info.className = "list-row-info";
    info.innerHTML = `<strong>${lightName(light)}</strong><span>${light.id} · ${statusLabel(light.status)}</span>`;
    info.addEventListener("click", () => {
      state.viewMode = "map";
      state.selectedId = light.id;
      state.addMode = false;
      render({ focusSelected: true });
    });

    row.append(info, createStatusSelect(light));
    els.listRows.append(row);
  });
}

function renderTypeOptions() {
  els.typeSelect.innerHTML = "";
  lightTypes.forEach((type) => {
    const option = document.createElement("option");
    option.value = type.id;
    option.textContent = type.label;
    els.typeSelect.append(option);
  });
}

function fillSheet() {
  const light = selectedLight();
  if (!light) {
    els.app.classList.remove("sheet-open");
    els.sheet.classList.add("is-hidden");
    return;
  }
  const type = typeById(light.typeId);
  const codeConfig = customCodeConfig(light.typeId);
  els.app.classList.add("sheet-open");
  els.sheet.classList.remove("is-hidden");
  els.lightIdText.textContent = `${type.label} ${displayCode(light)}`;
  els.coordText.textContent = `x ${Math.round(light.x)} / y ${Math.round(light.y)}`;
  els.typeSelect.value = light.typeId;
  els.typeSelect.disabled = !ALLOW_LIGHT_IDENTITY_EDIT;
  els.typeSelect.title = ALLOW_LIGHT_IDENTITY_EDIT ? "" : "\uad00\ub9ac\uc790 \ud3b8\uc9d1 \ud654\uba74\uc5d0\uc11c \uc218\uc815\ud560 \uc218 \uc788\uc2b5\ub2c8\ub2e4";
  els.memoInput.value = light.memo || "";
  els.customCodeField.hidden = !codeConfig;
  els.customCodeField.classList.toggle("is-locked", !ALLOW_LIGHT_IDENTITY_EDIT);
  els.customCodeInput.disabled = !ALLOW_LIGHT_IDENTITY_EDIT;
  els.customCodeInput.title = ALLOW_LIGHT_IDENTITY_EDIT ? "" : "\uad00\ub9ac\uc790 \ud3b8\uc9d1 \ud654\uba74\uc5d0\uc11c \uc218\uc815\ud560 \uc218 \uc788\uc2b5\ub2c8\ub2e4";
  els.deletePinBtn.hidden = !ALLOW_PIN_MANAGEMENT;
  if (codeConfig) {
    els.customCodeLabel.textContent = codeConfig.label;
    els.customCodeInput.placeholder = codeConfig.placeholder;
    els.customCodeInput.value = light.code || "";
  }
  document.querySelectorAll("[data-action-status]").forEach((button) => {
    button.classList.toggle("active", button.dataset.actionStatus === light.status);
  });
}

function renderMode() {
  const listMode = state.viewMode === "list";
  els.app.classList.toggle("list-open", listMode);
  els.viewport.hidden = listMode;
  els.listPanel.hidden = !listMode;
  els.addPinBtn.hidden = !ALLOW_PIN_MANAGEMENT || listMode;
  els.locateBtn.disabled = listMode;
  els.listModeBtn.setAttribute("aria-pressed", String(listMode));
  els.listModeBtn.textContent = listMode ? "\uc9c0\ub3c4" : "\ubaa9\ub85d";
  els.editModeBtn.setAttribute("aria-pressed", String(state.editMode));
  els.addPinBtn.classList.toggle("active", state.addMode);
  els.addHint.hidden = !state.addMode || listMode;
  els.addHint.textContent = text.addHint;
}

function render(options = {}) {
  syncFilterControls();
  renderPins();
  renderList();
  updateProgress();
  fillSheet();
  renderMode();
  if (options.focusSelected && state.selectedId) {
    requestAnimationFrame(() => focusSelectedLight());
  }
}

function applyTransform() {
  els.stage.style.transform = `translate3d(${state.x}px, ${state.y}px, 0) scale(${state.scale})`;
  els.stage.style.setProperty("--map-scale", state.scale);
  updateMiniViewport();
}

function clampPan(overscroll = 80) {
  const rect = els.viewport.getBoundingClientRect();
  const scaledW = state.mapWidth * state.scale;
  const scaledH = state.mapHeight * state.scale;
  const minX = Math.min(rect.width - scaledW, 0);
  const minY = Math.min(rect.height - scaledH, 0);
  state.x = Math.min(overscroll, Math.max(minX - overscroll, state.x));
  state.y = Math.min(overscroll, Math.max(minY - overscroll, state.y));
}

function resetView() {
  const rect = els.viewport.getBoundingClientRect();
  state.scale = Math.max(rect.width / state.mapWidth, rect.height / state.mapHeight);
  state.minScale = state.scale * 0.82;
  state.x = (rect.width - state.mapWidth * state.scale) / 2;
  state.y = (rect.height - state.mapHeight * state.scale) / 2;
  applyTransform();
}

function centerOnLight(light) {
  if (!light) return;
  const rect = els.viewport.getBoundingClientRect();
  const sheetOpen = els.app.classList.contains("sheet-open");
  const targetX = rect.width / 2;
  const targetY = sheetOpen ? Math.max(92, rect.height * 0.30) : rect.height * 0.45;
  state.x = targetX - light.x * state.scale;
  state.y = targetY - light.y * state.scale;
  clampPan(24);
  applyTransform();
}

function focusSelectedLight() {
  centerOnLight(selectedLight());
}

function updateMiniViewport() {
  const fit = Number(els.miniCanvas.dataset.fit || 0);
  if (!fit) return;
  const offsetX = Number(els.miniCanvas.dataset.offsetX || 0);
  const offsetY = Number(els.miniCanvas.dataset.offsetY || 0);
  const rect = els.viewport.getBoundingClientRect();
  const visibleLeft = Math.max(0, -state.x / state.scale);
  const visibleTop = Math.max(0, -state.y / state.scale);
  const visibleRight = Math.min(state.mapWidth, (rect.width - state.x) / state.scale);
  const visibleBottom = Math.min(state.mapHeight, (rect.height - state.y) / state.scale);
  els.miniViewport.style.left = `${offsetX + visibleLeft * fit}px`;
  els.miniViewport.style.top = `${offsetY + visibleTop * fit}px`;
  els.miniViewport.style.width = `${Math.max(8, (visibleRight - visibleLeft) * fit)}px`;
  els.miniViewport.style.height = `${Math.max(8, (visibleBottom - visibleTop) * fit)}px`;
}

function drawMiniMap() {
  if (!els.planImage.complete || !els.planImage.naturalWidth) return;
  const canvas = els.miniCanvas;
  const rect = canvas.parentElement.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.round(rect.width * dpr);
  canvas.height = Math.round(rect.height * dpr);
  canvas.style.width = `${rect.width}px`;
  canvas.style.height = `${rect.height}px`;

  const fit = Math.min(canvas.width / state.mapWidth, canvas.height / state.mapHeight);
  const width = state.mapWidth * fit;
  const height = state.mapHeight * fit;
  const offsetX = (canvas.width - width) / 2;
  const offsetY = (canvas.height - height) / 2;
  const context = canvas.getContext("2d");
  context.fillStyle = "#11161d";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.save();
  context.translate(offsetX, offsetY);
  context.scale(fit, fit);
  context.drawImage(els.planImage, 0, 0, state.mapWidth, state.mapHeight);
  context.restore();
  canvas.dataset.fit = String(fit / dpr);
  canvas.dataset.offsetX = String(offsetX / dpr);
  canvas.dataset.offsetY = String(offsetY / dpr);
  updateMiniViewport();
}

function viewportToMap(clientX, clientY) {
  const rect = els.viewport.getBoundingClientRect();
  return {
    x: (clientX - rect.left - state.x) / state.scale,
    y: (clientY - rect.top - state.y) / state.scale
  };
}

function zoomAt(clientX, clientY, nextScale) {
  const mapPoint = viewportToMap(clientX, clientY);
  state.scale = Math.min(state.maxScale, Math.max(state.minScale, nextScale));
  const rect = els.viewport.getBoundingClientRect();
  state.x = clientX - rect.left - mapPoint.x * state.scale;
  state.y = clientY - rect.top - mapPoint.y * state.scale;
  clampPan();
  applyTransform();
}

function pointerPoints() {
  return [...state.pointers.values()];
}

function pointDistance(points) {
  return Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y);
}

function pointCenter(points) {
  return {
    x: (points[0].x + points[1].x) / 2,
    y: (points[0].y + points[1].y) / 2
  };
}

function beginDrag(point) {
  state.dragStart = { clientX: point.x, clientY: point.y, x: state.x, y: state.y };
}

function beginPinch() {
  const points = pointerPoints();
  state.dragStart = null;
  state.pinchStart = { lastDistance: Math.max(1, pointDistance(points)) };
}

function nextNumberForType(typeId, ignoreId = null) {
  const used = new Set(
    state.lights
      .filter((light) => light.typeId === typeId && light.id !== ignoreId)
      .map((light) => Number(light.number))
      .filter((number) => Number.isInteger(number))
  );
  for (let number = 1; number <= 99; number += 1) {
    if (!used.has(number)) return String(number).padStart(2, "0");
  }
  return "99";
}

function makeLightId(typeId, number) {
  return `${typeById(typeId).prefix}-${number}`;
}

function addLightAt(point) {
  const typeId = lightTypes[0].id;
  const number = nextNumberForType(typeId);
  const light = {
    id: makeLightId(typeId, number),
    typeId,
    number,
    x: Math.round(Math.max(0, Math.min(state.mapWidth, point.x))),
    y: Math.round(Math.max(0, Math.min(state.mapHeight, point.y))),
    status: "unchecked",
    code: "",
    memo: "",
    lastCheckedAt: ""
  };
  state.lights.push(light);
  state.selectedId = light.id;
  state.addMode = false;
  persistLight(light);
  render({ focusSelected: true });
}

function updateSelected(partial, options = {}) {
  const light = selectedLight();
  if (!light) return;
  Object.assign(light, partial);
  if (Object.hasOwn(partial, "code")) {
    if (!renumberLights({ syncRemote: true })) persistLight(light);
  } else {
    persistLight(light);
  }
  if (options.render === false) {
    updateProgress();
    return;
  }
  render({ focusSelected: Boolean(options.focus) });
}

function changeSelectedType(typeId) {
  const light = selectedLight();
  if (!light || light.typeId === typeId) return;
  const previousId = light.id;
  const number = nextNumberForType(typeId, light.id);
  light.typeId = typeId;
  light.number = number;
  light.id = makeLightId(typeId, number);
  if (!customCodeConfig(typeId)) light.code = "";
  state.selectedId = light.id;
  deleteLightRemote(previousId);
  if (!renumberLights({ syncRemote: true })) persistLight(light);
  render({ focusSelected: true });
}

function selectNearestLight(clientX, clientY) {
  const lights = filteredLights();
  let nearest = null;
  let nearestDistance = Infinity;
  lights.forEach((light) => {
    const rect = els.viewport.getBoundingClientRect();
    const screenX = rect.left + state.x + light.x * state.scale;
    const screenY = rect.top + state.y + light.y * state.scale;
    const distance = Math.hypot(screenX - clientX, screenY - clientY);
    if (distance < nearestDistance) {
      nearest = light;
      nearestDistance = distance;
    }
  });
  if (nearest && nearestDistance <= 38) {
    state.selectedId = nearest.id;
    state.addMode = false;
    render({ focusSelected: true });
    return true;
  }
  return false;
}

function renderReport() {
  const typeScopedLights = state.lights.filter(matchesTypeFilter);
  const issueLights = typeScopedLights
    .filter((light) => {
      if (!issueStatuses.has(light.status)) return false;
      if (state.statusFilter === "all" || state.statusFilter === "bad") return true;
      return light.status === state.statusFilter;
    })
    .sort(compareLightsByName);
  const issuePins = issueLights
    .map((light, index) => {
      const left = (Math.max(0, Math.min(state.mapWidth, light.x)) / state.mapWidth) * 100;
      const top = (Math.max(0, Math.min(REPORT_MAP_VISIBLE_HEIGHT, light.y)) / REPORT_MAP_VISIBLE_HEIGHT) * 100;
      return `<div class="report-pin ${light.status}" style="left:${left}%;top:${top}%;">
        <span class="report-pin-icon">${iconSvg(light.typeId)}</span>
        <span class="report-pin-label">${index + 1}</span>
      </div>`;
    })
    .join("");
  const rows = issueLights
    .map((light, index) => {
      return `<tr><td>${index + 1}</td><td>${escapeHtml(reportLightName(light))}</td><td>${escapeHtml(typeById(light.typeId).label)}</td><td>${escapeHtml(statusLabel(light.status))}</td><td>${escapeHtml(light.memo || "")}</td><td></td></tr>`;
    })
    .join("");
  const typeTotalLines = lightTypes
    .filter((type) => typeScopedLights.some((light) => light.typeId === type.id))
    .map((type) => {
      const typeLights = typeScopedLights.filter((light) => light.typeId === type.id);
      const typeIssues = typeLights.filter((light) => issueStatuses.has(light.status));
      const parts = ["flicker", "out", "damaged"]
        .map((status) => ({ label: statusLabel(status), count: typeIssues.filter((light) => light.status === status).length }))
        .filter((item) => item.count > 0)
        .map((item) => `${item.label}: ${item.count}`);
      return `<p>${escapeHtml(type.label)} : ${typeIssues.length}/${typeLights.length}${parts.length ? ` (${escapeHtml(parts.join(", "))})` : ""}</p>`;
    })
    .join("");
  const totalIssues = typeScopedLights.filter((light) => issueStatuses.has(light.status));
  const totalParts = ["flicker", "out", "damaged"]
    .map((status) => ({ label: statusLabel(status), count: totalIssues.filter((light) => light.status === status).length }))
    .filter((item) => item.count > 0)
    .map((item) => `${item.label}: ${item.count}`);
  const totalLine = `<p class="report-total-strong">\ud569\uacc4 : ${totalIssues.length}/${typeScopedLights.length}${totalParts.length ? ` (${escapeHtml(totalParts.join(", "))})` : ""}</p>`;

  els.printReport.innerHTML = `
    <div class="report-page">
      <header class="report-header">
        <div class="report-title-block">
          <h2>\uc678\ubd80\uc870\uba85 \uc810\uac80 \uc77c\uc9c0</h2>
          <div class="report-meta-line">
            <span>\ub0a0\uc9dc: ${longKoreanDate()}</span>
            <span class="report-time-field">\uc810\uac80\uc2dc\uac04:</span>
            <span>\uc810\uac80\uc790:</span>
          </div>
        </div>
        <table class="approval-table">
          <tr><th rowspan="2">\uacb0<br>\uc7ac</th><th>\ub2f4\ub2f9</th><th>\ub300\ub9ac</th><th>\uacfc\uc7a5</th><th>\uc18c\uc7a5</th></tr>
          <tr><td></td><td></td><td></td><td></td></tr>
        </table>
      </header>
      <section class="report-map-section">
        <div class="report-map">
          <img class="report-map-image" src="${PLAN_IMAGE_URL}" alt="\ub3c4\uba74" />
          <div class="report-map-summary">
            ${typeTotalLines}
            ${totalLine}
          </div>
          <img class="report-qr" src="${REPORT_QR_URL}" alt="QR" />
          ${issuePins}
        </div>
      </section>
      <section class="report-detail-section">
        <table class="report-table">
          <thead><tr><th>No</th><th>\uc870\uba85\uc774\ub984</th><th>\uc885\ub958</th><th>\uc0c1\ud0dc</th><th>\ube44\uace0</th><th>\uc870\uce58\uc0ac\ud56d</th></tr></thead>
          <tbody>${rows || `<tr><td colspan="6">\ubb38\uc81c \uc870\uba85\uc774 \uc5c6\uc2b5\ub2c8\ub2e4</td></tr>`}</tbody>
        </table>
      </section>
    </div>
  `;
}

function nextFrame() {
  return new Promise((resolve) => requestAnimationFrame(resolve));
}

function waitForImage(image) {
  if (image.complete && image.naturalWidth > 0) return Promise.resolve();
  if (image.decode) {
    return image.decode().catch(() => {});
  }
  return new Promise((resolve) => {
    image.addEventListener("load", resolve, { once: true });
    image.addEventListener("error", resolve, { once: true });
  });
}

async function waitForReportAssets() {
  await nextFrame();
  const images = [...els.printReport.querySelectorAll("img")];
  await Promise.race([
    Promise.all(images.map(waitForImage)),
    new Promise((resolve) => window.setTimeout(resolve, 1500))
  ]);
  await nextFrame();
}

async function printReport() {
  renderReport();
  await waitForReportAssets();
  window.print();
}

function preserveCenterOnResize() {
  const rect = els.viewport.getBoundingClientRect();
  const mapCenter = viewportToMap(rect.left + rect.width / 2, rect.top + rect.height / 2);
  state.x = rect.width / 2 - mapCenter.x * state.scale;
  state.y = rect.height / 2 - mapCenter.y * state.scale;
  clampPan();
  applyTransform();
  drawMiniMap();
}

function attachEvents() {
  els.locateBtn.addEventListener("click", resetView);

  els.listModeBtn.addEventListener("click", () => {
    state.viewMode = state.viewMode === "list" ? "map" : "list";
    state.selectedId = null;
    state.addMode = false;
    render();
  });

  els.editModeBtn.addEventListener("click", () => {
    state.editMode = !state.editMode;
    state.addMode = state.editMode && state.addMode;
    renderMode();
  });

  els.addPinBtn.addEventListener("click", () => {
    if (state.viewMode === "list") return;
    state.editMode = true;
    state.addMode = !state.addMode;
    renderMode();
  });

  els.printReportBtn.addEventListener("click", printReport);

  els.closeSheetBtn.addEventListener("click", () => {
    state.selectedId = null;
    render();
  });

  els.typeSelect.addEventListener("change", () => {
    if (!ALLOW_LIGHT_IDENTITY_EDIT) return;
    changeSelectedType(els.typeSelect.value);
  });

  els.typeFilter.addEventListener("change", () => {
    state.typeFilter = els.typeFilter.value;
    state.selectedId = null;
    render();
  });

  els.statusFilter.addEventListener("change", () => {
    state.statusFilter = els.statusFilter.value;
    state.selectedId = null;
    render();
  });

  els.customCodeInput.addEventListener("input", () => {
    if (!ALLOW_LIGHT_IDENTITY_EDIT) return;
    updateSelected({ code: els.customCodeInput.value.trim() });
  });

  els.memoInput.addEventListener("input", () => {
    updateSelected({ memo: els.memoInput.value }, { render: false });
  });

  document.querySelectorAll("[data-action-status]").forEach((button) => {
    button.addEventListener("click", () => {
      updateSelected({ status: button.dataset.actionStatus, lastCheckedAt: today() });
    });
  });

  els.deletePinBtn.addEventListener("click", () => {
    const light = selectedLight();
    if (!light) return;
    if (!confirm(`${light.id} ${text.deleteAsk}`)) return;
    state.lights = state.lights.filter((item) => item.id !== light.id);
    state.selectedId = null;
    deleteLightRemote(light.id);
    if (!renumberLights({ syncRemote: true })) saveToStorage();
    render();
  });

  els.viewport.addEventListener("wheel", (event) => {
    event.preventDefault();
    const factor = event.deltaY > 0 ? 0.9 : 1.1;
    zoomAt(event.clientX, event.clientY, state.scale * factor);
  }, { passive: false });

  els.viewport.addEventListener("pointerdown", (event) => {
    if (event.target.closest(".bottom-sheet, .topbar, .fab, .minimap")) return;
    els.viewport.setPointerCapture(event.pointerId);
    state.pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    state.suppressClick = false;
    if (state.pointers.size === 1) beginDrag({ x: event.clientX, y: event.clientY });
    if (state.pointers.size === 2) {
      beginPinch();
      state.suppressClick = true;
    }
  });

  els.viewport.addEventListener("pointermove", (event) => {
    if (!state.pointers.has(event.pointerId)) return;
    state.pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

    if (state.pointers.size === 2) {
      if (!state.pinchStart) beginPinch();
      const points = pointerPoints();
      const distance = Math.max(1, pointDistance(points));
      const center = pointCenter(points);
      zoomAt(center.x, center.y, state.scale * (distance / state.pinchStart.lastDistance));
      state.pinchStart.lastDistance = distance;
      state.suppressClick = true;
      return;
    }

    if (state.pointers.size === 1 && state.dragStart && !state.pinchStart) {
      const dx = event.clientX - state.dragStart.clientX;
      const dy = event.clientY - state.dragStart.clientY;
      if (Math.hypot(dx, dy) > 4) state.suppressClick = true;
      state.x = state.dragStart.x + dx;
      state.y = state.dragStart.y + dy;
      clampPan();
      applyTransform();
    }
  });

  function endPointer(event) {
    const wasPinching = Boolean(state.pinchStart);
    state.pointers.delete(event.pointerId);
    if (state.pointers.size === 0) {
      state.dragStart = null;
      state.pinchStart = null;
      setTimeout(() => {
        state.suppressClick = false;
      }, 70);
    } else if (wasPinching && state.pointers.size === 1) {
      state.pinchStart = null;
      beginDrag(pointerPoints()[0]);
      state.suppressClick = true;
    }
  }

  els.viewport.addEventListener("pointerup", (event) => {
    if (!state.suppressClick && state.addMode) {
      addLightAt(viewportToMap(event.clientX, event.clientY));
    } else if (!state.suppressClick && !event.target.closest(".bottom-sheet, .topbar, .fab, .minimap")) {
      selectNearestLight(event.clientX, event.clientY);
    }
    endPointer(event);
  });
  els.viewport.addEventListener("pointercancel", endPointer);
  window.addEventListener("resize", preserveCenterOnResize);
}

async function init() {
  renderFilterOptions();
  renderTypeOptions();
  attachEvents();
  setMapSize(DEFAULT_MAP_WIDTH, DEFAULT_MAP_HEIGHT);
  resetView();
  await Promise.all([loadLights(), loadPlanImage()]);
  render();
  window.setInterval(refreshLightsFromRemote, 8000);
}

init().catch((error) => {
  console.error(error);
  els.progressText.textContent = text.loadFailed;
});
