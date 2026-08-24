import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
const base='http://127.0.0.1:4173/reports/stable-v057.html?qa=57';
await fs.mkdir('qa-artifacts',{recursive:true});

async function run(name,viewport){
 const browser=await chromium.launch({headless:true});
 let page;
 try{
  page=await browser.newPage({viewport});
  const errors=[];page.on('pageerror',e=>errors.push(String(e)));
  await page.goto(base,{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForFunction(()=>document.querySelector('#cycle-visual .v54-svg[data-v54-ref="1"]'),null,{timeout:75000});
  await page.waitForFunction(()=>document.querySelectorAll('#cycle-visual .v56w-preview').length===5,null,{timeout:30000});
  await page.waitForFunction(()=>Number(document.querySelector('#cycle-visual .v56w-main .v56w-svg')?.dataset.rangeDays||0)>=500,null,{timeout:15000});
  await page.waitForFunction(()=>document.querySelectorAll('#ai-gems .ai-gem').length>=20,null,{timeout:20000});
  const r=await page.evaluate(()=>{
   const main=document.querySelector('#cycle-visual .v56w-main .v56w-svg');
   const original=document.querySelector('#cycle-visual .v54-svg');
   const mainStyle=main?getComputedStyle(main):null;
   const grid=document.querySelector('#cycle-visual .v56w-main .v56w-grid');
   const axis=document.querySelector('#cycle-visual .v56w-main .v56w-axis');
   const up=document.querySelector('#cycle-visual .v56w-main .v56w-body.up');
   const down=document.querySelector('#cycle-visual .v56w-main .v56w-body.down');
   const ma20=document.querySelector('#cycle-visual .v56w-main .v56w-ma20');
   return {
    mark:document.querySelector('.mr-buildmark')?.textContent,
    bg:mainStyle?.backgroundColor||'',
    originalBg:original?getComputedStyle(original).backgroundColor:'',
    grid:grid?getComputedStyle(grid).stroke:'',
    axis:axis?getComputedStyle(axis).fill:'',
    up:up?getComputedStyle(up).fill:'',
    down:down?getComputedStyle(down).fill:'',
    ma20:ma20?getComputedStyle(ma20).stroke:'',
    previews:document.querySelectorAll('#cycle-visual .v56w-preview').length,
    previewSvgs:document.querySelectorAll('#cycle-visual .v56w-preview .v56w-svg').length,
    wideRange:Number(main?.dataset.rangeDays||0),
    afterDays:Number(main?.dataset.afterDays||0),
    candles:document.querySelectorAll('#cycle-visual .v56w-main .v56w-body').length,
    volumes:document.querySelectorAll('#cycle-visual .v56w-main .v56w-vol').length,
    ma5:!!document.querySelector('#cycle-visual .v56w-main .v56w-ma5'),
    ma60:!!document.querySelector('#cycle-visual .v56w-main .v56w-ma60'),
    current:!!document.querySelector('#cycle-visual .v56w-main .v56w-current'),
    loadH:document.querySelector('#loadWrap')?.getBoundingClientRect().height||0,
    overflow:document.documentElement.scrollWidth-innerWidth,
    aiAll:document.querySelectorAll('#ai-gems .ai-gem').length
   };
  });
  if(r.mark!=='MR057')throw new Error(name+': mark '+r.mark);
  if(!/255, 255, 255/.test(r.bg)||!/255, 255, 255/.test(r.originalBg))throw new Error(name+': reference chart not white '+JSON.stringify(r));
  if(r.previews!==5||r.previewSvgs!==5)throw new Error(name+': five comparison previews missing '+JSON.stringify(r));
  if(r.wideRange<500||r.afterDays<180)throw new Error(name+': historical range too short '+JSON.stringify(r));
  if(r.candles<120||r.volumes<120||!r.ma5||!r.ma20||!r.ma60||!r.current)throw new Error(name+': stock-chart layers missing '+JSON.stringify(r));
  if(r.loadH>2)throw new Error(name+': loading gap '+r.loadH);
  if(r.overflow>3)throw new Error(name+': overflow '+r.overflow);
  if(r.aiAll<20)throw new Error(name+': AI section regression '+r.aiAll);
  await page.locator('#cycle-visual .v56w-board').scrollIntoViewIfNeeded();
  await page.screenshot({path:`qa-artifacts/${name}-reference-chart.png`,fullPage:false});
  if(errors.length)throw new Error(name+': '+errors.join(' | '));
  console.log(name,'PASS',r);
 } catch(e){
  console.error(name,'FAIL',e);
  if(page){try{await page.screenshot({path:`qa-artifacts/${name}-FAIL.png`,fullPage:false})}catch{}}
  throw e;
 } finally { await browser.close(); }
}

await run('desktop-v057',{width:1440,height:1000});
await run('mobile-v057',{width:390,height:844});
