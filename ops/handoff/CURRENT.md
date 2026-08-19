# Market Radar 운영 인수인계 — CURRENT

기준 버전: **v0.3.7**  
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
7. **핵심 대시보드가 이미 렌더되었으면 부가 JS 때문에 로딩바를 계속 붙잡아두지 않는다.**
8. **100.000%가 되면 로딩 패널은 약 0.4초 뒤 완전히 사라진다.**

## 1. v0.3.7 수정 이유
사용자 v0.3.6 APK에서 전체 대시보드는 이미 보였고 `정상 · 전체 대시보드 고정 완료`까지 나왔지만, 로딩바는 `72.000% phase-status-v29.js 로드 완료`에서 멈춰 있었다.

즉 메인 렌더러 실패가 아니라 **로딩 완료 조건을 evaluation/phase/ui/layout 등 부가 런타임까지 직렬로 묶어놓은 설계 문제**였다. 어느 부가 스크립트가 지연되면 이미 사용 가능한 화면인데도 진행률이 멈춘 것처럼 보였다.

v0.3.7 조치:
- 안정 진입: `public/reports/stable-v037.html`
- `full-recovery-v22.js`가 최소 8개 주요 섹션을 실제 DOM에 만들면 **핵심 로드 완료**로 판정한다.
- 진행률을 100.000%로 만든 뒤 로딩 패널을 fade 후 `display:none` 처리한다.
- evaluation / phase / ui / layout / returns / cycle-history는 **핵심 화면 이후 백그라운드 보강**으로 이동했다.
- 각 부가 script는 4초 timeout을 가지며 실패해도 핵심 화면/로딩 완료 상태를 되돌리지 않는다.
- Android Back 브리지는 안정 페이지 인라인에 먼저 정의해 부가 런타임 실패와 독립시켰다.
- v0.3.6 APK의 영구 온라인 진입점 `public/app-live.html`이 v0.3.7로 연결되므로 기존 v0.3.6 APK도 웹 배포 후 새 UI를 받을 수 있다.

## 2. 현재 진입 구조
- 웹 기본: `public/index.html`
- APK/PWA 영구 온라인 진입: `public/app-live.html`
- 최신 호환: `public/reports/latest.html` → `stable-v037.html`
- 안정판: **`public/reports/stable-v037.html`**
- 메인 렌더러: `public/assets/full-recovery-v22.js`
- 평가: `public/assets/evaluation-v26.js`
- 독립 Phase: `public/assets/phase-status-v29.js`
- UI/기간버튼 제거: `public/assets/ui-v30.js`, `public/assets/ui-v30.css`
- 경량 전체추적/우상향/모달: `public/assets/layout-v36.js`
- 경량 1/2/3/5년 수익률: `public/assets/returns-v36.js`
- 역사 주기: `public/assets/cycle-history-v34.js`

## 3. 성능 규칙
- 우상향 19개 TradingView iframe은 초기 로드 금지. 섹션 펼침 + viewport 접근 시 lazy load.
- 19종목 × 4기간 Yahoo 직접 요청 금지. `public/data/compounder-returns.json` 1회 요청 사용.
- 매 실행 전체 cache purge 금지. 새 release 최초 1회만 잔여 cache 정리.
- 핵심 렌더와 선택적 분석을 분리한다.

## 4. 역사적 상승/하락 주기 분석 — 유지
데이터: `public/data/cycle-history.json`
- 현재 상승/하락 N거래일차
- 과거 평균/중앙값 거래일
- 기간/변화폭/종합 진행도
- 상승·하락 초반/중반/후반/평균기간 초과
- 과거 시작일/종료일/거래일/달력일/등락률 전체 이력
- 평균치는 미래 전환일 확정값이 아니라 역사 비교 설명치

## 5. 절대 삭제 금지 기능
- 시장 Hero + 위험/저점/고점위험/추세확인/매수타이밍
- 시장/테마 독립 Phase와 `그래서 지금은?`
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

## 6. 매시간 자동화
자동화 ID: `6a847ce3f5dc81918ccab0a7bafaa8fe`
매시간 갱신은 `latest.json`, `intraday.json`, `phase-status.json`, 당일 archive만 수정한다. UI/VERSION 수정 금지.
`cycle-history.json`, `compounder-returns.json`은 별도 GitHub Actions가 계산한다.

## 7. QA
- `stable-v037.html` 진입
- 화면 버전 v0.3.7
- 진행바 즉시 표시
- 최소 8개 섹션 생성 후 100.000%
- **100% 직후 로딩 패널이 사라짐**
- 부가 script 지연/실패가 핵심 로드 완료를 막지 않음
- 우상향 iframe lazy load
- 브라우저 76회 Yahoo 요청 없음
- 자체 기간변경 버튼 없음
- Android Back 계약 유지

## 8. APK 완료 정의
`.github/workflows/android.yml`은 v0.3.7 안정판 기준으로 빌드한다.
**완료 = Actions 성공 → Artifact 확인 → APK 다운로드 → 사용자에게 파일 직접 제공.**
