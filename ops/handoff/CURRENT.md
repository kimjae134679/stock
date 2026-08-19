# Market Radar 운영 인수인계 — CURRENT

기준 버전: **v0.3.6**  
기준일: **2026-08-20 KST**  
저장소: `kimjae134679/stock` (Public)

> 다음 작업자는 반드시 이 문서를 먼저 읽는다. 시장 데이터 자동화와 UI 개발을 섞지 않는다.

## 0. 절대 원칙

1. 매시간 시장 자동화는 JSON만 갱신한다. HTML/JS/CSS/VERSION을 수정하지 않는다.
2. 안정화한다고 기존 기능을 삭제하거나 Hero 하나짜리로 단순화하지 않는다.
3. 현재 VERSION보다 낮은 버전이 사용자 화면에 보이면 정상본이 아니다.
4. APK 수정은 Actions 성공 + Artifact 실제 존재 + APK 직접 확보 전에는 완료라고 말하지 않는다.
5. 모바일/PC 정보량은 동일하다.
6. 작동하지 않는 자체 `1시간/일봉/주봉/월봉` 버튼은 다시 만들지 않는다. `ui-v30.js`가 해당 버튼을 제거한다.
7. 로딩은 `00.001%` 형식의 실제 단계 기반 진행률과 bar를 표시하고, 실패 지점을 숨기지 않는다.

## 1. v0.3.6에서 확인된 실제 원인

사용자 APK 캡처에 **`Market Radar Daily · v0.3.2`**가 보였고 `대시보드 준비 중…`에서 멈췄다.

원인은 두 가지다.

### A. APK가 웹 최신판을 자동으로 따라가지 못하던 구조

기존 Capacitor APK는 `public/`을 APK 안에 그대로 묶는다. 따라서 v0.3.2 APK를 설치하면 웹이 v0.3.5로 올라가도 앱 내부 화면은 v0.3.2에 머물 수 있다.

v0.3.6부터:
- `public/app-live.html`을 **영구 온라인 진입점**으로 사용한다.
- APK의 `public/index.html`은 온라인 `https://kimjae134679.github.io/stock/app-live.html`로 이동한다.
- `capacitor.config.json`의 `allowNavigation`에 `kimjae134679.github.io`를 허용한다.
- 앞으로 웹 UI가 v0.3.7, v0.3.8로 바뀌어도 `app-live.html`만 새 안정판으로 연결하면 v0.3.6 APK 이후는 새 UI를 따라갈 수 있다.
- 네트워크 문제 때 사용할 내장 fallback으로 `stable-v036.html` 링크를 남긴다.

### B. 현재 웹 자체도 실제로 너무 무거워진 부분이 있었다

`layout-v28.js`는 우상향 섹션을 시작부터 강제로 펼치고 **19개의 TradingView 주봉 iframe을 한꺼번에 생성**했다.

`returns-v29.js`는 19개 종목 × 1Y/2Y/3Y/5Y = **최대 76회의 Yahoo 시세 요청을 클라이언트에서 직접 실행**했다.

이 둘은 모바일 WebView 초기 로딩에 불필요하게 큰 부담이다.

v0.3.6 조치:
- `layout-v28.js` 대신 **`layout-v36.js`** 사용.
- 우상향 섹션은 기본 접힘 상태를 유지.
- 19개 그래프는 `data-src` 상태로 만들고 **섹션을 펼친 뒤 화면 근처에 들어온 카드부터 IntersectionObserver로 실제 iframe을 로드**한다.
- `returns-v29.js` 대신 **`returns-v36.js`** 사용.
- 1Y/2Y/3Y/5Y 수익률은 GitHub Actions가 서버에서 미리 계산해 `public/data/compounder-returns.json` 한 파일로 저장한다.
- 모바일은 이 JSON **1회 요청만** 하고 76회 Yahoo 요청을 하지 않는다.
- 생성기: `scripts/build-compounder-returns.mjs`
- workflow: `.github/workflows/compounder-returns.yml`

## 2. 현재 진입 구조

- 웹 기본: `public/index.html`
- APK/PWA 영구 온라인 진입: **`public/app-live.html`**
- 최신 호환: `public/reports/latest.html` → v0.3.6 안정판
- 현재 안정판: **`public/reports/stable-v036.html`**
- 메인 렌더러: `public/assets/full-recovery-v22.js`
- 평가: `public/assets/evaluation-v26.js`
- 독립 Phase: `public/assets/phase-status-v29.js`
- UI/기간버튼 제거: `public/assets/ui-v30.js`, `public/assets/ui-v30.css`
- 경량 전체추적/우상향/모달: **`public/assets/layout-v36.js`**
- 경량 1/2/3/5년 수익률: **`public/assets/returns-v36.js`**
- 역사 주기: `public/assets/cycle-history-v34.js`
- 최종 로드검사/네이티브 Back 브리지: **`public/assets/app-runtime-v36.js`**

