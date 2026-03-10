(function () {
  "use strict";

  const menuBtn = document.getElementById("menuBtn");
  const menuPanel = document.getElementById("menuPanel");
  const todayEl = document.getElementById("today");

  if (todayEl) {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    todayEl.textContent = `${yyyy}.${mm}.${dd}`;
  }

  if (menuBtn && menuPanel) {
    menuBtn.addEventListener("click", function () {
      const isHidden = menuPanel.hasAttribute("hidden");

      if (isHidden) {
        menuPanel.removeAttribute("hidden");
        menuBtn.setAttribute("aria-expanded", "true");
      } else {
        menuPanel.setAttribute("hidden", "");
        menuBtn.setAttribute("aria-expanded", "false");
      }
    });

    document.addEventListener("click", function (e) {
      const clickedInsideMenu = menuPanel.contains(e.target);
      const clickedButton = menuBtn.contains(e.target);

      if (!clickedInsideMenu && !clickedButton && !menuPanel.hasAttribute("hidden")) {
        menuPanel.setAttribute("hidden", "");
        menuBtn.setAttribute("aria-expanded", "false");
      }
    });
  }

  const navLinks = document.querySelectorAll(".nav-link");
  const currentUrl = new URL(window.location.href);
  const currentPath = currentUrl.pathname;
  const currentCat = currentUrl.searchParams.get("cat");

  navLinks.forEach((link) => {
    try {
      const linkUrl = new URL(link.href, window.location.origin);
      const linkPath = linkUrl.pathname;
      const linkCat = linkUrl.searchParams.get("cat");

      if (currentPath === linkPath) {
        if (!currentCat && !linkCat) {
          link.classList.add("is-active");
        }
        if (currentCat && linkCat && currentCat === linkCat) {
          link.classList.add("is-active");
        }
      }
    } catch (err) {
      console.warn("nav parse error:", err);
    }
  });

  window.GN24 = window.GN24 || {};

  window.GN24.fetchJSON = async function (path) {
    const res = await fetch(path, { cache: "no-store" });
    if (!res.ok) {
      throw new Error(`데이터를 불러오지 못했습니다: ${path}`);
    }
    return res.json();
  };

  window.GN24.escapeHtml = function (str) {
    return String(str ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  };

  window.GN24.formatDate = function (value) {
    if (!value) return "";
    return String(value).replaceAll("-", ".");
  };
})();
