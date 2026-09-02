# ChungYack Radar live HTML + stable Android shell

이 폴더는 청약 레이더의 공개 라이브 화면과 한 번만 설치하는 Android 셸의 기준점이다.

## 동작 구조

- 라이브 HTML: `https://kimjae134679.github.io/stock/chungyack/`
- Android package: `com.kimjae134679.chungyack`
- APK는 위 HTTPS 주소를 여는 고정 Capacitor WebView 셸이다.
- `public/**` 변경은 GitHub Pages에만 배포되며 APK 재빌드를 발생시키지 않는다.
- APK 재빌드는 셸 설정·Android 브랜딩·내부 버전을 바꿀 때만 수행한다.

## 상태 보존

저장, 숨김, 현재 보기, 필터, 실제 신청 추적, 삭제 복원 기록은 같은 원격 origin의 Android WebView `localStorage`에 남는다. HTML/CSS/JS/공고 데이터가 교체되어도 키를 삭제하거나 앱 데이터를 지우지 않는 한 유지된다.

공개 배포본의 `public/data/app.json`은 `trackingSeed: []`이어야 한다. 개인 신청 상태·예비번호·결과·서류 여부를 Pages나 공개 저장소에 넣지 않는다.

## 수정 규칙

- UI와 공개 공고 데이터 수정: `chungyack-apk/public/**`
- 셸 APK 수정: `capacitor.config.json`, `VERSION`, `package.json`, `scripts/apply-android-branding.mjs`
- HTML 수정만으로 APK 버전을 올리거나 APK를 다시 만들지 않는다.
- 저장/숨김 키와 공고의 안정적인 `id`를 임의 변경하지 않는다.
