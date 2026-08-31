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

const javaDir=path.join(androidRoot,'java','com','kimjae134679','chungyack');
fs.mkdirSync(javaDir,{recursive:true});
const javaPath=path.join(javaDir,'MainActivity.java');
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
  private static final String UI_CACHE_RESET_KEY="v050_native_cache_reset";

  @Override protected void onCreate(Bundle savedInstanceState){
    registerPlugin(GitHubSyncPlugin.class);
    super.onCreate(savedInstanceState);
    try{
      getWindow().setStatusBarColor(Color.rgb(238,243,248));
      getWindow().setNavigationBarColor(Color.rgb(248,251,254));
      View decor=getWindow().getDecorView();
      decor.setSystemUiVisibility(decor.getSystemUiVisibility()|View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR);
    }catch(Throwable ignored){}
  }

  @Override public void onResume(){
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
      webView.evaluateJavascript(js,value->{prefs.edit().putBoolean(UI_CACHE_RESET_KEY,true).apply();webView.postDelayed(webView::reload,120);});
    },700);
  }

  @Override public void onBackPressed(){
    try{getBridge().getWebView().evaluateJavascript("(function(){try{return String(!!(window.__CY_HANDLE_NATIVE_BACK__&&window.__CY_HANDLE_NATIVE_BACK__()));}catch(e){return 'false';}})()",value->{boolean consumed=value!=null&&value.toLowerCase().contains("true");if(!consumed)showExitConfirm();});}
    catch(Throwable t){showExitConfirm();}
  }
  private void showExitConfirm(){if(exitDialogVisible||isFinishing())return;exitDialogVisible=true;runOnUiThread(()->new AlertDialog.Builder(this).setTitle("청약 레이더").setMessage("앱을 종료하시겠습니까?").setNegativeButton("취소",(d,w)->{exitDialogVisible=false;d.dismiss();}).setPositiveButton("종료",(d,w)->{exitDialogVisible=false;finishAffinity();}).setOnCancelListener(d->exitDialogVisible=false).show());}
}
`,'utf8');

fs.writeFileSync(path.join(javaDir,'GitHubSyncPlugin.java'),`package com.kimjae134679.chungyack;

import android.content.Context;
import android.content.SharedPreferences;
import android.security.keystore.KeyGenParameterSpec;
import android.security.keystore.KeyProperties;
import android.util.Base64;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.security.KeyStore;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import org.json.JSONObject;

@CapacitorPlugin(name="GitHubSync")
public class GitHubSyncPlugin extends Plugin {
  private static final String PREFS="chungyack_github_sync";
  private static final String KEY_ALIAS="chungyack_github_token_v1";
  private static final String API="https://api.github.com";
  private final ExecutorService io=Executors.newSingleThreadExecutor();

  private SharedPreferences prefs(){return getContext().getSharedPreferences(PREFS,Context.MODE_PRIVATE);}
  private String clean(String s,String fallback){return s==null||s.trim().isEmpty()?fallback:s.trim();}

  @PluginMethod public void configure(PluginCall call){
    try{
      String token=clean(call.getString("token"),"");if(token.isEmpty()){call.reject("token required");return;}
      String owner=clean(call.getString("owner"),"kimjae134679");
      String repo=clean(call.getString("repo"),"ChungYack");
      String path=clean(call.getString("path"),"data/app_user_state.json");
      String branch=clean(call.getString("branch"),"main");
      Enc e=encrypt(token);
      prefs().edit().putString("token_iv",e.iv).putString("token_data",e.data).putString("owner",owner).putString("repo",repo).putString("path",path).putString("branch",branch).apply();
      JSObject out=statusObject();call.resolve(out);
    }catch(Exception e){call.reject("configure failed",e);}
  }

  @PluginMethod public void status(PluginCall call){try{call.resolve(statusObject());}catch(Exception e){call.reject("status failed",e);}}

  @PluginMethod public void clearConfig(PluginCall call){
    try{prefs().edit().clear().apply();KeyStore ks=KeyStore.getInstance("AndroidKeyStore");ks.load(null);if(ks.containsAlias(KEY_ALIAS))ks.deleteEntry(KEY_ALIAS);call.resolve();}catch(Exception e){call.reject("clear failed",e);}
  }

  @PluginMethod public void pullState(PluginCall call){
    io.execute(()->{try{
      Config c=config();HttpResult r=request("GET",contentsUrl(c,true),c.token,null);
      JSObject out=new JSObject();
      if(r.code==404){out.put("exists",false);call.resolve(out);return;}
      if(r.code<200||r.code>=300)throw new Exception("GitHub GET HTTP "+r.code+" "+r.body);
      JSONObject o=new JSONObject(r.body);String content=o.optString("content","").replace("\\n","");String json=new String(Base64.decode(content,Base64.DEFAULT),StandardCharsets.UTF_8);
      out.put("exists",true);out.put("json",json);out.put("sha",o.optString("sha",""));call.resolve(out);
    }catch(Exception e){call.reject("pull failed",e);}});
  }

