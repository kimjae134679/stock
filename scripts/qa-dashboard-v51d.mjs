import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
const base='http://127.0.0.1:4173/reports/stable-v051.html?qa=51d';
await fs.mkdir('qa-artifacts',{recursive:true});
async function run(name,viewport){
 const browser=await chromium.launch({headless:true});const page=await browser.newPage({viewport});const errors=[];page.on('pageerror',e=>errors.push(String(e)));
 await page.goto(base,{waitUntil:'domcontentloaded',timeout:60000});
 await page.waitForFunction(()=>document.querySelector('#cycle-visual .v51c-cycle'),null,{timeout:90000});
 await page.waitForFunction(()=>document.querySelector('#cycle-visual .v51c-svg')?.dataset.v51dLarge==='1',null,{timeout:10000});
 const r=await page.evaluate(()=>{const main=document.querySelector('#cycle-visual .v51c-svg'),pair=document.querySelector('#cycle-visual .v51c-pair-svg'),cur=main?.querySelector('.v51c-current');const mr=main?.getBoundingClientRect(),pr=pair?.getBoundingClientRect();return{mark:document.querySelector('.mr-buildmark')?.textContent,mainH:mr?.height||0,mainW:mr?.width||0,pairH:pr?.height||0,pairW:pr?.width||0,ratio:mr?mr.height/mr.width:0,preserve:main?.getAttribute('preserveAspectRatio'),pairPreserve:pair?.getAttribute('preserveAspectRatio'),currentStroke:cur?getComputedStyle(cur).stroke:'',dash:cur?getComputedStyle(cur).strokeDasharray:'',overflow:document.documentElement.scrollWidth-innerWidth}});
 if(r.mark!=='MR051D')throw new Error(name+': mark '+r.mark);
 const mobile=viewport.width<=700;
 if(r.mainH<(mobile?470:550))throw new Error(name+': main chart too small '+r.mainH);
 if(r.pairH<(mobile?370:410))throw new Error(name+': pair chart too small '+r.pairH);
 if(r.preserve!=='none'||r.pairPreserve!=='none')throw new Error(name+': chart not screen-fill '+JSON.stringify(r));
 if(!r.currentStroke.includes('85, 255, 125')&&!r.currentStroke.includes('85,255,125'))throw new Error(name+': current line not lime '+r.currentStroke);
 if(r.dash && r.dash!=='none')throw new Error(name+': current line dashed '+r.dash);
 if(r.overflow>3)throw new Error(name+': horizontal overflow '+r.overflow);
 await page.locator('#cycle-visual').scrollIntoViewIfNeeded();
 await page.screenshot({path:`qa-artifacts/${name}.png`,fullPage:false});
 if(errors.length)throw new Error(name+': '+errors.join(' | '));
 console.log(name,'PASS',r);await browser.close();
}
await run('desktop-v051d',{width:1440,height:1000});
await run('mobile-v051d',{width:390,height:844});
