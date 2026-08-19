# Market Radar 운영 인수인계 — CURRENT

기준 버전: **v0.3.3**  
기준일: **2026-08-20 KST**  
저장소: `kimjae134679/stock` (Public)

> 다음 작업자는 반드시 이 문서를 먼저 읽는다. **시장 자동화와 UI 개발을 섞지 않는다.**

## 0. 절대 원칙

1. **매시간 시장 자동화는 JSON만 갱신한다. HTML/JS/CSS/VERSION을 건드리지 않는다.**
2. UI 수정은 사용자가 명시적으로 요청한 경우에만 한다.
3. 안정화한다고 기존 기능을 삭제하거나 Hero 하나짜리 화면으로 단순화하지 않는다.
4. 모바일/PC 정보량은 동일하다.
5. 미확인 시장 가격/수익률은 추정하지 않는다.
6. UI 릴리스 시 `VERSION`, `package.json`, `public/index.html`, `public/reports/latest.html`, `public/sw.js`, 캐시키, Pages/Android workflow를 함께 맞춘다.
7. **사용자 화면에 현재 VERSION보다 낮은 버전이 보이면 배포/캐시 실패다. 정상으로 간주하지 않는다.**
8. APK는 실제 Actions Artifact를 확보하기 전에는 완료라고 말하지 않는다.

과거 실제 회귀: Hero 카드 하나만 남음, 버튼 무반응, 흰색 기본 버튼, 차트 축소, 정상 화면이 잠깐 보였다가 사라짐, 기능 삭제, 오래된 v0.3.0 화면 재등장. 이 문제를 반복하지 않는 것이 최우선이다.

---

## 1. 현재 구조

- 웹/앱 진입: `public/index.html`
- 최신 대시보드: `public/reports/latest.html`
- 데이터: `public/data/latest.json`, `public/data/live/intraday.json`, `public/data/live/phase-status.json`
- 렌더러: `public/assets/full-recovery-v22.js`
- 평가: `public/assets/evaluation-v26.js`
- 전체추적/우상향/모달: `public/assets/layout-v28.js`
- 우상향 1/2/3/5년 수익률: `public/assets/returns-v29.js`
- 독립 Phase: `public/assets/phase-status-v29.js`
- UI 고정: `public/assets/ui-v30.css`, `public/assets/ui-v30.js`
- **현재 로드 검증/네이티브 Back 브리지: `public/assets/app-runtime-v33.js`**
- Android 아이콘 + 네이티브 Back 패치: `scripts/apply-android-branding.mjs`
- 레거시 PWA 캐시 제거: `public/sw.js`

`app-back-v31.js`, `app-runtime-v32.js`, `interval-fix-v27.js`는 현재 `latest.html`에서 로드하지 않는다.

---

## 2. v0.3.3에서 반드시 기억할 실제 원인

사용자 캡처에서 저장소는 이미 v0.3.2였는데 실제 화면은 **`Market Radar Daily · v0.3.0`**이고 Hero 기본 화면 하나만 보였다.

이 경우를 단순 렌더 오류로만 보면 안 된다. **사용자가 실제로 오래된 HTML/캐시/오래된 APK를 보고 있다는 증거**다.

### v0.3.3 조치

- `public/sw.js`는 더 이상 대시보드를 캐시하지 않는다.
- 기존 service worker가 살아 있으면 모든 CacheStorage를 삭제하고 자기 자신을 unregister 한다.
- `public/index.html`도 진입 즉시:
  - 모든 service worker unregister
  - 모든 CacheStorage 삭제
  - 모든 `mr:last-good:*` 캐시 제거
  - `reports/latest.html?v=0.3.3&fresh=<timestamp>`로 이동
- `latest.html`도 시작 시 old cache/service worker를 한 번 더 제거한다.
- JS 파일을 정적 `<script src>` 여러 개로 그냥 두지 않고 **인라인 로더가 순차적으로 timestamp를 붙여 로드**한다.
- 마지막에 `app-runtime-v33.js`가 전체 섹션 수와 페이지 높이를 확인한다.
- 정상 기준은 `#app`에 최소 8개 주요 섹션 + 2 viewport 이상 높이.
- 부족하지만 데이터는 정상일 때는 **한 번만** `recovery33` cache-busting reload.
- 두 번째에도 실패하면 `정상`이라고 속이지 않고 오류 상태를 표시한다.

### 성공 판정 문구

`정상 · v0.3.3 전체 대시보드 로드 완료`

이 문구가 아니거나 v0.3.0/v0.3.1/v0.3.2가 보이면 현재 릴리스 성공으로 보지 않는다.

---

## 3. Android 하드웨어 뒤로가기 계약

Capacitor JS 리스너 하나에만 의존하지 않는다.

APK 빌드에서 `scripts/apply-android-branding.mjs`가 생성된 Android 프로젝트의 `MainActivity.java`에 네이티브 fallback을 넣는다.

동작 순서:

1. 종목/테마/ETF 등 상세 모달이 열려 있음 → Back = **그 모달만 닫기**
2. 모달 없음, WebView 내부에서 실제 뒤로갈 페이지가 있으면 → WebView history Back
3. 루트 화면에서 Back → `앱을 종료하시겠습니까?`
4. `취소` → 앱 유지
5. `종료` → 앱 종료

