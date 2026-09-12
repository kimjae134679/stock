// v0.10.3 compatibility: persistent sorting for opportunity/home lists.
const CY_V103_VERSION=window.CY_LATEST_VERSION||'0.10.3-live';
const CY_V103_SORT_KEY='chungyack.opportunity.sort.v1';
let CY_V103_SORT=localStorage.getItem(CY_V103_SORT_KEY)||'default';
const CY_V103_SORTS=new Set(['default','deadline','start','rent','deposit','units','name']);
if(!CY_V103_SORTS.has(CY_V103_SORT))CY_V103_SORT='default';

function cyV103ParseDatePart(text='',end=false){
  const s=String(text||'');
  const dates=[...s.matchAll(/(?:(20\d{2})[-./년\s]*)?(\d{1,2})[-./월\s]+(\d{1,2})(?:일)?(?:\s+(\d{1,2}):(\d{2}))?/g)];
  if(!dates.length)return Number.POSITIVE_INFINITY;
  const m=end?dates[dates.length-1]:dates[0];
  const now=new Date();
  let y=Number(m[1]||now.getFullYear()),mo=Number(m[2]),d=Number(m[3]);
  const hh=Number(m[4]||(end?23:0)),mm=Number(m[5]||(end?59:0));
  let t=new Date(y,mo-1,d,hh,mm,0,0).getTime();
  if(!m[1]&&Number.isFinite(t)&&t<new Date(now.getFullYear()-1,0,1).getTime())t=new Date(now.getFullYear(),mo-1,d,hh,mm,0,0).getTime();
  return Number.isFinite(t)?t:Number.POSITIVE_INFINITY;
}
function cyV103MoneyMin(text=''){
  const s=String(text||'').replace(/,/g,'').trim();
  if(!s)return Number.POSITIVE_INFINITY;
  const first=s.split('~')[0].trim();
  let total=0,matched=false;
  const eok=first.match(/([0-9]+(?:\.[0-9]+)?)\s*억/);if(eok){total+=Number(eok[1])*100000000;matched=true}
  const man=first.match(/([0-9]+(?:\.[0-9]+)?)\s*만/);if(man){total+=Number(man[1])*10000;matched=true}
  if(matched)return total;
  const n=first.match(/([0-9]+(?:\.[0-9]+)?)/);return n?Number(n[1]):Number.POSITIVE_INFINITY;
}
function cyV103Finance(item){
  try{return typeof cyV84Finance==='function'?cyV84Finance(item):{deposit:'',rent:''}}catch{return {deposit:'',rent:''}}
}
function cyV103Units(item){
  const s=String(item?.units||'').replace(/,/g,'');
  const m=s.match(/(?:공급|총|전체)?\s*(\d+)\s*(?:세대|호)/)||s.match(/(\d+)\s*(?:세대|호)/);
  return m?Number(m[1]):0;
}
function cyV103SortRows(rows){
  const list=[...(Array.isArray(rows)?rows:[])];
  if(CY_V103_SORT==='default')return list;
  const cmp={
    deadline:(a,b)=>cyV103ParseDatePart(a?.period,true)-cyV103ParseDatePart(b?.period,true),
    start:(a,b)=>cyV103ParseDatePart(a?.period,false)-cyV103ParseDatePart(b?.period,false),
    rent:(a,b)=>cyV103MoneyMin(cyV103Finance(a).rent)-cyV103MoneyMin(cyV103Finance(b).rent),
    deposit:(a,b)=>cyV103MoneyMin(cyV103Finance(a).deposit)-cyV103MoneyMin(cyV103Finance(b).deposit),
    units:(a,b)=>cyV103Units(b)-cyV103Units(a),
    name:(a,b)=>String(a?.name||'').localeCompare(String(b?.name||''),'ko')
  }[CY_V103_SORT];
  if(!cmp)return list;
  return list.map((x,i)=>({x,i})).sort((a,b)=>{const d=cmp(a.x,b.x);return Number.isFinite(d)&&d!==0?d:a.i-b.i}).map(v=>v.x);
}

