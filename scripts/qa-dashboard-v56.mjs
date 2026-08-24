import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
const base='http://127.0.0.1:4173/reports/stable-v056.html?qa=56';
await fs.mkdir('qa-artifacts',{recursive:true});

async function run(name,viewport){
 const browser=await chromium.launch({headless:true});
 let page;
 try{
  page=await browser.newPage({viewport});
  const errors=[];page.on('pageerror',e=>errors.push(String(e)));
  await page.goto(base,{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForFunction(()=>document.querySelector('#cycle-visual .v54-svg[data-v54-ref="1"]'),null,{timeout:75000});
  await page.waitForFunction(()=>document.querySelector('#cycle-visual .v51c-cycle')?.dataset.v56Compare==='restored-dark',null,{timeout:20000});
  await page.waitForFunction(()=>document.querySelectorAll('#cycle-visual .v56w-preview').length===5,null,{timeout:30000});
  await page.waitForFunction(()=>Number(document.querySelector('#cycle-visual .v56w-main .v56w-svg')?.dataset.rangeDays||0)>=500,null,{timeout:15000});
  await page.waitForFunction(()=>document.querySelectorAll('#ai-gems .ai-gem').length>=20,null,{timeout:20000});
  const r=await page.evaluate(()=>{
   const svg=document.querySelector('#cycle-visual .v54-svg');
   const bg=svg?getComputedStyle(svg).backgroundColor:'';
   const axis=document.querySelector('#cycle-visual .v54-axis');
   const cycle=document.querySelector('#cycle-visual .v51c-cycle');
   const wide=document.querySelector('#cycle-visual .v56w-main .v56w-svg');
   return {
    mark:document.querySelector('.mr-buildmark')?.textContent,
    bg,
    axisFont:axis?parseFloat(getComputedStyle(axis).fontSize):0,
    candles:document.querySelectorAll('#cycle-visual .v54-body').length,
    oldZoomVisible:!!document.querySelector('#cycle-visual .v51c-zoom')&&getComputedStyle(document.querySelector('#cycle-visual .v51c-zoom')).display!=='none',
    pairCount:document.querySelectorAll('#cycle-visual .v51c-pair').length,
    previews:document.querySelectorAll('#cycle-visual .v56w-preview').length,
    previewSvgs:document.querySelectorAll('#cycle-visual .v56w-preview .v56w-svg').length,
    wideRange:Number(wide?.dataset.rangeDays||0),
    afterDays:Number(wide?.dataset.afterDays||0),
    futureLabel:document.querySelector('#cycle-visual .v56w-after-label')?.textContent||'',
    wideCandles:document.querySelectorAll('#cycle-visual .v56w-main .v56w-body').length,
    currentPath:!!document.querySelector('#cycle-visual .v56w-main .v56w-current'),
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
  if(r.candles<30)throw new Error(name+': original candle chart missing '+r.candles);
  if(!r.oldZoomVisible||r.pairCount<3)throw new Error(name+': previous comparisons missing '+JSON.stringify(r));
  if(r.previews!==5||r.previewSvgs!==5)throw new Error(name+': all comparison previews missing '+JSON.stringify(r));
  if(r.wideRange<500)throw new Error(name+': date range not wide enough '+r.wideRange);
  if(r.afterDays<180)throw new Error(name+': future-side historical context too short '+r.afterDays);
  if(!r.futureLabel.includes('예측 아님')||r.wideCandles<120||!r.currentPath)throw new Error(name+': wide main chart incomplete '+JSON.stringify(r));
  if(r.aiCore<12||r.aiAll<25||r.us<12||r.kr<8||!r.nav)throw new Error(name+': AI gems incomplete '+JSON.stringify(r));
  if(r.loadH>2)throw new Error(name+': loading gap '+r.loadH);
  if(r.overflow>3)throw new Error(name+': overflow '+r.overflow);

  const second=page.locator('#cycle-visual [data-v56w-select="1"]');
  await second.click();await page.waitForTimeout(100);
  const selected=await page.locator('#cycle-visual .v56w-board').getAttribute('data-selected');
  if(selected!=='1')throw new Error(name+': preview selection did not change main chart '+selected);

  const krFilter=page.locator('#ai-gems [data-ai-filter="KR"]');
  await krFilter.click();await page.waitForTimeout(120);
  const hiddenUS=await page.locator('#ai-gems .ai-gem[data-market="US"]').evaluateAll(xs=>xs.every(x=>x.hidden));
  if(!hiddenUS)throw new Error(name+': KR filter failed');
  await page.locator('#ai-gems [data-ai-filter="ALL"]').click();

  const sk=page.locator('#ai-gems [data-ai-ticker="000660"]').first();
  await sk.click();
  await page.waitForFunction(()=>document.querySelector('#modal')?.classList.contains('open'),null,{timeout:8000});
  await page.waitForTimeout(700);
  const mt=(await page.locator('#modalTitle').innerText()).trim();
  if(!mt.includes('SK하이닉스'))throw new Error(name+': Korean gem modal title '+mt);
  await page.locator('#modalClose').click();

  await page.locator('#cycle-visual .v56w-board').scrollIntoViewIfNeeded();
  await page.screenshot({path:`qa-artifacts/${name}-wide-cycle.png`,fullPage:false});
  if(errors.length)throw new Error(name+': '+errors.join(' | '));
  console.log(name,'PASS',r);
 } catch(e){
  console.error(name,'FAIL',e);
  if(page){try{await page.screenshot({path:`qa-artifacts/${name}-FAIL.png`,fullPage:false})}catch{}}
  throw e;
 } finally {
  await browser.close();
 }
}

await run('desktop-v056',{width:1440,height:1000});
await run('mobile-v056',{width:390,height:844});
