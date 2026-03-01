(() => {
  const KEY = 'gn24_popularity_v1';

  function read(){
    try { return JSON.parse(localStorage.getItem(KEY) || '{}'); }
    catch { return {}; }
  }
  function write(obj){
    localStorage.setItem(KEY, JSON.stringify(obj));
  }

  function bump(id, title, cat){
    if (!id) return;
    const db = read();
    db[id] = db[id] || { id, title:title||'', cat:cat||'', views:0, updated: Date.now() };
    db[id].views += 1;
    db[id].title = title || db[id].title;
    db[id].cat = cat || db[id].cat;
    db[id].updated = Date.now();
    write(db);
  }

  function topN(n=7){
    const db = read();
    return Object.values(db)
      .sort((a,b)=> (b.views - a.views) || (b.updated - a.updated))
      .slice(0,n);
  }

  // 전역 노출
  window.GN24 = window.GN24 || {};
  window.GN24.popularity = { bump, topN };
})();
