import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
const base='http://127.0.0.1:4173/reports/stable-v055.html?qa=55';
await fs.mkdir('qa-artifacts',{recursive:true});
async function run(name,viewport){
 const browser=await chromium.launch({headless:true});
 const page=await browser.newPage({viewport});
 const errors=[];page.on('pageerror',e=>errors.push(String(e)));
 await page.goto(base,{waitUntil:'domcontentloaded',timeout:60000});
 await page.waitForFunction(()=>document.querySelector('#cycle-visual .v54-svg[data-v54-ref="1"]'),null,{timeout:90000});
 await page.waitForFunction(()=>document.querySelector('#cycle-visual .v51c-cycle')?.dataset.v55Compare==='restored',null,{timeout:30000});
 const r=await page.evaluate(()=>{
   const cycle=document.querySelector('#cycle-visual .v51c-cycle');
   const ref=document.querySelector('#cycle-visual .v54-ref');
   const oldZoom=document.querySelector('#cycle-visual .v51c-zoom');
   const oldLegend=document.querySelector('#cycle-visual .v51c-legend');
   const oldPairs=document.querySelector('#cycle-visual .v51c-pairs');
   const svg=document.querySelector('#cycle-visual .v54-svg');
   const box=svg?.getBoundingClientRect();
   return {
     mark:document.querySelector('.mr-buildmark')?.textContent,
     refTitle:ref?.querySelector('.v54-ref-head b')?.textContent?.trim(),
     candles:document.querySelectorAll('#cycle-visual .v54-body').length,
     volumes:document.querySelectorAll('#cycle-visual .v54-vol').length,
     tabs:document.querySelectorAll('#cycle-visual [data-v54-pick]').length,
     oldZoomVisible:!!oldZoom&&getComputedStyle(oldZoom).display!=='none'&&oldZoom.getBoundingClientRect().height>20,
     oldLegendVisible:!!oldLegend&&getComputedStyle(oldLegend).display!=='none',
     oldPairsVisible:!!oldPairs&&getComputedStyle(oldPairs).display!=='none',
     oldHistoryLines:document.querySelectorAll('#cycle-visual .v51c-zoom .v51c-history').length,
     oldCurrent:!!document.querySelector('#cycle-visual .v51c-zoom .v51c-current'),
     pairCount:document.querySelectorAll('#cycle-visual .v51c-pair').length,
     overlayTitle:document.querySelector('#cycle-visual .v55-overlay-head b')?.textContent?.trim(),
     chartW:box?.width||0,chartH:box?.height||0,
     overflow:document.documentElement.scrollWidth-innerWidth,
     loadH:document.querySelector('#loadWrap')?.getBoundingClientRect().height||0,
     restored:cycle?.dataset.v55Compare
   };
 });
 if(r.mark!=='MR055')throw new Error(name+': mark '+r.mark);
 if(!r.refTitle?.includes('실제 사이클 비교'))throw new Error(name+': reference chart title missing '+r.refTitle);
 if(r.candles<30||r.volumes<30)throw new Error(name+': actual chart missing '+JSON.stringify(r));
 if(r.tabs<3)throw new Error(name+': history tabs missing '+r.tabs);
 if(!r.oldZoomVisible||!r.oldLegendVisible||!r.oldPairsVisible)throw new Error(name+': previous comparison UI still hidden '+JSON.stringify(r));
 if(r.oldHistoryLines<3||!r.oldCurrent)throw new Error(name+': overlay paths missing '+JSON.stringify(r));
 if(r.pairCount<3)throw new Error(name+': 1-to-1 comparisons missing '+r.pairCount);
 if(r.overlayTitle!=='과거 사이클 겹쳐 비교')throw new Error(name+': overlay title '+r.overlayTitle);
 if(r.restored!=='restored')throw new Error(name+': v55 restore marker missing');
 if(r.overflow>3)throw new Error(name+': horizontal overflow '+r.overflow);
 if(r.loadH>2)throw new Error(name+': loading gap remains '+r.loadH);
 const second=page.locator('#cycle-visual [data-v54-pick="1"]').first();
 await second.click();await page.waitForTimeout(250);
 if(!await second.evaluate(el=>el.classList.contains('active')))throw new Error(name+': reference tab did not switch');
 await page.locator('#cycle-visual').scrollIntoViewIfNeeded();
 await page.screenshot({path:`qa-artifacts/${name}-cycle.png`,fullPage:false});
 if(errors.length)throw new Error(name+': '+errors.join(' | '));
 console.log(name,'PASS',r);
 await browser.close();
}
await run('desktop-v055',{width:1440,height:1000});
await run('mobile-v055',{width:390,height:844});
