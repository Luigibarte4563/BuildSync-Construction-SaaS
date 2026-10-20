import "./layout.js";
import { sendEmail } from "./mailer.js";
import { formatPHP } from "./data.js";
import { decodeOrder } from "./refund-data.js";

const app = document.getElementById("app");
const startedAt = Date.now();
const params = new URLSearchParams(location.search);
const ref = (params.get("ref") || "").trim();
const decoded = decodeOrder(params.get("order"));
const order =
  decoded &&
  typeof decoded.id === "string" &&
  Array.isArray(decoded.items) &&
  Number.isFinite(decoded.subtotal) &&
  Number.isFinite(decoded.vat) &&
  Number.isFinite(decoded.total)
    ? decoded
    : null;

const INPUT = "w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-buildbronze";

const esc = (value) =>
  String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);

const money = (value) => formatPHP(Number(value) || 0);

function receiptHTML(order) {
  const items = order.items
    .filter((item) => item && typeof item === "object")
    .map((item) => {
      const qty = Number(item.qty) || 1;
      const unit = qty === 1 && item.unit ? ` <span class="text-gray-400">${esc(item.unit)}</span>` : "";
      return `<li class="py-3 flex justify-between gap-3"><span class="text-gray-600">${esc(item.name)}${qty > 1 ? ` <span class="text-gray-400">× ${qty}</span>` : ""}${unit}</span><span class="font-semibold text-builddark">${money(item.price * qty)}</span></li>`;
    })
    .join("");

  return `<div class="bg-white rounded-3xl border border-buildborder shadow-sm p-6 sm:p-8">
    <p class="text-xs font-bold uppercase tracking-wider text-gray-500">Order number: ${esc(order.id)}</p>
    <div class="flex items-center justify-between pb-5 border-b border-buildborder mt-3">
      <div class="flex items-center space-x-3">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-builddark to-buildnavy grid place-items-center text-amber-500"><i class="fa-solid fa-cubes"></i></div>
        <div>
          <p class="font-extrabold text-builddark leading-tight">Build<span class="text-buildbronze">Sync</span></p>
          <p class="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Subscription receipt</p>
        </div>
      </div>
      <span class="px-3 py-1 rounded-lg bg-amber-50 border border-amber-200 text-buildbronze text-xs font-bold">Refund request</span>
    </div>
    <ul class="divide-y divide-buildborder text-sm">${items}</ul>
    <dl class="space-y-2 text-sm border-t border-buildborder pt-4">
      <div class="flex justify-between"><dt class="text-gray-500">Subtotal</dt><dd class="font-semibold">${money(order.subtotal)}</dd></div>
      <div class="flex justify-between"><dt class="text-gray-500">VAT (12%)</dt><dd class="font-semibold">${money(order.vat)}</dd></div>
      <div class="flex justify-between"><dt class="text-gray-500">Order total</dt><dd class="font-semibold">${money(order.total)}</dd></div>
      <div class="flex justify-between"><dt class="text-gray-500">Cancellation fee (20%)</dt><dd class="font-semibold">-${money(order.total * 0.2)}</dd></div>
      <div class="flex justify-between text-base font-extrabold text-builddark border-t border-buildborder pt-3"><dt>Refund amount</dt><dd>${money(order.total * 0.8)}</dd></div>
      <div class="flex justify-between"><dt class="text-gray-500">Refund to</dt><dd class="font-semibold">${esc(order.method || "Not selected")}</dd></div>
    </dl>
  </div>`;
}

function requestMessage({ reference, email, reason }) {
  const lines = [`Refund request for subscription ${reference}.`];

  if (order) {
    lines.push(
      "",
      "Plans:",
      ...order.items
        .filter((item) => item && typeof item === "object")
        .map((item) => {
          const qty = Number(item.qty) || 1;
          return `- ${item.name} × ${qty} — ${money(item.price * qty)}${qty === 1 && item.unit ? ` ${item.unit}` : ""}`;
        }),
      "",
      `Subtotal: ${money(order.subtotal)}`,
      `VAT (12%): ${money(order.vat)}`,
      `Order total: ${money(order.total)}`,
      `Cancellation fee (20%): ${money(order.total * 0.2)}`,
      `Refund amount: ${money(order.total * 0.8)}`,
      `Refund to: ${order.method || "Not selected"}`,
    );
  }

  lines.push(
    "",
    `Contact email: ${email}`,
    `Reason: ${reason || "Not provided"}`,
    "",
    "We'll review the request and reply within 1 business day.",
  );
  return lines.join("\n");
}

