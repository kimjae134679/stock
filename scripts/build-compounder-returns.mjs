import fs from 'node:fs/promises';
const T=['ANET','MSFT','AVGO','COST','V','MA','SPGI','MCO','CTAS','PWR','ETN','WM','RSG','ORLY','AZO','QQQ','VGT','XLK','SCHG'];
const PERIODS=[['1Y',1],['2Y',2],['3Y',3],['5Y',5]];
const OUT='public/data/compounder-returns.json';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
function targetMs(years){const d=new Date();d.setUTCFullYear(d.getUTCFullYear()-years);return d.getTime()}
function calc(ts,vals,years){const pairs=ts.map((t,i)=>[Number(t)*1000,Number(vals[i])]).filter(x=>Number.isFinite(x[0])&&Number.isFinite(x[1])&&x[1]>0);if(pairs.length<2)return null;const target=targetMs(years);let first=pairs.find(x=>x[0]>=target)||pairs[0],last=pairs[pairs.length-1];if(!first||!last||first[1]===0)return null;return Number(((last[1]/first[1]-1)*100).toFixed(2))}
async function fetchTicker(t){const u=`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(t)}?range=5y&interval=1d&events=history&includeAdjustedClose=true`;const r=await fetch(u,{headers:{'User-Agent':'Mozilla/5.0 MarketRadar/0.3.6','Accept':'application/json'}});if(!r.ok)throw new Error(`${t} HTTP ${r.status}`);const j=await r.json(),x=j?.chart?.result?.[0];if(!x)throw new Error(`${t} no result`);const vals=x.indicators?.adjclose?.[0]?.adjclose||x.indicators?.quote?.[0]?.close||[];const out={};for(const [k,y] of PERIODS)out[k]=calc(x.timestamp||[],vals,y);out.last_timestamp=(x.timestamp||[]).at(-1)||null;return out}
const assets={};
for(const t of T){try{assets[t]=await fetchTicker(t);console.log('[returns]',t,assets[t])}catch(e){console.warn('[returns]',e.message);assets[t]={};}await sleep(180)}
await fs.writeFile(OUT,JSON.stringify({generated_at:new Date().toISOString(),source:'Yahoo Finance chart API via GitHub Actions',periods:PERIODS.map(x=>x[0]),assets},null,2)+'\n','utf8');
console.log('[returns] wrote',OUT);
