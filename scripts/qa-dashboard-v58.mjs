import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';

const base='http://127.0.0.1:4173/reports/stable-v058.html?qa=58future1';
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
  await page.waitForFunction(()=>document.querySelectorAll('#cycle-visual .v58p-card').length===5,null,{timeout:45000});
  await page.waitForFunction(()=>document.querySelectorAll('#ai-gems .ai-gem').length>=20,null,{timeout:20000});
  await page.waitForTimeout(500);
  const r=await page.evaluate(()=>{
   const cards=[...document.querySelectorAll('#cycle-visual .v58p-card')];
   const svgs=cards.map(x=>x.querySelector('.v58p-svg')).filter(Boolean);
   return {
    mark:document.querySelector('.mr-buildmark')?.textContent,
    title:document.querySelector('#cycle-visual .mr-head h2')?.textContent||'',
    cards:cards.length,svgs:svgs.length,
    nowLines:document.querySelectorAll('#cycle-visual .v58p-now-line').length,
    nowDots:document.querySelectorAll('#cycle-visual .v58p-current-dot').length,
    futureZones:document.querySelectorAll('#cycle-visual .v58p-future-zone').length,
    horizons:document.querySelectorAll('#cycle-visual .v58p-horizon-label').length,
    forwardStats:document.querySelectorAll('#cycle-visual .v58p-forward span').length,
    axisLabels:document.querySelectorAll('#cycle-visual .v58p-axis').length,
    dateLabels:document.querySelectorAll('#cycle-visual .v58p-date').length,
    candles:document.querySelectorAll('#cycle-visual .v56f-body').length,
    scores:svgs.map(x=>Number(x.dataset.score)),
    futureDays:svgs.map(x=>Number(x.dataset.futureDays)),
    nowRatio:svgs.map(x=>Number(x.dataset.nowRatio)),
    currentEnd:svgs.map(x=>Number(x.dataset.currentEndX)),
    nowX:svgs.map(x=>Number(x.dataset.nowX)),
    histEnd:svgs.map(x=>Number(x.dataset.histEndX)),
    lookahead:svgs.map(x=>x.dataset.scoreLookahead),
    viewHeights:svgs.map(x=>x.viewBox.baseVal.height),
    displayHeights:svgs.map(x=>x.getBoundingClientRect().height),
    copy:document.querySelector('#cycle-visual .v58p-method')?.textContent||'',
    head:document.querySelector('#cycle-visual .v58p-head')?.textContent||'',
    titleNote:document.querySelector('#cycle-visual .v58p-title')?.textContent||'',
    range:document.querySelector('#cycle-visual .v58p-range')?.textContent||'',
    loadH:document.querySelector('#loadWrap')?.getBoundingClientRect().height||0,
    overflow:document.documentElement.scrollWidth-innerWidth,
    aiAll:document.querySelectorAll('#ai-gems .ai-gem').length,
    styles:document.styleSheets.length,
    scripts:document.scripts.length
   };
  });
  must(r.mark==='MR058',`${name}: build mark ${r.mark}`);
  must(r.title.includes('현재 이후 과거 6개월'),`${name}: cycle title ${r.title}`);
  must(r.cards===5&&r.svgs===5,`${name}: five cycle cards missing ${JSON.stringify(r)}`);
  must(r.nowLines===5&&r.nowDots===5&&r.futureZones===5,`${name}: current/future markers missing ${JSON.stringify(r)}`);
  must(r.horizons>=15&&r.forwardStats>=15,`${name}: 1/3/6 month continuation missing ${r.horizons}/${r.forwardStats}`);
  must(r.futureDays.every(x=>x>=126),`${name}: future history shorter than 126 bars ${r.futureDays}`);
  must(r.currentEnd.every((x,i)=>x===r.nowX[i]),`${name}: current path does not end at now ${r.currentEnd}/${r.nowX}`);
  must(r.histEnd.every((x,i)=>x-r.nowX[i]>=126),`${name}: history does not continue right of now ${r.histEnd}/${r.nowX}`);
  must(r.nowRatio.every(x=>x>=0.60&&x<=0.80),`${name}: now still pinned to chart edge ${r.nowRatio}`);
  must(r.lookahead.every(x=>x==='0'),`${name}: lookahead contract missing ${r.lookahead}`);
  must(r.copy.includes('예측값이 아닙니다')&&r.copy.includes('점수 계산에 0% 사용'),`${name}: no-lookahead copy missing`);
  must(r.head.includes('504거래일')&&r.head.includes('126거래일'),`${name}: period copy missing ${r.head}`);
  must(r.titleNote.includes('미래 결과 미사용'),`${name}: selection warning missing`);
  must(r.range.includes('현재 위치 오른쪽'),`${name}: range summary missing`);
  must(r.axisLabels>=30&&r.dateLabels>=35,`${name}: labels too sparse ${r.axisLabels}/${r.dateLabels}`);
  must(r.candles>=500,`${name}: chart detail too sparse ${r.candles}`);
  must(r.viewHeights.every(x=>x>=540),`${name}: chart viewBox too short ${r.viewHeights}`);
  must(r.displayHeights.every(x=>x>=240),`${name}: chart rendered too small ${r.displayHeights}`);
  must(r.scores.every((x,i)=>i===0||r.scores[i-1]>=x),`${name}: scores not descending ${r.scores}`);
  must(r.loadH<=2,`${name}: loading gap ${r.loadH}`);
  must(r.overflow<=3,`${name}: page overflow ${r.overflow}`);
  must(r.aiAll>=20,`${name}: AI section regression ${r.aiAll}`);
  must(r.styles<=3&&r.scripts<=5,`${name}: excessive assets ${r.styles}/${r.scripts}`);
  must(errors.length===0,`${name}: ${errors.join(' | ')}`);
  await page.locator('#cycle-visual .v58p-card').first().scrollIntoViewIfNeeded();
  await page.screenshot({path:`qa-artifacts/${name}-cycle-future.png`,fullPage:false});
  console.log(name,'PASS',r);
 }catch(e){
  console.error(name,'FAIL',e);
  if(page){try{await page.screenshot({path:`qa-artifacts/${name}-FAIL.png`,fullPage:false})}catch{}}
  throw e;
 }finally{await browser.close()}
}

await run('desktop-v058',{width:1440,height:1000});
await run('mobile-v058',{width:390,height:844});
