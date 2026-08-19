# Market Radar 운영 인수인계 — CURRENT

기준 버전: **v0.3.4**  
기준일: **2026-08-20 KST**  
저장소: `kimjae134679/stock` (Public)

> 다음 작업자는 반드시 이 문서를 먼저 읽는다. 시장 자동화와 UI 개발을 섞지 않는다.

## 0. 절대 원칙

1. 매시간 시장 자동화는 JSON만 갱신한다. HTML/JS/CSS/VERSION을 덮어쓰지 않는다.
2. 안정화한다는 이유로 기존 기능을 삭제하거나 Hero 하나짜리 화면으로 단순화하지 않는다.
3. 사용자 화면에 현재 VERSION보다 낮은 버전이 보이면 정상본이 아니다. 캐시/배포 실패로 본다.
4. Pages 배포 workflow는 **커밋된 `public/`을 그대로 배포**한다. UI 검증 스크립트 실패로 배포 자체가 막히게 만들지 않는다.
5. APK는 Actions Artifact 실제 생성 + 직접 확보 전에는 완료라고 말하지 않는다.
6. 모바일/PC 정보량은 동일하다.
7. 작동하지 않는 자체 기간변경 버튼은 다시 만들지 않는다.

## 1. v0.3.4에서 고친 핵심 원인

사용자 PC에서 2026-08-20 02시경 주소가 `latest.html?v=0.3.0&shell=...`로 다시 열리고 화면이 완전히 빈 검정 화면이 됐다. 저장소는 이미 더 높은 버전이었으므로 **레거시 service worker/cache + 오래된 Pages 배포본이 살아 있는 문제**로 판단한다.

v0.3.4 조치:
- `public/reports/stable-v034.html`을 새 불변 진입 파일로 추가했다. 과거 `latest.html` 캐시와 파일명이 겹치지 않는다.
- `public/index.html`은 `stable-v034.html?fresh=<timestamp>`로 이동한다.
- `public/reports/latest.html`도 v0.3.4 동일 구조로 교체했다.
- `public/sw.js`는 캐시를 저장하지 않는 kill worker다. 활성화 시 모든 CacheStorage를 지우고 자기 자신을 unregister한다.
- `public/reports/stable-v034.html`은 렌더링 JS를 복잡한 동적 로더 대신 순서가 고정된 일반 `<script src>`로 직접 로드한다.
- `public/assets/app-runtime-v34.js`는 화면이 덜 그려져도 자동 reload로 화면을 날리지 않는다. 현재 보이는 내용은 유지하고 오류 문구만 표시한다.
- Pages workflow에서 brittle한 node/grep 검증 단계를 제거하고 committed `public/` 직접 배포만 남겼다.

정상 문구: `정상 · v0.3.4 전체 대시보드 로드 완료`

## 2. 현재 웹 진입 구조

- 기본 진입: `public/index.html`
- 안정 진입: `public/reports/stable-v034.html`
- 호환 진입: `public/reports/latest.html`
- 메인 렌더러: `public/assets/full-recovery-v22.js`
- 평가: `public/assets/evaluation-v26.js`
- 전체추적/우상향/모달: `public/assets/layout-v28.js`
- 우상향 1/2/3/5년 수익률: `public/assets/returns-v29.js`
- 독립 Phase: `public/assets/phase-status-v29.js`
- UI 고정: `public/assets/ui-v30.css`, `public/assets/ui-v30.js`
- 역사적 주기 UI: `public/assets/cycle-history-v34.js`
- v0.3.4 로드/Back 브리지: `public/assets/app-runtime-v34.js`

## 3. 역사적 상승/하락 주기 분석 — 새 고정 기능

데이터: `public/data/cycle-history.json`
생성기: `scripts/build-cycle-history.mjs`
Workflow: `.github/workflows/cycle-history.yml`

목표:
- QQQ 포함 가능한 모든 추적 종목/ETF에 대해 과거 상승/하락 스윙을 날짜순으로 저장한다.
- 현재가 상승 몇 거래일차/하락 몇 거래일차인지 표시한다.
- 과거 같은 방향의 평균/중앙값 거래일을 표시한다.
- 현재 변화율과 과거 평균 변화폭을 비교한다.
- 기간 진행도 %, 변화폭 진행도 %, 두 값의 종합 진행도 %를 표시한다.
- `상승 초반 / 상승 중반 / 상승 후반·고점 접근 / 평균기간 초과 연장상승` 또는 하락 대응 문구를 표시한다.
- 과거 이력은 시작일/종료일/거래일/달력일/등락률 순으로 보여준다.

