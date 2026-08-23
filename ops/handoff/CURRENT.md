# Market Radar 운영 인수인계 — CURRENT

기준 서비스 UI: **v0.5.5 / MR055**  
기준일: **2026-08-24 KST**  
저장소: `kimjae134679/stock` (Public)

## 0. 현재 결정 — 실제 차트 + 이전 사이클 비교를 둘 다 유지
사용자는 실제 캔들/이동평균/거래량 스타일을 참고해 차트를 개선하되, 기존에 정상 동작하던 과거 사이클 비교 기능을 삭제하지 말라고 명확히 요구했다.

현재 라이브 진입:
- `public/app-live.html` → `public/reports/stable-v055.html`
- `public/reports/latest.html` → `public/reports/stable-v055.html`
- `public/index.html` → app-live → v0.5.5

v0.5.5의 사이클 영역은 반드시 아래 3가지를 함께 유지한다.
1. **실제 사이클 비교 · 캔들 기준**: 과거 실제 OHLC 캔들 + 5/20/60일선 + 거래량 위에 현재 실제 경로를 겹친다.
2. **과거 사이클 겹쳐 비교**: 여러 과거 실제 경로를 색 선으로 한 그래프에 겹치고 현재 경로를 굵은 연두선으로 표시한다.
3. **현재 vs 과거 1대1 비교**: #1, #2… 과거 구간과 현재를 각각 둘만 놓고 비교하는 카드들을 유지한다.

**회귀 원인 기록:** v0.5.4 CSS가 `.v51c-zoom`, `.v51c-legend`, `.v51c-pairs` 등을 `display:none!important`으로 숨기면서 기존 비교 그래프가 사라졌다. v0.5.5 `app-v55.css`가 이를 명시적으로 복원한다. 앞으로 새 차트 레이어가 기존 비교 UI를 숨기거나 삭제하면 안 된다.

## 1. 롤백/백업 기준
- 비상 Known-Good: `public/reports/stable-v042-baseline.html` / MR042.
- 추가 Known-Good: `public/reports/stable-v051-baseline.html` 및 branch `backup/v0.5.1-known-good`.
- 과거 v0.4.3~v0.5.4 파일과 데이터셋은 삭제하지 않는다.
- baseline 파일 자체는 수정하지 않는다.

## 2. 반드시 유지할 공통 동작
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

## 3. 사이클 비교 원칙
- 단순 최근 17일 반등만 보고 장기 상승장으로 단정하지 않는다.
- 최근 큰 상승/하락 문맥을 포함해 현재 위치를 본다.
- 과거 역사 경로는 실제 데이터와 실제 거래일 흐름을 유지한다.
- 과거를 억지 0~100 정규화해서 현재에 맞추지 않는다.
- 현재 경로와 과거 경로를 겹쳐 비교하는 시각화와 1대1 비교를 동시에 제공한다.
- 과거 유사도/평균은 미래 고점·저점 날짜 예측으로 표현하지 않는다.
- 그래프는 종횡비를 강제 왜곡하지 않는다. `preserveAspectRatio="none"` 금지.
- 차트 내부 고봉밥 텍스트 금지. 상세 수치/날짜는 차트 밖 카드에 둔다.

## 4. 데이터/시장평가 규칙
- 시장 전체 하나의 Phase를 모든 자산에 강제하지 않는다.
- 미국 전체시장, Nasdaq/성장, 반도체, AI 네트워크/광통신, AI SW/클라우드, AI 전력/데이터센터, 레버리지, 주요 테마/종목을 독립 평가한다.
- 모든 평가에는 `그래서 지금은?` 행동 코멘트를 둔다.
- UI 문장은 짧고 스캔 가능하게 작성한다. 반복 고봉밥 금지.
- `3x 사지마`, `레버리지 사지 마`, `매수 금지` 같은 훈계조 문구 금지. 조건과 이유 중심의 중립 표현 사용.
- 미확인 가격 추정 금지.
- `updated_at`은 실제 데이터 갱신 완료 KST 시각.

## 5. 매시간 자동화 수정 범위
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

## 6. 현재 핵심 파일
- `public/reports/stable-v055.html`
- `public/assets/app-v54-enhance.js` / `app-v54.css`: 실제 캔들·이평·거래량 비교 차트
- `public/assets/app-v55-enhance.js` / `app-v55.css`: 기존 겹침 그래프와 1대1 비교 복원 및 MR055 보호
- `public/assets/app-v51c-enhance.js`: 기존 과거 사이클 겹침 및 pair 비교 renderer
- `public/data/wave-cycles.json`
- `public/data/market-daily/**`

## 7. QA / 완료 기준
- v0.5.5 Browser QA는 PC `1440×1000` + 모바일 `390×844`를 모두 검사한다.
- 반드시 확인: 실제 캔들 차트, 과거 탭, 기존 multi-history overlay, 굵은 현재선, 1대1 pair 3개 이상, 로딩 빈칸 0, horizontal overflow 없음.
- 새 UI는 QA 성공 전 완료라고 말하지 않는다.
- APK 새 배포가 필요한 경우 Actions 성공 + artifact 존재 + 실제 APK 다운로드 확인 후에만 완료 처리한다.
