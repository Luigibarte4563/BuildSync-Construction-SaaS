import { formatPHP, getPlan } from "./data.js";
import * as cart from "./cart.js";

const LINKS = [
  { href: "index.html", label: "Home", page: "index.html" },
  { href: "index.html#about", label: "About" },
  { href: "index.html#services", label: "Services" },
  { href: "plans.html", label: "Plans", page: "plans.html" },
  { href: "dashboard.html", label: "Dashboard", page: "dashboard.html" },
];

const PAYMENTS = ["GCash", "Maya", "BDO", "BPI", "Metrobank", "Landbank", "Visa", "Mastercard"];

const NOTICES = {
  privacy: {
    title: "Privacy Policy",
    icon: "fa-shield-halved",
    body: "BuildSync protects project records, daily logs and media uploads with 256-bit SSL encryption. We do not sell customer data and we follow the Philippine Data Privacy Act.",
  },
  terms: {
    title: "Terms of Service",
    icon: "fa-file-contract",
    body: "Use of the BuildSync portal is governed by our Enterprise Software Agreement. Subscriptions renew monthly and can be cancelled at any time from the workspace settings.",
  },
  compliance: {
    title: "Compliance",
    icon: "fa-certificate",
    body: "BuildSync follows Philippine construction and financial reporting guidelines. Billing documents can be exported for your accountant or auditor.",
  },
};

const currentPage = location.pathname.split("/").pop() || "index.html";

const isActive = (link) => link.page === currentPage;
const navClass = (link) =>
  `transition ${isActive(link) ? "text-buildbronze font-extrabold" : "text-gray-700 hover:text-buildbronze"}`;

export const badgesHTML = (dark = false) =>
  `<ul class="flex flex-wrap gap-2">${PAYMENTS.map(
    (method) =>
      `<li class="px-2.5 py-1 rounded-lg border text-[11px] font-semibold ${
        dark ? "bg-white/5 border-white/10 text-gray-400" : "bg-gray-50 border-buildborder text-gray-600"
      }">${method}</li>`,
  ).join("")}</ul>`;

const brand = (label) => `<span class="inline-flex items-center space-x-3">
  <span class="w-10 h-10 rounded-xl bg-gradient-to-br from-builddark to-buildnavy flex items-center justify-center text-amber-500 shadow-md">
    <i class="fa-solid fa-cubes"></i>
  </span>
  <span>
    <span class="block text-lg font-extrabold tracking-tight text-builddark">Build<span class="text-buildbronze">Sync</span></span>
    <span class="block text-[9px] uppercase font-bold tracking-widest text-gray-500">${label}</span>
  </span>