app.innerHTML = `<section class="py-12 lg:py-16"><div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
  <div class="mb-8">
    <a href="index.html" class="text-sm font-semibold text-gray-500 hover:text-buildbronze transition">← Back to home</a>
    <h1 class="text-3xl sm:text-4xl font-extrabold text-builddark tracking-tight mt-2">Request a refund</h1>
  </div>
  <form id="refund" class="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
    <div class="lg:col-span-2 space-y-6">
      ${order ? receiptHTML(order) : `<p class="text-sm text-gray-600 bg-white rounded-3xl border border-buildborder shadow-sm p-6">We couldn't load this order here. Enter the subscription reference from your confirmation email and our team will verify it.</p>`}
      <fieldset class="bg-white rounded-3xl border border-buildborder shadow-sm p-6 sm:p-8">
        <div class="flex items-center gap-3 mb-5">
          <span class="w-8 h-8 rounded-lg bg-amber-100 text-buildbronze grid place-items-center text-xs font-extrabold">01</span>
          <h2 class="text-lg font-extrabold text-builddark">Refund details</h2>
        </div>
        <div class="space-y-4">
          ${order ? "" : `<label class="block"><span class="block text-xs font-bold text-gray-700 mb-1.5">Subscription reference</span><input class="${INPUT}" name="ref" required maxlength="60" placeholder="BS-ABC123"></label>`}
          <label class="block"><span class="block text-xs font-bold text-gray-700 mb-1.5">Email used for the subscription</span><input class="${INPUT}" name="email" type="email" required autocomplete="email" placeholder="juan@company.ph"></label>
          <label class="block"><span class="block text-xs font-bold text-gray-700 mb-1.5">Reason for refund</span><select class="${INPUT}" name="reason" required>
            <option value="" disabled selected>Select a reason…</option>
            <option>Project ended</option>
            <option>Changing provider</option>
            <option>Subscribed by mistake</option>
            <option>Budget cut</option>
            <option>Other</option>
          </select></label>
        </div>
      </fieldset>
      <div>
        <button type="submit" id="confirm" class="px-8 py-3.5 bg-buildbronze text-white text-sm font-bold rounded-xl hover:bg-buildbronzehover transition shadow-lg shadow-amber-600/20">Confirm refund</button>
        <p class="text-xs text-gray-500 mt-3" id="status" role="status">We'll email a copy to you and our team.</p>
      </div>
      <input class="sr-only" name="website" tabindex="-1" autocomplete="off" aria-hidden="true" />
    </div>
    <aside class="bg-white rounded-3xl border border-buildborder shadow-sm p-6">
      <h2 class="text-lg font-extrabold text-builddark mb-3">Refund policy</h2>
      <p class="text-sm text-gray-600 leading-relaxed">Cancel within 7 days of payment. A 20% cancellation fee applies; you get 80% back. Our team reviews every request and replies within 1 business day.</p>
    </aside>
  </form>
</div></section>`;

const form = document.getElementById("refund");
if (!order && form.elements.ref) form.elements.ref.value = ref;

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const data = new FormData(form);
  const email = String(data.get("email") || "").trim();
  const reference = String(order ? order.id : data.get("ref") || "").replace(/[\r\n]+/g, " ").trim().slice(0, 60);
  const reason = String(data.get("reason") || "").trim();
  const confirm = document.getElementById("confirm");
  const status = document.getElementById("status");

  if (!reference) {
    status.textContent = "Enter your subscription reference.";
    return;
  }

  confirm.disabled = true;
  status.textContent = "Sending…";

  try {
    const result = await sendEmail(
      {
        to: email,
        subject: `Refund request (${reference})`,
        message: requestMessage({ reference, email, reason }),
        website: data.get("website") || "",
        refund: true,
      },
      startedAt,
    );

    app.innerHTML = `<section class="py-20"><div class="max-w-2xl mx-auto px-4 text-center">
      <div class="w-16 h-16 rounded-full bg-green-100 text-green-700 grid place-items-center text-2xl mx-auto mb-5"><i class="fa-solid fa-check"></i></div>
      <h1 class="text-3xl font-extrabold text-builddark">Refund request sent</h1>
      <p class="text-gray-600 mt-3 leading-relaxed">${
        result.buyerEmailFailed
          ? "Our team has your request, but we couldn't email you a copy. We'll still process it."
          : "We've emailed a copy to you and our team. We'll reply within 1 business day."
      }</p>
      <a href="index.html" class="inline-block mt-6 px-6 py-3 bg-buildbronze text-white text-sm font-bold rounded-xl hover:bg-buildbronzehover transition">Back to home</a>
    </div></section>`;
  } catch (err) {
    status.textContent = err.message;
    confirm.disabled = false;
  }
});
