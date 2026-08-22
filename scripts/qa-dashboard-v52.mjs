import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
const base='http://127.0.0.1:4173/reports/stable-v052.html?qa=52';
await fs.mkdir('qa-artifacts',{recursive:true});
async function run(name,viewport){
 const browser=await chromium.launch({headless:true});
 const page=await browser.newPage({viewport});
 const errors=[];page.on('pageerror',e=>errors.push(String(e)));
 await page.goto(base,{waitUntil:'domcontentloaded',timeout:60000});
 await page.waitForFunction(()=>document.querySelector('#cycle-visual .v51c-cycle'),null,{timeout:90000});
 await page.waitForFunction(()=>document.querySelector('#cycle-visual .v51c-svg')?.dataset.v52RatioFix==='1',null,{timeout:15000});
 const r=await page.evaluate(()=>{
   const main=document.querySelector('#cycle-visual .v51c-svg');
   const pair=document.querySelector('#cycle-visual .v51c-pair-svg');
   const mr=main?.getBoundingClientRect(),pr=pair?.getBoundingClientRect();
   const cur=main?.querySelector('.v51c-current');
   const hidden=[...document.querySelectorAll('#cycle-visual .v51c-current-prev-label,#cycle-visual .v51c-current-prev-value,#cycle-visual .v51c-history-prev-label')].every(x=>getComputedStyle(x).display==='none');
   return {
     mark:document.querySelector('.mr-buildmark')?.textContent,
     mainW:mr?.width||0,mainH:mr?.height||0,mainRatio:mr?mr.height/mr.width:0,
     pairW:pr?.width||0,pairH:pr?.height||0,pairRatio:pr?pr.height/pr.width:0,
     mainPreserve:main?.getAttribute('preserveAspectRatio'),pairPreserve:pair?.getAttribute('preserveAspectRatio'),
     noteCount:document.querySelectorAll('#cycle-visual .v52-chart-note').length,
     hiddenVerbose:hidden,
     currentStroke:cur?getComputedStyle(cur).stroke:'',dash:cur?getComputedStyle(cur).strokeDasharray:'',
     overflow:document.documentElement.scrollWidth-innerWidth,
     loadH:document.querySelector('#loadWrap')?.getBoundingClientRect().height||0
   };
 });
 if(r.mark!=='MR052')throw new Error(name+': mark '+r.mark);
 if(r.mainPreserve!=='xMidYMid meet'||r.pairPreserve!=='xMidYMid meet')throw new Error(name+': aspect preserve incorrect '+JSON.stringify(r));
 if(Math.abs(r.mainRatio-(535/920))>.035)throw new Error(name+': distorted main ratio '+r.mainRatio);
 if(Math.abs(r.pairRatio-(365/840))>.035)throw new Error(name+': distorted pair ratio '+r.pairRatio);
 if(r.mainW<(viewport.width<=700?300:650))throw new Error(name+': main chart too narrow '+r.mainW);
 if(r.noteCount<1)throw new Error(name+': external chart note missing');
 if(!r.hiddenVerbose)throw new Error(name+': verbose plot labels still visible');
 if(!r.currentStroke.includes('85, 255, 125')&&!r.currentStroke.includes('85,255,125'))throw new Error(name+': current line not lime '+r.currentStroke);
 if(r.dash&&r.dash!=='none')throw new Error(name+': current line dashed '+r.dash);
 if(r.overflow>3)throw new Error(name+': horizontal overflow '+r.overflow);
 if(r.loadH>2)throw new Error(name+': loading gap remains '+r.loadH);
 await page.locator('#cycle-visual').scrollIntoViewIfNeeded();
 await page.screenshot({path:`qa-artifacts/${name}.png`,fullPage:false});
 if(errors.length)throw new Error(name+': '+errors.join(' | '));
 console.log(name,'PASS',r);
 await browser.close();
}
await run('desktop-v052',{width:1440,height:1000});
await run('mobile-v052',{width:390,height:844});
