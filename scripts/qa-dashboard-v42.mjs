import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';

const base=process.env.MR_QA_URL||'http://127.0.0.1:4173/reports/stable-v042.html?qa=1';
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
  const result=await page.evaluate(ids=>{
    const q=s=>document.querySelector(s);
    const missing=ids.filter(id=>!document.getElementById(id));
    const load=q('#loadWrap')?.getBoundingClientRect();
    const action=q('#action'),actionBody=q('#action .mr-body');
    const actionText=actionBody?.textContent?.trim()||'';
    const foldButtons=[...document.querySelectorAll('[data-fold]')];
    const blankButtons=foldButtons.filter(b=>!(b.textContent||'').trim()).map(b=>b.dataset.fold);
    const suspicious=[...document.querySelectorAll('.mr-section')].map(s=>{const r=s.getBoundingClientRect(),body=s.querySelector('.mr-body'),txt=(body?.textContent||'').trim();return{id:s.id,h:Math.round(r.height),text:txt.length,folded:s.classList.contains('is-folded')}}).filter(x=>x.h>350&&x.text<30);
    const foldedBad=[...document.querySelectorAll('.mr-section.is-folded')].map(s=>({id:s.id,h:Math.round(s.getBoundingClientRect().height),body:Math.round((s.querySelector('.mr-body')?.getBoundingClientRect().height)||0)})).filter(x=>x.h>150||x.body>1);
    return {missing,loadHeight:load?.height??-1,actionTextLength:actionText.length,actionHeight:Math.round(action?.getBoundingClientRect().height||0),foldCount:foldButtons.length,blankButtons,suspicious,foldedBad,version:q('.top b')?.textContent||'',mark:q('.mr-buildmark')?.textContent||''};
  },ids);
  if(!result.version.includes('v0.4.2'))throw new Error(`${name}: version mismatch ${result.version}`);
  if(result.mark!=='MR042')throw new Error(`${name}: mark mismatch ${result.mark}`);
  if(result.missing.length)throw new Error(`${name}: missing ${result.missing.join(',')}`);
  if(result.loadHeight!==0)throw new Error(`${name}: load area did not collapse, h=${result.loadHeight}`);
  if(result.actionTextLength<500)throw new Error(`${name}: action body too small ${result.actionTextLength}`);
  if(result.foldCount<16)throw new Error(`${name}: fold buttons ${result.foldCount}`);
  if(result.blankButtons.length)throw new Error(`${name}: blank fold buttons ${result.blankButtons.join(',')}`);
  if(result.suspicious.length)throw new Error(`${name}: suspicious blank panels ${JSON.stringify(result.suspicious)}`);
  if(result.foldedBad.length)throw new Error(`${name}: folded panels retain height ${JSON.stringify(result.foldedBad)}`);

  const actionBtn=page.locator('#action [data-fold="action"]');
  await actionBtn.click();
  const folded=await page.evaluate(()=>({cls:document.querySelector('#action')?.classList.contains('is-folded'),h:Math.round(document.querySelector('#action')?.getBoundingClientRect().height||0),bh:Math.round(document.querySelector('#action .mr-body')?.getBoundingClientRect().height||0),txt:document.querySelector('#action [data-fold="action"]')?.textContent||''}));
  if(!folded.cls||folded.h>150||folded.bh>1||folded.txt!=='펼치기')throw new Error(`${name}: action collapse failed ${JSON.stringify(folded)}`);
  await actionBtn.click();
  const opened=await page.evaluate(()=>({cls:document.querySelector('#action')?.classList.contains('is-folded'),bh:Math.round(document.querySelector('#action .mr-body')?.getBoundingClientRect().height||0),txt:document.querySelector('#action [data-fold="action"]')?.textContent||''}));
  if(opened.cls||opened.bh<200||opened.txt!=='접기')throw new Error(`${name}: action expand failed ${JSON.stringify(opened)}`);

  await page.screenshot({path:`qa-artifacts/${name}.png`,fullPage:true});
  if(errors.length)console.warn(`[${name}] nonfatal console errors`,errors);
  console.log(`[${name}] PASS`,result,folded,opened);
  await browser.close();
}

await run('desktop-v042',{width:1440,height:1000});
await run('mobile-v042',{width:390,height:844});
console.log('MR042 browser QA PASS');
