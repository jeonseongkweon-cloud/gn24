(() => {
  const $ = (s, p=document) => p.querySelector(s);
  const $$ = (s, p=document) => Array.from(p.querySelectorAll(s));

  // Date
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth()+1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const todayStr = `${yyyy}.${mm}.${dd}`;

  const todayEl = $("#today");
  if (todayEl) todayEl.textContent = todayStr;

  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = String(yyyy);

  const pubDate = $("#pubDate");
  if (pubDate) pubDate.textContent = `${yyyy}-${mm}-${dd}`;

  // Mobile nav toggle
  const nav = $("#nav");
  const navToggle = $("#navToggle");
  if (nav && navToggle) {
    navToggle.addEventListener("click", () => {
      nav.classList.toggle("open");
    });
  }

  // Top button
  const toTop = $("#toTop");
  if (toTop) {
    toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  }

  // Keyboard shortcut: "/" focus search (where exists)
  window.addEventListener("keydown", (e) => {
    if (e.key === "/" && !e.ctrlKey && !e.metaKey && !e.altKey) {
      const active = document.activeElement;
      const isTyping = active && (active.tagName === "INPUT" || active.tagName === "TEXTAREA");
      if (!isTyping) {
        e.preventDefault();
        const searchInput = document.querySelector('input[type="search"]');
        if (searchInput) searchInput.focus();
      }
    }
  });

  // External links safety
  $$('a[target="_blank"]').forEach(a => {
    const rel = (a.getAttribute("rel") || "").toLowerCase();
    if (!rel.includes("noopener")) a.setAttribute("rel", (rel + " noopener").trim());
  });
})();
