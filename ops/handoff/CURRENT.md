# Market Radar 운영 인수인계 — CURRENT

기준 서비스 UI: **v0.4.2 / MR042 Original Stable**  
기준일: **2026-08-23 KST**  
저장소: `kimjae134679/stock` (Public)

## 0. 현재 결정 — 커스텀 사이클 차트 실험 중단
사용자가 v0.4.3~v0.5.4 사이에서 진행한 커스텀 사이클/실제 차트 시도가 원하는 방향이 아니라고 판단하여, 라이브 UI를 사용자가 직접 정상 작동을 확인했던 **v0.4.2 / MR042 원래 안정판**으로 되돌렸다.

현재 라이브 진입:
- `public/app-live.html` → `public/reports/stable-v042-baseline.html`
- `public/reports/latest.html` → `public/reports/stable-v042-baseline.html`
- `public/index.html` → app-live → v0.4.2 baseline
- 기존 `public/reports/stable-v054.html`도 baseline으로 redirect

**중요:** 사용자가 명시적으로 다시 시작하라고 하기 전까지 v0.4.3~v0.5.4의 실험 차트를 라이브에 재연결하지 않는다.

## 1. 롤백/백업 기준
- 최우선 Known-Good: `public/reports/stable-v042-baseline.html` / MR042.
- 추가 백업: `public/reports/stable-v051-baseline.html` 및 branch `backup/v0.5.1-known-good`.
- 이후 실험 파일(app-v45~v54, wave/cycle datasets)은 삭제하지 않는다. 참고/복구용으로만 보존한다.
- baseline 파일 자체는 수정하지 않는다.

## 2. v0.4.2에서 반드시 유지할 동작
- 단일 renderer `public/assets/app-v42.js` 중심 구조.
- 전체 대시보드 섹션이 중간에서 끊기거나 거대한 빈칸을 만들지 않는다.
- 로딩 완료 뒤 `#loadWrap` 전체가 사라져 빈 공간이 남지 않는다.
- 접기/펼치기 정상 동작.
- ticker/theme 클릭 시 상세 modal.
- modal 열린 상태에서 Android/browser Back → modal 닫기.
- root Back → `앱을 종료하시겠습니까?` 확인, 명시적 종료만 앱 종료.
- modal 스크롤 끝에서 배경 화면이 같이 움직이지 않도록 background scroll lock.
- PC/모바일에 같은 정보 제공.
- 자체 `1시간/일봉/주봉/월봉` 버튼은 복원하지 않는다.

## 3. 데이터/시장평가 규칙
- 시장 전체 하나의 Phase를 모든 자산에 강제하지 않는다.
- 미국 전체시장, Nasdaq/성장, 반도체, AI 네트워크/광통신, AI SW/클라우드, AI 전력/데이터센터, 레버리지, 주요 테마/종목을 독립 평가한다.
- 모든 평가에는 `그래서 지금은?` 행동 코멘트를 둔다.
- UI 직접 노출 문장은 짧고 스캔 가능하게 작성한다. 고봉밥 반복 금지.
- `3x 사지마`, `레버리지 사지 마`, `매수 금지` 같은 훈계조 문구 금지. 조건과 이유 중심의 중립 표현 사용.
- 미확인 가격 추정 금지.
- `updated_at`은 실제 데이터 갱신 완료 KST 시각.

## 4. 매시간 자동화 수정 가능 범위
매시간 자동화가 수정 가능한 파일:
- `public/data/latest.json`
- `public/data/live/intraday.json`
- `public/data/live/phase-status.json`
- 당일 archive JSON

매시간 자동화 수정 금지:
- HTML / JS / CSS / VERSION
- 모든 baseline/backup 파일
- `cycle-history.json`
- `cycle-full.json`
- `wave-cycles.json`
- `market-daily/**`
- `compounder-returns.json`

## 5. 사이클/실제차트 실험 파일 취급
다음은 현재 라이브 기능이 아니다. 실험 이력으로만 보존한다.
- `app-v45*` ~ `app-v54*`
- `cycle-history.json`
- `cycle-full.json`
- `wave-cycles.json`
- `market-daily/**`
- v0.4.4~v0.5.4 stable pages

사용자가 다시 명시적으로 요구하기 전에는 이 실험을 v0.4.2 baseline 위에 덧붙이지 않는다.

## 6. Android
- 앱은 `app-live.html`을 통해 현재 v0.4.2 baseline을 따른다.
- native Back 규칙은 유지한다.
- APK/native/Capacitor 자체 변경이 없으면 웹 롤백만으로 동작 가능하다.
- APK 새 배포를 할 때는 Actions 성공 + artifact 존재 + 실제 APK 다운로드 확인 후에만 완료라고 말한다.

## 7. 회귀 방지
1. 사용자 확인 Known-Good를 덮어쓰지 않는다.
2. 새 기능 때문에 기존 섹션을 삭제하지 않는다.
3. 레이아웃을 `translateY`, 강제 height, SVG stretch로 억지 보정하지 않는다.
4. 실제 PC + 모바일 Browser QA 통과 전 새 UI를 안정판으로 선언하지 않는다.
5. 사용자 요청 없이 커스텀 사이클 차트 실험을 다시 시작하지 않는다.
