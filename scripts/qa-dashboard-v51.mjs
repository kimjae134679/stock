import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
const base=process.env.MR_QA_URL||'http://127.0.0.1:4173/reports/stable-v051.html?qa=1';
await fs.mkdir('qa-artifacts',{recursive:true});
const ids=['themes','cycle-visual','charts','picks','mr-famous','mr-compounders','mr-universe','expanded','etfs','allocation','research','smart-money','sources','history','replay','macro'];
async function run(name,viewport){
 const browser=await chromium.launch({headless:true}),page=await browser.newPage({viewport});
 await page.route('https://s.tradingview.com/**',r=>r.abort());
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base,{waitUntil:'domcontentloaded',timeout:30000});
 await page.waitForFunction(()=>document.querySelector('#loadWrap')?.hidden===true,{timeout:20000});
 await page.waitForFunction(()=>document.querySelector('#cycle-visual .v51-cycle'),{timeout:50000});
 const r=await page.evaluate(ids=>{const q=s=>document.querySelector(s),qa=s=>[...document.querySelectorAll(s)],cycle=q('#cycle-visual .v51-cycle'),pairs=qa('#cycle-visual .v51-pair');return{version:q('.top b')?.textContent||'',mark:q('.mr-buildmark')?.textContent||'',missing:ids.filter(id=>!document.getElementById(id)),action:!!q('#action'),actionNav:!!q('.quicknav [data-go="action"]'),phaseAfterHero:q('#market')?.nextElementSibling?.id||'',cycleTitle:q('#cycle-visual .mr-head h2')?.textContent||'',text:cycle?.textContent||'',hist:qa('#cycle-visual .v51-history').length,current:qa('#cycle-visual .v51-current').length,pairs:pairs.length,pairLineCounts:pairs.map(x=>x.querySelectorAll('polyline').length),load:q('#loadWrap')?.getBoundingClientRect().height??-1,scrollWidth:document.documentElement.scrollWidth,innerWidth:window.innerWidth};},ids);
 if(!r.version.includes('v0.5.1')||r.mark!=='MR051')throw new Error(name+': bad version '+JSON.stringify(r));
 if(r.missing.length)throw new Error(name+': missing '+r.missing.join(','));
 if(r.action||r.actionNav)throw new Error(name+': action guide not removed');
 if(r.phaseAfterHero!=='segmentPhaseNow')throw new Error(name+': independent phase not directly below hero '+r.phaseAfterHero);
 if(!r.cycleTitle.includes('실제 사이클 비교')||!r.text.includes('실제 사이클 비교'))throw new Error(name+': cycle title missing');
 for(const s of ['현재 비교 구간','지금까지 경과','현재와 과거를 1대1로 보기','이전 파동 + 같은 방향 구간 + 이후 파동'])if(!r.text.includes(s))throw new Error(name+': missing '+s);
 if(!/(저점 → 고점|고점 → 저점)/.test(r.text))throw new Error(name+': active direction missing');
 if(!/거래일차/.test(r.text))throw new Error(name+': elapsed days missing');
 if(r.hist<3||r.current<4||r.pairs<3)throw new Error(name+': overlay/pairs insufficient '+JSON.stringify(r));
 if(r.pairLineCounts.some(n=>n!==2))throw new Error(name+': pair chart must have exactly current+one history '+r.pairLineCounts);
 if(r.load!==0)throw new Error(name+': load gap '+r.load);
 if(r.scrollWidth>r.innerWidth+3)throw new Error(name+': overflow '+r.scrollWidth+'/'+r.innerWidth);
 await page.locator('#cycle-visual [data-v51-count="5"]').click();await page.waitForFunction(()=>document.querySelectorAll('#cycle-visual .v51-pair').length>=5,{timeout:6000});
 const opened=await page.evaluate(()=>{const el=document.querySelector('[data-ticker="QQQ"]');if(!el)return false;el.click();return true});
 if(opened){await page.waitForFunction(()=>document.querySelector('#modal')?.classList.contains('open'),{timeout:8000});await page.waitForFunction(()=>document.querySelector('#modal .v51-cycle'),{timeout:30000});const mt=await page.locator('#modal .v51-cycle').innerText();if(!mt.includes('실제 사이클 비교'))throw new Error(name+': modal v51 missing');await page.locator('#modalClose').click();}
 await page.screenshot({path:`qa-artifacts/${name}.png`,fullPage:true});if(errors.length)throw new Error(name+': '+errors.join(' | '));console.log(`[${name}] PASS`,r);await browser.close();
}
await run('desktop-v051',{width:1440,height:1000});
await run('mobile-v051',{width:390,height:844});
console.log('MR051 browser QA PASS');
