import { getPlan, formatPHP, totals } from "./data.js";

const KEY = "buildsync-cart";

function read() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || { items: [], lastOrder: null };
  } catch {
    return { items: [], lastOrder: null };
  }
}

function write(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {}
  document.dispatchEvent(new CustomEvent("cart:change"));
}

export const getItems = () => read().items;
export const getLastOrder = () => read().lastOrder;
export const count = () => getItems().reduce((n, i) => n + i.qty, 0);

export function add(id) {
  const state = read();
  const item = state.items.find((i) => i.id === id);
  if (item) item.qty += 1;
  else state.items.push({ id, qty: 1 });
  write(state);
}

export function setQty(id, qty) {
  const state = read();
  state.items = qty <= 0 ? state.items.filter((i) => i.id !== id) : state.items.map((i) => (i.id === id ? { ...i, qty: Math.min(qty, 99) } : i));
  write(state);
}

export function remove(id) {
  const state = read();
  state.items = state.items.filter((i) => i.id !== id);
  write(state);
}

export function clear() {
  write({ ...read(), items: [] });
}

export function placeOrder(order) {
  write({ items: [], lastOrder: order });
}

// cart items joined with plan data
export function lines() {
  return getItems().flatMap((item) => {
    const plan = getPlan(item.id);
    return plan ? [{ ...item, plan, lineTotal: plan.price * item.qty }] : [];
  });
}

export const subtotal = () => lines().reduce((n, l) => n + l.lineTotal, 0);

// shared html pieces
export function qtyHTML(id, qty) {
  return `<div class="inline-flex items-center rounded-lg border border-buildborder overflow-hidden">
    <button type="button" data-qty="${id}" data-step="-1" aria-label="Decrease quantity" class="w-8 h-8 grid place-items-center text-gray-500 hover:bg-gray-100 transition"><i class="fa-solid fa-minus text-[10px]"></i></button>
    <span class="w-9 text-center text-sm font-bold" aria-live="polite">${qty}</span>
    <button type="button" data-qty="${id}" data-step="1" aria-label="Increase quantity" class="w-8 h-8 grid place-items-center text-gray-500 hover:bg-gray-100 transition"><i class="fa-solid fa-plus text-[10px]"></i></button>
  </div>`;
}

export function totalsHTML(sub) {
  const t = totals(sub);
  return `<dl class="space-y-2 text-sm">
    <div class="flex justify-between"><dt class="text-gray-500">Subtotal</dt><dd class="font-semibold text-builddark">${formatPHP(t.subtotal)}</dd></div>
    <div class="flex justify-between"><dt class="text-gray-500">VAT (12%)</dt><dd class="font-semibold text-builddark">${formatPHP(t.vat)}</dd></div>
    <div class="flex justify-between border-t border-buildborder pt-3 text-base font-extrabold text-builddark"><dt>Total</dt><dd>${formatPHP(t.total)}</dd></div>
  </dl>`;
}

// quantity and remove buttons anywhere on the page
document.addEventListener("click", (e) => {
  const step = e.target.closest("[data-qty]");
  if (step) {
    const item = getItems().find((i) => i.id === step.dataset.qty);
    if (item) setQty(item.id, item.qty + Number(step.dataset.step));
  }
  const del = e.target.closest("[data-remove]");
  if (del) remove(del.dataset.remove);
});
