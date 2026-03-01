(() => {
  // 햄버거(보조) 패널 토글
  const btn = document.getElementById("menuBtn");
  const panel = document.getElementById("menuPanel");

  if (btn && panel) {
    const close = () => {
      panel.hidden = true;
      btn.setAttribute("aria-expanded", "false");
    };
    const open = () => {
      panel.hidden = false;
      btn.setAttribute("aria-expanded", "true");
    };
    const toggle = () => (panel.hidden ? open() : close());

    btn.addEventListener("click", (e) => {
      e.preventDefault();
      toggle();
    });

    // 바깥 클릭 시 닫기
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

    // 화면 커지면 보조패널은 닫아두기(정리)
    window.addEventListener("resize", () => {
      if (window.innerWidth > 860) close();
    });
  }
})();
