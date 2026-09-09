# AGENTS.md

## Purpose
이 파일은 `kimjae134679/stock`의 **Market Radar(주식 앱)** 작업 인수인계다. 사용자용 요약은 루트 `README.md`를 본다. 이 repo 안의 `chungyack-apk/`는 별도 청약 프로젝트 subproject이므로 Market Radar 작업과 혼동하지 않는다. 청약 장기 지침은 `kimjae134679/ChungYack`의 `AGENTS.md`를 우선한다.

## Project identity
- GitHub: `kimjae134679/stock` (Public)
- Live Pages: `https://kimjae134679.github.io/stock/`
- Latest full dashboard: `https://kimjae134679.github.io/stock/reports/latest.html`
- Current Market Radar VERSION: `0.5.8`.
- Canonical handoff snapshot in repo: `ops/handoff/CURRENT.md` = v0.5.8 / MR058 / 2026-09-03 KST.
- Windows absolute local path is not currently verified from repository evidence; do not guess it.

## Goal / product rules
- 미국 주식·ETF 시장을 최신 데이터 + 일별 archive + PWA + Android APK로 보는 대시보드.
- PC와 모바일의 **정보량은 동일**하게 유지한다.
- 데이터 계산은 충분한 실제 일별 관측치를 유지하고, 장기 사이클은 수개월~1–2년 규모로 본다. 짧은 swing 몇 개로 장기 사이클을 대체하지 않는다.
- 사이클 표시에는 실제 날짜/기간/최대 상승·하락과 현재 위치를 명확히 표시하고, 인위적 `초반/중반` 단계명보다 측정값을 선호한다.
- 현재 데이터에 가짜 미래값을 만들지 않는다.
- 현재 시점 오른쪽의 과거 유사사례 후속 경로는 **과거에 실제 발생한 사후 경로**이며 예측값이 아니다.
- 과거 후속 구간은 analog 후보 선정/구조 점수에 사용하지 않는다 (`look-ahead = 0`).

## Current UI / data contract
- Market Radar live UI: v0.5.8.
- 사이클 카드 전체 약 504 거래일, 현재 위치 이후 과거 유사사례의 실제 후속 경로는 126 거래일을 표시.
- `+1개월 / +3개월 / +6개월` reference marker.
- 현재 실제 경로는 현재 날짜에서 끝나며 `현재 위치` 선/점이 있어야 한다.
- 모바일에서 차트와 날짜/라벨을 크게 유지하고 차트 비율을 억지로 찌그러뜨리지 않는다.
- ticker/theme/ETF 클릭은 무반응으로 끝나면 안 되며 최소 상세 modal/fallback이 있어야 한다.
- modal Back은 modal 닫기, root Back은 명시적 종료 확인.
- 자체 `1시간/일봉/주봉/월봉` 토글은 복원하지 않고 실제 차트 기본은 일봉.

## Tech stack
- HTML / CSS / JavaScript static dashboard/PWA.
- Node.js build/QA scripts (`.mjs`).
- Capacitor 8 Android wrapper: `@capacitor/core`, `@capacitor/android`, `@capacitor/app`.
- Browser QA: Playwright.
- Hosting: GitHub Pages.
- CI: GitHub Actions, dashboard QA + Android workflow + data build workflows.
- package version: `0.5.8`.

## Important files
- `public/index.html`
- `public/app-live.html`
- `public/reports/stable-v058.html`
- `public/reports/latest.html`
- `public/assets/cycle-future-v58.js`
- `public/assets/cycle-future-v58.css`
- `public/assets/app-v44.js`
- `public/assets/app-v56-gems.js`
- `public/data/latest.json`
- `public/data/live/intraday.json`
- `public/data/live/phase-status.json`
- `public/data/wave-cycles.json`
- `public/data/market-daily/QQQ.json`
- `scripts/qa-dashboard-v58.mjs`
- `.github/workflows/dashboard-qa-v58.yml`
- `.github/workflows/android.yml`

