(() => {
  const NEWS_URL = "/gn24/data/news.json";
  const PRESS_URL = "/gn24/data/press.json";

  const $ = (s, p=document) => p.querySelector(s);

  const heroLink = $("#heroLink");
  const heroImg  = $("#heroImg");
  const heroCat  = $("#heroCat");
  const heroDate = $("#heroDate");
  const heroAuthor = $("#heroAuthor");
  const heroTitle= $("#heroTitle");
  const heroSummary=$("#heroSummary");

  const latestBriefs = $("#latestBriefs");

  const catDomestic = $("#catDomestic");
  const catWorld = $("#catWorld");
  const catSafety = $("#catSafety");
  const catMartial = $("#catMartial");

  const pressList = $("#pressList");
  const vtickerTrack = $("#vtickerTrack");

  const prevBtn = $("#prev");
  const nextBtn = $("#next");

  const homeQ = $("#homeQ");
  const homeAuthor = $("#homeAuthor");
  const homeSearchBtn = $("#homeSearchBtn");
  const homeResetBtn = $("#homeResetBtn");

  const adImg = $("#adImg");
  const AD_URL = ""; // ✅ Wix 배너 이미지 URL 넣기 (없으면 빈값 유지)

  if (adImg && AD_URL) adImg.style.backgroundImage = `url('${AD_URL}')`;

  let news = [];
  let heroIdx = 0;

  init().catch(console.error);

  async function init(){
    news = await fetchJSON(NEWS_URL);
    const press = await fetchJSON(PRESS_URL);

    // sort by date desc
    news.sort((a,b)=> (b.date||"").localeCompare(a.date||""));
    press.sort((a,b)=> (b.date||"").localeCompare(a.date||""));

    // hero candidates: pinned first else latest
    const heroCandidates = [
      ...news.filter(x=>x.pinned),
      ...news
    ];

    // set hero
    setHero(heroCandidates[0] || news[0]);

    // carousel control
    if (prevBtn) prevBtn.onclick = () => {
      heroIdx = (heroIdx - 1 + heroCandidates.length) % heroCandidates.length;
      setHero(heroCandidates[heroIdx]);
    };
    if (nextBtn) nextBtn.onclick = () => {
      heroIdx = (heroIdx + 1) % heroCandidates.length;
      setHero(heroCandidates[heroIdx]);
    };

    // vertical ticker: top important
    const important = news.filter(x=>x.important).slice(0, 10);
    renderVTicker(important);

    // latest briefs
    renderList(latestBriefs, news.slice(0, 8));

    // categories
    renderList(catDomestic, news.filter(x=>x.cat==="국내소식").slice(0, 5));
    renderList(catWorld, news.filter(x=>x.cat==="국제뉴스").slice(0, 5));
    renderList(catSafety, news.filter(x=>x.cat==="안전·구조").slice(0, 5));
    renderList(catMartial, news.filter(x=>x.cat==="무도·스포츠").slice(0, 5));

    // press
    renderList(pressList, press.slice(0, 5), {press:true});

    // home search
    if (homeSearchBtn) homeSearchBtn.onclick = () => {
      const q = (homeQ?.value || "").trim();
      const a = (homeAuthor?.value || "").trim();
      const filtered = filterNews(news, { q, author: a });
      renderList(latestBriefs, filtered.slice(0, 12));
    };
    if (homeResetBtn) homeResetBtn.onclick = () => {
      if (homeQ) homeQ.value = "";
      if (homeAuthor) homeAuthor.value = "";
      renderList(latestBriefs, news.slice(0, 8));
    };
  }

  function filterNews(items, {q="", author=""}){
    const qn = q.toLowerCase();
    const an = author.toLowerCase();
    return items.filter(x=>{
      const hay = `${x.title||""} ${x.summary||""} ${(x.tags||[]).join(" ")} ${x.cat||""}`.toLowerCase();
      const okQ = !qn || hay.includes(qn);
      const okA = !an || String(x.author||"").toLowerCase().includes(an);
      return okQ && okA;
    });
  }

  function setHero(item){
    if (!item) return;
    const url = `/gn24/pages/article/?id=${encodeURIComponent(item.id)}`;
    if (heroLink) heroLink.href = url;
    if (heroImg) heroImg.style.backgroundImage = `url('${item.image || ""}')`;
    if (heroCat) heroCat.textContent = item.cat || "공지";
    if (heroDate) heroDate.textContent = item.date || "";
    if (heroAuthor) heroAuthor.textContent = item.author ? `기자: ${item.author}` : "";
    if (heroTitle) heroTitle.textContent = item.title || "";
    if (heroSummary) heroSummary.textContent = item.summary || "";
  }

  function renderVTicker(items){
    if (!vtickerTrack) return;
    if (!items.length){
      vtickerTrack.innerHTML = `<div class="vt-item muted">중요기사가 아직 없습니다.</div>`;
      return;
    }
    // duplicate for seamless animation
    const html = items.map(x=>{
      const href = `/gn24/pages/article/?id=${encodeURIComponent(x.id)}`;
      return `<a class="vt-item" href="${href}">
        <span class="vt-pill">${escapeHtml(x.cat||"")}</span>
        <span>${escapeHtml(x.title||"")}</span>
        <span class="muted">(${escapeHtml(x.date||"")})</span>
      </a>`;
    }).join("");
    vtickerTrack.innerHTML = html + html;
  }

  function renderList(container, items, opt={}){
    if (!container) return;
    if (!items || !items.length){
      container.innerHTML = `<div class="muted">표시할 항목이 없습니다.</div>`;
      return;
    }
    container.innerHTML = items.map(x=>{
      const href = opt.press
        ? `/gn24/pages/press/?id=${encodeURIComponent(x.id)}`
        : `/gn24/pages/article/?id=${encodeURIComponent(x.id)}`;
      const thumb = x.image ? `style="background-image:url('${x.image}')"` : "";
      const meta = [
        x.cat ? `<span class="badge">${escapeHtml(x.cat)}</span>` : "",
        x.date ? `<span>${escapeHtml(x.date)}</span>` : "",
        x.author ? `<span class="dot">•</span><span>기자 ${escapeHtml(x.author)}</span>` : ""
      ].filter(Boolean).join(" ");
      return `<a class="item" href="${href}">
        <div class="thumb" ${thumb}></div>
        <div>
          <div class="it-meta">${meta}</div>
          <div class="it-title">${escapeHtml(x.title||"")}</div>
          <div class="it-sum">${escapeHtml(x.summary||"")}</div>
        </div>
      </a>`;
    }).join("");
  }

  async function fetchJSON(url){
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`Fetch failed: ${url}`);
    return res.json();
  }

  function escapeHtml(s){
    return String(s||"")
      .replaceAll("&","&amp;")
      .replaceAll("<","&lt;")
      .replaceAll(">","&gt;")
      .replaceAll('"',"&quot;")
      .replaceAll("'","&#039;");
  }
})();
