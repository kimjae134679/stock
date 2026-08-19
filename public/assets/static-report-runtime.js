(()=>{
  'use strict';
  const dataEl=document.getElementById('mrEmbedded');
  if(!dataEl)return;
  let DATA={};
  try{DATA=JSON.parse(dataEl.textContent||'{}')}catch(err){console.error('[Market Radar] embedded data parse failed',err);return}
  const qs=(s,r=document)=>r.querySelector(s);
  const qsa=(s,r=document)=>[...r.querySelectorAll(s)];
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const modal=qs('#modal'),body=qs('#modalBody');
  const names=window.MR_NAMES||{};
  const details=DATA.details||{};
  const picks=DATA.top_picks||[];
  function show(title,sub,html){
    const t=qs('#modalTitle'),s=qs('#modalSub');
    if(t)t.textContent=title;if(s)s.textContent=sub||'';if(body)body.innerHTML=html;if(modal)modal.classList.add('open');
  }
  function close(){if(modal)modal.classList.remove('open')}
  const closeBtn=qs('#modalClose');if(closeBtn)closeBtn.onclick=close;
  if(modal)modal.addEventListener('click',e=>{if(e.target===modal)close()});
  qsa('[data-go]').forEach(b=>b.onclick=()=>document.getElementById(b.dataset.go)?.scrollIntoView({behavior:'smooth',block:'start'}));
  qsa('[data-fold]').forEach(b=>{
    const id=b.dataset.fold,sec=document.getElementById(id);
    try{if(localStorage.getItem('fold:'+id)==='1'){sec?.classList.add('is-folded');b.textContent='펼치기'}}catch{}
    b.onclick=()=>{const folded=sec?.classList.toggle('is-folded');b.textContent=folded?'펼치기':'접기';try{localStorage.setItem('fold:'+id,folded?'1':'0')}catch{}};
  });
  function tv(t){
    const kr=/^\d{6}$/.test(t),sym=(kr?'KRX:':'NASDAQ:')+t;
    return `<iframe class="static-tv" loading="lazy" src="https://s.tradingview.com/widgetembed/?symbol=${encodeURIComponent(sym)}&interval=D&theme=dark&style=1&timezone=Asia%2FSeoul&withdateranges=1&hideideas=1"></iframe><details class="chart-fallback"><summary>다른 차트</summary>${kr?'':`<img src="https://charts2.finviz.com/chart.ashx?t=${encodeURIComponent(t)}&ty=c&ta=1&p=d&s=l" alt="${esc(t)} 대체 가격차트">`}<div class="chart-links"><a target="_blank" rel="noopener" href="https://www.google.com/finance/quote/${encodeURIComponent(t)}:${kr?'KRX':'NASDAQ'}">Google Finance</a><a target="_blank" rel="noopener" href="https://www.tradingview.com/symbols/${encodeURIComponent(t)}/">TradingView</a></div></details>`;
  }
  function openTicker(t){
    const p=picks.find(x=>x.ticker===t)||{},x=details[t]||{};
    const name=p.name||x.name||names[t]||t;
    const blocks=[['한줄 평가',x.summary||p.note],['최근 실적',x.earnings],['가이던스·전망',x.outlook||x.guidance],['PER·PBR / 밸류',x.valuation],['유동자산·부채·차입',x.balance],['현금흐름 / FCF',x.cashflow],['쉽게 말해',x.simple],['AI·테마 수혜/위협',x.theme_effect||x.ai_effect],['오를 논리 (Bull)',x.bull],['깨지는 조건 (Bear)',x.bear]].filter(z=>z[1]).map(z=>`<div class="detailblock"><h4>${esc(z[0])}</h4><div>${esc(z[1])}</div></div>`).join('');
    show(`${t} — ${name}`,`${p.phase||'추적중'} · ${p.action||'관찰'}`,`<div class="metrics"><div class="metric">종합<b>${esc(p.score??'—')}</b></div><div class="metric">매수<b>${esc(p.timing??'—')}</b></div><div class="metric">부의성장<b>${esc(p.wealth??'—')}</b></div></div><div class="detailblock"><h4>실제 주가 차트</h4>${tv(t)}</div>${blocks||'<div class="detailblock"><h4>상세</h4><div>현재 전체 추적 유니버스에 포함. 확인된 공개자료부터 실적·재무 상세를 채웁니다.</div></div>'}`);
  }
  qsa('[data-ticker]').forEach(el=>el.addEventListener('click',()=>openTicker(el.dataset.ticker)));
  qsa('[data-theme]').forEach(el=>el.addEventListener('click',()=>{
    const t=(DATA.themes||[]).find(x=>x.key===el.dataset.theme);if(!t)return;
    const rel=picks.filter(p=>p.theme===t.key);
    show(`${t.emoji||''} ${t.name}`,t.phase,`<div class="metrics"><div class="metric">테마점수<b>${esc(t.score??'—')}</b></div><div class="metric">매수<b>${esc(t.timing??'—')}</b></div><div class="metric">과열<b>${esc(t.overheat??'—')}</b></div><div class="metric">상승여력<b>${esc(t.upside??'—')}</b></div></div><div class="detailblock"><h4>현재 평가</h4><div>${esc(t.action||'')}</div></div><div class="detailblock"><h4>대표 종목/ETF</h4>${rel.map(p=>`<button class="pill modalTicker" data-x="${esc(p.ticker)}">${esc(p.ticker)} — ${esc(p.name)}</button>`).join(' ')}</div>`);
    qsa('.modalTicker',body).forEach(b=>b.onclick=()=>openTicker(b.dataset.x));
  }));
  qsa('[data-expanded]').forEach(el=>el.onclick=()=>{
    const x=(DATA.expanded_themes||[]).find(y=>(y.key||y.name)===el.dataset.expanded);if(!x)return;
    show(x.name,x.phase,`<div class="metrics"><div class="metric">점수<b>${esc(x.score??'—')}</b></div><div class="metric">순위<b>#${esc(x.rank??'—')}</b></div></div><div class="detailblock"><h4>핵심 논리</h4><div>${esc(x.thesis||'')}</div></div><div class="detailblock"><h4>대표 종목</h4>${(x.tickers||[]).map(t=>`<button class="pill modalTicker" data-x="${esc(t)}">${esc(t)}</button>`).join(' ')}</div><div class="detailblock"><h4>위험</h4><div>${esc(x.risk||'')}</div></div>`);
    qsa('.modalTicker',body).forEach(b=>b.onclick=()=>openTicker(b.dataset.x));
  });
  qsa('[data-etf-tab]').forEach(b=>b.onclick=()=>{
    qsa('[data-etf-tab]').forEach(x=>x.classList.toggle('active',x===b));
    const us=qs('#usEtfGrid'),kr=qs('#krEtfGrid');if(us)us.hidden=b.dataset.etfTab!=='us';if(kr)kr.hidden=b.dataset.etfTab!=='kr';
  });
  qsa('[data-etf-id]').forEach(el=>el.onclick=()=>{
    const list=DATA.etf_lists?.[el.dataset.etfKind]||[];
    const x=list.find(z=>(z.ticker||z.code)===el.dataset.etfId)||{};
    const id=x.ticker||x.code||el.dataset.etfId;
    show(`${id} — ${x.name||'ETF'}`,`${x.theme||''} · 점수 ${esc(x.score??'—')}`,`${el.dataset.etfKind==='us'?`<div class="detailblock"><h4>실제 ETF 차트</h4>${tv(id)}</div>`:''}<div class="detailblock"><h4>왜 보는 ETF?</h4><div>${esc(x.note||x.thesis||'테마 분산 접근')}</div></div><div class="detailblock"><h4>구성·비용·중복</h4><div>${esc(x.holdings||x.composition||'공식 운용사 데이터 확인')}<br>${esc(x.fee||x.expense||'비용 확인')}<br>${esc(x.overlap||'QQQ/기존 노출과 중복 확인')}</div></div>`);
  });
  qsa('[data-research]').forEach(el=>el.onclick=()=>{
    const r=(DATA.research||[]).find(x=>x.org===el.dataset.research);if(!r)return;
    show(r.org,`${r.stance||''} · 신뢰도 ${esc(r.confidence||'—')}`,`<div class="detailblock"><h4>무슨 주장?</h4><div>${esc(r.take||'')}</div></div><div class="detailblock"><h4>근거</h4><div>${esc(r.evidence||'공개 원문 기준')}</div></div><div class="detailblock"><h4>우리 모델과 일치/충돌</h4><div>${esc(r.conflict||'보조자료로 반영')}</div></div><div class="detailblock"><h4>그래서 우리는?</h4><div>${esc(r.action||'')}</div></div>`);
  });
  let filter='all';
  function applyFilter(){const q=(qs('#pickSearch')?.value||'').toLowerCase();qsa('[data-pick-card]').forEach(el=>{const ok=(filter==='all'||el.dataset.themeKey===filter)&&(!q||(el.dataset.search||'').includes(q));el.style.display=ok?'grid':'none'})}
  const search=qs('#pickSearch');if(search)search.addEventListener('input',applyFilter);
  qsa('[data-pick-filter]').forEach(b=>b.onclick=()=>{filter=b.dataset.pickFilter;qsa('[data-pick-filter]').forEach(x=>x.classList.toggle('active',x===b));applyFilter()});
  qsa('[data-chart-ticker]').forEach(b=>b.onclick=()=>{
    qsa('[data-chart-ticker]').forEach(x=>x.classList.toggle('active',x===b));const t=b.dataset.chartTicker;
    const chart=qs('#mainChart');if(chart)chart.src=`https://s.tradingview.com/widgetembed/?symbol=${encodeURIComponent('NASDAQ:'+t)}&interval=D&theme=dark&style=1&timezone=Asia%2FSeoul&withdateranges=1&hideideas=1`;
    const fb=qs('#chartFallback');if(fb)fb.innerHTML=`<img alt="${esc(t)} 대체 가격차트" src="https://charts2.finviz.com/chart.ashx?t=${encodeURIComponent(t)}&ty=c&ta=1&p=d&s=l"><div class="chart-links"><a target="_blank" rel="noopener" href="https://www.google.com/finance/quote/${encodeURIComponent(t)}:NASDAQ">Google Finance</a><a target="_blank" rel="noopener" href="https://www.tradingview.com/symbols/${encodeURIComponent(t)}/">TradingView</a></div>`;
  });
  const save=qs('#saveHtml');if(save)save.onclick=()=>{const blob=new Blob(['<!doctype html>'+document.documentElement.outerHTML],{type:'text/html;charset=utf-8'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='US_Market_Daily_'+new Date().toISOString().slice(0,10)+'.html';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)};
  setInterval(async()=>{try{const r=await fetch('../data/latest.json?check='+Date.now(),{cache:'no-store'});if(!r.ok)return;const n=await r.json();if(n.updated_at&&DATA.updated_at&&n.updated_at!==DATA.updated_at)location.reload()}catch{}},5*60*1000);
})();