// v0.10.6 live: final guard that removes expired reception notices from Home.
// No exception for applied/favorited items; those continue in 신청/결과/찜 only.
const CY_V106_VERSION='0.10.6-live';
window.CY_LATEST_VERSION=CY_V106_VERSION;

function cyV106RangeEnd(period){
  let s=String(period||'').trim();
  if(!s||/상시|소진\s*시|별도\s*안내|미정|수시/.test(s))return 0;
  s=s.replace(/년\s*/g,'-').replace(/월\s*/g,'-').replace(/일/g,'').replace(/[.\/]/g,'-').replace(/[–—]/g,'~').replace(/\s+/g,' ').trim();
  const first=s.match(/(20\d{2})\s*-\s*(\d{1,2})\s*-\s*(\d{1,2})(?:\s+(\d{1,2}):(\d{2}))?/);
  if(!first)return 0;
  const parts=s.split('~');
  if(parts.length<2)return 0;
  const endPart=parts.slice(1).join('~').trim();
  let year=Number(first[1]),month=Number(first[2]),day=Number(first[3]),hour=23,minute=59;
  let m=endPart.match(/(20\d{2})\s*-\s*(\d{1,2})\s*-\s*(\d{1,2})(?:\s+(\d{1,2}):(\d{2}))?/);
  if(m){year=Number(m[1]);month=Number(m[2]);day=Number(m[3]);if(m[4]!=null){hour=Number(m[4]);minute=Number(m[5])}}
  else{
    m=endPart.match(/(\d{1,2})\s*-\s*(\d{1,2})(?:\s+(\d{1,2}):(\d{2}))?/);
    if(!m)return 0;
    month=Number(m[1]);day=Number(m[2]);if(m[3]!=null){hour=Number(m[3]);minute=Number(m[4])}
  }
  if(month<1||month>12||day<1||day>31||hour<0||hour>23||minute<0||minute>59)return 0;
  return Date.UTC(year,month-1,day,hour-9,minute,59,999);
}
function cyV106Expired(item){
  if(!item)return false;
  const end=cyV106RangeEnd(item.period);
  if(end&&Date.now()>end)return true;
  const status=`${item.status||''} ${item.eligibility?.title||''}`;
  return /접수\s*(?:종료|완료|마감)|모집\s*마감/.test(status);
}

if(typeof cyV7Items==='function'&&!cyV7Items.__cyV106Wrapped){
  const base=cyV7Items;
  const wrapped=function(){return (base.apply(this,arguments)||[]).filter(item=>!cyV106Expired(item))};
  wrapped.__cyV106Wrapped=true;
  cyV7Items=wrapped;
}
function cyV106Stamp(){
  const v=document.getElementById('appVersion');if(v)v.textContent='v'+CY_V106_VERSION;
  const s=document.getElementById('settingsVersion');if(s)s.textContent=CY_V106_VERSION;
}
function cyV106Refresh(){
  try{if(typeof renderRecommendations==='function')renderRecommendations()}catch(e){console.warn('[ChungYack] expired-home final refresh failed',e)}
  try{if(typeof cyV94MoveOpportunitiesHome==='function')cyV94MoveOpportunitiesHome()}catch{}
  cyV106Stamp();
}
if(document.readyState==='loading')window.addEventListener('DOMContentLoaded',cyV106Refresh,{once:true});else cyV106Refresh();
setInterval(cyV106Refresh,60*1000);