웹은 `window.__MR_HANDLE_NATIVE_BACK__()`를 제공하며 네이티브 MainActivity가 `evaluateJavascript()`로 호출한다.

---

## 4. 반드시 보존할 UI/기능

- 시장 Hero + 위험/저점/고점위험/추세확인/매수타이밍
- 시장/테마 독립 Phase
- 현재 테마 흐름
- 각 상태별 `그래서 지금은?`
- 시간별 매수타이밍 + QQQ 가격
- 큰 실제 TradingView 차트
- 종목/ETF 상세
- 유명·초대형 핵심주
- 안정적·꾸준한 우상향 후보
  - 테마별 묶음
  - 순위별 묶음
  - 카드 안 주봉 차트
  - 1년/2년/3년/5년 누적 주가 수익률
- 전체추적 유니버스
  - `테마별`
  - `전부 모아보기`
- 숨은 테마
- ETF
- 비중
- 리서치
- 기관·스마트머니
- 원문
- 검증
- Replay
- 거시
- 모든 큰 섹션 접기/펼치기
- 모달 배경 스크롤 잠금
- Android Back 계약

### 삭제 유지할 기능

사용자 요청에 따라 자체 `1시간 / 일봉 / 주봉 / 월봉` 버튼은 **삭제 상태가 정답**이다. 다시 만들지 않는다. TradingView 자체 내부 UI는 외부 위젯이므로 그대로 둔다.

---

## 5. 차트/UI 기준

- 실제 주가 차트는 작은 썸네일 수준이면 실패.
- QQQ 실제 차트와 종목 상세 차트는 모바일에서도 크게 보여야 한다.
- 우상향 후보는 카드마다 주봉 그래프를 바로 보여준다.
- 버튼은 브라우저 기본 흰색 네모로 나오면 실패.
- 대표주/종목 버튼이 겹치거나 잘리면 실패.
- 페이지 전체 좌우 밀림 금지.
- 모바일이라고 정보량을 줄이지 않는다.

---

## 6. 시장/Phase 평가 규칙

시장 전체 하나로 모든 자산을 묶지 않는다. 최소 독립 평가:

- 미국 전체시장
- Nasdaq/성장주
- 반도체
- AI 네트워크·광통신
- AI 소프트웨어·클라우드
- AI 전력·데이터센터
- 레버리지
- 주요 테마
- 주요 개별 종목

단계:

`🔥 극단저점/투매 → 🟢 저점후보 → 🟢 바닥형성/확인 → 🟡 저점에서 상승중 → 🟡 중간상승 → 🟠 고점근처/조정 → 🔴 과열/분배 → 🔴 추세붕괴/급락`, 필요 시 `⚪ 횡보/불명확`.

모든 상태에는 `그래서 지금은?` 실제 행동을 붙인다. 구조성장/품질주는 억지 사이클 대신 현재 상태 평가를 쓴다.

---

## 7. 매시간 자동화

자동화 ID: `6a847ce3f5dc81918ccab0a7bafaa8fe`

매시간 갱신 대상:

- `public/data/latest.json`
- `public/data/live/intraday.json`
- `public/data/live/phase-status.json`
- 당일 archive JSON

`updated_at`은 실제 완료 KST. 좌측 상단은 `YYYY.MM.DD H시 업데이트`.

**자동화는 UI 파일과 VERSION을 수정하지 않는다.** 데이터 커밋이 Pages 재배포를 유발할 수는 있지만, 배포되는 UI는 현재 커밋된 v0.3.3 그대로여야 한다.

---

## 8. v0.3.3 QA 합격 기준

아래 전부 확인해야 한다.

- 좌측 상단 버전이 `v0.3.3`
- 초기 상태에서 Hero 하나로 끝나지 않음
- 시장 아래 테마/행동/그래프/종목/대표주/우상향/전체추적 등 전체 섹션 존재
- 최종 loadState = `정상 · v0.3.3 전체 대시보드 로드 완료`
- 새로고침/재진입 후에도 v0.3.0으로 돌아가지 않음
- stale service worker/cache가 남지 않음
- 상세 모달에서 Android Back → 모달 닫기
- 루트에서 Android Back → 종료 확인
- 취소/종료 정상
- 버튼 흰색 기본 스타일 없음
- 버튼 겹침 없음
- 차트 크게 유지
- 전체 페이지 가로 밀림 없음
- 자체 기간변경 버튼 없음

---

## 9. 배포/APK 규칙

Pages는 커밋된 `public/`을 그대로 배포한다.

Android workflow 순서:
1. committed v0.3.3 dashboard 검증
2. `npx cap add android`
3. `npx cap sync android`
4. `scripts/apply-android-branding.mjs`
5. MainActivity/icon 검증
6. Gradle debug APK 빌드
7. `MarketRadar-v0.3.3-debug.apk` Artifact 업로드

**APK 작업 완료의 정의:** Actions 빌드 성공 + Artifact 실제 존재 + APK 직접 확보. 소스만 수정된 상태는 완료가 아니다.
