# Market Radar 운영 인수인계 — CURRENT

기준 버전: **v0.3.1**  
기준일: **2026-08-20 KST**  
저장소: `kimjae134679/stock` (Public)

> 다음 작업자는 **반드시 이 문서를 먼저 읽는다.** 이 문서와 코드가 다르면 먼저 실제 코드를 확인한 뒤 문서를 함께 갱신한다.

## 0. 절대 원칙

1. **매시간 시장 자동화는 JSON 데이터만 갱신한다. HTML/JS/CSS/UI를 덮어쓰지 않는다.**
2. UI 수정은 사용자가 명시적으로 요청한 경우만 한다.
3. 안정화한다는 이유로 기존 기능을 삭제하거나 화면을 단순화하지 않는다.
4. 모바일과 PC는 정보량이 같아야 한다.
5. 작동하지 않는 버튼은 남겨두지 않는다.
6. 미확인 시장 가격/수익률은 추정하지 않는다.
7. UI 변경 버전에서는 `VERSION`, `package.json`, `public/index.html`, `public/reports/latest.html`, 캐시키, Pages/Android 검증을 같이 맞춘다.

과거 실제 회귀: Hero 카드 하나만 남음, 버튼 무반응, 흰색 기본 버튼 노출, 차트 축소, 정상 화면이 잠깐 보였다가 사라짐, 기능 삭제. **이 문제를 반복하지 않는 것이 최우선이다.**

---

## 1. 현재 배포 구조

GitHub Pages는 `.github/workflows/pages.yml`에서 **커밋된 `public/` 폴더를 그대로 배포**한다. 현재 Pages 배포에서 정적 리포트 빌더를 다시 실행하지 않는다.

- 웹/앱 진입: `public/index.html`
- 최신 전체 화면: `public/reports/latest.html`
- 기본 CSS: `public/assets/report.css`
- 모바일 보정: `public/assets/mobile-fixes.css`
- 전체 렌더링: `public/assets/full-recovery-v22.js`
- 평가 보강: `public/assets/evaluation-v26.js`
- 우상향/전체추적/모달: `public/assets/layout-v28.js`
- 우상향 1/2/3/5년 수익률: `public/assets/returns-v29.js`
- 독립 Phase: `public/assets/phase-status-v29.js`
- UI 고정: `public/assets/ui-v30.css`, `public/assets/ui-v30.js`
- **Android/PWA 뒤로가기 보강: `public/assets/app-back-v31.js`**

`interval-fix-v27.js`는 **로드 금지**. 사용자 요청으로 자체 `1시간/일봉/주봉/월봉` 버튼은 삭제 상태가 정답이다.

---

## 2. 데이터 Source of Truth

- `public/data/latest.json` — 전체 최신 시장/테마/종목/ETF/평가
- `public/data/live/intraday.json` — 당일 시간별 포인트
- `public/data/live/phase-status.json` — 시장/테마 독립 Phase + `그래서 지금은?`
- `public/data/archive/YYYY/MM/YYYY-MM-DD.json` — 날짜별 최종본

매시간 자동화 ID: `6a847ce3f5dc81918ccab0a7bafaa8fe`

자동화는 매시간 위 JSON만 갱신하고 `updated_at`을 실제 KST 완료 시각으로 기록한다. 좌측 상단은 `YYYY.MM.DD H시 업데이트` 형식이다. **자동화가 HTML/JS/CSS/VERSION을 수정하면 안 된다.**

---

## 3. APK 빌드 구조 — v0.3.1 중요 변경

Android 프로젝트는 저장소에 고정 보관하지 않고 CI에서 `npx cap add android`로 생성한다.

`.github/workflows/android.yml` 순서:

1. 저장소 checkout
2. `npm install`
3. **커밋된 현재 대시보드 검증**
4. `npx cap add android`
5. `npx cap sync android`
6. `node scripts/apply-android-branding.mjs`
7. Gradle debug APK 빌드
8. `MarketRadar-v<VERSION>-debug.apk` Artifact 업로드

### 매우 중요

**Android workflow에서 `build-static-report.mjs` / `finalize-static-report.mjs` / `validate-static-report.mjs`를 실행해 현재 UI를 다시 생성하지 않는다.** 과거 APK 빌드 과정에서 오래된 빌더가 최신 화면을 덮어쓸 위험이 있었다. 현재 APK는 커밋된 `public/`을 그대로 sync한다.

---

## 4. APK 아이콘 규칙

v0.3.1부터 APK 아이콘은 **매우 단순한 디자인**으로 고정한다.

- 배경: `#071018` 진한 네이비
- 전경: `#5EEAD4` 민트색 상승선 하나
- 텍스트/문자/복잡한 장식 없음
- Adaptive icon / round icon 모두 동일 계열
- 생성 스크립트: `scripts/apply-android-branding.mjs`
- 생성 리소스:
  - `android/app/src/main/res/drawable/market_radar_icon_foreground.xml`
  - `android/app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml`
  - `android/app/src/main/res/mipmap-anydpi-v26/ic_launcher_round.xml`

