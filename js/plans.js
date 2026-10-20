import "./layout.js";
import { renderPlans } from "./plans-grid.js";
import { PLANS } from "./data.js";
import { initMotion } from "./motion.js";

const ROWS = [
  { label: "Active projects", key: "projects" },
  { label: "Team seats", key: "seats" },
  { label: "Daily logs &amp; photo uploads", value: () => true },
  { label: "Automated completion weights", key: "weights" },
  { label: "Billing &amp; invoicing", key: "billing" },
  { label: "API &amp; custom integrations", key: "api" },
  { label: "Photo storage", key: "storage" },
  { label: "Support", key: "support" },
];

const cell = (value) => {
  if (value === true) return `<i class="fa-solid fa-check text-buildbronze"></i>`;
  if (value === false) return `<i class="fa-solid fa-minus text-gray-300"></i>`;
  return value;
};

function renderCompare(el) {
  el.innerHTML = `<table class="w-full min-w-[680px] text-left text-sm">
    <thead>
      <tr class="border-b border-buildborder">
        <th class="py-4 pr-4 text-xs uppercase tracking-wider text-gray-500 font-bold">Feature</th>
        ${PLANS.map(
          (plan) =>
            `<th class="py-4 px-4 text-center ${plan.featured ? "text-buildbronze" : "text-builddark"} font-extrabold">${plan.name}</th>`,
        ).join("")}
      </tr>
    </thead>
    <tbody class="divide-y divide-buildborder">
      ${ROWS.map(
        (row) => `<tr>
          <th class="py-3.5 pr-4 font-semibold text-gray-700">${row.label}</th>
          ${PLANS.map(
            (plan) =>
              `<td class="py-3.5 px-4 text-center text-gray-600 ${plan.featured ? "bg-amber-50/50 font-semibold" : ""}">${cell(
                row.value ? row.value() : plan.comparison[row.key],
              )}</td>`,
          ).join("")}
        </tr>`,
      ).join("")}
    </tbody>
  </table>`;
}

const grid = document.getElementById("plans-grid");
if (grid) renderPlans(grid);

const compare = document.getElementById("compare");
if (compare) renderCompare(compare);

initMotion();
