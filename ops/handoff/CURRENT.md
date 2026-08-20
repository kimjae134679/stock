# Market Radar 운영 인수인계 — CURRENT

기준 버전: **v0.4.2 / MR042**  
기준일: **2026-08-20 KST**  
저장소: `kimjae134679/stock` (Public)

> **v0.4.2는 사용자가 직접 “오랜만에 다 잘 보인다”고 확인한 Known-Good 안정 기준판이다.** 이후 변경에서 문제가 생기면 이 버전 구조로 즉시 회귀한다.

## 0. Known-Good 기준 고정

- 안정 버전: **v0.4.2**
- screenshot micro mark: **MR042**
- 안정 진입: `public/reports/stable-v042.html`
- **원본 롤백 보존본: `public/reports/stable-v042-baseline.html`**
- 원본 renderer: `public/assets/app-v42.js`
- 원본 core CSS: `public/assets/app-v42.css`
- 가독성 전용 CSS: `public/assets/readability-v42.css`

`stable-v042-baseline.html`은 사용자가 정상 작동을 확인한 시점의 HTML을 그대로 보존한다. **이 파일은 수정하지 않는다.**

현재 `stable-v042.html`은 renderer를 건드리지 않고 `readability-v42.css`만 한 장 추가한 v0.4.2 가독성 정리판이다. 가독성 변경에서 문제가 생기면 stylesheet 링크만 제거하고 baseline으로 되돌릴 수 있어야 한다.

## 1. 절대 원칙

1. 매시간 시장 자동화는 JSON만 갱신한다. HTML/JS/CSS/VERSION 수정 금지.
2. 기능 삭제로 안정화하지 않는다.
3. 모바일/PC 정보량은 동일하다.
4. 자체 `1시간/일봉/주봉/월봉` 버튼은 다시 만들지 않는다.
5. 로딩은 실제 단계 기반 `00.001%` 형식이며 100% 뒤 `#loadWrap` 전체가 높이 0으로 사라져야 한다.
6. 화면 최상단 micro build mark `MR042` 유지.
7. UI 변경은 desktop + mobile Chromium QA 통과 전 완료로 판단하지 않는다.
8. APK 완료 = Browser QA 성공 + Android Actions 성공 + Artifact 확인 + APK 직접 확보 후 사용자 제공.
9. **v0.4.2 Known-Good renderer 구조를 다시 여러 보정 스크립트 체인으로 분해하지 않는다.**

## 2. 왜 v0.4.2가 안정판인가

이전 버전에서 반복된 장애:
- 화면 중간부터 통째로 빈 공간 발생
- 접기/펼치기 무반응
- 일부 섹션만 렌더
- 로딩바 72/83/90% 고착
- PC와 APK 모두 같은 웹 문서 문제 노출

근본 원인은 여러 JS가 동일 DOM을 재렌더/보정하면서 서로 충돌한 구조였다.

v0.4.2에서는 `app-v42.js`가 다음을 단독 소유한다.
- latest/intraday 데이터 로드
- 전체 섹션 최초 렌더
- quicknav
- fold/unfold
- ticker/theme click
- modal
- Android Back bridge
- universe tabs
- lazy TradingView
- cycle/return/phase 보강
- progress 완료/실패
- 구조 검증

**DOM 생성 주체와 interaction 주체가 동일한 파일이다.**

## 3. 안정판에서 로드 금지인 레거시 DOM 보정 체인

다음 파일을 `stable-v042`에 다시 얹지 않는다.
- `full-recovery-v22.js`
- `evaluation-v26.js`
- `ui-v30.js`
- `layout-v36.js`
- `phase-status-v29.js`
- `interaction-v40.js`, `interaction-v41.js`
- `flow-guard-v40.js`
- `integrity-v38.js`, `integrity-v39.js`, `integrity-v40.js`
- 과거 `app-runtime-*`, cache/watchdog DOM mutator

특히 `transform: translateY()`로 섹션을 위로 끌어 빈 공간을 감추는 구현은 금지한다.

## 4. 필수 16개 섹션

`themes, action, charts, picks, mr-famous, mr-compounders, mr-universe, expanded, etfs, allocation, research, smart-money, sources, history, replay, macro`

모두 실제 DOM에 존재해야 한다.

### action 회귀 방지
- `#action .mr-body` 실제 내용 필수
- bordered empty panel 금지
- 접기 → body 실제 높이 0
- 펼치기 → 본문 실제 높이 복구

## 5. 로딩 영역 계약

1. 실제 완료 단계만 % 증가.
2. renderer 완료 후 16개 섹션과 action body, fold buttons 검증.
3. `100.000%` 표시.
4. 약 0.26초 뒤 **`#loadWrap` 전체**를 hidden/display:none.
5. margin/padding/height도 0.

로딩 bar만 투명하게 만들어 빈 자리를 남기지 않는다.

## 6. 가독성 / 고봉밥 방지 규칙

