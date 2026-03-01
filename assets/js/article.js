(async () => {
  const $ = (s, r=document) => r.querySelector(s);

  const id = GN24.qs('id');
  const el = {
    cat: $('#cat'),
    date: $('#date'),
    author: $('#author'),
    views: $('#views'),
    title: $('#title'),
    summary: $('#summary'),
    cover: $('#cover'),
    body: $('#body'),
    sourceBox: $('#sourceBox'),
    related: $('#related'),
  };

  if (!id) {
    if (el.title) el.title.textContent = '기사 ID가 없습니다.';
    return;
  }

  try {
    const briefs = await GN24.fetchJSON('../../data/briefs.json');
    const press  = await GN24.fetchJSON('../../data/press.json');
    const pressFixed = press.map(p => ({ ...p, cat: '보도자료' }));
    const all = [...briefs, ...pressFixed];

    const x = all.find(it => it.id === id);
    if (!x) {
      if (el.title) el.title.textContent = '해당 기사를 찾을 수 없습니다.';
      return;
    }

    // 조회수 누적
    GN24.popularity?.bump(x.id, x.title, x.cat);

    // 표기
    document.title = `${x.title} | Global News24`;
    if (el.cat) el.cat.textContent = x.cat || '기사';
    if (el.date) el.date.textContent = GN24.formatDate(x.date) || '';
    if (el.author) el.author.textContent = x.author ? `기자 ${x.author}` : '편집부';

    // 뷰 표시(로컬 집계값)
    if (el.views && GN24.popularity) {
      const top = GN24.popularity.topN(999);
      const me = top.find(t => t.id === x.id);
      el.views.textContent = me ? `조회 ${me.views}` : '조회 1';
    }

    if (el.title) el.title.textContent = x.title || '';
    if (el.summary) el.summary.textContent = x.summary || '';
    if (el.cover) el.cover.style.backgroundImage = `url('${x.image || ''}')`;

    // 본문: 브리핑형(문단 배열 or text)
    const paragraphs = Array.isArray(x.body) ? x.body : (x.body ? [x.body] : []);
    if (el.body) {
      const safe = paragraphs.length
        ? paragraphs.map(p => `<p>${GN24.escape(p)}</p>`).join('')
        : `<p class="muted">요약 중심 기사입니다. 아래 출처 링크를 참고하세요.</p>`;
      el.body.innerHTML = safe;
    }

    // 출처
    if (el.sourceBox) {
      const srcLabel = x.sourceLabel || '출처';
      const srcUrl = x.sourceUrl || '';
      const srcText = srcUrl ? `<a href="${srcUrl}" target="_blank" rel="noopener">원문/출처 바로가기</a>` : `<span class="muted">출처 링크 준비중</span>`;
      el.sourceBox.innerHTML = `
        <div><strong>${GN24.escape(srcLabel)}</strong></div>
        <div style="margin-top:8px">${srcText}</div>
      `;
    }

    // 관련 기사(같은 카테고리 최신 6)
    if (el.related) {
      const rel = all
        .filter(it => it.id !== x.id && it.cat === x.cat)
        .sort((a,b)=> (b.date||'').localeCompare(a.date||''))
        .slice(0,6);

      el.related.innerHTML = rel.map(it => `
        <a class="item" href="./?id=${encodeURIComponent(it.id)}" data-id="${GN24.escape(it.id)}" data-title="${GN24.escape(it.title)}" data-cat="${GN24.escape(it.cat)}">
          <div class="thumb" style="background-image:url('${it.image || ''}')"></div>
          <div>
            <h4>${GN24.escape(it.title)}</h4>
            <div class="meta">
              <span>${GN24.escape(it.cat || '')}</span>
              <span>${GN24.escape(GN24.formatDate(it.date) || '')}</span>
              <span>${GN24.escape(it.author ? `기자 ${it.author}` : '편집부')}</span>
            </div>
          </div>
        </a>
      `).join('') || `<div class="muted">관련 기사가 없습니다.</div>`;

      el.related.addEventListener('click', (e) => {
        const a = e.target.closest('a[data-id]');
        if (!a) return;
        GN24.popularity?.bump(a.dataset.id, a.dataset.title, a.dataset.cat);
      }, { once:true });
    }

  } catch (e) {
    console.error(e);
    if (el.title) el.title.textContent = '데이터 로딩 실패';
  }
})();
