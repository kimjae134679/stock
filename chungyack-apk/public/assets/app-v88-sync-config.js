// v0.8.8 cloud sync configuration.
// This file is intentionally safe to ship publicly: only a Supabase project URL and anon/publishable key belong here.
// Never put service-role/admin keys in the APK or GitHub Pages.
window.CY_CLOUD_SYNC_CONFIG={
  enabled:true,
  provider:'supabase',
  url:'https://mgnjwkpmxjepdgincyxo.supabase.co',
  anonKey:'sb_publishable_gW5UlnH8nQsSe32rbRsbJQ_o8jSFYod',
  clientTable:'chungyack_client_state',
  assistantTable:'chungyack_assistant_state'
};

// v0.8.9 loader: account recovery UI is layered on top of the existing live shell.
window.addEventListener('DOMContentLoaded',()=>setTimeout(()=>{
  if(document.getElementById('cyV89AccountScript'))return;
  const css=document.createElement('link');
  css.rel='stylesheet';css.href='assets/app-v89-account.css';css.id='cyV89AccountCss';document.head.appendChild(css);
  const js=document.createElement('script');
  js.src='assets/app-v89-account.js';js.id='cyV89AccountScript';document.body.appendChild(js);
},700));
