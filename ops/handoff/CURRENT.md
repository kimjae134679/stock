# Market Radar 운영 인수인계 — CURRENT

기준 배포: **v0.4.7 / MR047**  
기준일: **2026-08-21 KST**  
저장소: `kimjae134679/stock` (Public)

> **v0.4.2 / MR042는 사용자가 직접 정상 작동을 확인한 immutable Known-Good 롤백 기준판이다.** v0.4.7은 v0.4.4 안정 core renderer를 유지한 채 v0.4.5의 점수/장중/문구 개선, v0.4.6의 정확한 날짜·실제 거래일 풀 사이클, v0.4.7의 연도별 색상·현재 동일 거래일 비교를 additive enhancement로 보강한다.

## 0. 현재 기준
- 배포: **v0.4.7 / MR047**
- 안정 진입: `public/reports/stable-v047.html`
- core renderer: `public/assets/app-v44.js`
- v0.4.5 enhancement: `public/assets/app-v45-enhance.js`
- v0.4.6 exact cycle: `public/assets/app-v46-enhance.js`
- v0.4.7 readability/current-point: `public/assets/app-v47-enhance.js`
- CSS: `app-v42.css + app-v43.css + app-v44.css + app-v45.css + app-v46.css + app-v47.css`
- live/latest/index 모두 v0.4.7으로 연결
- immutable rollback: `public/reports/stable-v042-baseline.html`

## 1. 절대 원칙
1. 매시간 시장 자동화는 JSON만 갱신. HTML/JS/CSS/VERSION 수정 금지.
2. 기능 삭제로 안정화 금지.
3. 모바일/PC 정보량 동일.
4. 자체 `1시간/일봉/주봉/월봉` 버튼 복원 금지.
5. 로딩 100% 뒤 `#loadWrap` 전체 높이 0. 빈 칸 남기지 않음.
6. micro build mark 유지: 현재 `MR047`, 롤백 `MR042`.
7. 실제 desktop 1440×1000 + mobile 390×844 Chromium QA 통과 전 완료 선언 금지.
8. Playwright는 `browser.newPage({viewport:{width,height}})` 사용. `viewportSize` 금지.
9. APK 완료 = Browser QA 성공 + Android Actions 성공 + Artifact 확인 + APK 직접 확보/검증 + 사용자에게 파일 제공.
10. 과거 full-recovery/evaluation/layout/integrity/flow-guard 체인을 안정 진입점에 다시 겹쳐 올리지 않는다.
11. transform/translate로 section gap을 숨기지 않는다.
12. 사용자 UI에서 `3x 사지마`, `매수 금지` 같은 명령조 위험문구를 쓰지 않는다. 조건/이유 중심 중립 표현을 사용한다.

## 2. 구조
`app-v44.js`가 핵심 DOM/interaction 소유권을 유지한다.
- 17개 섹션 렌더
- quicknav/fold/modal/Android Back/tabs
- lazy TradingView
- progress/구조검증

`app-v45-enhance.js`
- 숫자에 `/100 + 말뜻` 추가
- 위험관리 문구를 조건부 표현으로 정리
- 장중 그래프를 Nasdaq/S&P500/Dow 실제 등락률 % 중심으로 교체
- 기본 풀 사이클/변곡점 UI

`app-v46-enhance.js`
- `cycle-full.json` 실제 sampled path 사용
- x축 실제 거래일, y축 시작 저점 대비 누적 등락률
- 정확한 저점/고점/다음 저점 날짜
- 대표 과거 12개 사이클 카드
- ticker modal 동일 상세 cycle
- 변곡점 라이브러리 확대

`app-v47-enhance.js`
- 대표 과거 12개 사이클을 **서로 다른 색**으로 표시
- 각 색에 `#번호 · 연도(또는 연도→연도) · 저점/고점/다음 저점 날짜` legend 제공
- 현재 QQQ 실제 경로는 굵은 초록선
- **현재와 같은 N번째 거래일을 모든 과거 사이클에 색상 ●로 찍음**
- 과거 선은 현재 동일 거래일까지 실선, 그 이후 실제 역사 경로는 점선
- 점선 이후는 미래 예측이 아니라 그 과거 사이클에서 실제 발생한 경로라고 반드시 표시
- `현재 비교`와 `전체` 두 실제 거래일 범위 제공
- 기본 `현재 비교` 범위는 현재 point가 너무 왼쪽에 눌리지 않도록 `max(60일, 현재일차×3, 전체 사이클 중앙기간×1.3)` 기반으로 잡는다. QQQ 현재 17일차 기준 0~60일.
- 아래 표에서 각 과거 사이클의 `같은 N일차 수익률`, 이후 실제 고점까지 남은 거래일/수익률, 이후 실제 저점까지 거래일/수익률을 표시

