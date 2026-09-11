// v0.10.2 live: verified current-notice finance ranges for active/upcoming opportunities.
// Values intentionally reflect only youth/user-applicable types in the current notice, not whole-building spouse-only ranges.
const CY_V102_VERSION='0.10.2-live';
const CY_V102_FINANCE={
  'youth-soco-heritz-mia-2026-09-10':{deposit:'1억~1억6,600만원',rent:'24만~47만원'},
  'youth-soco-unit125-2026-09-10':{deposit:'6,620만~1억1,030만원',rent:'47만~66만원'},
  'youth-soco-sageium-taereung-2026-09-01':{deposit:'4,800만~5,700만원',rent:'42만~50만원'},
  'youth-soco-gusan-house-2026-09-10':{deposit:'4,800만~9,100만원',rent:'29만~58만원'},
  'youth-soco-sangbong-life-2026-09-10':{deposit:'7,120만~1억6,620만원',rent:'29만~67만원'},
  'youth-soco-queensw-cheongnyangni-2026-09-10':{deposit:'8,800만~2억200만원',rent:'45만~100만원'},
  'youth-soco-jaesky-whigyeong-2026-09-10':{deposit:'7,600만~1억4,000만원',rent:'34만~82만원'},
  'youth-soco-harrington-ujangsan-2026-09-10':{deposit:'3,680만~1억400만원',rent:'27.3만~71.2만원'},
  'youth-soco-inhere-ssangmun-2026-09-10':{deposit:'3,840만~7,448만원',rent:'30만~57.6만원'},
  'youth-soco-mangrove-changcheon-2026-09-08':{deposit:'1억2,990만~1억7,570만원',rent:'54만~71만원'},
  'geumcheon-youth-custom-2026-h2':{deposit:'1,064만~3,076만원',rent:'14만~40만원'}
};

function cyV102FinanceFor(item){return item&&CY_V102_FINANCE[item.id]||null}
if(typeof cyV84Finance==='function'&&!cyV84Finance.__cyV102Wrapped){
  const base=cyV84Finance;
  const wrapped=function(item){
    const out=base.apply(this,arguments)||{deposit:'',rent:'',summary:'',pairs:[]};
    const v=cyV102FinanceFor(item);if(!v)return out;
    return {...out,deposit:v.deposit,rent:v.rent,summary:`보증금 ${v.deposit} · 월 ${v.rent}`};
  };
  wrapped.__cyV102Wrapped=true;cyV84Finance=wrapped;
}
function cyV102Stamp(){
  const v=document.getElementById('appVersion');if(v)v.textContent='v'+CY_V102_VERSION;
  const s=document.getElementById('settingsVersion');if(s)s.textContent=CY_V102_VERSION;
}
function cyV102Refresh(){
  try{if(typeof renderRecommendations==='function')renderRecommendations()}catch(e){console.warn('[ChungYack] finance range home refresh failed',e)}
  try{if(typeof cyV90RenderFavorites==='function')cyV90RenderFavorites()}catch{}
  try{if(typeof cyV94RenderApplications==='function')cyV94RenderApplications()}catch{}
  try{if(typeof cyV94RenderResults==='function')cyV94RenderResults()}catch{}
  cyV102Stamp();
}
if(document.readyState==='loading')window.addEventListener('DOMContentLoaded',()=>setTimeout(cyV102Refresh,500),{once:true});else setTimeout(cyV102Refresh,500);
