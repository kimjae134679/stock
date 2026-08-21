import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
const base=process.env.MR_QA_URL||'http://127.0.0.1:4173/reports/stable-v048.html?qa=1';
const ids=['themes','action','cycle-visual','charts','picks','mr-famous','mr-compounders','mr-universe','expanded','etfs','allocation','research','smart-money','sources','history','replay','macro'];
await fs.mkdir('qa-artifacts',{recursive:true});
async function run(name,viewport){
 const browser=await chromium.launch({headless:true}),page=await browser.newPage({viewport});
 await page.route('https://s.tradingview.com/**',r=>r.abort());
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base,{waitUntil:'domcontentloaded',timeout:30000});
 await page.waitForFunction(()=>document.querySelector('#loadWrap')?.hidden===true,{timeout:18000});
 await page.waitForFunction(()=>document.querySelector('#cycle-visual .v48-shape'),{timeout:35000});
 await page.waitForFunction(()=>document.querySelectorAll('#cycle-visual .v48-hist-line').length>=3,{timeout:10000});
 const r=await page.evaluate(ids=>{const q=s=>document.querySelector(s),qa=s=>[...document.querySelectorAll(s)],missing=ids.filter(id=>!document.getElementById(id)),suspicious=qa('.mr-section').map(s=>{const b=s.getBoundingClientRect(),txt=(s.querySelector('.mr-body')?.textContent||'').trim();return{id:s.id,h:Math.round(b.height),text:txt.length}}).filter(x=>x.h>350&&x.text<30),shape=q('#cycle-visual .v48-shape'),dot=q('#cycle-visual .v48-current-dot'),lines=qa('#cycle-visual .v48-hist-line'),legend=qa('#cycle-visual .v48-legend-item'),raw=q('#cycle-visual .v48-actual');return{missing,version:q('.top b')?.textContent||'',mark:q('.mr-buildmark')?.textContent||'',load:q('#loadWrap')?.getBoundingClientRect().height??-1,shapeText:shape?.textContent||'',lineCount:lines.length,legendCount:legend.length,currentCx:Number(dot?.getAttribute('cx')||0),lineLastXs:lines.map(x=>Number((x.getAttribute('points')||'').trim().split(/\s+/).at(-1)?.split(',')[0]||0)),rawOpen:raw?.open===true,rawText:raw?.textContent||'',scrollWidth:document.documentElement.scrollWidth,innerWidth:window.innerWidth,suspicious};},ids);
 if(!r.version.includes('v0.4.8')||r.mark!=='MR048')throw new Error(name+': version/mark '+r.version+' '+r.mark);
 if(r.missing.length)throw new Error(name+': missing '+r.missing.join(','));
 if(r.load!==0)throw new Error(name+': load gap '+r.load);
 if(r.lineCount<3||r.legendCount<4)throw new Error(name+': shape lines/legend insufficient '+JSON.stringify(r));
 for(const s of ['사이클 형태 비교','저점','고점','다음 저점','다음 상승','현재 포인트','형태 정렬 기준','미래 날짜 예측'])if(!r.shapeText.includes(s))throw new Error(name+': missing shape wording '+s);
 if(!/20\d{2}/.test(r.shapeText)||!/\d{4}-\d{2}-\d{2}/.test(r.shapeText))throw new Error(name+': year/date legend missing');
 if(!r.shapeText.includes('다음 고점'))throw new Error(name+': extended next-rise date missing');
 if(r.currentCx<180)throw new Error(name+': current point still stuck at start '+r.currentCx);
 if(Math.max(...r.lineLastXs)<980)throw new Error(name+': historical lines do not reach next-rise zone '+JSON.stringify(r.lineLastXs));
 if(r.rawOpen)throw new Error(name+': old detailed view must be collapsed by default');
 if(!r.rawText.includes('실제 거래일 12개 상세 비교'))throw new Error(name+': detailed actual-day view not preserved');
 if(r.suspicious.length)throw new Error(name+': blank panels '+JSON.stringify(r.suspicious));
 if(r.scrollWidth>r.innerWidth+3)throw new Error(name+': document overflow '+r.scrollWidth+'/'+r.innerWidth);
 await page.locator('#cycle-visual [data-v48-count="6"]').click();await page.waitForFunction(()=>document.querySelectorAll('#cycle-visual .v48-hist-line').length>=5,{timeout:5000});
 await page.locator('#cycle-visual .v48-actual>summary').click();await page.waitForFunction(()=>document.querySelector('#cycle-visual .v48-actual')?.open===true);if(await page.locator('#cycle-visual .v47-cycle-wrap').count()<1)throw new Error(name+': old v47 detail disappeared');
 await page.locator('#cycle-visual .v48-actual>summary').click();
 const proxy=page.locator('#cycle-visual .v46-proxy[data-ticker="SMH"]').first();if(await proxy.count()){await proxy.click();await page.waitForFunction(()=>document.querySelector('#modal')?.classList.contains('open'));await page.waitForFunction(()=>document.querySelector('#modal .v48-shape'),{timeout:8000});const mt=await page.locator('#modal .v48-shape').innerText();if(!mt.includes('SMH · 사이클 형태 비교'))throw new Error(name+': modal v48 missing');await page.locator('#modalClose').click();}
 await page.screenshot({path:`qa-artifacts/${name}.png`,fullPage:true});if(errors.length)throw new Error(name+': '+errors.join(' | '));console.log(`[${name}] PASS`,r);await browser.close();
}
await run('desktop-v048',{width:1440,height:1000});
await run('mobile-v048',{width:390,height:844});
console.log('MR048 browser QA PASS');
