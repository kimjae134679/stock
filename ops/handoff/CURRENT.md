# Market Radar 운영 인수인계 — CURRENT

기준 버전: **v0.4.0**  
기준일: **2026-08-20 KST**  
저장소: `kimjae134679/stock` (Public)

> 다음 작업자는 반드시 이 문서를 먼저 읽는다. 이번 버전의 핵심은 기능 추가가 아니라 **웹 문서 렌더 구조 단순화**다.

## 0. 절대 원칙
1. 매시간 시장 자동화는 JSON만 갱신한다. HTML/JS/CSS/VERSION 수정 금지.
2. 기존 기능 삭제 금지. Hero 하나짜리 단순화 금지.
3. 모바일/PC 정보량 동일.
4. 자체 `1시간/일봉/주봉/월봉` 버튼은 다시 만들지 않는다.
5. 로딩은 실제 단계 기반 `00.001%` 형식. 100% 후 로딩 패널은 사라진다.
6. 화면 최상단 micro build mark 유지. v0.4.0 = `MR040`.
7. APK 완료 = Actions 성공 + Artifact 확인 + APK 직접 확보 후 사용자에게 파일 제공.

## 1. v0.4.0에서 확정한 원인 분리
사용자 모바일 APK뿐 아니라 **PC 웹에서도 동일하게 큰 빈 박스/섹션 비정상 배치와 펼치기 버튼 미동작이 확인**됐다.

따라서 이번 문제의 1차 원인은 APK 네이티브 컨테이너가 아니라 **HTML/JS/CSS 문서 레이어**다. APK는 `app-live.html`을 통해 같은 GitHub Pages 문서를 표시하므로, 웹 문서가 깨지면 PC와 APK 모두 깨진다.

## 2. v0.3.8~v0.3.9에서 잘못 복잡해진 부분
- 무결성 스크립트가 DOM 누락을 감지하면 `full-recovery-v22.js`를 다시 주입해 렌더러를 복수 실행했다.
- 느린 모바일에서는 여러 renderer boot가 동시에 네트워크/캐시 렌더를 수행할 수 있어 race 가능성이 생겼다.
- MutationObserver, 주기 보정, 강제 height/transform 보정이 겹치면서 원래 단순한 fold 레이아웃보다 복잡해졌다.
- "섹션이 존재한다"와 "사용자가 정상적으로 보고 클릭할 수 있다"를 같은 것으로 잘못 취급했다.

## 3. v0.4.0 핵심 수정
### 렌더러는 한 번만 실행
안정판 `public/reports/stable-v040.html`은 `full-recovery-v22.js`를 **딱 한 번만** 로드한다.

다음은 사용하지 않는다.
- `integrity-v38.js`
- `integrity-v39.js`
- `integrity-v40.js`
- `flow-guard-v40.js`

파일이 저장소에 남아 있어도 v0.4.0 안정 진입점에서는 로드 금지다.

### stale last-good 선렌더 제거
`full-recovery-v22.js` 로드 전에 legacy `mr:last-good:v025`를 삭제한다. 네트워크 실패 시 renderer 자체 raw GitHub fallback을 사용한다. 이전 불완전 DOM을 먼저 띄웠다가 교체하는 경로를 없앤다.

### 펼치기/접기는 별도 안정 브리지
`public/assets/interaction-v40.js`가 렌더 완료 후 fold 버튼을 다시 단일 바인딩한다.
- 펼치기/접기 버튼 클릭 보장
- fold 상태 localStorage 키는 `mr:fold:v040:*`
- 접힌 섹션은 fold-body를 `display:none`으로 확실히 제거
- 접힌 panel의 비정상 height/min-height/max-height 제거
- quicknav 스크롤 이동 재바인딩
- 모달 닫기 + Android native Back 브리지 유지

### 완료 조건
- 다음 16개 섹션이 실제 DOM에 존재
  `themes, action, charts, picks, mr-famous, mr-compounders, mr-universe, expanded, etfs, allocation, research, smart-money, sources, history, replay, macro`
- 테마 카드 최소 4개 이상
- `interaction-v40.js` 로드/바인딩 완료
- 이후 평가/UI/layout/phase-status 보강
- 최종 섹션 손실 재확인
- 성공 시 100% → 로딩 패널 숨김

## 4. 현재 진입 구조
- 웹/앱 shell: `public/index.html`
- APK/PWA 영구 온라인 진입: `public/app-live.html`
- latest 호환: `public/reports/latest.html` → `stable-v040.html`
- 안정판: **`public/reports/stable-v040.html`**
- 메인 렌더러: `public/assets/full-recovery-v22.js` — 안정판에서 1회만 실행
- 상호작용 안정화: **`public/assets/interaction-v40.js`**
- 평가: `public/assets/evaluation-v26.js`
- UI/기간버튼 제거: `public/assets/ui-v30.js`, `public/assets/ui-v30.css`
- 전체추적/우상향 lazy chart: `public/assets/layout-v36.js`
- 독립 Phase: `public/assets/phase-status-v29.js`
- 1Y/2Y/3Y/5Y 수익률: `public/assets/returns-v36.js`
- 역사 주기: `public/assets/cycle-history-v34.js`

## 5. 성능 규칙
- 우상향 19개 TradingView iframe 초기 동시 로드 금지. 펼침 + viewport 접근 시 lazy load.
- 19종목×4기간 Yahoo 브라우저 직접 요청 금지. `compounder-returns.json` 1회 사용.
- 핵심 renderer 중복 실행 금지.
- DOM 복구를 위해 renderer script 재주입 금지.
- 무분별한 MutationObserver/주기적 transform 보정 금지.
- 핵심 화면과 선택 분석 로딩 분리.

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
- URL `reports/stable-v040.html`
- 화면 버전 v0.4.0 / micro mark `MR040`
- 16개 핵심 섹션 전부 존재
- PC와 Android에서 접힌 섹션이 제목 높이만 차지하고 거대한 빈 박스를 만들지 않음
- 펼치기 버튼을 누르면 해당 섹션 본문이 바로 표시되고 버튼은 `접기`로 변경
- 다시 누르면 본문이 사라지고 panel 높이가 내용 높이로 즉시 줄어듦
- quicknav 이동 동작
- 종목/테마 모달 동작
- 핵심 완료 후 100%, 로딩바 사라짐
- 자체 기간변경 버튼 없음
- Android Back 계약 유지

## 11. APK 완료 정의
`.github/workflows/android.yml`은 v0.4.0 안정판과 `interaction-v40.js`, `MR040`을 검증한다.
**완료 = Actions 성공 → Artifact 확인 → APK 다운로드 → 사용자에게 직접 파일 제공.**
