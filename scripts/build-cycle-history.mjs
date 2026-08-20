// Market Radar historical cycle builder v0.4.4
// Builds descriptive historical swing statistics + sampled paths for visual comparison.
import fs from 'node:fs/promises';

const latest=JSON.parse(await fs.readFile('public/data/latest.json','utf8'));
const OUT='public/data/cycle-history.json';
const STATIC=['QQQ','SPY','SMH','SOXX','SOXL','TQQQ','MSFT','AAPL','NVDA','AMZN','GOOGL','META','TSLA','AMD','AVGO','PLTR','TSM','ANET','ORCL','COST','ADBE','CRM','MOD','NVT','VRT','FIX','HUBB','POWL','ETN','BE','GEV','CMI','CAT','ROK','ISRG','TER','CRWD','FTNT','PANW','CCJ','LEU','NXE','EQIX','DLR','FCX','SCCO','AVAV','KTOS','V','MA','SPGI','MCO','CTAS','PWR','WM','RSG','ORLY','AZO','VGT','XLK','SCHG','IGV','GRID','AIQ','BOTZ','DTCR','CIBR','PAVE','URA','SHLD','COPX'];
const PRIORITY=['QQQ','SPY','SMH','SOXX','SOXL','TQQQ','IGV','GRID','ANET','NVDA','AVGO','MSFT','GOOGL'];
const THEME_PROXIES={software:'IGV',power:'GRID',compute:'SMH',network:'ANET',defense:'SHLD',aggressive:'SOXL',index:'QQQ'};

const sleep=ms=>new Promise(r=>setTimeout(r,ms));
function addFrom(v,set){if(!v)return;if(Array.isArray(v)){for(const x of v)addFrom(x,set);return}if(typeof v==='object'){for(const [k,x] of Object.entries(v)){if(k==='ticker'&&typeof x==='string')set.add(x);else if(k==='tickers'&&Array.isArray(x))x.forEach(t=>typeof t==='string'&&set.add(t));else addFrom(x,set)}}}
const tickers=new Set(STATIC);addFrom(latest,tickers);Object.values(THEME_PROXIES).forEach(t=>tickers.add(t));
function yahooSymbol(t){if(/^\d{6}$/.test(t))return `${t}.KS`;return t.replace('.','-')}
function thresholdFor(t){if(['QQQ','SPY','VGT','XLK','SCHG','IGV','GRID','AIQ','BOTZ','CIBR','PAVE','URA','SHLD','COPX','SMH','SOXX','DTCR'].includes(t))return .08;if(['TQQQ','SOXL'].includes(t))return .18;return .12}

async function fetchWithTimeout(url,opts={},timeout=22000){const c=new AbortController(),timer=setTimeout(()=>c.abort(),timeout);try{return await fetch(url,{...opts,signal:c.signal})}finally{clearTimeout(timer)}}
function normalizeRows(rows){const seen=new Set();return rows.filter(x=>x&&/^\d{4}-\d{2}-\d{2}$/.test(x.date)&&Number.isFinite(x.close)&&x.close>0).sort((a,b)=>a.date.localeCompare(b.date)).filter(x=>{if(seen.has(x.date))return false;seen.add(x.date);return true})}

async function fetchYahoo(t,host='query1.finance.yahoo.com'){
  const sym=yahooSymbol(t),period2=Math.floor(Date.now()/1000),period1=315532800;
  const url=`https://${host}/v8/finance/chart/${encodeURIComponent(sym)}?period1=${period1}&period2=${period2}&interval=1d&events=div%2Csplits&includeAdjustedClose=true`;
  let lastErr='unknown';
  for(let attempt=0;attempt<3;attempt++){
    try{
      const r=await fetchWithTimeout(url,{headers:{'User-Agent':'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 MarketRadar/0.4.4','Accept':'application/json,text/plain,*/*'}},22000);
      if(!r.ok){lastErr=`HTTP ${r.status}`;if(r.status===429||r.status>=500){await sleep(650*(attempt+1));continue}throw new Error(lastErr)}
      const j=await r.json(),c=j?.chart?.result?.[0];if(!c)throw new Error(j?.chart?.error?.description||'no result');
      const ts=c.timestamp||[],adj=c.indicators?.adjclose?.[0]?.adjclose||c.indicators?.quote?.[0]?.close||[],rows=[];
      for(let i=0;i<ts.length;i++){const v=Number(adj[i]);if(!Number.isFinite(v)||v<=0)continue;rows.push({date:new Date(ts[i]*1000).toISOString().slice(0,10),close:v})}
      const clean=normalizeRows(rows);if(clean.length<120)throw new Error(`too few rows ${clean.length}`);return{rows:clean,source:`Yahoo Finance ${host}`};
    }catch(e){lastErr=String(e?.message||e);if(attempt<2)await sleep(650*(attempt+1))}
  }
  throw new Error(lastErr)
}

