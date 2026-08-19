(function(){
  'use strict';
  const app=document.getElementById('app');
  if(!app)return;
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const arr=v=>Array.isArray(v)?v:[];
  const coreIds=['themes','action','charts','picks','expanded','etfs','allocation','research','history','macro'];
  function fullReady(){return app.dataset.failsafe!=='1'&&coreIds.every(id=>document.getElementById(id));}
  function needsUpgrade(){return app.dataset.failsafe==='1'||/불러오는 중|불러오는중|동기화 중/.test(app.textContent||'')||!coreIds.every(id=>document.getElementById(id));}
  function emergency(d,why){
    const m=d?.market||{},themes=arr(d?.themes).sort((a,b)=>(b.score||0)-(a.score||0)),picks=arr(d?.top_picks).sort((a,b)=>(b.score||0)-(a.score||0)),expanded=arr(d?.expanded_themes).sort((a,b)=>(b.score||0)-(a.score||0));
    const etfs=[...arr(d?.etf_lists?.us_listed),...arr(d?.etf_lists?.us),...arr(d?.etf_lists?.kr_listed),...arr(d?.etf_lists?.kr)];
    const alloc=arr(d?.model_allocation),research=arr(d?.research),hist=arr(d?.strategy_validation?.scores),macro=arr(d?.macro),refs=arr(d?.reference_sources);
    app.innerHTML=`<div class="notice boot-warning"><b>FULL 복구모드</b> · 메인 렌더러를 자동 복구하지 못해 데이터 자체를 직접 표시합니다.${why?`<br><small>${esc(why)}</small>`:''}</div>
    <section class="hero" id="market"><div class="muted">RECOVERED SNAPSHOT · ${esc(d?.date||'')}</div><h1>${esc(m.phase||'시장 데이터')}</h1><div class="hero-action">${esc(m.action||'')}</div><p>${esc(m.summary||'')}</p><div class="hero-final">🎯 ${esc(m.final_action||m.action||'')}</div><div class="scores"><div class="s">시장위험<b>${esc(m.risk??'—')}</b></div><div class="s">저점<b>${esc(m.bottom_score??'—')}</b></div><div class="s">고점위험<b>${esc(m.top_risk??'—')}</b></div><div class="s">추세확인<b>${esc(m.trend_confirmation??'—')}</b></div><div class="s">매수타이밍<b>${esc(m.buy_timing??'—')}</b></div></div></section>
    <section class="sec" id="themes"><h2>🎨 현재 테마 흐름</h2><div class="grid">${themes.map((t,i)=>`<div class="card theme"><div class="rank">#${i+1}</div><b>${esc(t.emoji||'')} ${esc(t.name||t.key||'')} · ${esc(t.score??'—')}</b><div class="phase">${esc(t.phase||'')}</div><div class="kv"><span>매수</span><b>${esc(t.timing??'—')}</b><span>과열</span><b>${esc(t.overheat??'—')}</b><span>상승여력</span><b>${esc(t.upside??'—')}</b></div><div class="actionline">${esc(t.action||'')}</div></div>`).join('')}</div></section>
    <section class="sec" id="action"><h2>🧭 현재 행동 가이드</h2><div class="actiongrid"><div class="card"><b>지금</b><p>${esc(m.final_action||m.action||'')}</p></div><div class="card"><b>공격 전환 조건</b><p>${esc(m.next_trigger||'')}</p></div><div class="card"><b>피할 것</b><p>${esc(m.avoid||'')}</p></div></div></section>
    <section class="sec" id="charts"><h2>📈 그래프 · 실제주가 · 시간별</h2><div class="notice">메인 차트 렌더러 복구 대기 중. 종목 상세/외부차트 fallback은 계속 사용할 수 있습니다.</div></section>
    <section class="sec" id="picks"><h2>🏆 종목·ETF 전체 핵심판</h2><div class="picklist">${picks.map(p=>`<div class="pick"><div><strong>${esc(p.ticker)} — ${esc(p.name)}</strong><span class="muted">${esc(p.phase||'')} · ${esc(p.action||'')} · ${esc(p.note||'')}</span></div><div class="score">${esc(p.score??'—')}</div></div>`).join('')}</div></section>
    <section class="sec" id="expanded"><h2>🍯 숨은 수혜·다음테마</h2><div class="expanded">${expanded.map(x=>`<div class="card"><b>#${esc(x.rank??'—')} ${esc(x.name)} · ${esc(x.score??'—')}</b><div>${esc(x.thesis||'')}</div><div class="riskline">${esc(x.risk||'')}</div></div>`).join('')}</div></section>
    <section class="sec" id="etfs"><h2>🧺 테마 ETF — 국내/미국</h2><div class="etfgrid">${etfs.map(x=>`<div class="card"><b>${esc(x.ticker||x.code)} — ${esc(x.name)}</b><div>${esc(x.theme||'')}</div><div class="muted">${esc(x.action||x.note||'')}</div></div>`).join('')}</div></section>
    <section class="sec" id="allocation"><h2>🎯 모델 추천비중 100%</h2><div class="tablewrap"><table class="fulltable compact"><tbody>${alloc.map(x=>`<tr><td>${esc(x.asset)}</td><td><b>${esc(x.weight)}%</b></td><td>${esc(x.category||'')}</td></tr>`).join('')}</tbody></table></div></section>
    <section class="sec" id="research"><h2>🏦 국내·미국 리서치/기관</h2><div class="research">${research.map(r=>`<div class="card"><b>${esc(r.org)} · ${esc(r.score??'—')}</b><div>${esc(r.take||'')}</div><div class="muted">${esc(r.action||'')}</div></div>`).join('')}</div></section>
    <section class="sec" id="history"><h2>🧪 과거 전략검증</h2><div class="tablewrap"><table class="fulltable compact"><tbody>${hist.map(x=>`<tr><td>${esc(x.date)}</td><td><b>${esc(x.score)}</b></td></tr>`).join('')}</tbody></table></div></section>
    ${refs.length?`<section class="sec" id="sources"><h2>🔎 참고 사이트·원문·데이터</h2><div class="sources">${refs.map(r=>`<div class="card"><b>${esc(r.name)}</b><div>${esc(r.use||'')}</div></div>`).join('')}</div></section>`:''}
    <section class="sec" id="macro"><h2>🌍 거시·국제경제</h2><div class="macro">${macro.map(x=>`<div class="card"><b>${esc(x.title)}</b><div>${esc(x.value)}</div><div class="muted">${esc(x.meaning)}</div></div>`).join('')}</div></section>`;
    app.dataset.failsafe='0';
    document.documentElement.classList.add('safe-report-mode');
  }
  async function recover(){
    if(!needsUpgrade())return;
    try{
      const base=window.REPORT_DATA||'../data/latest.json';
      const r=await fetch(base+(base.includes('?')?'&':'?')+'boot='+Date.now(),{cache:'no-store'});
      if(!r.ok)throw new Error('latest.json HTTP '+r.status);
      const d=await r.json();
      let rendered=false;
      try{
        if(typeof render==='function'){
          render(d);
          rendered=coreIds.every(id=>document.getElementById(id));
          if(rendered){app.dataset.failsafe='0';try{D=d}catch(_){};return;}
        }
      }catch(err){emergency(d,'render() 실패: '+(err?.message||err));return;}
      emergency(d,'FULL renderer 함수가 준비되지 않음');
    }catch(err){
      if(needsUpgrade())app.innerHTML=`<div class="notice"><b>데이터 로드 실패</b><br>${esc(err?.message||err)}<br><button onclick="location.reload()">다시 시도</button></div>`;
    }
  }
  setTimeout(recover,550);
  setTimeout(()=>{if(!fullReady())recover()},1800);
  setTimeout(()=>{if(!fullReady())recover()},4500);
})();