if(typeof cyV7Items==='function'&&!cyV7Items.__cyV103Wrapped){
  const base=cyV7Items;
  const wrapped=function(){return cyV103SortRows(base.apply(this,arguments)||[])};
  wrapped.__cyV103Wrapped=true;cyV7Items=wrapped;
}

function cyV103SortControl(){
  return `<label class="cy-v103-sort"><span>정렬</span><select id="cyV103Sort" aria-label="공고 정렬">
    <option value="default" ${CY_V103_SORT==='default'?'selected':''}>기본순</option>
    <option value="deadline" ${CY_V103_SORT==='deadline'?'selected':''}>마감 임박순</option>
    <option value="start" ${CY_V103_SORT==='start'?'selected':''}>접수 시작순</option>
    <option value="rent" ${CY_V103_SORT==='rent'?'selected':''}>월세 낮은순</option>
    <option value="deposit" ${CY_V103_SORT==='deposit'?'selected':''}>보증금 낮은순</option>
    <option value="units" ${CY_V103_SORT==='units'?'selected':''}>모집 많은순</option>
    <option value="name" ${CY_V103_SORT==='name'?'selected':''}>이름순</option>
  </select></label>`;
}
function cyV103InjectToolbar(html){
  const s=String(html||'');
  if(s.includes('id="cyV103Sort"'))return s;
  const marker='<div class="cy-v8-search-wrap">';
  if(s.includes(marker))return s.replace(marker,`<div class="cy-v103-sort-row">${cyV103SortControl()}</div>${marker}`);
  const marker7='<div class="cy-v7-search-row">';
  if(s.includes(marker7))return s.replace(marker7,`<div class="cy-v103-sort-row">${cyV103SortControl()}</div>${marker7}`);
  return s;
}
if(typeof cyV8Toolbar==='function'&&!cyV8Toolbar.__cyV103Wrapped){
  const base=cyV8Toolbar;const wrapped=function(){return cyV103InjectToolbar(base.apply(this,arguments))};wrapped.__cyV103Wrapped=true;cyV8Toolbar=wrapped;
}
if(typeof cyV7Toolbar==='function'&&!cyV7Toolbar.__cyV103Wrapped){
  const base=cyV7Toolbar;const wrapped=function(){return cyV103InjectToolbar(base.apply(this,arguments))};wrapped.__cyV103Wrapped=true;cyV7Toolbar=wrapped;
}

function cyV103Wire(){
  const select=document.getElementById('cyV103Sort');if(!select||select.__cyV103Wired)return;
  select.__cyV103Wired=true;
  select.addEventListener('change',()=>{
    CY_V103_SORT=CY_V103_SORTS.has(select.value)?select.value:'default';
    localStorage.setItem(CY_V103_SORT_KEY,CY_V103_SORT);
    try{renderRecommendations()}catch{}
  });
}
function cyV103Stamp(){
  const version=window.CY_LATEST_VERSION||CY_V103_VERSION;
  const v=document.getElementById('appVersion');if(v)v.textContent='v'+version;
  const s=document.getElementById('settingsVersion');if(s)s.textContent=version;
}
if(typeof renderRecommendations==='function'&&!renderRecommendations.__cyV103Wrapped){
  const base=renderRecommendations;
  const wrapped=function(){const out=base.apply(this,arguments);cyV103Wire();cyV103Stamp();return out};
  wrapped.__cyV103Wrapped=true;renderRecommendations=wrapped;
}
['renderHero','renderSettings'].forEach(name=>{
  const fn=window[name];if(typeof fn!=='function'||fn.__cyV103Wrapped)return;
  const wrapped=function(){const out=fn.apply(this,arguments);cyV103Stamp();return out};wrapped.__cyV103Wrapped=true;window[name]=wrapped;
});
function cyV103Boot(){try{renderRecommendations()}catch{}cyV103Wire();cyV103Stamp();setTimeout(()=>{cyV103Wire();cyV103Stamp()},120)}
if(document.readyState==='loading')window.addEventListener('DOMContentLoaded',cyV103Boot,{once:true});else setTimeout(cyV103Boot,0);