</span>`;

function header() {
  const links = LINKS.map((link) => `<a href="${link.href}" class="${navClass(link)}">${link.label}</a>`).join("");
  return `<header class="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-buildborder shadow-sm">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
      <a href="index.html" class="flex items-center" aria-label="BuildSync home">${brand("Construction SaaS")}</a>
      <nav class="hidden md:flex items-center space-x-7 text-sm font-semibold">${links}</nav>
      <div class="flex items-center space-x-2">
        <button type="button" data-open-cart class="relative inline-flex items-center gap-2 px-4 py-2.5 bg-builddark text-white text-sm font-bold rounded-xl hover:bg-gray-800 transition" aria-label="Open cart">
          <i class="fa-solid fa-bag-shopping text-xs"></i>
          <span class="hidden sm:inline">Cart</span>
          <span class="cart-count inline-grid place-items-center min-w-5 h-5 px-1 rounded-full bg-buildbronze text-white text-[10px] font-extrabold">0</span>
        </button>
        <button type="button" data-menu class="md:hidden w-11 h-11 grid place-items-center rounded-xl border border-buildborder text-builddark hover:bg-gray-50 transition" aria-label="Open menu" aria-expanded="false">
          <i class="fa-solid fa-bars"></i>
        </button>
      </div>
    </div>
    <div id="mobile-menu" class="hidden md:hidden border-t border-buildborder bg-white">
      <nav class="px-4 py-3 flex flex-col">${LINKS.map(
        (link) => `<a href="${link.href}" class="py-2.5 text-sm font-semibold text-gray-700 hover:text-buildbronze">${link.label}</a>`,
      ).join("")}</nav>
    </div>
  </header>`;
}

function footer() {
  return `<footer class="bg-builddark text-white py-12 border-t border-gray-800">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
        <div class="space-y-4">
          <div class="flex items-center space-x-3">
            <div class="w-9 h-9 rounded-xl bg-buildbronze flex items-center justify-center text-white"><i class="fa-solid fa-cubes"></i></div>
            <span class="text-lg font-extrabold text-white">Build<span class="text-amber-500">Sync</span></span>
          </div>
          <p class="text-gray-400 text-xs leading-relaxed">Professional SaaS construction portal with automated completion weights, daily logs and secure multi-channel billing.</p>
        </div>
        <div>
          <h4 class="font-bold text-sm mb-4 text-amber-400">Navigation</h4>
          <ul class="space-y-2 text-xs text-gray-400">
            <li><a href="index.html" class="hover:text-white transition">Home</a></li>
            <li><a href="plans.html" class="hover:text-white transition">Plans &amp; pricing</a></li>
            <li><a href="dashboard.html" class="hover:text-white transition">Dashboard demo</a></li>
            <li><a href="cart.html" class="hover:text-white transition">Your cart</a></li>
          </ul>
        </div>
        <div>
          <h4 class="font-bold text-sm mb-4 text-amber-400">Legal &amp; security</h4>
          <ul class="space-y-2 text-xs text-gray-400">
            <li><button type="button" data-notice="privacy" class="hover:text-white transition">Privacy Policy</button></li>
            <li><button type="button" data-notice="terms" class="hover:text-white transition">Terms of Service</button></li>
            <li><button type="button" data-notice="compliance" class="hover:text-white transition">Compliance</button></li>
          </ul>
        </div>
        <div>
          <h4 class="font-bold text-sm mb-4 text-amber-400">Support &amp; contact</h4>
          <ul class="space-y-2 text-xs text-gray-400">
            <li><i class="fa-solid fa-envelope mr-2 text-amber-500"></i>support@buildsync.ph</li>
            <li><i class="fa-solid fa-phone mr-2 text-amber-500"></i>+63 (2) 8888-5555</li>
            <li><i class="fa-solid fa-location-dot mr-2 text-amber-500"></i>BGC, Taguig City, Metro Manila</li>
          </ul>
          <h4 class="font-bold text-sm mt-5 mb-3 text-amber-400">We accept</h4>
          ${badgesHTML(true)}
        </div>
      </div>
      <div class="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-500">
        <p>© ${new Date().getFullYear()} BuildSync Construction SaaS Portal. Demo site. No real payments.</p>
        <p>Built for general contractors and project owners.</p>
      </div>
    </div>
  </footer>`;
}

function drawerBody() {
  const items = cart.lines();
  if (!items.length) {
    return `<div class="h-full flex flex-col items-center justify-center text-center px-6 py-12">
      <div class="w-16 h-16 rounded-2xl bg-amber-50 text-buildbronze grid place-items-center text-2xl mb-4"><i class="fa-solid fa-bag-shopping"></i></div>
      <p class="font-extrabold text-builddark text-lg">Your cart is empty</p>
      <p class="text-sm text-gray-500 mt-1 mb-5">Add a plan to get started.</p>
      <a href="plans.html" class="px-6 py-3 bg-buildbronze text-white text-sm font-bold rounded-xl hover:bg-buildbronzehover transition">Browse plans</a>
    </div>`;
  }

  const rows = items
    .map(
      (l) => `<li class="py-4 flex gap-4">
        <div class="w-12 h-12 rounded-xl bg-amber-100 text-buildbronze grid place-items-center font-extrabold shrink-0">${l.plan.index}</div>
        <div class="flex-1 min-w-0">
          <div class="flex justify-between gap-3">
            <div>
              <p class="font-bold text-builddark text-sm">${l.plan.name}</p>
              <p class="text-xs text-gray-500">${formatPHP(l.plan.price)} ${l.plan.unit}</p>
            </div>
            <button type="button" data-remove="${l.id}" aria-label="Remove ${l.plan.name}" class="text-gray-400 hover:text-red-600 transition"><i class="fa-solid fa-trash-can text-sm"></i></button>
          </div>
          <div class="flex justify-between items-center mt-3">${cart.qtyHTML(l.id, l.qty)}<span class="font-extrabold text-sm text-builddark">${formatPHP(l.lineTotal)}</span></div>
        </div>
      </li>`,
    )
    .join("");

  return `<div class="flex-1 overflow-y-auto px-6">
      <ul class="divide-y divide-buildborder">${rows}</ul>
    </div>
    <div class="border-t border-buildborder px-6 py-5 space-y-4">
      ${cart.totalsHTML(cart.subtotal())}
      <div class="grid grid-cols-2 gap-3">
        <a href="cart.html" class="py-3 text-center bg-white border border-gray-300 text-builddark text-sm font-bold rounded-xl hover:bg-gray-50 transition">View cart</a>
        <a href="checkout.html" class="py-3 text-center bg-buildbronze text-white text-sm font-bold rounded-xl hover:bg-buildbronzehover transition">Checkout</a>
      </div>
    </div>`;
}

function drawer() {
  return `<div class="drawer fixed inset-0 z-50">
    <button type="button" class="drawer-backdrop absolute inset-0 bg-black/60 backdrop-blur-sm" data-close-cart aria-label="Close cart"></button>
    <aside class="drawer-panel absolute left-0 right-0 bottom-0 w-full bg-white shadow-2xl flex flex-col" role="dialog" aria-modal="true" aria-label="Your cart">
      <div class="flex items-center justify-between px-6 h-20 border-b border-buildborder">
        <h2 class="text-lg font-extrabold text-builddark">Your cart</h2>
        <button type="button" class="w-10 h-10 grid place-items-center rounded-xl text-gray-500 hover:bg-gray-100 transition" data-close-cart aria-label="Close cart"><i class="fa-solid fa-xmark"></i></button>
      </div>
      <div class="drawer-body flex-1 flex flex-col overflow-hidden"></div>
    </aside>
  </div>`;
}

function modal() {
  return `<div id="siteModal" class="fixed inset-0 z-[60] hidden items-center justify-center bg-black/60 backdrop-blur-sm p-4">
    <div class="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-gray-100">
      <div class="flex items-center space-x-3 mb-4">
        <div id="siteModalIcon" class="w-11 h-11 rounded-full bg-amber-100 text-buildbronze grid place-items-center"><i class="fa-solid fa-bell"></i></div>
        <h3 id="siteModalTitle" class="text-lg font-extrabold text-builddark">Notification</h3>
      </div>
      <p id="siteModalBody" class="text-gray-600 text-sm leading-relaxed mb-6"></p>
      <div class="flex justify-end"><button type="button" data-close-modal class="px-5 py-2.5 bg-builddark text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition">OK</button></div>
    </div>
  </div>
  <div class="toast-container" id="toastContainer" aria-live="polite" aria-atomic="true"></div>`;
}

export function showNotice(title, message, iconClass = "fa-bell") {
  const modalEl = document.getElementById("siteModal");
  if (!modalEl) return;
  document.getElementById("siteModalTitle").textContent = title;
  document.getElementById("siteModalBody").textContent = message;
  document.getElementById("siteModalIcon").innerHTML = `<i class="fa-solid ${iconClass}"></i>`;
  modalEl.classList.remove("hidden");
  modalEl.classList.add("flex");
}

export function showToast(title, message, type = "success") {
  const container = document.getElementById("toastContainer");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <div class="toast-icon"><i class="fa-solid ${type === "success" ? "fa-check" : "fa-info-circle"}"></i></div>
    <div class="toast-content">
      <div class="toast-title">${title}</div>
      <div class="toast-message">${message}</div>
    </div>
  `;
  container.appendChild(toast);

  // Force reflow then show
  requestAnimationFrame(() => toast.classList.add("show"));

  const dismiss = () => {
    toast.classList.remove("show");
    toast.classList.add("hide");
    toast.addEventListener("transitionend", () => toast.remove(), { once: true });
  };

  setTimeout(dismiss, 3500);
  toast.addEventListener("click", dismiss);
}

