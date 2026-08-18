/* Market Radar polish layer: collapsible sections, famous-stock coverage, compounder board, ETF click repair, chart fallbacks. */
(function(){
  const POPULAR=[
    ['MSFT','마이크로소프트'],['AAPL','애플'],['NVDA','엔비디아'],['AMZN','아마존'],['GOOGL','알파벳'],['META','메타'],['TSLA','테슬라'],
    ['AMD','AMD'],['AVGO','브로드컴'],['PLTR','팔란티어'],['TSM','TSMC'],['CPNG','쿠팡'],['ANET','아리스타 네트웍스'],['ORCL','오라클'],['NFLX','넷플릭스'],['COST','코스트코']
  ];
  const COMPOUNDERS=[
    {t:'ANET',n:'아리스타 네트웍스',type:'고성장 품질',why:'AI 네트워크·클라우드 스위칭에서 높은 성장성과 마진을 이어온 후보.',risk:'밸류에이션·대형 고객 집중·AI CAPEX 둔화'},
    {t:'QQQ',n:'인베스코 QQQ',type:'성장지수',why:'미국 대형 성장주를 자동 교체하며 장기 추세를 따라가는 코어 후보.',risk:'기술주 집중·고금리·대형주 동반 조정'},
    {t:'MSFT',n:'마이크로소프트',type:'초대형 복리',why:'클라우드·오피스·AI의 반복매출과 현금흐름이 강한 품질 성장 후보.',risk:'AI CAPEX·규제·밸류에이션'},
    {t:'AVGO',n:'브로드컴',type:'AI+FCF',why:'AI 가속기·네트워크와 인프라 소프트웨어의 현금창출 조합.',risk:'고객집중·인수통합·AI 수요 둔화'},
    {t:'COST',n:'코스트코',type:'방어 복리',why:'회원제·재구매·가격경쟁력을 기반으로 장기 복리 특성이 강한 후보.',risk:'높은 밸류·소비 둔화'},
    {t:'V',n:'비자',type:'결제 네트워크',why:'글로벌 결제량 증가와 높은 네트워크 효과를 가진 자산경량 모델.',risk:'규제·결제수수료 압박'},
    {t:'MA',n:'마스터카드',type:'결제 네트워크',why:'현금→전자결제 전환의 장기 구조 수혜와 높은 마진.',risk:'규제·경기 둔화'},
    {t:'SPGI',n:'S&P 글로벌',type:'데이터·등급',why:'지수·신용평가·데이터의 반복매출과 높은 진입장벽.',risk:'발행시장 둔화·규제'},
    {t:'PWR',n:'콴타 서비스',type:'인프라 복리',why:'전력망·데이터센터·송배전 투자 확대의 구조 수혜.',risk:'프로젝트 실행·인력비·CAPEX 사이클'},
    {t:'ETN',n:'이튼',type:'전력 품질',why:'전기화·배전·데이터센터 전력 병목의 장기 수혜.',risk:'밸류·산업 CAPEX 둔화'},
    {t:'WM',n:'웨이스트 매니지먼트',type:'방어 복리',why:'필수 서비스·지역 진입장벽·가격결정력이 강한 후보.',risk:'인수·규제·연료비'},
    {t:'RSG',n:'리퍼블릭 서비스',type:'방어 복리',why:'폐기물 처리의 반복수요와 현금흐름 안정성.',risk:'인수·규제·비용상승'},
    {t:'ORLY',n:'오라일리 오토모티브',type:'소비 복리',why:'차량 노후화·부품 유통 효율·자사주 효과가 강한 후보.',risk:'밸류·자동차 구조 변화'},
    {t:'AZO',n:'오토존',type:'소비 복리',why:'경기방어적 애프터마켓과 높은 자본효율.',risk:'밸류·EV 보급 장기 영향'},
    {t:'VGT',n:'뱅가드 정보기술 ETF',type:'기술 ETF',why:'미국 대형 기술주 장기 성장에 분산 접근.',risk:'대형 기술주 집중'},
    {t:'XLK',n:'Technology Select Sector SPDR',type:'기술 ETF',why:'S&P 기술 섹터의 품질 대형주 중심.',risk:'상위종목 집중'},
    {t:'SCHG',n:'Schwab U.S. Large-Cap Growth ETF',type:'성장 ETF',why:'미국 대형 성장주의 장기 복리 후보군을 넓게 보유.',risk:'성장주 밸류·금리'}
  ];
  const MAP={
    CPNG:'NYSE:CPNG',NFLX:'NASDAQ:NFLX',COST:'NASDAQ:COST',V:'NYSE:V',MA:'NYSE:MA',SPGI:'NYSE:SPGI',WM:'NYSE:WM',RSG:'NYSE:RSG',ORLY:'NASDAQ:ORLY',AZO:'NYSE:AZO',VGT:'AMEX:VGT',XLK:'AMEX:XLK',SCHG:'AMEX:SCHG'
  };
  try{Object.assign(TV,MAP)}catch(_){ }

  function esc(s){try{return e(s)}catch(_){return String(s??'').replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m]))}}
  function arr(x){try{return safeArr(x)}catch(_){return Array.isArray(x)?x:[]}}
  function pscore(t){try{return arr(D?.top_picks).find(x=>x.ticker===t)}catch(_){return null}}
  function openAny(t,n){try{const p=pscore(t);if(p)return openPick(t)}catch(_){ }
    try{return openCoverage(t,n)}catch(_){ }
  }

  /* Give every US chart a second in-app provider/image and keep internal intraday as last fallback. */
  try{
    const originalTv=tvFrame;
    tvFrame=function(ticker,interval='D'){
      const primary=originalTv(ticker,interval);
      const kr=/^\d{6}$/.test(ticker);
      const alt=kr
        ? `<div class="alt-chart-inner"><div class="emptychart"><b>${esc(ticker)}</b><br>외부 차트가 막히면 오늘 내부 시간그래프를 사용합니다.</div></div>`
        : `<div class="alt-chart-inner"><img class="finviz-fallback" loading="lazy" src="https://charts2.finviz.com/chart.ashx?t=${encodeURIComponent(ticker)}&ty=c&ta=1&p=d&s=l" alt="${esc(ticker)} 대체 차트" onerror="this.style.display='none';this.nextElementSibling.style.display='block'"><div class="emptychart" style="display:none">대체 이미지도 차단됨. 오늘 내부 시간그래프와 아래 외부 링크를 사용하세요.</div></div>`;
      return `<div class="multi-chart" data-chart="${esc(ticker)}"><div class="primary-chart">${primary}</div><details class="alt-chart"><summary>다른 차트</summary>${alt}<div class="chart-links"><a target="_blank" rel="noopener" href="https://www.google.com/finance/quote/${encodeURIComponent(ticker)}:${kr?'KRX':'NASDAQ'}">Google Finance</a><a target="_blank" rel="noopener" href="https://www.tradingview.com/symbols/${encodeURIComponent(ticker)}/">TradingView</a></div></details></div>`;
    };
  }catch(_){ }

  /* ETF cards sometimes had data that was not present in the small top-pick list. Never silently do nothing. */
  try{
    const originalETF=openETF;
    openETF=function(kind,id){
      const list=arr(D?.etf_lists?.[kind]);
      const x=list.find(y=>(y.ticker||y.code)===id);
      if(x)return originalETF(kind,id);
      const us=kind!=='kr';
      const body=`${us?`<div class="detailblock"><h4>실제 ETF 차트</h4>${tvFrame(id)}</div>`:''}<div class="detailblock"><h4>상세</h4><div>현재 테마 추적 목록에는 포함되어 있지만 세부 구성·비용 데이터가 아직 최신 JSON에 없어서 다음 자동 갱신에서 채웁니다.</div></div>`;
      showModal(`${id} — ETF`,'테마 ETF · 추적중',body);
    };
  }catch(_){ }

  function addBoards(){
    if(document.getElementById('popular-stocks'))return;
    const anchor=document.getElementById('coverage-groups')||document.getElementById('picks');
    if(!anchor)return;
    const popular=document.createElement('section');popular.className='sec';popular.id='popular-stocks';
    popular.innerHTML=`<h2>🌟 유명·초대형 핵심주</h2><div class="muted">Mag7뿐 아니라 AMD·브로드컴·팔란티어·쿠팡·TSMC·아리스타까지 항상 한 화면에서 추적.</div><div class="ticker-cloud">${POPULAR.map(([t,n])=>{const p=pscore(t);return `<button class="ticker-chip" data-open-ticker="${esc(t)}" data-open-name="${esc(n)}"><b>${esc(t)}</b><span>${esc(n)}</span>${p?`<em>${p.score}</em>`:'<em>추적</em>'}</button>`}).join('')}</div>`;
    anchor.after(popular);

    const quality=document.createElement('section');quality.className='sec';quality.id='quality-compounders';
    quality.innerHTML=`<h2>📈 장기 복리·우상향 품질 후보</h2><div class="warning-card"><b>완전히 안 떨어지는 주식은 없음.</b> 여기서는 5년 이상 장기 추세, 200DMA 기울기, 매출·EPS·FCF 성장, 고점 회복력, ROIC/마진, 부채·희석, QQQ/SPY 대비 상대강도를 함께 보고 “우상향 특성이 강한 후보”를 찾습니다.</div><div class="quality-rules"><span>장기 가격추세</span><span>매출·EPS·FCF</span><span>200DMA/신고가</span><span>회복속도·낙폭</span><span>ROIC·마진</span><span>추정치 방향</span></div><div class="compound-grid">${COMPOUNDERS.map(x=>`<article class="compound-card" data-open-ticker="${esc(x.t)}" data-open-name="${esc(x.n)}"><div class="compound-top"><b>${esc(x.t)} — ${esc(x.n)}</b><span>${esc(x.type)}</span></div><p>${esc(x.why)}</p><small>위험: ${esc(x.risk)}</small><i>터치</i></article>`).join('')}</div>`;
    popular.after(quality);
  }

  function compressHints(root=document){
    root.querySelectorAll('.detailhint').forEach(x=>x.textContent='터치');
    root.querySelectorAll('div,span,small,i').forEach(x=>{
      if(x.children.length)return;
      const t=(x.textContent||'').trim();
      if(/^터치\s*[→>-]/.test(t))x.textContent='터치';
    });
  }

  function installFold(sec,defaultOpen=true){
    if(!sec||sec.dataset.foldReady==='1'||sec.classList.contains('hero'))return;
    const h=sec.querySelector(':scope > h2, :scope > .sectionhead h2');if(!h)return;
    sec.dataset.foldReady='1';sec.classList.add('foldable-sec');
    const key='mr-fold-'+(sec.id||h.textContent.replace(/\s+/g,'-'));
    let open=defaultOpen;try{const saved=localStorage.getItem(key);if(saved!==null)open=saved==='1'}catch(_){ }
    const b=document.createElement('button');b.className='fold-toggle';b.type='button';
    function apply(){sec.classList.toggle('folded',!open);b.textContent=open?'접기':'펼치기';b.setAttribute('aria-expanded',String(open));try{localStorage.setItem(key,open?'1':'0')}catch(_){ }}
    b.onclick=()=>{open=!open;apply()};
    if(h.parentElement?.classList.contains('sectionhead'))h.parentElement.appendChild(b);else h.insertAdjacentElement('afterend',b);
    apply();
  }
  function folds(){
    const closed=new Set(['research','history','false-positive-replay','macro','sources','expanded']);
    document.querySelectorAll('section.sec').forEach(s=>installFold(s,!closed.has(s.id)));
  }

  function repairETFClicks(){
    document.querySelectorAll('.etfcard').forEach(card=>{
      if(card.dataset.etfRepair==='1')return;card.dataset.etfRepair='1';card.classList.add('clickable');
      card.addEventListener('click',ev=>{
        const txt=(card.querySelector('.code')?.textContent||card.textContent||'').trim();
        const all=[['us',...arr(D?.etf_lists?.us)],['kr',...arr(D?.etf_lists?.kr)]];
        let found=null,kind='us';
        for(const k of ['us','kr']){const x=arr(D?.etf_lists?.[k]).find(z=>txt.includes(String(z.ticker||z.code)));if(x){found=x;kind=k;break}}
        if(found){ev.preventDefault();ev.stopPropagation();openETF(kind,found.ticker||found.code)}
      },true);
    });
  }

  function linkThemeETFChips(){
    const modal=document.getElementById('modalBody');if(!modal)return;
    modal.querySelectorAll('.watchlist span,.subtheme,.detailblock').forEach(el=>{
      if(el.dataset.etfLinked==='1')return;
      const txt=el.textContent||'';
      const ids=[];for(const k of ['us','kr'])for(const x of arr(D?.etf_lists?.[k])){const id=String(x.ticker||x.code);if(id&&txt.includes(id))ids.push([k,id])}
      if(!ids.length)return;el.dataset.etfLinked='1';
      const row=document.createElement('div');row.className='linked-etfs';row.innerHTML=ids.slice(0,8).map(([k,id])=>`<button data-etf-kind="${k}" data-etf-id="${esc(id)}">${esc(id)} · 터치</button>`).join('');el.appendChild(row);
    });
  }

  function installEvents(){
    document.addEventListener('click',ev=>{
      const t=ev.target.closest('[data-open-ticker]');if(t){ev.preventDefault();openAny(t.dataset.openTicker,t.dataset.openName||t.dataset.openTicker);return}
      const q=ev.target.closest('[data-etf-kind]');if(q){ev.preventDefault();openETF(q.dataset.etfKind,q.dataset.etfId);return}
    });
  }

  function install(){
    if(!document.querySelector('#app .sec'))return false;
    addBoards();compressHints();folds();repairETFClicks();linkThemeETFChips();
    return true;
  }
  installEvents();
  const mo=new MutationObserver(()=>{install();compressHints();repairETFClicks();linkThemeETFChips()});
  mo.observe(document.documentElement,{subtree:true,childList:true});
  const timer=setInterval(()=>{if(install())clearInterval(timer)},200);setTimeout(()=>clearInterval(timer),20000);
})();