(()=>{
'use strict';
window.__MR_DISABLE_LEGACY_CYCLE__=true;
document.documentElement.classList.add('mr-cycle-final-pending');
const nativeFetch=window.fetch.bind(window);
window.fetch=(input,init)=>{
  const url=typeof input==='string'?input:String(input?.url||input||'');
  if(/(?:^|\/)cycle-history\.json(?:[?#]|$)/i.test(url)||/(?:^|\/)cycle-full\.json(?:[?#]|$)/i.test(url)){
    return Promise.reject(new Error('MR056 legacy cycle data disabled'));
  }
  return nativeFetch(input,init);
};
console.info('[MR056] legacy cycle graph/data loading blocked');
})();
