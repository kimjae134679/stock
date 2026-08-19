/* Mobile stability renderer: self-contained, no heavy external iframes, no folded sections. */
(function(){
  'use strict';
  const mobile=window.matchMedia('(max-width: 760px)').matches || window.self!==window.top;
  if(!mobile)return;
  const app=document.getElementById('app');
  if(!app)return;
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const arr=v=>Array.isArray(v)?v:[];
  const n=v=>v===null||v===undefined||v===''?'—':v;
  function modal(title,sub,body){
    const m=document.getElementById('modal'); if(!m)return;
    document.getElementById('modalTitle').textContent=title;
    document.getElementById('modalSub').textContent=sub||'';
    document.getElementById('modalBody').innerHTML=body;
    m.classList.add('open');
  }
  function pickDetail(d,ticker){
    const p=arr(d.top_picks).find(x=>x.ticker===ticker)||{};
    const x=(d.details&&d.details[ticker])||{};
    const blocks=[['한줄 평가',x.summary||p.note],['최근 실적',x.earnings],['가이던스·전망',x.outlook||x.guidance],['밸류에이션',x.valuation],['재무상태',x.balance],['현금흐름',x.cashflow],['쉽게 말해',x.simple],['상승 논리',x.bull],['깨지는 조건',x.bear]].filter(z=>z[1]);
    const html=`<div class="metrics"><div class="metric">종합점수<b>${esc(n(p.score))}</b></div><div class="metric">매수타이밍<b>${esc(n(p.timing))}</b></div><div class="metric">부의성장<b>${esc(n(p.wealth))}</b></div></div>${blocks.map(z=>`<div class="detailblock"><h4>${esc(z[0])}</h4><div>${esc(z[1])}</div></div>`).join('')}<div class="detailblock"><h4>차트</h4><div class="muted">모바일 안정모드에서는 멈춤 방지를 위해 외부 TradingView/Finviz iframe을 자동으로 열지 않습니다.</div></div>`;
    modal(`${ticker} — ${p.name||x.name||''}`,`${p.phase||''} · ${p.action||''}`,html);
  }
  function section(id,title,body){return `<section class="sec mobile-stable-sec" id="${id}"><h2>${title}</h2>${body}</section>`}
  function renderStable(d){
    window.__MOBILE_STABLE_DATA__=d;
    document.documentElement.classList.add('mobile-stable-mode');
    document.querySelectorAll('.fold-toggle').forEach(x=>x.remove());
    document.querySelectorAll('.folded').forEach(x=>x.classList.remove('folded'));
    const m=d.market||{},themes=arr(d.themes).slice().sort((a,b)=>(b.score||0)-(a.score||0)),picks=arr(d.top_picks).slice().sort((a,b)=>(b.score||0)-(a.score||0)),expanded=arr(d.expanded_themes).slice().sort((a,b)=>(b.score||0)-(a.score||0));
    let h=`<section class="hero" id="market"><div class="muted">MOBILE STABLE · FULL DATA</div><h1>${esc(m.phase||'시장')}</h1><div class="hero-action">${esc(m.action||'')}</div><p>${esc(m.summary||'')}</p><div class="hero-final">🎯 최종 행동: ${esc(m.final_action||m.action||'')}</div><div class="scores"><div class="s">시장위험<b>${esc(n(m.risk))}</b></div><div class="s">저점<b>${esc(n(m.bottom_score))}</b></div><div class="s">고점위험<b>${esc(n(m.top_risk))}</b></div><div class="s">추세확인<b>${esc(n(m.trend_confirmation))}</b></div><div class="s">매수타이밍<b>${esc(n(m.buy_timing))}</b></div></div></section>`;
    h+=section('themes','🎨 현재 테마 흐름',`<div class="grid">${themes.map((t,i)=>`<div class="card theme"><div class="rank">#${i+1}</div><b>${esc(t.emoji||'')} ${esc(t.name||t.key||'')} · ${esc(n(t.score))}</b><div class="phase">${esc(t.phase||'')}</div><div class="kv"><span>매수타이밍</span><b>${esc(n(t.timing))}</b><span>과열위험</span><b>${esc(n(t.overheat))}</b><span>상승여력</span><b>${esc(n(t.upside))}</b></div><div class="actionline">${esc(t.action||'')}</div></div>`).join('')}</div>`);
    h+=section('action','🧭 현재 행동 가이드',`<div class="actiongrid"><div class="card action-now"><b>✅ 지금</b><p>${esc(m.now_action||m.final_action||m.action||'')}</p></div><div class="card"><b>⏳ 기다린다</b><p>${esc(m.wait_action||m.next_trigger||'')}</p></div><div class="card"><b>⚠️ 피할 것</b><p>${esc(m.avoid||'')}</p></div></div>`);
    h+=section('charts','📈 그래프',`<div class="notice"><b>모바일 안정모드</b><br>화면 멈춤을 막기 위해 외부 차트 iframe은 자동 로드하지 않습니다. 시장·종목 데이터는 모두 계속 표시됩니다.</div>`);
    h+=section('picks','🏆 종목·ETF 우선순위',`<div class="picklist">${picks.map((p,i)=>`<button type="button" class="pick mobile-pick" data-mobile-pick="${esc(p.ticker)}"><div class="line"></div><div><strong>#${i+1} ${esc(p.ticker)} — ${esc(p.name||'')}</strong><span class="muted">${esc(p.phase||'')} · ${esc(p.action||'')} · ${esc(p.note||'')}</span><span class="detailhint">터치 → 상세(가벼운 모달)</span></div><div class="score">${esc(n(p.score))}</div></button>`).join('')}</div>`);
    h+=section('popular-stocks','🌟 대표주',`<div class="notice">대표주 확장판은 메인 데이터에 포함된 종목을 우선 표시합니다. 종목 우선순위에서 전체 ${picks.length}개를 확인할 수 있습니다.</div>`);
    h+=section('quality-compounders','📈 우상향 품질 후보',`<div class="grid">${picks.filter(p=>(p.wealth||0)>=80).map(p=>`<div class="card"><b>${esc(p.ticker)} — ${esc(p.name||'')}</b><div>부의성장 ${esc(n(p.wealth))}</div><div class="muted">${esc(p.note||'')}</div></div>`).join('')||'<div class="notice">현재 조건에 맞는 후보 없음</div>'}</div>`);
    h+=section('expanded','🍯 숨은 수혜·다음테마',`<div class="expanded">${expanded.map(x=>`<div class="card"><div class="rank">#${esc(n(x.rank))}</div><b>${esc(x.name||x.key||'')} · ${esc(n(x.score))}</b><div class="phase">${esc(x.phase||'')}</div><div>${esc(x.thesis||'')}</div><div class="riskline">위험: ${esc(x.risk||'')}</div></div>`).join('')}</div>`);
    const us=arr(d.etf_lists&&d.etf_lists.us),kr=arr(d.etf_lists&&d.etf_lists.kr);
    h+=section('etfs','🧺 ETF',`<h3>🇺🇸 미국</h3><div class="grid">${us.map(x=>`<div class="card"><b>${esc(x.ticker||x.code||'')} — ${esc(x.name||'')}</b><div>${esc(x.theme||'')}</div><div class="muted">점수 ${esc(n(x.score))} · ${esc(x.action||x.note||'')}</div></div>`).join('')||'<div class="notice">목록 없음</div>'}</div><h3>🇰🇷 국내</h3><div class="grid">${kr.map(x=>`<div class="card"><b>${esc(x.ticker||x.code||'')} — ${esc(x.name||'')}</b><div>${esc(x.theme||'')}</div><div class="muted">점수 ${esc(n(x.score))} · ${esc(x.action||x.note||'')}</div></div>`).join('')||'<div class="notice">목록 없음</div>'}</div>`);
    h+=section('allocation','🎯 모델 추천비중',`<div class="grid">${arr(d.model_allocation).map(a=>`<div class="card"><b>${esc(a.asset||a.category||'')}</b><div class="phase">${esc(n(a.weight))}%</div><div class="muted">${esc(a.reason||a.category||'')}</div></div>`).join('')||'<div class="notice">비중 데이터 없음</div>'}</div>`);
    h+=section('research','🏦 리서치',`<div class="grid">${arr(d.research).map(r=>`<div class="card"><b>${esc(r.org||'')}</b><div>${esc(r.take||'')}</div><div class="muted">${esc(r.action||'')}</div></div>`).join('')||'<div class="notice">리서치 데이터 없음</div>'}</div>`);
    h+=section('history','🧪 과거 전략검증',`<div class="grid">${arr(d.strategy_validation&&d.strategy_validation.scores).map(x=>`<div class="card"><b>${esc(x.date||'')} · ${esc(n(x.score))}</b><div class="muted">${esc(x.note||'')}</div></div>`).join('')||'<div class="notice">검증 데이터 없음</div>'}</div>`);
    h+=section('macro','🌍 거시·국제경제',`<div class="grid">${arr(d.macro).map(x=>`<div class="card"><b>${esc(x.title||'')}</b><div>${esc(x.value||'')}</div><div class="muted">${esc(x.meaning||'')}</div></div>`).join('')||'<div class="notice">거시 데이터 없음</div>'}</div>`);
    app.innerHTML=h;
  }
  document.addEventListener('click',e=>{
    const b=e.target.closest('[data-mobile-pick]');
    if(!b)return;
    e.preventDefault();e.stopPropagation();
    const d=window.__MOBILE_STABLE_DATA__; if(d)pickDetail(d,b.dataset.mobilePick);
  },true);
  async function boot(){
    try{
      const p=window.REPORT_DATA||'../data/latest.json';
      const r=await fetch(p+(p.includes('?')?'&':'?')+'stable='+Date.now(),{cache:'no-store'});
      if(!r.ok)throw new Error('HTTP '+r.status);
      renderStable(await r.json());
    }catch(err){
      document.querySelectorAll('.folded').forEach(x=>x.classList.remove('folded'));
      document.querySelectorAll('.fold-toggle').forEach(x=>x.remove());
    }
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
