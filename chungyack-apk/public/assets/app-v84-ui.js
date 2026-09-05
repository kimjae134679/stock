// v0.8.4 live: deposit + monthly rent surfaced across home/cards/details/long-press.
const CY_V84_VERSION='0.8.4-live';

function cyV84Text(item){
  if(!item)return '';
  return [
    item.deposit,item.depositText,item.rent,item.rentText,item.monthlyRent,item.monthlyRentText,
    item?.rental?.deposit,item?.rental?.rent,item?.rental?.monthlyRent,item?.rentTerms,
    item?.eligibility?.reason,item?.eligibility?.check,item?.next
  ].filter(Boolean).join(' · ');
}
function cyV84CleanMoney(v){
  return String(v||'').replace(/\s+/g,' ').replace(/^[\s:：-]+|[\s,.;]+$/g,'').trim();
}
function cyV84Finance(item){
  if(!item)return {deposit:'',rent:'',summary:'',pairs:[]};
  const explicitDeposit=cyV84CleanMoney(item.depositText||item.deposit||item?.rental?.deposit||'');
  const explicitRent=cyV84CleanMoney(item.monthlyRentText||item.rentText||item.monthlyRent||item.rent||item?.rental?.monthlyRent||item?.rental?.rent||'');
  const text=cyV84Text(item);
  const pairs=[];
  const pairRe=/보증금\s*([0-9][0-9,\.\s]*(?:억|천|백|만)?(?:원|만원|억원)?)\s*[\/·,]?\s*월(?:세|\s*임대료)?\s*([0-9][0-9,\.\s]*(?:천|백|만)?(?:원|만원)?)/g;
  let m;
  while((m=pairRe.exec(text))&&pairs.length<4){
    const d=cyV84CleanMoney(m[1]),r=cyV84CleanMoney(m[2]);
    if(d&&r&&!pairs.some(x=>x.deposit===d&&x.rent===r))pairs.push({deposit:d,rent:r});
  }
  let deposit=explicitDeposit||pairs[0]?.deposit||'';
  let rent=explicitRent||pairs[0]?.rent||'';
  if(!deposit){const d=text.match(/보증금\s*([0-9][0-9,\.\s]*(?:억|천|백|만)?(?:원|만원|억원)?)/);if(d)deposit=cyV84CleanMoney(d[1])}
  if(!rent){const r=text.match(/월(?:세|\s*임대료)?\s*([0-9][0-9,\.\s]*(?:천|백|만)?(?:원|만원)?)/);if(r)rent=cyV84CleanMoney(r[1])}
  const summary=deposit||rent?`${deposit?`보증금 ${deposit}`:''}${deposit&&rent?' · ':''}${rent?`월 ${rent}`:''}`:'';
  return {deposit,rent,summary,pairs};
}
function cyV84FinanceRow(item){
  const f=cyV84Finance(item);
  const deposit=f.deposit||'공고문 확인 필요';
  const rent=f.rent||'공고문 확인 필요';
  const extra=f.pairs.length>1?`<small class="cy-v84-variants">호실·타입별 임대조건 ${f.pairs.length}개 확인</small>`:'';
  return `<div class="cy-v84-finance-row">
    <div><span>💰 보증금</span><strong>${esc(deposit)}</strong></div>
    <div><span>🏠 월세</span><strong>${esc(rent)}</strong></div>${extra}
  </div>`;
}
function cyV84FindOpp(name){return typeof cyV82FindOpportunity==='function'?cyV82FindOpportunity(name):null}

// Card: put rent/deposit with other critical facts, without replacing existing schedule UI.
const _cyV84Card=cyV8Card;
cyV8Card=function(item){
  let html=_cyV84Card(item);
  const row=cyV84FinanceRow(item);
  const resultMarker='<div class="cy-v82-result-row">';
  const deadlineMarker='<div class="cy-v8-detail-row deadline">';
  if(html.includes(resultMarker))html=html.replace(resultMarker,row+resultMarker);
  else if(html.includes(deadlineMarker))html=html.replace(deadlineMarker,row+deadlineMarker);
  else html=html.replace('<div class="cy-v8-actions">',row+'<div class="cy-v8-actions">');
  return html;
};

