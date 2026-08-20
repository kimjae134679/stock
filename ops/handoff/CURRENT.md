# Market Radar 운영 인수인계 — CURRENT

기준 버전: **v0.4.2**  
기준일: **2026-08-20 KST**  
저장소: `kimjae134679/stock` (Public)

> 다음 작업자는 반드시 이 문서를 먼저 읽는다. **v0.4.2의 핵심은 과거 복구/보정 스크립트 체인을 더 고치는 것이 아니라, 안정 진입점의 렌더·상호작용 책임을 단일 파일로 다시 통합한 것**이다.

## 0. 절대 원칙
1. 매시간 시장 자동화는 JSON만 갱신한다. HTML/JS/CSS/VERSION 수정 금지.
2. 기존 기능 삭제 금지. Hero 하나짜리 단순화 금지.
3. 모바일/PC 정보량 동일.
4. 자체 `1시간/일봉/주봉/월봉` 버튼은 다시 만들지 않는다.
5. 로딩은 실제 완료 단계 기반 `00.001%` 형식. **100% 후 `#loadWrap` 전체를 제거해 높이·margin·padding이 0이 되며 빈 칸도 남기지 않는다.**
6. 화면 최상단 micro build mark 유지. v0.4.2 = **`MR042`**.
7. APK 완료 = Actions 성공 + Artifact 확인 + APK 직접 확보 후 사용자에게 파일 제공.
8. 안정판 변경은 **실제 Chromium desktop+mobile QA 통과 전 완료로 판단하지 않는다.**

## 1. v0.4.1에서 다시 확인된 문제
사용자 모바일 캡처에서:
- 로딩바가 `90.000% · 버튼 동작 연결 완료`에 남음.
- `현재 테마 흐름` 다음의 `지금 위치에 따라 무엇을 해야 하나?` 섹션이 테두리만 남고 내부가 거대한 빈 영역이 됨.
- 즉 DOM 존재 여부만 확인하는 방식으로는 실제 사용자 화면 정상성을 보장하지 못함.

과거 버전의 누적 원인은 다음이었다.
- `full-recovery`, `evaluation`, `phase-status`, `layout`, `integrity`, `flow-guard`, `interaction` 등 여러 JS가 같은 DOM을 순차/동시 변경.
- renderer가 만든 DOM을 후속 스크립트가 변경하면서 버튼 이벤트·높이·내용 상태가 서로 엇갈림.
- gap 복구를 `transform:translateY()`로 처리한 버전은 보이는 위치만 움직이고 원래 layout slot은 남아 빈 공간을 만들 수 있었음.
- 핵심 UI 완료와 선택 분석/보강 스크립트 완료를 같은 progress에 묶어 72%, 83%, 90% 등에 남는 현상 발생.
- 모바일 성능 저하가 race를 더 자주 노출함.

## 2. v0.4.2 — 단일 소유 렌더러
안정 진입점은 **`public/reports/stable-v042.html`**.

이 페이지가 직접 사용하는 UI 자원은 두 개다.
- `public/assets/app-v42.css`
- `public/assets/app-v42.js`

### 안정판에서 더 이상 로드하지 않는 레거시 체인
다음 파일은 저장소에 남아 있어도 **stable-v042에서 로드 금지**다.
- `full-recovery-v22.js`
- `evaluation-v26.js`
- `ui-v30.js`
- `layout-v36.js`
- `phase-status-v29.js`
- `interaction-v40.js`, `interaction-v41.js`
- `flow-guard-v40.js`
- `integrity-v38.js`, `integrity-v39.js`, `integrity-v40.js`
- 과거 `app-runtime-*`, cache/watchdog 계열

후속 작업자가 “한 문제만 고치기 위해” 위 파일 중 하나를 안정판에 다시 얹지 않는다. 필요한 기능은 `app-v42.js` 안에서 한 흐름으로 구현하거나 명확한 비-DOM 데이터 모듈로만 분리한다.

