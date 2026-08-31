import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const androidRoot=path.join(root,'android','app','src','main');
const res=path.join(androidRoot,'res');
function write(rel,content){const p=path.join(res,rel);fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,content,'utf8');console.log('[branding] wrote',rel)}

write('values/chungyack_icon_colors.xml',`<?xml version="1.0" encoding="utf-8"?><resources><color name="chungyack_icon_bg">#20185E</color></resources>`);
write('drawable/chungyack_icon_foreground.xml',`<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android" android:width="108dp" android:height="108dp" android:viewportWidth="108" android:viewportHeight="108">
  <path android:fillColor="#EAF4FF" android:pathData="M38,35 L70,35 L76,41 L76,84 L70,90 L38,90 L32,84 L32,41 Z"/>
  <path android:fillColor="#2B2475" android:pathData="M44,44 L64,44 L68,48 L68,90 L40,90 L40,48 Z"/>
  <path android:fillColor="#FFD660" android:pathData="M48,57 L60,57 L64,64 L60,70 L59,70 L64,83 L44,83 L49,70 L48,70 L44,64 Z"/>
  <path android:fillColor="#63F0D2" android:pathData="M22,51 L27,51 L29,42 L34,35 L41,29 L49,26 L59,26 L68,29 L76,35 L81,42 L83,51 L88,51 L86,40 L79,30 L69,23 L58,20 L48,20 L37,23 L27,30 L20,40 Z"/>
  <path android:fillColor="#63F0D2" android:pathData="M32,52 L37,52 L39,46 L44,41 L50,39 L58,39 L64,42 L69,47 L71,52 L76,52 L73,44 L66,37 L58,34 L49,34 L41,38 L35,44 Z"/>
  <path android:fillColor="#63F0D2" android:pathData="M77,79 L82,84 L92,72 L95,75 L82,90 L74,82 Z"/>
</vector>`);
const adaptive=`<?xml version="1.0" encoding="utf-8"?><adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android"><background android:drawable="@color/chungyack_icon_bg"/><foreground android:drawable="@drawable/chungyack_icon_foreground"/><monochrome android:drawable="@drawable/chungyack_icon_foreground"/></adaptive-icon>`;
write('mipmap-anydpi-v26/ic_launcher.xml',adaptive);write('mipmap-anydpi-v26/ic_launcher_round.xml',adaptive);

const javaPath=path.join(androidRoot,'java','com','kimjae134679','chungyack','MainActivity.java');
fs.mkdirSync(path.dirname(javaPath),{recursive:true});
fs.writeFileSync(javaPath,`package com.kimjae134679.chungyack;

import android.app.AlertDialog;
import android.content.SharedPreferences;
import android.graphics.Color;
import android.os.Bundle;
import android.view.View;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
  private boolean exitDialogVisible=false;
  private static final String UI_CACHE_RESET_KEY="v041_native_cache_reset";

  @Override protected void onCreate(Bundle savedInstanceState){
    super.onCreate(savedInstanceState);
    try{
      getWindow().setStatusBarColor(Color.rgb(238,243,248));
      getWindow().setNavigationBarColor(Color.rgb(248,251,254));
      View decor=getWindow().getDecorView();
      decor.setSystemUiVisibility(decor.getSystemUiVisibility()|View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR);
    }catch(Throwable ignored){}
  }

  @Override protected void onResume(){
    super.onResume();
    try{
      WebView webView=getBridge().getWebView();
      webView.setHorizontalScrollBarEnabled(false);
      webView.setOverScrollMode(View.OVER_SCROLL_NEVER);
      resetStaleWebCacheOnce(webView);
    }catch(Throwable ignored){}
  }

  private void resetStaleWebCacheOnce(WebView webView){
    SharedPreferences prefs=getSharedPreferences("chungyack_ui",MODE_PRIVATE);
    if(prefs.getBoolean(UI_CACHE_RESET_KEY,false))return;
    webView.postDelayed(()->{
      String js="(async function(){try{if('serviceWorker' in navigator){const rs=await navigator.serviceWorker.getRegistrations();await Promise.all(rs.map(r=>r.unregister()));}if('caches' in window){const ks=await caches.keys();await Promise.all(ks.filter(k=>k.indexOf('chungyack-radar-')===0).map(k=>caches.delete(k)));}return 'ok';}catch(e){return 'err';}})()";
      webView.evaluateJavascript(js,value->{
        prefs.edit().putBoolean(UI_CACHE_RESET_KEY,true).apply();
        webView.postDelayed(webView::reload,120);
      });
    },700);
  }

  @Override public void onBackPressed(){
    try{getBridge().getWebView().evaluateJavascript("(function(){try{return String(!!(window.__CY_HANDLE_NATIVE_BACK__&&window.__CY_HANDLE_NATIVE_BACK__()));}catch(e){return 'false';}})()",value->{boolean consumed=value!=null&&value.toLowerCase().contains("true");if(!consumed)showExitConfirm();});}
    catch(Throwable t){showExitConfirm();}
  }
  private void showExitConfirm(){if(exitDialogVisible||isFinishing())return;exitDialogVisible=true;runOnUiThread(()->new AlertDialog.Builder(this).setTitle("청약 레이더").setMessage("앱을 종료하시겠습니까?").setNegativeButton("취소",(d,w)->{exitDialogVisible=false;d.dismiss();}).setPositiveButton("종료",(d,w)->{exitDialogVisible=false;finishAffinity();}).setOnCancelListener(d->exitDialogVisible=false).show());}
}
`,'utf8');
console.log('[branding] ChungYack icon + native back + v0.4.1 WebView cache/viewport hardening applied.');
