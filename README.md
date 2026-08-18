# Market Radar

미국 주식·ETF 시장을 **시간별 데이터 + 일일 HTML + PWA + Android APK**로 확인하는 대시보드입니다.

## PC / 폰에서 보는 주소

- 최신 앱/대시보드: `https://kimjae134679.github.io/stock/`
- 최신 HTML 보고서 직접 보기: `https://kimjae134679.github.io/stock/reports/latest.html`
- 특정 날짜 예시: `https://kimjae134679.github.io/stock/reports/2026/08/US_Market_Daily_2026-08-19.html`

GitHub 저장소 안의 `.html` 파일을 클릭하면 **소스코드**가 보입니다. 실제 화면으로 보려면 위 GitHub Pages 주소를 사용합니다.

## 자동화 흐름

1. ChatGPT 자동화가 **매시간** 시장을 다시 평가합니다.
2. 매시간 `public/data/latest.json`과 `public/data/live/intraday.json`을 갱신합니다.
3. 같은 날은 `public/data/archive/YYYY/MM/YYYY-MM-DD.json` 하나를 계속 덮어쓰고, 다음날이 되면 전날 최종본만 남깁니다. 시간별 파일 수십 개를 만들지 않습니다.
4. 매일 07:00~08:00 KST 첫 점검에서 그날의 날짜별 HTML을 1개 생성/갱신합니다.
5. `public/` 변경으로 GitHub Pages가 자동 배포됩니다.
6. PWA/APK는 최신 HTML/JSON을 읽어 자동 갱신합니다.
7. APK는 UI/앱 자체가 바뀔 때만 다시 빌드하며 시장 데이터 갱신만으로 재설치하지 않습니다.

## 폴더 구조

```text
public/
  index.html                         # APK/PWA 외곽 셸
  assets/
    report.css                       # 모든 일일 보고서 공용 UI
    report.js                        # 필터/그래프/상세 모달 공용 로직
  data/
    latest.json                      # 항상 최신 분석
    live/
      intraday.json                  # 오늘 시간별 포인트 단 1개 파일
    archive/
      YYYY/MM/YYYY-MM-DD.json        # 하루 최종 스냅샷 1개
  reports/
    latest.html                      # 항상 최신 동적 HTML
    YYYY/MM/US_Market_Daily_YYYY-MM-DD.html # 날짜별 1개
  manifest.webmanifest
  sw.js

ops/
  handoff/current.json               # 공개 가능한 운영/인수인계 규칙

docs/
  AUTOMATION.md
  REPOSITORY_STRUCTURE.md
  SETUP_STATUS.md

.github/workflows/
  pages.yml
  android.yml

VERSION
```

### 파일이 많아지지 않게 하는 규칙

- 시간별 HTML/JSON 복사본 생성 금지
- 시간별 데이터는 `live/intraday.json` 하나에만 오늘치 저장
- 날짜별 파일은 `YYYY/MM` 폴더로 정리
- 같은 날짜 HTML/JSON은 계속 덮어쓰기
- 다음날이 되면 전날 최종본만 남기고 새 날짜 시작
- APK/AAB는 저장소에 커밋하지 않고 Actions Artifact/Release로 관리
- UI 코드는 `assets/report.css`, `assets/report.js` 공용 파일을 사용해 날짜별 HTML 중복을 최소화

## HTML 기능

- 시장 고점/저점 Phase + 역사적 유사구간
- 테마 랭킹/과열/상승여력
- 검색 및 테마 필터
- 시간별 시장/QQQ 그래프
- 종목을 누르면 실적·전망·PER/PBR·유동자산/부채·쉽게 설명·Bull/Bear·체크포인트
- 국내 상장 해외테마 ETF / 미국 상장 ETF 분리
- 증권사·은행·운용사 리서치 상세 및 `그래서 어떻게 할까?` 결론
- 추천비중/리밸런싱
- 거시·국제경제는 맨 아래

## 보안

이 저장소는 **Public** 입니다.

- 실제 보유종목/보유비중은 GitHub에 저장하지 않습니다.
- 앱의 개인 입력값은 기기 `localStorage`에만 저장합니다.
- GitHub PAT, API Secret, 비밀번호, OTP, 개인정보를 절대 커밋하지 않습니다.
- 공개 HTML/JSON에는 공개돼도 되는 시장 분석만 넣습니다.

## Android

`Build Market Radar Android APK` workflow가 앱 UI 변경 시 APK를 빌드합니다.

Artifacts에서 `MarketRadar-vX.Y.Z-debug-apk`를 받아 한 번 설치하면 시장 데이터는 이후 자동 갱신됩니다.

## 버전 관리

- 앱 버전: `VERSION`
- 앱/UI 변경: 버전 증가
- 시장 데이터: 버전 증가 없이 JSON/HTML만 갱신
- APK 바이너리: Actions Artifact/향후 Release로 관리
