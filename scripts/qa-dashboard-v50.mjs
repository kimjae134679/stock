import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
const base=process.env.MR_QA_URL||'http://127.0.0.1:4173/reports/stable-v050.html?qa=1';
const ids=['themes','action','cycle-visual','charts','picks','mr-famous','mr-compounders','mr-universe','expanded','etfs','allocation','research','smart-money','sources','history','replay','macro'];
await fs.mkdir('qa-artifacts',{recursive:true});
async function waitFn(page,fn,timeout){return page.waitForFunction(fn,null,{timeout})}
async function run(name,viewport){
 const browser=await chromium.launch({headless:true});
 const page=await browser.newPage({viewport});
 await page.route('https://s.tradingview.com/**',r=>r.abort());
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base,{waitUntil:'domcontentloaded',timeout:30000});
 await waitFn(page,()=>document.querySelector('#loadWrap')?.hidden===true,20000);
 await waitFn(page,()=>document.querySelector('#cycle-visual .v50-wave-overlay'),60000);
 const r=await page.evaluate(ids=>{const q=s=>document.querySelector(s),qa=s=>[...document.querySelectorAll(s)],box=q('#cycle-visual .v50-wave-overlay'),old=q('#cycle-visual .v50-old'),missing=ids.filter(id=>!document.getElementById(id)),suspicious=qa('.mr-section').map(s=>{const b=s.getBoundingClientRect(),txt=(s.querySelector('.mr-body')?.textContent||'').trim();return{id:s.id,h:Math.round(b.height),text:txt.length}}).filter(x=>x.h>350&&x.text<30);return{version:q('.top b')?.textContent||'',mark:q('.mr-buildmark')?.textContent||'',load:q('#loadWrap')?.getBoundingClientRect().height??-1,text:box?.textContent||'',hist:qa('#cycle-visual .v50-history').length,current:qa('#cycle-visual .v50-current').length,dots:qa('#cycle-visual .v50-match-dot').length,oldOpen:old?.open===true,oldText:old?.textContent||'',missing,suspicious,scrollWidth:document.documentElement.scrollWidth,innerWidth:window.innerWidth};},ids);
 if(!r.version.includes('v0.5.0')||r.mark!=='MR050')throw new Error(name+': version/mark '+r.version+' '+r.mark);
 if(r.missing.length)throw new Error(name+': missing '+r.missing.join(','));
 if(r.load!==0)throw new Error(name+': load gap '+r.load);
 if(r.hist<3||r.current!==1||r.dots<3)throw new Error(name+': overlay lines/dots '+JSON.stringify(r));
 for(const s of ['시장 파동 비교','과거 장세는 그대로 고정','최근 하락','그 뒤 반등','가장 닮은 과거 위치'])if(!r.text.includes(s))throw new Error(name+': missing wording '+s);
 if(!/최근 (폭락|급락성 조정|조정) 이후 반등·재상승/.test(r.text))throw new Error(name+': current rebound context missing');
 if(!/20\d{2}-\d{2}-\d{2}/.test(r.text))throw new Error(name+': exact dates missing');
 if(r.oldOpen)throw new Error(name+': previous comparison must be collapsed');
 if(!r.oldText.includes('이전 단일 사이클 매칭'))throw new Error(name+': previous v49 detail not preserved');
 if(r.suspicious.length)throw new Error(name+': blank panels '+JSON.stringify(r.suspicious));
 if(r.scrollWidth>r.innerWidth+3)throw new Error(name+': document overflow '+r.scrollWidth+'/'+r.innerWidth);
 await page.locator('#cycle-visual [data-v50-count="5"]').click();
 await waitFn(page,()=>document.querySelectorAll('#cycle-visual .v50-history').length>=5,8000);
 const opened=await page.evaluate(()=>{const el=document.querySelector('[data-ticker="QQQ"]');if(!el)return false;el.click();return true});
 if(opened){await waitFn(page,()=>document.querySelector('#modal')?.classList.contains('open'),8000);await waitFn(page,()=>document.querySelector('#modal .v50-wave-overlay'),30000);const mt=await page.locator('#modal .v50-wave-overlay').innerText();if(!mt.includes('QQQ · 시장 파동 비교'))throw new Error(name+': modal v50 missing');await page.locator('#modalClose').click();}
 await page.screenshot({path:`qa-artifacts/${name}.png`,fullPage:true});
 if(errors.length)throw new Error(name+': '+errors.join(' | '));
 console.log(`[${name}] PASS`,r);await browser.close();
}
await run('desktop-v050',{width:1440,height:1000});
await run('mobile-v050',{width:390,height:844});
console.log('MR050 browser QA PASS');
