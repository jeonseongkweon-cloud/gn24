(() => {
  const KEY = "gn24_popularity_v1";

  function load() {
    try { return JSON.parse(localStorage.getItem(KEY) || "{}"); }
    catch { return {}; }
  }
  function save(obj) {
    localStorage.setItem(KEY, JSON.stringify(obj));
  }

  // called by article page
  window.GN24Popularity = {
    hit(slug, title, url) {
      if (!slug) return;
      const data = load();
      if (!data[slug]) data[slug] = { c: 0, t: title || "", u: url || "" };
      data[slug].c += 1;
      if (title) data[slug].t = title;
      if (url) data[slug].u = url;
      save(data);
    },
    top(n = 7) {
      const data = load();
      return Object.entries(data)
        .map(([slug, v]) => ({ slug, count: v.c || 0, title: v.t || slug, url: v.u || "" }))
        .sort((a, b) => b.count - a.count)
        .slice(0, n);
    }
  };

  // render on pages that have #popular
  const list = document.getElementById("popular");
  if (list) {
    const items = window.GN24Popularity.top(7);
    list.innerHTML = items.length
      ? items.map((x) => {
          const href = x.url || `/gn24/pages/article/?id=${encodeURIComponent(x.slug)}`;
          return `<li><a href="${href}">${escapeHtml(x.title)}</a> <span class="muted">(${x.count})</span></li>`;
        }).join("")
      : `<li class="muted">아직 데이터가 없습니다.</li>`;
  }

  function escapeHtml(s) {
    return String(s || "")
      .replaceAll("&","&amp;")
      .replaceAll("<","&lt;")
      .replaceAll(">","&gt;")
      .replaceAll('"',"&quot;")
      .replaceAll("'","&#039;");
  }
})();
