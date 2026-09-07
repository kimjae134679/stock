// v0.9.1 live: user-facing tracking terminology -> application, plus Android WebView nav stabilization.
const CY_V91_VERSION='0.9.1-live';
let CY_V91_NAV_BUSY=false;

function cyV91NormalizeText(value){
  return String(value??'')
    .replace(/신청\s*추적/g,'신청')
    .replace(/추적에서\s*제거/g,'신청 목록에서 제거')
    .replace(/추적\s*수정/g,'신청 수정')
    .replace(/추적\s*추가/g,'신청 등록')
    .replace(/추적\s*중/g,'신청')
    .replace(/추적중/g,'신청')
    .replace(/추적\s*버튼/g,'신청 버튼')
    .replace(/추적\s*탭/g,'신청 탭')
    .replace(/내\s*추적/g,'내 신청')
    .replace(/추적/g,'신청')
    .replace(/신청\s*신청/g,'신청');
}

function cyV91RenameText(root=document){
  if(!root)return;
  const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode(node){
    const p=node.parentElement;
    if(!p||/^(SCRIPT|STYLE|TEXTAREA)$/.test(p.tagName))return NodeFilter.FILTER_REJECT;
    if(p.tagName==='OPTION')return NodeFilter.FILTER_REJECT;
    return /추적/.test(node.nodeValue||'')?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT;
  }});
  const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
  nodes.forEach(node=>{node.nodeValue=cyV91NormalizeText(node.nodeValue)});

  root.querySelectorAll?.('[title],[aria-label]').forEach(el=>{
    if(el.hasAttribute('title'))el.setAttribute('title',cyV91NormalizeText(el.getAttribute('title')));
    if(el.hasAttribute('aria-label'))el.setAttribute('aria-label',cyV91NormalizeText(el.getAttribute('aria-label')));
  });

  const stop=document.querySelector('#trackStatus option[value="취소/추적중단"]');
  if(stop)stop.textContent='취소/신청중단';
}

function cyV91StaticLabels(){
  const brand=document.querySelector('.brand p');if(brand)brand.textContent='관심 공고 찜 · 신청 표시 · 자동 동기화';
  const heroStats=[...document.querySelectorAll('.hero-stat span')];
  heroStats.forEach(el=>{if(/내\s*추적|내\s*신청/.test(el.textContent||''))el.textContent='내 신청'});

  const tracking=document.querySelector('.page[data-page="tracking"]');
  if(tracking){
    const h=tracking.querySelector('.section-head h2');if(h)h.textContent='내 신청';
    const s=tracking.querySelector('.section-head small');if(s)s.textContent='신청한 공고 · 결과 · 서류 · 계약';
  }
  const trackingNav=document.querySelector('.nav-btn[data-page="tracking"]');if(trackingNav)trackingNav.innerHTML='<b>✓</b>신청';

  const fav=document.querySelector('.page[data-page="schedule"]');
  if(fav){
    const h=fav.querySelector('.section-head h2');if(h)h.textContent='찜한 공고';
    const s=fav.querySelector('.section-head small');if(s)s.textContent='찜한 공고 · 신청한 공고 우선';
  }
  const favNav=document.querySelector('.nav-btn[data-page="schedule"]');if(favNav)favNav.innerHTML='<b>♥</b>찜';

  const recSmall=document.querySelector('.page[data-page="recommend"] .section-head small');if(recSmall)recSmall.textContent='찜 · 신청 · 숨기기';
  const version=document.getElementById('appVersion');if(version)version.textContent='v'+CY_V91_VERSION;
  const settingsVersion=document.getElementById('settingsVersion');if(settingsVersion)settingsVersion.textContent=CY_V91_VERSION;
  cyV91RenameText(document);
}

// Replace smooth long-distance scrolling used by the old shell. On Android WebView,
// switching from a long page while smooth-scrolling could look like the app froze.
if(typeof openPage==='function'){
  openPage=function(name){
    if(CY_V91_NAV_BUSY)return;
    const target=document.querySelector(`.page[data-page="${String(name).replace(/"/g,'\\"')}"]`);
    if(!target)return;
    CY_V91_NAV_BUSY=true;
    document.body.classList.add('cy-v91-nav-switching');
    document.querySelectorAll('.page').forEach(page=>page.classList.toggle('active',page===target));
    document.querySelectorAll('.nav-btn').forEach(btn=>btn.classList.toggle('active',btn.dataset.page===name));
    try{window.scrollTo(0,0)}catch{}
    try{if(name==='schedule'&&typeof cyV90RenderFavorites==='function')cyV90RenderFavorites()}catch(error){console.error('[ChungYack] favorites render',error)}
    cyV91StaticLabels();
    requestAnimationFrame(()=>requestAnimationFrame(()=>{
      CY_V91_NAV_BUSY=false;
      document.body.classList.remove('cy-v91-nav-switching');
    }));
  };
}

if(typeof cyV90RenderFavorites==='function'){
  const _cyV91Favorites=cyV90RenderFavorites;
  cyV90RenderFavorites=function(){_cyV91Favorites();cyV91StaticLabels();};
  renderSchedule=cyV90RenderFavorites;
}
if(typeof renderTracking==='function'){
  const _cyV91Tracking=renderTracking;
  renderTracking=function(){_cyV91Tracking();cyV91StaticLabels();};
}
if(typeof renderRecommendations==='function'){
  const _cyV91Recommendations=renderRecommendations;
  renderRecommendations=function(){_cyV91Recommendations();cyV91StaticLabels();};
}
if(typeof renderHourlyReport==='function'){
  const _cyV91Hourly=renderHourlyReport;
  renderHourlyReport=function(report){_cyV91Hourly(report);cyV91StaticLabels();};
}
if(typeof renderSettings==='function'){
  const _cyV91Settings=renderSettings;
  renderSettings=function(){_cyV91Settings();cyV91StaticLabels();};
}
if(typeof renderHero==='function'){
  const _cyV91Hero=renderHero;
  renderHero=function(){_cyV91Hero();cyV91StaticLabels();};
}
if(typeof openTrackEditor==='function'){
  const _cyV91Editor=openTrackEditor;
  openTrackEditor=function(item={}){_cyV91Editor(item);cyV91StaticLabels();};
}
if(typeof cyV83OpenActionSheet==='function'){
  const _cyV91Sheet=cyV83OpenActionSheet;
  cyV83OpenActionSheet=function(ctx){_cyV91Sheet(ctx);cyV91RenameText(document.getElementById('cyV83ActionSheet')||document);};
}

function cyV91Boot(){
  cyV91StaticLabels();
  try{if(typeof cyV90RenderFavorites==='function')cyV90RenderFavorites()}catch{}
  setTimeout(cyV91StaticLabels,500);
}
if(document.readyState==='loading')window.addEventListener('DOMContentLoaded',cyV91Boot,{once:true});else setTimeout(cyV91Boot,0);
