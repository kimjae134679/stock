// v0.9.6 live: automatically hide expired opportunities that are unrelated to the user.
// Expired items stay visible when they are applied/tracked or favorited.
const CY_V96_VERSION='0.9.6-live';

function cyV96Tracked(item){
  try{return !!(item&&typeof cyV7IsTracked==='function'&&cyV7IsTracked(item))}catch{return false}
}
function cyV96Saved(item){
  try{return !!(item&&typeof CY_V7_SAVED!=='undefined'&&CY_V7_SAVED.has(item.id))}catch{return false}
}
function cyV96Protected(item){return cyV96Tracked(item)||cyV96Saved(item)}

function cyV96RangeEnd(period){
  const raw=String(period||'').trim();
  if(!raw||/상시|소진\s*시|별도\s*안내|미정|수시/.test(raw))return null;
  const s=raw.replace(/[.\/]/g,'-').replace(/\s+/g,' ').replace(/[–—]/g,'~');
  const yearMatch=s.match(/(20\d{2})\s*-\s*(\d{1,2})\s*-\s*(\d{1,2})/);
  if(!yearMatch)return null;
  const year=Number(yearMatch[1]);
  const startMonth=Number(yearMatch[2]);
  const startDay=Number(yearMatch[3]);
  const parts=s.split('~');
  if(parts.length<2)return null;
  const endPart=parts.slice(1).join('~').trim();

  let month=startMonth,day=startDay,hour=23,minute=59;
  let m=endPart.match(/(?:20\d{2}\s*-\s*)?(\d{1,2})\s*-\s*(\d{1,2})(?:\s+(\d{1,2}):(\d{2}))?/);
  if(m){
    month=Number(m[1]);day=Number(m[2]);
    if(m[3]!=null){hour=Number(m[3]);minute=Number(m[4])}
  }else{
    m=endPart.match(/^(\d{1,2}):(\d{2})/);
    if(!m)return null;
    hour=Number(m[1]);minute=Number(m[2]);
  }
  if(month<1||month>12||day<1||day>31||hour<0||hour>23||minute<0||minute>59)return null;
  const d=new Date(year,month-1,day,hour,minute,59,999);
  return Number.isNaN(d.getTime())?null:d;
}

function cyV96Expired(item,now=new Date()){
  if(!item)return false;
  const end=cyV96RangeEnd(item.period);
  if(end)return now.getTime()>end.getTime();

  // Only use explicit closed status when the date could not be parsed.
  // Avoid treating future text such as "9월 9일 접수 마감" as already closed.
  const status=`${item.status||''} ${item.eligibility?.title||''}`;
  if(/접수\s*(종료|완료)|접수마감|접수\s*마감\s*(완료|경과)|모집\s*마감/.test(status))return true;
  return false;
}

function cyV96ShouldShow(item){return cyV96Protected(item)||!cyV96Expired(item)}

if(typeof cyV7Items==='function'&&!cyV7Items.__cyV96Wrapped){
  const base=cyV7Items;
  const wrapped=function(){
    const rows=base.apply(this,arguments)||[];
    return rows.filter(cyV96ShouldShow);
  };
  wrapped.__cyV96Wrapped=true;
  cyV7Items=wrapped;
}

function cyV96Stamp(){
  const v=document.getElementById('appVersion');if(v)v.textContent='v'+CY_V96_VERSION;
  const s=document.getElementById('settingsVersion');if(s)s.textContent=CY_V96_VERSION;
}
function cyV96Wrap(name,after){
  const fn=window[name];if(typeof fn!=='function'||fn.__cyV96Wrapped)return;
  const wrapped=function(){const out=fn.apply(this,arguments);try{after?.()}catch{}return out};
  wrapped.__cyV96Wrapped=true;window[name]=wrapped;
}
cyV96Wrap('renderRecommendations',cyV96Stamp);
cyV96Wrap('renderHero',cyV96Stamp);
cyV96Wrap('renderSettings',cyV96Stamp);
cyV96Wrap('cyV94RenderResults',cyV96Stamp);
cyV96Wrap('cyV94Static',cyV96Stamp);

function cyV96Boot(){
  cyV96Stamp();
  try{if(typeof renderRecommendations==='function')renderRecommendations()}catch(e){console.warn('[ChungYack] expired opportunity filter refresh failed',e)}
  try{if(typeof cyV94MoveOpportunitiesHome==='function')cyV94MoveOpportunitiesHome()}catch{}
  cyV96Stamp();
}
if(document.readyState==='loading')window.addEventListener('DOMContentLoaded',cyV96Boot,{once:true});else setTimeout(cyV96Boot,0);
