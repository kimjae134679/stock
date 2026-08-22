# Market Radar 운영 인수인계 — CURRENT

기준 배포: **v0.5.4 / MR054**  
기준일: **2026-08-23 KST**  
저장소: `kimjae134679/stock` (Public)

## 0. 백업 / 롤백 기준
- **v0.5.1C Known-Good 백업**: branch `backup/v0.5.1-known-good`, commit `94eccb7e2f16967fba2ba0557009ca13ccadb03a`.
- main에도 `public/reports/stable-v051-baseline.html`을 보존한다.
- 비상 롤백은 기존 `public/reports/stable-v042-baseline.html`.
- 현재 서비스 진입은 `public/reports/stable-v054.html`.
- `public/app-live.html`, `public/reports/latest.html`, `public/index.html`은 v0.5.4로 연결한다.

## 1. v0.5.4 차트 기준
사용자가 제공한 일반 주가차트 스크린샷을 시각 기준으로 삼는다.

핵심:
- 어두운 앱 전체 테마는 유지하되 **실제 사이클 차트 판은 흰색 주가차트 스타일**로 표시한다.
- 과거 비교 구간은 **실제 일봉 캔들**을 사용한다. 합성 OHLC를 만들지 않는다.
- 상승 캔들 빨강 / 하락 캔들 파랑.
- 5일 / 20일 / 60일 이동평균선을 함께 표시한다.
- 하단에는 **실제 거래량 막대 + 거래량 평균선**을 표시한다.
- 현재 경로는 굵은 연두색 선으로 과거 실제 차트 위에 겹친다.
- 세로축은 비교 기준점 대비 등락률(%)이라 현재와 과거 가격대가 달라도 형태를 직접 비교할 수 있다.
- 가로축은 과거 실제 거래일/날짜를 유지한다.
- #1~#5 버튼으로 비교할 과거 장세를 하나씩 전환한다. 선택한 과거 실제 차트 + 현재 경로 두 개만 주 비교 대상으로 둔다.
- 이전의 추상적인 여러 선 겹침 SVG는 v0.5.4 메인에서는 숨긴다. 데이터와 이전 버전 파일은 삭제하지 않는다.
- 제목은 상단 section의 **`실제 사이클 비교`** 하나를 중심으로 하고 내부 중복 제목은 숨긴다.

## 2. 실제 데이터
새 lazy-load 데이터:
- `public/data/market-daily/<TICKER>.json`
- `public/data/market-daily/index.json`

생성 스크립트:
- `scripts/build-market-daily.mjs`

데이터 규칙:
- Yahoo Finance daily OHLC + adjusted close 비율로 OHLC를 보정하고 raw volume을 사용한다.
- Yahoo 1/2 실패 시 Stooq OHLCV를 fallback으로 사용한다.
- 컬럼: `date, open, high, low, close, volume`.
- QQQ는 1999-03-10부터 최신일까지 실제 일별 데이터를 가진다.
- 이 파일은 사이클 GitHub Actions가 생성하며 매시간 시장 자동화가 덮어쓰지 않는다.

## 3. 사이클 의미 계약
- 현재 진행 방향만 잘라서 `상승장`이라고 단정하지 않는다.
- 최근 큰 하락과 그 뒤 반등을 함께 문맥으로 본다.
- 비교 역사 구간은 고점/저점 변곡을 포함한 충분한 실제 과거 장세 범위를 사용한다.
- 현재 경로는 과거 장세의 비교 기준점에 맞춰 겹쳐 보되 과거 데이터 자체의 날짜/캔들/등락은 바꾸지 않는다.
- 역사 유사도는 미래 고점/저점 날짜 예측이 아니다.
- `#1`, `#2` 등은 문맥 유사도 순위이며, 사용자는 버튼으로 과거 사례를 바꿔 볼 수 있다.

