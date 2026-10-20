// monthly subscription plans, prices in PHP excluding 12% VAT
export const PLANS = [
  {
    id: "starter",
    index: "01",
    name: "Starter",
    description: "For small teams running a handful of sites.",
    price: 1999,
    unit: "per workspace / month",
    features: [
      "5 active projects",
      "5 team seats",
      "Daily logs and photo uploads",
      "20 GB photo storage",
      "Email support",
    ],
    comparison: { projects: "5", seats: "5", weights: false, billing: false, api: false, storage: "20 GB", support: "Email" },
  },
  {
    id: "professional",
    index: "02",
    name: "Professional",
    description: "For growing contractors managing multiple active projects.",
    price: 4999,
    unit: "per workspace / month",
    features: [
      "25 active projects",
      "20 team seats",
      "Automated completion weights",
      "Billing and invoicing",
      "100 GB photo storage",
      "Priority support",
    ],
    comparison: { projects: "25", seats: "20", weights: true, billing: true, api: false, storage: "100 GB", support: "Priority" },
    featured: true,
    badge: "Most popular",
  },
  {
    id: "enterprise",
    index: "03",
    name: "Enterprise",
    description: "For large firms that need unlimited scale and a dedicated team.",
    price: 9999,
    unit: "per workspace / month",
    features: [
      "Unlimited projects",
      "Unlimited team seats",
      "API and custom integrations",
      "1 TB photo storage",
      "Dedicated account manager",
      "24/7 support",
    ],
    comparison: { projects: "Unlimited", seats: "Unlimited", weights: true, billing: true, api: true, storage: "1 TB", support: "24/7 dedicated" },
  },
];

export const getPlan = (id) => PLANS.find((plan) => plan.id === id);

const peso = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export const formatPHP = (n) => peso.format(Number(n) || 0);

export const VAT_RATE = 0.12;

export function totals(subtotal) {
  const vat = subtotal * VAT_RATE;
  return { subtotal, vat, total: subtotal + vat };
}
