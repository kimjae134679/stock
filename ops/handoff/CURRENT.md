# Market Radar 운영 인수인계 — CURRENT

기준 서비스 UI: **v0.5.6 / MR056**  
기준일: **2026-08-24 KST**  
저장소: `kimjae134679/stock` (Public)

## 0. 현재 결정
v0.5.6은 v0.5.5의 정상 사이클 기능을 삭제하지 않고 두 가지를 additive enhancement로 추가한다.
1. **주식/사이클 비교 그래프를 다시 검정 배경 + 기존 표기 방식으로 복원**한다.
2. **AI 알짜 추적 후보 · 국내/해외** 섹션을 테마 바로 아래에 추가한다.

현재 라이브 진입:
- `public/app-live.html` → `public/reports/stable-v056.html`
- `public/reports/latest.html` → `public/reports/stable-v056.html`
- `public/index.html` → app-live → v0.5.6

## 1. 사이클 영역 절대 유지사항
아래 3개는 동시에 유지한다.
1. `실제 사이클 비교 · 캔들 기준`: 실제 OHLC 캔들 + 5/20/60일선 + 거래량 + 현재 경로.
2. `과거 사이클 겹쳐 비교`: 여러 실제 과거 경로 색 선 + 굵은 연두 현재선.
3. `현재 vs 과거 1대1 비교`: #1, #2… 과거 구간과 현재를 둘만 놓는 pair 카드.

v0.5.6 색상 규칙:
- `.v54-chartbox`, `.v54-svg`, `.v51c-zoom`은 검정/짙은 남흑 배경을 유지한다.
- 상승 캔들 빨강, 하락 캔들 파랑, 5/20/60일선과 현재선 색 구분 유지.
- 축/날짜/변곡점 글씨는 기존처럼 작고 읽기 쉽게 표시한다. 차트 내부 고봉밥 금지.
- 종횡비 강제 왜곡 금지. `preserveAspectRatio="none"` 금지.

## 2. AI 알짜 추적 후보
데이터: `public/data/ai-gems.json`  
렌더/복구: `public/assets/app-v56-enhance.js`  
스타일: `public/assets/app-v56.css`

원칙:
- 이름은 **`AI 알짜 추적 후보 · 국내/해외`**.
- 매수 추천 목록이 아니다. AI CAPEX와 실제 사업 연결이 비교적 분명한 후보를 추적한다.
- 컴퓨트·메모리 / 네트워크·인터커넥트 / 전력·그리드·냉각 / 플랫폼·클라우드로 구분한다.
- 각 카드에 국내/해외, 티커, 이름, `핵심/관찰+/관찰`, 포함 이유, 체크할 리스크를 표시한다.
- 첫 화면은 핵심 후보 위주, 나머지는 `2순위·고베타 후보 더 보기` details로 보존한다.
- `전부 / 해외 / 국내` 필터 정상 동작.
- 카드 클릭 시 기존 ticker modal을 그대로 사용하고, 한국 숫자 티커는 TradingView `KRX:6자리`로 연다.
- 국내/해외 정보량은 동일하게 제공한다.

현재 큐레이션 예시:
- 해외 컴퓨트/메모리: NVDA, AVGO, TSM, MU
- 해외 네트워크: ANET, CRDO, ALAB, MRVL
- 해외 전력/데이터센터: VRT, ETN, PWR, GEV, CEG, POWL, NVT, FIX
- 해외 플랫폼: MSFT, GOOGL, AMZN, META, PLTR
- 국내 AI/HBM: SK하이닉스, 삼성전자, 한미반도체, ISC
- 국내 네트워크: 이수페타시스
- 국내 전력: HD현대일렉트릭, LS ELECTRIC, 효성중공업, 두산에너빌리티, 산일전기, 일진전기
- 국내 플랫폼: NAVER, 삼성SDS

큐레이션은 수주/실적/시장지위가 바뀌면 수동 검토로 조정한다. 매시간 시장 자동화가 이 파일을 덮어쓰면 안 된다.

## 3. 롤백/백업 기준
- 비상 Known-Good: `public/reports/stable-v042-baseline.html` / MR042.
- 추가 Known-Good: `public/reports/stable-v051-baseline.html` 및 branch `backup/v0.5.1-known-good`.
- v0.5.5는 `public/reports/stable-v055.html`로 그대로 보존한다.
- 과거 버전 파일과 데이터셋을 삭제하지 않는다.
- baseline 파일 자체는 수정하지 않는다.

