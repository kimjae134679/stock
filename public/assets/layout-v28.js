(()=>{
'use strict';
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const COMPOUND=['ANET','MSFT','AVGO','COST','V','MA','SPGI','MCO','CTAS','PWR','ETN','WM','RSG','ORLY','AZO','QQQ','VGT','XLK','SCHG'];
const GROUPS=[
 ['AI·네트워크·플랫폼',['ANET','MSFT','AVGO']],
 ['결제·금융데이터',['V','MA','SPGI','MCO']],
 ['인프라·전력',['PWR','ETN']],
 ['안정 서비스·방어',['COST','CTAS','WM','RSG']],
 ['자동차 애프터마켓',['ORLY','AZO']],
 ['장기 성장 ETF',['QQQ','VGT','XLK','SCHG']]
];
const NAMES={ANET:'Arista Networks',MSFT:'Microsoft',AVGO:'Broadcom',COST:'Costco',V:'Visa',MA:'Mastercard',SPGI:'S&P Global',MCO:"Moody's",CTAS:'Cintas',PWR:'Quanta Services',ETN:'Eaton',WM:'Waste Management',RSG:'Republic Services',ORLY:"O'Reilly Automotive",AZO:'AutoZone',QQQ:'Invesco QQQ',VGT:'Vanguard IT ETF',XLK:'Technology Select Sector SPDR',SCHG:'Schwab U.S. Large-Cap Growth ETF'};
const EX={ANET:'NYSE',MSFT:'NASDAQ',AVGO:'NASDAQ',COST:'NASDAQ',V:'NYSE',MA:'NYSE',SPGI:'NYSE',MCO:'NYSE',CTAS:'NASDAQ',PWR:'NYSE',ETN:'NYSE',WM:'NYSE',RSG:'NYSE',ORLY:'NASDAQ',AZO:'NYSE',QQQ:'NASDAQ',VGT:'AMEX',XLK:'AMEX',SCHG:'AMEX'};
const COMMENTS={
 ANET:'장기 성장성은 높지만 단기 과열·네트워크 CAPEX 둔화 여부를 함께 본다.',MSFT:'클라우드·AI 현금창출력이 강한 코어 후보. 급등 구간 추격보다 조정 분할이 낫다.',AVGO:'AI 네트워크·반도체 구조수혜가 강하지만 밸류와 변동성은 확인한다.',COST:'실적 안정성과 회원제 해자가 강한 방어형 우상향 후보.',V:'결제 네트워크 해자와 현금흐름이 장기 복리에 유리한 편.',MA:'Visa와 유사한 구조적 결제 성장. 밸류가 과도할 때는 기다린다.',SPGI:'지수·신용평가·데이터의 반복매출이 강점. 경기/발행시장 둔화는 체크.',MCO:'신용평가·데이터 사업의 질이 높지만 채권 발행 사이클 영향을 받는다.',CTAS:'반복 서비스 매출과 높은 실행력이 강점. 비싼 밸류가 주요 위험.',PWR:'전력망·데이터센터 CAPEX 장기수혜. 프로젝트 사이클과 밸류 확인.',ETN:'전력 인프라 병목의 대표 수혜주. 장기 좋지만 고점 추격은 자제.',WM:'폐기물 처리의 안정적 현금흐름과 가격결정력이 장기 복리에 유리.',RSG:'WM과 비슷한 방어형 구조. 경기민감도가 낮고 현금흐름이 안정적.',ORLY:'자동차 애프터마켓의 꾸준한 수요와 자사주가 강점. 밸류 확인.',AZO:'경기 방어적 애프터마켓 + 자사주 효과. 급등 뒤에는 진입을 나눈다.',QQQ:'개별주보다 분산된 성장 코어. 시장 전체 고점 위험과 금리에 민감.',VGT:'미국 기술주 장기성장 바스켓. 섹터 집중도는 감수해야 한다.',XLK:'대형 기술주 중심 코어 ETF. MSFT/NVDA 등 상위 집중도 확인.',SCHG:'대형 성장주 분산 ETF. 기술주 외 성장주까지 넓게 담는 장점.'
};
function tvSymbol(t){return `${EX[t]||'NASDAQ'}:${t}`}
function chart(t){return `<div class="v28-mini-tv"><iframe loading="lazy" title="${t} chart" src="https://s.tradingview.com/widgetembed/?symbol=${encodeURIComponent(tvSymbol(t))}&interval=1W&theme=dark&style=1&timezone=Asia%2FSeoul&hideideas=1&withdateranges=1"></iframe></div>`}
function score(t){const d=window.__MR_D||{};const p=(Array.isArray(d.top_picks)?d.top_picks:[]).find(x=>x.ticker===t);return p?.score??null}
function rankCard(t,i){const s=score(t);return `<article class="v28-rank-card"><div class="v28-rank-head"><b>#${i+1} ${t} · ${NAMES[t]||t}</b><span>${s!=null?'모델 '+s:'장기품질'}</span></div><p>${COMMENTS[t]||'장기 품질과 가격 위치를 함께 확인한다.'}</p>${chart(t)}</article>`}
function buildCompound(){const sec=$('#mr-compounders');if(!sec||sec.dataset.v28==='1')return;sec.dataset.v28='1';sec.classList.remove('is-folded');const btn=$('[data-fold="mr-compounders"]');if(btn)btn.textContent='접기';const h=$('.fold-head h2',sec);if(h)h.textContent='📈 안정적·꾸준한 우상향 후보';const body=$('.fold-body',sec);if(!body)return;
 const grouped=GROUPS.map(([name,ts])=>`<section class="v28-cgroup"><h3>${name}</h3><div class="v28-chart-grid">${ts.map(t=>rankCard(t,COMPOUND.indexOf(t))).join('')}</div></section>`).join('');
 const ranked=`<section class="v28-ranked"><h3>🏅 현재 우선순위별</h3><p class="muted">순위는 '무조건 매수' 순위가 아니라 장기 품질·구조 성장·안정성을 우선한 감시 순서다. 실제 진입은 각 종목의 현재 가격 위치와 매수타이밍을 같이 본다.</p><div class="v28-rank-list">${COMPOUND.map((t,i)=>`<button type="button" class="v28-rank-row" data-ticker="${t}"><b>#${i+1} ${t}</b><span>${NAMES[t]||t}</span><em>${score(t)!=null?'모델 '+score(t):'장기품질'}</em></button>`).join('')}</div></section>`;
 body.innerHTML=`<div class="v28-note"><b>📌 우상향 후보를 다시 따로 모았다.</b><span>테마별 묶음에서는 각 후보의 주봉 그래프를 바로 비교하고, 아래 순위별 목록에서는 현재 감시 우선순위를 본다.</span></div>${grouped}${ranked}`;
 // base binding은 이미 끝났으므로 순위 행은 기존 동일 티커 버튼을 찾아 상세를 연다.
 $$('.v28-rank-row',body).forEach(b=>b.onclick=()=>{const t=b.dataset.ticker;const src=[...document.querySelectorAll(`[data-ticker="${t}"]`)].find(x=>x!==b&&!x.classList.contains('v28-rank-row'));src?.click()});
}
function buildUniverseTabs(){const sec=$('#mr-universe');if(!sec||sec.dataset.v28==='1')return;const body=$('.fold-body',sec);const grouped=$('.group-board',body),all=$('.all-universe',body);if(!body||!grouped||!all)return;sec.dataset.v28='1';const evalBox=$('.v26-section-eval',body);const wrap=document.createElement('div');wrap.className='v28-universe';wrap.innerHTML=`<div class="v28-tabs"><button class="active" data-u="theme">테마별</button><button data-u="all">전부 모아보기</button></div><div class="v28-u-panel" data-up="theme"></div><div class="v28-u-panel" data-up="all" hidden></div>`;if(evalBox)evalBox.insertAdjacentElement('afterend',wrap);else body.prepend(wrap);wrap.querySelector('[data-up="theme"]').appendChild(grouped);wrap.querySelector('[data-up="all"]').appendChild(all);$$('[data-u]',wrap).forEach(b=>b.onclick=()=>{$$('[data-u]',wrap).forEach(x=>x.classList.toggle('active',x===b));$$('[data-up]',wrap).forEach(p=>p.hidden=p.dataset.up!==b.dataset.u)});
}
const ACTION_COMMENT=[
 ['극단 저점','공포가 극단이면 코어만 1차 분할하고 현금을 남긴다. 3x는 확인 전 확대하지 않는다.'],
 ['저점 후보','작게 시작하고 실적 훼손 여부를 확인한다. 다음 확인 신호가 나오기 전에는 비중을 서두르지 않는다.'],
 ['바닥 형성','코어 비중을 단계적으로 늘린다. 20/50DMA 회복과 breadth 개선이 함께 나오면 공격도를 높인다.'],
 ['저점 → 상승','이미 강해진 승자 중 실적·추정치가 같이 좋아지는 종목을 우선 늘린다.'],
 ['중간 상승','보유는 추세를 따라가되 과집중을 줄이고 리밸런싱한다. 새 진입은 눌림을 기다린다.'],
 ['고점 근처','신규 추격을 줄이고 이익 일부를 보호한다. 현금을 확보하고 상대강도 살아나는 저평가 테마를 찾는다.'],
 ['과열','고베타와 레버리지를 먼저 줄인다. 신규 매수보다 방어·현금·다음 테마 준비가 우선이다.'],
 ['추세 붕괴','훼손 종목을 정리하고 현금을 유지한다. 평균단가 낮추기는 바닥 확인 뒤로 미룬다.']
];
function actionComments(){const sec=$('#action');if(!sec)return;$$('.phase-card',sec).forEach(card=>{if(card.dataset.v28==='1')return;card.dataset.v28='1';$$('small',card).forEach(s=>s.remove());const title=$('b',card)?.textContent||'';const found=ACTION_COMMENT.find(([k])=>title.includes(k));card.insertAdjacentHTML('beforeend',`<div class="v28-do"><b>그래서 지금은?</b><span>${found?found[1]:'현재 위치에서는 가격·추세·실적을 함께 확인하며 비중을 조절한다.'}</span></div>`)});
}
let locked=false,scrollY=0,modalHistory=false;
function lockModal(){if(locked)return;locked=true;scrollY=window.scrollY||0;document.body.style.position='fixed';document.body.style.top=`-${scrollY}px`;document.body.style.left='0';document.body.style.right='0';document.body.style.width='100%';if(!modalHistory){history.pushState({mrModal:true},'',location.href);modalHistory=true}}
function unlockModal(){if(!locked)return;locked=false;document.body.style.position='';document.body.style.top='';document.body.style.left='';document.body.style.right='';document.body.style.width='';window.scrollTo(0,scrollY)}
function closeByHistory(){const m=$('#modal');if(m?.classList.contains('open')&&modalHistory){history.back();return true}return false}
function modalGuard(){const m=$('#modal');if(!m)return;const sync=()=>m.classList.contains('open')?lockModal():unlockModal();sync();new MutationObserver(sync).observe(m,{attributes:true,attributeFilter:['class']});window.addEventListener('popstate',()=>{if(m.classList.contains('open')){m.classList.remove('open');modalHistory=false;unlockModal()}else{modalHistory=false}});document.addEventListener('click',e=>{if(!m.classList.contains('open'))return;if(e.target.closest('#modalClose')||e.target===m){e.preventDefault();e.stopImmediatePropagation();closeByHistory()}},true);document.addEventListener('keydown',e=>{if(e.key==='Escape'&&m.classList.contains('open')){e.preventDefault();closeByHistory()}},true)
}
function css(){if($('#v28css'))return;const s=document.createElement('style');s.id='v28css';s.textContent=`body.v28-modal-lock{overflow:hidden}.v28-note{display:flex;flex-direction:column;gap:5px;margin:0 0 16px;padding:13px 15px;border:1px solid #31506b;border-radius:13px;background:#0d1d2b}.v28-note span{color:#a9bdcf}.v28-cgroup{margin:22px 0}.v28-cgroup h3,.v28-ranked h3{margin:0 0 10px}.v28-chart-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.v28-rank-card{background:#0d1722;border:1px solid #263548;border-radius:14px;padding:12px;min-width:0}.v28-rank-head{display:flex;justify-content:space-between;gap:10px}.v28-rank-head span{color:#7dd3fc;font-size:12px}.v28-rank-card p{min-height:42px;color:#b8c8d8}.v28-mini-tv{height:300px;border:1px solid #2b4056;border-radius:11px;overflow:hidden;background:#06101a}.v28-mini-tv iframe{width:100%;height:100%;border:0}.v28-rank-list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.v28-rank-row{display:grid;grid-template-columns:110px 1fr auto;gap:8px;text-align:left;align-items:center;padding:10px;border-radius:11px;border:1px solid #30465d;background:#101e2b;color:#eaf2fb;cursor:pointer}.v28-rank-row span{color:#a9bdcf}.v28-rank-row em{font-style:normal;color:#7dd3fc;font-size:11px}.v28-tabs{display:flex;gap:8px;margin:12px 0}.v28-tabs button{border:1px solid #33465d;background:#152334;color:#fff;border-radius:999px;padding:8px 13px;font-weight:800;cursor:pointer}.v28-tabs button.active{outline:2px solid #7dd3fc;background:#24384d}.v28-u-panel[hidden]{display:none!important}.v28-u-panel .all-universe{border-top:0!important;padding-top:0!important;margin-top:8px!important}.v28-do{margin-top:10px;padding-top:9px;border-top:1px dashed #33465d}.v28-do b{display:block;color:#7dd3fc;margin-bottom:4px}.v28-do span{color:#d6e3ef}.modal.open{overscroll-behavior:contain}.modal.open .sheet{overscroll-behavior:contain;-webkit-overflow-scrolling:touch}@media(max-width:900px){.v28-chart-grid,.v28-rank-list{grid-template-columns:1fr}.v28-mini-tv{height:280px}.v28-rank-row{grid-template-columns:90px 1fr auto}}@media(max-width:600px){.v28-mini-tv{height:250px}.v28-rank-row{grid-template-columns:75px 1fr}.v28-rank-row em{grid-column:2}}`;document.head.appendChild(s)}
function apply(){css();buildUniverseTabs();buildCompound();actionComments()}
function boot(){modalGuard();let tries=0;const t=setInterval(()=>{apply();tries++;if(tries>40)clearInterval(t)},250);new MutationObserver(()=>apply()).observe(document.getElementById('app')||document.body,{childList:true,subtree:true})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
