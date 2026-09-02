import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const androidRoot=path.join(root,'android','app','src','main');
const res=path.join(androidRoot,'res');
function write(rel,content){const p=path.join(res,rel);fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,content,'utf8');console.log('[branding] wrote',rel)}

write('values/chungyack_icon_colors.xml',`<?xml version="1.0" encoding="utf-8"?><resources><color name="chungyack_icon_bg">#20185E</color></resources>`);
write('drawable/chungyack_icon_foreground.xml',`<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android" android:width="108dp" android:height="108dp" android:viewportWidth="108" android:viewportHeight="108">
  <path android:fillColor="@android:color/transparent" android:strokeColor="#63F0D2" android:strokeWidth="5.5" android:strokeLineCap="round" android:pathData="M24,54 A30,30 0,0 1,84,54"/>
  <path android:fillColor="@android:color/transparent" android:strokeColor="#63F0D2" android:strokeWidth="4" android:strokeLineCap="round" android:strokeAlpha="0.72" android:pathData="M33,54 A21,21 0,0 1,75,54"/>
  <path android:fillColor="#EAF4FF" android:pathData="M38,35 L70,35 A6,6 0,0 1,76,41 L76,84 A6,6 0,0 1,70,90 L38,90 A6,6 0,0 1,32,84 L32,41 A6,6 0,0 1,38,35 Z"/>
  <path android:fillColor="#2B2475" android:pathData="M44,44 L64,44 A4,4 0,0 1,68,48 L68,90 L40,90 L40,48 A4,4 0,0 1,44,44 Z"/>
  <path android:fillColor="#FFD660" android:pathData="M54,55 A6,6 0,1 1,53.9,55 M49,65 L59,65 L64,83 L44,83 Z"/>
  <path android:fillColor="@android:color/transparent" android:strokeColor="#63F0D2" android:strokeWidth="3.8" android:strokeLineCap="round" android:strokeLineJoin="round" android:pathData="M77,79 L82,84 L92,72"/>
  <path android:fillColor="#FFD660" android:pathData="M86,23 A2.8,2.8 0,1 1,85.9,23"/>
  <path android:fillColor="#63F0D2" android:pathData="M23,24 A3.5,3.5 0,1 1,22.9,24"/>
</vector>`);
const adaptive=`<?xml version="1.0" encoding="utf-8"?><adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android"><background android:drawable="@color/chungyack_icon_bg"/><foreground android:drawable="@drawable/chungyack_icon_foreground"/><monochrome android:drawable="@drawable/chungyack_icon_foreground"/></adaptive-icon>`;
write('mipmap-anydpi-v26/ic_launcher.xml',adaptive);write('mipmap-anydpi-v26/ic_launcher_round.xml',adaptive);

const javaPath=path.join(androidRoot,'java','com','kimjae134679','chungyack','MainActivity.java');
fs.mkdirSync(path.dirname(javaPath),{recursive:true});
fs.writeFileSync(javaPath,`package com.kimjae134679.chungyack;

import android.app.AlertDialog;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
  private boolean exitDialogVisible=false;
  @Override public void onBackPressed(){
    try{getBridge().getWebView().evaluateJavascript("(function(){try{return String(!!(window.__CY_HANDLE_NATIVE_BACK__&&window.__CY_HANDLE_NATIVE_BACK__()));}catch(e){return 'false';}})()",value->{boolean consumed=value!=null&&value.toLowerCase().contains("true");if(!consumed)showExitConfirm();});}
    catch(Throwable t){showExitConfirm();}
  }
  private void showExitConfirm(){if(exitDialogVisible||isFinishing())return;exitDialogVisible=true;runOnUiThread(()->new AlertDialog.Builder(this).setTitle("청약 레이더").setMessage("앱을 종료하시겠습니까?").setNegativeButton("취소",(d,w)->{exitDialogVisible=false;d.dismiss();}).setPositiveButton("종료",(d,w)->{exitDialogVisible=false;finishAffinity();}).setOnCancelListener(d->exitDialogVisible=false).show());}
}
`,'utf8');

const version=fs.readFileSync(path.join(root,'VERSION'),'utf8').trim();
const match=version.match(/^(\d+)\.(\d+)\.(\d+)$/);
if(!match)throw new Error(`Invalid VERSION: ${version}`);
const versionCode=Number(match[1])*10000+Number(match[2])*100+Number(match[3]);
const gradlePath=path.join(root,'android','app','build.gradle');
let gradle=fs.readFileSync(gradlePath,'utf8');
gradle=gradle.replace(/versionCode\s+\d+/,`versionCode ${versionCode}`).replace(/versionName\s+"[^"]+"/,`versionName "${version}"`);
fs.writeFileSync(gradlePath,gradle,'utf8');
console.log(`[branding] ChungYack beacon icon + native Back fallback + Android v${version} (${versionCode}) applied.`);
