const APP_VERSION = "v10";

const discountSlider = document.getElementById("discount");
const discountLabel  = document.getElementById("discountLabel");


// Pre-1933 US gold approximate AGW (troy oz)
const PRE33 = [
  { label: "$2.5 (Quarter Eagle)", agw: 0.12094 },
  { label: "$5 (Half Eagle)",     agw: 0.24187 },
  { label: "$10 (Eagle)",         agw: 0.48375 },
  { label: "$20 (Double Eagle)",  agw: 0.96750 }
];

// Modern American Gold Eagle (AGE) bullion weights (troy oz)
const AGE = [
  { label: "AGE 1 oz",   agw: 1.0000 },
  { label: "AGE 1/2 oz", agw: 0.5000 },
  { label: "AGE 1/4 oz", agw: 0.2500 },
  { label: "AGE 1/10 oz",agw: 0.1000 }
];

const spotInput = document.getElementById("spot");
const saveBtn = document.getElementById("saveBtn");
const rows = document.getElementById("rows");
const thead = document.getElementById("thead");
const status = document.getElementById("status");

const showMinus2 = document.getElementById("showMinus2");
const showMinus5 = document.getElementById("showMinus5");

function money(n) {
  if (!Number.isFinite(n)) return "—";
  return n.toLocaleString(undefined, { style: "currency", currency: "USD" });
}

function setStatus(msg) {
  status.textContent = msg || "";
}

function getSpot() {
  const s = parseFloat(spotInput.value);
  return Number.isFinite(s) ? s : 0;
}

function buildHeader() {
  const d = getDiscountPct();
  const label = d === 0 ? "Melt @ spot" : `Melt @ −${d}%`;

  thead.innerHTML = `
    <tr>
      <th>Coin</th>
      <th>Gold weight (AGW oz)</th>
      <th>${label}</th>
    </tr>
  `;
}


function addSectionTitle(title, colCount) {
  const tr = document.createElement("tr");
  tr.innerHTML = `<td colspan="${colCount}" style="font-weight:700; background:#1c1c24;">${title}</td>`;
  rows.appendChild(tr);
}

function addCoinRow(coin, spot) {
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
  const spot = getSpot();
  rows.innerHTML = "";

  const d = getDiscountPct();
  discountLabel.textContent = `${d}%`;

  
  buildHeader();

  const colCount = 3 + (showMinus2.checked ? 1 : 0) + (showMinus5.checked ? 1 : 0);

  // Section: Pre-1933
  addSectionTitle("Pre-1933 U.S. Gold", colCount);
  for (const c of PRE33) addCoinRow(c, spot);

  // Section: Modern AGEs
  addSectionTitle("Modern American Gold Eagle (AGE)", colCount);
  for (const c of AGE) addCoinRow(c, spot);

  if (spot > 0) setStatus("Ready. Works offline after first load.");
  else setStatus("Enter spot and tap Save (optional).");
}

function saveSettings() {
  const spot = getSpot();
  if (!Number.isFinite(spot) || spot <= 0) {
    setStatus("Please enter a valid spot price > 0.");
    render();
    return;
  }

  localStorage.setItem("goldSpot", spot.toFixed(2));
  localStorage.setItem("discountPct", discountSlider.value);

  setStatus("Saved to this iPhone. Offline-ready.");
  render();
}

function loadSettings() {
  const savedSpot = localStorage.getItem("goldSpot");
  if (savedSpot) spotInput.value = savedSpot;

  showMinus2.checked = (localStorage.getItem("showMinus2") === "1");
  showMinus5.checked = (localStorage.getItem("showMinus5") === "1");

  render();
}

// Live update
spotInput.addEventListener("input", render);

discountSlider.addEventListener("input", () => {
  discountLabel.textContent = `${getDiscountPct()}%`;
  render();
});


saveBtn.addEventListener("click", saveSettings);

// Service worker registration (GitHub Pages safe: relative path)
if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    try {
      await navigator.serviceWorker.register("./sw.js");
    } catch (e) {
      console.warn("Service worker failed:", e);
    }
  });
}

function getDiscountPct() {
  return parseFloat(discountSlider.value || "0");
}

loadSettings();


const versionEl = document.getElementById("version");
if (versionEl) {
  versionEl.textContent = APP_VERSION;
}





