import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';

const base=process.env.MR_QA_URL||'http://127.0.0.1:4173/reports/stable-v045.html?qa=1';
const ids=['themes','action','cycle-visual','charts','picks','mr-famous','mr-compounders','mr-universe','expanded','etfs','allocation','research','smart-money','sources','history','replay','macro'];
await fs.mkdir('qa-artifacts',{recursive:true});

async function run(name,viewport){
  const browser=await chromium.launch({headless:true});
  const page=await browser.newPage({viewport});
  await page.route('https://s.tradingview.com/**',route=>route.abort());
  const errors=[];
  page.on('pageerror',e=>errors.push('pageerror: '+e.message));
  await page.goto(base,{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForFunction(()=>document.querySelector('#loadWrap')?.hidden===true,{timeout:15000});
  await page.waitForFunction(()=>document.querySelector('#cycle-visual .v45-cycle-svg'),{timeout:30000});
  await page.waitForFunction(()=>document.querySelector('#charts .v45-intraday-chart'),{timeout:15000});
  await page.waitForFunction(()=>document.querySelectorAll('#history .v45-turn-row').length>=24,{timeout:15000});
  await page.waitForTimeout(300);

  const r=await page.evaluate(ids=>{
    const q=s=>document.querySelector(s),qa=s=>[...document.querySelectorAll(s)];
    const missing=ids.filter(id=>!document.getElementById(id));
    const suspicious=qa('.mr-section').map(s=>{const box=s.getBoundingClientRect(),body=s.querySelector('.mr-body'),txt=(body?.textContent||'').trim();return{id:s.id,h:Math.round(box.height),text:txt.length,folded:s.classList.contains('is-folded')}}).filter(x=>x.h>350&&x.text<30);
    const foldedBad=qa('.mr-section.is-folded').map(s=>({id:s.id,h:Math.round(s.getBoundingClientRect().height),body:Math.round((s.querySelector('.mr-body')?.getBoundingClientRect().height)||0)})).filter(x=>x.h>150||x.body>1);
    return {
      missing,version:q('.top b')?.textContent||'',mark:q('.mr-buildmark')?.textContent||'',loadHeight:q('#loadWrap')?.getBoundingClientRect().height??-1,
      viewport:[window.innerWidth,window.innerHeight],scoreHints:qa('.scorebox b small').length,themeHints:qa('.theme-card strong small').length,pickHints:qa('.pick-row>strong small').length,
      avoid:(q('.hero-avoid span')?.textContent||'')+' '+(q('#action .action-conditions>div:nth-child(2) b')?.textContent||''),
      cycleTitle:q('#cycle-visual .mr-head h2')?.textContent||'',cycleText:q('#cycle-visual .mr-body')?.textContent||'',cycleSvg:qa('#cycle-visual .v45-cycle-svg').length,cycleProxy:qa('#cycle-visual .v45-proxy').length,
      chartTitle:q('#charts .mr-head h2')?.textContent||'',chartText:q('#charts .mr-body')?.textContent||'',intradaySvg:qa('#charts .v45-intraday-svg').length,
      turnRows:qa('#history .v45-turn-row').length,analogCards:qa('#history .v45-analog-grid>div').length,oldValidation:!!q('#history .v45-old-validation'),
      suspicious,foldedBad,scrollWidth:document.documentElement.scrollWidth,innerWidth:window.innerWidth
    };
  },ids);

  if(r.viewport[0]!==viewport.width||r.viewport[1]!==viewport.height)throw new Error(`${name}: wrong viewport ${r.viewport.join('x')} expected ${viewport.width}x${viewport.height}`);
  if(!r.version.includes('v0.4.5'))throw new Error(`${name}: version ${r.version}`);
  if(r.mark!=='MR045')throw new Error(`${name}: mark ${r.mark}`);
  if(r.missing.length)throw new Error(`${name}: missing ${r.missing.join(',')}`);
  if(r.loadHeight!==0)throw new Error(`${name}: load gap ${r.loadHeight}`);
  if(r.scoreHints<5||r.themeHints<3||r.pickHints<5)throw new Error(`${name}: semantic score labels missing ${JSON.stringify(r)}`);
  if(/3x|3배|사지마|사지 말|매수 금지/i.test(r.avoid))throw new Error(`${name}: blunt avoid copy remains: ${r.avoid}`);
  for(const word of ['상승','고점','하락','저점','다음 상승'])if(!r.cycleText.includes(word))throw new Error(`${name}: cycle phase missing ${word}`);
  if(r.cycleSvg<1||r.cycleProxy<5||!r.cycleText.includes('/100'))throw new Error(`${name}: full cycle visual incomplete`);
  if(r.intradaySvg<1||!r.chartText.includes('단위: %')||r.chartText.includes('시장 매수타이밍'))throw new Error(`${name}: intraday UX incomplete`);
  if(r.turnRows<24||r.analogCards<6||!r.oldValidation)throw new Error(`${name}: turning-point expansion incomplete ${r.turnRows}/${r.analogCards}`);
  if(r.suspicious.length)throw new Error(`${name}: blank panels ${JSON.stringify(r.suspicious)}`);
  if(r.foldedBad.length)throw new Error(`${name}: folded height ${JSON.stringify(r.foldedBad)}`);
  if(r.scrollWidth>r.innerWidth+3)throw new Error(`${name}: horizontal overflow ${r.scrollWidth}/${r.innerWidth}`);

  const cycleBtn=page.locator('#cycle-visual [data-ticker="QQQ"]').first();
  await cycleBtn.click();
  await page.waitForFunction(()=>document.querySelector('#modal')?.classList.contains('open'));
  await page.waitForFunction(()=>document.querySelector('#modal .v45-modal-cycle .v45-cycle-svg'),{timeout:5000});
  const modal=await page.evaluate(()=>({full:document.querySelectorAll('#modal .v45-cycle-svg').length,text:document.querySelector('#modalBody')?.textContent||''}));
  if(modal.full<1||!modal.text.includes('풀 사이클 위치'))throw new Error(`${name}: modal full cycle missing`);
  await page.locator('#modalClose').click();
  await page.waitForFunction(()=>!document.querySelector('#modal')?.classList.contains('open'));

  const actionBtn=page.locator('#action [data-fold="action"]');
  await actionBtn.click();
  const folded=await page.evaluate(()=>({cls:document.querySelector('#action')?.classList.contains('is-folded'),bh:Math.round(document.querySelector('#action .mr-body')?.getBoundingClientRect().height||0)}));
  if(!folded.cls||folded.bh>1)throw new Error(`${name}: fold failed`);
  await actionBtn.click();
  await page.screenshot({path:`qa-artifacts/${name}.png`,fullPage:true});
  if(errors.length)throw new Error(`${name}: ${errors.join(' | ')}`);
  console.log(`[${name}] PASS`,r,modal);
  await browser.close();
}

await run('desktop-v045',{width:1440,height:1000});
await run('mobile-v045',{width:390,height:844});
console.log('MR045 browser QA PASS');
