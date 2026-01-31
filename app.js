const APP_VERSION = "v13";

// Pre-1933 US gold approximate AGW (troy oz)
const PRE33 = [
  { label: "$2.5 (Quarter Eagle)", agw: 0.12094 },
  { label: "$5 (Half Eagle)",     agw: 0.24187 },
  { label: "$10 (Eagle)",         agw: 0.48375 },
  { label: "$20 (Double Eagle)",  agw: 0.96750 }
];

// Modern American Gold Eagle (AGE) bullion gold weights (troy oz)
const AGE = [
  { label: "AGE 1 oz",    agw: 1.0000 },
  { label: "AGE 1/2 oz",  agw: 0.5000 },
  { label: "AGE 1/4 oz",  agw: 0.2500 },
  { label: "AGE 1/10 oz", agw: 0.1000 }
];

const spotInput = document.getElementById("spot");
const saveBtn = document.getElementById("saveBtn");
const rows = document.getElementById("rows");
const thead = document.getElementById("thead");
const status = document.getElementById("status");

const discountSlider = document.getElementById("discount");
const discountLabel = document.getElementById("discountLabel");

const versionEl = document.getElementById("version");
if (versionEl) versionEl.textContent = APP_VERSION;

const pinOverlay = document.getElementById("pinOverlay");
const pinInput   = document.getElementById("pinInput");
const pinBtn     = document.getElementById("pinBtn");
const pinMsg     = document.getElementById("pinMsg");
const pinTitle   = document.getElementById("pinTitle");

const PIN_KEY = "appPIN";

function isPinSet() {
  return !!localStorage.getItem(PIN_KEY);
}

function lockApp() {
  pinInput.value = "";
  pinMsg.textContent = "";
  pinOverlay.classList.remove("hidden");
  setTimeout(() => pinInput.focus(), 200);
}

function unlockApp() {
  pinOverlay.classList.add("hidden");
}

function handlePin() {
  const entered = pinInput.value.trim();
  if (entered.length !== 4) {
    pinMsg.textContent = "Enter a 4-digit PIN";
    return;
  }

  if (!isPinSet()) {
    // First-time setup
    localStorage.setItem(PIN_KEY, entered);
    pinTitle.textContent = "Enter PIN";
    unlockApp();
    return;
  }

  const saved = localStorage.getItem(PIN_KEY);
  if (entered === saved) {
    unlockApp();
  } else {
    pinMsg.textContent = "Incorrect PIN";
    pinInput.value = "";
  }
}

function money(n) {
  if (!Number.isFinite(n)) return "—";
  return n.toLocaleString(undefined, { style: "currency", currency: "USD" });
}

function setStatus(msg) {
  if (status) status.textContent = msg || "";
}

function getSpot() {
  if (!spotInput) return 0;
  const raw = (spotInput.value || "").replace(/[$,\s]/g, "").trim();
  const s = parseFloat(raw);
  return Number.isFinite(s) ? s : 0;
}

function getDiscountPct() {
  // If slider missing for any reason, treat as 0%
  if (!discountSlider) return 0;
  const d = parseFloat(discountSlider.value || "0");
  return Number.isFinite(d) ? d : 0;
}

function buildHeader() {
  if (!thead) return;
  const d = getDiscountPct();
  const colTitle = d === 0 ? "Melt @ spot" : `Melt @ −${d}%`;

  thead.innerHTML = `
    <tr>
      <th>Coin</th>
      <th>Gold weight (AGW oz)</th>
      <th>${colTitle}</th>
    </tr>
  `;
}

function addSectionTitle(title) {
  if (!rows) return;
  const tr = document.createElement("tr");
  tr.innerHTML = `<td colspan="3" style="font-weight:700; background:#1c1c24;">${title}</td>`;
  rows.appendChild(tr);
}

function addCoinRow(coin, spot) {
  if (!rows) return;
  const d = getDiscountPct() / 100;
  const melt = spot * coin.agw * (1 - d);

  const tr = document.createElement("tr");
  tr.innerHTML = `
    <td>${coin.label}</td>
    <td>${coin.agw.toFixed(5)}</td>
    <td>${money(melt)}</td>
  `;
  rows.appendChild(tr);
}

function render() {
  // If table elements missing, fail gracefully
  if (!rows || !thead) {
    setStatus("Error: table elements missing (thead/rows).");
    return;
  }

  const spot = getSpot();
  const d = getDiscountPct();

  if (discountLabel) discountLabel.textContent = `${d}%`;

  rows.innerHTML = "";
  buildHeader();

  addSectionTitle("Pre-1933 U.S. Gold");
  PRE33.forEach(c => addCoinRow(c, spot));

  addSectionTitle("Modern American Gold Eagle (AGE)");
  AGE.forEach(c => addCoinRow(c, spot));

  if (spot > 0) setStatus("Ready. Works offline after first load.");
  else setStatus("Enter spot and tap Save (optional).");
}

function saveSettings() {
  const spot = getSpot();
  if (spot <= 0) {
    setStatus("Please enter a valid spot price > 0.");
    render();
    return;
  }

  localStorage.setItem("goldSpot", spot.toFixed(2));
  localStorage.setItem("discountPct", String(getDiscountPct()));
  setStatus("Saved to this iPhone. Offline-ready.");
  render();
}

function loadSettings() {
  const savedSpot = localStorage.getItem("goldSpot");
  if (savedSpot && spotInput) spotInput.value = savedSpot;

  const savedD = localStorage.getItem("discountPct");
  if (savedD !== null && discountSlider) discountSlider.value = savedD;

  render();
}

// Events
if (spotInput) {
  spotInput.addEventListener("input", render);
  // Helps iOS PWAs sometimes
  spotInput.addEventListener("touchend", () => spotInput.focus(), { passive: true });
}
if (discountSlider) discountSlider.addEventListener("input", render);
if (saveBtn) saveBtn.addEventListener("click", saveSettings);

// Service worker registration (GitHub Pages safe)
if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    try {
      await navigator.serviceWorker.register("./sw.js");
    } catch (e) {
      console.warn("Service worker failed:", e);
    }
  });
}

if (pinBtn) pinBtn.addEventListener("click", handlePin);

if (pinInput) {
  pinInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") handlePin();
  });
}

// PIN initialization
if (!isPinSet()) {
  pinTitle.textContent = "Set a 4-digit PIN";
}
lockApp();


loadSettings();


