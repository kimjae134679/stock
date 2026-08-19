/* Market Radar v11 safe additive layer. No core renderer replacement. */
(function(){
  'use strict';

  const FAMOUS = [
    ['MSFT','마이크로소프트'],['AAPL','애플'],['NVDA','엔비디아'],['AMZN','아마존'],['GOOGL','알파벳'],['META','메타'],['TSLA','테슬라'],
    ['AMD','AMD'],['AVGO','브로드컴'],['PLTR','팔란티어'],['TSM','TSMC'],['CPNG','쿠팡'],['ANET','아리스타 네트웍스'],['ORCL','오라클'],['NFLX','넷플릭스'],['COST','코스트코']
  ];

  const COMPOUNDERS = [
    ['ANET','아리스타 네트웍스','AI 네트워크 성장 + 높은 마진','밸류·대형고객 집중'],
    ['QQQ','인베스코 QQQ','대형 성장주 자동 교체형 장기 코어','기술주 집중·고금리'],
    ['MSFT','마이크로소프트','클라우드·오피스 반복매출 + AI','CAPEX·규제·밸류'],
    ['AVGO','브로드컴','AI 반도체·네트워크 + 강한 FCF','고객집중·AI CAPEX'],
    ['COST','코스트코','회원제·가격경쟁력·높은 재구매','높은 밸류'],
    ['V','비자','글로벌 전자결제 네트워크 효과','규제·수수료 압박'],
    ['MA','마스터카드','전자결제 구조성장 + 높은 마진','규제·경기'],
    ['SPGI','S&P 글로벌','지수·신용평가·데이터 반복매출','발행시장·규제'],
    ['MCO','무디스','신용평가·데이터 진입장벽','회사채 발행 사이클'],
    ['CTAS','신타스','반복 계약·높은 자본효율','밸류·고용경기'],
    ['PWR','콴타 서비스','전력망·데이터센터 인프라 구조수혜','프로젝트·인력비'],
    ['ETN','이튼','전기화·배전·전력품질 병목','밸류·산업 CAPEX'],
    ['WM','웨이스트 매니지먼트','필수서비스·지역 진입장벽','인수·규제'],
    ['RSG','리퍼블릭 서비스','반복수요·안정 현금흐름','비용·규제'],
    ['ORLY','오라일리 오토모티브','애프터마켓·높은 자본효율','밸류·EV 전환'],
    ['AZO','오토존','경기방어 애프터마켓 + 자사주','밸류·EV 전환'],
    ['VGT','뱅가드 정보기술 ETF','미국 기술 대형주 분산','상위종목 집중'],
    ['XLK','기술주 섹터 ETF','S&P 기술 대형주 품질','상위종목 집중'],
    ['SCHG','미국 대형 성장 ETF','대형 성장주 폭넓은 분산','성장주 금리민감']
  ];

  const EXTRA_TV = {
    MSFT:'NASDAQ:MSFT',AAPL:'NASDAQ:AAPL',AMZN:'NASDAQ:AMZN',META:'NASDAQ:META',TSLA:'NASDAQ:TSLA',AMD:'NASDAQ:AMD',AVGO:'NASDAQ:AVGO',PLTR:'NASDAQ:PLTR',
    TSM:'NYSE:TSM',CPNG:'NYSE:CPNG',ANET:'NYSE:ANET',ORCL:'NYSE:ORCL',NFLX:'NASDAQ:NFLX',COST:'NASDAQ:COST',V:'NYSE:V',MA:'NYSE:MA',SPGI:'NYSE:SPGI',MCO:'NYSE:MCO',CTAS:'NASDAQ:CTAS',WM:'NYSE:WM',RSG:'NYSE:RSG',ORLY:'NASDAQ:ORLY',AZO:'NYSE:AZO',VGT:'AMEX:VGT',XLK:'AMEX:XLK',SCHG:'AMEX:SCHG'
  };

  function esc(v){ return String(v == null ? '' : v).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }
  function list(v){ return Array.isArray(v) ? v : []; }
  function data(){ try{return D || {}}catch(_){return {}} }
  function pick(t){ return list(data().top_picks).find(x=>x && x.ticker===t); }

  try { Object.assign(TV, EXTRA_TV); } catch(_) {}

  function fallbackChartHtml(ticker){
    const encoded=encodeURIComponent(ticker);
    const isKr=/^\d{6}$/.test(ticker);
    const img=isKr ? '' : `<img class="mr-alt-chart-img" loading="lazy" alt="${esc(ticker)} 대체 가격차트" src="https://charts2.finviz.com/chart.ashx?t=${encoded}&ty=c&ta=1&p=d&s=l">`;
    const google=isKr ? `https://www.google.com/finance/quote/${encoded}:KRX` : `https://www.google.com/finance/quote/${encoded}:NYSE`;
    return `<div class="mr-chart-fallback" data-mr-fallback="${esc(ticker)}">${img}<div class="mr-chart-links"><a target="_blank" rel="noopener" href="${google}">Google Finance</a><a target="_blank" rel="noopener" href="https://www.tradingview.com/search/?query=${encoded}">TradingView</a></div><small>기본 차트가 비거나 늦으면 이 대체차트를 사용. 오늘 시간별 내부 그래프는 상세창 아래에 별도로 유지됩니다.</small></div>`;
  }

  function armChartFallback(root){
    (root||document).querySelectorAll('.tvwrap').forEach(wrap=>{
      if(wrap.dataset.mrFallback==='1') return;
      wrap.dataset.mrFallback='1';
      const iframe=wrap.querySelector('iframe');
      if(!iframe) return;
      const title=iframe.getAttribute('title')||'';
      const ticker=(title.match(/^([^ ]+)/)||[])[1] || 'QQQ';
      const box=document.createElement('details');
      box.className='mr-alt-chart';
      box.innerHTML=`<summary>다른 차트</summary>${fallbackChartHtml(ticker)}`;
      wrap.insertAdjacentElement('afterend',box);
      let loaded=false;
      iframe.addEventListener('load',()=>{loaded=true},{once:true});
      iframe.addEventListener('error',()=>{box.open=true},{once:true});
      setTimeout(()=>{ if(!loaded) box.open=true; },8000);
    });
  }

  function openCoverageSafe(ticker,name){
    try{
      const p=pick(ticker);
      if(p && typeof openPick==='function') return openPick(ticker);
      if(typeof openCoverage==='function') return openCoverage(ticker,name);
    }catch(_){}
    const chart = (typeof tvFrame==='function') ? tvFrame(ticker) : fallbackChartHtml(ticker);
    if(typeof showModal==='function') showModal(`${ticker} — ${name||ticker}`,'핵심 추적 종목',`<div class="detailblock"><h4>실제 주가 차트</h4>${chart}</div><div class="detailblock"><h4>상태</h4><div>최신 자동분석에서 세부 점수·실적을 채우는 추적 대상입니다.</div></div>`);
  }

  function addFamousAndCompounderBoards(){
    if(document.getElementById('mr-famous')) return;
    const anchor=document.getElementById('coverage-groups') || document.getElementById('picks');
    if(!anchor) return;

    const famous=document.createElement('section');
    famous.className='sec'; famous.id='mr-famous';
    famous.innerHTML=`<div class="sectionhead"><div><h2>🌟 유명·초대형 핵심주</h2><div class="muted">Mag7 + 시장에서 자주 보는 핵심 성장주를 항상 별도 표시.</div></div></div><div class="mr-famous-grid">${FAMOUS.map(([t,n])=>{const p=pick(t);return `<button type="button" class="mr-stock-chip" data-mr-ticker="${esc(t)}" data-mr-name="${esc(n)}"><span><b>${esc(t)}</b><small>${esc(n)}</small></span><em>${p?esc(p.score):'추적'}</em><i>터치</i></button>`}).join('')}</div>`;
    anchor.insertAdjacentElement('afterend',famous);

    const quality=document.createElement('section');
    quality.className='sec'; quality.id='mr-compounders';
    quality.innerHTML=`<div class="sectionhead"><div><h2>📈 장기 복리·우상향 품질 후보</h2><div class="muted">“안 떨어지는 주식”이 아니라 장기 추세·실적·현금흐름·회복력을 같이 보는 후보군.</div></div></div><div class="mr-rule-pills"><span>5Y+ 추세</span><span>200DMA</span><span>매출·EPS·FCF</span><span>낙폭·회복</span><span>ROIC·마진</span><span>상대강도</span><span>추정치</span></div><div class="mr-compound-grid">${COMPOUNDERS.map(([t,n,why,risk])=>{const p=pick(t);return `<article class="mr-compound-card" role="button" tabindex="0" data-mr-ticker="${esc(t)}" data-mr-name="${esc(n)}"><div><b>${esc(t)} — ${esc(n)}</b><em>${p?`현재 ${esc(p.timing)}`:'추적'}</em></div><p>${esc(why)}</p><small>위험: ${esc(risk)}</small><i>터치</i></article>`}).join('')}</div>`;
    famous.insertAdjacentElement('afterend',quality);

    const nav=document.querySelector('.quicknav');
    if(nav && !nav.querySelector('[data-mr-nav="famous"]')){
      const picksBtn=[...nav.querySelectorAll('button')].find(b=>b.textContent.trim()==='종목');
      const b1=document.createElement('button');b1.className='pill';b1.dataset.mrNav='famous';b1.textContent='대표주';b1.onclick=()=>document.getElementById('mr-famous')?.scrollIntoView({behavior:'smooth',block:'start'});
      const b2=document.createElement('button');b2.className='pill';b2.dataset.mrNav='compound';b2.textContent='우상향';b2.onclick=()=>document.getElementById('mr-compounders')?.scrollIntoView({behavior:'smooth',block:'start'});
      if(picksBtn){picksBtn.insertAdjacentElement('afterend',b2);picksBtn.insertAdjacentElement('afterend',b1)} else {nav.append(b1,b2)}
    }
  }

  function makeCollapsible(sec){
    if(!sec || sec.dataset.mrCollapse==='1' || sec.id==='market') return;
    const head=sec.querySelector(':scope > .sectionhead') || sec.querySelector(':scope > h2');
    if(!head) return;
    sec.dataset.mrCollapse='1';
    const body=document.createElement('div'); body.className='mr-collapse-body';
    [...sec.children].filter(x=>x!==head).forEach(x=>body.appendChild(x));
    sec.appendChild(body);
    const btn=document.createElement('button');btn.type='button';btn.className='mr-collapse-btn';
    const id=sec.id||Math.random().toString(36).slice(2);
    const key='mr-collapse-'+id;
    const defaultClosed=['expanded','research','history','false-positive-replay','macro','sources'].includes(sec.id);
    let open=!defaultClosed;
    try{const s=localStorage.getItem(key);if(s!==null)open=s==='1'}catch(_){}
    const apply=()=>{body.hidden=!open;btn.textContent=open?'접기':'펼치기';btn.setAttribute('aria-expanded',String(open));try{localStorage.setItem(key,open?'1':'0')}catch(_){}};
    btn.onclick=()=>{open=!open;apply()};
    if(head.classList && head.classList.contains('sectionhead')) head.appendChild(btn); else head.insertAdjacentElement('afterend',btn);
    apply();
  }

  function installCollapsibles(){ document.querySelectorAll('section.sec').forEach(makeCollapsible); }

  function compressTouch(root){
    (root||document).querySelectorAll('.detailhint').forEach(x=>x.textContent='터치');
    const walker=document.createTreeWalker(root||document.body,NodeFilter.SHOW_TEXT);
    const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
    nodes.forEach(n=>{const s=(n.nodeValue||'').trim();if(/^터치\s*(?:→|->|>|-)/.test(s)) n.nodeValue=n.nodeValue.replace(/터치\s*(?:→|->|>|-).*$/,'터치');});
  }

  function patchETF(){
    if(typeof openETF==='function' && !openETF.__mrSafe){
      const base=openETF;
      const wrapped=function(kind,id){
        const before=document.getElementById('modal')?.classList.contains('open');
        try{base(kind,id)}catch(_){}
        setTimeout(()=>{
          const modal=document.getElementById('modal');
          if(!modal || modal.classList.contains('open') || before) return;
          const all=list(data().etf_lists?.[kind]); const x=all.find(v=>(v.ticker||v.code)===id);
          const name=x?.name||'ETF'; const chart=kind==='us'&&typeof tvFrame==='function'?tvFrame(id):'';
          if(typeof showModal==='function') showModal(`${id} — ${name}`,'ETF 상세',`${chart?`<div class="detailblock"><h4>실제 ETF 차트</h4>${chart}</div>`:''}<div class="detailblock"><h4>상태</h4><div>${x?'세부 데이터 일부를 불러오지 못해 기본 상세로 표시합니다.':'현재 테마 추적 목록에는 있으나 상세 데이터는 다음 자동 갱신에서 보강합니다.'}</div></div>`);
        },30);
      };
      wrapped.__mrSafe=true;
      try{openETF=wrapped}catch(_){try{window.openETF=wrapped}catch(__){}}
    }

    if(typeof openExpanded==='function' && !openExpanded.__mrSafe){
      const baseExp=openExpanded;
      const wrappedExp=function(key){
        try{baseExp(key)}catch(_){}
        setTimeout(()=>{
          const x=list(data().expanded_themes).find(v=>v.key===key); if(!x) return;
          const target=document.getElementById('modalBody'); if(!target || target.querySelector('.mr-related-etfs')) return;
          const ids=[...list(x.us_etfs).map(id=>['us',id]),...list(x.kr_etfs).map(id=>['kr',id])]; if(!ids.length)return;
          const d=document.createElement('div');d.className='detailblock mr-related-etfs';d.innerHTML=`<h4>관련 ETF</h4><div class="mr-etf-buttons">${ids.map(([k,id])=>`<button type="button" data-mr-etf-kind="${k}" data-mr-etf-id="${esc(id)}">${esc(id)} · 터치</button>`).join('')}</div>`;target.appendChild(d);
        },20);
      };
      wrappedExp.__mrSafe=true;
      try{openExpanded=wrappedExp}catch(_){try{window.openExpanded=wrappedExp}catch(__){}}
    }
  }

  function repairCards(){
    document.querySelectorAll('.etfcard').forEach(card=>{
      if(card.dataset.mrRepair==='1') return; card.dataset.mrRepair='1';
      card.addEventListener('click',()=>{
        setTimeout(()=>{
          const modal=document.getElementById('modal'); if(modal?.classList.contains('open')) return;
          const text=card.textContent||'';
          for(const kind of ['us','kr']){
            const x=list(data().etf_lists?.[kind]).find(v=>text.includes(String(v.ticker||v.code)));
            if(x && typeof openETF==='function'){openETF(kind,x.ticker||x.code);return;}
          }
        },40);
      });
    });
  }

  function bindEvents(){
    document.addEventListener('click',ev=>{
      const stock=ev.target.closest('[data-mr-ticker]');
      if(stock){ev.preventDefault();openCoverageSafe(stock.dataset.mrTicker,stock.dataset.mrName);return;}
      const etf=ev.target.closest('[data-mr-etf-kind]');
      if(etf){ev.preventDefault();if(typeof openETF==='function')openETF(etf.dataset.mrEtfKind,etf.dataset.mrEtfId);}
    });
    document.addEventListener('keydown',ev=>{
      if((ev.key==='Enter'||ev.key===' ') && ev.target.matches('[data-mr-ticker]')){ev.preventDefault();openCoverageSafe(ev.target.dataset.mrTicker,ev.target.dataset.mrName);}
    });
  }

  function patchModalObserver(){
    const modal=document.getElementById('modalBody'); if(!modal)return;
    const mo=new MutationObserver(()=>{compressTouch(modal);armChartFallback(modal);});
    mo.observe(modal,{childList:true,subtree:true});
  }

  function install(){
    if(!document.querySelector('#app .sec')) return false;
    addFamousAndCompounderBoards();
    installCollapsibles();
    compressTouch(document.body);
    patchETF();
    repairCards();
    armChartFallback(document);
    return true;
  }

  bindEvents();
  patchModalObserver();
  let tries=0;const timer=setInterval(()=>{tries++;if(install()||tries>100)clearInterval(timer)},150);
})();