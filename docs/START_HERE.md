# START HERE — Market Radar 저장소 보는 법

이 저장소에서 평소 볼 것은 사실 **3곳만** 보면 됩니다.

## 1) 실제 화면

- 최신 대시보드: https://kimjae134679.github.io/stock/
- 최신 HTML 직접 보기: https://kimjae134679.github.io/stock/reports/latest.html

GitHub 안의 `.html` 파일을 클릭하면 소스코드가 보이는 것이 정상입니다. 실제 화면은 위 GitHub Pages 주소로 봅니다.

## 2) 최신 데이터

`public/data/latest.json`

항상 최신 시장/테마/종목/ETF/리서치/추천비중 데이터입니다. 시간별로 파일을 새로 만들지 않고 이 파일을 덮어씁니다.

## 3) 날짜별 최종본

- 데이터: `public/data/archive/YYYY/MM/YYYY-MM-DD.json`
- HTML: `public/reports/YYYY/MM/US_Market_Daily_YYYY-MM-DD.html`

같은 날에는 계속 같은 파일을 갱신하고, 다음 날이 되면 전날 파일은 최종본으로 고정합니다.

---

# 폴더 역할

```text
.github/workflows/          GitHub Pages / Android APK 자동빌드

docs/                      사람이 보는 설명서
ops/handoff/                자동화/운영 인수인계

public/
  index.html                APK/PWA 외곽 화면
  assets/                   모든 날짜가 공통으로 쓰는 CSS/JS
    report.css              기본 보고서 UI
    mobile-fixes.css        APK 안전영역/가로밀림 방지
    report.js               메인 대시보드 기능
    report-enhancements.js  그래프설명/그룹/Replay/HTML저장 보강
  data/
    latest.json             항상 최신 데이터
    live/intraday.json      오늘 시간 포인트만 저장
    archive/YYYY/MM/        날짜별 최종 데이터
  reports/
    latest.html             항상 최신 FULL 보고서
    YYYY/MM/                날짜별 최종 HTML
```

# 파일 증가 규칙

- `03시.json`, `04시.json` 같은 시간별 파일은 만들지 않음
- 오늘 시간변화는 `live/intraday.json` 한 파일 안에서만 관리
- 날짜별로는 JSON 1개 + HTML 1개만 남김
- APK 파일은 저장소에 넣지 않고 GitHub Actions Artifact/Release만 사용
- UI 수정은 `public/assets/` 공용파일 중심으로 해서 과거 날짜 HTML을 복제하지 않음

# 앱에서 보이는 주요 분류

- Magnificent 7
- AI 메모리 / DRAM / HBM / 스토리지
- AI 컴퓨트 / 반도체
- AI 소프트웨어 / 클라우드
- AI 전력 / 데이터센터 인프라
- 네트워크 / 광통신
- Physical AI / 로봇
- 사이버보안
- 방산 AI / 드론
- 국내 상장 해외테마 ETF
- 미국 상장 ETF

한국 상장 종목인 삼성전자(005930), SK하이닉스(000660), 로보티즈(108490)는 글로벌 비교용 참고 커버리지에 포함하되, 미국주식 모델 포트폴리오와는 구분합니다.

# 개인정보

이 저장소는 Public이므로 실제 보유량/보유비중/계정정보/토큰/비밀번호는 저장하지 않습니다. 앱에도 사용자가 직접 보유량을 입력해야 하는 기능을 만들지 않습니다.