function closeNotice() {
  const modalEl = document.getElementById("siteModal");
  if (!modalEl) return;
  modalEl.classList.add("hidden");
  modalEl.classList.remove("flex");
}

export function openCart(open = true) {
  const drawerEl = document.querySelector(".drawer");
  if (!drawerEl) return;
  drawerEl.classList.toggle("open", open);
  document.body.classList.toggle("locked", open);
}

function refresh() {
  const n = cart.count();
  document.querySelectorAll(".cart-count").forEach((el) => (el.textContent = n));
  document.querySelectorAll("[data-open-cart]").forEach((el) => el.setAttribute("aria-label", n ? `Open cart, ${n} items` : "Open cart"));
  const body = document.querySelector(".drawer-body");
  if (body) body.innerHTML = drawerBody();
}

function toggleMenu() {
  const menu = document.getElementById("mobile-menu");
  const button = document.querySelector("[data-menu]");
  if (!menu || !button) return;
  const open = menu.classList.toggle("hidden");
  button.setAttribute("aria-expanded", String(!open));
  button.innerHTML = `<i class="fa-solid ${open ? "fa-bars" : "fa-xmark"}"></i>`;
}

/* mount */
const headerEl = document.getElementById("header");
if (headerEl) headerEl.innerHTML = header();
const footerEl = document.getElementById("footer");
if (footerEl) footerEl.innerHTML = footer();
document.body.insertAdjacentHTML("beforeend", drawer() + modal());

