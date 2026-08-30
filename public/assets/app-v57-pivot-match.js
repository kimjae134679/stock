(()=>{
'use strict';

const $=(s,r=document)=>r?.querySelector?.(s)||null;
const arr=v=>Array.isArray(v)?v:[];
const n=v=>Number.isFinite(Number(v))?Number(v):null;
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=s=>{const p=String(s||'').split('-');return p.length===3?`${p[0]}.${p[1]}.${p[2]}`:String(s||'')};
const fm=s=>String(s||'').slice(0,7).replace('-','.');
const pct=v=>n(v)==null?'—':`${Number(v)>=0?'+':''}${Number(v).toFixed(1)}%`;
const WINDOW=504;
const FUTURE_DAYS=126;
const OUTCOME_HORIZONS=[21,63,126];
let D=null,W=null;

async function get(url){
 const r=await fetch(url+(url.includes('?')?'&':'?')+'pivot57='+Date.now(),{cache:'no-store'});
 if(!r.ok)throw new Error('HTTP '+r.status);
 return r.json();
}

function idx(date){
 if(D.map.has(date))return D.map.get(date);
 let lo=0,hi=D.rows.length-1;
 while(lo<hi){const m=(lo+hi)>>1;if(D.rows[m].date<date)lo=m+1;else hi=m}
 return lo;
}

function norm(v,b){return(v/b-1)*100}
function simMove(a,b,f=5){a=Math.abs(Number(a)||0);b=Math.abs(Number(b)||0);return Math.max(0,100*(1-Math.abs(a-b)/Math.max(f,a,b)))}
function simDays(a,b){a=Math.max(1,Number(a)||1);b=Math.max(1,Number(b)||1);return Math.max(0,100*(1-Math.min(1,Math.abs(Math.log(a/b))/0.9)))}

function current(){
 const c=W?.assets?.QQQ?.current_context,s=arr(c?.segments);
 if(!c||s.length<3)return null;
 const a=s.at(-1),p=s.at(-2),p2=s.at(-3);
 return{c,a,p,p2,anchor:idx(a.start_date),end:idx(c.current_date)};
}

function sampleAfter(anchor,days,base){
 const out=[];
 for(let i=0;i<=days;i++){
  const r=D.rows[anchor+i];
  if(!r)break;
  out.push(norm(r.close,base));
 }
 return out;
}

function shapeScore(cur,cand){
 const days=Math.min(cur.end-cur.anchor,35),cb=D.rows[cur.anchor]?.close,hb=D.rows[cand.anchor]?.close;
 if(!cb||!hb||days<5)return 0;
 const A=sampleAfter(cur.anchor,days,cb),B=sampleAfter(cand.anchor,days,hb);
 let e=0,m=0;
 for(let i=0;i<Math.min(A.length,B.length);i++){e+=(A[i]-B[i])**2;m++}
 if(m<5)return 0;
 const rm=Math.sqrt(e/m),scale=Math.max(7,Math.abs(cur.a.move_pct||0),Math.abs(B.at(-1)||0));
 return Math.max(0,100*(1-Math.min(1,rm/scale)));
}

function candidate(rep,cur){
 let l0,l1,anchorDate;
 if(rep?.prior_rise&&rep?.prior_fall){l0=rep.prior_rise;l1=rep.prior_fall;anchorDate=rep.anchor_date}
 else{
  const ls=arr(rep?.legs);
  if(ls.length<3)return null;
  l0=ls[0];l1=ls[1];anchorDate=rep.first_low_date||ls[2].start_date;
 }
 if(l0.kind!=='rise'||l1.kind!=='fall'||!anchorDate)return null;
 const anchor=idx(anchorDate),currentDays=cur.end-cur.anchor,currentContextStart=idx(cur.c.start_date);
 if(anchor>=cur.anchor||D.rows[anchor]?.date>=cur.c.start_date)return null;
 if(anchor+currentDays+FUTURE_DAYS>=currentContextStart)return null;
 const c={rep,l0,l1,anchor,anchorDate};
 const parts={
  riseMove:simMove(cur.p2.move_pct,l0.move_pct,8),
  riseDays:simDays(cur.p2.trading_days,l0.days),
  fallMove:simMove(cur.p.move_pct,l1.move_pct,6),
  fallDays:simDays(cur.p.trading_days,l1.days)
 };
 parts.shape=shapeScore(cur,c);
 c.parts={
  priorRise:parts.riseMove*.18+parts.riseDays*.12,
  priorFall:parts.fallMove*.22+parts.fallDays*.18,
  currentShape:parts.shape*.30
 };
 c.score=c.parts.priorRise+c.parts.priorFall+c.parts.currentShape;
 c.pivotGap=Math.abs(Number(cur.p.trading_days)-Number(l1.days))+Math.abs(Number(cur.p2.trading_days)-Number(l0.days));
 return c;
}

function picks(cur){
 const a=W?.assets?.QQQ||{},pool=arr(a.analog_anchors).length?arr(a.analog_anchors):arr(a.representatives);
 return pool.map(r=>candidate(r,cur)).filter(Boolean).sort((a,b)=>b.score-a.score||a.pivotGap-b.pivotGap).slice(0,5);
}

function buildWindow(anchor,xmin,xmax){
 const start=Math.max(0,anchor+xmin),end=Math.min(D.rows.length-1,anchor+xmax),base=D.rows[anchor]?.close;
 if(!base||end<=start)return null;
 return{
  start,end,anchor,
  rows:D.rows.slice(start,end+1).map((r,i)=>({
   date:r.date,x:(start+i)-anchor,
   open:norm(r.open,base),high:norm(r.high,base),low:norm(r.low,base),close:norm(r.close,base),vol:r.volume
  })),
  rangeStart:D.rows[start].date,rangeEnd:D.rows[end].date
 };
}

function scale(all){
 const vals=[];
 for(const w of all)for(const r of w.rows)vals.push(r.close,r.high,r.low);
 vals.sort((a,b)=>a-b);
 if(!vals.length)return[-10,10];
 let lo=vals[0],hi=vals.at(-1);
 const span=Math.max(18,hi-lo),mid=(hi+lo)/2,pad=Math.max(2,span*.075);
 lo=Math.min(lo,mid-span/2)-pad;
 hi=Math.max(hi,mid+span/2)+pad;
 return[lo,hi];
}

function path(ps,px,py,key='close'){
 return ps.map((r,i)=>`${i?'L':'M'}${px(r.x).toFixed(1)},${py(r[key]).toFixed(1)}`).join(' ');
}

function rowAt(w,x){return w.rows.find(r=>r.x===x)||null}

function futureOutcomes(w,currentX){
 const base=rowAt(w,currentX)?.close;
 if(base==null)return[];
 return OUTCOME_HORIZONS.map(days=>{
  const target=rowAt(w,currentX+days)?.close;
  const value=target==null?null:((100+target)/(100+base)-1)*100;
  return{days,label:days===21?'1개월':days===63?'3개월':'6개월',value};
 });
}

function chart(hist,curWin,cand,cur,ys,small=true){
 const [ymin,ymax]=ys,Wd=620,H=small?380:650,L=42,R=34,T=12,PB=small?296:500,VT=small?311:516,VB=small?360:620;
 const xmin=hist.rows[0].x,xmax=hist.rows.at(-1).x,currentX=curWin.rows.at(-1).x;
 const px=x=>L+(Wd-L-R)*(x-xmin)/Math.max(1,xmax-xmin);
 const py=y=>T+(PB-T)*(ymax-y)/Math.max(1,ymax-ymin);
 const step=Math.max(1,Math.ceil(hist.rows.length/(small?190:340))),bars=[];
 for(let i=0;i<hist.rows.length;i+=step){
  const g=hist.rows.slice(i,i+step),f=g[0],l=g.at(-1),x=(f.x+l.x)/2,o=f.open,c=l.close;
  bars.push({x,open:o,close:c,high:Math.max(...g.map(z=>z.high)),low:Math.min(...g.map(z=>z.low)),vol:g.reduce((s,z)=>s+z.vol,0)});
 }
 const vmax=Math.max(1,...bars.map(r=>r.vol)),pvol=v=>VB-(VB-VT)*v/vmax,cw=Math.max(.8,Math.min(3.2,(Wd-L-R)/bars.length*.7));
 const candles=bars.map(r=>{
  const up=r.close>=r.open,cl=up?'up':'down',x=px(r.x),yo=py(r.open),yc=py(r.close),yh=py(Math.min(ymax,r.high)),yl=py(Math.max(ymin,r.low)),top=Math.min(yo,yc),bh=Math.max(1,Math.abs(yc-yo));
  return `<line x1="${x}" x2="${x}" y1="${yh}" y2="${yl}" class="v56f-wick ${cl}"/><rect x="${x-cw/2}" y="${top}" width="${cw}" height="${bh}" class="v56f-body ${cl}"/><rect x="${x-cw/2}" y="${pvol(r.vol)}" width="${cw}" height="${Math.max(1,VB-pvol(r.vol))}" class="v56f-vol ${cl}"/>`;
 }).join('');
 const cp=path(curWin.rows,px,py),currentLast=curWin.rows.at(-1),highX=-Number(cur.p.trading_days||0),priorLowX=-(Number(cur.p.trading_days||0)+Number(cur.p2.trading_days||0)),hHighX=-Number(cand.l1.days||0),hLow0X=-(Number(cand.l1.days||0)+Number(cand.l0.days||0));
 const ticks=6,tickRows=Array.from({length:ticks},(_,i)=>hist.rows[Math.round((hist.rows.length-1)*i/(ticks-1))]),yTicks=[0,.25,.5,.75,1].map(q=>ymax-(ymax-ymin)*q),futureWidth=Math.max(0,px(xmax)-px(currentX));
 return `<svg class="v57p-svg" viewBox="0 0 ${Wd} ${H}" data-pivot-aligned="1" data-score="${cand.score.toFixed(1)}" data-ymin="${ymin.toFixed(1)}" data-ymax="${ymax.toFixed(1)}" data-current-x="${currentX}" data-future-days="${xmax-currentX}"><rect x="${px(currentX)}" y="${T}" width="${futureWidth}" height="${VB-T}" class="v57p-future-zone"/>${yTicks.map(v=>`<line x1="${L}" x2="${Wd-R}" y1="${py(v)}" y2="${py(v)}" class="v56f-grid"/><text x="${Wd-R+4}" y="${py(v)+4}" class="v57p-axis">${Math.round(v)}%</text>`).join('')}<line x1="${L}" x2="${Wd-R}" y1="${py(0)}" y2="${py(0)}" class="v56f-zero"/>${candles}<path d="${cp}" class="v56f-current-overlay v57p-current"/><line x1="${px(0)}" x2="${px(0)}" y1="${T}" y2="${PB}" class="v57p-anchor"/><text x="${Math.max(L+4,px(0)-5)}" y="${T+14}" text-anchor="end" class="v57p-label">대응 저점</text><line x1="${px(currentX)}" x2="${px(currentX)}" y1="${T}" y2="${VB}" class="v57p-now-line"/><circle cx="${px(currentX)}" cy="${py(currentLast.close)}" r="5.5" class="v57p-now-dot"/><text x="${px(currentX)+5}" y="${T+30}" class="v57p-now-label">현재 위치</text><text x="${px(currentX)+5}" y="${T+43}" class="v57p-future-label">이후는 과거 실제 경로</text><line x1="${px(highX)}" x2="${px(highX)}" y1="${T}" y2="${PB}" class="v57p-current-pivot"/><line x1="${px(hHighX)}" x2="${px(hHighX)}" y1="${T}" y2="${PB}" class="v57p-hist-pivot"/><circle cx="${px(priorLowX)}" cy="${py(0)}" r="3" class="v57p-dot current"/><circle cx="${px(hLow0X)}" cy="${py(0)}" r="3" class="v57p-dot hist"/>${tickRows.map(r=>`<text x="${px(r.x)}" y="${H-8}" text-anchor="middle" class="v56f-date">${fm(r.date)}</text>`).join('')}</svg>`;
}

function year(c){
 const a=String(c.rep.start_date||c.l0.start_date||'').slice(0,4),b=String(c.anchorDate||'').slice(0,4);
 return a===b?a:`${a}→${b}`;
}

function render(){
 const host=$('#cycle-visual .mr-body');
 if(!host)return false;
 const cur=current();
 if(!cur)return false;
 const cs=picks(cur);
 if(cs.length<3)return false;
 const xmin=Math.max(-WINDOW+1,-cur.anchor),currentX=cur.end-cur.anchor,histXmax=currentX+FUTURE_DAYS;
 const curWin=buildWindow(cur.anchor,xmin,currentX);
 const items=cs.map(c=>({c,w:buildWindow(c.anchor,xmin,histXmax)})).filter(x=>x.w&&x.w.rows.at(-1).x-x.w.rows.find(r=>r.x===currentX).x>=FUTURE_DAYS);
 if(!curWin||items.length<3)return false;
 const currentMove=norm(D.rows[cur.end].close,D.rows[cur.anchor].close);
 host.className='mr-body v57p-host';
 host.innerHTML=`<div class="v57p-head"><b>고점·저점 구조 맞춤 비교</b><span>현재 <strong>${fmt(cur.p2.start_date)} 저점 → ${fmt(cur.p.start_date)} 고점 → ${fmt(cur.a.start_date)} 저점 → 현재</strong>와 과거의 같은 피벗 순서를 실제 거래일 간격·등락률로 매칭합니다.</span><div class="v57p-current-state"><b>현재 위치</b><span>${fmt(cur.c.current_date)} · 대응 저점 이후 ${currentX}거래일 · ${pct(currentMove)}</span></div></div><div class="v57p-method"><b>읽는 법</b><span>구조 점수와 후보 선정은 주황색 현재 위치까지만 계산합니다. 오른쪽 음영 126거래일은 각 과거 사례에서 실제로 이어졌던 경로로, 가능한 시나리오를 보는 참고자료이며 미래를 보장하지 않습니다.</span></div><div class="v57p-note"><span>초록 = 현재 실제 경로</span><span>주황선·점 = 현재 위치</span><span>음영 = 과거의 이후 6개월</span><span>캔들 = 과거 실제 경로</span><span>카드별 실제 범위로 자동 확대</span></div><div class="v57p-title"><b>비교 과거 전체 · 구조 점수 순</b><span>미래 구간을 보지 않고 후보를 고른 뒤, 선정된 사례의 이후 실제 경로만 오른쪽에 공개</span></div><div class="v57p-list">${items.map((it,i)=>{
  const ys=scale([curWin,it.w]),outcomes=futureOutcomes(it.w,currentX);
  return `<article class="v57p-card"><div class="v57p-cardhead"><b><i style="--c:${['#ffd44a','#ff74b5','#56d8ff','#a990ff','#ff9a52'][i]}"></i>#${i+1} ${esc(year(it.c))}</b><em>구조 점수 ${Math.round(it.c.score)}/100</em></div><div class="v57p-scoreparts"><span>이전 상승 ${Math.round(it.c.parts.priorRise)}/30</span><span>이전 하락 ${Math.round(it.c.parts.priorFall)}/40</span><span>현재 반등 ${Math.round(it.c.parts.currentShape)}/30</span></div><div class="v57p-metrics"><span>직전 상승 ${cur.p2.trading_days}일/${pct(cur.p2.move_pct)} ↔ ${it.c.l0.days}일/${pct(it.c.l0.move_pct)}</span><span>직전 하락 ${cur.p.trading_days}일/${pct(cur.p.move_pct)} ↔ ${it.c.l1.days}일/${pct(it.c.l1.move_pct)}</span></div>${chart(it.w,curWin,it.c,cur,ys,true)}<div class="v57p-outcomes"><b>이 사례에서 현재 위치 이후</b>${outcomes.map(o=>`<span>${o.label} <strong>${pct(o.value)}</strong></span>`).join('')}</div><div class="v57p-range">${fmt(it.w.rangeStart)} ~ ${fmt(it.w.rangeEnd)} · 대응 저점 ${fmt(it.c.anchorDate)} · 현재 대응점 이후 ${FUTURE_DAYS}거래일 포함 · 표시축 ${Math.floor(ys[0])}%~${Math.ceil(ys[1])}%</div></article>`;
 }).join('')}</div>`;
 const h=$('#cycle-visual .mr-head h2');
 if(h)h.textContent='📉 실제 사이클 비교 · 현재 이후 과거 경로';
 document.documentElement.classList.remove('mr-cycle-final-pending');
 document.documentElement.classList.add('mr-cycle-final-ready');
 const m=$('.mr-buildmark');
 if(m)m.textContent='MR057';
 return true;
}

async function boot(){
 try{
  const [d,w]=await Promise.all([get('../data/market-daily/QQQ.json'),get('../data/wave-cycles.json')]);
  D={rows:arr(d.rows).map(r=>({date:r[0],open:n(r[1]),high:n(r[2]),low:n(r[3]),close:n(r[4]),volume:n(r[5])||0})).filter(r=>r.date&&[r.open,r.high,r.low,r.close].every(Number.isFinite))};
  D.map=new Map(D.rows.map((r,i)=>[r.date,i]));
  W=w;
  let tries=0;
  const wait=()=>{if(render())return;if(++tries<120)setTimeout(wait,100)};
  wait();
 }catch(e){console.warn('[MR057 pivot-match]',e)}
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
