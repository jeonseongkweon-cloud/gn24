// /gn24/assets/js/popularity.js
(() => {
  const KEY = "gn24_pop_v1";

  function loadStore() {
    try { return JSON.parse(localStorage.getItem(KEY) || "{}"); }
    catch { return {}; }
  }
  function saveStore(store) {
    try { localStorage.setItem(KEY, JSON.stringify(store)); } catch {}
  }

  function bump(id, meta = {}) {
    if (!id) return;
    const store = loadStore();
    const now = Date.now();
    const cur = store[id] || { c: 0, t: now, meta: {} };
    cur.c = (cur.c || 0) + 1;
    cur.t = now;
    cur.meta = { ...(cur.meta || {}), ...(meta || {}) };
    store[id] = cur;
    saveStore(store);
  }

  function getCounts() {
    return loadStore();
  }

  // items: [{id,title,category,publish_date,thumb,source_url,source_name}]
  function topItems(items, limit = 7) {
    const counts = getCounts();
    const scored = (items || []).map(it => {
      const v = counts[it.id]?.c || 0;
      const last = counts[it.id]?.t || 0;
      return { ...it, _views: v, _last: last };
    });

    // 조회수 내림차순 → 최근 클릭 내림차순 → 발행일 내림차순
    scored.sort((a, b) =>
      (b._views - a._views) ||
      (b._last - a._last) ||
      String(b.publish_date || "").localeCompare(String(a.publish_date || ""))
    );

    return scored.slice(0, limit);
  }

  function resetAll() {
    try { localStorage.removeItem(KEY); } catch {}
  }

  window.GN24Popularity = { bump, topItems, getCounts, resetAll };
})();
