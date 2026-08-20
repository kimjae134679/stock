# Market Radar 운영 인수인계 — CURRENT

기준 배포: **v0.4.5 / MR045**  
기준일: **2026-08-21 KST**  
저장소: `kimjae134679/stock` (Public)

> **v0.4.2 / MR042는 사용자가 직접 정상 작동을 확인한 immutable Known-Good 롤백 기준판이다.** 현재 v0.4.5는 v0.4.4 안정 core renderer를 그대로 유지하고, 풀 사이클·점수 해석·장중 방향성·대량 변곡점 비교를 additive enhancement로 보강한다.

## 0. 기준판
- 현재 배포: **v0.4.5 / MR045**
- 현재 진입: `public/reports/stable-v045.html`
- core renderer: `public/assets/app-v44.js`
- v0.4.5 enhancement: `public/assets/app-v45-enhance.js`
- CSS: `app-v42.css` + `app-v43.css` + `app-v44.css` + `app-v45.css`
- live: `public/app-live.html` → `stable-v045.html`
- latest: `public/reports/latest.html` → `stable-v045.html`
- **immutable rollback:** `public/reports/stable-v042-baseline.html`

## 1. 절대 원칙
1. 매시간 시장 자동화는 JSON만 갱신한다. HTML/JS/CSS/VERSION 수정 금지.
2. 기능 삭제로 안정화하지 않는다.
3. 모바일/PC 정보량 동일.
4. 자체 `1시간/일봉/주봉/월봉` 버튼은 복원하지 않는다.
5. 로딩 100% 뒤 `#loadWrap` 전체가 높이 0으로 사라져 빈 칸을 남기지 않는다.
6. micro build mark 유지: 현재 `MR045`, 롤백 `MR042`.
7. UI 변경은 실제 desktop 1440×1000 + mobile 390×844 Chromium QA 통과 전 완료로 판단하지 않는다.
8. **Playwright viewport 옵션은 반드시 `browser.newPage({viewport:{width,height}})`를 사용한다. `viewportSize`는 Browser.newPage에서 무시되어 기본 1280px로 테스트되는 회귀가 있었으므로 금지.**
9. APK 완료 = Browser QA 성공 + Android Actions 성공 + Artifact 확인 + APK 직접 확보/검증 + 사용자에게 직접 파일 제공.
10. 과거 full-recovery/evaluation/layout/integrity/flow-guard 체인을 안정 진입점에 겹쳐 올리지 않는다.
11. section 위치를 transform/translate로 보정해 빈 공간을 숨기지 않는다.

## 2. 구조
`app-v44.js`가 핵심 DOM/interaction을 계속 소유한다.
- latest/intraday 핵심 데이터 로드
- 17개 섹션 렌더
- quicknav / fold / modal / Android Back bridge / tabs
- lazy TradingView
- optional phase/cycle/returns
- progress / 구조 검증

`app-v45-enhance.js`는 핵심 renderer를 재실행하지 않고 다음만 보강한다.
- 점수에 `/100 + 말뜻` 추가
- 위험관리 문구를 중립적 조건부 표현으로 정리
- 장중 그래프를 `% 단위 지수 방향` 중심으로 교체
- 완결 역사 swing metadata로 풀 사이클 비교 재구성
- 과거 변곡점 대량 추출/유사 구간 비교
- ticker/theme modal의 cycle slot을 풀 사이클 뷰로 보강

일반 DOM을 지속 감시·재배치하는 watchdog/MutationObserver 금지. v0.4.5의 MutationObserver는 **modal open 상태 감지**에만 사용한다.

## 3. 필수 17개 섹션
`themes, action, cycle-visual, charts, picks, mr-famous, mr-compounders, mr-universe, expanded, etfs, allocation, research, smart-money, sources, history, replay, macro`

## 4. 고봉밥 / 점수 해석 규칙
정보를 삭제하지 않고 첫 화면을 스캔 가능하게 만든다.
- Hero: 시장 핵심 평가 / 지금 할 일 / 피할 것 / 5개 score.
- 유사 장세는 details 아래.
- 독립 Phase는 Hero 요약을 반복하지 않는다.
- 행동 가이드는 현재 구간만 강조, 나머지 구간은 details.
- 종목판은 phase/action badge 중심, 긴 note는 modal.
- 숨은테마는 핵심/위험 분리.
- Macro object는 raw JSON 문자열 대신 key/value UI.
- 사용자에게 의미 없는 렌더링 완료 문구 금지.

