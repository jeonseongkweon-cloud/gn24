(async () => {
  const $ = (s, r=document) => r.querySelector(s);

  const el = {
    cat: $('#cat'),
    q: $('#q'),
    author: $('#author'),
    clear: $('#clear'),
    list: $('#list'),
    count: $('#count'),
  };

  const url = new URL(location.href);
  const initialCat = url.searchParams.get('cat') || '';
  const initialQ = url.searchParams.get('q') || '';
  const initialAuthor = url.searchParams.get('author') || '';
  const mode = url.searchParams.get('mode') || '';

  if (el.cat) el.cat.value = initialCat;
  if (el.q) el.q.value = initialQ;
  if (el.author) el.author.value = initialAuthor;

  // mode=author 로 들어오면 작성자 입력에 포커스
  if (mode === 'author' && el.author) setTimeout(()=>el.author.focus(), 100);

  let briefs = [];
  let press = [];

  const norm = (s='') => String(s).trim().toLowerCase();

  const render = (items) => {
    if (!el.list) return;

    el.list.innerHTML = items.map(x => {
      const url = `../article/?id=${encodeURIComponent(x.id)}`;
      return `
        <a class="item" href="${url}" data-id="${GN24.escape(x.id)}" data-title="${GN24.escape(x.title)}" data-cat="${GN24.escape(x.cat)}">
          <div class="thumb" style="background-image:url('${x.image || ''}')"></div>
          <div>
            <h4>${GN24.escape(x.title)}</h4>
            <div class="meta">
              <span>${GN24.escape(x.cat || '')}</span>
              <span>${GN24.escape(GN24.formatDate(x.date) || '')}</span>
              <span>${GN24.escape(x.author ? `기자 ${x.author}` : '편집부')}</span>
            </div>
            <div class="sum">${GN24.escape(x.summary || '')}</div>
          </div>
        </a>
      `;
    }).join('') || `<div class="muted">조건에 맞는 기사가 없습니다.</div>`;

    el.list.addEventListener('click', (e) => {
      const a = e.target.closest('a[data-id]');
      if (!a) return;
      GN24.popularity?.bump(a.dataset.id, a.dataset.title, a.dataset.cat);
    }, { once:true });

    if (el.count) el.count.textContent = `총 ${items.length}건`;
  };

  const apply = () => {
    const cat = el.cat?.value || '';
    const q = norm(el.q?.value || '');
    const author = norm(el.author?.value || '');

    let items = [...briefs, ...press];

    if (cat) items = items.filter(x => (x.cat || '') === cat);
    if (q) {
      items = items.filter(x => {
        const t = norm(x.title);
        const s = norm(x.summary);
        const k = norm((x.keywords || []).join(' '));
        return t.includes(q) || s.includes(q) || k.includes(q);
      });
    }
    if (author) {
      items = items.filter(x => norm(x.author || '').includes(author));
    }

    // 최신순
    items.sort((a,b)=> (b.date||'').localeCompare(a.date||''));
    render(items);

    // URL 반영
    const u = new URL(location.href);
    if (cat) u.searchParams.set('cat', cat); else u.searchParams.delete('cat');
    if (q) u.searchParams.set('q', q); else u.searchParams.delete('q');
    if (author) u.searchParams.set('author', author); else u.searchParams.delete('author');
    u.searchParams.delete('mode');
    history.replaceState({}, '', u.toString());
  };

  try {
    briefs = await GN24.fetchJSON('../../data/briefs.json');
    press  = await GN24.fetchJSON('../../data/press.json');

    // press는 cat을 "보도자료"로 맞춰서 합치기
    press = press.map(p => ({ ...p, cat: '보도자료' }));

    // 이벤트
    const bind = (node) => node && node.addEventListener('input', apply);
    bind(el.q);
    bind(el.author);
    el.cat && el.cat.addEventListener('change', apply);

    el.clear && el.clear.addEventListener('click', () => {
      if (el.q) el.q.value = '';
      if (el.author) el.author.value = '';
      if (el.cat) el.cat.value = '';
      apply();
    });

    apply();
  } catch (e) {
    console.error(e);
    if (el.list) el.list.innerHTML = `<div class="muted">데이터 로딩 실패: data/briefs.json / data/press.json 확인</div>`;
  }
})();
