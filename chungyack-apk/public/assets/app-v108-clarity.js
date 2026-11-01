// ChungYack v0.11.0 — one clear notice renderer. Never store applicant data in public assets.
(function(){
'use strict';
const V='0.11.0-live';
const RANK_KEY='chungyack.rank.local.v1';
const escapeHtml=value=>typeof esc==='function'?esc(value):String(value??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const plain=value=>String(value??'').replace(/\s+/g,' ').trim();
function won(amount){
  if(!Number.isFinite(amount))return '미확인';
  if(amount===0)return '없음';
  const eok=Math.floor(amount/100000000);
  const man=Math.floor(amount%100000000/10000);
  const tail=amount%10000;
  const units=[];
  if(eok)units.push(eok.toLocaleString('ko-KR')+'억');
  if(man)units.push(man.toLocaleString('ko-KR')+'만');
  if(tail)units.push(tail.toLocaleString('ko-KR'));
  return units.join(' ')+'원';
}
const offers=item=>Array.isArray(item?.rentDetails?.offers)?item.rentDetails.offers:[];
function finance(item){
  const o=offers(item)[0];
  if(o&&Number.isFinite(o.depositWon)&&Number.isFinite(o.monthlyRentWon)){
    return {deposit:won(o.depositWon),rent:won(o.monthlyRentWon),rentLabel:o.chargeLabel||'월세',
      type:[o.type,o.tier].filter(Boolean).join(' · '),hasPrice:true};
  }
  if(item?.rentDetails?.noFixedPrice){
    return {deposit:'주택별 상이',rent:'주택별 상이',rentLabel:'월 부담액',type:'실제 선택 주택의 계약 조건에 따라 결정',hasPrice:false};
  }
  return {deposit:'미검증',rent:'미검증',rentLabel:'월세',type:'금액 원문 확인 필요',hasPrice:false};
}
if(typeof cyV84Finance==='function'){
  cyV84Finance=function(item){
    const f=finance(item);
    return {deposit:f.hasPrice?f.deposit:'',rent:f.hasPrice?f.rent:'',summary:f.hasPrice?'보증금 '+f.deposit+' · 월 '+f.rent:'',pairs:[]};
  };
}
function readRank(){
  try{
    const obj=JSON.parse(localStorage.getItem(RANK_KEY)||'null');
    if(!obj||typeof obj!=='object')return null;
    const join=String(obj.join||''),paid=Number(obj.paid);
    if(!/^\d{4}-\d{2}-\d{2}$/.test(join)||!Number.isInteger(paid)||paid<0||paid>1000)return null;
    return {join,paid};
  }catch{return null}
}
function rankFor(item){
  const rules=item?.rankRules;
  if(rules?.kind!=='subscription_months')return null;
  const profile=readRank();
  if(!profile)return {rank:0,label:'통장 정보 미입력',reason:'가입일·인정 납입횟수 입력 후 판정'};
  if(profile.join>rules.announcementDate)return {rank:-1,label:'해당 순위 없음',reason:'공고일 이후 가입'};
  for(const rule of rules.options||[]){
    if(profile.join<=rule.latestJoinDate&&profile.paid>=rule.minPayments){
      return {rank:rule.rank,label:rule.rank+'순위',reason:'공고일 기준 통장 조건 충족'};
    }
  }
  return {rank:-1,label:'해당 순위 없음',reason:'통장 가입기간 또는 인정 납입횟수 부족'};
}
function isExpired(item){return !!(item?.applyEnd&&Date.parse(item.applyEnd)<Date.now())}
function status(item){
  if(isExpired(item))return ['closed','접수 마감'];
  const kind=item?.applicationKind||'';
  if(kind==='private')return ['hold','민간임대 · 추천 제외'];
  if(kind==='private-special')return ['hold','신혼부부 전용'];
  if(kind==='special'||kind==='special-secondary')return ['hold','특별자격 필요'];
  if(kind==='unverified-secondary')return ['hold','접수·잔여 재확인'];
  const rank=rankFor(item);
  if(rank&&rank.rank===-1)return ['hold','청약통장 순위 미충족'];
  const now=Date.now();
  if(Array.isArray(item?.applicationWindows)){
    const current=item.applicationWindows.find(x=>now>=Date.parse(x.from)&&now<=Date.parse(x.to));
    if(current)return ['action',current.conditional?'2순위 조건부 접수':'1순위 접수 중'];
    return ['conditional','순위별 접수 예정'];
  }
  if(item?.applyStart&&now<Date.parse(item.applyStart))return ['conditional','접수 예정'];
  if(item?.applyStart&&item?.applyEnd)return ['action','접수 중'];
  return ['conditional','접수 확인'];
}
function dateHtml(item){
  const rules=item?.rankRules;
  const rank=rankFor(item);
  if(rules?.kind==='subscription_months'){
    const slots=(rules.options||[]).map(x=>{
      const matched=rank?.rank===x.rank;
      return '<div class="cy-v110-slot'+(matched?' mine':'')+'"><strong>'+escapeHtml(x.rank+'순위')+'</strong>'+
        '<span>'+escapeHtml(x.when)+'</span>'+(matched?'<em>내 순위</em>':'')+'</div>';
    }).join('');
    return '<div class="cy-v110-date-rows">'+slots+'</div>'+
      '<p class="cy-v110-deadline-note">1순위 마감 시 2순위 접수 없음</p>';
  }
  const raw=plain(item?.applicationPeriodText||'공고문 확인');
  const pieces=raw.split(/\s+·\s+/);
  return '<div class="cy-v110-date-rows">'+pieces.map(piece=>'<div class="cy-v110-date-piece">'+escapeHtml(piece)+'</div>').join('')+'</div>';
}
function rankHtml(item){
  const r=rankFor(item);
  if(r===null)return '';
  const tone=r.rank===1?' primary':r.rank===2?' secondary':r.rank<0?' invalid':' unknown';
  return '<div class="cy-v110-my-rank'+tone+'"><div class="cy-v110-rank-text"><small>내 순위</small>'+
    '<b>'+escapeHtml(r.label)+'</b><span>'+escapeHtml(r.reason)+'</span></div>'+
    '<button type="button" class="cy-v110-rank-edit" data-cy-rank-open="1">'+(r.rank===0?'순위 확인':'정보 수정')+'</button></div>';
}
function priceDetails(item){
  const list=offers(item);
  if(!list.length)return '';
  const rows=list.map(o=>{
    return '<tr><td>'+escapeHtml([o.type,o.tier].filter(Boolean).join(' · '))+'</td>'+
      '<td>'+escapeHtml(won(o.depositWon))+'</td>'+
      '<td>'+escapeHtml(won(o.monthlyRentWon))+(o.chargeLabel==='기숙사비'?' (기숙사비)':'')+'</td></tr>';
  }).join('');
  return '<div class="cy-v110-price-wrap"><table class="cy-v110-price-table"><thead><tr>'+
    '<th>주택형·조건</th><th>보증금</th><th>월 부담액</th></tr></thead><tbody>'+rows+'</tbody></table></div>';
}
function infoDetails(item){
  const list=[];
  const table=priceDetails(item);
  if(table)list.push('<div class="cy-v110-detail-title">주택형별 임대조건 ('+offers(item).length+'개)</div>'+table);
  if(item?.rentDetails?.verification==='secondary-crosscheck'){
    list.push('<p class="cy-v110-review-note">공개 공급표 교차확인 금액 · 공식 첨부 PDF 원문 재검증 필요</p>');
  }
  const check=plain(item?.eligibility?.check);
  if(check)list.push('<div><b>신청 자격·확인 사항</b><p>'+escapeHtml(check)+'</p></div>');
  const next=plain(item?.next);
  if(next){
    const steps=next.split(/\s*→\s*/).filter(Boolean);
    list.push('<div><b>발표·서류·계약</b>'+steps.map(s=>'<p>'+escapeHtml(s)+'</p>').join('')+'</div>');
  }
  const source=plain(item?.rentDetails?.sourceType);
  if(source)list.push('<div><b>임대료 근거</b><p>'+escapeHtml(source)+'</p></div>');
  if(!list.length)return '';
  return '<details class="cy-v110-details"><summary>주택형별 가격·자격·일정</summary>'+
    '<div class="cy-v110-details-body">'+list.join('')+'</div></details>';
}
function note(item,f){
  if(item?.rentDetails?.verification==='secondary-crosscheck')return '금액은 교차확인 · 공식 원문 대조 전';
  if(item?.applicationKind==='private')return '관리비·보증료 별도 · 추천 제외';
  if(item?.applicationKind==='private-special')return '신혼부부 특별공급 · 청년 단독 신청 불가';
  if(item?.applicationKind==='unverified-secondary')return '실제 잔여·접수 상태 재확인 필요';
  if(!f.hasPrice)return '주택별 계약 조건에 따라 금액 상이';
  return '';
}
function shortAgency(item){
  const agency=plain(item?.agency);
  if(/운영기관.*어울리/.test(agency))return '어울리';
  if(/LH/.test(agency))return 'LH';
  if(/^SH/.test(agency))return 'SH';
  if(/GH/.test(agency))return 'GH';
  return '';
}
cyV8Card=function(item){
  const id=escapeHtml(item?.id||''),saved=CY_V7_SAVED.has(item.id),hidden=CY_V7_HIDDEN.has(item.id);
  const tracked=typeof cyV7IsTracked==='function'&&cyV7IsTracked(item);
  const f=finance(item),state=status(item),level=typeof cyV8Level==='function'?cyV8Level(item):'hold';
  const rank=rankFor(item);
  const address=Array.isArray(item.addresses)?plain(item.addresses.find(Boolean)):'';
  const map=address?'https://map.naver.com/p/search/'+encodeURIComponent(address):'';
  const category=plain(item.category).replace(/토지지원리츠\s*/g,'').replace(/·청년/g,'').replace(/공공지원민간임대/g,'민간임대');
  const canTrack=level!=='impossible'&&level!=='hold'&&!isExpired(item)&&(!rank||rank.rank>0);
  const caution=note(item,f);
  return '<article class="cy-v8-card cy-v108-card cy-v110-card '+escapeHtml(level)+(saved?' is-saved':'')+
    (hidden?' is-hidden':'')+'" data-cy-v82-card-id="'+id+'">'+
    '<div class="cy-v108-top"><span class="cy-v108-status '+escapeHtml(state[0])+'">'+escapeHtml(state[1])+'</span>'+
      '<button class="cy-v8-hide" data-cy-v8-hide="'+id+'">'+(hidden?'복원':'숨기기')+'</button></div>'+
    '<h3 class="cy-v8-title">'+escapeHtml(plain(item.name).replace(/_/g,' · '))+'</h3>'+
    '<div class="cy-v108-meta">'+escapeHtml([item.region,shortAgency(item),category].filter(Boolean).join(' · '))+'</div>'+
    '<div class="cy-v110-facts">'+
      '<div class="cy-v110-full cy-v110-date"><small>접수</small>'+dateHtml(item)+'</div>'+
      '<div class="cy-v110-full cy-v110-units"><small>모집</small><b>'+escapeHtml(item.summaryUnits||'공급 규모 확인')+'</b></div>'+
      '<div class="cy-v110-money"><small>보증금</small><b>'+escapeHtml(f.deposit)+'</b></div>'+
      '<div class="cy-v110-money"><small>'+escapeHtml(f.rentLabel)+'</small><b>'+escapeHtml(f.rent)+'</b></div>'+
    '</div>'+
    (f.type?'<div class="cy-v110-type">'+escapeHtml(f.type)+' 기준</div>':'')+
    rankHtml(item)+
    (caution?'<p class="cy-v108-note">'+escapeHtml(caution)+'</p>':'')+
    infoDetails(item)+
    '<div class="cy-v8-actions cy-v108-actions cy-v110-actions">'+
      '<button class="btn cy-v8-save'+(saved?' on':'')+'" data-cy-v8-save="'+id+'">'+(saved?'♥ 찜함':'♡ 찜')+'</button>'+
      (item.source?'<a class="btn" href="'+escapeHtml(item.source)+'" target="_blank" rel="noopener">공고</a>':'')+
      (canTrack?'<button class="btn cy-v8-track'+(tracked?' on':'')+'" data-opportunity-id="'+id+'" title="실제로 신청한 뒤에만 등록">'+(tracked?'신청 기록됨':'신청했음')+'</button>':'')+
      (map?'<a class="btn cy-v101-map-action" href="'+escapeHtml(map)+'" target="_blank" rel="noopener">지도</a>':'')+
    '</div></article>';
};
if(typeof cyV8Toolbar==='function'){
  const base=cyV8Toolbar;
  cyV8Toolbar=function(rows){
    const all=Array.isArray(CY_OPPORTUNITY_DATA?.items)?CY_OPPORTUNITY_DATA.items.filter(x=>!isExpired(x)):[];
    const pub=all.filter(x=>x.applicationKind==='public').length;
    const priv=all.filter(x=>/^private/.test(x.applicationKind||'')).length;
    const special=all.length-pub-priv;
    return '<div class="cy-v110-count-head"><strong>현재·예정 공고 '+all.length+'건</strong>'+
      '<span>공공 '+pub+' · 특별자격 '+special+' · 민간(비추천) '+priv+'</span></div>'+
      base(rows);
  };
}
// Existing level filters remain functional, but the first view must show the full live catalogue.
if(typeof CY_V7_LEVEL!=='undefined')CY_V7_LEVEL='all';
function openRankDialog(){
  let dialog=document.getElementById('cyRankDialog');
  if(!dialog){
    dialog=document.createElement('dialog');dialog.id='cyRankDialog';dialog.className='cy-v110-dialog';
    dialog.innerHTML='<form id="cyRankForm"><div class="cy-v110-dialog-head"><h3>내 청약 순위 확인</h3>'+
      '<button type="button" data-cy-rank-close aria-label="닫기">×</button></div>'+
      '<p>구리갈매 S1 · 2026년 10월 22일 공고일 기준</p>'+
      '<label>청약통장 가입일<input name="joined" type="date" required></label>'+
      '<label>인정 납입횟수<input name="paid" type="number" min="0" max="1000" step="1" inputmode="numeric" required placeholder="예: 24"></label>'+
      '<p class="cy-v110-dialog-foot">통장 조건으로만 순위를 계산합니다. 무주택세대구성원 등 나머지 자격은 공식 공고에서 최종 확인하세요. 입력값은 이 기기에만 저장합니다.</p>'+
      '<div class="cy-v110-dialog-buttons"><button type="button" data-cy-rank-clear>정보 삭제</button>'+
      '<button type="submit">순위 계산·저장</button></div></form>';
    document.body.appendChild(dialog);
    const form=dialog.querySelector('form');
    form.addEventListener('submit',ev=>{
      ev.preventDefault();
      const joined=form.elements.joined.value;
      const paid=Number(form.elements.paid.value);
      if(!/^\d{4}-\d{2}-\d{2}$/.test(joined)||!Number.isInteger(paid)||paid<0)return;
      localStorage.setItem(RANK_KEY,JSON.stringify({join:joined,paid}));
      dialog.close();renderRecommendations();
    });
    dialog.addEventListener('click',ev=>{
      if(ev.target.closest('[data-cy-rank-close]'))dialog.close();
      if(ev.target.closest('[data-cy-rank-clear]')){
        localStorage.removeItem(RANK_KEY);dialog.close();renderRecommendations();
      }
    });
  }
  const v=readRank();
  dialog.querySelector('[name="joined"]').value=v?.join||'';
  dialog.querySelector('[name="paid"]').value=v?.paid??'';
  if(!dialog.open)dialog.showModal();
}
document.addEventListener('click',event=>{
  if(event.target.closest('[data-cy-rank-open]'))openRankDialog();
});
window.CY_LATEST_VERSION=V;
const refresh=()=>{
  try{renderRecommendations()}catch(err){console.error('[ChungYack] opportunity cards',err)}
  for(const id of ['appVersion','settingsVersion']){const el=document.getElementById(id);if(el)el.textContent='v'+V}
};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',refresh,{once:true});else refresh();
})();