/* Market Radar v15 post-render integrity layer.
   Purpose: after the core renderer replaces the static first-paint, restore every additive board,
   repair schema aliases, and keep click/collapse behavior from disappearing after a rollback. */
(function(){
  'use strict';

  const FAMOUS=[
    ['MSFT','마이크로소프트'],['AAPL','애플'],['NVDA','엔비디아'],['AMZN','아마존'],['GOOGL','알파벳'],['META','메타'],['TSLA','테슬라'],
    ['AMD','AMD'],['AVGO','브로드컴'],['PLTR','팔란티어'],['TSM','TSMC'],['CPNG','쿠팡'],['ANET','아리스타 네트웍스'],['ORCL','오라클'],['NFLX','넷플릭스'],['COST','코스트코']
  ];
  const COMPOUNDERS=[
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
  const GROUPS=[
    ['Magnificent 7 · 초대형 플랫폼','시장 방향·AI CAPEX·광고·클라우드·소비 생태계',['MSFT','AAPL','NVDA','AMZN','GOOGL','META','TSLA']],
    ['AI 메모리 · DRAM/HBM/스토리지','GPU와 함께 AI 병목을 만드는 메모리·스토리지',['MU','005930','000660','SNDK','WDC']],
    ['AI 컴퓨트 · 반도체','GPU·가속기·CPU·파운드리·장비',['NVDA','AVGO','AMD','INTC','TSM','ARM','AMAT','LRCX','KLAC']],
    ['AI 소프트웨어 · 클라우드','CAPEX가 실제 매출·생산성으로 이어지는지 확인',['MSFT','GOOGL','AMZN','ORCL','CRM','ADBE','PLTR']],
    ['AI 전력 · 데이터센터','전력망·원전·냉각·배전·시공 병목',['CEG','VST','GEV','ETN','VRT','NVT','PWR','MOD','FIX']],
    ['네트워크 · 광통신','스위치·DSP·광모듈 대역폭 병목',['ANET','AVGO','MRVL','CRDO','COHR','LITE']],
    ['Physical AI · 로봇','AI의 공장·물류·의료·로봇 확장',['108490','TSLA','ROK','TER','ISRG','NVDA']],
    ['AI 사이버보안','AI 도입으로 커지는 공격표면과 보안 자동화',['CRWD','PANW','FTNT','CIBR']],
    ['방산 AI · 드론','국방 자동화·자율시스템·드론',['PLTR','AVAV','KTOS','SHLD','ITA']]
  ];
  const NAMES={
    MSFT:'마이크로소프트',AAPL:'애플',NVDA:'엔비디아',AMZN:'아마존',GOOGL:'알파벳',META:'메타',TSLA:'테슬라',AMD:'AMD',AVGO:'브로드컴',PLTR:'팔란티어',TSM:'TSMC',CPNG:'쿠팡',ANET:'아리스타 네트웍스',ORCL:'오라클',NFLX:'넷플릭스',COST:'코스트코',
    MU:'마이크론',SNDK:'샌디스크',WDC:'웨스턴디지털',INTC:'인텔',ARM:'Arm',AMAT:'어플라이드 머티어리얼즈',LRCX:'램리서치',KLAC:'KLA',CRM:'세일즈포스',ADBE:'어도비',CEG:'콘스텔레이션 에너지',VST:'비스트라',GEV:'GE 버노바',ETN:'이튼',VRT:'버티브',NVT:'엔벤트',PWR:'콴타 서비스',MOD:'모딘',FIX:'컴포트 시스템즈',MRVL:'마벨',CRDO:'크레도',COHR:'코히런트',LITE:'루멘텀',ROK:'록웰 오토메이션',TER:'테라다인',ISRG:'인튜이티브 서지컬',CRWD:'크라우드스트라이크',PANW:'팔로알토 네트웍스',FTNT:'포티넷',AVAV:'에어로바이런먼트',KTOS:'크라토스',SHLD:'방산기술 ETF',ITA:'미국 방산 ETF',CIBR:'사이버보안 ETF',
    '005930':'삼성전자','000660':'SK하이닉스','108490':'로보티즈',QQQ:'인베스코 QQQ',IGV:'소프트웨어 ETF',SMH:'반도체 ETF',SOXX:'반도체 ETF',QLD:'프로셰어즈 울트라 QQQ',TQQQ:'프로셰어즈 울트라프로 QQQ',SOXL:'디렉시온 반도체 불 3X',GRID:'스마트그리드 ETF',AIQ:'AI 테크 ETF',BOTZ:'로봇·AI ETF',DTCR:'데이터센터 ETF',PAVE:'미국 인프라 ETF',URA:'우라늄 ETF',NLR:'원자력 ETF',COPX:'구리광산 ETF',XBI:'바이오텍 ETF',
    V:'비자',MA:'마스터카드',SPGI:'S&P 글로벌',MCO:'무디스',CTAS:'신타스',WM:'웨이스트 매니지먼트',RSG:'리퍼블릭 서비스',ORLY:'오라일리 오토모티브',AZO:'오토존',VGT:'뱅가드 정보기술 ETF',XLK:'기술주 섹터 ETF',SCHG:'미국 대형 성장 ETF',
    HUBB:'허벨',POWL:'파월 인더스트리스',CCJ:'카메코',LEU:'센트러스 에너지',NXE:'넥스젠 에너지',BE:'블룸에너지',CMI:'커민스',CAT:'캐터필러',EQIX:'에퀴닉스',DLR:'디지털 리얼티',FCX:'프리포트맥모란',SCCO:'서던 코퍼',NBIS:'네비우스'
  };
  const REPLAY=[
    ['2024-03-15','ADBE — 어도비','약한 가이던스와 AI 경쟁 우려 뒤 큰 급락','많이 빠졌다는 사실만으로 매수하지 않고 가이던스·추정치 하향을 강하게 감점'],
    ['2024-09-13','ADBE — 어도비','다음 분기 전망 실망으로 재차 급락','실적 beat보다 forward guidance와 하락추세 종료 확인을 우선'],
    ['2025-06-13','ADBE — 어도비','연간 전망 상향에도 AI 수익화 우려로 하락','좋은 실적 하나보다 higher-low·상대강도·추정치 안정까지 확인'],
    ['2024-05-30','CRM — 세일즈포스','성장 전망 약화로 하루 대폭락','FCF·마진이 좋아도 성장 추정치가 낮아지면 value trap 가능']
  ];
  const SMART=[
    ['NPS — 국민연금','13F·대형 포트폴리오','분기별 보유주식 변화. 작은 증감보다 신규/대규모 변화에 가중.'],
    ['Berkshire — 워런 버핏','장기 품질·가치','장기 자본배분 참고. 매매 시점은 후행일 수 있음.'],
    ['Duquesne — 스탠리 드러켄밀러','집중 성장·매크로','집중 포지션 변화 참고. 13F는 최대 45일 후행.'],
    ['Bridgewater — 레이 달리오','거시 분산','주식 외 선물·채권·헤지가 13F에 다 보이지 않는 한계.'],
    ['Coatue — 필립 라퐁','기술 성장','AI·기술 집중형 변화 참고.'],
    ['Appaloosa — 데이비드 테퍼','사이클·집중','집중형 신규/축소 포지션을 보조신호로 사용.'],
    ['Pershing Square — 빌 애크먼','집중 장기','소수 대형 포지션의 논리와 변화 참고.'],
    ['Tiger Global','기술 성장','성장주 위험선호와 대형 포지션 변화 참고.']
  ];

  function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
  function list(v){return Array.isArray(v)?v:[];}
  function data(){try{return (typeof D!=='undefined'&&D)||{}}catch(_){return {};}}
  function pick(t){return list(data().top_picks).find(x=>x&&x.ticker===t);}
  function nameOf(t){return NAMES[t]||pick(t)?.name||t;}
  function coreReady(){return !!(document.getElementById('charts')&&document.getElementById('etfs')&&document.getElementById('research')&&document.getElementById('history'));}
  function openTicker(t,n){
    try{if(typeof openCoverage==='function')return openCoverage(t,n||nameOf(t));}catch(_){ }
    try{if(pick(t)&&typeof openPick==='function')return openPick(t);}catch(_){ }
    try{if(typeof showModal==='function'){const chart=typeof tvFrame==='function'?tvFrame(t):'';return showModal(`${t} — ${n||nameOf(t)}`,'핵심 커버리지',`<div class="detailblock"><h4>실제 주가 차트</h4>${chart}</div><div class="detailblock"><h4>상태</h4><div>항상 추적하는 핵심 종목입니다. 세부 실적·밸류 데이터는 자동 갱신으로 보강됩니다.</div></div>`);}}catch(_){ }
  }

  function etfList(kind){
    const m=data().etf_lists||{};
    if(kind==='us')return list(m.us).length?list(m.us):list(m.us_listed);
    return list(m.kr).length?list(m.kr):list(m.kr_listed);
  }
  function installETFCompat(){
    if(window.__MR_ETF_V15)return;window.__MR_ETF_V15=true;
    window.renderETFGrid=function(){
      const box=document.getElementById('etfGrid');if(!box)return;
      const mode=(typeof etfMode!=='undefined'?etfMode:'us');
      const arr=etfList(mode).slice().sort((a,b)=>(b.score||0)-(a.score||0));
      box.innerHTML=arr.length?arr.map((x,i)=>`<div class="card etfcard clickable" role="button" tabindex="0" data-mr-etf-card="1" data-kind="${mode}" data-id="${esc(x.ticker||x.code)}"><div><div class="rank">#${x.rank||i+1}</div><div class="code">${esc(x.ticker||x.code)} — ${esc(x.name)}</div><div>${esc(x.theme||'')}</div><div class="muted">${esc(x.phase||x.note||'')}</div><div class="detailhint">터치</div></div><b>${x.score??'—'}</b></div>`).join(''):'<div class="notice">ETF 목록을 다음 자동 갱신에서 보강합니다.</div>';
    };
    window.setETFMode=function(m){
      try{etfMode=m}catch(_){ }
      document.querySelectorAll('[data-etfmode]').forEach(b=>b.classList.toggle('active',b.dataset.etfmode===m));
      window.renderETFGrid();
    };
    window.openETF=function(kind,id){
      const x=etfList(kind).find(v=>String(v.ticker||v.code)===String(id));
      const name=x?.name||'ETF';const tid=x?.ticker||x?.code||id;
      let chart='';try{if(kind==='us'&&typeof tvFrame==='function')chart=tvFrame(tid)}catch(_){ }
      const body=`${chart?`<div class="detailblock"><h4>📉 실제 ETF 차트</h4>${chart}</div>`:''}<div class="metrics"><div class="metric">순위<b>#${x?.rank??'—'}</b></div><div class="metric">점수<b>${x?.score??'—'}</b></div><div class="metric">행동<b class="smallb">${esc(x?.action||'관찰')}</b></div></div><div class="detailblock"><h4>왜 보는 ETF?</h4><div>${esc(x?.note||'현재 테마 추적 대상')}</div></div><div class="detailblock"><h4>구성·비용·중복</h4><div>${esc(x?.holdings||x?.composition||'대표 구성은 운용사 공식 페이지에서 확인')}<br>${esc(x?.fee||x?.expense||'비용은 최신 공식 데이터 확인')}<br>${esc(x?.overlap||'QQQ·기존 지수와 중복 확인')}</div></div><div class="detailblock"><h4>우리 사용법</h4><div>${esc(x?.action||'테마를 분산해서 접근')}</div></div>`;
      if(typeof showModal==='function')showModal(`${tid} — ${name}`,`${esc(x?.theme||'ETF')} · 점수 ${x?.score??'—'}`,body);
    };
  }

  function ensureNav(){
    const nav=document.querySelector('.quicknav');if(!nav)return;
    const add=(label,id,after)=>{if([...nav.querySelectorAll('button')].some(b=>b.textContent.trim()===label))return;const b=document.createElement('button');b.className='pill';b.textContent=label;b.onclick=()=>document.getElementById(id)?.scrollIntoView({behavior:'smooth',block:'start'});const a=[...nav.querySelectorAll('button')].find(x=>x.textContent.trim()===after);a?a.insertAdjacentElement('afterend',b):nav.appendChild(b);};
    add('대표주','mr-famous','종목');add('우상향','mr-compounders','대표주');add('전체추적','mr-universe','우상향');
  }
  function ensureFamous(){
    if(document.getElementById('mr-famous'))return;const anchor=document.getElementById('coverage-groups')||document.getElementById('picks');if(!anchor)return;
    const s=document.createElement('section');s.className='sec';s.id='mr-famous';s.innerHTML=`<div class="sectionhead"><div><h2>🌟 유명·초대형 핵심주</h2><div class="muted">Mag7 + AMD·브로드컴·팔란티어·쿠팡·TSMC·아리스타 등 항상 추적.</div></div></div><div class="mr-famous-grid">${FAMOUS.map(([t,n])=>{const p=pick(t);return `<button class="mr-stock-chip" type="button" data-mr-integrity-ticker="${t}"><span><b>${t}</b><small>${n}</small></span><em>${p?p.score:'추적'}</em><i>터치</i></button>`}).join('')}</div>`;anchor.insertAdjacentElement('afterend',s);
  }
  function ensureCompounders(){
    if(document.getElementById('mr-compounders'))return;const a=document.getElementById('mr-famous')||document.getElementById('picks');if(!a)return;
    const s=document.createElement('section');s.className='sec';s.id='mr-compounders';s.innerHTML=`<div class="sectionhead"><div><h2>📈 장기 복리·우상향 품질 후보</h2><div class="muted">5Y+ 추세·200DMA·매출/EPS/FCF·낙폭/회복·ROIC·상대강도·추정치를 함께 봄.</div></div></div><div class="mr-rule-pills"><span>5Y+ 추세</span><span>200DMA</span><span>매출·EPS·FCF</span><span>낙폭·회복</span><span>ROIC·마진</span><span>상대강도</span><span>추정치</span></div><div class="mr-compound-grid">${COMPOUNDERS.map(([t,n,why,risk])=>`<article class="mr-compound-card" role="button" tabindex="0" data-mr-integrity-ticker="${t}"><div><b>${t} — ${n}</b><em>${pick(t)?`현재 ${pick(t).timing}`:'추적'}</em></div><p>${why}</p><small>위험: ${risk}</small><i>터치</i></article>`).join('')}</div>`;a.insertAdjacentElement('afterend',s);
  }
  function ensureCoverageGroups(){
    if(document.getElementById('coverage-groups'))return;const a=document.getElementById('picks');if(!a)return;
    const s=document.createElement('section');s.className='sec';s.id='coverage-groups';s.innerHTML=`<div class="sectionhead"><div><h2>🧩 핵심 커버리지 그룹</h2><div class="muted">비슷한 기업끼리 묶어 같은 자금흐름과 상대강도를 비교.</div></div></div><div class="group-board">${GROUPS.map(([n,w,ts])=>`<div class="group-card"><h3>${n}</h3><p>${w}</p><div class="group-tickers">${ts.map(t=>`<span class="clickable" data-mr-integrity-ticker="${t}">${t} · ${nameOf(t)}</span>`).join('')}</div></div>`).join('')}</div>`;a.insertAdjacentElement('afterend',s);
  }
  function ensureUniverse(){
    if(document.getElementById('mr-universe'))return;const a=document.getElementById('mr-compounders')||document.getElementById('coverage-groups');if(!a)return;
    const dyn=list(data().expanded_themes).flatMap(x=>list(x.tickers));
    const base=['QQQ','QLD','TQQQ','SOXL','SMH','SOXX','NVDA','AVGO','PLTR','NBIS','SNDK','ANET','ORCL','ADBE','CRM','GOOGL','AMZN','MSFT','AAPL','META','TSLA','AMD','INTC','TSM','ARM','MU','WDC','AMAT','LRCX','KLAC','MRVL','CRDO','LITE','COHR','CEG','VST','GEV','ETN','VRT','PWR','NVT','MOD','FIX','HUBB','POWL','CCJ','LEU','NXE','BE','CMI','CAT','CRWD','PANW','FTNT','AVAV','KTOS','ROK','TER','ISRG','CPNG','NFLX','COST','V','MA','SPGI','MCO','CTAS','WM','RSG','ORLY','AZO','VGT','XLK','SCHG','IGV','GRID','AIQ','BOTZ','DTCR','CIBR','PAVE','URA','NLR','SHLD','ITA','COPX','XBI','005930','000660','108490'];
    const all=[...new Set([...base,...dyn])];
    const s=document.createElement('section');s.className='sec';s.id='mr-universe';s.dataset.mrDefaultClosed='1';s.innerHTML=`<div class="sectionhead"><div><h2>🗂 전체 추적 유니버스 · ${all.length}개+</h2><div class="muted">대표주·반도체·메모리·소프트웨어·전력·네트워크·로봇·보안·방산·ETF를 빠짐없이 한곳에서 확인.</div></div></div><div class="mr-universe-grid">${all.map(t=>`<button type="button" class="mr-universe-chip" data-mr-integrity-ticker="${t}"><b>${t}</b><span>${nameOf(t)}</span><i>터치</i></button>`).join('')}</div>`;a.insertAdjacentElement('afterend',s);
  }
  function ensureReplay(){
    if(document.getElementById('false-positive-replay'))return;const a=document.getElementById('history');if(!a)return;
    const s=document.createElement('section');s.className='sec';s.id='false-positive-replay';s.dataset.mrDefaultClosed='1';s.innerHTML=`<h2>🧯 과거 오판·폭락 방지 Replay</h2><div class="warning-card"><b>목적:</b> 지금과 비슷한 ‘싸 보이는’ 신호가 과거에도 매수로 떴는데 이후 더 폭락했는지 확인해 false-positive를 모델에 반영.</div><div class="tablewrap"><table class="fulltable compact"><thead><tr><th>날짜</th><th>종목</th><th>사건</th><th>반영 교훈</th></tr></thead><tbody>${REPLAY.map(r=>`<tr><td>${r[0]}</td><td><b>${r[1]}</b></td><td class="left">${r[2]}</td><td class="left">${r[3]}</td></tr>`).join('')}</tbody></table></div><div class="replay-table-note">정식 전수 백테스트로 과장하지 않음. 과거 시점 당시 공개정보만 사용하고 1m/3m/6m/12m 수익률·최대추가하락(MAE)을 누적.</div>`;a.insertAdjacentElement('afterend',s);
  }
  function ensureReferences(){
    if(document.getElementById('sources')||document.getElementById('mr-sources'))return;const refs=list(data().reference_sources);if(!refs.length)return;const a=document.getElementById('research')||document.getElementById('history');if(!a)return;
    const s=document.createElement('section');s.className='sec';s.id='mr-sources';s.dataset.mrDefaultClosed='1';s.innerHTML=`<h2>🔎 참고 사이트·원문·데이터</h2><div class="sources">${refs.slice().sort((a,b)=>(a.rank||99)-(b.rank||99)).map(r=>`<div class="card"><div class="rank">#${r.rank??'—'} · ${esc(r.type||'')}</div><b>${esc(r.name)}</b><div>${esc(r.use||'')}</div><div class="muted">가중치: ${esc(r.weight||'보조')}</div></div>`).join('')}</div>`;a.insertAdjacentElement('afterend',s);
  }
  function ensureSmartMoney(){
    if(document.getElementById('mr-smart-money'))return;const a=document.getElementById('mr-sources')||document.getElementById('research');if(!a)return;
    const s=document.createElement('section');s.className='sec';s.id='mr-smart-money';s.dataset.mrDefaultClosed='1';s.innerHTML=`<h2>🧠 기관·스마트머니 추적</h2><div class="notice">13F는 최대 45일 후행이고 전체 채권·선물·숏 포지션을 보여주지 않으므로 총점 가중치는 10~15% 이하로 제한.</div><div class="grid">${SMART.map(r=>`<div class="card"><b>${r[0]}</b><div>${r[1]}</div><div class="muted">${r[2]}</div></div>`).join('')}</div>`;a.insertAdjacentElement('afterend',s);
  }
  function ensureToday(){
    if([...document.querySelectorAll('section.sec h2')].some(h=>h.textContent.includes('오늘 달라진')))return;const m=document.getElementById('market');if(!m)return;
    const s=document.createElement('section');s.className='sec';s.id='mr-today';s.innerHTML=`<h2>🆕 오늘 달라진 것</h2><div class="notice">현재 스냅샷에 별도 ‘큰 변화’ 항목이 저장되지 않았습니다. 매시간 데이터는 계속 갱신하고, Phase·테마순위·점수·목표비중 등 의미 있는 변화가 생기면 이 영역에 우선 표시합니다.</div>`;m.insertAdjacentElement('afterend',s);
  }
  function ensureChartHelp(){
    const c=document.getElementById('charts');if(!c||c.querySelector('.chart-help'))return;const d=document.createElement('div');d.className='chart-help';d.innerHTML='<b>그래프 읽는 법</b><br><span class="chart-unit">매수타이밍 = 0~100 모델점수</span><span class="chart-unit">QQQ 시간그래프 = 실제 USD 가격</span><br><strong>점수그래프와 실제 주가차트는 서로 다른 그래프입니다.</strong>';c.insertBefore(d,c.querySelector('.chartgrid')||c.children[1]||null);
  }
  function ensureDownload(){
    const top=document.querySelector('.top');if(!top||top.querySelector('.download-tools'))return;const d=document.createElement('div');d.className='download-tools';d.innerHTML='<button type="button" id="downloadSnapshotBtn">⬇ HTML 저장</button><a href="https://github.com/kimjae134679/stock" target="_blank" rel="noopener">GitHub</a>';top.appendChild(d);d.querySelector('button').onclick=()=>{if(typeof downloadRadarSnapshot==='function')downloadRadarSnapshot();else window.open(location.href,'_blank');};
  }

  function ensureAll(){
    if(!coreReady())return;
    try{document.getElementById('app')?.removeAttribute('data-failsafe')}catch(_){ }
    installETFCompat();ensureNav();ensureToday();ensureCoverageGroups();ensureFamous();ensureCompounders();ensureUniverse();ensureReplay();ensureReferences();ensureSmartMoney();ensureChartHelp();ensureDownload();
    try{window.renderETFGrid()}catch(_){ }
  }

  document.addEventListener('click',ev=>{
    const s=ev.target.closest('[data-mr-integrity-ticker]');if(s){ev.preventDefault();openTicker(s.dataset.mrIntegrityTicker,nameOf(s.dataset.mrIntegrityTicker));return;}
    const e=ev.target.closest('[data-mr-etf-card]');if(e){ev.preventDefault();window.openETF(e.dataset.kind,e.dataset.id);}
  },true);
  document.addEventListener('keydown',ev=>{
    if((ev.key==='Enter'||ev.key===' ')&&ev.target.matches('[data-mr-integrity-ticker]')){ev.preventDefault();openTicker(ev.target.dataset.mrIntegrityTicker,nameOf(ev.target.dataset.mrIntegrityTicker));}
  });

  const app=document.getElementById('app');
  if(app){let queued=false;new MutationObserver(()=>{if(queued)return;queued=true;setTimeout(()=>{queued=false;ensureAll()},40)}).observe(app,{childList:true,subtree:false});}
  let tries=0;const timer=setInterval(()=>{tries++;ensureAll();if(coreReady()&&document.getElementById('mr-universe')&&document.getElementById('false-positive-replay'))clearInterval(timer);if(tries>200)clearInterval(timer)},100);
})();