### 숫자만 보여주지 않는다
`70`, `49` 같은 숫자만 단독 노출하지 않고 가능한 경우 다음처럼 표시한다.
- `70 /100 · 높은 편`
- `24 /100 · 신호 적음`
- `74 /100 · 진입여건 양호`
- `81 /100 · 과열 매우 높음`

점수는 가격이나 확률이 아니라 내부 상대평가 점수라는 맥락이 보여야 한다.

### 위험관리 문구
명령조/훈계조 금지.
- 금지 예: `3x 사지마`, `3배 사지 마`, `레버리지 사지 마`, `매수 금지`.
- 권장: `추격 진입과 급락 직후 성급한 비중 확대는 피하고, 추세·상대강도 회복을 확인한 뒤 단계적으로 접근`.
- 레버리지 자체를 일괄 금지하지 말고 기초지수/변동성/추세 회복 조건을 설명한다.

## 5. 풀 사이클 비교 — v0.4.5
사용자 요구의 기준 순서는 **저점 → 상승 → 고점 → 하락 → 저점 → 다음 상승**이다. 현재 상승구간만 과거 상승구간과 비교하는 뷰로 끝내지 않는다.

### 시각화
- X축: 정규화된 풀 사이클 단계 0~100.
- Y축: 직전 저점 대비 누적 등락률 %.
- 배경 구간: 상승 / 고점 / 하락 / 저점 / 다음 상승.
- 과거 완결 cycle: 기존 history의 연속 `상승 + 하락` swing을 한 묶음으로 재구성.
- 현재 cycle: 현재까지 진행한 구간만 굵은 선으로 표시.
- 현재 위치: `30/100 · 상승 중반`처럼 숫자 + 말뜻 동시 표시.
- historical overlay는 미래 예측선이 아니라 위치 비교용이다.
- 상세 modal에도 동일한 full-cycle view를 제공한다.

### 요약 지표
- 전체 사이클 위치 `/100`
- 현재 상승/하락 N거래일차 + 현재 %
- 과거 상승 중앙 기간 + 중앙 상승폭
- 과거 하락 중앙 기간 + 중앙 하락폭
- 테마 proxy별 full-cycle 위치

Theme proxy 핵심:
- index → QQQ
- compute → SMH
- network → ANET
- software → IGV
- power → GRID
- aggressive → SOXL
- defense → SHLD

## 6. 역사 데이터 / payload
- builder: `scripts/build-cycle-history.mjs`
- output: `public/data/cycle-history.json`
- workflow: `.github/workflows/cycle-history.yml`
- source: Yahoo Finance query1 → query2 → Stooq fallback
- 가능한 전체 일별 adjusted-close history 사용.
- ZigZag 설명용 반전 기준: ETF 약 8%, 일반 종목 약 12%, TQQQ/SOXL 약 18%.
- 모든 swing의 방향/시작일/종료일/거래일/달력일/등락률 metadata 전부 보존.
- visual path는 current + 최대 8 largest declines + 최대 8 largest rallies, path 최대 60포인트.
- cycle payload 8MB 초과 시 CI 실패.

현재 검증값:
- assets: **92**
- errors: **0**
- cycle-history: **3,054,462 bytes**

과거 평균/중앙값은 미래 종료일을 확정하는 예측으로 표현하지 않는다.

## 7. 변곡점 비교 — v0.4.5
`history` 섹션은 더 이상 소수 수동 검증점만 보여주는 공간이 아니다.
- QQQ/SPY/SMH/SOXX/TQQQ/SOXL/IGV/ANET의 역사 swing endpoint를 자동 수집.
- 고점/저점 날짜, 해당 swing의 거래일, 등락률을 표시.
- 큰 변곡점을 우선 노출하고 추가 목록은 details 아래 보존.
- 현재 QQQ와 같은 방향의 과거 구간을 기간/등락폭 기준으로 유사도 비교.
- 기존 지정 변곡점 전략검증은 삭제하지 않고 별도 details에 보존.

