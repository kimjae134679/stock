# Market Radar

미국 주식·ETF 시장을 **매시간 최신 데이터 + 하루 최종본 + PWA + Android APK**로 보는 대시보드입니다.

> 처음 보는 경우: [`docs/START_HERE.md`](docs/START_HERE.md)

## 바로 보기

- 최신 대시보드: `https://kimjae134679.github.io/stock/`
- 최신 FULL HTML: `https://kimjae134679.github.io/stock/reports/latest.html`
- 날짜별 예시: `https://kimjae134679.github.io/stock/reports/2026/08/US_Market_Daily_2026-08-19.html`

GitHub에서 `.html` 파일을 클릭하면 소스코드가 보입니다. 실제 화면은 GitHub Pages 주소로 봅니다.

## 평소 볼 곳 3개

1. `public/reports/latest.html` — 최신 FULL 화면
2. `public/data/latest.json` — 최신 분석 데이터
3. `public/data/live/intraday.json` — 오늘 시간 포인트

## 날짜별 보관

- `public/data/archive/YYYY/MM/YYYY-MM-DD.json`
- `public/reports/YYYY/MM/US_Market_Daily_YYYY-MM-DD.html`

같은 날에는 같은 파일을 계속 덮어쓰고 다음날이 되면 전날 최종본만 남깁니다. `03시.html`, `04시.json` 같은 시간별 복사본은 만들지 않습니다.

## 폴더 구조

```text
.github/workflows/          GitHub Pages / Android APK 자동빌드

docs/                      사람이 보는 설명서
ops/handoff/                자동화/운영 인수인계

public/
  index.html                APK/PWA 외곽 셸
  assets/
    report.css              기본 FULL UI
    mobile-fixes.css        APK safe-area / 가로밀림 방지
    report.js               메인 대시보드 렌더러
    report-enhancements.js  기존 그룹 / Replay / HTML 저장 / 그래프 설명
    report-safe-v11.css     롤백 후 안전하게 덧붙이는 v11 UI 스타일
    report-safe-v11.js      대표주 / 우상향 / 접기 / ETF 클릭 복구 / 차트 대체
  data/
    latest.json             항상 최신 분석
    live/intraday.json      오늘 시간 포인트
    archive/YYYY/MM/        날짜별 최종 JSON
  reports/
    latest.html             최신 FULL HTML
    YYYY/MM/                날짜별 최종 HTML
  manifest.webmanifest
  sw.js

VERSION
```

## 롤백 이후 변경 원칙

핵심 `report.js`는 최대한 건드리지 않고, 새 기능은 `report-safe-v11.*`에서 **추가 레이어 방식**으로 붙입니다. 문제가 생기면 이 두 파일 참조만 제거하면 기존 FULL 화면으로 바로 돌아갈 수 있습니다.

## 핵심 UI

- PC와 모바일 **정보량 동일**
- APK 상단 상태바/하단 내비게이션 safe-area 확보
- 페이지 전체 좌우 밀림 금지; 표/필터만 로컬 가로스크롤
- 큰 섹션 `접기 / 펼치기`
- 실제 TradingView 차트 + 대체 Finviz/내부 그래프/외부 링크 fallback
- 종목/테마/ETF/리서치 클릭 상세
- 클릭이 실패해도 아무 반응 없이 끝나지 않고 최소 추적중 상세를 표시
- 반복되는 `터치 → ...` 안내는 `터치`로 축약
- HTML 저장 버튼
- 사용자 실제 보유량 입력 UI 없음

## 주요 커버리지

- Magnificent 7
- 유명·초대형: MSFT, AAPL, NVDA, AMZN, GOOGL, META, TSLA, AMD, AVGO, PLTR, TSM, CPNG, ANET, ORCL, NFLX, COST
- AI 메모리 / DRAM / HBM / 스토리지
- AI 컴퓨트 / 반도체
- AI 소프트웨어 / 클라우드
- AI 전력 / 데이터센터 인프라
- 네트워크 / 광통신
- Physical AI / 로봇
- 사이버보안
- 방산 AI / 드론
- 국내/미국 상장 테마 ETF

삼성전자(005930), SK하이닉스(000660), 로보티즈(108490)는 글로벌 비교용 참고 커버리지이며 미국주식 모델 포트폴리오와 구분합니다.

## 장기 복리·우상향 품질 후보

완전히 안 떨어지는 주식은 없으므로 `5Y+ 가격추세 / 200DMA / 매출·EPS·FCF / 최대낙폭과 회복속도 / ROIC·마진 / 부채·희석 / 상대강도 / forward revisions`를 같이 봅니다.

초기 추적 후보: ANET, QQQ, MSFT, AVGO, COST, V, MA, SPGI, MCO, CTAS, PWR, ETN, WM, RSG, ORLY, AZO, VGT, XLK, SCHG.

## 과거 오판 방지

현재 추천을 과거 2~5년 point-in-time replay와 비교합니다. 당시 공개정보만 사용하며, `매수` 신호 뒤 추가 -15%/-25% 급락한 false-positive는 하락추세 지속, 가이던스/추정치 악화, 밸류트랩, 금리충격, 구조적 사업위협 등으로 분류해 모델 감점/veto 규칙에 반영합니다.

## 자동화

- 분석/데이터 갱신: 자동화가 지원하는 최대 빈도인 **매시간**
- 화면은 5분마다 최신 파일 재조회
- 의미 있는 변화가 있을 때만 채팅 경보
- 데이터 변경만으로 APK 재설치 불필요
- UI/앱 자체 변경 때 Android workflow 자동빌드

## 보안

이 저장소는 Public입니다. 실제 보유종목/보유비중/개인정보/PAT/API Secret/비밀번호/OTP/private key를 저장하지 않습니다.
