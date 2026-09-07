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

// v0.9.1 loader: favorites-first UI, then user-facing "신청" terminology layer.
window.addEventListener('DOMContentLoaded',()=>setTimeout(()=>{
  if(document.getElementById('cyV90FavoritesScript'))return;
  const css=document.createElement('link');
  css.rel='stylesheet';css.href='assets/app-v90-favorites.css?v=0910';css.id='cyV90FavoritesCss';document.head.appendChild(css);
  const js=document.createElement('script');
  js.src='assets/app-v90-favorites.js?v=0910';js.id='cyV90FavoritesScript';
  js.onload=()=>{
    if(document.getElementById('cyV91LabelsScript'))return;
    const labels=document.createElement('script');
    labels.src='assets/app-v91-labels.js?v=0910';labels.id='cyV91LabelsScript';document.body.appendChild(labels);
  };
  document.body.appendChild(js);
},350));