## Build / QA commands
Repo root에서:
```bash
npm install
npm run cycle:build
npm run returns:build
npm run dashboard:bundle
npm run qa:v58
```
Capacitor shell 작업 시:
```bash
npm run android:add
npm run android:sync
npm run android:brand
```
이 명령은 실제 package scripts에 정의돼 있다. Android 최종 APK는 GitHub Actions/Gradle workflow 결과와 release asset을 확인한다.

## Data automation boundaries
매시간 시장 자동화가 수정 가능한 파일:
- `public/data/latest.json`
- `public/data/live/intraday.json`
- `public/data/live/phase-status.json`
- 당일 archive JSON

일반 시장 자동화가 임의 수정하면 안 되는 영역:
- HTML / JS / CSS / VERSION
- baseline/backup
- `cycle-history.json`, `cycle-full.json`, `wave-cycles.json`
- `market-daily/**`
- `compounder-returns.json`
- `ai-gems.json`

사이클/market-daily/compounder 같은 파생 데이터는 전용 build workflow로만 갱신한다.

## File growth / repository hygiene
- `03시.json`, `04시.html` 같은 시간별 복사본 금지.
- 당일 intraday는 `public/data/live/intraday.json` 한 파일에 누적.
- 날짜별 archive는 하루 JSON 1개.
- APK/AAB를 repo에 직접 커밋하지 않는다.
- 기존 안정판/baseline은 rollback 자산이므로 삭제하지 않는다.
- 앞으로 인수인계 때문에 새 status/handoff/notes 파일을 늘리지 않고 이 `AGENTS.md`와 `README.md`를 최신화한다.

## Public-repo security
이 repo는 Public이다. 다음을 절대 커밋하지 않는다.
- 실제 보유종목/보유비중 등 개인 포트폴리오 정보
- 계정정보, PAT, API secret, 비밀번호, OTP, private key
- 개인용 Supabase/청약 상태 등 다른 프로젝트의 private data

Market Radar 자체는 공개 데이터 대시보드로 유지한다.

## QA / verified checkpoint
- v0.5.8 전용 Browser QA Run `33315641935`은 SUCCESS로 기록돼 있다.
- viewports: `1440×1000`, `390×844`.
- 검증 항목: 카드 5개, 현재 위치 선/점, 126거래일 후속, +1/+3/+6개월 marker, look-ahead 0, horizontal overflow 0, page error 0.
- 2026-09-03 일반 dashboard QA Run `33702181760`도 SUCCESS로 기록돼 있다.
- 다만 과거 v0.4.4/v0.4.5 QA 실패 이력이 있으므로 새로운 UI 변경 뒤에는 항상 현재 버전 QA를 다시 돌린다.

## Android state
- `ops/handoff/CURRENT.md` 기준으로 웹 v0.5.8에 맞춘 Android rebuild가 필요했던 시점이 있었다.
- 완료 판정은 Actions success + artifact 존재 + release asset 존재 + 실제 다운로드 가능 + 가능하면 APK 내부 v0.5.8 asset 포함 확인까지다.
- HTML/데이터만 바뀌었다고 무조건 APK를 다시 만들지 않는다. shell/UI package 변경 여부를 먼저 본다.

## Rollback
- 직전 UI: `public/reports/stable-v057.html` / MR057
- Known-Good: `public/reports/stable-v051-baseline.html` + branch `backup/v0.5.1-known-good`
- emergency baseline: `public/reports/stable-v042-baseline.html` / MR042
- QA 성공 전 완료 선언 금지.

## Next work
1. 현재 main에서 v0.5.8 UI/QA가 여전히 green인지 재확인.
2. Android workflow/release가 실제 v0.5.8과 일치하는지 확인하고, 불일치 시 shell rebuild만 수행.
3. 장기 사이클/과거 analog UI를 유지하면서 데이터 freshness를 갱신.
4. AI 알짜 추적 후보와 ticker modal fallback이 회귀하지 않는지 모바일/PC에서 확인.
5. Market Radar와 `chungyack-apk` 변경을 commit/message/검증에서 명확히 분리.
