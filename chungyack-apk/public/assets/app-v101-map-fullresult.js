// v0.10.1 live: map links on all major cards + full result details restored.
const CY_V101_VERSION='0.10.1-live';

function cyV101Esc(v){return typeof cyV94Esc==='function'?cyV94Esc(v):String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function cyV101Opp(x){
  try{if(typeof cyV95OppForTrack==='function')return cyV95OppForTrack(x)}catch{}
  const name=typeof x==='string'?x:(x?.name||'');
  try{if(typeof cyV93Opp==='function')return cyV93Opp(name)}catch{}
  try{return (CY_OPPORTUNITY_DATA?.items||[]).find(o=>o?.name===name)||null}catch{return null}
}
function cyV101Address(x,opp){
  return String(x?.address||opp?.address||opp?.referenceAddress||(Array.isArray(opp?.addresses)?opp.addresses.find(Boolean):'')||'').trim();
}
function cyV101MapUrl(x,opp){
  const q=cyV101Address(x,opp)||String(x?.name||opp?.name||'').trim();
  return q?`https://map.naver.com/p/search/${encodeURIComponent(q)}`:'';
}
function cyV101MapLink(x,opp,label='지도'){
  const url=cyV101MapUrl(x,opp);return url?`<a class="cy-v101-map" href="${cyV101Esc(url)}" target="_blank" rel="noopener">⌖ ${label} ↗</a>`:'';
}
function cyV101Official(x,opp){
  try{const u=typeof cyV95OfficialUrl==='function'?cyV95OfficialUrl(x):'';if(u)return u}catch{}
  return opp?.source||opp?.officialUrl||opp?.url||'';
}
function cyV101Finance(opp){try{return typeof cyV84Finance==='function'?cyV84Finance(opp):{deposit:'',rent:'',summary:''}}catch{return {deposit:'',rent:'',summary:''}}}
function cyV101FmtResult(m){
  if(!m?.result?.at)return '';
  try{return typeof cyV87FmtAt==='function'?cyV87FmtAt(m.result.at):String(m.result.at)}catch{return String(m.result.at)}
}
function cyV101Info(label,value,wide=false){
  if(value===undefined||value===null||String(value).trim()==='')return '';
  return `<div class="cy-v101-info${wide?' wide':''}"><small>${cyV101Esc(label)}</small><b>${cyV101Esc(value)}</b></div>`;
}

// Restore the information-rich result card. Result action buttons from v0.9.5 are preserved.
function cyV101ResultCard(x){
  const cat=typeof cyV94Category==='function'?cyV94Category(x):'check';
  const meta=typeof cyV94Meta==='function'?cyV94Meta(cat):['•','결과'];
  const m=typeof cyV94Milestone==='function'?cyV94Milestone(x):null;
  const v=typeof cyV94Verification==='function'?cyV94Verification(x):null;
  const opp=cyV101Opp(x),f=cyV101Finance(opp),address=cyV101Address(x,opp);
  const resultAt=cyV101FmtResult(m);
  const note=typeof cyV94ResultNote==='function'?cyV94ResultNote(x,cat):'';
  const official=cyV101Official(x,opp);
  const period=opp?.period||'';
  const units=opp?.units||'';
  const region=opp?.region||'';
  const docs=m?.documents?.text||'';
  const contract=m?.contract?.text||'';
  const next=x?.next||opp?.next||'';
  const checked=v?.checkedAt?String(v.checkedAt).replace('T',' ').slice(0,16):'';
  const detail=String(x?.detail||'').trim();
  const applicationArea=x?.applicationArea||'';
  const actions=typeof cyV95ActionsHtml==='function'?cyV95ActionsHtml(x):'';
  return `<article class="cy-v94-result-card cy-v101-result-card ${cat}">
    <div class="cy-v94-result-top"><span class="cy-v94-result-state ${cat}">${meta[0]} ${meta[1]}</span>${checked?`<small>확인 ${cyV101Esc(checked)}</small>`:''}</div>
    <strong>${cyV101Esc(x?.name||'')}</strong>
    <div class="cy-v101-tags">${x?.status?`<span>${cyV101Esc(x.status)}</span>`:''}${x?.type?`<span>${cyV101Esc(x.type)}</span>`:''}${region?`<span>${cyV101Esc(region)}</span>`:''}${x?.appliedAt?`<span>신청 ${cyV101Esc(x.appliedAt)}</span>`:''}${applicationArea?`<span>신청지역 ${cyV101Esc(applicationArea)}</span>`:''}</div>
    <div class="cy-v101-grid">
      ${cyV101Info('접수 기간',period)}
      ${cyV101Info('모집',units)}
      ${cyV101Info('보증금',f.deposit||'공고문 확인 필요')}
      ${cyV101Info('월세',f.rent||'공고문 확인 필요')}
      ${cyV101Info(m?.result?.label||'결과 발표',resultAt)}
      ${cyV101Info(m?.documents?.label||'서류',docs)}
      ${cyV101Info(m?.contract?.label||'계약',contract,true)}
      ${cyV101Info('주소',address||'정확한 주소 확인 필요',true)}
      ${cyV101Info('다음 일정',next,true)}
    </div>
    ${detail?`<div class="cy-v101-detail"><small>신청 기록</small><p>${cyV101Esc(detail)}</p></div>`:''}
    ${note?`<div class="cy-v101-result-note"><small>결과 확인</small><p>${cyV101Esc(note)}</p></div>`:''}
    <div class="cy-v101-links">${official?`<a href="${cyV101Esc(official)}" target="_blank" rel="noopener">▤ 공식 공고 ↗</a>`:''}${cyV101MapLink(x,opp,'지도')}</div>
    ${actions}
  </article>`;
}
if(typeof cyV94ResultCard==='function')cyV94ResultCard=cyV101ResultCard;

function cyV101AppendMap(html,selector,x,opp){
  try{
    const t=document.createElement('template');t.innerHTML=String(html||'').trim();
    const actions=t.content.querySelector(selector);if(!actions)return html;
    if(actions.querySelector('.cy-v101-map'))return html;
    const url=cyV101MapUrl(x,opp);if(!url)return html;
    const a=document.createElement('a');a.className='cy-v101-map cy-v101-map-action';a.href=url;a.target='_blank';a.rel='noopener';a.innerHTML='<b>⌖</b><small>지도</small>';
    actions.appendChild(a);return t.innerHTML;
  }catch{return html}
}

// Home opportunity cards: every card gets a map link, using exact address first and name search as fallback.
if(typeof cyV8Card==='function'&&!cyV8Card.__cyV101Wrapped){
  const base=cyV8Card;
  const wrapped=function(item){return cyV101AppendMap(base.apply(this,arguments),'.cy-v8-actions',item,item)};
  wrapped.__cyV101Wrapped=true;cyV8Card=wrapped;
}
// Favorites.
if(typeof cyV90FavoriteCard==='function'&&!cyV90FavoriteCard.__cyV101Wrapped){
  const base=cyV90FavoriteCard;
  const wrapped=function(item){return cyV101AppendMap(base.apply(this,arguments),'.cy-v90-fav-actions',item,item)};
  wrapped.__cyV101Wrapped=true;cyV90FavoriteCard=wrapped;
}
// Application cards.
if(typeof cyV93TrackCard==='function'&&!cyV93TrackCard.__cyV101Wrapped){
  const base=cyV93TrackCard;
  const wrapped=function(x){return cyV101AppendMap(base.apply(this,arguments),'.track-actions',x,cyV101Opp(x))};
  wrapped.__cyV101Wrapped=true;cyV93TrackCard=wrapped;
}

function cyV101Stamp(){
  const v=document.getElementById('appVersion');if(v)v.textContent='v'+CY_V101_VERSION;
  const s=document.getElementById('settingsVersion');if(s)s.textContent=CY_V101_VERSION;
}
function cyV101Refresh(){
  try{if(typeof renderRecommendations==='function')renderRecommendations()}catch{}
  try{if(typeof cyV90RenderFavorites==='function')cyV90RenderFavorites()}catch{}
  try{if(typeof cyV94RenderApplications==='function')cyV94RenderApplications()}catch{}
  try{if(typeof cyV94RenderResults==='function')cyV94RenderResults()}catch{}
  cyV101Stamp();
}

// Keep maps/full detail after later state changes and Supabase pulls.
['renderRecommendations','renderTracking','renderSchedule','cyV94RenderApplications','cyV94RenderResults'].forEach(name=>{
  const fn=window[name];if(typeof fn!=='function'||fn.__cyV101RefreshWrapped)return;
  const wrapped=function(){const out=fn.apply(this,arguments);setTimeout(cyV101Stamp,0);return out};wrapped.__cyV101RefreshWrapped=true;window[name]=wrapped;
});

if(document.readyState==='loading')window.addEventListener('DOMContentLoaded',()=>setTimeout(cyV101Refresh,320),{once:true});else setTimeout(cyV101Refresh,320);
