import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd();
const latestData=JSON.parse(fs.readFileSync(path.join(root,'public/data/latest.json'),'utf8').replace(/^\uFEFF/,''));
const latest=path.join(root,'public/reports/latest.html');
const archiveRel=String(latestData.report_path||'').replace(/^\/+/, '');
const archive=archiveRel?path.join(root,'public',archiveRel):null;
const rawVersion=String(latestData.app_version||'0.2.0').trim().replace(/^v/i,'');
const displayVersion='v'+rawVersion;
function finalize(file,depth){
  if(!file||!fs.existsSync(file))return;
  let h=fs.readFileSync(file,'utf8');
  const assetPrefix=depth==='latest'?'../assets/':'../../../assets/';
  const indexHref=depth==='latest'?'../index.html':'../../../index.html';
  h=h.replace(/<script>\s*\(\(\)=>\{'use strict';const DATA=.*?<\/script>(?=<script type="application\/json" id="investment-handoff-data">)/s,
    `<script src="${assetPrefix}static-report-runtime.js?v=${rawVersion}"></script>`);
  h=h.replace(/Market Radar Daily · (?:FULL|v\d+(?:\.\d+)*)/g,`Market Radar Daily · ${displayVersion}`);
  h=h.replace(/Market Radar Daily (?:FULL|v\d+(?:\.\d+)*)/g,`Market Radar Daily ${displayVersion}`);
  if(depth!=='latest'){
    h=h.replaceAll('href="../assets/','href="../../../assets/');
    h=h.replaceAll('src="../assets/','src="../../../assets/');
    h=h.replace('href="../index.html"',`href="${indexHref}"`);
  }
  fs.writeFileSync(file,h,'utf8');
}
finalize(latest,'latest');
finalize(archive,'archive');
console.log('Finalized static runtime:',displayVersion,latest,archive||'');
