const $ = (s) => document.querySelector(s);
const esc = (s="") => String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

function itemRow(b, idx, withNum=false){
  const thumb = b.thumb ? `<div class="thumb" style="background-image:url('${esc(b.thumb)}')"></div>` : `<div class="thumb placeholder"></div>`;
  const src = b.source_url ? `<a class="src" href="${esc(b.source_url)}" target="_blank" rel="noopener">출처: ${esc(b.source_name||"원문")}</a>` : `<span class="src">출처: ${esc(b.source_name||"")}</span>`;
  const num = withNum ? `<span class="n">${idx+1}</span>` : ``;

  return `
    <div class="row">
      ${num}
      ${thumb}
      <div class="row-body">
        <div class="row-meta">
          <span class="badge">${esc(b.category||"브리핑")}</span>
          <span class="muted">${esc(b.publish_date||"")}</span>
        </div>
        <div class="row-title">${esc(b.title||"")}</div>
        <div class="row-sum muted">${esc(b.summary||"")}</div>
        <div class="row-links">${src}</div>
      </div>
    </div>
  `;
}

function pressRow(p){
  return `
    <div class="row">
      <div class="thumb placeholder"></div>
      <div class="row-body">
        <div class="row-meta">
          <span class="badge">보도자료</span>
          <span class="muted">${esc(p.publish_date||"")}</span>
        </div>
        <a class="row-title link" href="${esc(p.url||'/gn24/pages/press/')}">${esc(p.title||"")}</a>
        ${p.subtitle ? `<div class="row-sum muted">${esc(p.subtitle)}</div>` : ``}
        <div class="row-sum muted">${esc(p.summary||"")}</div>
      </div>
    </div>
  `;
}

let featured = [];
let heroIdx = 0;

function renderHero(){
  const it = featured[heroIdx];
  if(!it) return;

  $("#heroLink").href = it.url || "#";
  $("#heroCat").textContent = it.category || "공지";
  $("#heroDate").textContent = it.publish_date || "";
  $("#heroTitle").textContent = it.title || "";
  $("#heroSummary").textContent = it.summary || "";

  const heroImg = $("#heroImg");
  const img = it.image && it.image.trim() ? `url('${it.image}')` : "";
  heroImg.style.backgroundImage = img || "";
  heroImg.classList.toggle("placeholder", !img);

  // ticker
  const tick = featured.map((x,i)=> `${i===heroIdx ? "●" : "○"} ${esc(x.title)}`).join("  ·  ");
  $("#ticker").innerHTML = tick;
}

async function init(){
  // Featured
  try{
    const fr = await fetch("/gn24/data/featured.json", { cache:"no-store" });
    const fd = await fr.json();
    featured = fd.featured || [];
    if(featured.length){
      renderHero();
      $("#prev").addEventListener("click", () => { heroIdx = (heroIdx - 1 + featured.length) % featured.length; renderHero(); });
      $("#next").addEventListener("click", () => { heroIdx = (heroIdx + 1) % featured.length; renderHero(); });
      // auto rotate
      setInterval(() => { heroIdx = (heroIdx + 1) % featured.length; renderHero(); }, 7000);
    }
  }catch(e){ /* ignore */ }

  // Briefs
  let briefs = [];
  try{
    const br = await fetch("/gn24/data/briefs.json", { cache:"no-store" });
    const bd = await br.json();
    briefs = (bd.briefs || []).slice()
      .sort((a,b)=> (b.publish_date||"").localeCompare(a.publish_date||""));
  }catch(e){ briefs = []; }

  // Latest briefs
  const latest = briefs.slice(0,5);
  $("#latestBriefs").innerHTML = latest.map((b,i)=> itemRow(b,i)).join("") || `<div class="muted">표시할 브리핑이 없습니다.</div>`;

  // Category blocks
  const pick = (cat) => briefs.filter(x => (x.category||"") === cat).slice(0,4);
  $("#catDomestic").innerHTML = pick("국내소식").map((b,i)=> itemRow(b,i)).join("") || `<div class="muted">데이터 준비중</div>`;
  $("#catWorld").innerHTML = pick("국제뉴스").map((b,i)=> itemRow(b,i)).join("") || `<div class="muted">데이터 준비중</div>`;
  $("#catSafety").innerHTML = pick("안전·구조").map((b,i)=> itemRow(b,i)).join("") || `<div class="muted">데이터 준비중</div>`;
  $("#catAI").innerHTML = pick("AI·혁신기술").map((b,i)=> itemRow(b,i)).join("") || `<div class="muted">데이터 준비중</div>`;

  // Popular (초기: 최신 7개를 “많이 본 뉴스”처럼 임시 표시)
  const pop = briefs.slice(0,7);
  $("#popular").innerHTML = pop.map((b,i)=> `
    <li>
      <span class="rank-n">${i+1}</span>
      <div class="rank-body">
        <div class="rank-title">${esc(b.title||"")}</div>
        <div class="muted small">${esc(b.category||"")} · ${esc(b.publish_date||"")}</div>
      </div>
    </li>
  `).join("") || `<li class="muted">데이터 준비중</li>`;

  // Press
  try{
    const pr = await fetch("/gn24/data/press.json", { cache:"no-store" });
    const pd = await pr.json();
    const press = (pd.press || []).slice()
      .sort((a,b)=> (b.publish_date||"").localeCompare(a.publish_date||""))
      .slice(0,3);
    $("#pressList").innerHTML = press.map(pressRow).join("") || `<div class="muted">보도자료 준비중</div>`;
  }catch(e){
    $("#pressList").innerHTML = `<div class="muted">보도자료 준비중</div>`;
  }

  // Sidebar ad image (Wix URL 넣으면 됨)
  const ad = $("#adImg");
  const adUrl = ""; // 예: "https://static.wixstatic.com/media/....png"
  if(adUrl){
    ad.style.backgroundImage = `url('${adUrl}')`;
    ad.classList.remove("placeholder");
  }else{
    ad.classList.add("placeholder");
  }
}

init();
