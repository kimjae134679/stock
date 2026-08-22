# Market Radar 운영 인수인계 — CURRENT

기준 배포: **v0.5.1 / MR051**  
기준일: **2026-08-23 KST**  
저장소: `kimjae134679/stock` (Public)

> **v0.5.0 / MR050은 사용자가 직접 안정적으로 동작한다고 확인한 최신 안정 기준판이다.** `public/reports/stable-v050-baseline.html`로 별도 백업했으며 v0.5.0 전용 asset(`app-v50-*`)은 수정하지 않는다.  
> **v0.4.2 / MR042도 비상용 immutable Known-Good 롤백판**으로 계속 보존한다.

## 0. 현재 기준
- 현재 배포: **v0.5.1 / MR051**
- 현재 진입: `public/reports/stable-v051.html`
- 최신 안정 백업: `public/reports/stable-v050-baseline.html`
- 비상 롤백: `public/reports/stable-v042-baseline.html`
- core renderer: `public/assets/app-v44.js`
- v51 enhancement: `public/assets/app-v51-enhance.js` + `public/assets/app-v51.css`
- v49 modal bridge는 계속 로드한다.
- live/latest/index 모두 v0.5.1로 연결.

## 1. 절대 원칙
1. 매시간 시장 자동화는 시장 JSON만 갱신. HTML/JS/CSS/VERSION 수정 금지.
2. 사용자가 명시적으로 삭제 요청하지 않은 기능을 안정화 명목으로 삭제하지 않는다.
3. 모바일/PC 정보량 동일.
4. 자체 `1시간/일봉/주봉/월봉` 버튼 복원 금지.
5. 로딩 완료 뒤 `#loadWrap` 높이 0. 빈 공간 금지.
6. micro build mark 유지: 현재 `MR051`, 안정백업 `MR050`, 비상롤백 `MR042`.
7. desktop 1440×1000 + mobile 390×844 Chromium QA 통과 전 완료 선언 금지.
8. APK 완료 = Browser QA 성공 + Android Actions 성공 + Artifact 확인 + 실제 APK 직접 확보/검증 + 사용자에게 직접 파일 제공.
9. `3x 사지마`, `매수 금지` 같은 명령조 위험문구 금지. 조건/이유 중심 중립 표현 사용.
10. 시장 전체 Phase를 모든 자산/테마에 강제로 적용하지 않는다.

## 2. v0.5.1 실제 사이클 비교 계약
사용자가 보고 싶은 핵심은 **현재 진행 중인 한 방향 구간**이다.

- 현재가 **저점→고점** 진행이면 그 상승/반등 구간이 비교의 중심이다.
- 현재가 **고점→저점** 진행이면 그 하락 구간이 비교의 중심이다.
- 단, 그 구간만 잘라 보여주면 어떤 큰 장세 안의 움직임인지 알기 어렵기 때문에 **과거 비교선은 중심 구간의 바로 이전 파동과 바로 이후 파동까지 같이 표시**한다.

### 현재 방향이 저점→고점일 때
과거 비교 창은 자연스럽게 `이전 고점 → 비교 저점 → 고점 → 이후 저점` 문맥을 보여준다.
- 비교 중심 = `비교 저점 → 고점`
- 이전 = 그 저점으로 내려온 하락
- 이후 = 그 고점 이후 실제 하락

### 현재 방향이 고점→저점일 때
과거 비교 창은 `이전 저점 → 비교 고점 → 저점 → 이후 고점` 문맥을 보여준다.
- 비교 중심 = `비교 고점 → 저점`
- 이전 = 그 고점까지 올라온 상승
- 이후 = 그 저점 이후 실제 반등/상승

### 그래프 규칙
- 메인 제목: **`실제 사이클 비교`**.
- 과거선은 실제 거래일 간격과 실제 등락 경로를 늘이거나 줄이지 않는다.
- 과거선은 비교 중심 구간 시작점만 공통 기준에 맞춰 겹친다.
- 현재선도 실제 진행 일수/실제 등락률을 그대로 표시한다.
- 메인 그래프에 여러 과거선을 서로 다른 색으로 겹친다.
- 그래프 내부 축/변곡점/현재 라벨은 이전 대비 약 2배 크기로 표시한다.
- 현재 진행 구간의 `N거래일차`와 시작일→현재일, 누적 등락률을 그래프 바로 아래 명시한다.
- 하단 `#1/#2/#3...` 비교는 **현재 초록선 + 해당 과거선 1개만** 있는 1:1 그래프로 보여준다. 다른 과거선은 섞지 않는다.
- 현재와 같은 N일차 당시 과거 수익률과 그 과거 비교구간 전체 기간/등락률을 숫자로 같이 표시한다.
- 과거 이후 경로는 당시 실제 결과이며 미래 예측이 아니다.

