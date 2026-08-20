# Market Radar 운영 인수인계 — CURRENT

기준 버전: **v0.4.3 / MR043**  
기준일: **2026-08-20 KST**  
저장소: `kimjae134679/stock` (Public)

> **v0.4.2 / MR042는 사용자가 직접 “오랜만에 다 잘 보인다”고 확인한 immutable Known-Good 롤백 기준판이다.** v0.4.3은 그 구조를 유지한 채 정보 고봉밥·중복을 정리하고 desktop/mobile QA를 통과한 현재 배포판이다.

## 0. 기준판
- 현재 배포: **v0.4.3 / MR043**
- 현재 안정 진입: `public/reports/stable-v043.html`
- 현재 renderer: `public/assets/app-v43.js`
- CSS: `public/assets/app-v42.css` + `public/assets/app-v43.css`
- **절대 보존 롤백:** `public/reports/stable-v042-baseline.html`
- Known-Good renderer/CSS: `public/assets/app-v42.js`, `public/assets/app-v42.css`

v0.4.3에서 문제가 생기면 복구 스크립트를 추가하지 말고 v0.4.2 baseline과 비교/회귀한다.

## 1. 절대 원칙
1. 매시간 시장 자동화는 JSON만 갱신한다. HTML/JS/CSS/VERSION 수정 금지.
2. 기능 삭제로 안정화하지 않는다.
3. 모바일/PC 정보량은 동일하다.
4. 자체 `1시간/일봉/주봉/월봉` 버튼은 다시 만들지 않는다.
5. 로딩은 실제 단계 기반이며 100% 뒤 `#loadWrap` 전체가 높이 0으로 사라진다.
6. 최상단 micro build mark 유지. v0.4.3 = `MR043`, 롤백 v0.4.2 = `MR042`.
7. UI 변경은 desktop + mobile Chromium QA 통과 전 완료로 판단하지 않는다.
8. APK 완료 = Browser QA 성공 + Android Actions 성공 + Artifact 확인 + APK 직접 확보 후 사용자 제공.
9. 여러 DOM 보정/복구 스크립트를 다시 겹쳐 올리지 않는다.

## 2. 구조
v0.4.3은 **단일 renderer 소유권**을 유지한다.
- `app-v43.js`: 데이터 로드, 16개 섹션 렌더, quicknav, fold, modal, Android Back bridge, tabs, lazy TradingView, optional phase/cycle/returns, progress, 구조검증 전부 소유.
- `app-v42.css`: v0.4.2 Known-Good 기본 레이아웃.
- `app-v43.css`: 정보 계층/밀도만 보강. section 위치를 transform/translate로 보정하지 않는다.

안정 진입점에 다시 올리면 안 되는 레거시 체인:
`full-recovery-v22.js`, `evaluation-v26.js`, `ui-v30.js`, `layout-v36.js`, `phase-status-v29.js`, `interaction-v40/v41`, `flow-guard-v40`, `integrity-v38/v39/v40`, 과거 cache/watchdog DOM mutator.

## 3. 필수 16개 섹션
`themes, action, charts, picks, mr-famous, mr-compounders, mr-universe, expanded, etfs, allocation, research, smart-money, sources, history, replay, macro`

모두 실제 DOM에 존재해야 한다.

## 4. v0.4.3 고봉밥/중복 정리 규칙
정보는 삭제하지 않고 **첫 화면은 스캔 가능하게, 상세는 필요할 때 펼쳐서** 보이게 한다.

### 상단 Hero
- header에 이미 갱신시각이 있으므로 Hero 안의 raw ISO `최신 데이터 · 2026-...T...` 중복 표시 금지.
- `시장 핵심 평가`와 `지금 할 일`을 분리.
- 운용모드는 작은 badge.
- 유사 장세는 `<details>`로 접어 보존.

### 독립 Phase
- Hero 시장요약과 중복되는 `phase-status.summary`를 다시 표시하지 않는다.
- 각 segment는 `이름 / Phase / 그래서 지금은?`만 짧게 표시.

### 행동 가이드
- 현재 구간만 크게 표시.
- `확대 조건`, `피할 것`을 별도 칸으로 표시.
- 나머지 7개 시장 구간은 `<details>` 아래에 보존.
- 모든 카드에 `이 구간에 들어오면...` 같은 무의미한 반복 문구를 쓰지 않는다.

### 종목판
- 목록에서는 `Phase + 행동`만 badge로 표시.
- 긴 `note`는 종목 상세 modal에 남긴다.

