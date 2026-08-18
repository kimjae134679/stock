# Market Radar

미국 주식·ETF 시장을 매일 분석해 **HTML + JSON + PWA + Android APK**로 확인하는 개인용 대시보드입니다.

## 자동화 흐름

1. ChatGPT 자동화가 매시간 시장을 감시합니다.
2. 매일 07:00~08:00 KST 첫 점검에서 전체 분석을 생성합니다.
3. `public/data/latest.json`을 갱신하고 날짜별 JSON/HTML을 월별 폴더에 보관합니다.
4. `public/` 변경으로 GitHub Pages가 자동 배포됩니다.
5. PWA/APK는 `latest.json`을 읽어 최신 데이터를 표시합니다.
6. APK는 UI/앱 버전이 바뀔 때만 다시 빌드합니다. 매일 APK 재설치는 필요 없습니다.

## 폴더 구조

```text
public/
  index.html
  data/
    latest.json
    archive/YYYY/MM/YYYY-MM-DD.json
  reports/
    latest.html
    YYYY/MM/US_Market_Daily_YYYY-MM-DD.html
  manifest.webmanifest
  sw.js

ops/
  handoff/current.json       # 비민감 운영/인수인계 규칙
  README.md

docs/
  AUTOMATION.md

.github/workflows/
  pages.yml
  android.yml

VERSION
```

## 보안

이 저장소는 **Public** 입니다.

- 실제 보유종목/보유비중은 GitHub에 저장하지 않습니다.
- 앱의 입력값은 기기 `localStorage`에만 저장합니다.
- GitHub PAT, API Secret, 비밀번호, OTP, 개인정보를 절대 커밋하지 않습니다.
- HTML 안의 숨은 인수인계도 **공개돼도 되는 운영 규칙만** 넣습니다.

## Pages

GitHub Pages 주소:

`https://kimjae134679.github.io/stock/`

최초 1회 `Settings → Pages → Source: GitHub Actions` 설정이 필요합니다.

## Android

`Build Market Radar Android APK` Actions workflow가 UI 변경 시 APK를 빌드합니다.

Artifacts에서 `MarketRadar-vX.Y.Z-debug-apk`를 받아 설치할 수 있습니다.

## 버전 관리

- 앱 버전: `VERSION`
- 앱/UI 변경: 버전 증가
- 매일 시장 데이터: 버전 증가 없이 JSON/HTML만 갱신
- APK 파일은 저장소에 직접 쌓지 않고 Actions Artifact로 관리
