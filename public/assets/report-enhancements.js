/* Market Radar UI/coverage enhancement layer. Loaded after report.js. */
(function(){
  const GROUPS=[
    {name:'Magnificent 7 · 초대형 플랫폼',why:'시장 전체 방향·AI CAPEX·광고·클라우드·소비 생태계를 한 번에 보는 핵심 바스켓',items:[['MSFT','마이크로소프트'],['AAPL','애플'],['NVDA','엔비디아'],['AMZN','아마존'],['GOOGL','알파벳'],['META','메타'],['TSLA','테슬라']]},
    {name:'AI 메모리 · DRAM/HBM/스토리지',why:'GPU만큼 중요한 AI 메모리 병목. 가격 사이클과 HBM 공급이 핵심',items:[['MU','마이크론'],['005930','삼성전자'],['000660','SK하이닉스'],['SNDK','샌디스크'],['WDC','웨스턴디지털']]},
    {name:'AI 컴퓨트 · 반도체 대형주',why:'GPU·가속기·CPU·파운드리·장비까지 AI 연산 공급망 전체',items:[['NVDA','엔비디아'],['AVGO','브로드컴'],['AMD','AMD'],['INTC','인텔'],['TSM','TSMC'],['ARM','Arm'],['AMAT','어플라이드 머티어리얼즈'],['LRCX','램리서치'],['KLAC','KLA']]},
    {name:'AI 소프트웨어 · 클라우드',why:'AI CAPEX가 실제 매출·생산성으로 넘어가는지 확인하는 그룹',items:[['MSFT','마이크로소프트'],['GOOGL','알파벳'],['AMZN','아마존'],['ORCL','오라클'],['CRM','세일즈포스'],['ADBE','어도비'],['PLTR','팔란티어']]},
    {name:'AI 전력 · 데이터센터 인프라',why:'전력망·원전·냉각·배전·시공의 물리적 병목 수혜',items:[['CEG','콘스텔레이션 에너지'],['VST','비스트라'],['GEV','GE 버노바'],['ETN','이튼'],['VRT','버티브'],['NVT','엔벤트'],['PWR','콴타'],['MOD','모딘'],['FIX','컴포트 시스템즈']]},
    {name:'네트워크 · 광통신',why:'GPU 클러스터가 커질수록 스위치·DSP·광모듈 대역폭이 병목',items:[['ANET','아리스타'],['AVGO','브로드컴'],['MRVL','마벨'],['CRDO','크레도'],['COHR','코히런트'],['LITE','루멘텀']]},
    {name:'Physical AI · 로봇',why:'AI가 소프트웨어에서 공장·물류·휴머노이드·액추에이터로 확장되는 다음 단계',items:[['108490','로보티즈'],['TSLA','테슬라'],['ROK','록웰 오토메이션'],['TER','테라다인'],['ISRG','인튜이티브 서지컬'],['NVDA','엔비디아']]},
    {name:'사이버보안 · AI 보안',why:'AI 도입으로 공격표면이 커질수록 보안 자동화 수요도 증가',items:[['CRWD','크라우드스트라이크'],['PANW','팔로알토'],['FTNT','포티넷'],['CIBR','사이버보안 ETF']]},
    {name:'방산 AI · 드론',why:'지정학·국방 자동화·자율시스템 수요를 추적',items:[['PLTR','팔란티어'],['AVAV','에어로바이런먼트'],['KTOS','크라토스'],['SHLD','방산기술 ETF'],['ITA','미국 방산 ETF']]}
  ];
  const REPLAY=[
    {date:'2024-03-15',asset:'ADBE — 어도비',event:'약한 가이던스와 AI 경쟁 우려로 하루 약 -12%.',lesson:'단순히 “많이 빠졌다/밸류가 낮아졌다”만으로 매수하면 오판 가능. 가이던스 하향·이익추정치 하향은 강한 감점/매수 보류 조건으로 써야 함.',url:'https://www.investing.com/news/stock-market-news/adobe-drops-as-weak-forecast-fans-worries-about-competition-ai-efforts-3339781'},
    {date:'2024-09-13',asset:'ADBE — 어도비',event:'실적 자체보다 다음 분기 전망이 실망스러워 주가가 약 -10% 급락.',lesson:'실적 beat보다 forward guidance가 더 중요할 수 있음. 하락 추세에서 “싸 보임”은 바닥 확인 전까지 후보일 뿐.',url:'https://www.investing.com/news/stock-market-news/adobe-shares-slump-as-ai-software-competition-hits-earnings-forecast-3615373'},
    {date:'2025-06-13',asset:'ADBE — 어도비',event:'연간 매출 전망을 올렸는데도 AI 수익화 지연 우려로 약 -7%.',lesson:'좋은 실적 하나만으로 구조적 우려가 사라지지 않는다. 가격 higher-low·상대강도·추정치 안정까지 함께 확인.',url:'https://www.reuters.com/business/adobe-shares-slide-investors-skeptical-quicker-ai-adoption-returns-2025-06-13/'},
    {date:'2024-05-30',asset:'CRM — 세일즈포스',event:'구독 성장 전망 약화와 고객 지출 신중론으로 약 -19.7%.',lesson:'FCF·마진이 좋아도 forward growth revision이 악화되면 저평가 신호가 value trap이 될 수 있음. 성장 추정치 하향 시 매수점수 상한을 둔다.',url:'https://www.marketwatch.com/story/salesforces-increasingly-visible-weakness-could-spur-a-stock-drop-not-seen-in-years-8122984c'}
  ];
  try{
    Object.assign(TV,{MSFT:'NASDAQ:MSFT',AAPL:'NASDAQ:AAPL',AMZN:'NASDAQ:AMZN',META:'NASDAQ:META',TSLA:'NASDAQ:TSLA',INTC:'NASDAQ:INTC',TSM:'NYSE:TSM',ARM:'NASDAQ:ARM',WDC:'NASDAQ:WDC',ROK:'NYSE:ROK',TER:'NASDAQ:TER',ISRG:'NASDAQ:ISRG',CRWD:'NASDAQ:CRWD',PANW:'NASDAQ:PANW',FTNT:'NASDAQ:FTNT',AVAV:'NASDAQ:AVAV',KTOS:'NASDAQ:KTOS','005930':'KRX:005930','000660':'KRX:000660','108490':'KOSDAQ:108490'});
  }catch(_){ }

  try{
    lineSvg=function(vals,label,color='#60a5fa'){
      if(!vals||!vals.length)return `<div class="emptychart"><b>${e(label)}</b><br>아직 기록된 포인트가 없음<br><small>자동 분석은 매시간 갱신되고, 화면은 주기적으로 최신 파일을 다시 읽습니다.</small></div>`;
      const nums=vals.map(x=>Number(x.v)).filter(Number.isFinite);
      if(!nums.length)return `<div class="emptychart">유효한 값이 아직 없음</div>`;
      const first=nums[0],last=nums.at(-1),delta=last-first,pct=first?delta/first*100:0;
      const score=/매수타이밍|점수/.test(label),unit=score?'점 / 100':'USD',dec=score?1:2;
      let mn=Math.min(...nums),mx=Math.max(...nums);const actualMin=mn,actualMax=mx;
      if(mx===mn){const pad=score?2:Math.max(Math.abs(mn)*.003,.5);mx+=pad;mn-=pad}
      const W=720,H=210,L=52,R=18,T=22,B=34;
      const pts=vals.map((x,i)=>{const xx=L+(W-L-R)*(vals.length===1?.5:i/(vals.length-1));const yy=T+(H-T-B)*(1-(Number(x.v)-mn)/(mx-mn));return[xx,yy]});
      const poly=pts.map(x=>x.join(',')).join(' ');
      const dots=pts.map((q,i)=>`<circle cx="${q[0]}" cy="${q[1]}" r="4" fill="${color}"><title>${e(vals[i].t)} · ${Number(vals[i].v).toFixed(dec)} ${unit}</title></circle>`).join('');
      const flat=Math.abs(delta)<(score?.1:Math.max(Math.abs(first)*.0001,.01));
      const change=score?`${delta>=0?'+':''}${delta.toFixed(1)}점`:`${delta>=0?'+':''}${delta.toFixed(2)} (${pct>=0?'+':''}${pct.toFixed(2)}%)`;
      return `<div class="chart-label"><b>${e(label)}</b><span>현재 ${last.toFixed(dec)} ${unit} · ${flat?'변화 거의 없음':change}</span></div><div class="tiny muted">${score?'우리 모델의 “지금 사기 좋은 정도” 점수 변화. 실제 주가가 아님.':'QQQ의 실제 가격 스냅샷 변화. 우리 매수점수와 별개.'}</div><svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet"><line x1="${L}" y1="${H-B}" x2="${W-R}" y2="${H-B}" stroke="#263548"/><line x1="${L}" y1="${T}" x2="${L}" y2="${H-B}" stroke="#263548"/><text x="4" y="${T+5}" fill="#93a4b7" font-size="11">${actualMax.toFixed(dec)}</text><text x="4" y="${H-B}" fill="#93a4b7" font-size="11">${actualMin.toFixed(dec)}</text><polyline fill="none" stroke="${color}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" points="${poly}"/>${dots}</svg><div class="chart-label"><span>${e(vals[0].t)}</span><span>${nums.length}개 포인트</span><span>${e(vals.at(-1).t)}</span></div>`;
    };
  }catch(_){ }

  window.openCoverage=function(ticker,name){
    try{const p=safeArr(D?.top_picks).find(x=>x.ticker===ticker);if(p)return openPick(ticker)}catch(_){ }
    const ko=['005930','000660','108490'].includes(ticker);
    const body=`<div class="warning-card">이 종목은 “항상 추적 그룹”에 추가된 종목입니다. 현재 종합점수·PER/PBR·실적 상세는 자동 갱신 데이터에 편입되면서 채워집니다.</div><div class="detailblock"><h4>📉 실제 주가 차트</h4>${tvFrame(ticker)}</div><div class="detailblock"><h4>분류</h4><div>${ko?'한국 상장 참고종목':'글로벌 핵심 커버리지'}</div></div>`;
    showModal(`${ticker} — ${name}`,'핵심 커버리지 · 상세 데이터 확장 중',body);
  };

  window.downloadRadarSnapshot=async function(){
    const btn=document.getElementById('downloadSnapshotBtn');if(btn)btn.textContent='만드는 중…';
    try{
      const cssLinks=[...document.querySelectorAll('link[rel="stylesheet"]')];
      const css=(await Promise.all(cssLinks.map(l=>fetch(l.href,{cache:'no-store'}).then(r=>r.text()).catch(()=>'')))).join('\n');
      const clone=document.documentElement.cloneNode(true);
      clone.querySelectorAll('script,link[rel="stylesheet"]').forEach(x=>x.remove());
      clone.querySelector('#modal')?.remove();
      const style=document.createElement('style');style.textContent=css;clone.querySelector('head').appendChild(style);
      clone.querySelectorAll('[onclick]').forEach(x=>x.removeAttribute('onclick'));
      const stamp=new Date().toISOString().slice(0,16).replace(/[:T]/g,'-');
      const blob=new Blob(['<!doctype html>'+clone.outerHTML],{type:'text/html;charset=utf-8'});
      const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`Market_Radar_${stamp}.html`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),3000);
      if(btn)btn.textContent='HTML 저장';
    }catch(err){if(btn)btn.textContent='HTML 저장';window.open(location.href,'_blank')}
  };

  function install(){
    if(!document.querySelector('#app .sec')||document.getElementById('enhancement-installed'))return false;
    const mark=document.createElement('div');mark.id='enhancement-installed';mark.hidden=true;document.body.appendChild(mark);
    const top=document.querySelector('.top');
    if(top){const tools=document.createElement('div');tools.className='download-tools';tools.innerHTML=`<button id="downloadSnapshotBtn" onclick="downloadRadarSnapshot()">⬇ HTML 저장</button><a href="https://github.com/kimjae134679/stock" target="_blank" rel="noopener">GitHub</a>`;top.appendChild(tools)}
    const charts=document.getElementById('charts');
    if(charts){const help=document.createElement('div');help.className='chart-help';help.innerHTML=`<b>그래프 읽는 법</b><br><span class="chart-unit">왼쪽: 매수타이밍 점수 0~100</span><span class="chart-unit">오른쪽: QQQ 실제 가격 USD</span><br><strong>선이 평평하면 “문제”가 아니라 기록 시점 사이 값이 거의 안 변했다는 뜻</strong>입니다. 매수타이밍 그래프는 주가 그래프가 아니며, 실제 종목 차트는 바로 아래 TradingView 섹션과 종목 상세에서 봅니다.`;charts.insertBefore(help,charts.children[1]||null)}
    const picks=document.getElementById('picks');
    if(picks){const sec=document.createElement('section');sec.className='sec';sec.id='coverage-groups';sec.innerHTML=`<div class="sectionhead"><div><h2>🧩 핵심 커버리지 그룹</h2><div class="muted">비슷한 기업끼리 묶어서 “누가 같은 돈을 먹고 있는지” 비교합니다. 한국주는 별도 참고그룹으로만 포함.</div></div></div><div class="group-board">${GROUPS.map(g=>`<div class="group-card"><h3>${e(g.name)}</h3><p>${e(g.why)}</p><div class="group-tickers">${g.items.map(([t,n])=>`<span class="clickable" onclick="openCoverage('${t}','${e(n)}')">${e(t)} · ${e(n)}</span>`).join('')}</div></div>`).join('')}</div>`;picks.after(sec)}
    const hist=document.getElementById('history');
    if(hist){const sec=document.createElement('section');sec.className='sec';sec.id='false-positive-replay';sec.innerHTML=`<h2>🧯 과거 오판·폭락 방지 Replay</h2><div class="warning-card"><b>목적:</b> “지금 싸다”는 신호가 과거에도 떴는데 그 뒤 더 폭락했다면 매수점수를 깎습니다. 아래는 우선 확인한 대표 실패위험 사례이며, 자동화는 앞으로 각 종목을 point-in-time 데이터로 반복 재현해 false-positive 비율을 누적합니다.</div><div class="tablewrap"><table class="fulltable compact"><thead><tr><th>날짜</th><th>종목</th><th>당시 사건</th><th>전략에 반영할 교훈</th><th>원문</th></tr></thead><tbody>${REPLAY.map(r=>`<tr><td>${e(r.date)}</td><td><b>${e(r.asset)}</b></td><td class="left">${e(r.event)}</td><td class="left">${e(r.lesson)}</td><td><a href="${r.url}" target="_blank" rel="noopener">보기</a></td></tr>`).join('')}</tbody></table></div><div class="replay-table-note">정식 전수 백테스트 결과를 가장하지 않습니다. 이후 자동화에서 과거 시점 당시 공개정보만 사용해 1m/3m/6m/12m 후 최대추가하락(MAE)과 수익률을 누적합니다.</div>`;hist.after(sec)}
    try{renderLive()}catch(_){ }
    return true;
  }
  const timer=setInterval(()=>{if(install())clearInterval(timer)},150);
  setTimeout(()=>clearInterval(timer),15000);
})();
