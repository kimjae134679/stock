import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const androidRoot=path.join(root,'android','app','src','main');
const res=path.join(androidRoot,'res');

function write(rel,content){
  const p=path.join(res,rel);
  fs.mkdirSync(path.dirname(p),{recursive:true});
  fs.writeFileSync(p,content,'utf8');
  console.log('[branding] wrote',rel);
}

write('values/market_radar_icon_colors.xml',`<?xml version="1.0" encoding="utf-8"?>
<resources><color name="market_radar_icon_bg">#071018</color></resources>`);

write('drawable/market_radar_icon_foreground.xml',`<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android" android:width="108dp" android:height="108dp" android:viewportWidth="108" android:viewportHeight="108">
  <path android:fillColor="@android:color/transparent" android:strokeColor="#5EEAD4" android:strokeWidth="9" android:strokeLineCap="round" android:strokeLineJoin="round" android:pathData="M24,72 L44,50 L58,64 L83,35" />
</vector>`);

const adaptive=`<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android"><background android:drawable="@color/market_radar_icon_bg"/><foreground android:drawable="@drawable/market_radar_icon_foreground"/><monochrome android:drawable="@drawable/market_radar_icon_foreground"/></adaptive-icon>`;
write('mipmap-anydpi-v26/ic_launcher.xml',adaptive);
write('mipmap-anydpi-v26/ic_launcher_round.xml',adaptive);

// Native back fallback. Do not rely only on the Capacitor App JS listener: some builds
// can fail to expose that listener early enough. Native Android asks the page whether
// a Market Radar modal consumed Back; if not, it shows an exit confirmation.
const javaPath=path.join(androidRoot,'java','com','kimjae134679','marketradar','MainActivity.java');
fs.mkdirSync(path.dirname(javaPath),{recursive:true});
fs.writeFileSync(javaPath,`package com.kimjae134679.marketradar;

import android.app.AlertDialog;
import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
  private boolean exitDialogVisible = false;

  @Override
  public void onBackPressed() {
    try {
      getBridge().getWebView().evaluateJavascript(
        "(function(){try{return String(!!(window.__MR_HANDLE_NATIVE_BACK__&&window.__MR_HANDLE_NATIVE_BACK__()));}catch(e){return 'false';}})()",
        value -> {
          boolean consumed = value != null && value.toLowerCase().contains("true");
          if (!consumed) showExitConfirm();
        }
      );
    } catch (Throwable t) {
      showExitConfirm();
    }
  }

  private void showExitConfirm() {
    if (exitDialogVisible || isFinishing()) return;
    exitDialogVisible = true;
    runOnUiThread(() -> new AlertDialog.Builder(this)
      .setTitle("Market Radar")
      .setMessage("앱을 종료하시겠습니까?")
      .setNegativeButton("취소", (d, w) -> { exitDialogVisible = false; d.dismiss(); })
      .setPositiveButton("종료", (d, w) -> { exitDialogVisible = false; finishAffinity(); })
      .setOnCancelListener(d -> exitDialogVisible = false)
      .show());
  }
}
`,'utf8');
console.log('[branding] native MainActivity back fallback written',javaPath);
console.log('[branding] Market Radar minimal adaptive icon applied.');
