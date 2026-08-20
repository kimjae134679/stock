import fs from 'node:fs/promises';

const FILES={
  latest:'public/data/latest.json',
  phase:'public/data/live/phase-status.json'
};

const normalize=s=>String(s??'').replace(/(\d)\.\s+(\d)/g,'$1.$2').replace(/\s+/g,' ').trim();

function compact(value,max=180,maxSentences=3){
  const s=normalize(value);
  if(!s||s.length<=max)return s;
  const protectedText=s.replace(/(\d)\.(\d)/g,'$1§DEC§$2');
  const sentences=(protectedText.match(/[^.!?]+[.!?]?/g)||[protectedText])
    .map(x=>x.replace(/§DEC§/g,'.').trim()).filter(Boolean);
  let out='';
  for(const sentence of sentences.slice(0,maxSentences)){
    const next=(out?out+' ':'')+sentence;
    if(next.length>max)break;
    out=next;
  }
  if(out&&out.length>=Math.min(45,max*.35))return normalize(out).replace(/[.!?]?$/, '…');
  const cut=s.slice(0,max-1);
  const at=Math.max(cut.lastIndexOf(' '),cut.lastIndexOf('·'),cut.lastIndexOf(','));
  return normalize((at>max*.55?cut.slice(0,at):cut).trim()+'…');
}

function repairAllStrings(v){
  if(typeof v==='string')return normalize(v);
  if(Array.isArray(v))return v.map(repairAllStrings);
  if(v&&typeof v==='object')for(const k of Object.keys(v))v[k]=repairAllStrings(v[k]);
  return v;
}

function compactLatest(d){
  repairAllStrings(d);
  if(d?.market){
    // Current headline copy is intentionally reconstructed from already-preserved detailed change records.
    d.market.summary='미국 지수와 breadth는 소폭 반등했지만 SOX -2.0%로 반도체 상대강도 훼손이 이어졌다. 장기금리는 완화됐으나 7월 FOMC의 추가 긴축 경계가 남아 있다. 전체시장 Phase는 고점권 조정·내부 로테이션을 유지한다.';
    d.market.final_action='QQQ/SPY 코어는 소규모 분할만 유지. 소프트웨어·AI 전력은 실적·추세 유지 종목만 선별. 반도체·광통신·TQQQ·SOXL은 중기 추세와 상대강도 회복 전 추격하지 않는다.';
    d.market.next_trigger=compact(d.market.next_trigger,125,1);
    if(d.market.action)d.market.action=compact(d.market.action,70,1);
  }
  for(const x of d?.themes||[]) x.action=compact(x.action,70,2);
  for(const x of d?.expanded_themes||[]){x.thesis=compact(x.thesis,95,1);x.risk=compact(x.risk,80,1)}
  for(const x of d?.top_picks||[]){x.action=compact(x.action,45,1);x.note=compact(x.note,95,2)}
  for(const x of d?.research||[]){if(x.take)x.take=compact(x.take,180,3);if(x.action)x.action=compact(x.action,90,2)}
  if(d?.research_consensus){
    if(d.research_consensus.conclusion)d.research_consensus.conclusion=compact(d.research_consensus.conclusion,220,3);
    if(d.research_consensus.action)d.research_consensus.action=compact(d.research_consensus.action,120,2);
  }
  for(const x of d?.smart_money||[]){
    if(x.note)x.note=compact(x.note,180,3);
    if(x.take)x.take=compact(x.take,180,3);
    if(x.action)x.action=compact(x.action,90,2);
  }
  if(d?.macro&&typeof d.macro==='object')for(const [k,v] of Object.entries(d.macro))if(typeof v==='string')d.macro[k]=compact(v,180,3);
  if(d?.details&&typeof d.details==='object')for(const x of Object.values(d.details))if(x&&typeof x==='object'&&x.summary)x.summary=compact(x.summary,220,3);
  return d;
}

const PHASE_ACTIONS={
  us_market:'QQQ/SPY 코어만 소규모 분할. 신규 추격은 줄이고 higher-low와 금리 안정 확인.',
  nasdaq:'20/50DMA와 breadth 개선이 이어지고 반도체가 동반 회복할 때까지 신규 진입을 서두르지 않는다.',
  semiconductor:'낙폭만 보고 매수·레버리지 확대 금지. 중기 추세와 상대강도 회복을 기다린다.',
  network:'MRVL 개별 호재와 테마 회복을 분리. MRVL·AVGO·ANET을 계약·실적·상대강도로 개별 판단한다.',
  software:'실적·추정치 유지 종목만 분할 접근. 장기금리 재상승 여부를 함께 확인한다.',
  power:'수주·실적 유지 종목을 눌림에서 선별. 고밸류 추격매수는 피한다.',
  leveraged:'TQQQ/SOXL 신규 확대 보류. 기초지수의 중기 추세 회복 후 재평가한다.'
};

function compactPhase(d){
  repairAllStrings(d);
  d.summary='지수 breadth는 플러스였지만 SOX -2.0%로 반도체 약세가 지속됐다. 장기금리는 완화됐으나 7월 FOMC의 추가 긴축 경계가 남아 있다. 전체시장은 고점권 조정, 반도체는 추세붕괴 경계를 유지한다.';
  for(const x of d?.segments||[])x.action=PHASE_ACTIONS[x.key]||compact(x.action,80,2);
  // data_status and sources are audit/detail fields and remain detailed.
  return d;
}

for(const [kind,path] of Object.entries(FILES)){
  const raw=await fs.readFile(path,'utf8');
  const data=JSON.parse(raw);
  const out=kind==='latest'?compactLatest(data):compactPhase(data);
  await fs.writeFile(path,JSON.stringify(out,null,2)+'\n','utf8');
  console.log('[compact-ui-copy]',kind,path);
}
