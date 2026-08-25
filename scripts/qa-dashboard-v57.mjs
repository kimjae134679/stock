import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
const base='http://127.0.0.1:4173/reports/stable-v057.html?qa=57final';
await fs.mkdir('qa-artifacts',{recursive:true});

async function run(name,viewport){
 const browser=await chromium.launch({headless:true});
 let page;
 try{
  page=await browser.newPage({viewport});
  const errors=[];page.on('pageerror',e=>errors.push(String(e)));
  await page.goto(base,{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForFunction(()=>document.querySelector('#cycle-visual .v56f-board'),null,{timeout:45000});
  await page.waitForFunction(()=>document.querySelectorAll('#cycle-visual .v56f-preview').length===5,null,{timeout:15000});
  await page.waitForFunction(()=>document.querySelectorAll('#ai-gems .ai-gem').length>=20,null,{timeout:20000});
  await page.waitForTimeout(800);
  const r=await page.evaluate(()=>{
   const currentSvg=document.querySelector('#cycle-visual .v56f-current-card .v56f-svg');
   const currentPath=document.querySelector('#cycle-visual .v56f-current-wide');
   const main=document.querySelector('#cycle-visual .v56f-main .v56f-svg');
   const up=document.querySelector('#cycle-visual .v56f-main .v56f-body.up');
   const down=document.querySelector('#cycle-visual .v56f-main .v56f-body.down');
   const ma20=document.querySelector('#cycle-visual .v56f-main .v56f-ma20');
   let currentWidth=0,svgWidth=0;
   try{currentWidth=currentPath?.getBBox().width||0;svgWidth=currentSvg?.viewBox?.baseVal?.width||0}catch{}
   const legacySelectors=['.v45-cycle-svg','.v46-cycle-svg','.v47-cycle-wrap','.v48-shell','.v49-shell','.v50-shell','.v51-cycle','.v51b-cycle','.v51c-cycle','.v54-ref','.v56w-board'];
   return {
    mark:document.querySelector('.mr-buildmark')?.textContent,
    ready:document.documentElement.classList.contains('mr-cycle-final-ready'),
    bg:main?getComputedStyle(main).backgroundColor:'',
    up:up?getComputedStyle(up).fill:'',
    down:down?getComputedStyle(down).fill:'',
    ma20:ma20?getComputedStyle(ma20).stroke:'',
    currentDays:parseInt(document.querySelector('#cycle-visual .v56f-current-head strong')?.textContent||'0',10)||0,
    currentWidth,svgWidth,
    previews:document.querySelectorAll('#cycle-visual .v56f-preview').length,
    previewSvgs:document.querySelectorAll('#cycle-visual .v56f-preview .v56f-svg').length,
    wideRange:Number(main?.dataset.rangeDays||0),
    overlayDays:Number(main?.dataset.currentDays||0),
    candles:document.querySelectorAll('#cycle-visual .v56f-main .v56f-body').length,
    volumes:document.querySelectorAll('#cycle-visual .v56f-main .v56f-vol').length,
    ma5:!!document.querySelector('#cycle-visual .v56f-main .v56f-ma5'),
    ma60:!!document.querySelector('#cycle-visual .v56f-main .v56f-ma60'),
    currentOverlay:!!document.querySelector('#cycle-visual .v56f-main .v56f-current-overlay'),
    legacyCount:legacySelectors.reduce((n,s)=>n+document.querySelectorAll('#cycle-visual '+s).length,0),
    loadH:document.querySelector('#loadWrap')?.getBoundingClientRect().height||0,
    overflow:document.documentElement.scrollWidth-innerWidth,
    aiAll:document.querySelectorAll('#ai-gems .ai-gem').length
   };
  });
  if(r.mark!=='MR057')throw new Error(name+': mark '+r.mark);
  if(!r.ready)throw new Error(name+': final renderer not ready');
  if(!/255, 255, 255/.test(r.bg))throw new Error(name+': final stock chart not white '+r.bg);
  if(r.currentDays<100)throw new Error(name+': green current window too short '+r.currentDays);
  if(r.svgWidth<900||r.currentWidth/r.svgWidth<0.78)throw new Error(name+': green graph does not fill width '+JSON.stringify({currentWidth:r.currentWidth,svgWidth:r.svgWidth}));
  if(r.previews!==5||r.previewSvgs!==5)throw new Error(name+': five previews missing '+JSON.stringify(r));
  if(r.wideRange<500||r.overlayDays<100)throw new Error(name+': comparison range too short '+JSON.stringify(r));
  if(r.candles<120||r.volumes<120||!r.ma5||!r.ma20||!r.ma60||!r.currentOverlay)throw new Error(name+': stock-chart layers missing '+JSON.stringify(r));
  if(r.legacyCount!==0)throw new Error(name+': legacy graph DOM rendered '+r.legacyCount);
  if(r.loadH>2)throw new Error(name+': loading gap '+r.loadH);
  if(r.overflow>3)throw new Error(name+': overflow '+r.overflow);
  if(r.aiAll<20)throw new Error(name+': AI section regression '+r.aiAll);

  const second=page.locator('#cycle-visual [data-v56f-select="1"]');
  await second.click();await page.waitForTimeout(100);
  const selected=await page.locator('#cycle-visual .v56f-board').getAttribute('data-selected');
  if(selected!=='1')throw new Error(name+': preview selection failed '+selected);

  await page.locator('#cycle-visual .v56f-board').scrollIntoViewIfNeeded();
  await page.screenshot({path:`qa-artifacts/${name}-final-current-wide.png`,fullPage:false});
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