refresh();
document.addEventListener("cart:change", refresh);

document.addEventListener("click", (e) => {
  if (e.target.closest("[data-open-cart]")) openCart(true);
  if (e.target.closest("[data-close-cart]") || e.target.closest(".drawer a")) openCart(false);
  if (e.target.closest("[data-menu]")) toggleMenu();
  if (e.target.closest("a[href]") && e.target.closest("#mobile-menu")) toggleMenu();

  const notice = e.target.closest("[data-notice]");
  if (notice) {
    const item = NOTICES[notice.dataset.notice];
    if (item) showNotice(item.title, item.body, item.icon);
  }
  if (e.target.closest("[data-close-modal]")) closeNotice();

  // add to cart buttons
  const addBtn = e.target.closest("[data-add]");
  if (addBtn) {
    const planId = addBtn.dataset.add;
    const plan = getPlan(planId);
    cart.add(planId);

    // Button success feedback
    addBtn.classList.add("btn-add", "success");
    const originalHTML = addBtn.innerHTML;
    addBtn.innerHTML = `<i class="fa-solid fa-check mr-2"></i>Added`;
    setTimeout(() => {
      addBtn.classList.remove("success");
      addBtn.innerHTML = originalHTML;
    }, 1200);

    // Cart icon pulse
    const cartIcon = document.querySelector("[data-open-cart] .fa-bag-shopping");
    if (cartIcon) {
      cartIcon.classList.add("cart-icon", "pulse");
      setTimeout(() => cartIcon.classList.remove("pulse"), 400);
    }

    // Toast notification
    const planName = plan?.name || "Plan";
    showToast("Added to cart", `${planName} added — ready to checkout`, "success");

    // Open drawer after brief delay
    setTimeout(() => openCart(true), 350);
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  openCart(false);
  closeNotice();
});
