// v0.8.9 live: upgrade anonymous cloud identity to a recoverable email account.
const CY_V89_VERSION='0.8.9-live';
let CY_V89_MESSAGE='';
let CY_V89_BUSY=false;

function cyV89Esc(v){return typeof esc==='function'?esc(v):String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function cyV89User(){return CY_V88_USER||null}
function cyV89IsAnonymous(){const u=cyV89User();return !!(u&&(u.is_anonymous===true||u.app_metadata?.provider==='anonymous'))}
function cyV89SetMessage(v){CY_V89_MESSAGE=v||'';cyV89RenderAccount()}
function cyV89AccountLabel(){
  const u=cyV89User();
  if(!u)return '연결 확인 중';
  if(cyV89IsAnonymous())return '임시 클라우드 계정';
  return u.email?`복구 계정 · ${u.email}`:'복구 계정 연결됨';
}

function cyV89RenderAccount(){
  const settings=document.querySelector('.page[data-page="settings"] .settings-list');
  if(!settings)return;
  let box=document.getElementById('cyV89AccountBox');
  if(!box){
    box=document.createElement('div');box.id='cyV89AccountBox';box.className='setting cy-v89-account';
    const sync=document.getElementById('cyV88SyncStatus');
    if(sync)sync.insertAdjacentElement('afterend',box);else settings.prepend(box);
  }
  const u=cyV89User();
  const anon=cyV89IsAnonymous();
  const connected=!!(CY_V88_CLIENT&&u);
  box.innerHTML=`
    <b>기기 변경·분실 복구</b>
    <p><strong>${cyV89Esc(cyV89AccountLabel())}</strong></p>
    ${!connected?'<small>클라우드 연결이 완료되면 복구 계정을 설정할 수 있습니다.</small>':anon?`
      <small>현재 기록은 클라우드에 있지만 이 기기 세션을 잃으면 같은 계정으로 돌아올 수 없습니다. 이메일을 연결하면 사용자 ID와 현재 기록을 그대로 유지한 채 복구 가능한 계정으로 바뀝니다.</small>
      <div class="cy-v89-fields">
        <input id="cyV89LinkEmail" type="email" autocomplete="email" placeholder="복구용 이메일">
        <button id="cyV89SendVerify" class="ghost" type="button">인증메일 보내기</button>
        <input id="cyV89NewPassword" type="password" autocomplete="new-password" minlength="8" placeholder="인증 후 사용할 비밀번호 (8자 이상)">
        <button id="cyV89FinishLink" class="primary" type="button">인증 완료 · 비밀번호 설정</button>
      </div>`:`
      <small>이 계정으로 다른 기기에서 로그인하면 Supabase에 저장된 추적·저장·숨김·필터 기록을 다시 불러옵니다.</small>
      <button id="cyV89ShowLogin" class="ghost cy-v89-login-toggle" type="button">다른 복구 계정으로 로그인</button>
    `}
    <div id="cyV89LoginPanel" class="cy-v89-login" ${anon?'':'hidden'}>
      <div class="cy-v89-fields">
        <input id="cyV89LoginEmail" type="email" autocomplete="email" placeholder="기존 복구 이메일">
        <input id="cyV89LoginPassword" type="password" autocomplete="current-password" placeholder="비밀번호">
        <button id="cyV89LoginBtn" class="ghost" type="button">기존 계정 로그인·복원</button>
      </div>
    </div>
    ${CY_V89_MESSAGE?`<div class="cy-v89-message">${cyV89Esc(CY_V89_MESSAGE)}</div>`:''}
  `;

  document.getElementById('cyV89SendVerify')?.addEventListener('click',cyV89SendVerification);
  document.getElementById('cyV89FinishLink')?.addEventListener('click',cyV89FinishLink);
  document.getElementById('cyV89LoginBtn')?.addEventListener('click',cyV89LoginExisting);
  document.getElementById('cyV89ShowLogin')?.addEventListener('click',()=>{
    const p=document.getElementById('cyV89LoginPanel');if(p)p.hidden=!p.hidden;
  });
}

async function cyV89RefreshUser(){
  if(!CY_V88_CLIENT)return null;
  try{
    await CY_V88_CLIENT.auth.refreshSession();
    const {data,error}=await CY_V88_CLIENT.auth.getUser();
    if(error)throw error;
    CY_V88_USER=data.user||CY_V88_USER;
    cyV89RenderAccount();
    return CY_V88_USER;
  }catch(e){console.warn('account refresh failed',e);return CY_V88_USER}
}

async function cyV89SendVerification(){
  if(CY_V89_BUSY||!CY_V88_CLIENT||!CY_V88_USER)return;
  const email=String(document.getElementById('cyV89LinkEmail')?.value||'').trim();
  if(!email||!email.includes('@')){cyV89SetMessage('이메일을 확인해 주세요.');return}
  CY_V89_BUSY=true;cyV89SetMessage('인증메일 요청 중…');
  try{
    const {error}=await CY_V88_CLIENT.auth.updateUser({email});
    if(error)throw error;
    localStorage.setItem('chungyack.recovery.pendingEmail.v1',email);
    cyV89SetMessage('인증메일을 보냈습니다. 메일의 확인 링크를 누른 뒤 앱으로 돌아와 비밀번호를 설정하세요.');
  }catch(e){
    console.warn('email link failed',e);
    cyV89SetMessage(/manual|link/i.test(String(e?.message||''))?'Supabase의 Allow manual linking 설정을 먼저 켜야 합니다.':`인증메일 요청 실패: ${e?.message||'확인 필요'}`);
  }finally{CY_V89_BUSY=false}
}

async function cyV89FinishLink(){
  if(CY_V89_BUSY||!CY_V88_CLIENT)return;
  const password=String(document.getElementById('cyV89NewPassword')?.value||'');
  if(password.length<8){cyV89SetMessage('비밀번호는 8자 이상으로 입력해 주세요.');return}
  CY_V89_BUSY=true;cyV89SetMessage('이메일 인증 상태 확인 중…');
  try{
    const u=await cyV89RefreshUser();
    if(!u)throw new Error('사용자 세션을 확인할 수 없습니다.');
    if(cyV89IsAnonymous())throw new Error('아직 이메일 인증이 완료되지 않았습니다. 메일의 확인 링크를 먼저 눌러 주세요.');
    const {error}=await CY_V88_CLIENT.auth.updateUser({password});
    if(error)throw error;
    await cyV88Push();
    localStorage.removeItem('chungyack.recovery.pendingEmail.v1');
    cyV89SetMessage('복구 계정 연결 완료. 이제 다른 기기에서도 같은 이메일/비밀번호로 복원할 수 있습니다.');
  }catch(e){cyV89SetMessage(e?.message||'계정 연결 실패')}
  finally{CY_V89_BUSY=false}
}

async function cyV89ForceRestoreCurrentUser(){
  if(!CY_V88_CLIENT||!CY_V88_USER)return;
  const cfg=cyV88Config();
  const {data,error}=await CY_V88_CLIENT.from(cfg.clientTable).select('state,updated_at').eq('user_id',CY_V88_USER.id).maybeSingle();
  if(error)throw error;
  if(data?.state){
    cyV88ApplyClientState(data.state);
  }else{
    // First use of this permanent account: keep current local state rather than deleting it.
    localStorage.setItem(CY_V88_LOCAL_STAMP,cyV88Now());
    await cyV88Push();
  }
  await cyV88PullAssistant();
  cyV88SetStatus('동기화됨','복구 계정에서 복원');
}

async function cyV89LoginExisting(){
  if(CY_V89_BUSY||!CY_V88_CLIENT)return;
  const email=String(document.getElementById('cyV89LoginEmail')?.value||'').trim();
  const password=String(document.getElementById('cyV89LoginPassword')?.value||'');
  if(!email||!password){cyV89SetMessage('이메일과 비밀번호를 입력해 주세요.');return}
  CY_V89_BUSY=true;cyV89SetMessage('기존 계정 로그인 중…');
  try{
    const {data,error}=await CY_V88_CLIENT.auth.signInWithPassword({email,password});
    if(error)throw error;
    CY_V88_USER=data.user||data.session?.user||null;
    if(!CY_V88_USER)throw new Error('로그인 사용자 확인 실패');
    await cyV89ForceRestoreCurrentUser();
    cyV89SetMessage('기존 클라우드 기록을 이 기기로 복원했습니다.');
    cyV89RenderAccount();
  }catch(e){cyV89SetMessage(`로그인 실패: ${e?.message||'계정 정보를 확인해 주세요.'}`)}
  finally{CY_V89_BUSY=false}
}

const _cyV89RenderSettings=renderSettings;
renderSettings=function(){_cyV89RenderSettings();const v=document.getElementById('settingsVersion');if(v)v.textContent=CY_V89_VERSION;cyV89RenderAccount()};
const _cyV89RenderHero=renderHero;
renderHero=function(){_cyV89RenderHero();const v=document.getElementById('appVersion');if(v)v.textContent='v'+CY_V89_VERSION};

window.CY_RECOVERY_ACCOUNT={refresh:cyV89RefreshUser,login:cyV89LoginExisting,restore:cyV89ForceRestoreCurrentUser};
window.addEventListener('DOMContentLoaded',()=>{
  const v=document.getElementById('appVersion');if(v)v.textContent='v'+CY_V89_VERSION;
  const s=document.getElementById('settingsVersion');if(s)s.textContent=CY_V89_VERSION;
  setTimeout(()=>{cyV89RefreshUser();cyV89RenderAccount()},900);
});
window.addEventListener('focus',()=>{if(localStorage.getItem('chungyack.recovery.pendingEmail.v1'))cyV89RefreshUser()});
