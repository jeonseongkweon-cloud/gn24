(() => {
  const NEWS_INDEX_URL = "/gn24/data/news-index.json";
  const LEGACY_NEWS_URL = "/gn24/data/news.json";
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
  const AD_URL = "";

  if (adImg && AD_URL) adImg.style.backgroundImage = `url('${AD_URL}')`;

  let news = [];
  let heroIdx = 0;

  init().catch(console.error);

  async function init(){
    const [newsIndex, legacyNews, press] = await Promise.all([
      fetchJSONSafe(NEWS_INDEX_URL),
      fetchJSONSafe(LEGACY_NEWS_URL),
      fetchJSONSafe(PRESS_URL)
    ]);

    news = mergeNewsSources(newsIndex, legacyNews);
    const pressItems = Array.isArray(press) ? press : [];

    news.sort((a,b)=> String(b.date || "").localeCompare(String(a.date || "")));
    pressItems.sort((a,b)=> String(b.date || "").localeCompare(String(a.date || "")));

    const heroCandidates = [
      ...news.filter(x => x.pinned),
      ...news.filter(x => !x.pinned)
    ];

    setHero(heroCandidates[0] || news[0]);

    if (prevBtn) prevBtn.onclick = () => {
      if (!heroCandidates.length) return;
      heroIdx = (heroIdx - 1 + heroCandidates.length) % heroCandidates.length;
      setHero(heroCandidates[heroIdx]);
    };

    if (nextBtn) nextBtn.onclick = () => {
      if (!heroCandidates.length) return;
      heroIdx = (heroIdx + 1) % heroCandidates.length;
      setHero(heroCandidates[heroIdx]);
    };

    const important = news.filter(x => x.important).slice(0, 10);
    renderVTicker(important);

    renderList(latestBriefs, news.slice(0, 8));

    renderList(catDomestic, news.filter(x => categoryOf(x) === "국내소식").slice(0, 5));
    renderList(catWorld, news.filter(x => categoryOf(x) === "국제뉴스").slice(0, 5));
    renderList(catSafety, news.filter(x => ["안전·구조", "안전"].includes(categoryOf(x))).slice(0, 5));
    renderList(catMartial, news.filter(x => categoryOf(x) === "무도·스포츠").slice(0, 5));

    renderList(pressList, pressItems.slice(0, 5), { press:true });

    if (homeSearchBtn) {
      homeSearchBtn.onclick = () => {
        const q = (homeQ?.value || "").trim();
        const a = (homeAuthor?.value || "").trim();
        const filtered = filterNews(news, { q, author: a });
        renderList(latestBriefs, filtered.slice(0, 12));
      };
    }

    if (homeResetBtn) {
      homeResetBtn.onclick = () => {
        if (homeQ) homeQ.value = "";
        if (homeAuthor) homeAuthor.value = "";
        renderList(latestBriefs, news.slice(0, 8));
      };
    }
  }

  function mergeNewsSources(indexItems, legacyItems){
    const merged = new Map();
    (Array.isArray(indexItems) ? indexItems : []).forEach(item => {
      if (item && item.id) merged.set(item.id, normalizeNewsItem(item));
    });
    (Array.isArray(legacyItems) ? legacyItems : []).forEach(item => {
      if (item && item.id && !merged.has(item.id)) {
        merged.set(item.id, normalizeNewsItem(item));
      }
    });
    return Array.from(merged.values());
  }

  function normalizeNewsItem(item){
    return {
      ...item,
      category: item?.category || item?.cat || "뉴스",
      cat: item?.category || item?.cat || "뉴스"
    };
  }

  function categoryOf(item){
    return item?.category || item?.cat || "뉴스";
  }

  function filterNews(items, {q="", author=""}){
    const qn = q.toLowerCase();
    const an = author.toLowerCase();

    return items.filter(x => {
      const hay = [
        x.title || "",
        x.subtitle || "",
        x.summary || "",
        (x.tags || []).join(" "),
        x.sourceName || "",
        categoryOf(x)
      ].join(" ").toLowerCase();

      const okQ = !qn || hay.includes(qn);
      const okA = !an || String(x.author || "").toLowerCase().includes(an);
      return okQ && okA;
    });
  }

  function setHero(item){
    if (!item) return;
    const url = `/gn24/pages/article/?id=${encodeURIComponent(item.id)}`;
    if (heroLink) heroLink.href = url;
    if (heroImg) heroImg.style.backgroundImage = `url('${item.image || ""}')`;
    if (heroCat) heroCat.textContent = categoryOf(item);
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

    const html = items.map(x => {
      const href = `/gn24/pages/article/?id=${encodeURIComponent(x.id)}`;
      return `<a class="vt-item" href="${href}">
        <span class="vt-pill">${escapeHtml(categoryOf(x))}</span>
        <span>${escapeHtml(x.title || "")}</span>
        <span class="muted">(${escapeHtml(x.date || "")})</span>
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

    container.innerHTML = items.map(x => {
      const href = opt.press
        ? `/gn24/pages/press/?id=${encodeURIComponent(x.id)}`
        : `/gn24/pages/article/?id=${encodeURIComponent(x.id)}`;

      const thumb = x.image ? `style="background-image:url('${x.image}')"` : "";
      const meta = [
        categoryOf(x) ? `<span class="badge">${escapeHtml(categoryOf(x))}</span>` : "",
        x.date ? `<span>${escapeHtml(x.date)}</span>` : "",
        x.author ? `<span class="dot">•</span><span>기자 ${escapeHtml(x.author)}</span>` : ""
      ].filter(Boolean).join(" ");

      return `<a class="item" href="${href}">
        <div class="thumb" ${thumb}></div>
        <div>
          <div class="it-meta">${meta}</div>
          <div class="it-title">${escapeHtml(x.title || "")}</div>
          <div class="it-sum">${escapeHtml(x.summary || "")}</div>
        </div>
      </a>`;
    }).join("");
  }

  async function fetchJSONSafe(url){
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  function escapeHtml(s){
    return String(s || "")
      .replaceAll("&","&amp;")
      .replaceAll("<","&lt;")
      .replaceAll(">","&gt;")
      .replaceAll('"',"&quot;")
      .replaceAll("'","&#039;");
  }
})();