`stable-v036.html`은 초기 핵심 화면을 먼저 완성하고, 우상향 수익률/역사 주기 같은 부가 분석은 핵심 화면이 사용 가능해진 뒤 연결한다.

## 3. v0.3.6 로딩 진행률 규칙

표시 예:
- `00.001%`
- `01.001%`
- `16.000%`
- `58.000%`
- `98.500%`
- `100.000%`

시간이 흘렀다는 이유만으로 숫자를 올리지 않는다.

현재 핵심 단계:
1. HTML shell 준비
2. v0.3.6 최초 1회에만 구버전 cache/service worker 정리
3. `full-recovery-v22.js` 실제 load
4. 실제 DOM에서 주요 섹션 개수를 관찰
5. evaluation / phase / UI / layout-v36 순차 연결
6. app-runtime-v36 최종 DOM 검사
7. 성공하면 `100.000%` + `정상 · v0.3.6 핵심 대시보드 로드 완료`
8. `returns-v36.js`, `cycle-history-v34.js`는 핵심 화면 이후 백그라운드 보강

v0.3.5처럼 매번 모든 cache를 지우고 4개 JSON을 preflight한 뒤 다시 renderer가 같은 JSON을 받는 중복 구조는 사용하지 않는다.

## 4. 역사적 상승/하락 주기 분석 — 고정 기능

데이터: `public/data/cycle-history.json`  
생성기: `scripts/build-cycle-history.mjs`  
Workflow: `.github/workflows/cycle-history.yml`

표시:
- 현재 `상승 N거래일차` / `하락 N거래일차`
- 과거 같은 방향 평균·중앙값 거래일
- 기간 진행도 / 변화폭 진행도 / 종합 진행도
- `상승 초반 / 중반 / 후반·고점 접근 / 평균기간 초과 연장상승` 및 하락 대응
- 과거 모든 완료 구간의 시작일/종료일/거래일/달력일/등락률

기본 ZigZag reversal 기준:
- 일반 ETF 약 8%
- 일반주 약 12%
- 3x 레버리지 약 18%

이는 미래 전환 날짜 확정값이 아니라 역사 비교 설명치다.

## 5. 절대 삭제 금지 기능

- 시장 Hero + 위험/저점/고점위험/추세확인/매수타이밍
- 시장/테마 독립 Phase
- 각 상태의 `그래서 지금은?`
- 시간별 매수타이밍 + QQQ 가격
- 큰 실제 TradingView 차트
- 종목/ETF 상세
- 유명·초대형 핵심주
- 안정적·꾸준한 우상향 후보
  - 테마별
  - 순위별
  - 주봉 그래프
  - 1/2/3/5년 누적수익률
- 전체추적 `테마별 / 전부 모아보기`
- 숨은테마
- ETF/비중/리서치/기관/원문/검증/Replay/거시
- 접기/펼치기
- 모달 배경 스크롤 잠금
- 상세 모달 Android Back → 모달 닫기
- 루트 Android Back → `앱을 종료하시겠습니까?`
- 역사 주기 현재 일차/평균/진행률/과거 이력
- 실제 단계 기반 퍼센트 + 진행bar + 실패 위치

## 6. 매시간 자동화

자동화 ID: `6a847ce3f5dc81918ccab0a7bafaa8fe`

매시간 갱신:
- `public/data/latest.json`
- `public/data/live/intraday.json`
- `public/data/live/phase-status.json`
- 당일 archive

자동화는 UI 파일과 VERSION을 건드리지 않는다.

별도 일 단위 데이터:
- `cycle-history.json`
- `compounder-returns.json`

## 7. QA 합격 기준

- 안정 주소: `reports/stable-v036.html`
- 화면 버전 `v0.3.6`
- `00.001%` 진행bar 즉시 표시
- 핵심 화면은 우상향 19개 TradingView iframe 로딩을 기다리지 않고 먼저 사용 가능
- 우상향은 기본 접힘 유지
- 우상향 펼침 후 화면 근처 차트부터 lazy load
- 브라우저에서 19×4 Yahoo 요청을 직접 하지 않음
- `compounder-returns.json` 1회로 1Y/2Y/3Y/5Y 표시
- 정상 시 `100.000%`
- Hero 하나가 아니라 최소 8개 주요 섹션 렌더
- 자체 1시간/일봉/주봉/월봉 버튼 없음
- Android Back 계약 유지
- APK v0.3.6 이후 앱 진입은 `app-live.html`을 통해 온라인 최신판을 따라감

## 8. APK 완료 정의

`.github/workflows/android.yml`이 v0.3.6 안정판을 검증하고 Capacitor sync + 간략 아이콘 + 네이티브 Back 패치 후 APK를 만든다.

**완료 = Actions 성공 → Artifact 확인 → APK 다운로드 → 사용자에게 파일 직접 제공.**