  @PluginMethod public void pushState(PluginCall call){
    String json=call.getString("json");if(json==null){call.reject("json required");return;}
    io.execute(()->{try{
      Config c=config();String sha="";HttpResult get=request("GET",contentsUrl(c,true),c.token,null);
      if(get.code>=200&&get.code<300)sha=new JSONObject(get.body).optString("sha","");else if(get.code!=404)throw new Exception("GitHub GET HTTP "+get.code+" "+get.body);
      JSONObject body=new JSONObject();body.put("message","Sync ChungYack app user state");body.put("content",Base64.encodeToString(json.getBytes(StandardCharsets.UTF_8),Base64.NO_WRAP));body.put("branch",c.branch);if(!sha.isEmpty())body.put("sha",sha);
      HttpResult put=request("PUT",contentsUrl(c,false),c.token,body.toString());if(put.code<200||put.code>=300)throw new Exception("GitHub PUT HTTP "+put.code+" "+put.body);
      JSObject out=new JSObject();out.put("ok",true);out.put("httpStatus",put.code);call.resolve(out);
    }catch(Exception e){call.reject("push failed",e);}});
  }

  private JSObject statusObject() throws Exception{
    SharedPreferences p=prefs();boolean configured=p.contains("token_data")&&!decryptToken().isEmpty();JSObject o=new JSObject();o.put("configured",configured);o.put("owner",p.getString("owner","kimjae134679"));o.put("repo",p.getString("repo","ChungYack"));o.put("path",p.getString("path","data/app_user_state.json"));o.put("branch",p.getString("branch","main"));return o;
  }
  private Config config() throws Exception{String token=decryptToken();if(token.isEmpty())throw new Exception("GitHub sync not configured");SharedPreferences p=prefs();return new Config(token,p.getString("owner","kimjae134679"),p.getString("repo","ChungYack"),p.getString("path","data/app_user_state.json"),p.getString("branch","main"));}
  private String contentsUrl(Config c,boolean withRef) throws Exception{String u=API+"/repos/"+enc(c.owner)+"/"+enc(c.repo)+"/contents/"+pathEncode(c.path);return withRef?u+"?ref="+enc(c.branch):u;}
  private String enc(String s) throws Exception{return java.net.URLEncoder.encode(s,"UTF-8").replace("+","%20");}
  private String pathEncode(String s) throws Exception{String[] parts=s.split("/");StringBuilder b=new StringBuilder();for(String part:parts){if(b.length()>0)b.append('/');b.append(enc(part));}return b.toString();}

  private HttpResult request(String method,String url,String token,String body) throws Exception{
    HttpURLConnection c=(HttpURLConnection)new URL(url).openConnection();c.setRequestMethod(method);c.setConnectTimeout(15000);c.setReadTimeout(20000);c.setRequestProperty("Accept","application/vnd.github+json");c.setRequestProperty("X-GitHub-Api-Version","2022-11-28");c.setRequestProperty("Authorization","Bearer "+token);c.setRequestProperty("User-Agent","ChungYack-Radar-Android");
    if(body!=null){c.setDoOutput(true);c.setRequestProperty("Content-Type","application/json; charset=utf-8");try(OutputStream os=c.getOutputStream()){os.write(body.getBytes(StandardCharsets.UTF_8));}}
    int code=c.getResponseCode();InputStream in=code>=200&&code<400?c.getInputStream():c.getErrorStream();StringBuilder sb=new StringBuilder();if(in!=null){try(BufferedReader br=new BufferedReader(new InputStreamReader(in,StandardCharsets.UTF_8))){String line;while((line=br.readLine())!=null)sb.append(line);}}c.disconnect();return new HttpResult(code,sb.toString());
  }

  private SecretKey key() throws Exception{
    KeyStore ks=KeyStore.getInstance("AndroidKeyStore");ks.load(null);if(ks.containsAlias(KEY_ALIAS))return((KeyStore.SecretKeyEntry)ks.getEntry(KEY_ALIAS,null)).getSecretKey();
    KeyGenerator g=KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES,"AndroidKeyStore");g.init(new KeyGenParameterSpec.Builder(KEY_ALIAS,KeyProperties.PURPOSE_ENCRYPT|KeyProperties.PURPOSE_DECRYPT).setBlockModes(KeyProperties.BLOCK_MODE_GCM).setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE).build());return g.generateKey();
  }
  private Enc encrypt(String text) throws Exception{Cipher c=Cipher.getInstance("AES/GCM/NoPadding");c.init(Cipher.ENCRYPT_MODE,key());return new Enc(Base64.encodeToString(c.getIV(),Base64.NO_WRAP),Base64.encodeToString(c.doFinal(text.getBytes(StandardCharsets.UTF_8)),Base64.NO_WRAP));}
  private String decryptToken() throws Exception{String iv=prefs().getString("token_iv","");String data=prefs().getString("token_data","");if(iv.isEmpty()||data.isEmpty())return"";Cipher c=Cipher.getInstance("AES/GCM/NoPadding");c.init(Cipher.DECRYPT_MODE,key(),new GCMParameterSpec(128,Base64.decode(iv,Base64.NO_WRAP)));return new String(c.doFinal(Base64.decode(data,Base64.NO_WRAP)),StandardCharsets.UTF_8);}

  private static class Enc{final String iv,data;Enc(String iv,String data){this.iv=iv;this.data=data;}}
  private static class Config{final String token,owner,repo,path,branch;Config(String token,String owner,String repo,String path,String branch){this.token=token;this.owner=owner;this.repo=repo;this.path=path;this.branch=branch;}}
  private static class HttpResult{final int code;final String body;HttpResult(int code,String body){this.code=code;this.body=body;}}
}
`,'utf8');
console.log('[branding] ChungYack icon + native back + v0.5.0 secure GitHub sync plugin applied.');
