(()=>{
'use strict';

function getNativeAppPlugin(){
  try{return window.Capacitor?.Plugins?.App||null}catch(_){return null}
}

function topModal(){
  return document.querySelector('#modal.open, dialog[open], [aria-modal="true"].open, .modal.open');
}

function closeTopLayer(){
  const m=topModal();
  if(!m)return false;

  // Market Radar modal uses a pushed history state. Prefer consuming that state
  // so Android/browser Back behaves exactly like the visible close action.
  if(m.id==='modal'){
    if(history.state?.mrModal){
      history.back();
      return true;
    }
    const close=document.getElementById('modalClose');
    if(close){close.click();return true;}
    m.classList.remove('open');
    return true;
  }

  if(typeof m.close==='function')m.close();
  else m.classList.remove('open');
  return true;
}

async function installNativeBackHandler(){
  const App=getNativeAppPlugin();
  if(!App?.addListener)return;

  try{
    await App.addListener('backButton',({canGoBack}={})=>{
      // 1) Any open detail/popup closes first. Never exits the app here.
      if(closeTopLayer())return;

      // 2) If the WebView really has somewhere to go, use normal history.
      if(canGoBack){
        history.back();
        return;
      }

      // 3) Root screen: ask before exiting.
      const ok=window.confirm('앱을 종료하시겠습니까?');
      if(ok)App.exitApp();
    });
  }catch(err){
    console.warn('[MarketRadar] native back handler unavailable',err);
  }
}

function installWebFallback(){
  // Browser/PWA: a modal must still consume Back before page navigation.
  window.addEventListener('popstate',()=>{
    const m=topModal();
    if(!m)return;
    if(m.id==='modal')m.classList.remove('open');
    else if(typeof m.close==='function')m.close();
    else m.classList.remove('open');
  });
}

function run(){
  installWebFallback();
  installNativeBackHandler();
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});
else run();
})();
