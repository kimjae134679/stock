# Market Radar 운영 인수인계 — CURRENT

기준 배포: **v0.4.9 / MR049**  
기준일: **2026-08-21 KST**  
저장소: `kimjae134679/stock` (Public)

> **v0.4.2 / MR042는 사용자가 직접 정상 작동을 확인한 immutable Known-Good 롤백 기준판이다.** 현재 v0.4.9는 v0.4.4 안정 core renderer를 유지하면서 기존 기능을 삭제하지 않고 additive enhancement로만 보강한다.

## 0. 현재 기준
- 배포: **v0.4.9 / MR049**
- 안정 진입: `public/reports/stable-v049.html`
- core renderer: `public/assets/app-v44.js`
- v0.4.5: 점수/문구/장중 정보 정리
- v0.4.6: 정확한 날짜 + 실제 거래일 full-cycle
- v0.4.7: 연도별 색/동일 거래일 비교
- v0.4.8: 손그림식 굵은 색 사이클 오버레이 + 다음 상승까지 경로
- **v0.4.9: 과거 사이클 고정 + 현재선만 fit하여 현재가 저점/중간/고점 어느 쪽인지 직접 판정**
- v0.4.9 modal bridge: `public/assets/app-v49-modal-bridge.js`
- live/latest/index 모두 v0.4.9 연결
- immutable rollback: `public/reports/stable-v042-baseline.html`

## 1. 절대 원칙
1. 매시간 시장 자동화는 JSON만 갱신. HTML/JS/CSS/VERSION 수정 금지.
2. 기능 삭제로 안정화 금지.
3. 모바일/PC 정보량 동일.
4. 자체 `1시간/일봉/주봉/월봉` 버튼 복원 금지.
5. 로딩 100% 뒤 `#loadWrap` 전체 높이 0. 빈 칸 남기지 않음.
6. micro build mark 유지: 현재 `MR049`, 롤백 `MR042`.
7. desktop 1440×1000 + mobile 390×844 Chromium QA 통과 전 완료 선언 금지.
8. Playwright는 `browser.newPage({viewport:{width,height}})` 사용.
9. APK 완료 = Browser QA 성공 + Android Actions 성공 + Artifact 확인 + APK 직접 확보/검증 + 사용자에게 직접 파일 제공.
10. 과거 full-recovery/evaluation/layout/integrity/flow-guard 체인을 안정 진입점에 다시 겹쳐 올리지 않는다.
11. transform/translate로 section gap을 숨기지 않는다.
12. UI에서 `3x 사지마`, `매수 금지` 같은 명령조 위험문구를 사용하지 않는다. 조건/이유 중심으로 쓴다.
13. 시장 전체 Phase를 모든 테마/자산에 강제로 적용하지 않는다.

## 2. v0.4.9 사이클 핵심 계약
사용자 의도는 **“옛날 사이클 자체를 움직이지 말고, 거기에 현재 그래프를 맞춰서 지금이 어디인지 보자”**이다.

### 반드시 지킬 것
- 과거 사이클 선의 x축 = 해당 과거 사이클의 **실제 거래일**.
- 과거 사이클 선의 y축 = 해당 과거 사이클의 **실제 시작 저점 대비 누적 등락률 경로**.
- 과거 사이클은 0~100 단계축으로 늘이거나 줄이지 않는다.
- 과거 사이클의 저점/고점/다음 저점/다음 고점 날짜를 그대로 고정한다.
- **움직여 맞추는 것은 현재 경로뿐**이다.
- 현재 경로의 시간축 및 진폭 fit 배율을 UI에 공개한다.
- 현재 종점이 과거 고정선의 어느 거래일 위치에 가장 잘 맞는지 `현재 ≈ 과거 N일차`로 표시한다.
- 각 match를 `저점 직후`, `상승 중반`, `상승 후반`, `고점 접근`, `고점 통과·하락 초반`, `하락 중반`, `다음 저점 접근`, `다음 저점 통과·재상승`으로 해석한다.
- 상단에 반드시 **`그래서 지금이 저점이야, 고점이야?`**를 두고 `고점보다는 저점 쪽 / 상승·하락 중간 구간 / 저점보다는 고점 쪽` 중 하나를 직접 표시한다.
- 판정은 역사 모양 비교이며 미래 고점·저점 날짜 확정/예측으로 쓰지 않는다.

### 현재 QA 데이터 기준
- QQQ 현재 실제 구간: `2026-07-29` 시작 → `2026-08-20`, 상승 17거래일차, +7.44%.
- v0.4.9 고정-template fit 결과는 **`상승·하락 중간 구간`**으로 표시됨.
- 즉 현재 데이터만으로 `지금이 확정 저점` 또는 `확정 고점`이라고 판정하지 않는다.
- 대표 과거 match를 3개 기본 표시하고 4개/5개로 확장 가능.
- 이전 v0.4.8 형태 정렬과 v0.4.7 실제 거래일 12개 상세 비교는 삭제하지 않고 접힌 details에 보존.

