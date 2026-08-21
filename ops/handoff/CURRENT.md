# Market Radar 운영 인수인계 — CURRENT

기준 배포: **v0.4.6 / MR046**  
기준일: **2026-08-21 KST**  
저장소: `kimjae134679/stock` (Public)

> **v0.4.2 / MR042는 사용자가 직접 정상 작동을 확인한 immutable Known-Good 롤백 기준판이다.** v0.4.6은 v0.4.4 안정 core renderer를 유지한 채 v0.4.5의 점수/장중/문구 개선과 v0.4.6의 정확한 날짜·실제 거래일 풀 사이클 비교를 additive enhancement로 보강한다.

## 0. 현재 기준
- 배포: **v0.4.6 / MR046**
- 안정 진입: `public/reports/stable-v046.html`
- core renderer: `public/assets/app-v44.js`
- v0.4.5 enhancement: `public/assets/app-v45-enhance.js`
- v0.4.6 cycle detail: `public/assets/app-v46-enhance.js`
- CSS: `app-v42.css + app-v43.css + app-v44.css + app-v45.css + app-v46.css`
- live/latest/index 모두 v0.4.6으로 연결
- immutable rollback: `public/reports/stable-v042-baseline.html`

## 1. 절대 원칙
1. 매시간 시장 자동화는 JSON만 갱신. HTML/JS/CSS/VERSION 수정 금지.
2. 기능 삭제로 안정화 금지.
3. 모바일/PC 정보량 동일.
4. 자체 `1시간/일봉/주봉/월봉` 버튼 복원 금지.
5. 로딩 100% 뒤 `#loadWrap` 전체 높이 0. 빈 칸 남기지 않음.
6. micro build mark 유지: 현재 `MR046`, 롤백 `MR042`.
7. 실제 desktop 1440×1000 + mobile 390×844 Chromium QA 통과 전 완료 선언 금지.
8. Playwright는 `browser.newPage({viewport:{width,height}})` 사용. `viewportSize` 금지.
9. APK 완료 = Browser QA 성공 + Android Actions 성공 + Artifact 확인 + APK 직접 확보/검증 + 사용자에게 파일 제공.
10. 과거 full-recovery/evaluation/layout/integrity/flow-guard 체인을 안정 진입점에 다시 겹쳐 올리지 않는다.
11. transform/translate로 section gap을 숨기지 않는다.

## 2. 구조
`app-v44.js`가 핵심 DOM/interaction 소유권을 유지한다.
- 17개 섹션 렌더
- quicknav/fold/modal/Android Back/tabs
- lazy TradingView
- progress/구조검증

`app-v45-enhance.js`는 다음만 보강한다.
- 숫자에 `/100 + 말뜻` 추가
- 위험관리 문구를 명령조가 아닌 조건부 표현으로 정리
- 장중 그래프를 Nasdaq/S&P500/Dow 실제 등락률 % 중심으로 교체
- 기본 풀 사이클/변곡점 UI

`app-v46-enhance.js`는 **v0.4.5 cycle render가 끝난 뒤** 로드한다. race 방지를 위해 stable-v046.html에서 v45 cycle DOM이 생긴 뒤 동적 로드한다.
- `cycle-full.json`의 실제 일별 sampled path 사용
- x축 = 실제 거래일 수, y축 = 시작 저점 대비 누적 등락률 %
- 정확한 저점/고점/다음 저점 날짜 노출
- 대표 과거 12개 사이클 카드
- 현재와 과거 완결 사이클 유사도
- ticker modal에도 같은 상세 cycle 뷰
- 변곡점 라이브러리 확대

일반 DOM을 지속 감시/재배치하는 watchdog 금지. MutationObserver는 modal open 감지에만 사용.

## 3. 필수 17개 섹션
`themes, action, cycle-visual, charts, picks, mr-famous, mr-compounders, mr-universe, expanded, etfs, allocation, research, smart-money, sources, history, replay, macro`

## 4. 가독성 / 문구 규칙
- Hero: 시장 핵심 평가 / 지금 할 일 / 피할 것 / 5개 score.
- 유사 장세는 details.
- 독립 Phase는 Hero 요약 반복 금지.
- 행동 가이드는 현재 구간만 강조.
- 종목판은 phase/action badge 중심, 긴 note는 modal.
- Macro raw JSON 표시 금지.
- `70` 같은 숫자만 단독 표시하지 않는다. 예: `70 /100 · 높은 편`.

### 위험관리 문구
금지 예: `3x 사지마`, `3배 사지 마`, `레버리지 사지 마`, `매수 금지`.
권장: `추격 진입과 급락 직후 성급한 비중 확대는 피하고, 추세·상대강도 회복을 확인한 뒤 단계적으로 접근`.
레버리지 자체를 일괄 금지하지 않고 기초지수/변동성/추세 회복 조건을 설명한다.

## 5. 풀 사이클 비교 — v0.4.6
사용자 기준 순서: **저점 → 상승 → 고점 → 하락 → 저점 → 다음 상승**.

