import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
const base='http://127.0.0.1:4173/reports/stable-v054.html?qa=54';
await fs.mkdir('qa-artifacts',{recursive:true});
async function run(name,viewport){
 const browser=await chromium.launch({headless:true});
 const page=await browser.newPage({viewport});
 const errors=[];page.on('pageerror',e=>errors.push(String(e)));
 await page.goto(base,{waitUntil:'domcontentloaded',timeout:60000});
 await page.waitForFunction(()=>document.querySelector('#cycle-visual .v54-svg[data-v54-ref="1"]'),null,{timeout:90000});
 const r=await page.evaluate(()=>{
   const svg=document.querySelector('#cycle-visual .v54-svg');
   const box=svg?.getBoundingClientRect();
   return {
     mark:document.querySelector('.mr-buildmark')?.textContent,
     title:document.querySelector('#cycle-visual .v54-ref-head b')?.textContent?.trim(),
     candleBodies:document.querySelectorAll('#cycle-visual .v54-body').length,
     volumes:document.querySelectorAll('#cycle-visual .v54-vol').length,
     ma5:!!document.querySelector('#cycle-visual .v54-ma5[d]'),
     ma20:!!document.querySelector('#cycle-visual .v54-ma20[d]'),
     ma60:!!document.querySelector('#cycle-visual .v54-ma60[d]'),
     current:!!document.querySelector('#cycle-visual .v54-current[d]'),
     tabs:document.querySelectorAll('#cycle-visual [data-v54-pick]').length,
     chartW:box?.width||0,chartH:box?.height||0,ratio:box?box.height/box.width:0,
     source:document.querySelector('#cycle-visual .v54-source')?.textContent||'',
     oldMainVisible:[...document.querySelectorAll('#cycle-visual .v51c-cycle>.v51c-zoom')].some(x=>getComputedStyle(x).display!=='none'),
     overflow:document.documentElement.scrollWidth-innerWidth,
     loadH:document.querySelector('#loadWrap')?.getBoundingClientRect().height||0
   };
 });
 if(r.mark!=='MR054')throw new Error(name+': mark '+r.mark);
 if(r.title!=='실제 사이클 비교')throw new Error(name+': title '+r.title);
 if(r.candleBodies<30||r.volumes<30)throw new Error(name+': actual candles/volume missing '+JSON.stringify(r));
 if(!r.ma5||!r.ma20||!r.ma60||!r.current)throw new Error(name+': MA/current overlay missing '+JSON.stringify(r));
 if(r.tabs<3)throw new Error(name+': history tabs missing '+r.tabs);
 if(Math.abs(r.ratio-(650/940))>.04)throw new Error(name+': chart ratio wrong '+r.ratio);
 if(!r.source.includes('Yahoo Finance')&&!r.source.includes('Stooq'))throw new Error(name+': actual source missing '+r.source);
 if(r.oldMainVisible)throw new Error(name+': superseded abstract chart still visible');
 if(r.overflow>3)throw new Error(name+': horizontal overflow '+r.overflow);
 if(r.loadH>2)throw new Error(name+': loading gap remains '+r.loadH);
 const second=page.locator('#cycle-visual [data-v54-pick="1"]').first();
 await second.click();
 await page.waitForTimeout(250);
 const active=await second.evaluate(el=>el.classList.contains('active'));
 if(!active)throw new Error(name+': comparison tab did not switch');
 await page.locator('#cycle-visual').scrollIntoViewIfNeeded();
 await page.screenshot({path:`qa-artifacts/${name}-cycle.png`,fullPage:false});
 if(errors.length)throw new Error(name+': '+errors.join(' | '));
 console.log(name,'PASS',r);
 await browser.close();
}
await run('desktop-v054',{width:1440,height:1000});
await run('mobile-v054',{width:390,height:844});
