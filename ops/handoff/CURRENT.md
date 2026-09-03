# Market Radar 운영 인수인계 — CURRENT

기준 서비스 UI: **v0.5.8 / MR058**  
기준일: **2026-09-03 KST**  
저장소: `kimjae134679/stock` (Public)

## 0. 현재 상태
현재 라이브 UI는 v0.5.8이다.
- `public/app-live.html` → `public/reports/stable-v058.html`
- `public/index.html` → app-live → v0.5.8
- `VERSION` → `0.5.8`
- `package.json`도 `0.5.8`로 맞춘다.

v0.5.8 핵심은 사용자가 지적한 **“현재 위치가 그래프 맨 오른쪽 끝이라 과거 사례의 다음 경로를 비교할 수 없음”** 문제를 해결한 것이다.

## 1. 사이클 비교 v0.5.8 절대 규칙
1. 초록색 현재 실제 경로는 실제 현재 날짜에서 정확히 종료한다.
2. 현재 위치는 굵은 세로선 + 초록 점 + `현재 위치` 라벨로 표시한다.
3. 현재 위치 오른쪽에는 선정된 과거 유사사례가 그 대응 시점 이후 실제로 움직였던 **126거래일(약 6개월)**을 표시한다.
4. 오른쪽에는 `+1개월 / +3개월 / +6개월` 기준선과 과거 사례의 실제 후속 수익률을 표시한다.
5. 오른쪽 음영은 예측값이 아니며, 과거의 실제 사후 경로다.
6. 후보 선정과 구조 점수 계산에는 현재 대응 시점 이후의 과거 데이터가 절대 들어가지 않는다. 후속 126거래일의 가격·고점·저점·수익률은 점수에 **0% 사용**한다.
7. 현재 실제 데이터에 가짜 미래값을 생성하지 않는다.
8. 과거 경로의 실제 거래일 간격을 유지하고 시간축을 억지로 늘이거나 줄이지 않는다.
9. 과거 후속 결과가 126거래일 존재하는지 여부만 표시 가능성 필터로 사용할 수 있으며, 그 구간의 수익률/방향은 후보 선택에 사용하지 않는다.

## 2. 표시 기간 / 가독성
- 한 카드 전체: 약 `504거래일` = 대략 2년.
- 현재 위치 오른쪽 과거 후속 구간: `126거래일` = 약 6개월.
- 날짜는 전 거래일을 텍스트로 다 쓰지 않고 축 라벨을 샘플링하되, 실제 일별 캔들 데이터는 충분히 유지한다.
- 검정/짙은 남흑 배경 유지.
- 상승 캔들 빨강, 하락 캔들 파랑, 현재 경로 굵은 연두색.
- 모바일에서 현재 위치/축/날짜가 보이도록 글씨를 크게 유지한다.
- `preserveAspectRatio="none"`으로 차트를 강제 왜곡하지 않는다.

## 3. 구조 점수
후보는 `analog_anchors` 기반으로 선택한다.
- 직전 상승: 30점
- 직전 하락: 40점
- 현재 반등 초반 경로: 30점

현재 이후 과거 126거래일은 이 100점 어디에도 들어가지 않는다.
`data-score-lookahead="0"` 계약을 QA에서 검사한다.

## 4. 데이터 / 자동화 규칙
시장 자동화가 수정 가능한 파일:
- `public/data/latest.json`
- `public/data/live/intraday.json`
- `public/data/live/phase-status.json`
- 당일 archive JSON

시장 자동화 수정 금지:
- HTML / JS / CSS / VERSION
- baseline/backup
- `cycle-history.json`
- `cycle-full.json`
- `wave-cycles.json`
- `market-daily/**`
- `compounder-returns.json`
- `ai-gems.json`

사이클/market-daily/compounder 데이터는 전용 빌드 워크플로에서만 갱신한다.

## 5. 공통 UI 유지사항
- 로딩 완료 뒤 `#loadWrap` 전체가 사라져 빈 공간이 남지 않는다.
- 접기/펼치기 정상 동작.
- ticker/theme 클릭 시 상세 modal.
- modal 열린 상태 Android/browser Back → modal 닫기.
- root Back → `앱을 종료하시겠습니까?` 확인 후 명시적 종료만 앱 종료.
- PC/모바일 같은 정보 제공.
- 자체 `1시간/일봉/주봉/월봉` 버튼 복원 금지.
- 새 기능을 넣을 때 기존 정상 기능을 삭제하지 않는다.
- 미확인 가격 추정 금지.

## 6. AI 알짜 추적 후보
- 데이터: `public/data/ai-gems.json`
- 렌더러: `public/assets/app-v56-gems.js`
- 이름: `AI 알짜 추적 후보 · 국내/해외`
- 매수 추천 목록이 아니라 추적 후보 목록.
- 국내/해외 필터와 기존 ticker modal 유지.
- 자동 시장 갱신이 `ai-gems.json`을 덮어쓰지 않는다.

## 7. 현재 핵심 파일
- `public/reports/stable-v058.html`
- `public/assets/cycle-future-v58.js`
- `public/assets/cycle-future-v58.css`
- `public/assets/app-v44.js`
- `public/assets/app-v56-gems.js`
- `public/assets/app-v57-bundle.css`
- `public/data/wave-cycles.json`
- `public/data/market-daily/QQQ.json`
- `scripts/qa-dashboard-v58.mjs`
- `.github/workflows/dashboard-qa-v58.yml`
- `.github/workflows/android.yml`

## 8. QA / 배포
v0.5.8 전용 Browser QA:
- Run ID: `33315641935`
- 결과: **SUCCESS**
- Viewports: `1440×1000`, `390×844`
- artifact: `dashboard-v058-qa-screenshots` / ID `9733353788`
- 검증: 카드 5개, 현재 위치 선/점 5개, 오른쪽 과거 후속 126거래일, +1/+3/+6개월 마커, look-ahead 0, 가로 overflow 0, page error 0.

2026-09-03 시장 데이터 갱신 후 일반 dashboard QA도 Run `33702181760` SUCCESS.

Pages 배포 기준 v0.5.8 라이브 경로를 유지한다.

## 9. Android
이전 최신 APK 기록은 v0.5.6이라 웹 v0.5.8과 불일치했다.
`.github/workflows/android.yml`을 v0.5.8 파일 검증 기준으로 갱신하고 `ops/android-rebuild.request`로 새 빌드를 요청한다.

APK 완료 기준:
1. Android Actions success
2. artifact 존재
3. release asset 존재
4. 실제 APK 다운로드 가능 여부 확인
5. 가능하면 APK 내부에 `stable-v058.html`, `cycle-future-v58.js/css`가 포함됐는지 확인

## 10. 롤백
- 직전 UI: `public/reports/stable-v057.html` / MR057
- Known-Good: `public/reports/stable-v051-baseline.html` + branch `backup/v0.5.1-known-good`
- 비상 Known-Good: `public/reports/stable-v042-baseline.html` / MR042
- 과거 안정판/데이터셋 삭제 금지.

QA 성공 전 완료라고 말하지 않는다.
