# Market Radar 운영 인수인계 — CURRENT

기준 버전: **v0.4.1**  
기준일: **2026-08-20 KST**  
저장소: `kimjae134679/stock` (Public)

> 다음 작업자는 반드시 이 문서를 먼저 읽는다. 이번 버전은 사용자가 반복해서 겪은 `큰 빈 공간`, `펼치기 미동작`, `로딩바 중간 정지`의 실제 원인을 확인하고 복구 스크립트를 덜어낸 안정화 버전이다.

## 0. 절대 원칙
1. 매시간 시장 자동화는 JSON만 갱신한다. HTML/JS/CSS/VERSION 수정 금지.
2. 기존 기능 삭제 금지. Hero 하나짜리 단순화 금지.
3. 모바일/PC 정보량 동일.
4. 자체 `1시간/일봉/주봉/월봉` 버튼은 다시 만들지 않는다.
5. 로딩은 실제 완료 단계 기반 `00.001%` 형식. 핵심 UI와 버튼 연결이 끝나면 100% 후 패널은 사라진다.
6. 화면 최상단 micro build mark 유지. v0.4.1 = `MR041`.
7. APK 완료 = Actions 성공 + Artifact 확인 + APK 직접 확보 후 사용자에게 파일 제공.

## 1. v0.4.0 사용자 캡처로 확정된 실제 문제
사용자 모바일 v0.4.0에서 다음이 동시에 확인됐다.
- 테마 카드 아래에 섹션 테두리는 남아 있는데 **수백 px 이상의 거대한 빈 영역**이 생김.
- 화면 상단 로딩바가 **83.000% / evaluation-v26.js 로드 완료에서 멈춤**.
- 그 아래에는 이미 `정상 · 전체 대시보드 고정 완료`가 표시되어 서로 모순됨.

PC에서도 이전 버전에서 접힌 섹션 제목들은 보이지만 `펼치기`가 동작하지 않는 사례가 확인됐다. 따라서 APK 네이티브 자체보다 웹 문서 로딩/레이아웃/이벤트 구조가 1차 원인이다.

## 2. 이번에 코드에서 확인한 구체적 원인
### 원인 A — flow-guard의 transform 보정이 오히려 빈 공간을 만들 수 있었음
`flow-guard-v40.js`의 gap 복구는 다음 섹션을 `transform: translateY(-Npx)`로 위로 끌어올리는 방식이었다.

CSS transform은 **보이는 위치만 이동시키고 원래 레이아웃이 차지하던 공간은 그대로 남긴다.** 그래서 화면에는 다음 섹션이 위로 당겨져 보여도 원래 자리에는 큰 빈 공간이 남을 수 있다.

즉 `빈 공간을 없애기 위한 코드가 빈 공간의 원인`이 될 수 있었다.

**v0.4.1에서는 flow-guard / integrity 계열을 안정 진입점에서 전혀 로드하지 않는다. transform 기반 위치보정도 금지한다.**

### 원인 B — v0.4.0 안정 HTML에서 interaction-v40.js를 실제로 로드하지 않았음
v0.4.0 인수인계/빌드 검사는 `interaction-v40.js`가 사용된다고 가정했지만 실제 `stable-v040.html` 실행 순서는 `full-recovery → flow-guard → integrity → evaluation/ui/layout/phase`였고 interaction-v40이 핵심 로더에 들어가지 않았다.

따라서 별도 안정 fold 브리지를 만들었어도 실제 사용자 화면에는 연결되지 않을 수 있었다.

**v0.4.1은 interaction-v41.js를 full-recovery보다 먼저 직접 로드한다.**

### 원인 C — 로딩 완료를 부가기능까지 기다려 83% 같은 중간값에 붙잡음
v0.4.0은 이미 전체 대시보드가 렌더된 뒤에도 evaluation/ui/layout/phase-status를 순차 기다렸다. 그래서 화면은 사용 가능하고 `정상` 문구까지 있는데 로딩바는 83%에 남는 모순이 발생했다.

**v0.4.1 완료 기준은 핵심 16개 섹션 + 테마 카드 + fold 버튼 + interaction-v41 준비까지다.**
그 뒤 evaluation/phase/layout/returns/cycle-history는 백그라운드 보강이며 로딩바를 붙잡지 않는다.

## 3. v0.4.1 안정 구조
- 안정 진입: `public/reports/stable-v041.html`
- micro mark: `MR041`
- 메인 renderer: `public/assets/full-recovery-v22.js` **1회만 로드**
- fold/nav/modal 안정 브리지: **`public/assets/interaction-v41.js`**
- 사용 금지: `flow-guard-v40.js`, `integrity-v38.js`, `integrity-v39.js`, `integrity-v40.js`
- 렌더러 재주입 금지
- transform/translate로 섹션 위치를 당겨서 gap을 숨기는 방식 금지

## 4. interaction-v41 계약
`interaction-v41.js`는 DOM 교체 여부와 무관하게 document capture 단계의 **이벤트 위임**으로 fold/nav/modal 닫기를 처리한다.