## 3. app-v42.js 책임 범위
`app-v42.js` 한 파일이 다음을 소유한다.
- latest/intraday 핵심 데이터 로드
- 전체 16개 섹션 최초 렌더
- quicknav
- 접기/펼치기
- 테마/종목 클릭
- 상세 modal
- modal scroll lock
- Android native Back용 `window.__MR_HANDLE_NATIVE_BACK__`
- 전체추적 `테마별 / 전부 모아보기`
- 우상향 후보 그룹
- TradingView lazy loading
- 1/2/3/5년 수익률 표시
- 역사 cycle 표시
- 독립 Phase 보강
- 로딩 진행률/완료/실패 표시
- 최종 화면 구조 검증

**DOM을 만든 주체와 버튼 이벤트를 관리하는 주체가 동일해야 한다.**

## 4. 필수 16개 섹션
다음 ID가 전부 있어야 정상이다.
1. `themes`
2. `action`
3. `charts`
4. `picks`
5. `mr-famous`
6. `mr-compounders`
7. `mr-universe`
8. `expanded`
9. `etfs`
10. `allocation`
11. `research`
12. `smart-money`
13. `sources`
14. `history`
15. `replay`
16. `macro`

### action 섹션 별도 검증
사용자가 반복해서 빈 박스를 본 핵심 회귀 지점이다.
- `#action .mr-body` 존재 필수
- body에 실제 행동 안내 + Phase 카드가 있어야 함
- 자동 브라우저 QA에서 action text 길이와 높이를 확인
- 접으면 body 높이 0
- 펼치면 body가 실제 내용 높이로 복구

## 5. 접기/펼치기 계약
- 이벤트는 `document`의 delegated click 한 계층에서 처리.
- 상태 키: `mr:fold:v042:*`
- 접힘:
  - `.mr-section.is-folded .mr-body { display:none; height:0; ... }`
  - 제목 영역만 남음.
- 펼침:
  - body는 normal document flow의 `height:auto`.
- section 위치를 `transform`, `translate`, absolute positioning으로 보정하지 않는다.
- 빈 공간을 숨기기 위해 다음 섹션을 위로 당기는 방식 금지.

## 6. 로딩바 계약 — 빈 칸 금지
로딩 UI wrapper: **`#loadWrap`**

흐름:
1. `00.001%`부터 실제 단계 기반 진행.
2. latest/intraday 핵심 데이터 수신.
3. 단일 renderer로 전체 화면 생성.
4. 16개 섹션 + action body + fold 버튼 검증.
5. `100.000%` 표시.
6. 약 0.26초 후 `#loadWrap` 자체를 `hidden/display:none` 처리.
7. 동시에 `margin:0`, `padding:0`, `height:0`으로 고정.

**100% 이후 로딩 카드만 투명하게 만들고 자리만 남기는 구현은 금지.**

Phase/cycle/returns 같은 선택 데이터는 핵심 완료 뒤 별도로 로드하며 progress를 붙잡지 않는다.

## 7. 자동 Browser QA — 필수
Workflow: **`.github/workflows/dashboard-qa.yml`**  
스크립트: **`scripts/qa-dashboard-v42.mjs`**

Chromium에서 실제 페이지를 열어 desktop `1440×1000`, mobile `390×844` 두 환경을 검사한다.

필수 자동 검사:
- `v0.4.2`, `MR042`
- 16개 섹션 전부 존재
- 로드 완료 뒤 `#loadWrap` 실제 높이 0
- action body가 빈 껍데기가 아님
- fold 버튼 16개 이상
- 글자 없는 fold 버튼 없음
- 텍스트는 거의 없는데 높이만 큰 suspicious blank panel 없음
- 접힌 panel이 큰 높이를 유지하지 않음
- action `접기 → 펼치기 → 접기` 실제 클릭 테스트
- desktop/mobile full-page screenshot 생성

현재 v0.4.2 QA 성공 기록:
- run id: `32320646810`
- checks: `desktop`, `mobile`, `load-collapse`, `action-body`, `fold-toggle`, `blank-panel`

