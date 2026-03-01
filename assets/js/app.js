document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("menuBtn");
  const panel = document.getElementById("menuPanel");

  if (!btn || !panel) return;

  const close = () => {
    panel.hidden = true;
    btn.setAttribute("aria-expanded", "false");
  };

  const open = () => {
    panel.hidden = false;
    btn.setAttribute("aria-expanded", "true");
  };

  btn.addEventListener("click", (e) => {
    e.preventDefault();
    if (panel.hidden) open();
    else close();
  });

  // 바깥 클릭 닫기
  document.addEventListener("click", (e) => {
    if (panel.hidden) return;
    const t = e.target;
    if (t === btn || btn.contains(t) || panel.contains(t)) return;
    close();
  });

  // ESC 닫기
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });

  // 화면이 커지면 보조패널은 정리 차원에서 닫기
  window.addEventListener("resize", () => {
    if (window.innerWidth > 860) close();
  });
});