향후 변곡점 pool을 넓힐 때도 `cycle-history.json`의 92자산 metadata를 활용하고, DOM에 수천 행을 한꺼번에 렌더하지 않는다.

## 8. 장중 그래프 — v0.4.5
기존 `시장 매수타이밍 숫자 선 + QQQ 가격 선`은 단위와 의미가 불명확해 주요 시각화에서 제외했다.

현재 주요 장중 뷰:
- Nasdaq / S&P500 / Dow의 실제 검증된 장중 등락률 `%`.
- Y축에 `%`를 명시.
- 0% 위 = 상승 / 아래 = 하락.
- 첫 검증값 대비 `상승 확대 / 상승 둔화 / 하락 확대 / 낙폭 축소` 문구.
- 미10년물은 가격선과 섞지 않고 별도 `%` 카드.
- 매수환경/시장위험/추세확인은 `/100 + 말뜻`으로 보조 표시.
- QQQ 실제 일봉 TradingView는 삭제하지 않고 `QQQ 실제 일봉 차트 보기` details 아래 보존.

## 9. Browser QA
Workflow: `.github/workflows/dashboard-qa-v45.yml`  
Script: `scripts/qa-dashboard-v45.mjs`

최신 **실제 viewport** 성공 run: **32404005164**.
- desktop: 1440×1000 실제 확인
- mobile: 390×844 실제 확인
- load-collapse
- semantic-scores
- friendly-avoid
- full-cycle-wave
- intraday-percent-units
- turning-point-library
- modal-full-cycle
- fold-toggle
- blank-panel
- overflow

QA screenshot artifact: **9419583845**.

중요 회귀 기록: 초대 v0.4.5 QA에서 `viewportSize` 옵션 때문에 desktop/mobile 모두 실제로 1280px 기본 viewport로 찍힌 것을 재검토 중 발견했다. `viewport` 옵션으로 수정한 뒤 run 32404005164에서 실제 1440/390 폭을 강제 검증하고 다시 성공했다.

## 10. Android / APK
v0.4.5 Android run: **32403773940**, success.  
Artifact ID: **9419557958**  
Artifact: `MarketRadar-v0.4.5-debug-apk`

직접 확보/검증한 APK:
- size: **5,130,671 bytes**
- SHA-256: `cabb0fd3961c3da9ac9cce7cff4a4f52eaf03fb1c985859ca6668f7876a251b6`

APK 내부 확인:
- `assets/public/reports/stable-v045.html`
- `assets/public/assets/app-v45-enhance.js`
- `assets/public/assets/app-v45.css`
- `assets/public/data/cycle-history.json` = 3,054,462 bytes
- `assets/public/reports/stable-v042-baseline.html`

## 11. Android Back 계약
- modal open → hardware Back = modal 닫기
- root → `앱을 종료하시겠습니까?`
- 명시적 `종료`만 exit

## 12. 데이터 자동화
Automation ID: `6a847ce3f5dc81918ccab0a7bafaa8fe`

매시간 수정 가능:
- `public/data/latest.json`
- `public/data/live/intraday.json`
- `public/data/live/phase-status.json`
- 당일 archive JSON

수정 금지:
- HTML/JS/CSS/VERSION
- `cycle-history.json`
- `compounder-returns.json`
- `stable-v042-baseline.html`
- handoff UI 구조

자동화 생성문 역시 고봉밥 방지 및 friendly risk-copy 규칙을 따른다.

## 13. 회귀 절차
새 UI가 깨지면 복구 스크립트를 더 얹지 않는다.
1. v0.4.5 enhancement부터 격리/제거하여 v0.4.4 core 정상 여부 확인.
2. core 문제라면 `stable-v042-baseline.html` / `app-v42.js` / `app-v42.css`와 비교.
3. 실제 desktop 1440×1000 + mobile 390×844 Browser QA.
4. cycle 변경 시 metadata/payload-size/full-cycle QA.
5. Android 변경 시 APK 직접 확보 후 내부 assets 및 SHA 검증.
