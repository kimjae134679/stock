/* Market Radar v17 data transport guard.
   Loaded BEFORE report.js. It prevents a GitHub Pages/404 HTML response from being parsed as JSON.
   Strategy: requested Pages JSON -> validate body -> if invalid, retry the same repo file from raw.githubusercontent.com.
   Core renderer is untouched. */
(function(){
  'use strict';
  if(window.__MR_DATA_GUARD_V17)return;
  window.__MR_DATA_GUARD_V17=true;

  const nativeFetch=window.fetch.bind(window);
  const RAW_BASE='https://raw.githubusercontent.com/kimjae134679/stock/main/public/data/';

  function requestUrl(input){
    try{return new URL(input instanceof Request?input.url:String(input),location.href)}catch(_){return null}
  }
  function isRadarJson(u){
    return !!u && /\/data\/.+\.json$/i.test(u.pathname);
  }
  function rawFallback(u){
    if(!u)return null;
    const token='/data/';
    const idx=u.pathname.indexOf(token);
    if(idx<0)return null;
    const rel=u.pathname.slice(idx+token.length).replace(/^\/+/, '');
    return RAW_BASE+rel+'?raw_fallback='+Date.now();
  }
  async function looksJson(res){
    if(!res || !res.ok)return false;
    try{
      const txt=(await res.clone().text()).replace(/^\uFEFF/,'').trim();
      if(!txt)return false;
      const c=txt[0];
      if(c!=='{' && c!=='[')return false;
      JSON.parse(txt);
      return true;
    }catch(_){return false}
  }
  async function guardedFetch(input,init){
    const u=requestUrl(input);
    if(!isRadarJson(u))return nativeFetch(input,init);

    let first=null;
    try{
      const bust=new URL(u.href);
      bust.searchParams.set('_mr',Date.now());
      first=await nativeFetch(bust.href,Object.assign({},init||{},{cache:'no-store'}));
      if(await looksJson(first))return first;
    }catch(_){ }

    const raw=rawFallback(u);
    if(raw){
      try{
        const second=await nativeFetch(raw,{cache:'no-store',mode:'cors'});
        if(await looksJson(second)){
          console.warn('[Market Radar] Pages JSON invalid; raw GitHub fallback used:',u.pathname);
          window.dispatchEvent(new CustomEvent('mr-data-fallback',{detail:{path:u.pathname,source:'raw-github'}}));
          return second;
        }
      }catch(_){ }
    }

    if(first)return first;
    throw new TypeError('Market Radar JSON request failed: '+(u?u.pathname:'unknown'));
  }

  window.fetch=guardedFetch;

  window.addEventListener('mr-data-fallback',function(ev){
    try{
      const el=document.getElementById('reportClock');
      if(el && !el.dataset.mrFallback){
        el.dataset.mrFallback='1';
        const old=el.textContent;
        el.textContent=old+' · 데이터 경로 자동복구';
      }
    }catch(_){ }
  });
})();