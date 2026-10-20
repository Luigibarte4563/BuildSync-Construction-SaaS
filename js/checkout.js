import "./layout.js";
import * as cart from "./cart.js";
import { formatPHP, totals } from "./data.js";
import { sendEmail } from "./mailer.js";
import { encodeOrder } from "./refund-data.js";

const PAYMENT_GROUPS = [
  {
    title: "E-Wallet",
    methods: [
      { id: "gcash", badge: "G", label: "GCash", hint: "Pay with your GCash wallet" },
      { id: "maya", badge: "M", label: "Maya", hint: "Pay with your Maya wallet" },
    ],
  },
  {
    title: "Online banking",
    methods: [
      { id: "bdo", badge: "BDO", label: "BDO", hint: "BDO Unibank" },
      { id: "bpi", badge: "BPI", label: "BPI", hint: "Bank of the Philippine Islands" },
      { id: "metrobank", badge: "MB", label: "Metrobank", hint: "Metropolitan Bank & Trust" },
      { id: "landbank", badge: "LBP", label: "Landbank", hint: "Land Bank of the Philippines" },
    ],
  },
  {
    title: "Debit or credit card",
    methods: [
      { id: "debit", badge: "DR", label: "Debit card", hint: "Pay from your bank account" },
      { id: "credit", badge: "CR", label: "Credit card", hint: "Pay with your credit line" },
    ],
  },
];

const METHODS = PAYMENT_GROUPS.flatMap((group) => group.methods.map((method) => ({ ...method, group: group.title })));

const REGIONS = ["Metro Manila (NCR)", "Luzon (outside NCR)", "Visayas", "Mindanao"];
const PH_MOBILE = "^(\\+?63|0)9\\d{2}\\s?\\d{3}\\s?\\d{4}$";
const INPUT = "w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-buildbronze";
const app = document.getElementById("app");
const items = cart.lines();

const isoDate = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
const today = new Date();
const field = (label, input, cls = "") =>
  `<label class="block ${cls}"><span class="block text-xs font-bold text-gray-700 mb-1.5">${label}</span>${input}</label>`;

// plain-text body of the confirmation email; the server escapes it and wraps it in the HTML template
function orderMessage(data, method, items, t, orderId) {
  const get = (key) => String(data.get(key) || "").trim();
  const firstName = get("name").split(/\s+/)[0] || "there";
  const rawDate = get("date");
  const startDate = rawDate
    ? new Date(`${rawDate}T00:00:00`).toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" })
    : "Not set";
  const lines = [
    `Thank you for subscribing, ${firstName}. We've received your details and will activate your workspace within 1 business day.`,
    "",
    `Subscription reference: ${orderId}`,
    `Preferred start date: ${startDate}`,
    `Billing address: ${get("address")}`,
    `Region: ${get("region")}`,
    `Contact: ${get("name")}`,
    get("company") ? `Company: ${get("company")}` : null,
    `Email: ${get("email")}`,
    `Phone: ${get("phone")}`,
    `Payment method: ${method ? `${method.group} - ${method.label}` : "Not selected"}`,
    "",
    "Plans",
    ...items.map((l) => `- ${l.plan.name} × ${l.qty} — ${formatPHP(l.lineTotal)}`),
    "",
    `Subtotal: ${formatPHP(t.subtotal)}`,
    `VAT (12%): ${formatPHP(t.vat)}`,
    `Total: ${formatPHP(t.total)}`,
    "",
    `Refundable: cancel within 7 days and get ${formatPHP(t.total * 0.8)} back (a 20% cancellation fee of ${formatPHP(t.total * 0.2)} applies).`,
    "",
    "If anything is wrong, reply to this email or call +63 (2) 8888-5555.",
  ];
  return lines.filter((line) => line !== null).join("\n");
}

function emptyView() {
  app.innerHTML = `<section class="py-20"><div class="max-w-2xl mx-auto px-4 text-center">
    <div class="w-16 h-16 rounded-2xl bg-amber-50 text-buildbronze grid place-items-center text-2xl mx-auto mb-4"><i class="fa-solid fa-bag-shopping"></i></div>
    <h1 class="text-3xl font-extrabold text-builddark">Your cart is empty</h1>
    <p class="text-gray-500 mt-2 mb-6">Add a plan before checking out.</p>
    <a href="plans.html" class="inline-block px-6 py-3 bg-buildbronze text-white text-sm font-bold rounded-xl hover:bg-buildbronzehover transition">Browse plans</a>
  </div></section>`;
}

