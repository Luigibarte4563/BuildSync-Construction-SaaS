// Reveal sections as they scroll into view. Elements with data-reveal start hidden in styles.css.
export function initMotion() {
  const elements = document.querySelectorAll("[data-reveal]");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduced || !("IntersectionObserver" in window)) {
    elements.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const el = entry.target;
        setTimeout(() => el.classList.add("is-visible"), Number(el.dataset.delay || 0));
        observer.unobserve(el);
      }
    },
    { threshold: 0.12 },
  );

  elements.forEach((el) => observer.observe(el));
}