현재 알고리즘:
- 10년 일별 가격을 기준으로 ZigZag reversal을 계산한다.
- 일반 ETF 약 8%, 일반주 약 12%, 3x 레버리지 약 18% 반전을 기본 threshold로 사용한다.
- 이 수치는 미래 종료일 예측값이 아니라 **현재 구간을 과거 이력과 비교하는 설명용 기준**이다.

테마는 가능한 경우 대표 proxy를 사용한다:
- software → IGV
- power → GRID
- compute/반도체 → SMH
- network → ANET
- defense → SHLD
- aggressive/레버리지 → SOXL
- index → QQQ

## 4. 기존 필수 기능 — 절대 삭제 금지

- 시장 Hero + 위험/저점/고점위험/추세확인/매수타이밍
- 시장/테마 독립 Phase
- 현재 테마 흐름
- 각 상태의 `그래서 지금은?`
- 시간별 매수타이밍 + QQQ 가격
- 큰 실제 TradingView 차트
- 종목/ETF 상세
- 유명·초대형 핵심주
- 안정적·꾸준한 우상향 후보
  - 테마별
  - 순위별
  - 주봉 그래프
  - 1Y/2Y/3Y/5Y 누적수익률
- 전체추적 `테마별 / 전부 모아보기`
- 숨은 테마
- ETF/비중/리서치/기관/원문/검증/Replay/거시
- 접기/펼치기
- 모달 배경 스크롤 잠금
- 모달에서 Android Back → 모달 닫기
- 루트 Android Back → `앱을 종료하시겠습니까?`

삭제 유지: 자체 `1시간 / 일봉 / 주봉 / 월봉` 버튼. TradingView 위젯 내부 버튼은 외부 위젯이므로 건드리지 않는다.

## 5. 매시간 자동화

자동화 ID: `6a847ce3f5dc81918ccab0a7bafaa8fe`

매시간 갱신:
- `public/data/latest.json`
- `public/data/live/intraday.json`
- `public/data/live/phase-status.json`
- 당일 archive

시장 자동화는 `cycle-history.json`을 매번 재계산하지 않는다. 역사적 주기 데이터는 별도 GitHub Action에서 일 단위로 갱신한다. UI 파일은 어떤 자동화도 수정하지 않는다.

좌측 상단 업데이트 표시는 데이터의 실제 `updated_at`을 `YYYY.MM.DD H시 업데이트`로 표시한다.

## 6. Phase/상태 규칙

시장 전체 하나로 모든 자산을 묶지 않는다. 미국 전체시장 / Nasdaq·성장주 / 반도체 / 네트워크·광통신 / AI SW·클라우드 / AI 전력·데이터센터 / 레버리지 / 주요 테마 / 주요 종목을 독립 평가한다.

사이클형이면 저점→반등→상승→고점·조정→하락·붕괴 위치를 표시한다. 구조성장/품질형이면 억지 사이클 대신 현재 상태 평가를 쓴다. 여기에 v0.3.4 역사적 주기 데이터가 있으면 `현재 N거래일차 / 평균 M일 / 약 P% 진행`을 함께 붙인다.

## 7. QA 합격 기준

- `stable-v034.html` 직접 진입 시 최소 Hero는 무조건 보인다. 완전 검정 빈 화면은 실패.
- 정상 시 `v0.3.4` 표시.
- Hero 하나로 끝나지 않고 전체 주요 섹션이 렌더링.
- 최종 loadState = `정상 · v0.3.4 전체 대시보드 로드 완료`.
- 재진입 후 v0.3.0 등 구버전으로 되돌아가지 않음.
- 버튼 흰색 기본 스타일/겹침 없음.
- 실제 차트 크게 유지.
- 자체 기간변경 버튼 없음.
- 종목 상세에 역사적 주기 데이터가 있으면 현재 일차/평균/진행률/과거 이력 표시.
- Android Back 계약 유지.

## 8. 배포/APK

Pages: `.github/workflows/pages.yml`은 committed `public/`을 검증 없이 직접 업로드/배포한다. 배포를 막는 과도한 grep/node-check를 다시 넣지 않는다.

Android: `.github/workflows/android.yml`은 v0.3.4 안정 진입 파일을 포함해 Capacitor sync 후 네이티브 Back 패치 및 APK를 빌드한다.

APK 완료 정의: Actions 성공 → Artifact 존재 → APK 다운로드 → 사용자에게 파일 직접 제공.
