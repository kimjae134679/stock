# Market Radar 운영 인수인계 — CURRENT

기준 버전: **v0.3.8**  
기준일: **2026-08-20 KST**  
저장소: `kimjae134679/stock` (Public)

> 다음 작업자는 반드시 이 문서를 먼저 읽는다. 시장 데이터 자동화와 UI 개발을 섞지 않는다.

## 0. 절대 원칙
1. 매시간 시장 자동화는 JSON만 갱신한다. HTML/JS/CSS/VERSION을 수정하지 않는다.
2. 안정화한다고 기존 기능을 삭제하거나 Hero 하나짜리로 단순화하지 않는다.
3. APK 수정은 Actions 성공 + Artifact 실제 존재 + APK 직접 확보 전에는 완료라고 말하지 않는다.
4. 모바일/PC 정보량은 동일하다.
5. 자체 `1시간/일봉/주봉/월봉` 버튼은 다시 만들지 않는다.
6. 로딩은 실제 단계 기반 `00.001%` 형식으로 표시한다.
7. 핵심 화면이 렌더되면 부가 JS 때문에 로딩바를 붙잡아두지 않는다.
8. 100.000%가 되면 로딩 패널은 약 0.4초 뒤 완전히 사라진다.
9. **현재 테마 흐름 카드가 누락/잘림 상태이면 정상 완료로 판정하지 않는다.**
10. 화면 최상단에는 사람에게 거의 거슬리지 않는 micro build mark를 유지한다. 스크린샷 확대 시 버전을 식별하기 위한 텍스트이며 v0.3.8은 `MR038`이다.

## 1. v0.3.8 수정 이유
사용자 v0.3.7 화면에서 `🎨 현재 테마 흐름` 섹션 제목과 `테마 종합평가` 카드만 보이고 그 아래 실제 테마 카드들이 사라진 채 큰 빈 공간이 생겼다.

가능한 핵심 원인:
- `full-recovery-v22.js`는 아직 오래된 localStorage 키 `mr:last-good:v025`를 먼저 복원한다.
- 과거 불완전 렌더에서 저장된 last-good 데이터가 있으면, 최신 네트워크 갱신이 늦거나 실패할 때 market Hero는 보이지만 `themes`/`top_picks` 같은 일부 배열이 빈 캐시가 화면에 남을 수 있다.
- v0.3.7의 release 정리는 CacheStorage/service worker만 지우고 이 legacy last-good 데이터의 구조 유효성은 검사하지 않았다.

v0.3.8 조치:
- `public/assets/cache-guard-v38.js` 추가.
  - `mr:last-good:v025`를 읽되 `themes >= 4`, `top_picks >= 5`, `market` 존재를 검사한다.
  - 불완전 캐시면 full-recovery 실행 전에 삭제한다.
- `public/assets/integrity-v38.js` 추가.
  - `window.__MR_D.themes` 개수와 `#themes .theme[data-theme]` 실제 DOM 개수를 비교한다.
  - 부족하면 현재 데이터로 테마 카드 grid를 즉시 재구성한다.
  - 테마 fold-body의 비정상 height/min-height/overflow를 강제로 정상화한다.
  - 테마 카드가 다시 사라지는 회귀를 MutationObserver로 감시하고 복구한다.
- `stable-v038.html`은 최소 8개 섹션뿐 아니라 **테마 카드 개수 무결성까지 통과한 뒤 100% 완료**한다.
- 성공 후 로딩바는 기존 규칙대로 사라진다.

## 2. 스크린샷 버전 식별 micro mark
- 안정 페이지 최상단 고정 요소: `<span class="mr-buildmark">MR038</span>`
- 낮은 대비 / 7px monospace로 일반 사용 중 거의 눈에 띄지 않게 한다.
- 사용자가 스크린샷을 전달했을 때 확대해서 `MR038`을 확인해 실제 UI 빌드를 식별한다.
- 다음 버전에서는 반드시 함께 변경한다. 예: v0.3.9 → `MR039`.
- 접근성/클릭 방해 방지를 위해 `aria-hidden="true"`, `pointer-events:none`, `user-select:none` 유지.

