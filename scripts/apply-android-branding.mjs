import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const res=path.join(root,'android','app','src','main','res');

function write(rel,content){
  const p=path.join(res,rel);
  fs.mkdirSync(path.dirname(p),{recursive:true});
  fs.writeFileSync(p,content,'utf8');
  console.log('[branding] wrote',rel);
}

// Very minimal adaptive launcher icon: dark background + one mint rising line.
write('values/market_radar_icon_colors.xml',`<?xml version="1.0" encoding="utf-8"?>
<resources>
  <color name="market_radar_icon_bg">#071018</color>
</resources>
`);

write('drawable/market_radar_icon_foreground.xml',`<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="108dp"
    android:height="108dp"
    android:viewportWidth="108"
    android:viewportHeight="108">
  <path
      android:fillColor="@android:color/transparent"
      android:strokeColor="#5EEAD4"
      android:strokeWidth="9"
      android:strokeLineCap="round"
      android:strokeLineJoin="round"
      android:pathData="M24,72 L44,50 L58,64 L83,35" />
</vector>
`);

const adaptive=`<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
  <background android:drawable="@color/market_radar_icon_bg" />
  <foreground android:drawable="@drawable/market_radar_icon_foreground" />
  <monochrome android:drawable="@drawable/market_radar_icon_foreground" />
</adaptive-icon>
`;
write('mipmap-anydpi-v26/ic_launcher.xml',adaptive);
write('mipmap-anydpi-v26/ic_launcher_round.xml',adaptive);

console.log('[branding] Market Radar minimal adaptive icon applied.');