## 4. 반드시 유지할 공통 동작
- 전체 대시보드가 중간에서 끊기거나 거대한 빈칸을 만들지 않는다.
- 로딩 완료 뒤 `#loadWrap` 전체가 사라져 빈 공간이 남지 않는다.
- 접기/펼치기 정상 동작.
- ticker/theme 클릭 시 상세 modal.
- modal 열린 상태 Android/browser Back → modal 닫기.
- root Back → `앱을 종료하시겠습니까?` 확인 후 명시적 종료만 앱 종료.
- modal 끝에서 background scroll lock.
- PC/모바일 같은 정보 제공.
- 자체 `1시간/일봉/주봉/월봉` 버튼 복원 금지.
- 새 기능을 넣을 때 기존 정상 기능을 삭제하지 않는다.

## 5. 사이클 비교 원칙
- 단순 최근 반등만 보고 장기 상승장으로 단정하지 않는다.
- 최근 큰 상승/하락 문맥을 포함해 현재 위치를 본다.
- 과거 역사 경로는 실제 데이터와 실제 거래일 흐름을 유지한다.
- 과거를 억지 0~100 정규화해서 현재에 맞추지 않는다.
- 현재 경로와 과거 경로를 겹쳐 비교하는 시각화와 1대1 비교를 동시에 제공한다.
- 과거 유사도/평균은 미래 고점·저점 날짜 예측으로 표현하지 않는다.

## 6. 데이터/시장평가 규칙
- 시장 전체 하나의 Phase를 모든 자산에 강제하지 않는다.
- 미국 전체시장, Nasdaq/성장, 반도체, AI 네트워크/광통신, AI SW/클라우드, AI 전력/데이터센터, 레버리지, 주요 테마/종목을 독립 평가한다.
- 모든 평가에는 `그래서 지금은?` 행동 코멘트를 둔다.
- UI 문장은 짧고 스캔 가능하게 작성한다. 반복 고봉밥 금지.
- `3x 사지마`, `레버리지 사지 마`, `매수 금지` 같은 훈계조 문구 금지. 조건과 이유 중심의 중립 표현 사용.
- 미확인 가격 추정 금지.
- `updated_at`은 실제 데이터 갱신 완료 KST 시각.

## 7. 매시간 자동화 수정 범위
수정 가능:
- `public/data/latest.json`
- `public/data/live/intraday.json`
- `public/data/live/phase-status.json`
- 당일 archive JSON

수정 금지:
- HTML / JS / CSS / VERSION
- 모든 baseline/backup
- `cycle-history.json`
- `cycle-full.json`
- `wave-cycles.json`
- `market-daily/**`
- `compounder-returns.json`
- **`ai-gems.json`**

## 8. 현재 핵심 파일
- `public/reports/stable-v056.html`
- `public/assets/app-v54-enhance.js` / `app-v54.css`: 실제 캔들·이평·거래량 비교 차트
- `public/assets/app-v55.css`: v0.5.5 비교 UI 복원 규칙
- `public/assets/app-v56-enhance.js` / `app-v56.css`: 검정 차트 복원 + 기존 비교 유지 + AI 알짜 섹션
- `public/assets/app-v51c-enhance.js`: 기존 과거 사이클 겹침/pair renderer
- `public/data/ai-gems.json`
- `public/data/wave-cycles.json`
- `public/data/market-daily/**`

## 9. QA / 완료 기준
Workflow: `.github/workflows/dashboard-qa-v56.yml`  
Script: `scripts/qa-dashboard-v56.mjs`

반드시 PC `1440×1000` + 모바일 `390×844` 검사.
필수 항목:
- MR056 / v0.5.6
- 실제 차트가 흰색으로 회귀하지 않음
- 기존 표기 글씨 크기/축 유지
- 실제 캔들 30개 이상
- multi-history overlay + 1대1 pair 유지
- AI 후보 25개 이상, 해외 12개 이상, 국내 8개 이상
- 해외/국내 필터
- 한국 숫자 티커 modal 이름/차트
- 로딩 빈칸 0
- horizontal overflow 없음

QA 성공 전 완료라고 말하지 않는다.
APK 새 배포 시 Actions 성공 + artifact 존재 + 실제 APK 다운로드/내부 확인 후 사용자에게 직접 파일을 제공한다.
