import fs from 'node:fs';
const file='public/reports/latest.html';
const h=fs.readFileSync(file,'utf8');
const required=['id="market"','id="themes"','id="action"','id="charts"','id="picks"','id="coverage-groups"','id="famous"','id="compounders"','id="universe"','id="expanded"','id="etfs"','id="allocation"','id="research"','id="smart-money"','id="sources"','id="history"','id="replay"','id="macro"','✓ 보고서 끝'];
const missing=required.filter(x=>!h.includes(x));
if(missing.length){console.error('Missing FULL sections:',missing);process.exit(1)}
if(h.includes('데이터 로드 실패: Unexpected token')){console.error('Broken JSON error baked into HTML');process.exit(1)}
if(!h.includes('static-report-runtime.js')){console.error('Stable runtime missing');process.exit(1)}
const size=Buffer.byteLength(h);
if(size<40000){console.error('FULL report suspiciously small:',size);process.exit(1)}
console.log('FULL report validation OK', {size, sections:required.length});