v0.4.5의 0~100 정규화 overlay만으로 끝내지 않는다. v0.4.6 메인 cycle 뷰는 실제 역사 데이터에 기반한다.
- QQQ 전체 범위: `1999-03-10 ~ 2026-08-20`
- 완결 QQQ cycle: **83개**
- 현재 QQQ: `2026-07-29` 저점 시작, 2026-08-20 기준 상승 17거래일차 +7.44%
- 대표 과거 12개를 실제 일별 수정주가 sampled path로 겹쳐 표시
- 각 cycle 카드에 `저점 날짜 → 고점 날짜 → 다음 저점 날짜`
- 상승 거래일/상승률, 하락 거래일/하락률, 전체 거래일, 저점→저점 수익률 표시
- 과거 이벤트 라벨은 보조 문맥이며 날짜 자체가 1차 근거
- 미래 고점/저점 날짜 예측으로 표현하지 않는다.

## 6. cycle 데이터
### Swing metadata
- builder: `scripts/build-cycle-history.mjs`
- output: `public/data/cycle-history.json`
- assets: **92**, errors: **0**

### Detailed full-cycle paths
- builder: `scripts/build-cycle-full.mjs`
- output: `public/data/cycle-full.json`
- assets: **13**, errors: **0**
- 대상: QQQ/SPY/SMH/SOXX/TQQQ/SOXL/IGV/GRID/ANET/NVDA/AVGO/MSFT/GOOGL
- representative cycle path는 실제 일별 수정주가를 최대 90포인트로 샘플링
- current_full path도 실제 일별 경로
- combined cycle payload: **3,610,293 bytes**
- combined 9MB 초과 시 CI 실패

둘 다 `.github/workflows/cycle-history.yml`에서 함께 생성한다. 매시간 시장 자동화가 덮어쓰면 안 된다.

## 7. 변곡점 라이브러리
- `cycle-history.json` 92자산의 swing endpoint를 자동 수집.
- 고점/저점 날짜, swing 거래일, 등락률 표시.
- 큰 변곡점 40건 즉시 노출, 추가 160건 details.
- 현재 QQQ와 닮은 완결 사이클 12개를 저점→고점→저점 날짜까지 비교.
- 기존 지정 변곡점 전략검증은 삭제하지 않고 details에 보존.

## 8. 장중 그래프
- Nasdaq / S&P500 / Dow 실제 검증 장중 등락률 `%`.
- y축 단위 `%`, 0% 위 상승/아래 하락.
- `상승 확대 / 상승 둔화 / 하락 확대 / 낙폭 축소` 표시.
- 미10년물은 별도 카드.
- QQQ 실제 TradingView는 details 아래 보존.

## 9. Browser QA
Workflow: `.github/workflows/dashboard-qa-v46.yml`  
Script: `scripts/qa-dashboard-v46.mjs`

최신 성공 run: **32436106342**.
검사:
- desktop 1440×1000 / mobile 390×844
- load-collapse
- actual-trading-day-axis
- exact-turning-dates
- real-sampled-paths
- 12-cycle-cards
- expanded-turning-library
- modal-cycle-detail
- blank-panel
- overflow

중요 회귀: v0.4.6 첫 QA에서 v45/v46 비동기 race로 v46 cycle 카드가 v45 render에 다시 덮이는 문제를 발견했다. stable-v046.html에서 v45 cycle DOM 생성 후 v46 script를 로드하도록 수정한 뒤 run 32436106342 성공.

## 10. Android / APK
v0.4.6 Android run: **32436106329**, success.  
Artifact ID: **9430839947**  
Artifact: `MarketRadar-v0.4.6-debug-apk`

직접 확보 APK:
- size: **5,319,010 bytes**
- SHA-256: `8ca0b44aa65c2c3587c93af84c6373e1c347ed7e6d4a171e678e07921928fc89`

## 11. Android Back 계약
- modal open → hardware Back = modal 닫기
- root → `앱을 종료하시겠습니까?`
- 명시적 `종료`만 exit

## 12. 매시간 자동화
Automation ID: `6a847ce3f5dc81918ccab0a7bafaa8fe`

수정 가능:
- `public/data/latest.json`
- `public/data/live/intraday.json`
- `public/data/live/phase-status.json`
- 당일 archive JSON

수정 금지:
- HTML/JS/CSS/VERSION
- `cycle-history.json`
- `cycle-full.json`
- `compounder-returns.json`
- `stable-v042-baseline.html`

## 13. 회귀 절차
1. v46 enhancement 격리 → v45 확인.
2. v45 enhancement 격리 → v44 core 확인.
3. core 문제면 v0.4.2 immutable baseline과 비교.
4. 실제 desktop/mobile Browser QA.
5. cycle 변경 시 exact-date/path/payload QA.
6. Android 변경 시 APK 직접 확보 + 내부 assets/SHA 검증.
