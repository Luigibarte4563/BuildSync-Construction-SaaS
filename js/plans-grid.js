import { PLANS, formatPHP } from "./data.js";

// plan cards with add-to-cart buttons, shared by the home and plans pages
export function renderPlans(el) {
  el.innerHTML = PLANS.map((plan, i) => {
    const featured = Boolean(plan.featured);
    const tone = featured
      ? { card: "bg-builddark text-white border-amber-500/40 shadow-xl", title: "text-white", text: "text-gray-300", icon: "text-amber-400", button: "bg-buildbronze hover:bg-buildbronzehover" }
      : { card: "bg-white text-builddark border-buildborder shadow-sm", title: "text-builddark", text: "text-gray-600", icon: "text-buildbronze", button: "bg-builddark hover:bg-gray-800" };

    return `<div data-reveal data-delay="${i * 80}" class="h-full">
      <article class="relative flex h-full flex-col rounded-3xl border p-8 ${tone.card}">
        ${plan.badge ? `<span class="absolute top-0 right-0 bg-buildbronze text-white text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-bl-xl">${plan.badge}</span>` : ""}
        <span class="text-xs font-bold uppercase tracking-wider ${featured ? "text-amber-400" : "text-buildbronze"}">${plan.index} / ${plan.name}</span>
        <h3 class="text-2xl font-extrabold mt-2 ${tone.title}">${plan.name}</h3>
        <p class="text-sm mt-1 leading-relaxed ${tone.text}">${plan.description}</p>
        <p class="my-6"><span class="text-4xl font-extrabold ${tone.title}">${formatPHP(plan.price)}</span><span class="text-sm ${tone.text}"> / month</span></p>
        <p class="text-[11px] font-semibold uppercase tracking-wider ${tone.text} -mt-5 mb-6">Excluding 12% VAT</p>
        <ul class="space-y-3 text-sm ${tone.text} flex-grow">
          ${plan.features
            .map(
              (feature) =>
                `<li class="flex items-start gap-3"><i class="fa-solid fa-check mt-0.5 ${tone.icon}"></i><span>${feature}</span></li>`,
            )
            .join("")}
        </ul>
        <button type="button" data-add="${plan.id}" class="mt-8 w-full py-3.5 rounded-xl text-white text-sm font-bold transition shadow-lg ${tone.button}">
          <i class="fa-solid fa-cart-plus mr-2"></i>Add to cart
        </button>
      </article>
    </div>`;
  }).join("");
}