async function fetchStooq(t){
  if(/^\d{6}$/.test(t))throw new Error('Stooq fallback unavailable for KRX');
  const sym=t.replace('.','-').toLowerCase()+'.us',d2=new Date().toISOString().slice(0,10).replaceAll('-','');
  const url=`https://stooq.com/q/d/l/?s=${encodeURIComponent(sym)}&d1=19800101&d2=${d2}&i=d`;
  const r=await fetchWithTimeout(url,{headers:{'User-Agent':'Mozilla/5.0 MarketRadar/0.4.4','Accept':'text/csv,text/plain,*/*'}},26000);
  if(!r.ok)throw new Error(`HTTP ${r.status}`);const text=await r.text();if(!/Date,Open,High,Low,Close/i.test(text))throw new Error('invalid csv');
  const rows=[];for(const line of text.trim().split(/\r?\n/).slice(1)){const p=line.split(',');if(p.length<5)continue;const v=Number(p[4]);if(Number.isFinite(v)&&v>0)rows.push({date:p[0],close:v})}
  const clean=normalizeRows(rows);if(clean.length<120)throw new Error(`too few rows ${clean.length}`);return{rows:clean,source:'Stooq daily close'}
}

async function fetchHistory(t){const errors=[];for(const fn of [()=>fetchYahoo(t,'query1.finance.yahoo.com'),()=>fetchYahoo(t,'query2.finance.yahoo.com'),()=>fetchStooq(t)]){try{return await fn()}catch(e){errors.push(String(e?.message||e))}}throw new Error(errors.join(' | '))}
function daysBetween(a,b){return Math.round((Date.parse(b)-Date.parse(a))/86400000)+1}
function samplePath(rows,ai,bi,startClose,maxPoints=90){const len=bi-ai+1;if(len<=0)return[];const idx=[];if(len<=maxPoints){for(let i=ai;i<=bi;i++)idx.push(i)}else{for(let n=0;n<maxPoints;n++)idx.push(ai+Math.round((len-1)*n/(maxPoints-1)))}const unique=[...new Set(idx)];return unique.map(i=>[i-ai,+((rows[i].close/startClose-1)*100).toFixed(2)])}
function makeSeg(direction,rows,ai,bi){const a=rows[ai],b=rows[bi];return{direction,start_date:a.date,end_date:b.date,trading_days:Math.max(1,bi-ai+1),calendar_days:daysBetween(a.date,b.date),move_pct:+((b.close/a.close-1)*100).toFixed(2),start_price:+a.close.toFixed(6),end_price:+b.close.toFixed(6),path:samplePath(rows,ai,bi,a.close)}}
function zigzag(rows,thr){let low=rows[0],high=rows[0],lowIndex=0,highIndex=0,dir=0,pivotIndex=0;const seg=[];for(let i=1;i<rows.length;i++){const p=rows[i];if(dir===0){if(p.close<low.close){low=p;lowIndex=i}if(p.close>high.close){high=p;highIndex=i}if(p.close>=low.close*(1+thr)){pivotIndex=lowIndex;dir=1;high=p;highIndex=i}else if(p.close<=high.close*(1-thr)){pivotIndex=highIndex;dir=-1;low=p;lowIndex=i}continue}if(dir===1){if(p.close>high.close){high=p;highIndex=i}if(p.close<=high.close*(1-thr)){seg.push(makeSeg('상승',rows,pivotIndex,highIndex));pivotIndex=highIndex;dir=-1;low=p;lowIndex=i}}else{if(p.close<low.close){low=p;lowIndex=i}if(p.close>=low.close*(1+thr)){seg.push(makeSeg('하락',rows,pivotIndex,lowIndex));pivotIndex=lowIndex;dir=1;high=p;highIndex=i}}}
  const lastIndex=rows.length-1;let currentDir=dir===-1?'하락':'상승';if(dir===0)currentDir=rows[lastIndex].close>=rows[0].close?'상승':'하락';const current=makeSeg(currentDir,rows,pivotIndex,lastIndex);return{segments:seg.filter(s=>s.trading_days>=2),current}}
