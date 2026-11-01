// v0.10.8 — factual, short, readable opportunity cards.
// Official source/data fields stay intact; this file changes presentation, not personal records.
(function(){
  'use strict';
  const V='0.10.8-live';
  const e=v=>typeof esc==='function'?esc(v):String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const plain=v=>String(v??'').replace(/\s+/g,' ').trim();
  const money=n=>{const v=Number(n);if(!Number.isFinite(v))return '';if(v>=10000){const major=Math.floor(v/10000),rest=v%10000;return major+'억'+(rest?' '+rest.toLocaleString('ko-KR')+'만':'')}return v.toLocaleString('ko-KR')+'만'};
  const between=(nums)=>{const a=nums.filter(Number.isFinite).sort((x,y)=>x-y);if(!a.length)return '';return money(a[0])+(a[0]!==a[a.length-1]?'~'+money(a[a.length-1]):'')};
  function price(item){
    const u=item?.rentDetails?.units;
    if(Array.isArray(u)&&u.length){
      const youth=u.filter(x=>/청년/.test(x.eligibility||'')&&!/신혼/.test(x.eligibility||''));
      const chosen=youth.length?youth:u;
      const options=chosen.flatMap(x=>Array.isArray(x.options)?x.options:[]);
      const deposit=between(options.map(x=>Number(x.deposit)));
      const rent=between(options.map(x=>Number(x.monthlyRent)));
      if(deposit||rent)return {deposit:deposit||'미확인',rent:rent||'미확인',note:youth.length?'청년 '+youth.map(x=>x.type+'형').join('·')+' 기준':'유형별 금액 상이',verified:true};
    }
    // Explicit full price pairs from previously verified LH PDF notes; never parse loose price fragments.
    if(/^lh-/.test(item?.id||'')){const reason=plain(item?.eligibility?.reason);const a=reason.match(/16A\s*([\d,]+)만원\s*\/\s*([\d,]+)원/);const b=reason.match(/16A[^.]{0,90}보증금\s*([\d,]+)만원\s*[·\/]\s*월세\s*([\d,]+)원/);const m=a||b;if(m&&/공식\s*(?:공고|PDF)|모집공고\s*PDF/.test(reason))return {deposit:m[1]+'만원',rent:m[2]+'원',note:'16A · 청년 소득자 기본형 기준',verified:true};}
    const published=typeof CY_V102_FINANCE!=='undefined'?CY_V102_FINANCE[item?.id]:null;
    if(published)return {deposit:plain(published.deposit)||'미확인',rent:plain(published.rent)||'미확인',note:'유형·호실별 차이 가능',verified:true};
    const deposit=plain(item?.depositText||item?.deposit||item?.rental?.deposit);
    const rent=plain(item?.monthlyRentText||item?.rentText||item?.monthlyRent||item?.rent||item?.rental?.monthlyRent);
    return {deposit:deposit||'미확인',rent:rent||'미확인',note:deposit||rent?'임대조건 세부 확인':'',verified:!!(deposit&&rent)};
  }
  // Do not scrape incomplete money amounts (e.g. "월세 16") from narrative prose.
  if(typeof cyV84Finance==='function'){
    cyV84Finance=function(item){const f=price(item);return {deposit:f.deposit==='미확인'?'':f.deposit,rent:f.rent==='미확인'?'':f.rent,summary:(f.deposit==='미확인'&&f.rent==='미확인')?'':'보증금 '+f.deposit+' · 월 '+f.rent,pairs:[]}};
  }
  function parsePart(s,inheritedYear){
    const raw=String(s||'');
    const v=raw.replace(/[‘’']/g,'').replace(/(\d{1,2})\.\s*\((?:월|화|수|목|금|토|일)\)/g,'$1 ').replace(/\((?:월|화|수|목|금|토|일)\)/g,'')
      .replace(/(20\d{2}|\d{2})\s*[.\/]\s*(\d{1,2})\s*[.\/]\s*(\d{1,2})\.?/g,'$1-$2-$3')
      .replace(/(20\d{2})년\s*(\d{1,2})월\s*(\d{1,2})일/g,'$1-$2-$3')
      .replace(/(\d{1,2})월\s*(\d{1,2})일/g,'$1-$2')
      .replace(/(\d{1,2})\s*[.\/]\s*(\d{1,2})\.?/g,'$1-$2');
    const m=v.match(/(?:(20\d{2}|\d{2})\s*-\s*)?(\d{1,2})\s*-\s*(\d{1,2})(?!\d)/);
    if(!m)return null;
    const year=m[1]?(Number(m[1])<100?2000+Number(m[1]):Number(m[1])):inheritedYear||2026;
    const month=Number(m[2]),day=Number(m[3]);
    if(month<1||month>12||day<1||day>31)return null;
    const tm=raw.match(/([01]?\d|2[0-3]):([0-5]\d)/);
    const time=tm?tm[0]:'';
    return {year,month,day,time,label:month+'/'+day+(time?' '+time:'')};
  }
  function periodInfo(item){
    const s=plain(item?.period);
    if(!s)return {label:'접수일 확인',end:0};
    // Portal "게시 종료" is NOT the application deadline.
    if(/선착순|상시/.test(s)&&!/접수\s*마감\s*\d/.test(s))return {label:/선착순/.test(s)?'선착순 · 마감 미확인':'상시 · 접수 확인',end:0};
    if(/게시\s*종료/.test(s)&&!/접수\s*(?:기간|마감)/.test(s))return {label:'접수 마감일 미확인',end:0};
    const parts=s.split(/[~∼～]/);
    if(parts.length===2){
      const start=parsePart(parts[0]),end=parsePart(parts[1],start?.year);
      if(start&&end){
        const hh=end.time?Number(end.time.split(':')[0]):23;
        const mm=end.time?Number(end.time.split(':')[1]):59;
        const stamp=Date.UTC(end.year,end.month-1,end.day,hh-9,mm,59,999);
        return {label:start.label+' ~ '+end.label,end:stamp,start:Date.UTC(start.year,start.month-1,start.day,(start.time?Number(start.time.split(':')[0]):0)-9,0,0)};
      }
    }
    return {label:s.length>31?'일정 원문 확인':s,end:0};
  }
  function unitText(item){
    const s=plain(item?.units);
    if(!s)return '모집 수 확인';
    const youth=s.match(/청년[\s\S]{0,28}?(\d[\d,]*)호/);if(youth)return '청년 공급 '+youth[1]+'호';
    const mixed=s.match(/공가\s*(\d[\d,]*)호[^.]{0,25}예비입주자\s*(\d[\d,]*)명/);if(mixed)return '전체 공가 '+mixed[1]+'호 · 예비 '+mixed[2]+'명';
    const room=s.match(/(?:모집\s*)?(\d{3,4})호[^.]*?(\d{1,3})실/);
    if(room)return room[1]+'호 · '+room[2]+'실';
    if(/예비자|예비입주자|예비\s*모집/.test(s))return '예비입주자';
    const count=s.match(/(?:금회|총|공급|모집)[^;·]{0,20}?(\d[\d,]*)\s*(세대|호|명)/);
    if(count)return count[1]+count[2];
    return s.length>19?'상세 유형 확인':s;
  }
  function state(item,p){
    if(p.end&&Date.now()>p.end)return ['closed','접수 마감'];
    if(p.start&&Date.now()<p.start)return ['conditional','접수 예정'];
    if(p.end&&Date.now()>=p.start)return ['action','접수 중'];
    const level=typeof cyV8Level==='function'?cyV8Level(item):'hold';
    if(level==='hold')return ['hold','검증 대기'];
    if(level==='impossible')return ['impossible','대상 제외'];
    return [level,'접수 확인'];
  }
  function keyNote(item,f){
    if(item?.rentDetails?.managementFee&&/미확인|별도/.test(item.rentDetails.managementFee))return '관리비·실제 계약금액 별도 확인';
    if(f.deposit==='미확인'||f.rent==='미확인')return '금회 보증금·월세 및 잔여 여부 확인 필요';
    if(item?.rentDetails?.activeRecommendation===false)return '비용 확인 전 추천 보류';
    return f.note||'';
  }
  function details(item){
    const parts=[];
    const chk=plain(item?.eligibility?.check);
    if(chk)parts.push('<div><b>자격·확인사항</b><p>'+e(chk)+'</p></div>');
    const next=plain(item?.next);
    if(next){
      const tasks=next.split(/\s*→\s*/).filter(Boolean);
      parts.push('<div><b>서류·발표·계약</b>'+tasks.map(t=>'<p>'+e(t)+'</p>').join('')+'</div>');
    }
    const source=item?.rentDetails?.sourceType;
    if(source)parts.push('<div><b>금액 출처</b><p>'+e(source)+'</p></div>');
    if(!parts.length)return '';
    return '<details class="cy-v108-more"><summary>자격·일정·세부조건 보기</summary><div class="cy-v108-more-body">'+parts.join('')+'</div></details>';
  }
  cyV8Card=function(item){
    const id=e(item.id),saved=CY_V7_SAVED.has(item.id),hidden=CY_V7_HIDDEN.has(item.id),tracked=cyV7IsTracked(item);
    const p=periodInfo(item),f=price(item),s=state(item,p),note=keyNote(item,f);
    const level=typeof cyV8Level==='function'?cyV8Level(item):'hold';
    const canTrack=level!=='impossible'&&level!=='hold'&&s[1]!=='접수 마감';
    const address=Array.isArray(item.addresses)?plain(item.addresses[0]):'';
    const map=address?'https://map.naver.com/p/search/'+encodeURIComponent(address):'';
    const category=plain(item.category).replace(/토지지원리츠\s*/g,'').replace(/·청년/g,'').replace(/공공지원민간임대/g,'민간임대');
    return '<article data-cy-v82-card-id="'+id+'" class="cy-v8-card cy-v108-card '+e(level)+(saved?' is-saved':'')+(hidden?' is-hidden':'')+'">'+
      '<div class="cy-v108-top"><span class="cy-v108-status '+e(s[0])+'">'+e(s[1])+'</span><button class="cy-v8-hide" data-cy-v8-hide="'+id+'">'+(hidden?'복원':'숨기기')+'</button></div>'+
      '<h3 class="cy-v8-title">'+e(plain(item.name).replace(/_/g,' · '))+'</h3>'+
      '<div class="cy-v108-meta">'+e([item.region,category].filter(Boolean).join(' · '))+'</div>'+
      '<div class="cy-v108-facts">'+
      '<div><small>접수</small><b>'+e(p.label)+'</b></div>'+
      '<div><small>모집</small><b>'+e(unitText(item))+'</b></div>'+
      '<div><small>보증금</small><b>'+e(f.deposit)+'</b></div>'+
      '<div><small>월세</small><b>'+e(f.rent)+'</b></div>'+
      '</div>'+
      (f.note?'<div class="cy-v108-sub">'+e(f.note)+'</div>':'')+
      (note?'<p class="cy-v108-note">'+e(note)+'</p>':'')+
      details(item)+
      '<div class="cy-v8-actions cy-v108-actions">'+
        '<button class="btn cy-v8-save'+(saved?' on':'')+'" data-cy-v8-save="'+id+'">'+(saved?'♥ 찜함':'♡ 찜')+'</button>'+
        (item.source?'<a class="btn" href="'+e(item.source)+'" target="_blank" rel="noopener">공고</a>':'')+
        (canTrack?'<button class="btn cy-v8-track'+(tracked?' on':'')+'" data-opportunity-id="'+id+'" title="실제 신청 후 기록">'+(tracked?'신청 기록됨':'신청 기록')+'</button>':'')+
        (map?'<a class="btn cy-v101-map-action" href="'+e(map)+'" target="_blank" rel="noopener">지도</a>':'')+
      '</div></article>';
  };
  // Even fancy punctuation in a deadline must not leave an expired notice looking open.
  if(typeof cyV7Items==='function'){
    const old=cyV7Items;
    cyV7Items=function(){return (old.apply(this,arguments)||[]).filter(x=>{const p=periodInfo(x);return !p.end||p.end>=Date.now()})};
  }
  window.CY_LATEST_VERSION=V;
  const refresh=()=>{try{if(typeof renderRecommendations==='function')renderRecommendations()}catch(err){console.error('[ChungYack] concise card',err)}};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',refresh,{once:true});else refresh();
})();