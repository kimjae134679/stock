// v0.9.1 live: user-facing terminology uses "신청" instead of "추적".
// Internal tracking keys/functions remain unchanged for backward compatibility and cloud sync safety.
const CY_V91_VERSION='0.9.1-live';

function cyV91Text(value){
  return String(value??'')
    .replace(/신청\s*추적중/g,'신청')
    .replace(/신청\s*추적/g,'신청')
    .replace(/추적중/g,'신청')
    .replace(/추적/g,'신청');
}

function cyV91ApplyLabels(root=document){
  if(!root)return;

  const appRoot=root.nodeType===9?(root.querySelector('.app')||root):root;
  const walker=document.createTreeWalker(appRoot,NodeFilter.SHOW_TEXT);
  const nodes=[];
  while(walker.nextNode())nodes.push(walker.currentNode);
  nodes.forEach(node=>{
    const parent=node.parentElement;
    if(!parent||/^(SCRIPT|STYLE|TEXTAREA|OPTION)$/i.test(parent.tagName))return;
    const next=cyV91Text(node.nodeValue);
    if(next!==node.nodeValue)node.nodeValue=next;
  });

  appRoot.querySelectorAll?.('[title],[aria-label]').forEach(el=>{
    for(const attr of ['title','aria-label']){
      if(!el.hasAttribute(attr))continue;
      const current=el.getAttribute(attr)||'';
      const next=cyV91Text(current);
      if(next!==current)el.setAttribute(attr,next);
    }
  });

  const nav=appRoot.querySelector?.('.nav-btn[data-page="tracking"]');
  if(nav)nav.innerHTML='<b>✓</b>신청';

  const trackingPage=appRoot.querySelector?.('.page[data-page="tracking"]');
  if(trackingPage){
    const h=trackingPage.querySelector('.section-head h2');if(h)h.textContent='내 신청';
    const s=trackingPage.querySelector('.section-head small');if(s)s.textContent='신청한 공고 · 결과 · 서류 · 계약';
  }

  const stat=[...(appRoot.querySelectorAll?.('.hero-stat span')||[])].find(x=>/내\s*(추적|신청)/.test(x.textContent||''));
  if(stat)stat.textContent='내 신청';

  const rec=appRoot.querySelector?.('.page[data-page="recommend"] .section-head small');
  if(rec)rec.textContent='찜 · 신청 · 숨기기';

  const fav=appRoot.querySelector?.('.page[data-page="schedule"] .section-head small');
  if(fav)fav.textContent='찜한 공고 · 신청 공고 우선';

  const version=appRoot.querySelector?.('#appVersion');if(version)version.textContent='v'+CY_V91_VERSION;
  const settingsVersion=appRoot.querySelector?.('#settingsVersion');if(settingsVersion)settingsVersion.textContent=CY_V91_VERSION;
}

function cyV91Wrap(name,after){
  const fn=window[name];
  if(typeof fn!=='function'||fn.__cyV91Wrapped)return;
  const wrapped=function(...args){
    const result=fn.apply(this,args);
    try{after?.(...args)}catch{}
    return result;
  };
  wrapped.__cyV91Wrapped=true;
  window[name]=wrapped;
}

if(typeof cyV90RenameStaticText==='function'){
  const base=cyV90RenameStaticText;
  cyV90RenameStaticText=function(root=document){base(root);cyV91ApplyLabels(root);};
}

cyV91Wrap('renderRecommendations',()=>cyV91ApplyLabels(document.querySelector('.page[data-page="recommend"]')||document));
cyV91Wrap('renderHourlyReport',()=>cyV91ApplyLabels(document.querySelector('.page[data-page="home"]')||document));
cyV91Wrap('renderTracking',()=>cyV91ApplyLabels(document.querySelector('.page[data-page="tracking"]')||document));
cyV91Wrap('renderSettings',()=>cyV91ApplyLabels(document.querySelector('.page[data-page="settings"]')||document));
cyV91Wrap('renderHero',()=>cyV91ApplyLabels(document.querySelector('.hero')||document));

if(typeof renderSchedule==='function'){
  const baseSchedule=renderSchedule;
  renderSchedule=function(...args){const out=baseSchedule.apply(this,args);cyV91ApplyLabels(document.querySelector('.page[data-page="schedule"]')||document);return out;};
}
if(typeof cyV90RenderFavorites==='function'){
  const baseFavorites=cyV90RenderFavorites;
  cyV90RenderFavorites=function(...args){const out=baseFavorites.apply(this,args);cyV91ApplyLabels(document.querySelector('.page[data-page="schedule"]')||document);return out;};
}
if(typeof cyV83OpenActionSheet==='function'){
  const baseSheet=cyV83OpenActionSheet;
  cyV83OpenActionSheet=function(...args){const out=baseSheet.apply(this,args);cyV91ApplyLabels(document.getElementById('cyV83ActionSheet')||document);return out;};
}

let cyV91Queued=false;
const cyV91Observer=new MutationObserver(()=>{
  if(cyV91Queued)return;
  cyV91Queued=true;
  queueMicrotask(()=>{cyV91Queued=false;try{cyV91ApplyLabels(document)}catch{}});
});

function cyV91Boot(){
  cyV91ApplyLabels(document);
  const app=document.querySelector('.app');if(app)cyV91Observer.observe(app,{subtree:true,childList:true,characterData:true});
  setTimeout(()=>cyV91ApplyLabels(document),700);
}

if(document.readyState==='loading')window.addEventListener('DOMContentLoaded',cyV91Boot,{once:true});else cyV91Boot();
