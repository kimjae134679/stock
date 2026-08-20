# Market Radar 운영 인수인계 — CURRENT

기준 버전: **v0.3.9**  
기준일: **2026-08-20 KST**  
저장소: `kimjae134679/stock` (Public)

> 다음 작업자는 반드시 이 문서를 먼저 읽는다. 시장 데이터 자동화와 UI 개발을 섞지 않는다.

## 0. 절대 원칙
1. 매시간 시장 자동화는 JSON만 갱신한다. HTML/JS/CSS/VERSION 수정 금지.
2. 기존 기능 삭제 금지. Hero 하나짜리 단순화 금지.
3. 모바일/PC 정보량 동일.
4. 자체 `1시간/일봉/주봉/월봉` 버튼은 다시 만들지 않는다.
5. 로딩은 실제 단계 기반 `00.001%` 형식. 100% 후 로딩 패널은 사라진다.
6. **일부만 보이거나 섹션 중간이 큰 빈 박스로 끊기면 절대 정상 완료로 판정하지 않는다.**
7. 화면 최상단 micro build mark 유지. v0.3.9 = `MR039`.
8. APK 완료 = Actions 성공 + Artifact 확인 + APK 직접 확보 후 사용자에게 파일 제공.

## 1. v0.3.9 수정 이유
v0.3.8에서 테마 카드 자체는 복구됐지만, 사용자 모바일 화면에서 `현재 테마 흐름` 뒤가 큰 빈 영역으로 이어지며 이후 섹션이 잘린 것처럼 보이는 회귀가 다시 확인됐다.

v0.3.8의 문제는 완료 기준이 **테마 카드 개수**에 치우쳐 있었다. 테마가 정상이어도 이후 `action/charts/picks/.../macro` 중 일부가 누락되거나 fold-panel/fold-body에 비정상 높이가 남아도 100% 완료가 가능했다.

## 2. v0.3.9 핵심 수정
- 안정 진입: `public/reports/stable-v039.html`
- 전체 무결성 가드: `public/assets/integrity-v39.js`
- 다음 16개 섹션을 전부 확인한 뒤에만 100%:
  - themes
  - action
  - charts
  - picks
  - mr-famous
  - mr-compounders
  - mr-universe
  - expanded
  - etfs
  - allocation
  - research
  - smart-money
  - sources
  - history
  - replay
  - macro
- `window.__MR_D.themes.length`와 실제 테마 카드 수도 일치해야 함.
- `.sec`, `.fold-panel`, `.fold-body`, themes grid의 `height/min-height/max-height` 비정상값을 강제로 자동 높이로 정상화.
- visible child 아래 220px 이상 비정상 blank tail이 생기면 해당 fold-body padding/height를 압축.
- 핵심 섹션이 실제로 사라지면 full-recovery 렌더러를 최대 2회 자동 재실행하여 복구.
- MutationObserver + 주기 보정으로 이후 JS가 DOM을 변경해도 잘림/빈공간 회귀 감시.

## 3. 스크린샷 micro build mark
- `stable-v039.html` 최상단: `<span class="mr-buildmark">MR039</span>`
- 6px monospace, 배경과 거의 같은 색, 클릭 방해 없음.
- 일반 사용 중 거의 인지되지 않지만 스크린샷 확대 분석으로 실제 빌드 식별 가능하게 유지.
- 다음 버전마다 반드시 함께 변경.

## 4. 현재 진입 구조
- 웹/앱 shell: `public/index.html`
- APK/PWA 영구 온라인 진입: `public/app-live.html`
- latest 호환: `public/reports/latest.html` → `stable-v039.html`
- 안정판: `public/reports/stable-v039.html`
- 렌더러: `public/assets/full-recovery-v22.js`
- 전체 무결성: `public/assets/integrity-v39.js`
- 평가: `public/assets/evaluation-v26.js`
- 독립 Phase: `public/assets/phase-status-v29.js`
- UI/기간버튼 제거: `public/assets/ui-v30.js`, `public/assets/ui-v30.css`
- 전체추적/우상향 lazy chart: `public/assets/layout-v36.js`
- 1Y/2Y/3Y/5Y 수익률: `public/assets/returns-v36.js`
- 역사 주기: `public/assets/cycle-history-v34.js`

## 5. 성능 규칙
- 우상향 19개 TradingView iframe 초기 동시 로드 금지. 펼침 + viewport 접근 시 lazy load.
- 19종목×4기간 Yahoo 브라우저 직접 요청 금지. `compounder-returns.json` 1회 사용.
- 매 실행 전체 cache purge 금지. release 최초 1회만 정리.
- 핵심 화면 완료와 선택 분석 로딩을 분리.

## 6. 역사적 상승/하락 주기 분석 — 삭제 금지
- 현재 상승/하락 N거래일차
- 과거 같은 방향 평균/중앙값 기간
- 기간 진행도 / 변화폭 진행도 / 종합 진행도
- 초반/중반/후반/평균기간 초과 위치
- 과거 시작일/종료일/거래일/달력일/등락률 이력
- 미래 종료일 확정 예측처럼 표현 금지

## 7. 절대 삭제 금지 기능
시장 Hero, 시장·테마 독립 Phase, `그래서 지금은?`, 현재 테마 흐름 전체, 시간별 매수타이밍/QQQ 가격, 큰 TradingView 차트, 종목/ETF 상세, 유명주, 우상향 테마별/순위별/주봉/1·2·3·5년 수익률, 전체추적 테마별/전체, 숨은테마, ETF, 비중, 리서치, 기관, 원문, 검증, Replay, 거시, 접기/펼치기, 모달 스크롤 잠금, Android Back 계약, 역사 주기, 실제 로딩 진행률, micro build mark.

## 8. Android Back 계약
- 상세/모달 열림 → 하드웨어 뒤로가기 = 모달 닫기
- 루트 → `앱을 종료하시겠습니까?`
- 명시적 종료만 앱 종료

## 9. 매시간 자동화
자동화 ID: `6a847ce3f5dc81918ccab0a7bafaa8fe`
- 수정 가능: `latest.json`, `intraday.json`, `phase-status.json`, 당일 archive
- 수정 금지: HTML/JS/CSS/VERSION
- `cycle-history.json`, `compounder-returns.json`은 별도 Actions

## 10. QA 합격 기준
- `stable-v039.html`
- 화면 버전 v0.3.9 / micro mark `MR039`
- 16개 핵심 섹션 전부 DOM 존재
- 테마 데이터 개수 = 실제 테마 카드 개수
- 중간에 큰 빈 bordered panel이 생기지 않음
- 한 섹션의 blank tail이 220px 이상 남지 않음
- 핵심 무결성 확인 후 100%, 곧 로딩바 사라짐
- 자체 기간변경 버튼 없음
- Android Back 계약 유지

## 11. APK 완료 정의
`.github/workflows/android.yml`은 v0.3.9 안정판과 `integrity-v39.js`, `MR039`, 16개 핵심 섹션 검사 문자열을 검증한다.
**완료 = Actions 성공 → Artifact 확인 → APK 다운로드 → 사용자에게 직접 파일 제공.**
