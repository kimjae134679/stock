// Compatibility hook only. No account/recovery UI.
// The stable shell already loads this path, so use it to keep newer live UI layers active.
(function cyV89CompatibilityLoader(){
  function addCss(id,href){
    if(document.getElementById(id))return;
    const el=document.createElement('link');
    el.id=id;el.rel='stylesheet';el.href=href;document.head.appendChild(el);
  }
  function addScript(id,src){
    return new Promise((resolve,reject)=>{
      if(document.getElementById(id)){resolve();return;}
      const el=document.createElement('script');
      el.id=id;el.src=src;el.onload=resolve;el.onerror=reject;document.body.appendChild(el);
    });
  }
  addCss('cyV90Css','assets/app-v90-favorites.css?v=091');
  addCss('cyV91Css','assets/app-v91-application.css?v=091');
  addScript('cyV90Script','assets/app-v90-favorites.js?v=091')
    .then(()=>addScript('cyV91Script','assets/app-v91-application.js?v=091'))
    .catch(error=>console.error('[ChungYack] live UI loader failed',error));
})();