## 4. UI 배치 / 가독성 계약
- Hero 전체평가는 긴 고봉밥 한 덩어리 금지. 문장/핵심 행동을 시각적으로 분리한다.
- `시장·테마 독립 Phase`는 Hero 바로 아래에 위치한다.
- 삭제 요청된 `그래서 이제 뭐 해야 하나 / 지금 위치에 따라 무엇을 해야 하나` action section과 quicknav 버튼은 복구하지 않는다.
- `70`처럼 점수만 단독 표시하지 않고 `/100 + 의미`를 같이 쓴다.
- 모바일/PC 정보량은 동일.
- 자체 `1시간/일봉/주봉/월봉` 버튼은 복원하지 않는다.
- 로딩 완료 뒤 `#loadWrap` 전체 높이는 0, 빈칸 금지.
- 명령조 `3x 사지마`, `매수 금지` 문구 금지. 조건과 이유 중심의 중립 표현 사용.

## 5. 렌더 구조
- core DOM/interaction 소유: `public/assets/app-v44.js`.
- 사이클 enhancement 흐름 v45→v46→v47→v48→v49→v50→v51→v51B→v51C→v52→v53을 유지.
- 최종 실제 차트 enhancement: `public/assets/app-v54-enhance.js`.
- 최종 실제 차트 스타일: `public/assets/app-v54.css`.
- `app-v54-enhance.js`는 `.v51c-cycle[data-v51c-asset]`의 ticker를 읽어 해당 `market-daily/<ticker>.json`만 lazy-load한다.
- ticker modal에서도 같은 방식으로 적용한다.
- `app-v49-modal-bridge.js`는 유지한다.
- 일반 UI 컨트롤에 `data-ticker`를 임의로 붙이지 않는다.

## 6. Browser QA
Workflow: `.github/workflows/dashboard-qa-v54.yml`  
Script: `scripts/qa-dashboard-v54.mjs`

필수 검사:
- desktop 1440×1000 / mobile 390×844.
- `MR054`.
- 실제 캔들 30개 이상.
- 실제 거래량 막대 30개 이상.
- 5/20/60 이동평균선 존재.
- 현재 연두색 경로 존재.
- # 비교 탭 3개 이상 및 전환 동작.
- 차트 viewBox 비율 약 `940×650` 유지.
- 실제 데이터 source 표기(Yahoo Finance 또는 Stooq).
- 이전 추상 main chart가 동시에 노출되지 않음.
- load gap 0.
- document horizontal overflow 없음.
- QA screenshot artifact에서 모바일 실제 형태를 눈으로도 확인한다.

## 7. 데이터 / 자동화
매시간 자동화가 수정 가능한 파일:
- `public/data/latest.json`
- `public/data/live/intraday.json`
- `public/data/live/phase-status.json`
- 당일 archive JSON

매시간 자동화 수정 금지:
- HTML/JS/CSS/VERSION
- `cycle-history.json`
- `cycle-full.json`
- `wave-cycles.json`
- `market-daily/**`
- `compounder-returns.json`
- 모든 baseline/backup 파일

사이클 데이터 GitHub Action:
- `.github/workflows/cycle-history.yml`
- cycle-history/full/wave 생성 후 `build-market-daily.mjs`로 actual OHLCV cache 생성.

## 8. Android
- 웹/UI만 바뀌면 APK 재빌드는 필수가 아니다. 기존 앱은 `app-live.html`을 통해 최신 웹 안정판을 따른다.
- Android/Capacitor/native 변경 또는 사용자 명시 요청 때 APK rebuild.
- hardware Back: modal 열림 → modal 닫기, root → `앱을 종료하시겠습니까?`, 명시적 종료만 exit.

## 9. 회귀 규칙
1. 실제 사이클 차트가 이상하면 먼저 `market-daily/<ticker>.json` 로드와 `app-v54-enhance.js`를 확인한다.
2. 실제 OHLC/volume을 합성하거나 추정해서 채우지 않는다.
3. 차트를 억지로 세로 stretch하지 않는다. `preserveAspectRatio=none` 금지.
4. 실제 차트 실패 시 v0.5.3 SVG가 fallback으로 남아 있어야 한다.
5. v0.5.1C Known-Good와 v0.4.2 baseline은 수정하지 않는다.
6. 실제 PC+모바일 Browser QA 성공 전 완료 선언 금지.