### 중요한 이벤트 규칙
core `app-v44.js`는 capture 단계에서 `closest('[data-ticker]')`를 ticker 클릭으로 처리한다. 따라서 **v47 내부 그래프 컨테이너/범위버튼 같은 비-ticker 컨트롤에 `data-ticker`를 사용하면 안 된다.** v0.4.7 QA에서 range 버튼 클릭이 QQQ modal을 여는 회귀를 실제 발견했고 wrapper를 `data-v47-ticker`로 변경했다.

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

## 5. 풀 사이클 비교 — v0.4.7
사용자 기준 순서: **저점 → 상승 → 고점 → 하락 → 저점 → 다음 상승**.

- QQQ 전체 역사 범위: `1999-03-10 ~ 2026-08-20`
- 완결 QQQ cycle: **83개**
- 현재 QQQ: `2026-07-29` 저점 시작, `2026-08-20` 기준 상승 17거래일차 +7.44%
- 대표 12개 과거 cycle을 실제 일별 수정주가 sampled path로 겹침
- 각 cycle을 고유 색 + 연도/날짜 legend로 식별
- 기본 화면은 현재 비교 **0~60거래일**, 전체 버튼은 약 **0~510거래일** 역사 범위
- 현재 17번째 거래일을 과거 각 선에도 동일 위치 점으로 표시
- 같은 17일차 이후 과거 경로는 점선으로 계속 보여 전체 고점/하락/다음 저점까지 확인 가능
- 아래 비교표에서 `17일차 당시 수익률 / 이후 실제 고점 / 이후 실제 저점`을 숫자로 보여줌
- 미래 고점/저점 예측으로 표현하지 않는다.

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
- representative path는 실제 일별 수정주가를 최대 90포인트로 샘플링
- current_full path도 실제 일별 경로
- combined cycle payload: **3,610,293 bytes**
- combined 9MB 초과 시 CI 실패

둘 다 `.github/workflows/cycle-history.yml`에서 생성. 매시간 시장 자동화가 덮어쓰면 안 된다.

## 7. 변곡점 라이브러리
- `cycle-history.json` 92자산의 swing endpoint 자동 수집.
- 고점/저점 날짜, swing 거래일, 등락률 표시.
- 큰 변곡점 40건 즉시 노출, 추가 160건 details.
- 현재 QQQ와 닮은 완결 사이클 12개를 저점→고점→저점 날짜까지 비교.
- 기존 지정 변곡점 전략검증은 삭제하지 않고 details에 보존.

## 8. 장중 그래프
- Nasdaq / S&P500 / Dow 실제 검증 장중 등락률 `%`.
- y축 단위 `%`, 0% 위 상승/아래 하락.
- `상승 확대 / 상승 둔화 / 하락 확대 / 낙폭 축소` 표시.
- 미10년물 별도 카드.
- QQQ TradingView는 details 아래 보존.

## 9. Browser QA — v0.4.7
Workflow: `.github/workflows/dashboard-qa-v47.yml`  
Script: `scripts/qa-dashboard-v47.mjs`

필수 검사:
- desktop 1440×1000 / mobile 390×844
- load-collapse
- 12 colored year lines / legend
- focus range < full range
- same-current-trading-day markers
- historical continuation dashed after current-day marker
- exact current date/day/% label
- point comparison table
- ticker modal에서도 v47 cycle
- blank-panel
- document overflow 없음

v0.4.7 개발 중 QA가 실제로 `data-ticker` 이벤트 충돌을 찾아냈고 수정했다. 이후 QA 성공 run을 기준으로 완료 판단한다.

## 10. Android / APK
Android workflow: `.github/workflows/android.yml`
- stable-v047 + v47 assets 포함
- v0.4.2 rollback baseline 포함
- native Back/exit confirmation 유지
- persistent debug signing key 유지
- APK artifact: `MarketRadar-v0.4.7-debug-apk`

최종 v47 JS/CSS/HTML 커밋을 포함한 Actions success + artifact를 직접 다운로드한 뒤에만 사용자에게 APK 완료라고 말한다.

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
1. v47 enhancement 격리 → v46 확인.
2. v46 enhancement 격리 → v45 확인.
3. v45 enhancement 격리 → v44 core 확인.
4. core 문제면 v0.4.2 immutable baseline과 비교.
5. 실제 desktop/mobile Browser QA.
6. cycle 변경 시 색/연도 legend, 동일 N일차 marker, exact-date/path/payload QA.
7. Android 변경 시 APK 직접 확보 + 내부 assets/SHA 검증.
