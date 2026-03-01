(() => {
  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => [...root.querySelectorAll(sel)];

  // 날짜/연도
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth()+1).padStart(2,'0');
  const dd = String(now.getDate()).padStart(2,'0');

  const todayEl = $('#today');
  if (todayEl) todayEl.textContent = `${yyyy}.${mm}.${dd}`;

  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = String(yyyy);

  const pubEl = $('#pubDate');
  if (pubEl) pubEl.textContent = `${yyyy}-${mm}-${dd}`;

  // Top 버튼
  const toTop = $('#toTop');
  if (toTop) {
    const onScroll = () => {
      toTop.style.display = window.scrollY > 240 ? 'block' : 'none';
    };
    window.addEventListener('scroll', onScroll, {passive:true});
    onScroll();
    toTop.addEventListener('click', () => window.scrollTo({top:0, behavior:'smooth'}));
  }

  // 쿼리 유틸
  window.GN24 = window.GN24 || {};
  window.GN24.qs = (key, url = window.location.href) => {
    try { return new URL(url).searchParams.get(key); }
    catch { return null; }
  };

  window.GN24.escape = (s='') =>
    String(s).replace(/[&<>"']/g, (m) => ({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    }[m]));

  window.GN24.fetchJSON = async (path) => {
    const res = await fetch(path, {cache:'no-store'});
    if (!res.ok) throw new Error(`Failed to load ${path}`);
    return await res.json();
  };

  window.GN24.formatDate = (iso='') => {
    if (!iso) return '';
    // "2026-03-02" 또는 "2026.03.02" 둘 다 처리
    const x = iso.replaceAll('.','-');
    return x;
  };

  // 링크 빌더 (상세 템플릿)
  window.GN24.articleUrl = (id) => `./../article/?id=${encodeURIComponent(id)}`;
})();
