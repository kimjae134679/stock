// v0.9.2 compatibility layer: user-facing terminology uses "신청" instead of "추적".
// IMPORTANT: no MutationObserver. The previous observer could retrigger itself and freeze Android WebView.
// Internal tracking keys/functions remain unchanged for backward compatibility and cloud sync safety.
const CY_V91_VERSION='0.9.2-live';

function cyV91Text(value){
  return String(value??'')
    .replace(/신청\s*추적중/g,'신청')
    .replace(/신청\s*추적/g,'신청')
    .replace(/추적에서\s*제거/g,'신청 목록에서 제거')
    .replace(/추적\s*수정/g,'신청 수정')
    .replace(/추적\s*추가/g,'신청 등록')
    .replace(/추적\s*중/g,'신청')
    .replace(/추적중/g,'신청')
    .replace(/추적/g,'신청')
    .replace(/신청\s*신청/g,'신청');
}
function cyV91SetText(el,value){if(el&&el.textContent!==value)el.textContent=value}
function cyV91SetHtml(el,value){if(el&&el.innerHTML!==value)el.innerHTML=value}
function cyV91ApplyLabels(root=document){
  if(!root)return;
  const scope=root.nodeType===9?(root.querySelector('.app')||root):root;
  const walker=document.createTreeWalker(scope,NodeFilter.SHOW_TEXT,{acceptNode(node){
    const parent=node.parentElement;
    if(!parent||/^(SCRIPT|STYLE|TEXTAREA|OPTION)$/i.test(parent.tagName))return NodeFilter.FILTER_REJECT;
    return /추적/.test(node.nodeValue||'')?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT;
  }});
  const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
  nodes.forEach(node=>{const next=cyV91Text(node.nodeValue);if(next!==node.nodeValue)node.nodeValue=next});
  scope.querySelectorAll?.('[title],[aria-label]').forEach(el=>{for(const attr of ['title','aria-label']){if(!el.hasAttribute(attr))continue;const current=el.getAttribute(attr)||'';if(!/추적/.test(current))continue;const next=cyV91Text(current);if(next!==current)el.setAttribute(attr,next)}});
  const nav=scope.querySelector?.('.nav-btn[data-page="tracking"]');cyV91SetHtml(nav,'<b>✓</b>신청');
  const trackingPage=scope.querySelector?.('.page[data-page="tracking"]');if(trackingPage){cyV91SetText(trackingPage.querySelector('.section-head h2'),'내 신청');cyV91SetText(trackingPage.querySelector('.section-head small'),'신청한 공고 · 결과 · 서류 · 계약')}
  const heroStats=[...(scope.querySelectorAll?.('.hero-stat span')||[])];heroStats.forEach(el=>{if(/내\s*(추적|신청)/.test(el.textContent||''))cyV91SetText(el,'내 신청')});
  cyV91SetText(scope.querySelector?.('.page[data-page="recommend"] .section-head small'),'찜 · 신청 · 숨기기');
  cyV91SetText(scope.querySelector?.('.page[data-page="schedule"] .section-head small'),'찜한 공고 · 신청 공고 우선');
  const version=scope.querySelector?.('#appVersion');if(version)cyV91SetText(version,'v'+CY_V91_VERSION);
  const settingsVersion=scope.querySelector?.('#settingsVersion');if(settingsVersion)cyV91SetText(settingsVersion,CY_V91_VERSION);
}
function cyV91Wrap(name,after){const fn=window[name];if(typeof fn!=='function'||fn.__cyV91Wrapped)return;const wrapped=function(...args){const result=fn.apply(this,args);try{after?.(...args)}catch(error){console.warn('[ChungYack] label refresh failed',error)}return result};wrapped.__cyV91Wrapped=true;window[name]=wrapped}
if(typeof cyV90RenameStaticText==='function'&&!cyV90RenameStaticText.__cyV91Wrapped){const base=cyV90RenameStaticText;const wrapped=function(root=document){const out=base(root);cyV91ApplyLabels(root);return out};wrapped.__cyV91Wrapped=true;cyV90RenameStaticText=wrapped}
cyV91Wrap('renderRecommendations',()=>cyV91ApplyLabels(document.querySelector('.page[data-page="recommend"]')||document));
cyV91Wrap('renderHourlyReport',()=>cyV91ApplyLabels(document.querySelector('.page[data-page="home"]')||document));
cyV91Wrap('renderTracking',()=>cyV91ApplyLabels(document.querySelector('.page[data-page="tracking"]')||document));
cyV91Wrap('renderSettings',()=>cyV91ApplyLabels(document.querySelector('.page[data-page="settings"]')||document));
cyV91Wrap('renderHero',()=>cyV91ApplyLabels(document.querySelector('.hero')||document));
cyV91Wrap('renderSchedule',()=>cyV91ApplyLabels(document.querySelector('.page[data-page="schedule"]')||document));
cyV91Wrap('cyV90RenderFavorites',()=>cyV91ApplyLabels(document.querySelector('.page[data-page="schedule"]')||document));
cyV91Wrap('cyV83OpenActionSheet',()=>cyV91ApplyLabels(document.getElementById('cyV83ActionSheet')||document));
cyV91Wrap('openTrackEditor',()=>cyV91ApplyLabels(document.getElementById('trackingEditor')||document));
function cyV91Boot(){cyV91ApplyLabels(document);setTimeout(()=>{try{cyV91ApplyLabels(document)}catch{}},900)}

