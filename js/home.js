import "./layout.js";
import { renderPlans } from "./plans-grid.js";
import { initMotion } from "./motion.js";

const grid = document.getElementById("plans-grid");
if (grid) renderPlans(grid);

initMotion();