사용자는 정보 삭제가 아니라 **정리된 정보 밀도**를 원한다.

### 현재 UI 규칙
`readability-v42.css`는 renderer/DOM/event를 절대 소유하지 않고 **시각 계층만 담당**한다.

- Hero의 긴 시장평가와 행동 코멘트를 서로 다른 카드처럼 분리.
- `시장 핵심 평가` / `지금 할 일` 시각 계층 제공.
- action Phase 카드 4열 고봉밥을 2열 중심으로 정리하고 현재 활성구간을 넓게 표시.
- Research / Macro / Smart-money / Hidden-theme 장문은 제목-근거-행동이 구분되도록 여백과 배경 분리.
- 모바일은 한 열로 자연스럽게 내려감.
- 내용을 line-clamp로 잘라서 숨기지 않는다.
- CSS로 section 높이/위치를 강제 이동하지 않는다.

### 매시간 생성 텍스트 길이 규칙
UI에 직접 노출되는 필드는 짧게 작성하고 상세 근거는 별도 상세 필드에 둔다.

- `market.summary`: 2~3문장, 약 220자 이내
- `market.final_action`: 핵심 행동 최대 3개, 약 180자 이내
- `market.next_trigger`: 한 줄
- `themes[].action`: 약 70자 이내
- `expanded_themes[].thesis/risk`: 각각 한 문장
- `research[].take`: 약 180자 이내
- `research[].action`: 약 90자 이내
- `research_consensus.conclusion`: 약 220자 이내
- `research_consensus.action`: 약 120자 이내
- `macro` 각 항목: 약 180자 이내
- Phase summary 약 220자, segment action 약 80자 이내

중요 정보는 삭제하지 말고 `changes`, `research`, `data_status`, `reference_sources` 등 상세 필드로 이동한다.

## 7. 접기/펼치기 계약

- `document` delegated click 한 계층.
- 상태 prefix `mr:fold:v042:`.
- collapsed `.mr-body`는 display:none + height 0.
- expanded는 normal document flow.
- transform/translate/absolute 위치 보정 금지.

## 8. 성능 계약

- TradingView iframe 초기 동시 대량 생성 금지.
- folded section 내부 chart 미생성.
- viewport 근처에서 lazy load.
- 1Y/2Y/3Y/5Y 수익률은 `compounder-returns.json` 1회.
- cycle은 `cycle-history.json` 읽기 전용.
- optional data 실패가 core 화면을 삭제하면 안 됨.

## 9. 역사적 상승/하락 주기 — 삭제 금지

표시 목표:
- 현재 상승/하락 N거래일차
- 현재 변화율
- 과거 같은 방향 평균/중앙값 일차
- 기간/변화폭/종합 진행도
- 상승/하락 초반·중반·후반·평균기간 초과 위치
- 과거 시작일/종료일/거래일/등락률

데이터가 없으면 숫자를 지어내지 않는다.

## 10. Browser QA

Workflow: `.github/workflows/dashboard-qa.yml`  
Script: `scripts/qa-dashboard-v42.mjs`

Desktop `1440×1000`, Mobile `390×844` 실제 Chromium 검사.

필수:
- v0.4.2 / MR042
- 16개 섹션
- loadWrap 높이 0
- action body 실제 내용
- fold toggle 실제 클릭
- suspicious blank panel 없음
- folded panel 높이 잔존 없음
- readability stylesheet 실제 load
- desktop/mobile hero 가독성 레이아웃
- horizontal overflow 없음
- full page screenshots

## 11. Android Back

- modal 열림 → hardware Back = modal 닫기
- root → `앱을 종료하시겠습니까?`
- 명시적 종료만 exit

## 12. 진입 구조

- `public/index.html`
- `public/app-live.html`
- `public/reports/latest.html`
- `public/reports/stable-v042.html`
- rollback: `public/reports/stable-v042-baseline.html`

## 13. 데이터 자동화

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

## 14. 절대 삭제 금지 기능

시장 Hero, 독립 Phase, `그래서 지금은?`, 현재 테마, 행동 matrix, 시간별 매수타이밍/QQQ 가격, 큰 TradingView, 종목/ETF, 유명주, 우상향 후보와 1/2/3/5년 수익률, 전체추적 테마별/전체, 숨은테마, ETF, 비중, 리서치, 기관, 원문, 검증, Replay, 거시, fold, modal, Android Back, 역사 cycle, 실제 progress, micro build mark.

## 15. Known-Good 회귀 절차

새 수정에서 화면이 다시 깨지면 패치를 더 얹지 않는다.

1. `stable-v042-baseline.html`과 `app-v42.js/app-v42.css`를 기준으로 비교.
2. readability 문제가 의심되면 `readability-v42.css` 링크부터 제거해 core renderer 정상 여부 확인.
3. renderer 자체를 변경했다면 v0.4.2 renderer로 회귀.
4. desktop/mobile Browser QA 통과.
5. 그 뒤에만 다시 배포.