// Home list: one compact finance summary under status.
const _cyV84HomeRow=cyV83HomeRow;
cyV83HomeRow=function(x){
  let html=_cyV84HomeRow(x);
  const opp=cyV84FindOpp(x?.name||'');
  const f=cyV84Finance(opp);
  const finance=f.summary?`<em class="cy-v84-home-finance">💰 ${esc(f.summary)}</em>`:'<em class="cy-v84-home-finance muted">💰 임대료 공고문 확인 필요</em>';
  const result='<em class="cy-v82-home-result">';
  if(html.includes(result))html=html.replace(result,finance+result);
  else html=html.replace('<i>상세 보기 ›</i>',finance+'<i>상세 보기 ›</i>');
  return html;
};

// Detail dialog: add dedicated deposit/rent tiles.
const _cyV84OpenHomeDetail=cyV82OpenHomeDetail;
cyV82OpenHomeDetail=function(name){
  _cyV84OpenHomeDetail(name);
  const opp=cyV84FindOpp(name);
  const f=cyV84Finance(opp);
  const body=document.querySelector('#cyV82NoticeDialog #cyV82DialogBody');
  const grid=body?.querySelector('.cy-v82-dialog-grid');
  if(!body||!grid||body.querySelector('.cy-v84-dialog-finance'))return;
  const block=document.createElement('div');
  block.className='cy-v84-dialog-finance';
  block.innerHTML=`<div><small>💰 보증금</small><strong>${esc(f.deposit||'공고문 확인 필요')}</strong></div><div><small>🏠 월세</small><strong>${esc(f.rent||'공고문 확인 필요')}</strong></div>${f.pairs.length>1?`<p>호실·타입별 임대조건이 여러 개입니다. 공식 공고에서 선택 가능한 조건을 확인하세요.</p>`:''}`;
  grid.insertAdjacentElement('afterend',block);
};

// Long press sheet: show finance at top so it is visible before choosing an action.
const _cyV84OpenActionSheet=cyV83OpenActionSheet;
cyV83OpenActionSheet=function(ctx){
  _cyV84OpenActionSheet(ctx);
  const name=ctx?.type==='home'?ctx.name:(ctx?.item?.name||'');
  const opp=ctx?.type==='home'?cyV84FindOpp(name):ctx?.item;
  const f=cyV84Finance(opp);
  const panel=document.querySelector('#cyV83ActionSheet #cyV83SheetPanel');
  const head=panel?.querySelector('.cy-v83-sheet-head');
  if(!panel||!head||panel.querySelector('.cy-v84-sheet-finance'))return;
  const div=document.createElement('div');
  div.className='cy-v84-sheet-finance';
  div.innerHTML=`<span>💰 ${esc(f.deposit?`보증금 ${f.deposit}`:'보증금 확인 필요')}</span><span>🏠 ${esc(f.rent?`월 ${f.rent}`:'월세 확인 필요')}</span>`;
  head.insertAdjacentElement('afterend',div);
};

const _cyV84RenderHero=renderHero;
renderHero=function(){_cyV84RenderHero();const v=document.getElementById('appVersion');if(v)v.textContent='v'+CY_V84_VERSION};
const _cyV84RenderSettings=renderSettings;
renderSettings=function(){_cyV84RenderSettings();const v=document.getElementById('settingsVersion');if(v)v.textContent=CY_V84_VERSION};
window.addEventListener('DOMContentLoaded',()=>{
  const v=document.getElementById('appVersion');if(v)v.textContent='v'+CY_V84_VERSION;
  const s=document.getElementById('settingsVersion');if(s)s.textContent=CY_V84_VERSION;
});
