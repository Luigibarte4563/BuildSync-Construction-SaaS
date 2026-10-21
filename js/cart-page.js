import "./layout.js";
import { badgesHTML } from "./layout.js";
import * as cart from "./cart.js";
import { formatPHP } from "./data.js";

const app = document.getElementById("app");

function render() {
  const items = cart.lines();
  const body = items.length
    ? `<div class="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <ul class="lg:col-span-2 bg-white rounded-3xl border border-buildborder shadow-sm divide-y divide-buildborder">
          ${items
            .map(
              (l) => `<li class="p-6 flex gap-4">
                <div class="w-14 h-14 rounded-2xl bg-amber-100 text-buildbronze grid place-items-center font-extrabold text-lg shrink-0">${l.plan.index}</div>
                <div class="flex-1 min-w-0">
                  <div class="flex justify-between gap-4">
                    <div>
                      <h2 class="font-extrabold text-builddark">${l.plan.name}</h2>
                      <p class="text-sm text-gray-500">${formatPHP(l.plan.price)} ${l.plan.unit}</p>
                    </div>
                    <button type="button" data-remove="${l.id}" class="text-gray-400 hover:text-red-600 transition self-start" aria-label="Remove ${l.plan.name}"><i class="fa-solid fa-trash-can"></i></button>
                  </div>
                  <div class="flex justify-between items-center mt-4">
                    ${cart.qtyHTML(l.id, l.qty)}
                    <span class="font-extrabold text-builddark">${formatPHP(l.lineTotal)}</span>
                  </div>
                </div>
              </li>`,
            )
            .join("")}
        </ul>
        <aside class="bg-white rounded-3xl border border-buildborder shadow-sm p-6 space-y-5">
          <h2 class="text-lg font-extrabold text-builddark">Subscription summary</h2>
          ${cart.totalsHTML(cart.subtotal())}
          <a href="checkout.html" class="block py-3.5 text-center bg-buildbronze text-white text-sm font-bold rounded-xl hover:bg-buildbronzehover transition shadow-lg shadow-amber-600/20">Review subscription</a>
          <div>
            <p class="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">We accept</p>
            ${badgesHTML(false)}
          </div>
          <p class="text-xs text-gray-500 leading-relaxed">Prices exclude 12% VAT. Plans renew on your billing cycle; cancel any time.</p>
        </aside>
      </div>`
    : `<div class="bg-white rounded-3xl border border-buildborder shadow-sm p-12 text-center">
        <div class="w-16 h-16 rounded-2xl bg-amber-50 text-buildbronze grid place-items-center text-2xl mx-auto mb-4"><i class="fa-solid fa-bag-shopping"></i></div>
        <h2 class="text-xl font-extrabold text-builddark">No plans selected</h2>
        <p class="text-gray-500 text-sm mt-1 mb-6">Pick a plan to start your subscription.</p>
        <a href="plans.html" class="inline-block px-6 py-3 bg-buildbronze text-white text-sm font-bold rounded-xl hover:bg-buildbronzehover transition">Browse plans</a>
      </div>`;

  app.innerHTML = `<section class="py-12 lg:py-16"><div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex items-center justify-between mb-8">
      <h1 class="text-3xl sm:text-4xl font-extrabold text-builddark tracking-tight">Your subscription</h1>
      ${items.length ? `<button type="button" id="clear" class="text-sm font-semibold text-gray-500 hover:text-red-600 transition">Remove all</button>` : ""}
    </div>
    ${body}
  </div></section>`;
}

render();
document.addEventListener("cart:change", render);
app.addEventListener("click", (e) => {
  if (e.target.closest("#clear")) cart.clear();
});