### 기타
- 숨은테마: `핵심 / 위험` 구분.
- 리서치: `기관 / 신뢰 / 근거 / 지금` 구분.
- Macro object를 `JSON.stringify` 원문 덩어리로 표시하지 않고 key/value 구조로 렌더.
- 역사 cycle의 과거 30개 swing table은 상세 `<details>`에 보존.
- 페이지 끝의 `✓ 전체 대시보드 렌더링 완료` 같은 사용자에게 의미 없는 완료문구는 제거.

## 5. 생성 텍스트 길이 규칙
UI 직접 노출 텍스트는 짧게 작성하고 상세 근거는 `changes`, `research`, `data_status`, `reference_sources`에 둔다.
- `market.summary`: 2~3문장, 약 220자 이내
- `market.final_action`: 행동 최대 3개, 약 180자 이내
- `market.next_trigger`: 한 줄
- `themes[].action`: 약 70자 이내
- `expanded_themes[].thesis/risk`: 각 1문장
- `research[].take`: 약 180자 이내
- `research[].action`: 약 90자 이내
- `research_consensus.conclusion`: 약 220자 이내
- `research_consensus.action`: 약 120자 이내
- `macro` 각 항목: 약 180자 이내
- phase segment action: 약 80자 이내

## 6. 접기/펼치기 계약
- `document` delegated click 한 계층.
- v0.4.3 fold prefix: `mr:fold:v043:`.
- collapsed body = display:none + 높이 0.
- expanded = normal document flow.
- transform/translate/absolute gap repair 금지.

## 7. 로딩 계약
1. 실제 단계만 % 증가.
2. 16개 섹션 + Hero 요약 + action focus + fold buttons 검증.
3. `100.000%`.
4. 약 0.26초 뒤 `#loadWrap` 전체 hidden/display:none + margin/padding/height 0.
5. phase/cycle/returns optional 데이터는 core 완료를 막지 않는다.

## 8. 성능 계약
- TradingView iframe 초기 대량 생성 금지.
- folded section 내부 chart 미생성.
- viewport 근처 lazy load.
- 1Y/2Y/3Y/5Y 수익률은 `compounder-returns.json` 1회.
- cycle은 `cycle-history.json` 읽기 전용.
- optional 실패가 core UI를 제거하면 안 된다.

## 9. Browser QA
### v0.4.3 candidate QA
Workflow: `.github/workflows/dashboard-qa-v43.yml`  
Script: `scripts/qa-dashboard-v43.mjs`  
성공 run: **32329459767**

Desktop `1440×1000`, Mobile `390×844` Chromium에서 확인:
- 16개 섹션
- loadWrap 실제 높이 0
- compact Hero 구조
- raw ISO 중복 없음
- 유사장세 기본 접힘
- phase summary 중복 제거
- action compact guide
- 종목 badge 구조
- Macro raw JSON 없음
- 의미없는 endmark 없음
- fold 실제 클릭
- modal 실제 열기/닫기
- blank panel 없음
- horizontal overflow 없음

## 10. Android Back
- modal 열림 → hardware Back = modal 닫기
- root → `앱을 종료하시겠습니까?`
- 명시적 종료만 exit

## 11. 진입 구조
- `public/index.html`
- `public/app-live.html`
- `public/reports/latest.html`
- 현재: `public/reports/stable-v043.html`
- immutable rollback: `public/reports/stable-v042-baseline.html`

## 12. 데이터 자동화
Automation ID: `6a847ce3f5dc81918ccab0a7bafaa8fe`

매시간 수정 가능:
- `public/data/latest.json`
- `public/data/live/intraday.json`
- `public/data/live/phase-status.json`
- 당일 archive

수정 금지:
- HTML/JS/CSS/VERSION
- `stable-v042-baseline.html`
- handoff UI 구조

## 13. 절대 삭제 금지 기능
시장 Hero, 독립 Phase, `그래서 지금은?`, 현재 테마, 시장 구간 행동 가이드, 시간별 매수타이밍/QQQ 가격, 큰 TradingView, 종목/ETF, 유명주, 우상향 후보와 1/2/3/5년 수익률, 전체추적 테마별/전체, 숨은테마, ETF, 비중, 리서치, 기관, 원문, 검증, Replay, 거시, fold, modal, Android Back, 역사 cycle, 실제 progress, micro build mark.

## 14. 회귀 절차
새 UI가 깨지면:
1. `stable-v042-baseline.html` + `app-v42.js/app-v42.css`와 비교.
2. 복구 script를 새로 얹지 않는다.
3. 문제 변경만 제거하거나 v0.4.2로 회귀.
4. desktop/mobile Browser QA 재통과.
5. 그 뒤에만 배포.
