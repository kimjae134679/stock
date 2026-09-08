// v0.9.3 result classification safety patch.
// Ambiguous/unavailable/non-final misses stay in "확인 필요" instead of being treated as active or rejected.
(function(){
  if(typeof cyV93Category!=='function')return;
  const base=cyV93Category;
  cyV93Category=function(x){
    const v=typeof cyV93Verification==='function'?cyV93Verification(x):null;
    const s=`${x?.status||''} ${x?.detail||''}`;
    if(/탈락|부적격|미선정/.test(s)||(v?.state==='not_found'&&v?.final===true))return 'rejected';
    if(/당첨|예비/.test(s)||(v?.state==='found'&&v?.stage==='final'))return 'selected';
    if(v?.state==='pending'||v?.state==='unavailable'||(v?.state==='not_found'&&v?.final!==true))return 'check';
    if(/결과확인 필요|확인 필요/.test(s))return 'check';
    if(/서류|계약|입주/.test(s)||(v?.state==='found'&&['documents','screening'].includes(v?.stage)))return 'active';
    if(!v&&typeof cyV93ResultDue==='function'&&cyV93ResultDue(x))return 'check';
    return base(x);
  };
  try{if(typeof cyV93RenderApplicationPage==='function')cyV93RenderApplicationPage()}catch(error){console.warn('[ChungYack] result classification refresh failed',error)}
})();
