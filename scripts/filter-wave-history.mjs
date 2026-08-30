import fs from 'node:fs/promises';
const p='public/data/wave-cycles.json';
const j=JSON.parse(await fs.readFile(p,'utf8'));
for(const [ticker,a] of Object.entries(j.assets||{})){
  const cutoff=a?.current_context?.start_date;
  if(!cutoff) continue;
  const before=(a.representatives||[]).filter(w=>String(w.second_low_date||'')<cutoff);
  if(before.length>=5) a.representatives=before;
  const anchors=(a.analog_anchors||[]).filter(w=>String(w.anchor_date||'')<cutoff);
  if(anchors.length>=5) a.analog_anchors=anchors;
  a.history_cutoff=cutoff;
}
if((j.assets?.QQQ?.representatives||[]).length<5) throw new Error('QQQ non-overlapping historical wave templates insufficient');
j.method_note+=' 현재 문맥과 날짜가 겹치는 구조 후보는 비교에서 제외한다.';
await fs.writeFile(p,JSON.stringify(j)+'\n','utf8');
console.log('filtered historical wave templates',Object.fromEntries(Object.entries(j.assets||{}).map(([k,v])=>[k,{templates:(v.representatives||[]).length,anchors:(v.analog_anchors||[]).length}])));