**앞으로도 브라우저 QA가 실패하면 APK 빌드가 성공했더라도 UI 완료로 취급하지 않는다.**

## 8. 성능 규칙
- 19개 TradingView iframe 초기 동시 로드 금지.
- 접힌 섹션 안의 iframe은 생성하지 않는다.
- 펼친 뒤 viewport 약 500px 근처에서 lazy load.
- 1/2/3/5년 수익률은 `compounder-returns.json` 1회 사용.
- 모바일에서 19×4 Yahoo 직접 요청 복원 금지.
- 역사 주기는 `cycle-history.json`을 읽기만 함.
- optional data 실패가 core 화면을 제거하지 못하게 한다.

## 9. 역사적 상승/하락 주기 분석 — 삭제 금지
데이터: `public/data/cycle-history.json`

표시 목표:
- 현재 상승/하락 N거래일차
- 현재 구간 시작일/변화율
- 과거 같은 방향 평균/중앙값 거래일
- 기간 진행도
- 변화폭 진행도
- 종합 진행도
- 상승/하락 초반·중반·후반·평균기간 초과 표현
- 과거 모든 스윙의 시작일/종료일/거래일/등락률

현재 `cycle-history.json`의 `assets`가 비어 있으면 숫자를 지어내지 않고 계산 대기 상태로 표시한다.

## 10. 절대 삭제 금지 기능
- 시장 Hero
- 독립 시장/테마 Phase + `그래서 지금은?`
- 현재 테마 흐름
- 행동 matrix
- 시간별 매수타이밍/QQQ 가격
- 큰 QQQ/종목 TradingView 차트
- 종목·ETF 핵심판
- 유명·초대형 핵심주
- 안정적·꾸준한 우상향 후보
  - 테마별 묶음
  - 품질/진입/성장/낙폭위험
  - 주봉 lazy chart
  - 1/2/3/5년 수익률
- 전체추적 `테마별 / 전부 모아보기`
- 숨은 수혜/다음테마
- ETF
- 비중
- 리서치
- 기관/스마트머니
- 원문
- 검증
- Replay
- 거시
- 접기/펼치기
- modal + Android Back
- 역사 cycle
- 실제 진행률
- micro build mark

## 11. Android Back 계약
- modal 열림 → 하드웨어 Back = modal 닫기
- 루트 → `앱을 종료하시겠습니까?`
- 명시적 종료만 앱 종료

Native fallback 생성/검증은 `scripts/apply-android-branding.mjs`와 Android workflow에서 유지한다.

## 12. 진입 구조
- shell: `public/index.html`
- APK/PWA 온라인 진입: `public/app-live.html`
- latest: `public/reports/latest.html`
- 안정판: **`public/reports/stable-v042.html`**
- UI CSS: **`public/assets/app-v42.css`**
- UI/render JS: **`public/assets/app-v42.js`**

`app-live.html`과 `latest.html`은 현재 v0.4.2 안정판으로 연결한다.

## 13. 데이터 자동화
자동화 ID: `6a847ce3f5dc81918ccab0a7bafaa8fe`

매시간 수정 가능:
- `public/data/latest.json`
- `public/data/live/intraday.json`
- `public/data/live/phase-status.json`
- 당일 archive JSON

수정 금지:
- HTML
- JS
- CSS
- VERSION
- handoff UI 구조

별도 계산:
- `cycle-history.json`
- `compounder-returns.json`

## 14. APK 완료 정의
Android workflow는 v0.4.2 standalone 파일이 존재하고 stable HTML에 구형 runtime chain이 다시 들어오지 않았는지 검사한다.

현재 v0.4.2 Android build 성공 기록:
- run id: `32320593581`
- artifact: `MarketRadar-v0.4.2-debug-apk`

**완료 = Browser QA 성공 + Android Actions 성공 + Artifact 실제 존재 + APK 직접 다운로드/무결성 확인 + 사용자에게 파일 직접 제공.**
