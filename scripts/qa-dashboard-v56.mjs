import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
const base='http://127.0.0.1:4173/reports/stable-v056.html?qa=56';
await fs.mkdir('qa-artifacts',{recursive:true});
async function run(name,viewport){
 const browser=await chromium.launch({headless:true});
 const page=await browser.newPage({viewport});
 const errors=[];page.on('pageerror',e=>errors.push(String(e)));
 await page.goto(base,{waitUntil:'domcontentloaded',timeout:60000});
 await page.waitForFunction(()=>document.querySelector('#cycle-visual .v54-svg[data-v54-ref="1"]'),null,{timeout:90000});
 await page.waitForFunction(()=>document.querySelector('#cycle-visual .v51c-cycle')?.dataset.v56Compare==='restored-dark',null,{timeout:30000});
 await page.waitForFunction(()=>document.querySelectorAll('#ai-gems .ai-gem').length>=20,null,{timeout:30000});
 const r=await page.evaluate(()=>{
  const svg=document.querySelector('#cycle-visual .v54-svg');
  const bg=getComputedStyle(svg).backgroundColor;
  const axis=document.querySelector('#cycle-visual .v54-axis');
  const cycle=document.querySelector('#cycle-visual .v51c-cycle');
  return {
   mark:document.querySelector('.mr-buildmark')?.textContent,
   bg,
   axisFont:axis?parseFloat(getComputedStyle(axis).fontSize):0,
   candles:document.querySelectorAll('#cycle-visual .v54-body').length,
   oldZoomVisible:!!document.querySelector('#cycle-visual .v51c-zoom')&&getComputedStyle(document.querySelector('#cycle-visual .v51c-zoom')).display!=='none',
   pairCount:document.querySelectorAll('#cycle-visual .v51c-pair').length,
   aiCore:document.querySelectorAll('#ai-gems .mr-body > .ai-gem-groups .ai-gem').length,
   aiAll:document.querySelectorAll('#ai-gems .ai-gem').length,
   us:document.querySelectorAll('#ai-gems .ai-gem[data-market="US"]').length,
   kr:document.querySelectorAll('#ai-gems .ai-gem[data-market="KR"]').length,
   nav:!!document.querySelector('.quicknav [data-go="ai-gems"]'),
   loadH:document.querySelector('#loadWrap')?.getBoundingClientRect().height||0,
   overflow:document.documentElement.scrollWidth-innerWidth,
   restored:cycle?.dataset.v56Compare
  };
 });
 if(r.mark!=='MR056')throw new Error(name+': mark '+r.mark);
 if(/255, 255, 255|rgb\(255/.test(r.bg))throw new Error(name+': chart still white '+r.bg);
 if(r.axisFont>15)throw new Error(name+': chart notation too large '+r.axisFont);
 if(r.candles<30)throw new Error(name+': candle chart missing '+r.candles);
 if(!r.oldZoomVisible||r.pairCount<3)throw new Error(name+': previous comparisons missing '+JSON.stringify(r));
 if(r.aiCore<12||r.aiAll<25||r.us<12||r.kr<8||!r.nav)throw new Error(name+': AI gems incomplete '+JSON.stringify(r));
 if(r.loadH>2)throw new Error(name+': loading gap '+r.loadH);
 if(r.overflow>3)throw new Error(name+': overflow '+r.overflow);
 const krFilter=page.locator('#ai-gems [data-ai-filter="KR"]');await krFilter.click();await page.waitForTimeout(100);
 const hiddenUS=await page.locator('#ai-gems .ai-gem[data-market="US"]').evaluateAll(xs=>xs.every(x=>x.hidden));if(!hiddenUS)throw new Error(name+': KR filter failed');
 await page.locator('#ai-gems [data-ai-filter="ALL"]').click();
 const sk=page.locator('#ai-gems [data-ai-ticker="000660"]').first();await sk.click();
 await page.waitForFunction(()=>document.querySelector('#modal')?.classList.contains('open'),null,{timeout:8000});
 await page.waitForTimeout(800);
 const mt=(await page.locator('#modalTitle').innerText()).trim();if(!mt.includes('SK하이닉스'))throw new Error(name+': Korean gem modal title '+mt);
 await page.locator('#modalClose').click();
 await page.locator('#ai-gems').scrollIntoViewIfNeeded();
 await page.screenshot({path:`qa-artifacts/${name}-ai-gems.png`,fullPage:false});
 if(errors.length)throw new Error(name+': '+errors.join(' | '));
 console.log(name,'PASS',r);
 await browser.close();
}
await run('desktop-v056',{width:1440,height:1000});
await run('mobile-v056',{width:390,height:844});
