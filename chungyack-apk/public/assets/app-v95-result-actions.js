// v0.9.5 live: result hub quick classification + official check links.
const CY_V95_VERSION='0.9.5-live';

function cyV95OppForTrack(x){
  try{if(typeof cyV93Opp==='function')return cyV93Opp(x?.name||'')}catch{}
  try{if(typeof CY_OPPORTUNITY_DATA!=='undefined'&&Array.isArray(CY_OPPORTUNITY_DATA?.items)){
    const n=String(x?.name||'').replace(/청년안심주택|추가모집|최초모집|모집공고/g,'').replace(/\s+/g,'').toLowerCase();
    return CY_OPPORTUNITY_DATA.items.find(o=>{
      const on=String(o?.name||'').replace(/청년안심주택|추가모집|최초모집|모집공고/g,'').replace(/\s+/g,'').toLowerCase();
      return on&&n&&(on.includes(n)||n.includes(on));
    })||null;
  }}catch{}
  return null;
}
function cyV95OfficialUrl(x){
  try{const m=typeof cyV94Milestone==='function'?cyV94Milestone(x):null;if(m?.source)return m.source}catch{}
  const o=cyV95OppForTrack(x);return o?.source||o?.officialUrl||o?.url||'';
}
function cyV95OverrideCategory(x){
  if(x?.resultOverride==='check')return 'check';
  if(x?.resultOverride==='selected')return 'selected';
  if(x?.resultOverride==='rejected')return 'rejected';
  return null;
}
if(typeof cyV94Category==='function'&&!cyV94Category.__cyV95Wrapped){
  const base=cyV94Category;
  const wrapped=function(x){return cyV95OverrideCategory(x)||base(x)};
  wrapped.__cyV95Wrapped=true;cyV94Category=wrapped;
}

function cyV95SetResult(id,state){
  const x=(Array.isArray(TRACKING)?TRACKING:[]).find(v=>String(v.id)===String(id));if(!x)return;
  if(state==='check'){x.resultOverride='check';x.status='결과확인 필요';x.statusIcon='🎯'}
  if(state==='pass'){x.resultOverride='selected';x.status='당첨';x.statusIcon='✅'}
  if(state==='wait'){x.resultOverride='selected';x.status='예비';x.statusIcon='✅'}
  if(state==='reject'){x.resultOverride='rejected';x.status='탈락';x.statusIcon='⛔'}
  x.resultOverrideAt=new Date().toISOString();
  if(typeof saveTracking==='function')saveTracking();
  try{if(typeof renderTracking==='function')renderTracking()}catch{}
  try{if(typeof cyV94RenderResults==='function')cyV94RenderResults()}catch{}
  try{if(typeof cyV94RenderApplications==='function')cyV94RenderApplications()}catch{}
  try{if(typeof renderHero==='function')renderHero()}catch{}
  if(typeof cyToast==='function')cyToast(state==='pass'?'합격으로 이동했습니다.':state==='wait'?'예비로 이동했습니다.':state==='reject'?'탈락으로 이동했습니다.':'확인 필요로 이동했습니다.');
}

function cyV95ActionsHtml(x){
  const url=cyV95OfficialUrl(x),status=String(x?.status||'');
  return `<div class="cy-v95-result-actions">
    ${url?`<a class="cy-v95-official" href="${cyV94Esc(url)}" target="_blank" rel="noopener">공식 확인 ↗</a>`:'<span class="cy-v95-no-link">공식 링크 없음</span>'}
    <div class="cy-v95-move-row">
      <button type="button" data-cy-v95-state="check" data-id="${cyV94Esc(x.id)}" class="${x?.resultOverride==='check'?'on':''}">확인 필요</button>
      <button type="button" data-cy-v95-state="pass" data-id="${cyV94Esc(x.id)}" class="${status==='당첨'?'on':''}">합격</button>
      <button type="button" data-cy-v95-state="wait" data-id="${cyV94Esc(x.id)}" class="${status==='예비'?'on':''}">예비</button>
      <button type="button" data-cy-v95-state="reject" data-id="${cyV94Esc(x.id)}" class="danger ${x?.resultOverride==='rejected'||status==='탈락'?'on':''}">탈락</button>
    </div>
  </div>`;
}

if(typeof cyV94ResultCard==='function'&&!cyV94ResultCard.__cyV95Wrapped){
  const base=cyV94ResultCard;
  const wrapped=function(x){const html=base(x);return html.replace(/<\/article>\s*$/,`${cyV95ActionsHtml(x)}</article>`)};
  wrapped.__cyV95Wrapped=true;cyV94ResultCard=wrapped;
}

function cyV95Wire(){
  const page=document.querySelector('.page[data-page="recommend"]');if(!page)return;
  page.querySelectorAll('[data-cy-v95-state]').forEach(btn=>btn.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();cyV95SetResult(btn.dataset.id,btn.dataset.cyV95State)}));
}
if(typeof cyV94RenderResults==='function'&&!cyV94RenderResults.__cyV95Wrapped){
  const base=cyV94RenderResults;
  const wrapped=function(){const out=base.apply(this,arguments);cyV95Wire();const v=document.getElementById('appVersion');if(v)v.textContent='v'+CY_V95_VERSION;const s=document.getElementById('settingsVersion');if(s)s.textContent=CY_V95_VERSION;return out};
  wrapped.__cyV95Wrapped=true;cyV94RenderResults=wrapped;
}
function cyV95Boot(){try{if(typeof cyV94RenderResults==='function')cyV94RenderResults()}catch(e){console.warn('[ChungYack] v0.9.5 result actions failed',e)}const v=document.getElementById('appVersion');if(v)v.textContent='v'+CY_V95_VERSION;const s=document.getElementById('settingsVersion');if(s)s.textContent=CY_V95_VERSION;}
if(document.readyState==='loading')window.addEventListener('DOMContentLoaded',cyV95Boot,{once:true});else setTimeout(cyV95Boot,0);
