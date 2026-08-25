import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
const base='http://127.0.0.1:4173/reports/stable-v056.html?qa=56final';
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
  await page.waitForTimeout(700);
  const r=await page.evaluate(()=>{
   const currentSvg=document.querySelector('#cycle-visual .v56f-current-card .v56f-svg');
   const currentPath=document.querySelector('#cycle-visual .v56f-current-wide');
   const mainSvg=document.querySelector('#cycle-visual .v56f-main .v56f-svg');
   const currentDays=parseInt(document.querySelector('#cycle-visual .v56f-current-head strong')?.textContent||'0',10)||0;
   let currentWidth=0,svgWidth=0;
   try{currentWidth=currentPath?.getBBox().width||0;svgWidth=currentSvg?.viewBox?.baseVal?.width||0}catch{}
   const legacySelectors=['.v46-cycle-svg','.v47-cycle-wrap','.v48-shell','.v49-shell','.v50-shell','.v51-cycle','.v51b-cycle','.v51c-cycle','.v54-ref','.v56w-board'];
   return {
    mark:document.querySelector('.mr-buildmark')?.textContent,
    ready:document.documentElement.classList.contains('mr-cycle-final-ready'),
    currentDays,currentWidth,svgWidth,
    previews:document.querySelectorAll('#cycle-visual .v56f-preview').length,
    previewSvgs:document.querySelectorAll('#cycle-visual .v56f-preview .v56f-svg').length,
    wideRange:Number(mainSvg?.dataset.rangeDays||0),
    overlayDays:Number(mainSvg?.dataset.currentDays||0),
    wideCandles:document.querySelectorAll('#cycle-visual .v56f-main .v56f-body').length,
    currentStandalone:!!currentPath,
    currentOverlay:!!document.querySelector('#cycle-visual .v56f-main .v56f-current-overlay'),
    futureLabel:document.querySelector('#cycle-visual .v56f-after-label')?.textContent||'',
    legacyCount:legacySelectors.reduce((n,s)=>n+document.querySelectorAll('#cycle-visual '+s).length,0),
    aiCore:document.querySelectorAll('#ai-gems .mr-body > .ai-gem-groups .ai-gem').length,
    aiAll:document.querySelectorAll('#ai-gems .ai-gem').length,
    us:document.querySelectorAll('#ai-gems .ai-gem[data-market="US"]').length,
    kr:document.querySelectorAll('#ai-gems .ai-gem[data-market="KR"]').length,
    nav:!!document.querySelector('.quicknav [data-go="ai-gems"]'),
    loadH:document.querySelector('#loadWrap')?.getBoundingClientRect().height||0,
    overflow:document.documentElement.scrollWidth-innerWidth,
    cycleText:document.querySelector('#cycle-visual .mr-body')?.innerText||''
   };
  });
  if(r.mark!=='MR056')throw new Error(name+': mark '+r.mark);
  if(!r.ready)throw new Error(name+': final cycle renderer did not mark ready');
  if(r.currentDays<100)throw new Error(name+': current green window too short '+r.currentDays);
  if(!r.currentStandalone||r.svgWidth<900||r.currentWidth/r.svgWidth<0.78)throw new Error(name+': current green graph does not fill width '+JSON.stringify({currentWidth:r.currentWidth,svgWidth:r.svgWidth}));
  if(r.previews!==5||r.previewSvgs!==5)throw new Error(name+': all comparison previews missing '+JSON.stringify(r));
  if(r.wideRange<500)throw new Error(name+': historical date range not wide enough '+r.wideRange);
  if(r.overlayDays<100||r.wideCandles<120||!r.currentOverlay)throw new Error(name+': main comparison incomplete '+JSON.stringify(r));
  if(!r.futureLabel.includes('예측 아님'))throw new Error(name+': historical future-side disclaimer missing');
  if(r.legacyCount!==0)throw new Error(name+': legacy cycle DOM still rendered '+r.legacyCount);
  if(!r.cycleText.includes('현재 QQQ 실제 경로')||!r.cycleText.includes('실제 데이터만'))throw new Error(name+': final-only cycle copy missing');
  if(r.aiCore<12||r.aiAll<25||r.us<12||r.kr<8||!r.nav)throw new Error(name+': AI gems incomplete '+JSON.stringify(r));
  if(r.loadH>2)throw new Error(name+': loading gap '+r.loadH);
  if(r.overflow>3)throw new Error(name+': overflow '+r.overflow);

  const second=page.locator('#cycle-visual [data-v56f-select="1"]');
  await second.click();await page.waitForTimeout(100);
  const selected=await page.locator('#cycle-visual .v56f-board').getAttribute('data-selected');
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

  await page.locator('#cycle-visual .v56f-board').scrollIntoViewIfNeeded();
  await page.screenshot({path:`qa-artifacts/${name}-final-cycle.png`,fullPage:false});
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