function cyV91LoadV95(){
  if(document.getElementById('cyV95ResultActionsScript'))return;
  if(!document.getElementById('cyV95ResultActionsCss')){const css=document.createElement('link');css.id='cyV95ResultActionsCss';css.rel='stylesheet';css.href='assets/app-v95-result-actions.css?v=0950';document.head.appendChild(css)}
  const js=document.createElement('script');js.id='cyV95ResultActionsScript';js.src='assets/app-v95-result-actions.js?v=0950';document.body.appendChild(js);
}
function cyV91LoadV94(){
  const existing=document.getElementById('cyV94LayoutScript');if(existing){cyV91LoadV95();return}
  if(!document.getElementById('cyV94LayoutCss')){const css=document.createElement('link');css.id='cyV94LayoutCss';css.rel='stylesheet';css.href='assets/app-v94-layout.css?v=0941';document.head.appendChild(css)}
  const js=document.createElement('script');js.id='cyV94LayoutScript';js.src='assets/app-v94-layout.js?v=0941';js.onload=()=>{cyV91LoadV95();setTimeout(()=>{try{if(typeof cyV94Refresh==='function')cyV94Refresh()}catch{}},1200)};document.body.appendChild(js);
}
function cyV91LoadResultFixAndV94(){const existing=document.getElementById('cyV93ResultFixScript');if(existing){cyV91LoadV94();return}const fix=document.createElement('script');fix.id='cyV93ResultFixScript';fix.src='assets/app-v93-resultfix.js?v=0931';fix.onload=cyV91LoadV94;document.body.appendChild(fix)}
function cyV91LoadV93(){if(document.getElementById('cyV93CompactScript')){cyV91LoadResultFixAndV94();return}if(!document.getElementById('cyV93CompactCss')){const css=document.createElement('link');css.id='cyV93CompactCss';css.rel='stylesheet';css.href='assets/app-v93-compact.css?v=0931';document.head.appendChild(css)}const js=document.createElement('script');js.id='cyV93CompactScript';js.src='assets/app-v93-compact.js?v=0931';js.onload=cyV91LoadResultFixAndV94;document.body.appendChild(js)}
if(document.readyState==='loading')window.addEventListener('DOMContentLoaded',()=>{cyV91Boot();setTimeout(cyV91LoadV93,120)},{once:true});else{cyV91Boot();setTimeout(cyV91LoadV93,120)}