Android 프로젝트가 CI에서 매번 새로 생성되므로 **아이콘을 수동으로 android/에 넣는 방식으로 관리하지 않는다.** 반드시 위 스크립트가 매 빌드 적용한다.

---

## 5. 뒤로가기 계약 — v0.3.1 핵심

`@capacitor/app` 플러그인 + `public/assets/app-back-v31.js` 사용.

Android 하드웨어/제스처 뒤로가기 우선순위:

1. **종목/테마/상세 모달·팝업이 열려 있으면 → 뒤로가기 = 닫기**
2. 모달이 없고 실제 WebView history가 있으면 → 정상 뒤로가기
3. **더 이상 뒤로 갈 곳이 없으면 → `앱을 종료하시겠습니까?` 확인창 표시**
4. 확인 시에만 `App.exitApp()`

절대 금지:

- 상세창 열린 상태에서 뒤로가기 한 번으로 앱 종료
- 루트 화면에서 확인 없이 바로 앱 종료
- 모달 닫기와 history state가 충돌해 배경 페이지가 같이 이동

모달은 기존 `layout-v28.js`의 scroll lock/history state와 함께 동작한다. 새 뒤로가기 코드는 기존 모달 history 구조를 파괴하지 말고 **소비(consume)** 해야 한다.

---

## 6. 반드시 보존할 UI 기능

- 시장 Hero + 위험/저점/고점위험/추세확인/매수타이밍
- 시장/테마 독립 Phase 보드
- 현재 테마 흐름
- 행동 Phase 가이드 + 모든 상태의 `그래서 지금은?`
- 시간별 매수타이밍 + QQQ 가격 그래프
- 큼지막한 실제 TradingView 차트
- 종목/ETF 검색/상세
- 유명·초대형 핵심주
- 안정적·꾸준한 우상향 후보
  - 테마별
  - 순위별
  - 각 후보 주봉 그래프
  - 1/2/3/5년 누적 수익률
- 전체추적 유니버스
  - 테마별
  - 전부 모아보기
- 숨은테마 티커 클릭 상세/차트
- ETF/비중/리서치/기관/원문/검증/Replay/거시
- 모든 큰 섹션 접기/펼치기
- 모달 배경 스크롤 잠금
- Android 뒤로가기 동작 계약

---

## 7. 차트 규칙

- 차트는 작은 썸네일이 아니라 **넓고 크게** 보여야 한다.
- QQQ 실제차트, 종목 상세차트, 우상향 주봉차트 모두 모바일에서 읽을 수 있는 높이를 확보한다.
- 자체 `1시간/일봉/주봉/월봉` 버튼은 다시 만들지 않는다.
- TradingView iframe 내부 자체 기능은 그대로 둔다.

---

## 8. 버튼/모바일 QA

배포 전 아래를 확인한다.

- 흰색 브라우저 기본 버튼이 보이지 않음
- 대표주/종목 버튼이 겹치지 않음
- 텍스트가 버튼 밖으로 튀어나오지 않음
- 전체 페이지 가로밀림 없음
- 상세 모달 닫기가 안전영역에 가리지 않음
- 모달 끝에서 스크롤해도 뒤 페이지가 움직이지 않음
- Android 뒤로가기 한 번 = 모달 닫기
- 루트 뒤로가기 = 종료 확인창
- 차트가 큰 빈 박스 안의 작은 iframe으로 축소되지 않음
- PC/모바일 정보량 동일

---

## 9. Phase 판정

시장 전체 하나로 모든 자산을 묶지 않는다. 최소 독립 평가: 미국 전체시장, Nasdaq/성장주, 반도체, AI 네트워크·광통신, AI 소프트웨어·클라우드, AI 전력·데이터센터, 레버리지, 주요 테마/종목.

단계: `🔥 극단저점/투매`, `🟢 저점후보`, `🟢 바닥형성/확인`, `🟡 저점에서 상승중`, `🟡 중간상승`, `🟠 고점근처/조정`, `🔴 과열/분배`, `🔴 추세붕괴/급락`, 필요 시 `⚪ 횡보/불명확`.

사이클형이 아닌 구조성장/품질주는 억지 사이클 대신 `현재 상태 평가`를 사용한다. 모든 평가에 `그래서 지금은?` 행동 코멘트를 붙인다.

---

## 10. 릴리즈 체크리스트

UI/APK 수정 시:

- `VERSION`
- `package.json` version
- `public/index.html`
- `public/reports/latest.html`
- CSS/JS cache key
- `.github/workflows/pages.yml` 검증 버전
- `.github/workflows/android.yml` 검증 버전
- `ops/handoff/CURRENT.md`
- `ops/handoff/current.json`

을 함께 갱신한다.

최신 확인 주소:

- `https://kimjae134679.github.io/stock/`
- `https://kimjae134679.github.io/stock/reports/latest.html?v=0.3.1`

## 최우선순위

**정상 화면 유지 → 기존 기능 보존 → 데이터 최신성 → 모바일 UX → 새 기능.**
