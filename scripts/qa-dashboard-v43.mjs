import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';

const base=process.env.MR_QA_URL||'http://127.0.0.1:4173/reports/stable-v043.html?qa=1';
const ids=['themes','action','charts','picks','mr-famous','mr-compounders','mr-universe','expanded','etfs','allocation','research','smart-money','sources','history','replay','macro'];
await fs.mkdir('qa-artifacts',{recursive:true});

async function run(name,viewport){
  const browser=await chromium.launch({headless:true});
  const page=await browser.newPage({viewportSize:viewport});
  await page.route('https://s.tradingview.com/**',route=>route.abort());
  const errors=[];
  page.on('pageerror',e=>errors.push('pageerror: '+e.message));
  page.on('console',m=>{if(m.type()==='error')errors.push('console: '+m.text())});
  await page.goto(base,{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForFunction(()=>document.querySelector('#loadWrap')?.hidden===true,{timeout:15000});
  await page.waitForTimeout(450);

  const result=await page.evaluate(ids=>{
    const q=s=>document.querySelector(s),qa=s=>[...document.querySelectorAll(s)];
    const missing=ids.filter(id=>!document.getElementById(id));
    const load=q('#loadWrap')?.getBoundingClientRect();
    const action=q('#action'),actionBody=q('#action .mr-body'),hero=q('#market');
    const foldButtons=qa('[data-fold]');
    const suspicious=qa('.mr-section').map(s=>{const r=s.getBoundingClientRect(),body=s.querySelector('.mr-body'),txt=(body?.textContent||'').trim();return{id:s.id,h:Math.round(r.height),text:txt.length,folded:s.classList.contains('is-folded')}}).filter(x=>x.h>350&&x.text<30);
    const foldedBad=qa('.mr-section.is-folded').map(s=>({id:s.id,h:Math.round(s.getBoundingClientRect().height),body:Math.round((s.querySelector('.mr-body')?.getBoundingClientRect().height)||0)})).filter(x=>x.h>150||x.body>1);
    return {
      missing,
      version:q('.top b')?.textContent||'',mark:q('.mr-buildmark')?.textContent||'',
      loadHeight:load?.height??-1,
      actionText:(actionBody?.textContent||'').trim(),actionHeight:Math.round(action?.getBoundingClientRect().height||0),
      actionFocus:!!q('#action .action-focus'),phaseGuide:!!q('#action .phase-guide'),
      heroSummary:!!q('#marketSummary'),heroAction:!!q('#marketAction'),heroText:hero?.textContent||'',heroHeight:Math.round(hero?.getBoundingClientRect().height||0),
      analogOpen:q('.analog-details')?.open??false,
      phaseSummaryParagraph:!!q('#segmentPhaseNow>p'),phaseActionCount:qa('#segmentPhaseNow .phase-action').length,
      pickTagCount:qa('#picks .pick-tags .info-tag').length,
      rawJsonMacro:(q('#macro .mr-body')?.textContent||'').includes('{"'),
      endmark:qa('.endmark').length,
      foldCount:foldButtons.length,
      blankButtons:foldButtons.filter(b=>!(b.textContent||'').trim()).map(b=>b.dataset.fold),
      suspicious,foldedBad,
      scrollWidth:document.documentElement.scrollWidth,innerWidth:window.innerWidth
    };
  },ids);

  if(!result.version.includes('v0.4.3'))throw new Error(`${name}: version mismatch ${result.version}`);
  if(result.mark!=='MR043')throw new Error(`${name}: mark mismatch ${result.mark}`);
  if(result.missing.length)throw new Error(`${name}: missing ${result.missing.join(',')}`);
  if(result.loadHeight!==0)throw new Error(`${name}: load area h=${result.loadHeight}`);
  if(!result.heroSummary||!result.heroAction)throw new Error(`${name}: hero summary/action structure missing`);
  if(/\d{4}-\d{2}-\d{2}T\d{2}:/.test(result.heroText))throw new Error(`${name}: raw ISO timestamp duplicated in hero`);
  if(result.heroHeight>(name.startsWith('mobile')?1050:800))throw new Error(`${name}: hero too tall ${result.heroHeight}`);
  if(result.analogOpen)throw new Error(`${name}: analog details should be collapsed initially`);
  if(!result.actionFocus||!result.phaseGuide)throw new Error(`${name}: compact action guide missing`);
  if(result.actionText.length<180||result.actionText.length>2400)throw new Error(`${name}: action density ${result.actionText.length}`);
  if((result.actionText.match(/이 구간에 들어오면/g)||[]).length)throw new Error(`${name}: redundant inactive action filler remains`);
  if(result.phaseSummaryParagraph)throw new Error(`${name}: duplicate phase summary paragraph remains`);
  if(result.phaseActionCount<5)throw new Error(`${name}: phase actions not rendered ${result.phaseActionCount}`);
  if(result.pickTagCount<8)throw new Error(`${name}: compact pick tags missing ${result.pickTagCount}`);
  if(result.rawJsonMacro)throw new Error(`${name}: macro raw JSON string detected`);
  if(result.endmark)throw new Error(`${name}: redundant endmark remains`);
  if(result.foldCount<16)throw new Error(`${name}: fold buttons ${result.foldCount}`);
  if(result.blankButtons.length)throw new Error(`${name}: blank fold buttons ${result.blankButtons.join(',')}`);
  if(result.suspicious.length)throw new Error(`${name}: suspicious blank panels ${JSON.stringify(result.suspicious)}`);
  if(result.foldedBad.length)throw new Error(`${name}: folded panels retain height ${JSON.stringify(result.foldedBad)}`);
  if(result.scrollWidth>result.innerWidth+3)throw new Error(`${name}: page horizontal overflow ${result.scrollWidth}/${result.innerWidth}`);

  const actionBtn=page.locator('#action [data-fold="action"]');
  await actionBtn.click();
  const folded=await page.evaluate(()=>({cls:document.querySelector('#action')?.classList.contains('is-folded'),h:Math.round(document.querySelector('#action')?.getBoundingClientRect().height||0),bh:Math.round(document.querySelector('#action .mr-body')?.getBoundingClientRect().height||0),txt:document.querySelector('#action [data-fold="action"]')?.textContent||''}));
  if(!folded.cls||folded.h>150||folded.bh>1||folded.txt!=='펼치기')throw new Error(`${name}: action collapse failed ${JSON.stringify(folded)}`);
  await actionBtn.click();
  const opened=await page.evaluate(()=>({cls:document.querySelector('#action')?.classList.contains('is-folded'),bh:Math.round(document.querySelector('#action .mr-body')?.getBoundingClientRect().height||0),txt:document.querySelector('#action [data-fold="action"]')?.textContent||''}));
  if(opened.cls||opened.bh<120||opened.txt!=='접기')throw new Error(`${name}: action expand failed ${JSON.stringify(opened)}`);

  const pick=page.locator('#picks [data-ticker]').first();
  if(await pick.count()){
    await pick.click();
    await page.waitForFunction(()=>document.querySelector('#modal')?.classList.contains('open'));
    await page.locator('#modalClose').click();
    await page.waitForFunction(()=>!document.querySelector('#modal')?.classList.contains('open'));
  }

  await page.screenshot({path:`qa-artifacts/${name}.png`,fullPage:true});
  if(errors.length)console.warn(`[${name}] nonfatal console errors`,errors);
  console.log(`[${name}] PASS`,result,folded,opened);
  await browser.close();
}

await run('desktop-v043',{width:1440,height:1000});
await run('mobile-v043',{width:390,height:844});
console.log('MR043 browser QA PASS');
