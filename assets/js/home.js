(async () => {
  const $ = (s, r=document) => r.querySelector(s);

  const el = {
    heroLink: $('#heroLink'),
    heroImg: $('#heroImg'),
    heroCat: $('#heroCat'),
    heroDate: $('#heroDate'),
    heroAuthor: $('#heroAuthor'),
    heroTitle: $('#heroTitle'),
    heroSummary: $('#heroSummary'),
    ticker: $('#ticker'),
    latest: $('#latestBriefs'),
    domestic: $('#catDomestic'),
    world: $('#catWorld'),
    safety: $('#catSafety'),
    ai: $('#catAI'),
    press: $('#pressList'),
    popular: $('#popular'),
    prev: $('#prev'),
    next: $('#next'),
    importantTrack: $('#importantTrack'),
    adImg: $('#adImg'),
  };

  // ✅ Wix 배너 URL 넣는 곳
  const adUrl = "https://static.wixstatic.com/media/PUT_YOUR_BANNER.jpg";

  try {
    if (el.adImg && adUrl && !adUrl.includes("PUT_YOUR_BANNER")) {
      el.adImg.style.backgroundImage = `url('${adUrl}')`;
    }

    const briefs = await GN24.fetchJSON('./data/briefs.json');
    const press = await GN24.fetchJSON('./data/press.json');

    // 최신순 정렬
    briefs.sort((a,b) => (b.date||'').localeCompare(a.date||''));
    press.sort((a,b) => (b.date||'').localeCompare(a.date||''));

    // 중요기사: important: true인 것 우선, 없으면 최신 상위로
    const important = briefs.filter(x => x.important).slice(0,6);
    const fallback = briefs.slice(0,6);
    const importantList = important.length ? important : fallback;

    // 세로 스크롤: 2배로 복제(무한처럼)
    if (el.importantTrack) {
      const mk = (x) => {
        const url = `./pages/article/?id=${encodeURIComponent(x.id)}`;
        return `
          <a class="vline" href="${url}" data-id="${GN24.escape(x.id)}" data-title="${GN24.escape(x.title)}" data-cat="${GN24.escape(x.cat)}">
            <div class="vtitle">${GN24.escape(x.title)}</div>
            <div class="vmeta">${GN24.escape(x.cat)} · ${GN24.escape(GN24.formatDate(x.date))}</div>
          </a>
        `;
      };
      el.importantTrack.innerHTML = importantList.map(mk).join('') + importantList.map(mk).join('');
      el.importantTrack.addEventListener('click', (e) => {
        const a = e.target.closest('a[data-id]');
        if (!a) return;
        GN24.popularity?.bump(a.dataset.id, a.dataset.title, a.dataset.cat);
      });
    }

    // 헤드라인: 상위 5개
    const heroItems = briefs.slice(0,5);
    let idx = 0;

    const renderHero = () => {
      const x = heroItems[idx] || heroItems[0];
      if (!x) return;
      const url = `./pages/article/?id=${encodeURIComponent(x.id)}`;

      el.heroLink.href = url;
      el.heroLink.dataset.id = x.id;
      el.heroLink.dataset.title = x.title;
      el.heroLink.dataset.cat = x.cat;

      if (el.heroImg) el.heroImg.style.backgroundImage = `url('${x.image || ''}')`;
      if (el.heroCat) el.heroCat.textContent = x.cat || '브리핑';
      if (el.heroDate) el.heroDate.textContent = GN24.formatDate(x.date) || '';
      if (el.heroAuthor) el.heroAuthor.textContent = x.author ? `기자 ${x.author}` : '편집부';
      if (el.heroTitle) el.heroTitle.textContent = x.title || '';
      if (el.heroSummary) el.heroSummary.textContent = x.summary || '';

      // 티커(한 줄)
      if (el.ticker) {
        const line = briefs.slice(0,10).map(b => `• ${b.title}`).join('  ');
        el.ticker.textContent = line;
      }
    };

    const go = (d) => {
      idx = (idx + d + heroItems.length) % heroItems.length;
      renderHero();
    };

    if (el.prev) el.prev.addEventListener('click', ()=>go(-1));
    if (el.next) el.next.addEventListener('click', ()=>go(1));
    renderHero();

    // 자동 슬라이드(6초)
    setInterval(() => go(1), 6000);

    // 클릭 시 조회수 반영
    if (el.heroLink) {
      el.heroLink.addEventListener('click', () => {
        const id = el.heroLink.dataset.id;
        const title = el.heroLink.dataset.title;
        const cat = el.heroLink.dataset.cat;
        GN24.popularity?.bump(id, title, cat);
      });
    }

    // 리스트 렌더 헬퍼
    const renderList = (container, items, limit=6) => {
      if (!container) return;
      const pick = items.slice(0,limit);
      container.innerHTML = pick.map(x => {
        const url = `./pages/article/?id=${encodeURIComponent(x.id)}`;
        const img = x.image || '';
        return `
          <a class="item" href="${url}" data-id="${GN24.escape(x.id)}" data-title="${GN24.escape(x.title)}" data-cat="${GN24.escape(x.cat)}">
            <div class="thumb" style="background-image:url('${img}')"></div>
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
      }).join('');

      container.addEventListener('click', (e) => {
        const a = e.target.closest('a[data-id]');
        if (!a) return;
        GN24.popularity?.bump(a.dataset.id, a.dataset.title, a.dataset.cat);
      }, { once:true });
    };

    // 홈 섹션들
    renderList(el.latest, briefs, 8);
    renderList(el.domestic, briefs.filter(x=>x.cat==='국내소식'), 5);
    renderList(el.world, briefs.filter(x=>x.cat==='국제뉴스'), 5);
    renderList(el.safety, briefs.filter(x=>x.cat==='안전·구조'), 5);
    renderList(el.ai, briefs.filter(x=>x.cat==='AI·혁신기술'), 5);

    // 보도자료
    if (el.press) {
      const items = press.slice(0,6);
      el.press.innerHTML = items.map(x => {
        const url = `./pages/article/?id=${encodeURIComponent(x.id)}`;
        return `
          <a class="item" href="${url}" data-id="${GN24.escape(x.id)}" data-title="${GN24.escape(x.title)}" data-cat="보도자료">
            <div class="thumb" style="background-image:url('${x.image || ''}')"></div>
            <div>
              <h4>${GN24.escape(x.title)}</h4>
              <div class="meta">
                <span>보도자료</span>
                <span>${GN24.escape(GN24.formatDate(x.date) || '')}</span>
                <span>${GN24.escape(x.author ? `기자 ${x.author}` : '편집부')}</span>
              </div>
              <div class="sum">${GN24.escape(x.summary || '')}</div>
            </div>
          </a>
        `;
      }).join('');

      el.press.addEventListener('click', (e) => {
        const a = e.target.closest('a[data-id]');
        if (!a) return;
        GN24.popularity?.bump(a.dataset.id, a.dataset.title, '보도자료');
      });
    }

    // 많이 본 뉴스
    if (el.popular && GN24.popularity) {
      const top = GN24.popularity.topN(7);
      el.popular.innerHTML = top.length ? top.map((x, i) => `
        <li>
          <a href="./pages/article/?id=${encodeURIComponent(x.id)}">${i+1}. ${GN24.escape(x.title || x.id)}</a>
          <span class="rmeta">${GN24.escape(x.cat || '')} · 조회 ${x.views}</span>
        </li>
      `).join('') : `<li class="muted">아직 집계된 데이터가 없습니다.</li>`;
    }

  } catch (err) {
    console.error(err);
    if (el.latest) el.latest.innerHTML = `<div class="muted">데이터를 불러오지 못했습니다. (data/briefs.json 확인)</div>`;
  }
})();