function formView() {
  const sub = cart.subtotal();
  const t = totals(sub);
  const startedAt = Date.now(); // the server rejects submissions faster than a human can type
  const first = METHODS[0].id;

  app.innerHTML = `<section class="py-12 lg:py-16"><div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="mb-8">
      <a href="cart.html" class="text-sm font-semibold text-gray-500 hover:text-buildbronze transition">← Back to cart</a>
      <h1 class="text-3xl sm:text-4xl font-extrabold text-builddark tracking-tight mt-2">Checkout</h1>
      <p class="text-gray-600 mt-1">Your subscription confirmation is emailed as soon as the form is accepted.</p>
    </div>

    <form id="checkout" class="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      <div class="lg:col-span-2 space-y-6">
        <fieldset class="bg-white rounded-3xl border border-buildborder shadow-sm p-6 sm:p-8">
          <div class="flex items-center gap-3 mb-5">
            <span class="w-8 h-8 rounded-lg bg-amber-100 text-buildbronze grid place-items-center text-xs font-extrabold">01</span>
            <h2 class="text-lg font-extrabold text-builddark">Contact details</h2>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            ${field("Full name", `<input class="${INPUT}" name="name" required autocomplete="name" placeholder="Juan Dela Cruz">`)}
            ${field("Company (optional)", `<input class="${INPUT}" name="company" autocomplete="organization" placeholder="ABC Builders Inc.">`)}
            ${field("Work email", `<input class="${INPUT}" name="email" type="email" required autocomplete="email" placeholder="juan@company.ph">`)}
            ${field("Mobile number", `<input class="${INPUT}" name="phone" type="tel" required autocomplete="tel" placeholder="0917 123 4567" pattern="${PH_MOBILE}" title="PH mobile number, e.g. 0917 123 4567">`)}
          </div>
        </fieldset>

        <fieldset class="bg-white rounded-3xl border border-buildborder shadow-sm p-6 sm:p-8">
          <div class="flex items-center gap-3 mb-5">
            <span class="w-8 h-8 rounded-lg bg-amber-100 text-buildbronze grid place-items-center text-xs font-extrabold">02</span>
            <h2 class="text-lg font-extrabold text-builddark">Billing details</h2>
          </div>
          <div class="grid grid-cols-1 gap-4">
            ${field("Billing address", `<input class="${INPUT}" name="address" required placeholder="Unit 12, 4th Avenue, BGC, Taguig City">`)}
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              ${field(
                "Region",
                `<select class="${INPUT}" name="region" required><option value="" disabled selected>Select region</option>${REGIONS.map((region) => `<option>${region}</option>`).join("")}</select>`,
              )}
              ${field("Preferred start date", `<input class="${INPUT}" name="date" type="date" required min="${isoDate(today)}" value="${isoDate(today)}">`)}
            </div>
          </div>
        </fieldset>

        <fieldset class="bg-white rounded-3xl border border-buildborder shadow-sm p-6 sm:p-8">
          <div class="flex items-center gap-3 mb-5">
            <span class="w-8 h-8 rounded-lg bg-amber-100 text-buildbronze grid place-items-center text-xs font-extrabold">03</span>
            <h2 class="text-lg font-extrabold text-builddark">Payment method</h2>
          </div>
          <div class="space-y-5" role="radiogroup" aria-label="Payment method">
            ${PAYMENT_GROUPS.map(
              (group) => `<div>
                <h3 class="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">${group.title}</h3>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  ${group.methods
                    .map(
                      (method) => `<label class="method ${method.id === first ? "active" : ""} flex items-center gap-3 p-4 rounded-xl border-2 border-buildborder cursor-pointer">
                        <input type="radio" name="method" value="${method.id}" class="sr-only" ${method.id === first ? "checked" : ""}>
                        <span class="w-10 h-10 rounded-lg bg-gray-100 text-builddark grid place-items-center text-[10px] font-extrabold shrink-0">${method.badge}</span>
                        <span class="flex-1 min-w-0"><strong class="block text-sm text-builddark">${method.label}</strong><small class="block text-xs text-gray-500 truncate">${method.hint}</small></span>
                        <span class="radio-dot"></span>
                      </label>`,
                    )
                    .join("")}
                </div>
              </div>`,
            ).join("")}
          </div>
        </fieldset>

        <input class="sr-only" name="website" tabindex="-1" autocomplete="off" aria-hidden="true" />
      </div>

      <aside class="lg:sticky lg:top-28">
        <div class="bg-white rounded-3xl border border-buildborder shadow-sm p-6 space-y-5">
          <h2 class="text-lg font-extrabold text-builddark">Order summary</h2>
          <ul class="space-y-3 text-sm">
            ${items
              .map(
                (l) => `<li class="flex justify-between gap-3"><span class="text-gray-600">${l.plan.name} <span class="text-gray-400">× ${l.qty}</span></span><span class="font-semibold text-builddark">${formatPHP(l.lineTotal)}</span></li>`,
              )
              .join("")}
          </ul>
          ${cart.totalsHTML(sub)}
          <p class="text-xs text-gray-500 leading-relaxed">Refundable. Cancel within 7 days using the link in your confirmation email. A 20% cancellation fee applies; you get ${formatPHP(t.total * 0.8)} back.</p>
          <button type="submit" id="pay" class="w-full py-4 bg-buildbronze text-white font-bold rounded-xl hover:bg-buildbronzehover transition shadow-lg shadow-amber-600/20">
            <i class="fa-solid fa-lock mr-2"></i>Activate — ${formatPHP(t.total)}
          </button>
          <p class="text-xs text-gray-500 leading-relaxed" id="mail-status" role="status">Your confirmation email is real. Payment is a demo; no card is charged.</p>
        </div>
      </aside>
    </form>
  </div></section>`;

  const form = document.getElementById("checkout");

  form.addEventListener("change", (e) => {
    if (e.target.name !== "method") return;
    form.querySelectorAll(".method").forEach((el) => el.classList.toggle("active", el.querySelector("input").checked));
  });

  // mail the confirmation first; only redirect once the server accepted it
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const method = METHODS.find((m) => m.id === data.get("method"));
    const pay = document.getElementById("pay");
    const status = document.getElementById("mail-status");
    const note = status.textContent;
    const orderId = `BS-${Date.now().toString(36).toUpperCase().slice(-6)}`;
    const refundUrl = new URL("refund.html", location.href);
    refundUrl.searchParams.set("ref", orderId);
    refundUrl.searchParams.set(
      "order",
      encodeOrder({
        id: orderId,
        items: items.map((l) => ({ name: l.plan.name, unit: l.plan.unit, qty: l.qty, price: l.plan.price })),
        subtotal: t.subtotal,
        vat: t.vat,
        total: t.total,
        method: method ? `${method.group} - ${method.label}` : "Not selected",
      }),
    );

    pay.disabled = true;
    pay.innerHTML = `<i class="fa-solid fa-spinner fa-spin mr-2"></i>Processing payment…`;
    paying = true;

    let mail;
    try {
      mail = await sendEmail(
        {
          to: data.get("email"),
          subject: `Your BuildSync subscription (${orderId})`,
          message: orderMessage(data, method, items, t, orderId),
          website: data.get("website") || "",
          cta: { label: "Request a refund", href: refundUrl.href },
        },
        startedAt,
      );
    } catch (err) {
      // no order placed and no redirect, so the customer never sees a false "confirmation"
      status.textContent = `${note} ${err.message}`;
      pay.innerHTML = `<i class="fa-solid fa-lock mr-2"></i>Activate — ${formatPHP(t.total)}`;
      pay.disabled = false;
      paying = false;
      return;
    }

    // payment stays mock
    setTimeout(() => {
      cart.placeOrder({
        id: orderId,
        name: data.get("name"),
        email: data.get("email"),
        method: method?.label || "Not selected",
        items: items.map((l) => ({ name: l.plan.name, unit: l.plan.unit, qty: l.qty, price: l.plan.price })),
        ...t,
        buyerEmailFailed: mail.buyerEmailFailed === true,
        placedAt: new Date().toISOString(),
      });
      location.href = "success.html";
    }, 1400);
  });
}

let paying = false;
items.length ? formView() : emptyView();

// reload if the cart changes in the drawer
document.addEventListener("cart:change", () => !paying && location.reload());
