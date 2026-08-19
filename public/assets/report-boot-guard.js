(function(){
  'use strict';
  const app=document.getElementById('app');
  if(!app)return;
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const arr=v=>Array.isArray(v)?v:[];
  function stillLoading(){return /불러오는 중|불러오는중|동기화 중/.test(app.textContent||'');}
  function fallback(d){
    const m=d&&d.market||{};
    const themes=arr(d&&d.themes).slice().sort((a,b)=>(b.score||0)-(a.score||0));
    const picks=arr(d&&d.top_picks).slice().sort((a,b)=>(b.score||0)-(a.score||0));
    const expanded=arr(d&&d.expanded_themes).slice().sort((a,b)=>(b.score||0)-(a.score||0));
    app.innerHTML=`<section class="hero" id="market"><div class="muted">MARKET RADAR · SAFE MODE</div><h1>${esc(m.phase||'시장 데이터')}</h1><div class="hero-action">${esc(m.action||'')}</div><p>${esc(m.summary||'')}</p><div class="hero-final">🎯 최종 행동: ${esc(m.final_action||m.action||'')}</div><div class="scores"><div class="s">시장위험<b>${esc(m.risk??'—')}</b></div><div class="s">저점<b>${esc(m.bottom_score??'—')}</b></div><div class="s">고점위험<b>${esc(m.top_risk??'—')}</b></div><div class="s">추세확인<b>${esc(m.trend_confirmation??'—')}</b></div><div class="s">매수타이밍<b>${esc(m.buy_timing??'—')}</b></div></div></section>
    <section class="sec" id="themes"><h2>🎨 현재 테마 흐름</h2><div class="grid">${themes.map((t,i)=>`<div class="card theme"><div class="rank">#${i+1}</div><b>${esc(t.emoji||'')} ${esc(t.name||t.key||'테마')} · ${esc(t.score??'—')}</b><div class="phase">${esc(t.phase||'')}</div><div class="kv"><span>매수타이밍</span><b>${esc(t.timing??'—')}</b><span>과열위험</span><b>${esc(t.overheat??'—')}</b><span>상승여력</span><b>${esc(t.upside??'—')}</b></div><div class="actionline">${esc(t.action||'')}</div></div>`).join('')}</div></section>
    <section class="sec" id="action"><h2>🧭 현재 행동 가이드</h2><div class="actiongrid"><div class="card action-now"><b>✅ 지금</b><p>${esc(m.now_action||m.final_action||m.action||'')}</p></div><div class="card"><b>⏳ 기다린다</b><p>${esc(m.wait_action||m.next_trigger||'')}</p></div><div class="card"><b>⚠️ 피할 것</b><p>${esc(m.avoid||'')}</p></div></div></section>
    <section class="sec" id="picks"><h2>🏆 종목·ETF 우선순위</h2><div class="picklist">${picks.map(p=>`<div class="pick"><div class="line"></div><div><strong>${esc(p.ticker||'')} — ${esc(p.name||'')}</strong><span class="muted">${esc(p.phase||'')} · ${esc(p.action||'')} · ${esc(p.note||'')}</span></div><div class="score">${esc(p.score??'—')}</div></div>`).join('')}</div></section>
    <section class="sec" id="expanded"><h2>🍯 숨은 수혜·다음테마</h2><div class="expanded">${expanded.map(x=>`<div class="card"><div class="rank">#${esc(x.rank??'—')}</div><b>${esc(x.name||x.key||'')} · ${esc(x.score??'—')}</b><div class="phase">${esc(x.phase||'')}</div><div>${esc(x.thesis||'')}</div><div class="riskline">${esc(x.risk||'')}</div></div>`).join('')}</div></section>
    <div class="notice boot-warning"><b>안전 모드로 표시 중.</b> 메인 렌더러가 늦거나 실패해도 핵심 데이터는 표시됩니다. 새로고침 시 메인 UI를 다시 시도합니다.</div>`;
    document.documentElement.classList.add('safe-report-mode');
  }
  setTimeout(async()=>{
    if(!stillLoading())return;
    try{
      const base=window.REPORT_DATA||'../data/latest.json';
      const r=await fetch(base+(base.includes('?')?'&':'?')+'boot='+Date.now(),{cache:'no-store'});
      if(!r.ok)throw new Error('HTTP '+r.status);
      const d=await r.json();
      try{if(typeof render==='function'){render(d);if(!stillLoading())return}}catch(_){ }
      fallback(d);
    }catch(err){
      if(stillLoading())app.innerHTML=`<div class="notice"><b>데이터 로드 실패</b><br>${esc(err&&err.message||err)}<br><button onclick="location.reload()">다시 시도</button></div>`;
    }
  },1600);
})();
