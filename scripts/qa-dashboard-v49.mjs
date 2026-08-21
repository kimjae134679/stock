import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
const base=process.env.MR_QA_URL||'http://127.0.0.1:4173/reports/stable-v049.html?qa=1';
const ids=['themes','action','cycle-visual','charts','picks','mr-famous','mr-compounders','mr-universe','expanded','etfs','allocation','research','smart-money','sources','history','replay','macro'];
await fs.mkdir('qa-artifacts',{recursive:true});
async function run(name,viewport){
 const browser=await chromium.launch({headless:true}),page=await browser.newPage({viewport});
 await page.route('https://s.tradingview.com/**',r=>r.abort());
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base,{waitUntil:'domcontentloaded',timeout:30000});
 await page.waitForFunction(()=>document.querySelector('#loadWrap')?.hidden===true,{timeout:18000});
 await page.waitForFunction(()=>document.querySelector('#cycle-visual .v49-fixed-fit'),{timeout:40000});
 await page.waitForFunction(()=>document.querySelectorAll('#cycle-visual .v49-match-card').length>=3,{timeout:12000});
 const r=await page.evaluate(ids=>{const q=s=>document.querySelector(s),qa=s=>[...document.querySelectorAll(s)],missing=ids.filter(id=>!document.getElementById(id)),suspicious=qa('.mr-section').map(s=>{const b=s.getBoundingClientRect(),txt=(s.querySelector('.mr-body')?.textContent||'').trim();return{id:s.id,h:Math.round(b.height),text:txt.length}}).filter(x=>x.h>350&&x.text<30),box=q('#cycle-visual .v49-fixed-fit'),cards=qa('#cycle-visual .v49-match-card'),dots=qa('#cycle-visual .v49-now-dot'),old=q('#cycle-visual .v49-old');return{missing,version:q('.top b')?.textContent||'',mark:q('.mr-buildmark')?.textContent||'',load:q('#loadWrap')?.getBoundingClientRect().height??-1,text:box?.textContent||'',cards:cards.length,dots:dots.length,oldOpen:old?.open===true,oldText:old?.textContent||'',scrollWidth:document.documentElement.scrollWidth,innerWidth:window.innerWidth,suspicious};},ids);
 if(!r.version.includes('v0.4.9')||r.mark!=='MR049')throw new Error(name+': version/mark '+r.version+' '+r.mark);
 if(r.missing.length)throw new Error(name+': missing '+r.missing.join(','));
 if(r.load!==0)throw new Error(name+': load gap '+r.load);
 if(r.cards<3||r.dots<3)throw new Error(name+': fixed-fit cards/dots insufficient '+JSON.stringify(r));
 for(const s of ['그래서 지금이 저점이야, 고점이야?','과거 사이클 고정 + 현재 그래프 맞춤','옛날 사이클은 고정','현재선만 맞춤','맞춰진 위치','현재 실제'])if(!r.text.includes(s))throw new Error(name+': missing wording '+s);
 if(!/(저점보다는 고점 쪽|고점보다는 저점 쪽|상승·하락 중간 구간)/.test(r.text))throw new Error(name+': verdict missing');
 if(!/20\d{2}-\d{2}-\d{2}/.test(r.text))throw new Error(name+': historical exact dates missing');
 if(r.oldOpen)throw new Error(name+': previous normalized view must be collapsed');
 if(!r.oldText.includes('이전 형태 정렬/실제 거래일 상세 비교 보기'))throw new Error(name+': previous v48/v47 detail not preserved');
 if(r.suspicious.length)throw new Error(name+': blank panels '+JSON.stringify(r.suspicious));
 if(r.scrollWidth>r.innerWidth+3)throw new Error(name+': document overflow '+r.scrollWidth+'/'+r.innerWidth);
 await page.locator('#cycle-visual [data-v49-count="5"]').click();await page.waitForFunction(()=>document.querySelectorAll('#cycle-visual .v49-match-card').length>=5,{timeout:5000});
 const opened=await page.evaluate(()=>{const el=document.querySelector('[data-ticker="QQQ"]');if(!el)return false;el.click();return true});if(opened){await page.waitForFunction(()=>document.querySelector('#modal')?.classList.contains('open'),{timeout:8000});await page.waitForFunction(()=>document.querySelector('#modal .v49-fixed-fit'),{timeout:12000});const mt=await page.locator('#modal .v49-fixed-fit').innerText();if(!mt.includes('QQQ · 과거 사이클 고정 + 현재 그래프 맞춤'))throw new Error(name+': modal v49 missing');await page.locator('#modalClose').click();}
 await page.screenshot({path:`qa-artifacts/${name}.png`,fullPage:true});if(errors.length)throw new Error(name+': '+errors.join(' | '));console.log(`[${name}] PASS`,r);await browser.close();
}
await run('desktop-v049',{width:1440,height:1000});
await run('mobile-v049',{width:390,height:844});
console.log('MR049 browser QA PASS');