### 현재 QQQ 최신 데이터 예
현재 `wave-cycles.json` 기준 현재 핵심 구간은 `2026-07-29 → 2026-08-21`, **저점→고점 진행 18거래일차, 약 +7.8%**. 직전에는 `2026-06-02 → 2026-07-29`, 약 **-11.2%, 40거래일** 하락이 있었다. 따라서 단순히 `상승장`이라고 부르지 않고 최근 하락 문맥과 현재 반등을 함께 본다.

## 3. UI 배치/가독성
- 맨 위 Hero 전체평가는 문장을 덩어리로 붙이지 않고 문장 단위 줄바꿈/구분선으로 읽기 쉽게 정리한다.
- Hero 바로 아래에 `시장·테마 독립 Phase`가 오도록 유지한다.
- 사용자가 삭제 요청한 `🧭 지금 위치에 따라 무엇을 해야 하나?` section(`#action`)과 quicknav `행동` 버튼은 v0.5.1에서 제거한다.
- 테마 흐름은 그 다음에 표시.
- 사이클 section 제목은 `🔄 실제 사이클 비교`.
- 고봉밥 텍스트, 같은 원인·숫자의 반복 노출 금지.
- `70`처럼 숫자만 단독 표시하지 않고 `/100 + 의미`를 병기.
- Macro raw JSON 표시 금지.

## 4. 데이터
- `public/data/cycle-history.json`: 92개 자산 swing metadata.
- `public/data/cycle-full.json`: 핵심 13자산 상세 full-cycle.
- `public/data/wave-cycles.json`: 핵심 13자산 multi-leg 실제 경로. 현재 방향 구간과 앞뒤 파동 비교에 사용.
- 생성 workflow: `.github/workflows/cycle-history.yml`.
- 매시간 시장 자동화가 위 3개와 `compounder-returns.json`을 덮어쓰면 안 된다.

## 5. 렌더 구조
`app-v44.js`가 core DOM/interaction 소유권을 유지한다.
사이클 enhancement 순서: `v45 → v46 → v47 → v48 → v49 → v50 → v51`.

v51은 메인 사이클에 새 실제 사이클 비교를 추가하고, v50 및 이전 분석은 `이전 사이클 분석 상세 보기` details 아래에 보존한다.

`app-v49-modal-bridge.js`는 ticker modal에서 후속 cycle enhancement가 동작하는 데 필요하므로 제거 금지.

core가 capture 단계에서 `closest('[data-ticker]')`를 ticker 클릭으로 처리하므로 그래프 내부 일반 버튼에 `data-ticker`를 사용하지 않는다.

## 6. 현재 필수 화면
v0.5.1에서 사용자 요청으로 `action` section은 제거되므로 필수 main section은:
`themes, cycle-visual, charts, picks, mr-famous, mr-compounders, mr-universe, expanded, etfs, allocation, research, smart-money, sources, history, replay, macro`.

Hero(`#market`)와 독립 Phase(`#segmentPhaseNow`)도 반드시 존재하며 Phase는 Hero 바로 다음 DOM이어야 한다.

## 7. Browser QA — v0.5.1
Workflow: `.github/workflows/dashboard-qa-v51.yml`  
Script: `scripts/qa-dashboard-v51.mjs`  
최종 성공 run: **32584630504**.

검사:
- desktop 1440×1000 / mobile 390×844
- v0.5.1 / MR051
- v0.5.0 baseline 존재
- action guide/nav 제거
- 독립 Phase가 Hero 바로 아래
- `실제 사이클 비교` 제목
- 현재 방향 `저점→고점` 또는 `고점→저점`
- 이전+중심+이후 파동 문맥
- 현재 N거래일차
- 메인 overlay
- 하단 pair chart는 정확히 `현재 + 과거 1개` 두 선
- 3/4/5개 비교 전환
- ticker modal에서도 v51
- load gap 0
- document overflow 없음

## 8. Android / APK
Workflow: `.github/workflows/android.yml`
- 최종 success run: **32584630518**
- artifact: `MarketRadar-v0.5.1-debug-apk`
- 직접 확보 APK SHA-256: **91f66bd0c3ee6eed40799047e26584ad2fda369d58435e34e5fcba6783eccc55**
- APK 내부 확인: `stable-v051.html`, `app-v51-enhance.js`, `app-v51.css`, `wave-cycles.json`, `stable-v050-baseline.html` 포함.

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
- `wave-cycles.json`
- `compounder-returns.json`
- `stable-v050-baseline.html`
- `stable-v042-baseline.html`

## 10. 회귀 절차
1. v51 문제면 v51만 격리하고 v50 안정백업과 비교.
2. v50 자체 문제면 `stable-v050-baseline.html`로 즉시 확인.
3. modal cycle 누락이면 `app-v49-modal-bridge.js`부터 확인.
4. core 문제면 v0.4.2 immutable baseline과 비교.
5. desktop/mobile Browser QA 재실행.
6. Android 변경 시 최신 커밋 포함 APK를 직접 확보하고 SHA256/내부 asset까지 검증.
