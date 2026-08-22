import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
const base='http://127.0.0.1:4173/reports/stable-v051.html?qa=51c';
await fs.mkdir('qa-artifacts',{recursive:true});
async function run(name,viewport){
 const browser=await chromium.launch({headless:true});const page=await browser.newPage({viewport});const errors=[];page.on('pageerror',e=>errors.push(String(e)));
 await page.goto(base,{waitUntil:'domcontentloaded',timeout:60000});
 await page.waitForFunction(()=>document.querySelector('#cycle-visual .v51c-cycle'),null,{timeout:90000});
 await page.waitForFunction(()=>getComputedStyle(document.querySelector('#loadWrap')).display==='none',null,{timeout:70000});
 const r=await page.evaluate(()=>{const c=document.querySelector('#cycle-visual .mr-body > .v51c-cycle'),main=c?.querySelector(':scope .v51c-svg'),line=main?.querySelector('.v51c-current'),pair=c?.querySelector('.v51c-pair'),pairLine=pair?.querySelector('.v51c-current');return{mark:document.querySelector('.mr-buildmark')?.textContent,mainCurrent:c?.querySelectorAll(':scope > .v51c-zoom .v51c-current').length||0,currentPoints:Number(line?.dataset.currentPoints||0),mainStroke:line?getComputedStyle(line).stroke:'',mainDash:line?getComputedStyle(line).strokeDasharray:'',pairStroke:pairLine?getComputedStyle(pairLine).stroke:'',pairs:c?.querySelectorAll('.v51c-pair').length||0,history:main?.querySelectorAll('.v51c-history').length||0,prevLabel:c?.querySelector('.v51c-current-prev-label')?.textContent||'',score:pair?.dataset.contextScore||'',text:c?.innerText||'',zoom:c?.querySelectorAll('[data-v51c-zoom]').length||0,scrollWidth:document.documentElement.scrollWidth,innerWidth:innerWidth}});
 if(r.mark!=='MR051C')throw new Error(name+': mark '+r.mark);
 if(r.mainCurrent!==1)throw new Error(name+': main current must be one polyline, got '+r.mainCurrent);
 if(r.currentPoints<80)throw new Error(name+': current line is still short active leg, points='+r.currentPoints);
 if(!r.mainStroke.includes('85, 255, 125')&&!r.mainStroke.includes('85,255,125'))throw new Error(name+': current not lime '+r.mainStroke);
 if(!r.pairStroke.includes('85, 255, 125')&&!r.pairStroke.includes('85,255,125'))throw new Error(name+': pair current not lime '+r.pairStroke);
 if(r.mainDash!=='none'&&r.mainDash!=='')throw new Error(name+': current line still dashed '+r.mainDash);
 if(r.pairs<5||r.history<5)throw new Error(name+': comparison missing '+JSON.stringify({pairs:r.pairs,history:r.history}));
 for(const s of ['실제 최근 경로 전체','전체 관측 문맥','미래 역사경로는 점수에서 제외','현재와 과거 1개씩 실제 경로 비교','과거 중심구간 관측률'])if(!r.text.includes(s))throw new Error(name+': missing '+s);
 if(!r.prevLabel.includes('현재 이전 고점')&&!r.prevLabel.includes('현재 이전 저점'))throw new Error(name+': current prior pivot not explicit '+r.prevLabel);
 if(!Number.isFinite(Number(r.score)))throw new Error(name+': context score missing');
 if(r.zoom<6)throw new Error(name+': zoom missing '+r.zoom);
 if(r.scrollWidth>r.innerWidth+3)throw new Error(name+': overflow '+r.scrollWidth+'/'+r.innerWidth);
 const zoomed=await page.evaluate(()=>{const box=document.querySelector('#cycle-visual .v51c-cycle [data-v51c-zoom]'),layer=box?.querySelector('.v51c-zoom-layer');if(!box||!layer)return false;const ev=(type,touches)=>{const e=new Event(type,{bubbles:true,cancelable:true});Object.defineProperty(e,'touches',{value:touches});box.dispatchEvent(e)};ev('touchstart',[{clientX:100,clientY:100},{clientX:200,clientY:100}]);ev('touchmove',[{clientX:65,clientY:100},{clientX:235,clientY:100}]);return layer.style.transform.includes('scale(')&&!layer.style.transform.includes('scale(1)')});
 if(!zoomed)throw new Error(name+': pinch zoom failed');
 await page.screenshot({path:`qa-artifacts/${name}.png`,fullPage:true});
 if(errors.length)throw new Error(name+': '+errors.join(' | '));console.log(name,'PASS',r);await browser.close();
}
await run('desktop-v051c',{width:1440,height:1000});
await run('mobile-v051c',{width:390,height:844});
