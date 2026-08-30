import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';

const base='http://127.0.0.1:4173/reports/stable-v057.html?qa=57pivot4';
await fs.mkdir('qa-artifacts',{recursive:true});

function must(ok,message){if(!ok)throw new Error(message)}

async function run(name,viewport){
 const browser=await chromium.launch({headless:true});
 let page;
 try{
  page=await browser.newPage({viewport});
  const errors=[];
  page.on('pageerror',e=>errors.push(String(e)));
  await page.goto(base,{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForFunction(()=>document.querySelectorAll('#cycle-visual .v57p-card').length===5,null,{timeout:45000});
  await page.waitForFunction(()=>document.querySelectorAll('#ai-gems .ai-gem').length>=20,null,{timeout:20000});
  await page.waitForTimeout(500);
  const r=await page.evaluate(()=>{
   const cards=[...document.querySelectorAll('#cycle-visual .v57p-card')];
   const svgs=cards.map(x=>x.querySelector('.v57p-svg')).filter(Boolean);
   const scores=svgs.map(x=>Number(x.dataset.score));
   const ranges=svgs.map(x=>`${x.dataset.ymin}|${x.dataset.ymax}`);
   const appChildren=[...document.querySelector('#app')?.children||[]].map(x=>x.id).filter(Boolean);
   const currentPaths=cards.map(x=>x.querySelector('.v57p-current')).filter(Boolean);
   const currentHeight=currentPaths.map(x=>{try{return x.getBBox().height}catch{return 0}});
   return {
    mark:document.querySelector('.mr-buildmark')?.textContent,
    title:document.querySelector('#cycle-visual .mr-head h2')?.textContent||'',
    cards:cards.length,
    svgs:svgs.length,
    scoreParts:document.querySelectorAll('#cycle-visual .v57p-scoreparts span').length,
    axisLabels:document.querySelectorAll('#cycle-visual .v57p-axis').length,
    candles:document.querySelectorAll('#cycle-visual .v56f-body').length,
    volumes:document.querySelectorAll('#cycle-visual .v56f-vol').length,
    nowLines:document.querySelectorAll('#cycle-visual .v57p-now-line').length,
    nowDots:document.querySelectorAll('#cycle-visual .v57p-now-dot').length,
    futureZones:document.querySelectorAll('#cycle-visual .v57p-future-zone').length,
    outcomes:document.querySelectorAll('#cycle-visual .v57p-outcomes span').length,
    futureDays:svgs.map(x=>Number(x.dataset.futureDays)),
    currentState:document.querySelector('#cycle-visual .v57p-current-state')?.textContent||'',
    scores,ranges,currentHeight,
    viewHeights:svgs.map(x=>x.viewBox.baseVal.height),
    displayHeights:svgs.map(x=>x.getBoundingClientRect().height),
    method:document.querySelector('#cycle-visual .v57p-method')?.textContent||'',
    titleNote:document.querySelector('#cycle-visual .v57p-title')?.textContent||'',
    priceCutoff:document.querySelector('.info-tag.freshness')?.textContent||'',
    scoreLabel:document.querySelector('.scores')?.textContent||'',
    scoreGuide:document.querySelector('.score-guide')?.textContent||'',
    flatNotice:[...document.querySelectorAll('#charts .notice')].map(x=>x.textContent).join(' '),
    cycleIndex:appChildren.indexOf('cycle-visual'),
    themesIndex:appChildren.indexOf('themes'),
    loadH:document.querySelector('#loadWrap')?.getBoundingClientRect().height||0,
    overflow:document.documentElement.scrollWidth-innerWidth,
    aiAll:document.querySelectorAll('#ai-gems .ai-gem').length,
    styles:document.styleSheets.length,
    scripts:document.scripts.length
   };
  });

  must(r.mark==='MR057',`${name}: build mark ${r.mark}`);
  must(r.title.includes('실제 사이클')&&r.title.includes('현재 이후 과거 경로'),`${name}: cycle title ${r.title}`);
  must(r.cards===5&&r.svgs===5,`${name}: five cycle cards missing ${JSON.stringify(r)}`);
  must(r.scoreParts===15,`${name}: score breakdown missing ${r.scoreParts}`);
  must(r.axisLabels===25,`${name}: y-axis labels missing ${r.axisLabels}`);
  must(r.candles>=350&&r.volumes>=175,`${name}: chart layers too sparse ${r.candles}/${r.volumes}`);
  must(r.nowLines===5&&r.nowDots===5&&r.futureZones===5,`${name}: current/future markers missing ${JSON.stringify(r)}`);
  must(r.outcomes===15,`${name}: historical future outcomes missing ${r.outcomes}`);
  must(r.futureDays.every(x=>x===126),`${name}: future horizon invalid ${r.futureDays}`);
  must(r.currentState.includes('현재 위치')&&r.currentState.includes('대응 저점 이후'),`${name}: current position summary missing`);
  must(r.viewHeights.every(x=>x>=380),`${name}: chart viewBox too flat ${r.viewHeights}`);
  must(r.displayHeights.every(x=>x>=185),`${name}: rendered chart too flat ${r.displayHeights}`);
  must(r.currentHeight.every(x=>x>=25),`${name}: current path visually flat ${r.currentHeight}`);
  must(new Set(r.ranges).size>=2,`${name}: cards still share one global scale ${r.ranges}`);
  must(r.scores.every((x,i)=>i===0||r.scores[i-1]>=x),`${name}: structure scores not descending ${r.scores}`);
  must(r.method.includes('현재 위치까지만 계산')&&r.method.includes('미래를 보장하지 않습니다'),`${name}: score warning missing`);
  must(r.titleNote.includes('미래 구간을 보지 않고 후보를 고른 뒤'),`${name}: look-ahead warning missing`);
  must(r.priceCutoff.includes('가격 기준'),`${name}: price cutoff missing ${r.priceCutoff}`);
  must(r.scoreLabel.includes('진입여건')&&r.scoreGuide.includes('직접 비교하지 않음'),`${name}: score semantics unclear`);
  must(r.flatNotice.includes('평면 그래프는 표시하지 않습니다'),`${name}: stale intraday state missing`);
  must(r.cycleIndex>=0&&r.themesIndex>r.cycleIndex,`${name}: cycle is not prioritized ${r.cycleIndex}/${r.themesIndex}`);
  must(r.loadH<=2,`${name}: loading gap ${r.loadH}`);
  must(r.overflow<=3,`${name}: page overflow ${r.overflow}`);
  must(r.aiAll>=20,`${name}: AI section regression ${r.aiAll}`);
  must(r.styles<=2&&r.scripts<=3,`${name}: asset cascade not bundled ${r.styles}/${r.scripts}`);
  must(errors.length===0,`${name}: ${errors.join(' | ')}`);

  await page.locator('#cycle-visual .v57p-card').first().scrollIntoViewIfNeeded();
  await page.screenshot({path:`qa-artifacts/${name}-cycle-pivot.png`,fullPage:false});
  console.log(name,'PASS',r);
 }catch(e){
  console.error(name,'FAIL',e);
  if(page){try{await page.screenshot({path:`qa-artifacts/${name}-FAIL.png`,fullPage:false})}catch{}}
  throw e;
 }finally{await browser.close()}
}

await run('desktop-v057',{width:1440,height:1000});
await run('mobile-v057',{width:390,height:844});
