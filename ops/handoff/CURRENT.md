# Market Radar 운영 인수인계 — CURRENT

기준 버전: **v0.3.2**  
기준일: **2026-08-20 KST**  
저장소: `kimjae134679/stock` (Public)

> 다음 작업자는 반드시 이 문서를 먼저 읽는다. 시장 자동화와 UI 개발을 섞지 않는다.

## 0. 절대 원칙

1. **매시간 시장 자동화는 JSON만 갱신한다. HTML/JS/CSS/VERSION을 건드리지 않는다.**
2. UI 수정은 사용자가 명시적으로 요청한 경우에만 한다.
3. 안정화한다고 기존 기능을 삭제하거나 Hero 하나짜리 화면으로 단순화하지 않는다.
4. 모바일/PC 정보량은 동일하다.
5. 미확인 시장 가격/수익률은 추정하지 않는다.
6. UI 릴리스 시 `VERSION`, `package.json`, `public/index.html`, `public/reports/latest.html`, 캐시키, Pages/Android workflow를 함께 맞춘다.

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
- **APK/웹 복구 + 뒤로가기 브리지: `public/assets/app-runtime-v32.js`**
- Android 아이콘 + 네이티브 뒤로가기 패치: `scripts/apply-android-branding.mjs`

`app-back-v31.js`와 `interval-fix-v27.js`는 latest.html에서 로드하지 않는다.

## 2. v0.3.2 핵심 수정

사용자 실제 APK에서 두 문제가 확인됐다.

### A. 전체 화면이 전부 로드되지 않음

증상:
- Hero/행동 일부만 보임
- 큰 빈 공간 발생
- `마지막 정상 화면 표시 · 최신 데이터 확인 중` 상태에 머묾

원인 방지:
- 과거 partial 화면을 저장한 `mr:last-good:*` 캐시를 렌더러 실행 전에 제거한다.
- `app-runtime-v32.js`가 로드 후 최소 8개 주요 섹션 + 2 viewport 이상의 높이를 확인한다.
- 부족하면 APK 안의 `latest.json`과 `intraday.json`을 직접 probe한다.
- 데이터가 정상인데 화면만 덜 그려졌으면 **한 번만** cache-busting 재로딩한다.
- recovery 파라미터가 이미 있으면 반복 reload하지 않는다.

### B. Android 하드웨어 뒤로가기 무반응

v0.3.1처럼 Capacitor JS `App.addListener('backButton')`에만 의존하지 않는다.

v0.3.2 APK 빌드에서는 `scripts/apply-android-branding.mjs`가 생성된 Android 프로젝트의 `MainActivity.java`를 직접 작성한다.

동작 계약:
1. 모달/상세/팝업이 열려 있으면 Back → **그것만 닫기**
2. 루트 화면에서 Back → 네이티브 `앱을 종료하시겠습니까?` 확인창
3. `취소` → 앱 유지
4. `종료` → `finishAffinity()`로 종료

웹 페이지는 `window.__MR_HANDLE_NATIVE_BACK__()`를 제공한다. Android `MainActivity`가 `evaluateJavascript()`로 이 함수를 호출하여 모달이 Back을 소비했는지 확인한다. JS 플러그인 리스너가 실패해도 네이티브 동작이 남는다.

## 3. APK 아이콘

매우 간단하게 유지:
- 배경 `#071018`
- 민트색 `#5EEAD4`
- 상승선 하나
- 텍스트/장식 없음

`npx cap sync android` 이후 branding script가 adaptive icon을 생성한다.

## 4. 반드시 보존할 UI

- 시장 Hero + 점수
- 시장/테마 독립 Phase
- 현재 테마 흐름
- 각 Phase의 `그래서 지금은?`
- 시간별 매수타이밍 + QQQ 가격
- 큰 실제 TradingView 차트
- 종목/ETF 상세
- 유명·초대형 핵심주
- 안정적·꾸준한 우상향 후보
  - 테마별
  - 순위별
  - 주봉 차트
  - 1/2/3/5년 수익률
- 전체추적 `테마별 / 전부 모아보기`
- 숨은 테마
- ETF/비중/리서치/기관/원문/검증/Replay/거시
- 접기/펼치기
- 모달 배경 스크롤 잠금

자체 `1시간/일봉/주봉/월봉` 버튼은 사용자 요청으로 삭제 상태가 정답이다.

## 5. 매시간 자동화

자동화 ID: `6a847ce3f5dc81918ccab0a7bafaa8fe`

매시간:
- `latest.json`
- `intraday.json`
- `phase-status.json`
- 당일 archive
만 갱신한다.

`updated_at`은 실제 완료 KST. 좌측 상단은 `YYYY.MM.DD H시 업데이트`.

**자동화는 UI 파일과 VERSION을 수정하지 않는다.**

## 6. Phase 규칙

시장 전체 하나로 모든 자산을 묶지 않는다. 최소 독립 평가:
- 미국 전체시장
- Nasdaq/성장주
- 반도체
- AI 네트워크·광통신
- AI 소프트웨어·클라우드
- AI 전력·데이터센터
- 레버리지
- 주요 테마/종목

모든 상태에는 `그래서 지금은?` 행동을 붙인다. 구조성장/품질주는 억지 사이클 대신 현재 상태 평가를 쓴다.

## 7. v0.3.2 QA 합격 기준

- APK 첫 진입 후 Hero 하나로 끝나지 않고 전체 대시보드가 길게 렌더링됨
- `정상 · 전체 대시보드 로드 완료` 상태 확인
- 과거 partial cache 화면이 복원되지 않음
- 상세 모달에서 Android Back → 모달만 닫힘
- 루트에서 Android Back → 종료 확인창
- 취소 → 유지 / 종료 → 앱 종료
- 버튼 흰색 기본 스타일 없음
- 버튼 겹침 없음
- 차트 크게 유지
- 전체 페이지 가로 밀림 없음
- broken interval 버튼 없음

## 8. 배포 규칙

Pages는 커밋된 `public/`을 그대로 배포한다. Android workflow는:
1. committed dashboard 검증
2. `npx cap add android`
3. `npx cap sync android`
4. `scripts/apply-android-branding.mjs`
5. MainActivity/icon 존재 및 문자열 검증
6. Gradle debug APK 빌드
7. `MarketRadar-v0.3.2-debug.apk` Artifact 업로드

APK가 실제 Actions Artifact로 생성되기 전에는 'APK 완료'라고 말하지 않는다.
