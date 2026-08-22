# Market Radar 운영 인수인계 — CURRENT

기준 배포: **v0.5.2 / MR052**  
기준일: **2026-08-23 KST**  
저장소: `kimjae134679/stock` (Public)

## 0. 백업 / 롤백 기준
- **v0.5.1C Known-Good 백업**: branch `backup/v0.5.1-known-good`, commit `94eccb7e2f16967fba2ba0557009ca13ccadb03a`.
- main에도 `public/reports/stable-v051-baseline.html`을 보존한다.
- 비상 롤백은 기존 `public/reports/stable-v042-baseline.html`.
- 현재 서비스 진입은 `public/reports/stable-v052.html`.
- `public/app-live.html`, `public/reports/latest.html`, `public/index.html`은 v0.5.2로 연결한다.

## 1. v0.5.2에서 고친 핵심 회귀
v0.5.1D가 모바일에서 사이클 SVG를 세로로 심하게 늘여 글자가 찌그러지고 서로 겹쳤다.

원인:
- `app-v51d-enhance.js`가 SVG에 `preserveAspectRatio="none"`을 강제.
- `app-v51d.css`가 모바일 차트에 `height: 480~560px`를 강제.
- 그 결과 viewBox의 가로/세로 비율이 깨져 텍스트와 선까지 비균등 확대됨.
- 당시 QA도 `preserveAspectRatio=none`을 성공 조건으로 검사해 이 잘못을 통과시켰음.

v0.5.2 수정:
- 안정 페이지에서 v51D CSS/JS를 **로드하지 않는다**.
- `app-v52-enhance.js`가 `.v51c-svg/.v51c-pair-svg`에 `preserveAspectRatio="xMidYMid meet"` 적용.
- `app-v52.css`가 SVG 높이를 `auto`로 되돌려 원본 viewBox 비율을 유지.
- 그래프 안에서 겹치던 긴 callout 텍스트는 숨기고, 같은 값은 그래프 아래 `현재 진행 / 직전 파동 / 비교 기준` 카드로 이동.
- 축/현재 라벨은 크게 유지하되 글자 모양을 찌그러뜨리지 않는다.

## 2. 실제 사이클 기능 계약
- section 제목: **`실제 사이클 비교`**.
- 현재 진행 방향이 상승이면 중심은 `저점 → 고점`, 하락이면 `고점 → 저점`.
- 다만 한 방향만 잘라 해석하지 않고 직전 파동과 이후 과거 파동 문맥도 함께 본다.
- 현재 QQQ처럼 직전에 -11%대 하락이 있었다면 현재 18일 반등만 보고 `상승장`이라고 단정하지 않는다.
- 과거 비교선은 실제 역사 데이터이며 미래 예측선이 아니다.
- 현재선은 단일 굵은 연두색.
- 하단 #1/#2/#3 비교 카드는 **현재 + 해당 과거선 1개만** 함께 표시한다.
- 여러 과거선 겹침, 1:1 비교, 정확한 날짜/기간/등락률, pinch zoom 기능은 유지한다.

## 3. UI 배치 / 가독성 계약
- Hero 전체평가는 긴 고봉밥 한 덩어리 금지. 문장/핵심 행동을 시각적으로 분리한다.
- `시장·테마 독립 Phase`는 Hero 바로 아래에 위치한다.
- 사용자가 삭제 요청한 `그래서 이제 뭐 해야 하나 / 지금 위치에 따라 무엇을 해야 하나` action section과 quicknav 버튼은 복구하지 않는다.
- `70`처럼 점수만 단독 표시하지 않고 `/100 + 의미`를 같이 쓴다.
- 모바일/PC 정보량은 동일.
- 자체 `1시간/일봉/주봉/월봉` 버튼은 복원하지 않는다.
- 로딩 완료 뒤 `#loadWrap` 전체 높이는 0, 빈칸 금지.
- 명령조 `3x 사지마`, `매수 금지` 문구 금지. 조건과 이유 중심의 중립 표현 사용.

## 4. 렌더 구조
- core DOM/interaction 소유: `public/assets/app-v44.js`.
- 사이클 enhancement 흐름은 기존 기능 보존을 위해 v45→v46→v47→v48→v49→v50→v51→v51B→v51C 순서 유지.
- **v51D는 v0.5.2 안정 진입에서 사용 금지.** 역사 파일로만 남긴다.
- 마지막 표시 보정: `public/assets/app-v52.css`, `public/assets/app-v52-enhance.js`.
- ticker modal 호환을 위해 `app-v49-modal-bridge.js` 유지.
- 그래프 일반 UI 컨트롤에 `data-ticker`를 붙이지 않는다. core capture click과 충돌한다.

## 5. Browser QA
Workflow: `.github/workflows/dashboard-qa-v52.yml`  
Script: `scripts/qa-dashboard-v52.mjs`

필수 검사:
- desktop 1440×1000 / mobile 390×844.
- `MR052`.
- main SVG 비율 = viewBox `920×535` 비율 근처.
- pair SVG 비율 = viewBox `840×365` 비율 근처.
- `preserveAspectRatio="xMidYMid meet"`.
- `preserveAspectRatio="none"` 금지.
- 긴 SVG callout 숨김 + 아래 외부 요약 카드 존재.
- 현재선 연두색 단일 실선.
- load gap 0.
- document horizontal overflow 없음.
- QA screenshot artifact에서 모바일 실제 형태를 눈으로도 확인한다.

최종 검증 run은 `ops/dashboard-qa-v52-latest.json`의 success run을 기준으로 한다.

## 6. 데이터 / 자동화
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
- `compounder-returns.json`
- 모든 baseline/backup 파일

시장 Phase는 미국 전체/Nasdaq/반도체/AI 네트워크/AI 소프트웨어/AI 전력/레버리지 등을 독립 평가하고 `그래서 지금은?` 코멘트를 짧게 붙인다.

## 7. Android
- 웹/UI만 바뀌면 APK 재빌드는 하지 않는다. 기존 앱은 `app-live.html`을 통해 최신 웹 안정판을 따른다.
- Android/Capacitor/native 변경 또는 사용자 명시 요청 때만 APK rebuild.
- 다음 native rebuild의 standalone check는 v0.5.2 + v0.5.1 baseline + v0.4.2 baseline을 확인한다.
- hardware Back: modal 열림 → modal 닫기, root → `앱을 종료하시겠습니까?`, 명시적 종료만 exit.

## 8. 회귀 규칙
1. 비율/텍스트 문제면 우선 v52 override 확인.
2. v52 격리 후 v51C Known-Good와 비교.
3. 필요하면 `backup/v0.5.1-known-good`에서 정확히 재현.
4. core 문제면 v0.4.2 baseline과 비교.
5. transform/translate 또는 `preserveAspectRatio=none`으로 화면을 억지로 맞추지 않는다.
6. 실제 PC+모바일 Browser QA 성공 전 완료 선언 금지.