const mean=a=>a.length?a.reduce((s,x)=>s+x,0)/a.length:null;const median=a=>{if(!a.length)return null;const s=[...a].sort((x,y)=>x-y),m=Math.floor(s.length/2);return s.length%2?s[m]:(s[m-1]+s[m])/2};
function percentile(a,p){if(!a.length)return null;const s=[...a].sort((x,y)=>x-y),i=(s.length-1)*p,l=Math.floor(i),h=Math.ceil(i);return l===h?s[l]:s[l]+(s[h]-s[l])*(i-l)}
function stats(segs,dir){const a=segs.filter(x=>x.direction===dir),d=a.map(x=>x.trading_days),m=a.map(x=>Math.abs(x.move_pct));const md=mean(d),medd=median(d),p25d=percentile(d,.25),p75d=percentile(d,.75),mm=mean(m),medm=median(m),p25m=percentile(m,.25),p75m=percentile(m,.75);return{count:a.length,mean_days:md!=null?Math.round(md):null,median_days:medd!=null?Math.round(medd):null,p25_days:p25d!=null?Math.round(p25d):null,p75_days:p75d!=null?Math.round(p75d):null,mean_move_pct:mm!=null?+mm.toFixed(1):null,median_move_pct:medm!=null?+medm.toFixed(1):null,p25_move_pct:p25m!=null?+p25m.toFixed(1):null,p75_move_pct:p75m!=null?+p75m.toFixed(1):null}}
function position(c,s){const duration=s.median_days?100*c.trading_days/s.median_days:null,magnitude=s.median_move_pct?100*Math.abs(c.move_pct)/s.median_move_pct:null,vals=[duration,magnitude].filter(Number.isFinite),p=vals.length?Math.round(vals.reduce((a,b)=>a+b,0)/vals.length):null;let txt='비교 데이터 부족';if(p!=null){if(c.direction==='상승')txt=p<35?'상승 초반':p<70?'상승 중반':p<110?'상승 후반·고점 접근 구간':'과거 평균을 넘긴 연장 상승 구간';else txt=p<35?'하락 초반':p<70?'하락 중반':p<110?'하락 후반·저점 탐색 구간':'과거 평균을 넘긴 연장 하락 구간'}return{duration_progress_pct:duration==null?null:Math.round(duration),magnitude_progress_pct:magnitude==null?null:Math.round(magnitude),progress_pct:p,position_text:txt}}
function extremes(segs){return{largest_declines:segs.filter(x=>x.direction==='하락').sort((a,b)=>a.move_pct-b.move_pct).slice(0,10),largest_rallies:segs.filter(x=>x.direction==='상승').sort((a,b)=>b.move_pct-a.move_pct).slice(0,10)}}
async function one(t){const fetched=await fetchHistory(t),rows=fetched.rows,{segments,current}=zigzag(rows,thresholdFor(t)),up=stats(segments,'상승'),down=stats(segments,'하락'),s=current.direction==='상승'?up:down;return{ticker:t,source:fetched.source,history_span:'max_available_daily',first_date:rows[0].date,last_date:rows.at(-1).date,threshold_pct:thresholdFor(t)*100,method:'zigzag_reversal',method_label:`${Math.round(thresholdFor(t)*100)}% 반전 스윙 기준 · 과거 통계는 설명용`,stats:{상승:up,하락:down},current:{...current,...position(current,s)},history:[...segments].reverse(),extremes:extremes(segments)}}

const valid=[...tickers].filter(x=>/^[A-Z0-9.\-]{1,12}$/.test(x)),ordered=[...PRIORITY.filter(x=>valid.includes(x)),...valid.filter(x=>!PRIORITY.includes(x))],assets={},errors={};let n=0;
for(const t of ordered){try{assets[t]=await one(t);console.log(`[cycle] ${t} OK ${assets[t].source} ${assets[t].first_date}..${assets[t].last_date}`)}catch(e){errors[t]=String(e?.message||e);console.warn(`[cycle] ${t} FAIL ${errors[t]}`)}n++;if(n%4===0)await sleep(350)}
if(!assets.QQQ||Object.keys(assets).length<5)throw new Error(`cycle history core build failed: assets=${Object.keys(assets).length}, QQQ=${!!assets.QQQ}`);
const out={updated_at:new Date().toISOString(),method_note:'가능한 전체 일별 이력을 사용한다. 가격이 종목/ETF별 기준치(ETF 8%, 일반주 12%, 3x 18%)만큼 반전할 때 상승/하락 스윙을 확정한다. 각 스윙의 실제 경로를 최대 90포인트로 샘플링해 현재와 과거를 시각 비교한다. 평균/중앙값은 미래 종료시점을 보장하지 않는다.',theme_proxies:THEME_PROXIES,assets,errors};
await fs.writeFile(OUT,JSON.stringify(out,null,2)+'\n','utf8');console.log(`cycle history: ${Object.keys(assets).length} assets, ${Object.keys(errors).length} errors`);
