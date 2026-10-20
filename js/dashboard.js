import "./layout.js";
import { showNotice } from "./layout.js";
import { getLastOrder } from "./cart.js";

const $ = (id) => document.getElementById(id);
const ACTIVE_TAB = "pb-3 text-sm font-bold text-buildbronze border-b-2 border-buildbronze transition";
const IDLE_TAB = "pb-3 text-sm font-bold text-gray-500 hover:text-builddark transition";
const isoDate = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
const today = () => new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

let completion = 78.4;
let logs = 24;
let photos = 142;
let activeProject = "Grand Meridian Tower";

/* subscription card reads the last demo checkout in this browser */
const order = getLastOrder();
if (order?.items?.length) {
  $("metricPlanName").textContent = `${order.items[0].name} (demo)`;
}

/* date defaults */
function setProjectDate() {
  const date = new Date();
  date.setDate(date.getDate() + 14);
  $("newProjDate").min = isoDate(new Date());
  $("newProjDate").value = isoDate(date);
}
setProjectDate();

/* tabs */
document.querySelectorAll("[data-tab]").forEach((button) => {
  button.addEventListener("click", () => {
    const tab = button.dataset.tab;
    ["logs", "photos", "team"].forEach((name) => {
      $(`tabContent-${name}`).classList.toggle("hidden", name !== tab);
      $(`tabBtn-${name}`).className = name === tab ? ACTIVE_TAB : IDLE_TAB;
    });
  });
});

/* modals */
function setModal(id, open) {
  const el = $(id);
  el.classList.toggle("hidden", !open);
  el.classList.toggle("flex", open);
}

document.querySelectorAll("[data-open-log]").forEach((button) =>
  button.addEventListener("click", () => {
    setModal("logModal", true);
    $("logSubtask").focus();
  }),
);
document.querySelectorAll("[data-open-project]").forEach((button) =>
  button.addEventListener("click", () => {
    setModal("newProjectModal", true);
    $("newProjName").focus();
  }),
);
document.querySelectorAll("[data-close]").forEach((button) => button.addEventListener("click", () => setModal(button.dataset.close, false)));
["logModal", "newProjectModal"].forEach((id) =>
  $(id).addEventListener("click", (e) => {
    if (e.target === $(id)) setModal(id, false);
  }),
);
document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  setModal("logModal", false);
  setModal("newProjectModal", false);
});

/* rendering */
function renderMetrics() {
  $("metricCompletion").textContent = `${completion.toFixed(1)}%`;
  $("metricBar").style.width = `${completion}%`;
  $("metricLogsCount").textContent = logs;
  $("metricPhotosCount").textContent = photos;
}

function addLogRow(task, weight, engineer, status = "Verified") {
  const values = [today(), task, `+${weight}%`, engineer, status];
  const row = document.createElement("tr");
  row.className = "hover:bg-gray-50";
  values.forEach((value, index) => {
    const cell = document.createElement("td");
    cell.className = index === 2 ? "px-4 py-3 font-bold text-buildbronze" : "px-4 py-3";
    if (index === 4) {
      const badge = document.createElement("span");
      badge.className = "px-2.5 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full";
      badge.textContent = value;
      cell.append(badge);
    } else {
      cell.textContent = value;
    }
    row.append(cell);
  });
  $("logsTableBody").prepend(row);
}

function addPhotoCard(name, file) {
  const card = document.createElement("div");
  card.className = "bg-gray-100 rounded-xl p-3 border border-buildborder";

  const media = document.createElement("div");
  media.className = "h-32 bg-gray-200 rounded-lg overflow-hidden grid place-items-center text-gray-400 mb-2";
  if (file) {
    const img = document.createElement("img");
    img.className = "w-full h-full object-cover";
    img.alt = name;
    img.src = URL.createObjectURL(file);
    media.append(img);
  } else {
    media.innerHTML = `<i class="fa-solid fa-image text-3xl"></i>`;
  }

  const title = document.createElement("span");
  title.className = "block text-xs font-bold text-builddark truncate";
  title.textContent = name;

  const meta = document.createElement("span");
  meta.className = "block text-[10px] text-gray-500";
  meta.textContent = `${today()} - Geotagged`;

  card.append(media, title, meta);
  $("photoGalleryGrid").prepend(card);
}

/* daily log */
$("logForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const task = $("logSubtask").value.trim();
  const weight = Math.max(0, Math.min(100, Number.parseFloat($("logWeight").value) || 0));
  const engineer = $("logEngineer").value.trim();
  const file = $("logPhoto").files[0];

  completion = Math.min(100, Number((completion + weight).toFixed(1)));
  logs += 1;
  if (file) photos += 1;

  addLogRow(task, weight, engineer);
  if (file) addPhotoCard(file.name, file);
  renderMetrics();

  e.target.reset();
  setModal("logModal", false);
  showNotice("Log & photo synced", "Daily progress log and site photo uploaded. Automated completion weights updated.", "fa-circle-check");
});

/* new project */
$("newProjectForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const name = $("newProjName").value.trim();
  const type = $("newProjType").value;
  const engineer = $("newProjEngineer").value.trim();
  const start = $("newProjDate").value;

  activeProject = name;
  $("activeProjectDisplay").textContent = `Managing ${activeProject} (${type}).`;
  completion = Math.min(100, Number((completion + 10).toFixed(1)));
  logs += 1;
  addLogRow(`Project initialized: ${name} (${type}) — start ${start}`, 10, engineer, "Active");
  renderMetrics();

  e.target.reset();
  setProjectDate();
  setModal("newProjectModal", false);
  showNotice("Project created", `"${name}" is ready. Record daily logs and site photos from the dashboard.`, "fa-circle-check");
});

document.querySelectorAll("[data-invite]").forEach((button) =>
  button.addEventListener("click", () =>
    showNotice("Team management", "Seat limits depend on your plan. Upgrade to Professional or Enterprise to invite more members.", "fa-users"),
  ),
);