## 3. 현재 진입 구조
- 웹 기본: `public/index.html`
- APK/PWA 영구 온라인 진입: `public/app-live.html`
- 최신 호환: `public/reports/latest.html` → `stable-v038.html`
- 안정판: **`public/reports/stable-v038.html`**
- legacy cache 검사: **`public/assets/cache-guard-v38.js`**
- 메인 렌더러: `public/assets/full-recovery-v22.js`
- 핵심 DOM 무결성/테마 자동복구: **`public/assets/integrity-v38.js`**
- 평가: `public/assets/evaluation-v26.js`
- 독립 Phase: `public/assets/phase-status-v29.js`
- UI/기간버튼 제거: `public/assets/ui-v30.js`, `public/assets/ui-v30.css`
- 경량 전체추적/우상향/모달: `public/assets/layout-v36.js`
- 경량 1/2/3/5년 수익률: `public/assets/returns-v36.js`
- 역사 주기: `public/assets/cycle-history-v34.js`

## 4. 성능 규칙
- 우상향 19개 TradingView iframe은 초기 로드 금지. 섹션 펼침 + viewport 접근 시 lazy load.
- 19종목 × 4기간 Yahoo 직접 요청 금지. `public/data/compounder-returns.json` 1회 요청 사용.
- 매 실행 전체 cache purge 금지. 새 release 최초 1회만 잔여 cache 정리.
- 핵심 렌더와 선택적 분석을 분리한다.
- 무결성 검사는 DOM 개수/데이터 구조만 확인하며 외부 네트워크 요청을 새로 늘리지 않는다.

## 5. 역사적 상승/하락 주기 분석 — 유지
데이터: `public/data/cycle-history.json`
- 현재 상승/하락 N거래일차
- 과거 평균/중앙값 거래일
- 기간/변화폭/종합 진행도
- 상승·하락 초반/중반/후반/평균기간 초과
- 과거 시작일/종료일/거래일/달력일/등락률 전체 이력
- 평균치는 미래 전환일 확정값이 아니라 역사 비교 설명치

## 6. 절대 삭제 금지 기능
- 시장 Hero + 위험/저점/고점위험/추세확인/매수타이밍
- 시장/테마 독립 Phase와 `그래서 지금은?`
- 현재 테마 흐름 실제 테마 카드 전체
- 시간별 매수타이밍 + QQQ 가격
- 큰 실제 TradingView 차트
- 종목/ETF 상세
- 유명·초대형 핵심주
- 안정적·꾸준한 우상향 후보: 테마별/순위별/주봉/1Y·2Y·3Y·5Y
- 전체추적: 테마별 / 전부 모아보기
- 숨은테마, ETF, 비중, 리서치, 기관, 원문, 검증, Replay, 거시
- 접기/펼치기
- 모달 스크롤 잠금
- 상세에서 Android Back → 닫기
- 루트 Android Back → `앱을 종료하시겠습니까?`
- 역사 주기 평가
- 실제 진행률과 실패 지점 표시
- screenshot micro build mark

## 7. 매시간 자동화
자동화 ID: `6a847ce3f5dc81918ccab0a7bafaa8fe`
매시간 갱신은 `latest.json`, `intraday.json`, `phase-status.json`, 당일 archive만 수정한다. UI/VERSION 수정 금지.
`cycle-history.json`, `compounder-returns.json`은 별도 GitHub Actions가 계산한다.

## 8. QA
- `stable-v038.html` 진입
- 화면 버전 v0.3.8
- 최상단 micro mark `MR038` 존재
- 진행바 즉시 표시
- 최소 8개 섹션 생성
- `window.__MR_D.themes.length`와 실제 theme card 수 일치
- 테마 종합평가 아래 실제 테마 카드가 보여야 함. 큰 빈 영역만 남으면 실패
- incomplete `mr:last-good:v025` 캐시는 삭제
- 100.000% 직후 로딩 패널 사라짐
- 우상향 iframe lazy load
- 브라우저 76회 Yahoo 요청 없음
- 자체 기간변경 버튼 없음
- Android Back 계약 유지

## 9. APK 완료 정의
`.github/workflows/android.yml`은 v0.3.8 안정판 + `cache-guard-v38.js` + `integrity-v38.js` + `MR038` 존재를 검증한다.
**완료 = Actions 성공 → Artifact 확인 → APK 다운로드 → 사용자에게 파일 직접 제공.**
