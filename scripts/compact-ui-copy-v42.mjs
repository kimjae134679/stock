import fs from 'node:fs/promises';

const FILES={
  latest:'public/data/latest.json',
  phase:'public/data/live/phase-status.json'
};

function compact(value,max=180,maxSentences=3){
  const s=String(value??'').replace(/\s+/g,' ').trim();
  if(!s||s.length<=max)return s;
  const sentences=s.match(/[^.!?]+[.!?]?/g)?.map(x=>x.trim()).filter(Boolean)||[s];
  let out='';
  for(const sentence of sentences.slice(0,maxSentences)){
    const next=(out?out+' ':'')+sentence;
    if(next.length>max)break;
    out=next;
  }
  if(out&&out.length>=Math.min(45,max*.35))return out.replace(/[.!?]?$/, '…');
  const cut=s.slice(0,max-1);
  const at=Math.max(cut.lastIndexOf(' '),cut.lastIndexOf('·'),cut.lastIndexOf(','));
  return (at>max*.55?cut.slice(0,at):cut).trim()+'…';
}

function compactLatest(d){
  if(d?.market){
    d.market.summary=compact(d.market.summary,220,3);
    d.market.final_action=compact(d.market.final_action,180,3);
    d.market.next_trigger=compact(d.market.next_trigger,125,1);
    if(d.market.action)d.market.action=compact(d.market.action,70,1);
  }
  for(const x of d?.themes||[]) x.action=compact(x.action,70,2);
  for(const x of d?.expanded_themes||[]){
    x.thesis=compact(x.thesis,95,1);
    x.risk=compact(x.risk,80,1);
  }
  for(const x of d?.top_picks||[]){
    x.action=compact(x.action,45,1);
    x.note=compact(x.note,95,2);
  }
  for(const x of d?.research||[]){
    if(x.take)x.take=compact(x.take,180,3);
    if(x.action)x.action=compact(x.action,90,2);
  }
  if(d?.research_consensus){
    if(d.research_consensus.conclusion)d.research_consensus.conclusion=compact(d.research_consensus.conclusion,220,3);
    if(d.research_consensus.action)d.research_consensus.action=compact(d.research_consensus.action,120,2);
  }
  for(const x of d?.smart_money||[]){
    if(x.note)x.note=compact(x.note,180,3);
    if(x.take)x.take=compact(x.take,180,3);
    if(x.action)x.action=compact(x.action,90,2);
  }
  if(d?.macro&&typeof d.macro==='object'){
    for(const [k,v] of Object.entries(d.macro)) if(typeof v==='string') d.macro[k]=compact(v,180,3);
  }
  if(d?.details&&typeof d.details==='object'){
    for(const x of Object.values(d.details)) if(x&&typeof x==='object'&&x.summary)x.summary=compact(x.summary,220,3);
  }
  return d;
}

function compactPhase(d){
  if(d?.summary)d.summary=compact(d.summary,220,3);
  for(const x of d?.segments||[]) if(x.action)x.action=compact(x.action,80,2);
  // data_status is audit/detail text and deliberately remains detailed.
  return d;
}

for(const [kind,path] of Object.entries(FILES)){
  const raw=await fs.readFile(path,'utf8');
  const data=JSON.parse(raw);
  const out=kind==='latest'?compactLatest(data):compactPhase(data);
  await fs.writeFile(path,JSON.stringify(out,null,2)+'\n','utf8');
  console.log('[compact-ui-copy]',kind,path);
}
