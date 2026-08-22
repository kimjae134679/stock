# Market Radar 운영 인수인계 — CURRENT

기준 배포: **v0.5.1 / MR051B 웹 패치**  
기준일: **2026-08-23 KST**  
저장소: `kimjae134679/stock` (Public)

> **v0.5.0 / MR050은 사용자가 직접 안정적으로 동작한다고 확인한 최신 안정 기준판이다.** `public/reports/stable-v050-baseline.html`로 별도 백업했으며 v0.5.0 전용 asset(`app-v50-*`)은 수정하지 않는다.  
> **v0.4.2 / MR042도 비상용 immutable Known-Good 롤백판**으로 계속 보존한다.

## 0. 현재 기준
- 현재 웹 배포: **v0.5.1 / MR051B**
- 현재 진입: `public/reports/stable-v051.html`
- 최신 안정 백업: `public/reports/stable-v050-baseline.html`
- 비상 롤백: `public/reports/stable-v042-baseline.html`
- core renderer: `public/assets/app-v44.js`
- v51 base enhancement: `public/assets/app-v51-enhance.js` + `public/assets/app-v51.css`
- v51B web-only patch: `public/assets/app-v51b-enhance.js` + `public/assets/app-v51b.css`
- v49 modal bridge는 계속 로드한다.
- live/latest/index는 기존 v0.5.1 진입을 유지하고 `stable-v051.html` 내부만 웹 패치한다.

## 1. 절대 원칙
1. 매시간 시장 자동화는 시장 JSON만 갱신. HTML/JS/CSS/VERSION 수정 금지.
2. 사용자가 명시적으로 삭제 요청하지 않은 기능을 안정화 명목으로 삭제하지 않는다.
3. 모바일/PC 정보량 동일.
4. 자체 `1시간/일봉/주봉/월봉` 버튼 복원 금지.
5. 로딩 완료 뒤 `#loadWrap` 높이 0. 빈 공간 금지.
6. micro build mark 유지: 현재 웹 패치 `MR051B`, 안정백업 `MR050`, 비상롤백 `MR042`.
7. desktop 1440×1000 + mobile 390×844 Chromium QA 통과 전 완료 선언 금지.
8. `3x 사지마`, `매수 금지` 같은 명령조 위험문구 금지. 조건/이유 중심 중립 표현 사용.
9. 시장 전체 Phase를 모든 자산/테마에 강제로 적용하지 않는다.
10. **웹/UI만 수정할 때 APK를 다시 빌드하지 않는다.** Android 네이티브 코드/Capacitor 설정 변경 또는 사용자가 새 APK를 명시 요청한 경우에만 Android build를 실행한다.
11. `.github/workflows/android.yml`의 push trigger는 이제 `capacitor.config.json`, `scripts/apply-android-branding.mjs`, `android/**`, `ops/android-rebuild.request`만 감시한다. HTML/JS/CSS/VERSION/package 변경으로 APK를 자동 빌드하지 않는다.

## 2. v0.5.1 실제 사이클 비교 계약
사용자가 보고 싶은 핵심은 **현재 진행 중인 한 방향 구간**이다.

- 현재가 **저점→고점** 진행이면 그 상승/반등 구간이 비교의 중심이다.
- 현재가 **고점→저점** 진행이면 그 하락 구간이 비교의 중심이다.
- 단, 그 구간만 잘라 보여주면 어떤 큰 장세 안의 움직임인지 알기 어렵기 때문에 **과거 비교선은 중심 구간의 바로 이전 파동과 바로 이후 파동까지 같이 표시**한다.

### 현재 방향이 저점→고점일 때
과거 비교 창은 `이전 고점 → 비교 저점 → 고점 → 이후 저점` 문맥을 보여준다.
- 비교 중심 = `비교 저점 → 고점`
- 이전 = 그 저점으로 내려온 하락
- 이후 = 그 고점 이후 실제 하락

### 현재 방향이 고점→저점일 때
과거 비교 창은 `이전 저점 → 비교 고점 → 저점 → 이후 고점` 문맥을 보여준다.
- 비교 중심 = `비교 고점 → 저점`
- 이전 = 그 고점까지 올라온 상승
- 이후 = 그 저점 이후 실제 반등/상승

