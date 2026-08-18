# Automation Architecture

## Daily

한국시간 07:00~08:00 첫 점검:

- 시장/테마/종목/ETF/기관/거시 조사
- `public/data/latest.json` 갱신
- `public/data/archive/YYYY/MM/YYYY-MM-DD.json` 생성
- `public/reports/YYYY/MM/US_Market_Daily_YYYY-MM-DD.html` 생성
- `public/reports/latest.html`을 당일 보고서로 갱신
- `ops/handoff/current.json` 갱신
- GitHub Pages 자동 배포

## Hourly

큰 변화가 있을 때만:

- 짧은 채팅 경보
- 필요하면 `public/data/latest.json`도 갱신해 앱 홈을 최신화
- 전체 HTML은 매시간 새로 만들지 않음

## APK

매일 데이터 업데이트는 APK를 다시 빌드하지 않습니다.

APK는 다음 파일이 바뀔 때만 Actions에서 빌드합니다.

- `public/index.html`
- `public/manifest.webmanifest`
- `public/sw.js`
- `package.json`
- `capacitor.config.json`
- `VERSION`
- `.github/workflows/android.yml`

## Archive retention

루트에 날짜별 파일을 쌓지 않습니다.

- JSON: `public/data/archive/YYYY/MM/`
- HTML: `public/reports/YYYY/MM/`
- 운영 인수인계: `ops/handoff/current.json` 하나를 최신본으로 유지
- 필요할 때만 `ops/handoff/archive/YYYY/MM/`에 스냅샷

## Public repository warning

모든 커밋은 누구나 볼 수 있습니다. 개인 자산정보나 비밀키를 GitHub에 넣지 않습니다.
