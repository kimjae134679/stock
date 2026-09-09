# Market Radar — 주식 앱

미국 주식·ETF 시장을 **최신 데이터 + 장기 사이클 비교 + PWA + Android APK**로 보는 대시보드입니다.

## 바로 보기
- 라이브: `https://kimjae134679.github.io/stock/`
- 최신 FULL 화면: `https://kimjae134679.github.io/stock/reports/latest.html`
- GitHub: `kimjae134679/stock` (Public)
- 현재 Market Radar 버전: **v0.5.8 / MR058**

> 이 repo 안의 `chungyack-apk/`는 별도 청약 프로젝트입니다. Market Radar와 섞어서 판단하지 않습니다.

## 현재 핵심 기능
- PC/모바일 같은 정보량
- 종목·테마·ETF 클릭 상세 modal
- 큰 섹션 접기/펼치기
- 실제 차트 + fallback
- 장기 우상향/복리 후보와 1·2·3·5년 수익률
- AI 알짜 추적 후보 · 국내/해외
- 매시간 최신 시장 JSON + 날짜별 archive
- PWA / Capacitor Android shell

## 장기 사이클 비교
v0.5.8은 현재 위치가 차트 맨 끝에 붙어 과거 사례의 이후 경로를 보기 어려웠던 문제를 고쳤습니다.

- 카드 전체 약 504 거래일
- 현재 위치는 선/점/라벨로 명확히 표시
- 오른쪽에는 선정된 과거 유사사례의 **실제 126거래일 후속 경로** 표시
- `+1개월 / +3개월 / +6개월` 기준선
- 후속 구간은 후보 선정 점수에 사용하지 않음 (`look-ahead 0`)
- 현재 데이터에 가짜 미래값을 만들지 않음

장기 분석은 짧은 swing 몇 개가 아니라 수개월~1–2년 규모의 실제 일별 데이터를 사용하고, 날짜·기간·최대 상승/하락 같은 측정값을 우선합니다.

## 평소 볼 파일
- `public/reports/latest.html` — 최신 FULL 화면
- `public/data/latest.json` — 최신 분석 데이터
- `public/data/live/intraday.json` — 오늘 시간 포인트
- `public/data/live/phase-status.json` — 시장/테마 phase

시간별 복사본을 계속 만들지 않습니다. 같은 날 변화는 live 파일에 누적하고 날짜별 archive는 하루 하나만 남깁니다.

## 주요 기술
- HTML / CSS / JavaScript
- Node.js build scripts
- Playwright Browser QA
- Capacitor 8 Android
- GitHub Pages / GitHub Actions

## 빌드·QA
저장소 루트에서:
```bash
npm install
npm run cycle:build
npm run returns:build
npm run dashboard:bundle
npm run qa:v58
```
Android shell 작업 시:
```bash
npm run android:add
npm run android:sync
npm run android:brand
```

v0.5.8 Browser QA는 desktop `1440×1000`과 mobile `390×844`에서 성공 기록이 있습니다. UI를 바꾼 뒤에는 이 과거 PASS를 그대로 믿지 말고 다시 QA합니다.

## 자동화 원칙
매시간 자동화는 주로 최신 데이터 JSON을 갱신합니다. HTML/JS/CSS/VERSION이나 장기 cycle/compounder 데이터는 일반 hourly refresh가 덮어쓰지 않습니다.

데이터만 바뀌었는데 APK를 매번 재설치할 필요는 없습니다. Android shell/번들 자체가 바뀔 때만 APK build/release 상태를 확인합니다.

## 주의할 점
- 모바일에서도 그래프/글씨를 작게 축소해 정보량을 줄이지 않습니다.
- ticker/theme 클릭이 아무 반응 없이 끝나면 회귀 버그입니다.
- 자체 `1시간/일봉/주봉/월봉` 토글은 다시 만들지 않습니다.
- 과거 안정판/baseline은 rollback용이므로 삭제하지 않습니다.
- 이 저장소는 Public이므로 실제 보유종목/보유비중, 계정정보, PAT/API secret, 비밀번호, OTP, private key를 저장하지 않습니다.

## 다음 작업
1. 현재 main에서 v0.5.8 Browser QA 재확인
2. Android artifact/release가 실제 v0.5.8 웹 assets와 일치하는지 확인
3. 장기 cycle/analog UI를 유지하면서 데이터 freshness 갱신
4. 모바일·PC에서 modal/back/overflow/차트 가독성 회귀 확인
5. `chungyack-apk`와 Market Radar 변경을 서로 분리해서 관리

AI가 이어서 작업할 때 필요한 파일·명령·자동화 경계·rollback 기준은 루트 [`AGENTS.md`](AGENTS.md)를 봅니다. 앞으로 새로운 handoff/status 문서를 더 늘리기보다 `README.md`와 `AGENTS.md`를 우선 최신화합니다.