### v51B 상단 겹침 그래프 정렬 규칙
사용자가 요청한 예: 과거 A 핵심구간이 0→300일, 과거 B가 0→200일이면 **표시용 핵심 구간 끝 위치를 평균인 250일에 맞춘다.**
- 선택된 3/4/5개 과거 비교선의 **핵심 구간 실제 거래일 수 산술평균**을 계산한다.
- 각 과거선은 핵심 구간 시작을 x=0, 핵심 구간 끝을 x=평균 거래일 위치에 맞추는 **표시용 시간축 정렬**을 한다.
- 이전/이후 파동도 그 과거선의 같은 배율로 따라 움직여 큰 문맥을 유지한다.
- **가격/등락률 y값과 원본 날짜/원본 데이터는 절대 변경하지 않는다.**
- 이 정렬은 상단 여러 선 겹침 그래프만 적용한다.
- 현재 초록선은 미완성 진행구간이므로 **시간축을 늘이거나 줄이지 않고 실제 N거래일 그대로 표시**한다.
- 하단 현재+과거 1개씩 1:1 그래프는 양쪽 모두 **실제 거래일 축**으로 표시한다.
- 기본 표시 개수는 5개이며 3/4/5개 전환 가능.

### 현재 그래프 표시 규칙
- 상단에 과거선뿐 아니라 **현재 실제 경로도 반드시 동시에 표시**한다.
- 현재 핵심 구간은 밝은 굵은 초록 실선.
- 현재 핵심 구간 직전 한 파동은 초록 점선/반투명 선으로 같이 보여서, 현재가 어디서 출발했는지 맥락을 잃지 않게 한다.
- 현재 미래 구간은 만들지 않는다.

### 이전 고점/저점 정확성 규칙
- 현재가 저점→고점이면 과거 비교선의 `prevLeg.start_date`를 **이전 고점의 실제 피크 날짜**로 쓴다.
- 현재가 고점→저점이면 `prevLeg.start_date`를 이전 저점 실제 피크/바닥 날짜로 쓴다.
- reversal threshold가 나중에 확인되더라도 UI 라벨은 확인일이 아니라 **실제 swing pivot 날짜**를 가리킨다.
- 상단 그래프에서 가장 닮은 과거선의 이전 고점/저점을 큰 halo + callout + 날짜 + 비교 기준 대비 등락률로 강조한다.
- 아래 proof 카드에도 `반전 확인일이 아니라 해당 과거 구간의 실제 피크 날짜`라는 설명을 유지한다.

### 그래프 줌 계약
- Market Radar가 직접 그린 사이클 SVG 그래프는 그래프별로 독립적으로 **두 손가락 pinch 확대/축소**가 가능해야 한다.
- 두 손가락 중심 이동으로 확대 상태에서 이동도 가능해야 한다.
- 한 손가락 세로 스크롤은 페이지 스크롤을 방해하지 않는다.
- 확대 배율은 1×~5×.
- 각 그래프 아래 `원래 크기`로 리셋 가능.
- PC에서는 Ctrl+휠도 보조 줌으로 지원.

### 현재 QQQ 최신 데이터 예
현재 `wave-cycles.json` 기준 현재 핵심 구간은 `2026-07-29 → 2026-08-21`, **저점→고점 진행 18거래일차, 약 +7.8%**. 직전에는 `2026-06-02 → 2026-07-29`, 약 **-11.2%, 40거래일** 하락이 있었다. 따라서 단순히 `상승장`이라고 부르지 않고 최근 하락 문맥과 현재 반등을 함께 본다.

## 3. UI 배치/가독성
- 맨 위 Hero 전체평가는 문장을 덩어리로 붙이지 않고 문장 단위 줄바꿈/구분선으로 읽기 쉽게 정리한다.
- Hero 바로 아래에 `시장·테마 독립 Phase`가 오도록 유지한다.
- 사용자가 삭제 요청한 `🧭 지금 위치에 따라 무엇을 해야 하나?` section(`#action`)과 quicknav `행동` 버튼은 제거 상태 유지.
- 테마 흐름은 그 다음에 표시.
- 사이클 section 제목은 `🔄 실제 사이클 비교`.
- 고봉밥 텍스트, 같은 원인·숫자의 반복 노출 금지.
- `70`처럼 숫자만 단독 표기하지 않고 `/100 + 의미`를 병기.
- Macro raw JSON 표시 금지.