- `[data-fold]` 클릭 → 해당 section `is-folded` 토글
- 접힘 → `.fold-body display:none`
- 펼침 → `.fold-body` 정상 흐름 복귀
- section/body `height/min-height/max-height/transform`을 정상값으로 정리
- `[data-go]` → 해당 섹션으로 이동
- 모달 닫기 처리
- `window.__MR_HANDLE_NATIVE_BACK__` → 열린 모달 닫기
- fold 상태 키: `mr:fold:v041:*`

## 5. v0.4.1 로딩 완료 기준
다음 16개 섹션이 실제 DOM에 존재해야 한다.
`themes, action, charts, picks, mr-famous, mr-compounders, mr-universe, expanded, etfs, allocation, research, smart-money, sources, history, replay, macro`

추가 조건:
- `window.__MR_D.themes`가 존재하고 실제 테마 카드 수가 그 이상
- fold 버튼이 최소 12개 이상 생성
- `window.__MR_INTERACTION41_READY__ === true`

이 조건을 만족하면 `100.000%` → 약 0.42초 후 로딩 패널 숨김.

**evaluation / phase-status / layout / returns / cycle-history는 완료 이후 idle/background에서 붙인다. 이 부가기능 때문에 83% 등에서 멈추면 안 된다.**

## 6. 현재 진입 구조
- 웹/앱 shell: `public/index.html`
- APK/PWA 영구 온라인 진입: `public/app-live.html`
- latest 호환: `public/reports/latest.html` → `stable-v041.html`
- 안정판: **`public/reports/stable-v041.html`**
- 메인 renderer: `public/assets/full-recovery-v22.js`
- 상호작용: **`public/assets/interaction-v41.js`**
- UI/기간버튼 제거: `public/assets/ui-v30.js`, `public/assets/ui-v30.css`
- 평가: `public/assets/evaluation-v26.js`
- 독립 Phase: `public/assets/phase-status-v29.js`
- 전체추적/우상향 lazy chart: `public/assets/layout-v36.js`
- 1Y/2Y/3Y/5Y 수익률: `public/assets/returns-v36.js`
- 역사 주기: `public/assets/cycle-history-v34.js`

## 7. 성능 규칙
- 우상향 19개 TradingView iframe 초기 동시 로드 금지. 펼침 + viewport 접근 시 lazy load.
- 19종목×4기간 Yahoo 브라우저 직접 요청 금지. `compounder-returns.json` 1회 사용.
- renderer 중복 실행 금지.
- DOM 복구용 renderer 재주입 금지.
- MutationObserver로 지속적인 강제 layout 이동 금지.
- `transform:translateY()`를 섹션 gap 복구에 사용 금지.
- 핵심 UI 완료와 부가 분석 로딩 분리.

## 8. 역사적 상승/하락 주기 분석 — 삭제 금지
- 현재 상승/하락 N거래일차
- 과거 같은 방향 평균/중앙값 기간
- 기간 진행도 / 변화폭 진행도 / 종합 진행도
- 초반/중반/후반/평균기간 초과 위치
- 과거 시작일/종료일/거래일/달력일/등락률 이력
- 미래 종료일 확정 예측처럼 표현 금지

## 9. 절대 삭제 금지 기능
시장 Hero, 시장·테마 독립 Phase, `그래서 지금은?`, 현재 테마 흐름 전체, 시간별 매수타이밍/QQQ 가격, 큰 TradingView 차트, 종목/ETF 상세, 유명주, 우상향 테마별/순위별/주봉/1·2·3·5년 수익률, 전체추적 테마별/전체, 숨은테마, ETF, 비중, 리서치, 기관, 원문, 검증, Replay, 거시, 접기/펼치기, 모달 스크롤 잠금, Android Back 계약, 역사 주기, 실제 로딩 진행률, micro build mark.

## 10. Android Back 계약
- 상세/모달 열림 → 하드웨어 뒤로가기 = 모달 닫기
- 루트 → `앱을 종료하시겠습니까?`
- 명시적 종료만 앱 종료

## 11. 매시간 자동화
자동화 ID: `6a847ce3f5dc81918ccab0a7bafaa8fe`
- 수정 가능: `latest.json`, `intraday.json`, `phase-status.json`, 당일 archive
- 수정 금지: HTML/JS/CSS/VERSION
- `cycle-history.json`, `compounder-returns.json`은 별도 Actions

## 12. QA 합격 기준
- URL `reports/stable-v041.html`
- 화면 버전 v0.4.1 / micro mark `MR041`
- 16개 핵심 섹션 전부 존재
- 접힌 section은 제목 높이만 차지하고 큰 빈 박스를 만들지 않음
- 펼치기/접기가 PC와 Android 모두 즉시 반응
- 어떤 section에도 gap 복구용 translateY가 적용되지 않음
- 핵심 완료 후 100%, 로딩바 사라짐
- 부가기능 로딩 때문에 로딩바가 83% 등에 남지 않음
- quicknav 동작
- 종목/테마 모달 동작
- 자체 기간변경 버튼 없음
- Android Back 계약 유지

## 13. APK 완료 정의
`.github/workflows/android.yml`은 v0.4.1 안정판과 `interaction-v41.js`, `MR041`을 검증한다.
**완료 = Actions 성공 → Artifact 확인 → APK 다운로드 → 사용자에게 직접 파일 제공.**
