# Market Radar

미국 주식·ETF 시장을 **시간별 최신 데이터 + 하루 최종 HTML + PWA + Android APK**로 보는 대시보드입니다.

> 처음 보는 경우: [`docs/START_HERE.md`](docs/START_HERE.md)

## 바로 보기

- 최신 대시보드: `https://kimjae134679.github.io/stock/`
- 최신 FULL HTML: `https://kimjae134679.github.io/stock/reports/latest.html`
- 날짜별 예시: `https://kimjae134679.github.io/stock/reports/2026/08/US_Market_Daily_2026-08-19.html`

GitHub에서 `.html` 파일을 클릭하면 소스코드가 보입니다. 실제 화면은 위 GitHub Pages 주소로 봅니다.

## 평소 볼 파일 3개

1. `public/data/latest.json` — 항상 최신 분석
2. `public/data/live/intraday.json` — 오늘 시간별 포인트만
3. `public/reports/latest.html` — 항상 최신 FULL 화면

## 날짜별 최종본

- `public/data/archive/YYYY/MM/YYYY-MM-DD.json`
- `public/reports/YYYY/MM/US_Market_Daily_YYYY-MM-DD.html`

같은 날에는 같은 파일을 계속 갱신하고, 다음날이 되면 전날 최종본 1개만 남깁니다.

## 폴더 구조

```text
.github/workflows/          Pages / Android APK 자동빌드

docs/                      설명서
ops/handoff/                공개 가능한 자동화 인수인계

public/
  index.html                APK/PWA 외곽 셸
  assets/
    report.css              기본 FULL UI
    mobile-fixes.css        APK 상하단 안전영역 + 가로밀림 방지
    report.js               메인 기능/차트/상세창
    report-enhancements.js  그룹/Replay/그래프설명/HTML 저장
  data/
    latest.json             최신 분석
    live/intraday.json      오늘 시간 포인트 1개 파일
    archive/YYYY/MM/        하루 최종 JSON 1개
  reports/
    latest.html             최신 FULL HTML
    YYYY/MM/                하루 최종 HTML 1개
  manifest.webmanifest
  sw.js

VERSION
```

## 핵심 운영 규칙

- 자동 분석/데이터 갱신: **최대 지원 빈도인 매시간**
- 앱 화면은 5분마다 최신 파일을 다시 확인
- 시간별 HTML/JSON 파일 생성 금지
- 날짜별 JSON 1개 + HTML 1개만 남김
- PC와 모바일의 정보량은 동일, 레이아웃만 반응형
- 실제 주가차트 + 내부 점수그래프를 구분해서 표시
- 사용자 실제 보유량 입력 UI 없음
- APK/AAB는 repo에 커밋하지 않고 Actions Artifact/Release 사용

## 주요 커버리지 그룹

- Magnificent 7
- AI 메모리 / DRAM / HBM / 스토리지
- AI 컴퓨트 / 반도체
- AI 소프트웨어 / 클라우드
- AI 전력 / 데이터센터 인프라
- 네트워크 / 광통신
- Physical AI / 로봇
- 사이버보안
- 방산 AI / 드론
- 국내/미국 상장 테마 ETF

삼성전자(005930), SK하이닉스(000660), 로보티즈(108490)는 글로벌 비교용 참고 커버리지에 포함하되 미국주식 모델 포트폴리오와 구분합니다.

## 보안

이 저장소는 Public입니다. 실제 보유종목/보유비중/개인정보/PAT/API Secret/비밀번호/OTP/private key를 저장하지 않습니다.

## Android

`Build Market Radar Android APK` workflow가 앱 UI가 바뀔 때 APK를 빌드합니다. 시장 데이터 갱신만으로 APK를 다시 설치할 필요는 없습니다.