## 4. 데이터
- `public/data/cycle-history.json`: 92개 자산 swing metadata.
- `public/data/cycle-full.json`: 핵심 13자산 상세 full-cycle.
- `public/data/wave-cycles.json`: 핵심 13자산 multi-leg 실제 경로. 현재 방향 구간과 앞뒤 파동 비교에 사용.
- 생성 workflow: `.github/workflows/cycle-history.yml`.
- 매시간 시장 자동화가 위 3개와 `compounder-returns.json`을 덮어쓰면 안 된다.

## 5. 렌더 구조
`app-v44.js`가 core DOM/interaction 소유권을 유지한다.
사이클 enhancement 순서: `v45 → v46 → v47 → v48 → v49 → v50 → v51 → v51B`.

v51B는 v51 결과를 삭제하지 않고 새 정렬/줌 화면으로 승격하고, 기존 v51은 `이전 v0.5.1 상세 비교도 보기` details 아래에 보존한다.

`app-v49-modal-bridge.js`는 ticker modal에서 후속 cycle enhancement가 동작하는 데 필요하므로 제거 금지.

core가 capture 단계에서 `closest('[data-ticker]')`를 ticker 클릭으로 처리하므로 그래프 내부 일반 버튼에 `data-ticker`를 사용하지 않는다.

## 6. 현재 필수 화면
v0.5.1에서 action section은 제거되므로 필수 main section은:
`themes, cycle-visual, charts, picks, mr-famous, mr-compounders, mr-universe, expanded, etfs, allocation, research, smart-money, sources, history, replay, macro`.

Hero(`#market`)와 독립 Phase(`#segmentPhaseNow`)도 반드시 존재하며 Phase는 Hero 바로 다음 DOM이어야 한다.

## 7. Browser QA — v0.5.1B
Workflow: `.github/workflows/dashboard-qa-v51b.yml`  
Script: `scripts/qa-dashboard-v51b.mjs`  
최종 성공 run: **32585844061**.

검사:
- desktop 1440×1000 / mobile 390×844
- MR051B
- 기본 5개 과거선 겹침
- 현재 실제선 + 직전 현재 문맥 + 과거선 동시 표시
- 핵심 구간 평균 기간 정렬 문구/구조
- 이전 고점/저점 실제 pivot 강조 및 날짜 설명
- 하단 pair chart는 정확히 `현재 + 과거 1개` 비교
- 각 그래프 독립 pinch zoom synthetic gesture 검사
- 3개 보기 전환
- load gap 0
- document overflow 없음

QA artifact: `dashboard-v051b-qa-screenshots`.

## 8. Android / APK
Workflow: `.github/workflows/android.yml`

### 새 정책
- **웹/UI 수정만으로 APK를 다시 빌드하지 않는다.**
- 자동 push trigger는 Android/Capacitor 관련 파일과 명시적 `ops/android-rebuild.request`만 감시.
- 새 APK가 필요하면 Android 네이티브 변경 또는 사용자 명시 요청 후 `ops/android-rebuild.request`를 갱신하거나 workflow_dispatch한다.

### 기존 APK
- 사용자가 마지막으로 받은 공식 v0.5.1 APK 기준 success run: **32584630518**.
- 그 뒤 v51B 웹 패치를 시작할 때 예전 workflow가 `stable-v051.html`을 감시하고 있어 **전환 과정에서 자동 build run 32585817963이 1회 발생**했다. 이는 정책 변경 전에 걸린 자동 트리거이며, 이후 workflow trigger를 수정했다.
- v51B는 온라인 웹 UI 패치이므로 새 APK 전달/설치를 요구하지 않는다.

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
1. v51B 문제면 `app-v51b-*`만 제거하고 v51 확인.
2. v51 문제면 v50 안정백업과 비교.
3. v50 자체 문제면 `stable-v050-baseline.html`로 즉시 확인.
4. modal cycle 누락이면 `app-v49-modal-bridge.js`부터 확인.
5. core 문제면 v0.4.2 immutable baseline과 비교.
6. desktop/mobile Browser QA 재실행.
7. 평균 정렬 변경 시 **원본 날짜/y값 불변, 현재선 actual-days 불변, 상단만 x정렬**을 반드시 검사.
8. 줌 변경 시 1손가락 페이지 스크롤과 2손가락 chart pinch가 충돌하지 않는지 실제 Android에서도 확인.
9. Android 변경/요청 시에만 APK를 빌드하고 직접 확보/SHA256 검증 후 전달한다.