## 3. 렌더 구조
`app-v44.js`가 핵심 DOM/interaction 소유권을 유지한다.
- 17개 섹션
- quicknav/fold/modal/Android Back/tabs
- lazy TradingView
- progress/구조검증

사이클 enhancement 순서:
`v45 → v46 → v47 → v48 → v49`

`app-v49-modal-bridge.js`는 v48 modal의 `.v48-modal-primary`를 v49가 승격 가능한 `.v48-shell`로 감싸는 **modal 전용 호환 bridge**다. 일반 DOM watchdog 용도로 확대하지 않는다.

### 이벤트 주의
core `app-v44.js`는 capture 단계에서 `closest('[data-ticker]')`를 ticker 클릭으로 처리한다. 그래프 내부 비-ticker 컨트롤에 `data-ticker`를 사용하지 않는다.

## 4. 필수 17개 섹션
`themes, action, cycle-visual, charts, picks, mr-famous, mr-compounders, mr-universe, expanded, etfs, allocation, research, smart-money, sources, history, replay, macro`

## 5. UI/문구 규칙
- Hero: 시장 핵심 평가 / 지금 할 일 / 피할 것 / 5개 score.
- 고봉밥 텍스트 금지. 같은 원인·숫자를 여러 영역에서 반복하지 않는다.
- 유사 장세/상세 근거는 details/modal로 이동.
- `70` 같은 숫자만 단독 표시하지 않고 `/100 + 말뜻`을 붙인다.
- 독립 Phase는 Hero 요약을 그대로 반복하지 않는다.
- 종목판은 phase/action badge 중심, 긴 note는 modal.
- Macro raw JSON 표시 금지.
- 위험관리는 레버리지 자체를 일괄 금지하지 않고 기초지수/변동성/추세 회복 조건을 설명한다.

## 6. cycle 데이터
### Swing metadata
- builder: `scripts/build-cycle-history.mjs`
- output: `public/data/cycle-history.json`
- assets: **92**

### Detailed full-cycle paths
- builder: `scripts/build-cycle-full.mjs`
- output: `public/data/cycle-full.json`
- assets: **13**, errors: **0**
- 대상: QQQ/SPY/SMH/SOXX/TQQQ/SOXL/IGV/GRID/ANET/NVDA/AVGO/MSFT/GOOGL
- representative path는 실제 일별 수정주가 sampled path.
- QQQ extended representatives는 다음 상승 고점까지 이어지는 실제 과거 경로 포함.
- 현재 combined cycle payload: 약 **4.33MB**.

둘 다 `.github/workflows/cycle-history.yml`에서 생성. 매시간 시장 자동화가 덮어쓰지 않는다.

## 7. Browser QA — v0.4.9
Workflow: `.github/workflows/dashboard-qa-v49.yml`  
Script: `scripts/qa-dashboard-v49.mjs`

최종 성공 run: **32451163341**.

검사:
- desktop 1440×1000 / mobile 390×844
- v0.4.9 / MR049
- 17 sections
- load gap 0
- fixed historical templates 3개 이상
- current-only fit points
- exact historical dates
- low/mid/high verdict
- 3→5 비교 확대
- 이전 v48/v47 상세 보존
- ticker modal에서도 v49 fixed-fit 표시
- blank panel 없음
- document overflow 없음

## 8. Android / APK
Workflow: `.github/workflows/android.yml`
- stable-v049 + v49 assets 포함
- v0.4.2 rollback baseline 포함
- native Back/exit confirmation 유지
- persistent debug signing key 유지
- artifact: `MarketRadar-v0.4.9-debug-apk`
- 최종 성공 run: **32451163332**

Android Back 계약:
- modal open → hardware Back = modal 닫기
- root → `앱을 종료하시겠습니까?`
- 명시적 `종료`만 exit

## 9. 매시간 자동화
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

## 10. 회귀 절차
1. v49 문제면 v49/bridge 격리 → v48 확인.
2. v48 문제면 v47 확인.
3. v47 문제면 v46 확인.
4. v46 문제면 v45 확인.
5. core 문제면 v44와 v0.4.2 immutable baseline 비교.
6. 실제 desktop/mobile Browser QA.
7. cycle 변경 시 **과거선 고정 여부 / current-only fit / 날짜 / 판정 / modal**을 반드시 검사.
8. Android 변경 시 최신 커밋을 포함한 APK를 직접 확보하고 SHA256까지 검증.
