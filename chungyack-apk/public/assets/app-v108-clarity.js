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
    return '';
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
    const a=plain(item.agency);const agency=/운영기관.*어울리/.test(a)?'어울리 운영':/LH/.test(a)?'LH':/^SH/.test(a)?'SH':/GH/.test(a)?'GH':'';
    return '<article data-cy-v82-card-id="'+id+'" class="cy-v8-card cy-v108-card '+e(level)+(saved?' is-saved':'')+(hidden?' is-hidden':'')+'">'+
      '<div class="cy-v108-top"><span class="cy-v108-status '+e(s[0])+'">'+e(s[1])+'</span><button class="cy-v8-hide" data-cy-v8-hide="'+id+'">'+(hidden?'복원':'숨기기')+'</button></div>'+
      '<h3 class="cy-v8-title">'+e(plain(item.name).replace(/_/g,' · '))+'</h3>'+
      '<div class="cy-v108-meta">'+e([item.region,agency,category].filter(Boolean).join(' · '))+'</div>'+
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

// v0.10.9 exact paired-price display & strict application dates.
// Live cards present a matching deposit/rent pair; other choices remain behind details.
(function(){
  'use strict';
  const e=v=>typeof esc==='function'?esc(v):String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function won(n){
    if(!Number.isFinite(n))return '미검증';
    if(n===0)return '없음';
    const b=Math.floor(n/100000000),m=Math.floor((n%100000000)/10000),r=n%10000,arr=[];
    if(b)arr.push(b+'억');if(m)arr.push(m.toLocaleString('ko-KR')+'만');if(r)arr.push(r.toLocaleString('ko-KR'));
    return arr.join(' ')+'원';
  }
  const options=item=>Array.isArray(item?.rentDetails?.offers)?item.rentDetails.offers:[];
  function finance(item){
    const p=options(item)[0];
    if(p&&Number.isFinite(p.depositWon)&&Number.isFinite(p.monthlyRentWon))return {d:won(p.depositWon),r:won(p.monthlyRentWon),label:p.chargeLabel||'월세',type:[p.type,p.tier].filter(Boolean).join(' · '),hasPrice:true};
    if(item?.rentDetails?.noFixedPrice)return {d:'주택별 상이',r:'주택별 상이',label:'월 부담액',type:'임대주택 선택 및 계약 후 결정',hasPrice:false};
    return {d:'미검증',r:'미검증',label:'월세',type:'공식 임대료 확인 필요',hasPrice:false};
  }
  if(typeof cyV84Finance==='function')cyV84Finance=function(item){const f=finance(item);return {deposit:f.hasPrice?f.d:'',rent:f.hasPrice?f.r:'',summary:f.hasPrice?'보증금 '+f.d+' · 월 '+f.r:'',pairs:[]}};
  function priceTable(item){
    const list=options(item);
    if(list.length<2)return null;
    const wrap=document.createElement('div');wrap.className='cy-v109-scroll';
    const table=document.createElement('table');table.className='cy-v109-price-table';
    table.innerHTML='<thead><tr><th>주택형·조건</th><th>보증금</th><th>월 부담액</th></tr></thead><tbody>'+
      list.map(p=>'<tr><td>'+e([p.type,p.tier].filter(Boolean).join(' / '))+'</td><td>'+e(won(p.depositWon))+'</td><td>'+e(won(p.monthlyRentWon))+(p.chargeLabel==='기숙사비'?' (기숙사비)':'')+'</td></tr>').join('')+'</tbody>';
    wrap.appendChild(table);return wrap;
  }
  function noticeStatus(item){
    const now=Date.now(),kind=item?.applicationKind||'';
    if(item?.applyEnd&&Date.parse(item.applyEnd)<now)return ['closed','접수 마감'];
    if(kind==='private')return ['hold','민간임대 · 추천 제외'];
    if(kind==='private-special')return ['hold','신혼부부 전용'];
    if(kind==='special'||kind==='special-secondary')return ['hold','특별 자격 필요'];
    if(kind==='unverified-secondary')return ['hold','잔여·신청 여부 확인'];
    if(Array.isArray(item?.applicationWindows)){
      const slot=item.applicationWindows.find(w=>now>=Date.parse(w.from)&&now<=Date.parse(w.to));
      return slot?['action',slot.conditional?'2순위 조건부 접수':'1순위 접수 중']:['conditional','순위별 접수 예정'];
    }
    if(item?.applyStart&&now<Date.parse(item.applyStart))return ['conditional','접수 예정'];
    if(item?.applyStart&&item?.applyEnd)return ['action','접수 중'];
    return ['conditional','접수 재확인'];
  }
  const previous=cyV8Card;
  cyV8Card=function(item){
    const html=previous(item);
    const temp=document.createElement('template');temp.innerHTML=html.trim();
    const root=temp.content.firstElementChild;
    if(!root)return html;
    const f=finance(item),facts=[...root.querySelectorAll('.cy-v108-facts>div')];
    if(facts.length>=4){
      facts[0].querySelector('b').textContent=item.applicationPeriodText||'접수일 확인';
      facts[1].querySelector('b').textContent=item.summaryUnits||'모집 규모 확인';
      facts[2].querySelector('b').textContent=f.d;
      facts[3].querySelector('small').textContent=f.label;
      facts[3].querySelector('b').textContent=f.r;
    }
    const [cls,label]=noticeStatus(item),status=root.querySelector('.cy-v108-status');
    if(status){status.className='cy-v108-status '+cls;status.textContent=label}
    root.querySelectorAll('.cy-v108-sub,.cy-v108-note').forEach(el=>el.remove());
    const factsElement=root.querySelector('.cy-v108-facts');
    if(factsElement&&f.type){
      const description=document.createElement('div');description.className='cy-v108-sub';description.textContent=f.type+' 기준';factsElement.insertAdjacentElement('afterend',description);
    }
    const verification=item?.rentDetails?.verification==='secondary-crosscheck'?'공개 공급표 교차확인 · 공식 PDF 원문 대조 필요':item?.applicationKind==='private'?'관리비·보증료 별도 · 일반 추천 제외':item?.applicationKind==='private-special'?'신혼부부 특별공급 · 단독 청년 제외':'';
    if(verification&&factsElement){
      const warning=document.createElement('p');warning.className='cy-v108-note';warning.textContent=verification;
      const after=root.querySelector('.cy-v108-sub')||factsElement;after.insertAdjacentElement('afterend',warning);
    }
    const table=priceTable(item),more=root.querySelector('.cy-v108-more');
    if(table){
      if(more){
        const body=more.querySelector('.cy-v108-more-body');
        const heading=document.createElement('b');heading.textContent='보증금·월 부담액 ('+options(item).length+'개 조합)';
        body?.prepend(table);body?.prepend(heading);
        const summary=more.querySelector('summary');if(summary)summary.textContent='주택형별 가격·자격·일정';
      }else{
        const container=document.createElement('details');container.className='cy-v108-more';
        container.innerHTML='<summary>주택형별 가격</summary><div class="cy-v108-more-body"></div>';
        container.querySelector('.cy-v108-more-body').appendChild(table);
        (root.querySelector('.cy-v8-actions')||root).before(container);
      }
    }
    return temp.innerHTML;
  };
  if(typeof cyV7Items==='function'){
    const base=cyV7Items;
    cyV7Items=function(){return (base.apply(this,arguments)||[]).filter(x=>!x.applyEnd||Date.parse(x.applyEnd)>=Date.now())};
  }
  // Default to all current notices, including clearly marked special/expensive options.
  if(typeof CY_V7_LEVEL!=='undefined'&&CY_V7_LEVEL==='action')CY_V7_LEVEL='all';
  window.CY_LATEST_VERSION='0.10.9-live';
  const refresh=()=>{try{renderRecommendations()}catch(ex){console.error('[ChungYack] price card',ex)}};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',refresh,{once:true});else refresh();
})();
