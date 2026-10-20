import "./layout.js";
import { getLastOrder } from "./cart.js";
import { formatPHP } from "./data.js";

const app = document.getElementById("app");
const esc = (value) =>
  String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);

// localStorage is editable by the user, so only render a shape we recognise
const saved = getLastOrder();
const order =
  saved &&
  typeof saved.id === "string" &&
  Array.isArray(saved.items) &&
  saved.items.length > 0 &&
  ["subtotal", "vat", "total"].every((key) => Number.isFinite(saved[key]))
    ? saved
    : null;

const spamNote = "Check spam, or contact us if it doesn't arrive in 10 minutes.";
const buyerEmailFailed = order?.buyerEmailFailed === true || order?.buyerDelivered === false;
const lead = !order
  ? ""
  : buyerEmailFailed
    ? `Your subscription is saved, but we couldn't deliver the confirmation to <strong>${esc(order.email || "your email")}</strong>. Check the email address or contact us at support@buildsync.ph. ${spamNote}`
    : `We've sent a confirmation email to <strong>${esc(order.email || "your email")}</strong>. It includes a link to request a refund within 7 days. ${spamNote}`;

app.innerHTML = !order
  ? `<section class="py-20"><div class="max-w-2xl mx-auto px-4 text-center">
      <div class="w-16 h-16 rounded-2xl bg-amber-50 text-buildbronze grid place-items-center text-2xl mx-auto mb-4"><i class="fa-solid fa-receipt"></i></div>
      <h1 class="text-3xl font-extrabold text-builddark">No recent subscription</h1>
      <p class="text-gray-500 mt-2 mb-6">Choose a plan to open a workspace.</p>
      <a href="plans.html" class="inline-block px-6 py-3 bg-buildbronze text-white text-sm font-bold rounded-xl hover:bg-buildbronzehover transition">Browse plans</a>
    </div></section>`
  : `<section class="py-16 bg-gradient-to-b from-white to-gray-100 border-b border-buildborder"><div class="max-w-3xl mx-auto px-4 sm:px-6">
      <div class="text-center">
        <div class="w-16 h-16 rounded-full bg-green-100 text-green-700 grid place-items-center text-2xl mx-auto mb-5"><i class="fa-solid fa-check"></i></div>
        <p class="text-xs font-bold uppercase tracking-wider text-gray-500">Subscription reference: ${esc(order.id)}</p>
        <h1 class="text-3xl sm:text-4xl font-extrabold text-builddark tracking-tight mt-2">Subscription received</h1>
        <p class="text-gray-600 mt-3 leading-relaxed">${lead}</p>
      </div>

      <div class="bg-white rounded-3xl border border-buildborder shadow-sm p-6 sm:p-8 mt-8">
        <div class="flex items-center justify-between pb-5 border-b border-buildborder">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-builddark to-buildnavy grid place-items-center text-amber-500"><i class="fa-solid fa-cubes"></i></div>
            <div>
              <p class="font-extrabold text-builddark leading-tight">Build<span class="text-buildbronze">Sync</span></p>
              <p class="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Subscription receipt</p>
            </div>
          </div>
          <span class="px-3 py-1 rounded-lg bg-amber-50 border border-amber-200 text-buildbronze text-xs font-bold">Demo payment · ${esc(order.method || "Not selected")}</span>
        </div>

        <ul class="divide-y divide-buildborder text-sm">
          ${order.items
            .map((item) => {
              const qty = Math.max(1, Number(item?.qty) || 1);
              const price = Number(item?.price) || 0;
              return `<li class="py-3 flex justify-between gap-3"><span class="text-gray-600">${esc(item?.name || "Plan")} <span class="text-gray-400">× ${qty}</span></span><span class="font-semibold text-builddark">${formatPHP(price * qty)}</span></li>`;
            })
            .join("")}
        </ul>

        <dl class="space-y-2 text-sm border-t border-buildborder pt-4">
          <div class="flex justify-between"><dt class="text-gray-500">Subtotal</dt><dd class="font-semibold">${formatPHP(order.subtotal)}</dd></div>
          <div class="flex justify-between"><dt class="text-gray-500">VAT (12%)</dt><dd class="font-semibold">${formatPHP(order.vat)}</dd></div>
          <div class="flex justify-between text-base font-extrabold text-builddark"><dt>Total</dt><dd>${formatPHP(order.total)}</dd></div>
        </dl>
      </div>

      <div class="flex flex-col sm:flex-row gap-3 justify-center mt-8">
        <a href="dashboard.html" class="px-6 py-3 bg-buildbronze text-white text-sm font-bold rounded-xl hover:bg-buildbronzehover transition">Open dashboard demo</a>
        <a href="plans.html" class="px-6 py-3 bg-white border border-gray-300 text-builddark text-sm font-bold rounded-xl hover:bg-gray-50 transition">View plans</a>
        <a href="index.html" class="px-6 py-3 bg-white border border-gray-300 text-builddark text-sm font-bold rounded-xl hover:bg-gray-50 transition">Back to home</a>
      </div>
    </div></section>`;
