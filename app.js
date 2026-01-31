// Pre-1933 US gold "common melt" weights (AGW in troy ounces)
// (These are the standard widely-used approximate AGW values.)
const COINS = [
  { label: "$2.5 (Quarter Eagle)", agw: 0.12094 },
  { label: "$5 (Half Eagle)",     agw: 0.24187 },
  { label: "$10 (Eagle)",         agw: 0.48375 },
  { label: "$20 (Double Eagle)",  agw: 0.96750 }
];

const spotInput = document.getElementById("spot");
const saveBtn = document.getElementById("saveBtn");
const rows = document.getElementById("rows");
const status = document.getElementById("status");

function money(n) {
  // Avoid showing "NaN"
  if (!Number.isFinite(n)) return "—";
  return n.toLocaleString(undefined, { style: "currency", currency: "USD" });
}

function renderTable(spot) {
  rows.innerHTML = "";
  for (const c of COINS) {
    const melt = spot * c.agw;
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${c.label}</td>
      <td>${c.agw.toFixed(5)}</td>
      <td>${money(melt)}</td>
    `;
    rows.appendChild(tr);
  }
}

function setStatus(msg) {
  status.textContent = msg || "";
}

function loadSpot() {
  const saved = localStorage.getItem("goldSpot");
  if (saved) {
    spotInput.value = saved;
    setStatus("Loaded saved spot from this iPhone.");
  } else {
    setStatus("Enter spot and tap Save.");
  }
  const spot = parseFloat(spotInput.value);
  renderTable(Number.isFinite(spot) ? spot : 0);
}

function saveSpot() {
  const spot = parseFloat(spotInput.value);
  if (!Number.isFinite(spot) || spot <= 0) {
    setStatus("Please enter a valid spot price > 0.");
    renderTable(0);
    return;
  }
  localStorage.setItem("goldSpot", spot.toFixed(2));
  setStatus("Saved. (Works offline after first load.)");
  renderTable(spot);
}

// Live update table as you type (even without saving)
spotInput.addEventListener("input", () => {
  const spot = parseFloat(spotInput.value);
  renderTable(Number.isFinite(spot) ? spot : 0);
});

saveBtn.addEventListener("click", saveSpot);

// Register service worker for offline caching
if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    try {
      await navigator.serviceWorker.register("/sw.js");
    } catch (e) {
      // If SW fails, app still works online.
      console.warn("Service worker failed:", e);
    }
  });
}

loadSpot();
